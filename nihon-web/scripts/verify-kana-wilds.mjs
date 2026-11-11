// Kana Wilds' rules (docs/KANA-BATTLE.md): the kana table, the vowel circle, the words a collection can play, the
// battle's turns and damage, catching, encounters and the tracing grader. Run with --experimental-strip-types.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { BASIC_HIRAGANA, kanaByCharacter, STARTERS, VOWEL_IDS } from "../src/lib/kanaWilds/gojuon.ts";
import { matchup, vowelOfWord } from "../src/lib/kanaWilds/vowelCircle.ts";
import { collectBattleWords, countWordsOpenedBy, playableWords } from "../src/lib/kanaWilds/words.ts";
import { CHOICE_COUNT, defenceChoices, meaningChoices, readingChoices } from "../src/lib/kanaWilds/choices.ts";
import { pickEncounter } from "../src/lib/kanaWilds/encounters.ts";
import {
  attemptCatch, canCatch, CATCH_TOLERANCE, catchTolerance, defend, ENEMY_ATTACK_POWER, ENEMY_MAX_HP, MAX_CATCH_TRIES,
  PLAYER_MAX_HP, playWord, previewAttack, runAway, startBattle, TILE_POWER,
} from "../src/lib/kanaWilds/battle.ts";
import { gradeTrace, resample, strokeDistance } from "../src/lib/kanaWilds/tracing.ts";

const seeded = (seed = 1) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const kana = character => kanaByCharacter(character);
const word = (japanese, romaji = japanese, meaning = japanese) => ({ japanese, romaji, meaning });
const course = JSON.parse(fs.readFileSync(new URL("../../shared/course/lessons.json", import.meta.url), "utf8"));
const COURSE_WORDS = collectBattleWords(course.flatMap(lesson => (lesson.vocabulary ?? []).map(([japanese, romaji, meaning]) => ({ japanese, romaji, meaning }))));
const owning = characters => new Set([...characters]);

// ---- the kana table

test("the table has the 46 basic hiragana with the catalog's ids", () => {
  assert.equal(BASIC_HIRAGANA.length, 46);
  assert.deepEqual([kana("あ").id, kana("か").id, kana("さ").id, kana("た").id, kana("を").id, kana("ん").id], [1, 6, 11, 16, 45, 46]);
  assert.deepEqual(VOWEL_IDS, [1, 2, 3, 4, 5]);
  assert.deepEqual(STARTERS.map(starter => starter.kanaId), [6, 11, 16]);
});

test("each kana belongs to its vowel column, and ん to none", () => {
  assert.deepEqual(["か", "し", "つ", "ね", "を"].map(character => kana(character).vowel), ["a", "i", "u", "e", "o"]);
  assert.equal(kana("ん").vowel, null);
});

// ---- the vowel circle

test("each vowel beats the next one round the circle a → i → u → e → o → a", () => {
  assert.deepEqual([["a", "i"], ["i", "u"], ["u", "e"], ["e", "o"], ["o", "a"]].map(([a, b]) => matchup(a, b)), Array(5).fill("strong"));
  assert.equal(matchup("i", "a"), "weak");
  assert.equal(matchup("a", "u"), "neutral");
  assert.equal(matchup("a", "a"), "neutral");
});

test("ん has no vowel, so it is neutral both ways", () => {
  assert.equal(matchup(null, "a"), "neutral");
  assert.equal(matchup("a", null), "neutral");
});

test("a word counts as the vowel of its last kana", () => {
  assert.equal(vowelOfWord("かお"), "o");
  assert.equal(vowelOfWord("えき"), "i");
  assert.equal(vowelOfWord("ほん"), null);
});

// ---- words

test("only words spelled in basic hiragana are battle words, each once", () => {
  const words = collectBattleWords([
    { japanese: "かお", romaji: "Kao ", meaning: "face" }, { japanese: "かお", romaji: "kao", meaning: "face again" },
    { japanese: "がっこう", romaji: "gakkou", meaning: "school" }, { japanese: "コーヒー", romaji: "koohii", meaning: "coffee" },
    { japanese: "先生", romaji: "sensei", meaning: "teacher" },
  ]);
  assert.deepEqual(words, [{ japanese: "かお", romaji: "kao", meaning: "face" }]);
});

test("a word is playable when the player owns every kana in it, repeats included", () => {
  const words = [word("いい"), word("かお"), word("あさ")];
  assert.deepEqual(playableWords(words, owning("あいうえおか")).map(item => item.japanese), ["いい", "かお"]);
  assert.equal(countWordsOpenedBy(words, owning("あいうえおか"), "さ"), 1);
  assert.equal(countWordsOpenedBy(words, owning("あいうえおか"), "か"), 0, "a kana already owned opens nothing");
});

test("the course gives every starter some words to fight with from the first battle", () => {
  const vowels = "あいうえお";
  assert.ok(playableWords(COURSE_WORDS, owning(vowels)).length >= 5, "the vowels alone spell a few words");
  for (const starter of "かさた") assert.ok(countWordsOpenedBy(COURSE_WORDS, owning(vowels), starter) >= 1, `${starter} opens words`);
});

// ---- choices

test("reading and meaning choices hold the answer once among four different options", () => {
  const pool = COURSE_WORDS.slice(0, 40);
  const target = pool[3];
  for (const choices of [readingChoices(target, pool, seeded(3)), meaningChoices(target, pool, seeded(4))]) {
    assert.equal(choices.length, CHOICE_COUNT);
    assert.equal(new Set(choices).size, CHOICE_COUNT);
  }
  assert.ok(readingChoices(target, pool, seeded(3)).includes(target.romaji));
  assert.ok(meaningChoices(target, pool, seeded(4)).includes(target.meaning));
});

test("defending against a kana offers its look-alikes", () => {
  const choices = defenceChoices(kana("ね"), seeded(5));
  assert.equal(choices.length, CHOICE_COUNT);
  assert.ok(choices.includes("ne"));
  assert.ok(choices.includes("re") && choices.includes("wa"), "ね is offered with れ and わ: " + choices);
});

// ---- encounters

test("wild kana come from the earliest incomplete rows and are never already caught", () => {
  const owned = new Set([1, 2, 3, 4, 5, 6]);
  for (let seed = 1; seed < 40; seed++) {
    const { kana: wild, isCatchable } = pickEncounter(owned, seeded(seed));
    assert.ok(isCatchable && !owned.has(wild.id));
    assert.ok(["k", "s"].includes(wild.row), `${wild.kana} is from the k or s row`);
  }
});

test("once every kana is caught, owned kana still appear for practice but can't be caught", () => {
  const encounter = pickEncounter(new Set(BASIC_HIRAGANA.map(item => item.id)), seeded(2));
  assert.equal(encounter.isCatchable, false);
});

// ---- battle

// ね is in the e column: u beats it (u → e) and it beats o (e → o).
const ne = kana("ね");

test("a word's damage is its length times the tile power", () => {
  assert.equal(previewAttack(word("いか"), "e", 0).damage, 2 * TILE_POWER);
  assert.equal(previewAttack(word("あいか"), "e", 0).damage, 3 * TILE_POWER);
});

test("strong, neutral and weak words hit for ×1.5, ×1 and ×0.5", () => {
  const enemyVowel = "e";
  assert.deepEqual(previewAttack(word("いく"), enemyVowel, 0), { damage: 9, matchup: "strong" });
  assert.deepEqual(previewAttack(word("いか"), enemyVowel, 0), { damage: 6, matchup: "neutral" });
  assert.deepEqual(previewAttack(word("かお"), enemyVowel, 0), { damage: 3, matchup: "weak" });
});

test("playing the same word again halves its power each time, and a right meaning makes it critical", () => {
  assert.equal(previewAttack(word("いか"), "e", 1).damage, 3);
  assert.equal(previewAttack(word("いか"), "e", 2).damage, 2);
  assert.equal(previewAttack(word("いか"), "e", 0, true).damage, 8);
});

test("a word read right hits, sets the stance and hands the turn to the enemy", () => {
  const after = playWord(startBattle(ne, true), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(after.enemyHp, ENEMY_MAX_HP - 9);
  assert.equal(after.stance, "u");
  assert.equal(after.phase, "defend");
  assert.deepEqual(after.readings, { answered: 1, correct: 1 });
});

test("a word read wrong fizzles: no damage, but it still counts as played", () => {
  const after = playWord(startBattle(ne, true), { word: word("いく"), isReadingCorrect: false, isMeaningCorrect: true });
  assert.equal(after.enemyHp, ENEMY_MAX_HP);
  assert.equal(after.lastEvent.kind, "fizzle");
  assert.equal(after.timesPlayed["いく"], 1);
  assert.deepEqual(after.readings, { answered: 1, correct: 0 });
});

test("reading the enemy right blocks its attack; reading it wrong costs HP judged against the stance", () => {
  const attacked = playWord(startBattle(ne, true), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(defend(attacked, true).playerHp, PLAYER_MAX_HP);
  // The stance is u (from いく) and the enemy is e: u beats e, so the enemy's attack is weak.
  assert.equal(defend(attacked, false).playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 0.5);
  const fromO = playWord(startBattle(ne, true), { word: word("かお"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(defend(fromO, false).playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 1.5, "e beats an o stance");
  assert.equal(defend(attacked, true).phase, "attack");
});

test("running out of HP loses the battle", () => {
  let state = { ...startBattle(ne, true), playerHp: 1, phase: "defend" };
  state = defend(state, false);
  assert.equal(state.outcome, "lost");
  assert.equal(state.phase, "over");
});

test("catching opens at 30% HP, and an exhausted enemy no longer attacks", () => {
  const start = startBattle(ne, true);
  assert.equal(canCatch(start), false);
  assert.equal(canCatch({ ...start, enemyHp: ENEMY_MAX_HP * 0.3 }), true);
  const exhausted = playWord({ ...start, enemyHp: 2 }, { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(exhausted.enemyHp, 0);
  assert.equal(exhausted.phase, "attack", "no enemy turn at 0 HP");
});

test("the weaker the enemy, the more forgiving the trace", () => {
  const start = startBattle(ne, true);
  assert.equal(catchTolerance({ ...start, enemyHp: ENEMY_MAX_HP * 0.3 }), CATCH_TOLERANCE.strictest);
  assert.equal(catchTolerance({ ...start, enemyHp: 0 }), CATCH_TOLERANCE.loosest);
});

test("a good trace catches; failed traces let it strike back, and the last one makes it flee", () => {
  const weak = { ...startBattle(ne, true), enemyHp: 3 };
  assert.equal(attemptCatch(weak, true).outcome, "caught");
  let state = attemptCatch(weak, false);
  assert.equal(state.phase, "defend");
  assert.deepEqual(state.lastEvent, { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - 1 });
  for (let tries = 1; tries < MAX_CATCH_TRIES; tries++) state = attemptCatch({ ...state, phase: "attack" }, false);
  assert.equal(state.outcome, "fled");
});

test("a kana you already own can't be caught, and running away ends the battle", () => {
  assert.equal(canCatch({ ...startBattle(ne, false), enemyHp: 0 }), false);
  assert.equal(runAway(startBattle(ne, true)).outcome, "ran");
});

// ---- tracing

const line = (x1, y1, x2, y2, steps = 10) => Array.from({ length: steps + 1 }, (_, index) => ({ x: x1 + ((x2 - x1) * index) / steps, y: y1 + ((y2 - y1) * index) / steps }));
const expectedKana = [line(20, 30, 90, 30), line(55, 10, 55, 100)];

test("resampling spaces points evenly from a stroke's start to its end", () => {
  const points = resample([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 5);
  assert.deepEqual(points.map(point => [Math.round(point.x), Math.round(point.y)]), [[0, 0], [5, 0], [10, 0], [10, 5], [10, 10]]);
});

test("a close trace is accepted", () => {
  const drawn = [line(22, 33, 88, 28, 7), line(57, 12, 53, 97, 13)];
  assert.deepEqual(gradeTrace(expectedKana, drawn, CATCH_TOLERANCE.strictest), { status: "accepted" });
});

test("the wrong number of strokes is refused", () => {
  assert.deepEqual(gradeTrace(expectedKana, [line(20, 30, 90, 30)], CATCH_TOLERANCE.loosest), { status: "stroke-count", expected: 2, drawn: 1 });
});

test("a stroke drawn backwards, or in the wrong order, is refused", () => {
  assert.equal(gradeTrace(expectedKana, [line(90, 30, 20, 30), expectedKana[1]], CATCH_TOLERANCE.loosest).status, "stroke-shape");
  assert.deepEqual(gradeTrace(expectedKana, [expectedKana[1], expectedKana[0]], CATCH_TOLERANCE.loosest), { status: "stroke-shape", strokeIndex: 0 });
});

test("a sloppy trace fails when strict but passes when the enemy is weak", () => {
  const sloppy = [line(25, 45, 85, 45), line(70, 15, 70, 95)];
  const off = Math.max(...expectedKana.map((stroke, index) => strokeDistance(stroke, sloppy[index])));
  assert.ok(off > CATCH_TOLERANCE.strictest && off < CATCH_TOLERANCE.loosest, "the sloppy trace sits between the two: " + off);
  assert.equal(gradeTrace(expectedKana, sloppy, CATCH_TOLERANCE.strictest).status, "stroke-shape");
  assert.equal(gradeTrace(expectedKana, sloppy, CATCH_TOLERANCE.loosest).status, "accepted");
});
