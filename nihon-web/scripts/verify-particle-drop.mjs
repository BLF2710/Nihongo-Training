// Particle Drop's rules: where a sentence's particles are, the choices offered, rounds and scoring.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { allParticleQuestions, buildParticleRound, CHOICE_COUNT, findParticleGaps, MAX_SAME_PARTICLE, particleChoices, scoreAnswer } from "../src/lib/particleDrop.ts";

const sentence = (japanese, romaji) => ({ japanese, romaji, meaning: "" });
// A fixed sequence instead of Math.random, so results repeat.
const seeded = (seed = 1) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test("a particle at the end of a phrase is found when the romaji writes it as a word", () => {
  assert.deepEqual(findParticleGaps(sentence("とうきょうは いま ごご くじです。", "Toukyou wa ima gogo kuji desu.")), [{ phrase: 0, particle: "は" }]);
});

test("several particles are found in order", () => {
  assert.deepEqual(findParticleGaps(sentence("わたしは がっこうへ いきます。", "Watashi wa gakkou e ikimasu.")).map(gap => gap.particle), ["は", "へ"]);
});

test("を is read as o or wo", () => {
  assert.equal(findParticleGaps(sentence("みずを のみます。", "Mizu o nomimasu."))[0].particle, "を");
  assert.equal(findParticleGaps(sentence("みずを のみます。", "Mizu wo nomimasu."))[0].particle, "を");
});

test("a word that merely ends in a particle-like kana is not a gap", () => {
  // かいもの ends in の, but the romaji has no separate "no".
  assert.deepEqual(findParticleGaps(sentence("かいもの します。", "Kaimono shimasu.")), []);
});

test("a sentence whose romaji disagrees with its phrases is skipped entirely", () => {
  assert.deepEqual(findParticleGaps(sentence("わたしの ほんは あります。", "Watashi no hon ga arimasu.")), []);
});

test("of two particles in a row (には) only the last can be blanked", () => {
  assert.deepEqual(findParticleGaps(sentence("がっこうには いきます。", "Gakkou ni wa ikimasu.")), [{ phrase: 0, particle: "は" }]);
});

test("a phrase made only of particles (でも at the start) is not a gap", () => {
  assert.deepEqual(findParticleGaps(sentence("でも、 たかいです。", "Demo, takai desu.")), []);
});

test("the question blanks the particle and keeps the rest of the sentence", () => {
  const [question] = allParticleQuestions([{ id: "l", title: "L", examples: [sentence("ねこが います。", "Neko ga imasu.")] }], seeded());
  assert.deepEqual([question.parts, question.answer], [["ねこ", null, " います。"], "が"]);
});

test("choices hold the answer and three different particles", () => {
  const choices = particleChoices("を", seeded(7));
  assert.equal(choices.length, CHOICE_COUNT); assert.ok(choices.includes("を")); assert.equal(new Set(choices).size, CHOICE_COUNT);
});

test("に and へ are never offered against each other", () => {
  for (let seed = 1; seed < 200; seed++) assert.ok(!particleChoices("へ", seeded(seed)).includes("に"), "seed " + seed);
});

test("a round never repeats a sentence and keeps to its size", () => {
  const examples = ["ねこが います。|Neko ga imasu.", "いぬが います。|Inu ga imasu.", "みずを のみます。|Mizu o nomimasu."].map(line => sentence(...line.split("|")));
  const round = buildParticleRound([{ id: "l", title: "L", examples }], 2, seeded(3));
  assert.equal(round.length, 2); assert.equal(new Set(round.map(question => question.romaji)).size, 2);
});

test("faster answers and streaks score more, and the streak bonus has a ceiling", () => {
  assert.ok(scoreAnswer(14, 1) > scoreAnswer(2, 1));
  assert.ok(scoreAnswer(5, 4) > scoreAnswer(5, 1));
  assert.equal(scoreAnswer(0, 50), scoreAnswer(0, 6));
});

// ---- Balance
const KANA = { は: "wa", が: "ga", を: "o", に: "ni", で: "de", と: "to" };
// `count` sentences of the form "ねこ<particle> います。", each a different noun so the sentences differ.
const sentencesWith = (particle, count) => Array.from({ length: count }, (_, index) =>
  sentence(`もの${"あいうえおかきくけこさしすせそ"[index]}${particle} います。`, `Mono${index} ${KANA[particle]} imasu.`));

test("in a sentence with several particles, the less common one is asked", () => {
  // は appears in every sentence, を in one: the を sentence asks を, never は.
  const examples = [...sentencesWith("は", 5), sentence("わたしは パンを たべます。", "Watashi wa pan o tabemasu.")];
  for (let seed = 1; seed < 30; seed++) {
    const question = allParticleQuestions([{ id: "l", title: "L", examples }], seeded(seed)).find(item => item.romaji.startsWith("Watashi"));
    assert.equal(question.answer, "を", "seed " + seed);
  }
});

test("with enough variety, no particle is asked more than the limit in a round", () => {
  const examples = Object.keys(KANA).flatMap(particle => sentencesWith(particle, 10));
  for (let seed = 1; seed < 50; seed++) {
    const counts = {};
    for (const question of buildParticleRound([{ id: "l", title: "L", examples }], 10, seeded(seed))) counts[question.answer] = (counts[question.answer] ?? 0) + 1;
    assert.ok(Math.max(...Object.values(counts)) <= MAX_SAME_PARTICLE, JSON.stringify(counts));
    assert.equal(Object.keys(counts).length, Object.keys(KANA).length, "every particle gets a turn");
  }
});

test("with too few different particles, the round is still filled", () => {
  const examples = [...sentencesWith("は", 12), ...sentencesWith("を", 2)];
  const round = buildParticleRound([{ id: "l", title: "L", examples }], 10, seeded(5));
  assert.equal(round.length, 10);
  assert.equal(round.filter(question => question.answer === "を").length, 2, "every を sentence used first");
});
