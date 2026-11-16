// Kana Wilds' rules (docs/KANA-BATTLE.md): the kana table, the vowel circle, the words a collection can play, the
// battle's turns and damage, catching, encounters and the tracing grader. Run with --experimental-strip-types.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { BASIC_HIRAGANA, kanaByCharacter, STARTERS, VOWEL_IDS } from "../src/lib/kanaWilds/gojuon.ts";
import { matchup, vowelOfWord } from "../src/lib/kanaWilds/vowelCircle.ts";
import { collectBattleWords, countWordsOpenedBy, playableWords } from "../src/lib/kanaWilds/words.ts";
import {
  BRACED_CHOICE_COUNT, bracedDefenceChoices, bracedReadingChoices, bracedSoundChoices, catchChoices, CHOICE_COUNT, defenceChoices, LOOK_ALIKES, lookAlikeChoices, lookAlikesOf,
  meaningChoices, readingChoices, soundAlikeChoices,
} from "../src/lib/kanaWilds/choices.ts";
import { drawnBlock, heardBlock, pickAttack, revealBlock } from "../src/lib/kanaWilds/defenceStyles.ts";
import { MAX_HINTS, mistakeHints } from "../src/lib/kanaWilds/mistakes.ts";
import { dealHand, HAND_SIZE, latestCatches, NEW_CATCH_COUNT, SHORT_WORD_LENGTH } from "../src/lib/kanaWilds/hand.ts";
import { MAX_MISSED_WORDS, noteReading, wordsUsingKana } from "../src/lib/kanaWilds/missedWords.ts";
import { pickEncounter } from "../src/lib/kanaWilds/encounters.ts";
import { isStrokeCountShown, revealedStrokeCount, STROKE_COUNT_HP_SHARE } from "../src/lib/kanaWilds/reveal.ts";
import { attackWordsOf, MAX_ATTACK_WORD_LENGTH, movesetOf, pickEnemyAttack, WORD_ATTACK_SHARE, wordAttackShare } from "../src/lib/kanaWilds/enemyAttacks.ts";
import {
  attemptCatch, BRACED_DAMAGE_FACTOR, canCatch, DEFENCE_DAMAGE_SHARE, catchChance, CATCH_HP_SHARE, CATCH_TOLERANCE, catchTolerance, COUNTER_DAMAGE, defend, MIN_CATCH_CHANCE, ENEMY_ATTACK_POWER, ENEMY_MAX_HP, MAX_CATCH_TRIES,
  PLAYER_MAX_HP, playWord, previewAttack, redraw, runAway, startBattle, canFinish, finishBattle,
} from "../src/lib/kanaWilds/battle.ts";
import { kanaLevelsOf, masteryLevel, MASTERY_STEPS, NO_LEVELS, TILE_POWER_BY_LEVEL, wordPower } from "../src/lib/kanaWilds/mastery.ts";
import { gradeTrace, resample, strokeDistance, TRACE_SCALE_RANGE } from "../src/lib/kanaWilds/tracing.ts";

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

const ALL_ROWS = ["vowels", "k", "s", "t", "n", "h", "m", "y", "r", "w", "final-n"];

test("wild kana come from the earliest incomplete rows and are never already caught", () => {
  const owned = new Set([1, 2, 3, 4, 5, 6]);
  for (let seed = 1; seed < 40; seed++) {
    const { kana: wild, isCatchable } = pickEncounter(owned, ALL_ROWS, seeded(seed));
    assert.ok(isCatchable && !owned.has(wild.id));
    assert.ok(["k", "s"].includes(wild.row), `${wild.kana} is from the k or s row`);
  }
});

test("once every kana is caught, owned kana still appear for practice but can't be caught", () => {
  const encounter = pickEncounter(new Set(BASIC_HIRAGANA.map(item => item.id)), ALL_ROWS, seeded(2));
  assert.equal(encounter.isCatchable, false);
});

test("a path's wild kana come only from its own rows", () => {
  for (let seed = 1; seed < 40; seed++) assert.ok(["s", "t"].includes(pickEncounter(new Set(VOWEL_IDS), ["s", "t"], seeded(seed)).kana.row));
});

test("once a path's rows are all caught, its own kana appear for practice", () => {
  const vowelsAndK = new Set(BASIC_HIRAGANA.filter(item => ["vowels", "k"].includes(item.row)).map(item => item.id));
  for (let seed = 1; seed < 20; seed++) {
    const encounter = pickEncounter(vowelsAndK, ["vowels", "k"], seeded(seed));
    assert.equal(encounter.isCatchable, false);
    assert.ok(vowelsAndK.has(encounter.kana.id), "not a kana from another path");
  }
});

test("wild kana need a row to come from", () => {
  assert.throws(() => pickEncounter(new Set(), [], seeded(1)));
});

// ---- battle

// ね is in the e column: u beats it (u → e) and it beats o (e → o).
const ne = kana("ね");
const LEVEL_1_TILE = TILE_POWER_BY_LEVEL[1];
/** A battle against ね where `japanese` has already been played `timesPlayed` times. */
const againstNe = (japanese = "", timesPlayed = 0, kanaLevels = NO_LEVELS) => ({ ...startBattle(ne, { isCatchable: true, kanaLevels }), timesPlayed: { [japanese]: timesPlayed } });

test("with every kana at level 1, a word's damage is its length times the level-1 tile power", () => {
  assert.equal(previewAttack(againstNe(), word("いか")).damage, 2 * LEVEL_1_TILE);
  assert.equal(previewAttack(againstNe(), word("あいか")).damage, 3 * LEVEL_1_TILE);
});

test("strong, neutral and weak words hit for ×1.5, ×1 and ×0.5", () => {
  assert.deepEqual(previewAttack(againstNe(), word("いく")), { damage: 9, matchup: "strong" });
  assert.deepEqual(previewAttack(againstNe(), word("いか")), { damage: 6, matchup: "neutral" });
  assert.deepEqual(previewAttack(againstNe(), word("かお")), { damage: 3, matchup: "weak" });
});

test("playing the same word again halves its power each time, and a right meaning makes it critical", () => {
  assert.equal(previewAttack(againstNe("いか", 1), word("いか")).damage, 3);
  assert.equal(previewAttack(againstNe("いか", 2), word("いか")).damage, 2);
  assert.equal(previewAttack(againstNe(), word("いか"), true).damage, 8);
});

test("a word hits harder when its kana are at higher levels", () => {
  const levels = new Map([["い", 5], ["か", 3]]);
  assert.equal(previewAttack(againstNe("", 0, levels), word("いか")).damage, TILE_POWER_BY_LEVEL[5] + TILE_POWER_BY_LEVEL[3]);
});

test("a battle keeps the levels it began with, and its hits use them", () => {
  const after = playWord(startBattle(ne, { isCatchable: true, kanaLevels: new Map([["い", 5], ["く", 5]]) }), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(after.enemyHp, ENEMY_MAX_HP - Math.round(2 * TILE_POWER_BY_LEVEL[5] * 1.5));
});

test("a word read right hits, sets the stance and hands the turn to the enemy", () => {
  const after = playWord(startBattle(ne, { isCatchable: true }), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(after.enemyHp, ENEMY_MAX_HP - 9);
  assert.equal(after.stance, "u");
  assert.equal(after.phase, "defend");
  assert.deepEqual(after.readings, { answered: 1, correct: 1 });
});

test("a word read wrong fizzles: no damage, but it still counts as played", () => {
  const after = playWord(startBattle(ne, { isCatchable: true }), { word: word("いく"), isReadingCorrect: false, isMeaningCorrect: true });
  assert.equal(after.enemyHp, ENEMY_MAX_HP);
  assert.equal(after.lastEvent.kind, "fizzle");
  assert.equal(after.timesPlayed["いく"], 1);
  assert.deepEqual(after.readings, { answered: 1, correct: 0 });
});

test("reading the enemy right blocks its attack; reading it wrong costs HP judged against the stance", () => {
  const attacked = playWord(startBattle(ne, { isCatchable: true }), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(defend(attacked, "blocked").playerHp, PLAYER_MAX_HP);
  // The stance is u (from いく) and the enemy is e: u beats e, so the enemy's attack is weak.
  assert.equal(defend(attacked, "missed").playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 0.5);
  const fromO = playWord(startBattle(ne, { isCatchable: true }), { word: word("かお"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(defend(fromO, "missed").playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 1.5, "e beats an o stance");
  assert.equal(defend(attacked, "blocked").phase, "attack");
});

test("a perfect block hits back for COUNTER_DAMAGE; a plain block does no damage", () => {
  const attacked = playWord(startBattle(ne, { isCatchable: true }), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  const perfect = defend(attacked, "perfect");
  assert.equal(perfect.enemyHp, attacked.enemyHp - COUNTER_DAMAGE);
  assert.deepEqual(perfect.lastEvent, { kind: "blocked", counterDamage: COUNTER_DAMAGE });
  assert.equal(defend(attacked, "blocked").enemyHp, attacked.enemyHp);
});

test("a late read in a stroke reveal lets part of the hit through: a quarter when it glances, half when it grazes", () => {
  const attacked = { ...startBattle(ne, { isCatchable: true }), phase: "defend" };
  const full = PLAYER_MAX_HP - defend(attacked, "missed").playerHp;
  assert.equal(PLAYER_MAX_HP - defend(attacked, "glanced").playerHp, Math.max(1, Math.round(full * DEFENCE_DAMAGE_SHARE.glanced)));
  assert.equal(PLAYER_MAX_HP - defend(attacked, "grazed").playerHp, Math.round(full * DEFENCE_DAMAGE_SHARE.grazed));
  assert.equal(defend(attacked, "grazed").lastEvent.defence, "grazed");
  assert.deepEqual(defend(attacked, "glanced").readings, { answered: 1, correct: 1 }, "a late read is still a right read");
});

test("a mix-up is kept with the battle, in order, and a right read adds none", () => {
  const attacked = { ...startBattle(ne, { isCatchable: true }), phase: "defend" };
  const mixUp = { kana: "ね", mistakenFor: "れ", way: "read" };
  assert.deepEqual(defend(attacked, "missed", mixUp).mistakes, [mixUp]);
  assert.deepEqual(defend(attacked, "blocked").mistakes, []);
});

test("a perfect block never takes the enemy below 0 HP", () => {
  const nearlyOut = { ...startBattle(ne, { isCatchable: true }), enemyHp: 1, phase: "defend" };
  assert.equal(defend(nearlyOut, "perfect").enemyHp, 0);
});

test("running out of HP loses the battle", () => {
  let state = { ...startBattle(ne, { isCatchable: true }), playerHp: 1, phase: "defend" };
  state = defend(state, "missed");
  assert.equal(state.outcome, "lost");
  assert.equal(state.phase, "over");
});

test("catching opens at 60% HP, and an exhausted enemy no longer attacks", () => {
  const start = startBattle(ne, { isCatchable: true });
  assert.equal(canCatch(start), false);
  assert.equal(canCatch({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE + 1 }), false);
  assert.equal(canCatch({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), true);
  const exhausted = playWord({ ...start, enemyHp: 2 }, { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(exhausted.enemyHp, 0);
  assert.equal(exhausted.phase, "attack", "no enemy turn at 0 HP");
});

test("the weaker the enemy, the more forgiving the trace", () => {
  const start = startBattle(ne, { isCatchable: true });
  assert.equal(catchTolerance({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), CATCH_TOLERANCE.strictest);
  assert.equal(catchTolerance({ ...start, enemyHp: 0 }), CATCH_TOLERANCE.loosest);
});

test("the catch chance starts at MIN_CATCH_CHANCE as catching opens and is certain at 0 HP", () => {
  const start = startBattle(ne, { isCatchable: true });
  assert.equal(catchChance({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), MIN_CATCH_CHANCE);
  assert.equal(catchChance({ ...start, enemyHp: 0 }), 1);
  assert.ok(catchChance({ ...start, enemyHp: 6 }) > catchChance({ ...start, enemyHp: 9 }), "rises as it weakens");
});

test("a good trace catches when the roll is under the catch chance", () => {
  const weak = { ...startBattle(ne, { isCatchable: true }), enemyHp: 3 };
  assert.equal(attemptCatch(weak, true, catchChance(weak) - 0.01).outcome, "caught");
});

test("a good trace with a roll over the chance breaks out, and it strikes back", () => {
  const opening = { ...startBattle(ne, { isCatchable: true }), enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE };
  const state = attemptCatch(opening, true, MIN_CATCH_CHANCE);
  assert.equal(state.phase, "defend");
  assert.deepEqual(state.lastEvent, { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - 1, reason: "broke-out" });
});

test("a failed trace never catches, whatever the roll, and the last try makes it flee", () => {
  const exhausted = { ...startBattle(ne, { isCatchable: true }), enemyHp: 0 };
  let state = attemptCatch(exhausted, false, 0);
  assert.deepEqual(state.lastEvent, { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - 1, reason: "trace" });
  for (let tries = 1; tries < MAX_CATCH_TRIES; tries++) state = attemptCatch({ ...state, phase: "attack" }, false, 0);
  assert.equal(state.outcome, "fled");
});

test("a kana you already own can't be caught, and running away ends the battle", () => {
  assert.equal(canCatch({ ...startBattle(ne, { isCatchable: false }), enemyHp: 0 }), false);
  assert.equal(runAway(startBattle(ne, { isCatchable: true })).outcome, "ran");
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

test("a right shape drawn smaller and off-centre is accepted, even when strict", () => {
  const smallAndShifted = [line(50, 50, 80, 50), line(65, 42, 65, 80)];
  assert.deepEqual(gradeTrace(expectedKana, smallAndShifted, CATCH_TOLERANCE.strictest), { status: "accepted" });
});

test("a tiny scribble is not blown up to fit, so it is refused", () => {
  const scribble = [line(50, 50, 52, 50), line(51, 49, 51, 52)];
  assert.ok(TRACE_SCALE_RANGE.max < (90 - 20) / 3, "the scale limit is what refuses it");
  assert.equal(gradeTrace(expectedKana, scribble, CATCH_TOLERANCE.loosest).status, "stroke-shape");
});

test("a stroke out of place against the others is refused, wherever the whole trace is", () => {
  const crossTooLow = [line(20, 60, 90, 60), expectedKana[1]];
  assert.deepEqual(gradeTrace(expectedKana, crossTooLow, CATCH_TOLERANCE.loosest), { status: "stroke-shape", strokeIndex: 0 });
});

test("a sloppy trace fails when strict but passes when the enemy is weak", () => {
  const sloppy = [line(25, 45, 85, 45), line(70, 15, 70, 95)];
  const off = Math.max(...expectedKana.map((stroke, index) => strokeDistance(stroke, sloppy[index])));
  assert.ok(off > CATCH_TOLERANCE.strictest && off < CATCH_TOLERANCE.loosest, "the sloppy trace sits between the two: " + off);
  assert.equal(gradeTrace(expectedKana, sloppy, CATCH_TOLERANCE.strictest).status, "stroke-shape");
  assert.equal(gradeTrace(expectedKana, sloppy, CATCH_TOLERANCE.loosest).status, "accepted");
});

// ---- the hand of words dealt each turn

const handSource = (overrides = {}) => ({
  words: COURSE_WORDS, enemyVowel: "e", newWords: new Set(), missedWords: new Set(), recentlyPlayed: new Set(), ...overrides,
});

test("a small vocabulary is dealt whole", () => {
  const few = COURSE_WORDS.slice(0, HAND_SIZE - 1);
  assert.deepEqual(dealHand(handSource({ words: few }), seeded(1)), few);
});

test("a hand holds HAND_SIZE different words the player can spell, and the same seed deals the same hand", () => {
  const hand = dealHand(handSource(), seeded(3));
  assert.equal(hand.length, HAND_SIZE);
  assert.equal(new Set(hand.map(item => item.japanese)).size, HAND_SIZE);
  assert.ok(hand.every(item => COURSE_WORDS.includes(item)));
  assert.deepEqual(dealHand(handSource(), seeded(3)), hand);
});

test("every hand has two words strong against the enemy, and a short word", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const hand = dealHand(handSource(), seeded(seed));
    assert.ok(hand.filter(item => matchup(vowelOfWord(item.japanese), "e") === "strong").length >= 2, `seed ${seed}`);
    assert.ok(hand.some(item => [...item.japanese].length <= SHORT_WORD_LENGTH), `seed ${seed}`);
  }
});

test("a hand deals a word from the latest catches and a word read wrong before", () => {
  const newWord = COURSE_WORDS[10].japanese, missedWord = COURSE_WORDS[20].japanese;
  const hand = dealHand(handSource({ newWords: new Set([newWord]), missedWords: new Set([missedWord]) }), seeded(7)).map(item => item.japanese);
  assert.ok(hand.includes(newWord) && hand.includes(missedWord));
});

test("words already played this battle are left out while there are fresh ones, and come back when there aren't", () => {
  const played = new Set(COURSE_WORDS.slice(0, 50).map(item => item.japanese));
  assert.ok(dealHand(handSource({ recentlyPlayed: played }), seeded(2)).every(item => !played.has(item.japanese)));
  const nearlyAll = new Set(COURSE_WORDS.slice(3).map(item => item.japanese));
  const hand = dealHand(handSource({ recentlyPlayed: nearlyAll }), seeded(2));
  assert.equal(hand.length, HAND_SIZE);
  assert.equal(hand.filter(item => !nearlyAll.has(item.japanese)).length, 3, "the three fresh words, then played ones");
});

test("a wrong reading puts the word first on the missed list, a right one clears it, and the list is capped", () => {
  assert.deepEqual(noteReading(["あお", "いえ"], "いえ", false), ["いえ", "あお"]);
  assert.deepEqual(noteReading(["あお", "いえ"], "あお", true), ["いえ"]);
  const full = Array.from({ length: MAX_MISSED_WORDS }, (_, index) => `w${index}`);
  assert.equal(noteReading(full, "new", false).length, MAX_MISSED_WORDS);
  assert.equal(noteReading(full, "new", false)[0], "new");
});

test("the new words are those using the latest catches; the starter set never counts", () => {
  const starterSet = new Set([...VOWEL_IDS, 6]);
  assert.deepEqual(latestCatches([1, 2, 3, 4, 5, 6, 7, 12, 30], starterSet), [12, 30]);
  assert.equal(latestCatches([1, 2, 3, 4, 5, 6, 7, 12, 30], starterSet).length, NEW_CATCH_COUNT);
  assert.deepEqual(latestCatches([1, 2, 3, 4, 5, 6], starterSet), []);
  assert.deepEqual([...wordsUsingKana([word("あき"), word("いえ"), word("きく")], new Set(["き"]))], ["あき", "きく"]);
});

// ---- redrawing

test("redrawing gives up the attack: no damage, no reading, and the enemy's turn comes braced", () => {
  const after = redraw(startBattle(ne, { isCatchable: true }));
  assert.deepEqual([after.phase, after.isBraced, after.enemyHp, after.readings.answered, after.lastEvent.kind], ["defend", true, ENEMY_MAX_HP, 0, "redrew"]);
  assert.equal(redraw(after), after, "only on the player's own turn");
  const exhausted = { ...startBattle(ne, { isCatchable: true }), enemyHp: 0 };
  assert.equal(redraw(exhausted), exhausted, "not against a worn-out kana: catch it or finish instead");
});

test("braced, a missed block hurts half as much, and the brace lasts one attack", () => {
  const braced = redraw(startBattle(ne, { isCatchable: true }));
  const hurt = defend(braced, "missed");
  assert.equal(hurt.playerHp, PLAYER_MAX_HP - Math.round(ENEMY_ATTACK_POWER * BRACED_DAMAGE_FACTOR));
  assert.deepEqual([hurt.isBraced, hurt.lastEvent.wasBraced], [false, true]);
  assert.equal(defend(braced, "blocked").isBraced, false);
});

test("braced, the block offers two choices and no look-alikes", () => {
  for (const seed of [1, 2, 3]) {
    const choices = bracedDefenceChoices(kana("ね"), seeded(seed));
    assert.equal(choices.length, BRACED_CHOICE_COUNT);
    assert.ok(choices.includes("ne"));
    assert.ok(!choices.some(choice => ["re", "wa"].includes(choice)), `seed ${seed}: ${choices}`);
  }
});

test("braced, a word's reading offers the answer and one other", () => {
  const target = word("いぬ", "inu");
  const pool = [target, word("ねこ", "neko"), word("いえ", "ie"), word("あお", "ao"), word("かお", "kao")];
  for (const seed of [1, 2, 3]) {
    const choices = bracedReadingChoices(target, pool, seeded(seed));
    assert.equal(choices.length, BRACED_CHOICE_COUNT);
    assert.ok(choices.includes("inu"));
  }
});

// ---- the hidden wild kana

test("a wild kana shows no strokes at full HP and all of them at 0", () => {
  assert.equal(revealedStrokeCount(4, ENEMY_MAX_HP, ENEMY_MAX_HP), 0);
  assert.equal(revealedStrokeCount(4, 0, ENEMY_MAX_HP), 4);
});

test("a wild kana shows its strokes in step with the HP it has lost", () => {
  assert.equal(revealedStrokeCount(4, ENEMY_MAX_HP / 2, ENEMY_MAX_HP), 2);
  assert.equal(revealedStrokeCount(4, 1, ENEMY_MAX_HP), 3, "the last stroke waits for 0 HP");
});

test("its moveset is its look-alikes and row-mates, never itself", () => {
  const moves = movesetOf(kana("ね")).map(item => item.kana);
  assert.ok(!moves.includes("ね"));
  for (const expected of ["れ", "わ", "な", "に", "ぬ", "の"]) assert.ok(moves.includes(expected), `${expected} in ${moves}`);
});

test("ん, with no row-mates, still has moves", () => {
  assert.ok(movesetOf(kana("ん")).length > 0);
  assert.ok(!movesetOf(kana("ん")).some(item => item.kana === "ん"));
});

test("its attack words contain it and are short enough to draw", () => {
  const words = attackWordsOf(kana("ね"), COURSE_WORDS);
  assert.ok(words.length > 0);
  assert.ok(words.every(item => item.japanese.includes("ね") && [...item.japanese].length <= MAX_ATTACK_WORD_LENGTH));
});

test("later rows attack more with words, up to the most", () => {
  assert.equal(wordAttackShare(kana("あ")), WORD_ATTACK_SHARE.first);
  assert.ok(wordAttackShare(kana("な")) > wordAttackShare(kana("か")));
  assert.ok(wordAttackShare(kana("ん")) <= WORD_ATTACK_SHARE.most);
});

test("an enemy attacks with kana only when no word contains it", () => {
  for (const seed of [1, 2, 3, 4, 5]) assert.equal(pickEnemyAttack(kana("ね"), [], seeded(seed)).kind, "kana");
});

test("an enemy attacks with words and with its moveset over a battle", () => {
  const random = seeded(7);
  const attacks = Array.from({ length: 60 }, () => pickEnemyAttack(kana("ね"), COURSE_WORDS, random));
  assert.ok(attacks.some(attack => attack.kind === "word"));
  assert.ok(attacks.some(attack => attack.kind === "kana"));
  assert.ok(!attacks.some(attack => attack.kind === "kana" && attack.kana.kana === "ね"), "never attacks as itself");
});

test("the stroke count is told once the kana is down to 80% HP, not before", () => {
  assert.equal(isStrokeCountShown(ENEMY_MAX_HP, ENEMY_MAX_HP), false);
  assert.equal(isStrokeCountShown(ENEMY_MAX_HP * STROKE_COUNT_HP_SHARE + 1, ENEMY_MAX_HP), false);
  assert.equal(isStrokeCountShown(ENEMY_MAX_HP * STROKE_COUNT_HP_SHARE, ENEMY_MAX_HP), true);
});

test("the stroke count comes before the first stroke, even for a kana of four strokes (the most hiragana have)", () => {
  assert.equal(revealedStrokeCount(4, ENEMY_MAX_HP * STROKE_COUNT_HP_SHARE + 1, ENEMY_MAX_HP), 0);
});

test("the keyboard catch offers the kana among four different kana, look-alikes first", () => {
  for (const seed of [1, 2, 3]) {
    const choices = catchChoices(kana("ね"), seeded(seed));
    assert.equal(new Set(choices).size, CHOICE_COUNT);
    assert.ok(choices.includes("ね"));
    assert.ok(choices.includes("れ") && choices.includes("わ"), `seed ${seed}: ${choices}`);
  }
});

test("the keyboard catch still has four choices for ん, with no look-alike row", () => {
  const choices = catchChoices(kana("ん"), seeded(5));
  assert.equal(new Set(choices).size, CHOICE_COUNT);
  assert.ok(choices.includes("ん"));
});

// ---- mastery levels (docs/KANA-BATTLE.md section 8)

test("a kana with no answers, or too few, is level 1", () => {
  assert.equal(masteryLevel(0, 0), 1);
  assert.equal(masteryLevel(4, 0), 1);
});

test("each level needs both its answer count and its accuracy", () => {
  for (const { level, minAnswers, minAccuracy } of MASTERY_STEPS) {
    const correct = Math.ceil(minAnswers * minAccuracy);
    assert.equal(masteryLevel(correct, minAnswers - correct), level, `exactly at level ${level}`);
  }
});

test("enough answers but too many wrong holds a kana back", () => {
  assert.equal(masteryLevel(30, 20), 2, "60% right over 50 answers is level 2, not 5");
  assert.equal(masteryLevel(2, 8), 1);
});

test("getting a kana wrong can lower its level", () => {
  assert.equal(masteryLevel(14, 1), 3);
  assert.equal(masteryLevel(14, 6), 2);
});

test("levels are keyed by character, skipping ids that aren't basic hiragana", () => {
  const levels = kanaLevelsOf([{ kanaId: 1, correct: 50, wrong: 0 }, { kanaId: 6, correct: 0, wrong: 0 }, { kanaId: 999, correct: 50, wrong: 0 }]);
  assert.deepEqual([...levels], [["あ", 5], ["か", 1]]);
});

test("a word's power adds each kana's tile power, a repeated kana each time", () => {
  const levels = new Map([["こ", 4]]);
  assert.equal(wordPower("ここ", levels), 2 * TILE_POWER_BY_LEVEL[4]);
  assert.equal(wordPower("こい", levels), TILE_POWER_BY_LEVEL[4] + TILE_POWER_BY_LEVEL[1]);
});

// ---- winning against a kana that can't be caught

test("a kana that can't be caught, worn out, is won", () => {
  const exhausted = { ...startBattle(ne, { isCatchable: false }), enemyHp: 0 };
  assert.equal(canFinish(exhausted), true);
  assert.equal(finishBattle(exhausted).outcome, "won");
});

test("a kana still standing, or one that can be caught, can't be claimed as won", () => {
  assert.equal(finishBattle(startBattle(ne, { isCatchable: false })).phase, "attack");
  assert.equal(canFinish({ ...startBattle(ne, { isCatchable: true }), enemyHp: 0 }), false);
});

test("a battle starts hidden at full HP unless set up otherwise", () => {
  const wild = startBattle(ne, { isCatchable: true });
  assert.deepEqual([wild.isHidden, wild.playerHp], [true, PLAYER_MAX_HP]);
  const round = startBattle(ne, { isCatchable: false, isHidden: false, playerHp: 12 });
  assert.deepEqual([round.isHidden, round.playerHp], [false, 12]);
});

// ---- defence styles (docs/KANA-BATTLE.md sections 6 and 9)

test("reading as it draws: right before it is drawn is perfect, right after is a block, wrong is a miss", () => {
  assert.deepEqual([drawnBlock(true, 1, 3), drawnBlock(true, 3, 3), drawnBlock(false, 0, 3)], ["perfect", "blocked", "missed"]);
});

test("the stroke reveal: perfect before half the strokes, glancing before the last, grazing once drawn", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(drawn => revealBlock(true, drawn, 4)), ["perfect", "perfect", "glanced", "glanced", "grazed"]);
  assert.equal(revealBlock(false, 0, 4), "missed");
});

test("a shout picked right on the first hearing is perfect; after hearing it again, a block", () => {
  assert.deepEqual([heardBlock(true, 1), heardBlock(true, 2), heardBlock(false, 1)], ["perfect", "blocked", "missed"]);
});

test("Chun's look-alike attacks are the kana or one of its look-alikes, never a word", () => {
  const random = seeded(7);
  for (let i = 0; i < 40; i++) {
    const attack = pickAttack("look-alikes", kana("あ"), COURSE_WORDS, random);
    assert.equal(attack.kind, "kana");
    assert.ok(["あ", "お"].includes(attack.kana.kana), attack.kana.kana);
  }
});

test("a shout is always a single kana, never a word", () => {
  const random = seeded(3);
  for (let i = 0; i < 40; i++) assert.equal(pickAttack("shout", kana("つ"), COURSE_WORDS, random).kind, "kana");
});

test("look-alike choices are the answer and three kana that learners mix up, its own look-alikes first", () => {
  const mixedUp = new Set(LOOK_ALIKES.join(""));
  for (let seed = 1; seed < 20; seed++) {
    const choices = lookAlikeChoices(kana("ね"), seeded(seed));
    assert.equal(choices.length, CHOICE_COUNT);
    assert.ok(choices.includes("ne"));
    assert.ok(["re", "wa"].every(romaji => choices.includes(romaji)), JSON.stringify(choices));
    assert.ok(choices.every(romaji => mixedUp.has(BASIC_HIRAGANA.find(item => item.romaji === romaji).kana)), JSON.stringify(choices));
  }
  assert.deepEqual(lookAlikesOf(kana("ね")).map(item => item.kana), ["ね", "れ", "わ"]);
});

test("a shout offers kana that sound like it (the same vowel first), and braced, one that sounds nothing like it", () => {
  const choices = soundAlikeChoices(kana("つ"), seeded(5));
  assert.equal(new Set(choices).size, CHOICE_COUNT);
  assert.ok(choices.includes("つ"));
  assert.ok(choices.filter(choice => choice !== "つ").every(choice => kana(choice).vowel === "u"), JSON.stringify(choices));
  const braced = bracedSoundChoices(kana("つ"), seeded(5));
  const [other] = braced.filter(choice => choice !== "つ");
  assert.equal(braced.length, BRACED_CHOICE_COUNT);
  assert.ok(kana(other).vowel !== "u" && kana(other).row !== "t", other);
});

// ---- hints after a challenge lost

test("hints name each mix-up with how often, the most frequent first", () => {
  const mistakes = [
    { kana: "こ", mistakenFor: "に", way: "read" }, { kana: "ね", mistakenFor: "れ", way: "read" }, { kana: "ね", mistakenFor: "れ", way: "read" },
    { kana: "つ", mistakenFor: "す", way: "heard" },
  ];
  assert.deepEqual(mistakeHints(mistakes), ["You read ね as れ twice.", "You read こ as に once.", "You heard つ as す once."]);
});

test("hints stop at MAX_HINTS and say nothing without mistakes", () => {
  const many = [..."あいうえおか"].map(character => ({ kana: character, mistakenFor: "ぬ", way: "read" }));
  assert.equal(mistakeHints(many).length, MAX_HINTS);
  assert.deepEqual(mistakeHints([]), []);
  assert.deepEqual(mistakeHints(Array(3).fill({ kana: "は", mistakenFor: "ほ", way: "read" })), ["You read は as ほ 3 times."]);
});
