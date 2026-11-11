// Kana Wilds' rules (docs/KANA-BATTLE.md): the kana table, the vowel circle, the words a collection can play, the
// battle's turns and damage, catching, encounters and the tracing grader. Run with --experimental-strip-types.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { BASIC_HIRAGANA, kanaByCharacter, STARTERS, VOWEL_IDS } from "../src/lib/kanaWilds/gojuon.ts";
import { matchup, vowelOfWord } from "../src/lib/kanaWilds/vowelCircle.ts";
import { collectBattleWords, countWordsOpenedBy, playableWords } from "../src/lib/kanaWilds/words.ts";
import { BRACED_CHOICE_COUNT, bracedDefenceChoices, bracedReadingChoices, CHOICE_COUNT, defenceChoices, meaningChoices, readingChoices } from "../src/lib/kanaWilds/choices.ts";
import { dealHand, HAND_SIZE, latestCatches, NEW_CATCH_COUNT, SHORT_WORD_LENGTH } from "../src/lib/kanaWilds/hand.ts";
import { MAX_MISSED_WORDS, noteReading, wordsUsingKana } from "../src/lib/kanaWilds/missedWords.ts";
import { pickEncounter } from "../src/lib/kanaWilds/encounters.ts";
import { revealedStrokeCount } from "../src/lib/kanaWilds/reveal.ts";
import { attackWordsOf, MAX_ATTACK_WORD_LENGTH, movesetOf, pickEnemyAttack, WORD_ATTACK_SHARE, wordAttackShare } from "../src/lib/kanaWilds/enemyAttacks.ts";
import {
  attemptCatch, BRACED_DAMAGE_FACTOR, canCatch, catchChance, CATCH_HP_SHARE, CATCH_TOLERANCE, catchTolerance, COUNTER_DAMAGE, defend, MIN_CATCH_CHANCE, ENEMY_ATTACK_POWER, ENEMY_MAX_HP, MAX_CATCH_TRIES,
  PLAYER_MAX_HP, playWord, previewAttack, redraw, runAway, startBattle, TILE_POWER,
} from "../src/lib/kanaWilds/battle.ts";
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
  assert.equal(defend(attacked, "blocked").playerHp, PLAYER_MAX_HP);
  // The stance is u (from いく) and the enemy is e: u beats e, so the enemy's attack is weak.
  assert.equal(defend(attacked, "missed").playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 0.5);
  const fromO = playWord(startBattle(ne, true), { word: word("かお"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(defend(fromO, "missed").playerHp, PLAYER_MAX_HP - ENEMY_ATTACK_POWER * 1.5, "e beats an o stance");
  assert.equal(defend(attacked, "blocked").phase, "attack");
});

test("a perfect block hits back for COUNTER_DAMAGE; a plain block does no damage", () => {
  const attacked = playWord(startBattle(ne, true), { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  const perfect = defend(attacked, "perfect");
  assert.equal(perfect.enemyHp, attacked.enemyHp - COUNTER_DAMAGE);
  assert.deepEqual(perfect.lastEvent, { kind: "blocked", counterDamage: COUNTER_DAMAGE });
  assert.equal(defend(attacked, "blocked").enemyHp, attacked.enemyHp);
});

test("a perfect block never takes the enemy below 0 HP", () => {
  const nearlyOut = { ...startBattle(ne, true), enemyHp: 1, phase: "defend" };
  assert.equal(defend(nearlyOut, "perfect").enemyHp, 0);
});

test("running out of HP loses the battle", () => {
  let state = { ...startBattle(ne, true), playerHp: 1, phase: "defend" };
  state = defend(state, "missed");
  assert.equal(state.outcome, "lost");
  assert.equal(state.phase, "over");
});

test("catching opens at 60% HP, and an exhausted enemy no longer attacks", () => {
  const start = startBattle(ne, true);
  assert.equal(canCatch(start), false);
  assert.equal(canCatch({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE + 1 }), false);
  assert.equal(canCatch({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), true);
  const exhausted = playWord({ ...start, enemyHp: 2 }, { word: word("いく"), isReadingCorrect: true, isMeaningCorrect: false });
  assert.equal(exhausted.enemyHp, 0);
  assert.equal(exhausted.phase, "attack", "no enemy turn at 0 HP");
});

test("the weaker the enemy, the more forgiving the trace", () => {
  const start = startBattle(ne, true);
  assert.equal(catchTolerance({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), CATCH_TOLERANCE.strictest);
  assert.equal(catchTolerance({ ...start, enemyHp: 0 }), CATCH_TOLERANCE.loosest);
});

test("the catch chance starts at MIN_CATCH_CHANCE as catching opens and is certain at 0 HP", () => {
  const start = startBattle(ne, true);
  assert.equal(catchChance({ ...start, enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE }), MIN_CATCH_CHANCE);
  assert.equal(catchChance({ ...start, enemyHp: 0 }), 1);
  assert.ok(catchChance({ ...start, enemyHp: 6 }) > catchChance({ ...start, enemyHp: 9 }), "rises as it weakens");
});

test("a good trace catches when the roll is under the catch chance", () => {
  const weak = { ...startBattle(ne, true), enemyHp: 3 };
  assert.equal(attemptCatch(weak, true, catchChance(weak) - 0.01).outcome, "caught");
});

test("a good trace with a roll over the chance breaks out, and it strikes back", () => {
  const opening = { ...startBattle(ne, true), enemyHp: ENEMY_MAX_HP * CATCH_HP_SHARE };
  const state = attemptCatch(opening, true, MIN_CATCH_CHANCE);
  assert.equal(state.phase, "defend");
  assert.deepEqual(state.lastEvent, { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - 1, reason: "broke-out" });
});

test("a failed trace never catches, whatever the roll, and the last try makes it flee", () => {
  const exhausted = { ...startBattle(ne, true), enemyHp: 0 };
  let state = attemptCatch(exhausted, false, 0);
  assert.deepEqual(state.lastEvent, { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - 1, reason: "trace" });
  for (let tries = 1; tries < MAX_CATCH_TRIES; tries++) state = attemptCatch({ ...state, phase: "attack" }, false, 0);
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
  const after = redraw(startBattle(ne, true));
  assert.deepEqual([after.phase, after.isBraced, after.enemyHp, after.readings.answered, after.lastEvent.kind], ["defend", true, ENEMY_MAX_HP, 0, "redrew"]);
  assert.equal(redraw(after), after, "only on the player's own turn");
  const exhausted = { ...startBattle(ne, true), enemyHp: 0 };
  assert.equal(redraw(exhausted), exhausted, "not against a worn-out kana: catch it or finish instead");
});

test("braced, a missed block hurts half as much, and the brace lasts one attack", () => {
  const braced = redraw(startBattle(ne, true));
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
