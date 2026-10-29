// Spaced repetition scheduling, study-time crediting and mock exam grading. No network or database.
//   npm run test:learning
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");

const { NEW_CARD, scheduleReview, previewIntervals, isSrsGrade } = require("../src/learning/srsScheduler");
const { creditableSeconds, MAX_SECONDS_PER_REPORT } = require("../src/learning/studyTimeCredit");
const { gradeMockExam, parseMockAnswers } = require("../src/learning/mockExamGrading");

const NOW = new Date("2026-10-26T09:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const after = (card, ...grades) => grades.reduce((state, grade) => scheduleReview(state, grade, NOW), card);

// ---- Spaced repetition
test("a new card answered Good comes back in 1 day, Easy in 3 days", () => {
  assert.equal(scheduleReview(NEW_CARD, "good", NOW).dueAt.getTime() - NOW.getTime(), DAY);
  assert.equal(scheduleReview(NEW_CARD, "easy", NOW).intervalDays, 3);
});

test("Again brings the card back in 10 minutes and starts its repetitions over", () => {
  const card = scheduleReview(NEW_CARD, "again", NOW);
  assert.equal(card.dueAt.getTime() - NOW.getTime(), 10 * MINUTE);
  assert.equal(card.repetitions, 0);
  assert.equal(card.intervalDays, 0);
});

test("forgetting a card that was already remembered counts as a lapse; failing a new card does not", () => {
  assert.equal(scheduleReview(NEW_CARD, "again", NOW).lapses, 0);
  assert.equal(after(NEW_CARD, "good", "again").lapses, 1);
});

test("the second success waits 3 days, then intervals grow by the ease factor", () => {
  const second = after(NEW_CARD, "good", "good");
  assert.equal(second.intervalDays, 3);
  assert.equal(scheduleReview(second, "good", NOW).intervalDays, 7.5);
});

test("Hard shortens the next interval and lowers the ease; Easy lengthens it and raises the ease", () => {
  const second = after(NEW_CARD, "good", "good");
  const hard = scheduleReview(second, "hard", NOW), good = scheduleReview(second, "good", NOW), easy = scheduleReview(second, "easy", NOW);
  assert.ok(hard.intervalDays < good.intervalDays && good.intervalDays < easy.intervalDays);
  assert.deepEqual([hard.ease, good.ease, easy.ease], [2.35, 2.5, 2.65]);
});

test("Hard always moves the card at least one day further out", () => {
  const card = { ease: 1.3, intervalDays: 2, repetitions: 3, lapses: 0 };
  assert.equal(scheduleReview(card, "hard", NOW).intervalDays, 3);
});

test("the ease never drops below 1.3 or rises above 3.5", () => {
  assert.equal(after(NEW_CARD, ...Array(20).fill("again")).ease, 1.3);
  assert.equal(after(NEW_CARD, ...Array(20).fill("easy")).ease, 3.5);
});

test("no interval is longer than a year", () => {
  assert.equal(after(NEW_CARD, ...Array(15).fill("easy")).intervalDays, 365);
});

test("the button previews give the wait for each grade, shortest for Again", () => {
  const preview = previewIntervals(NEW_CARD, NOW);
  assert.deepEqual(preview, { again: 10 * MINUTE, hard: DAY, good: DAY, easy: 3 * DAY });
});

test("only the four grades are accepted", () => {
  assert.ok(["again", "hard", "good", "easy"].every(isSrsGrade));
  assert.ok(![undefined, "Good", "perfect", 3].some(isSrsGrade));
});

// ---- Study time
test("the first report of a learner is credited up to the per-report cap", () => {
  assert.equal(creditableSeconds(60, undefined, NOW), 60);
  assert.equal(creditableSeconds(600, undefined, NOW), MAX_SECONDS_PER_REPORT);
});

test("a report can't credit more time than has passed since the last one (plus a few seconds' grace)", () => {
  const tenSecondsAgo = new Date(NOW.getTime() - 10_000);
  assert.equal(creditableSeconds(60, tenSecondsAgo, NOW), 15);
});

test("a report a minute after the last one gets its full minute", () => {
  assert.equal(creditableSeconds(60, new Date(NOW.getTime() - 61_000), NOW), 60);
});

test("zero, negative or invalid reports credit nothing", () => {
  assert.deepEqual([0, -5, Number.NaN, Infinity].map(value => creditableSeconds(value, undefined, NOW)), [0, 0, 0, 0]);
});

// ---- Mock exams
const question = (id, correctIndex) => ({ id, prompt: id, options: ["a", "b", "c", "d"], correctIndex, explanation: "" });
const EXAM = {
  id: "test-exam", level: "N5", minutes: 40, passPercent: 60, sectionMinPercent: 40,
  sections: [
    { id: "vocabulary", title: "Vocabulary", groups: [{ questions: [question("v1", 0), question("v2", 1), question("v3", 2), question("v4", 3), question("v5", 0)] }] },
    { id: "reading", title: "Reading", groups: [{ questions: [question("r1", 0), question("r2", 1), question("r3", 2), question("r4", 3), question("r5", 0)] }] },
  ],
};

test("a mock exam passes with the overall target and the minimum in every section", () => {
  const result = gradeMockExam(EXAM, { v1: 0, v2: 1, v3: 2, r1: 0, r2: 1, r3: 2 });
  assert.equal(result.percent, 60);
  assert.equal(result.passed, true);
});

test("a mock exam fails when one section is below its minimum, even with a passing total", () => {
  const result = gradeMockExam(EXAM, { v1: 0, v2: 1, v3: 2, v4: 3, v5: 0, r1: 0 });
  assert.equal(result.percent, 60);
  assert.deepEqual(result.sections.map(section => section.reached), [true, false]);
  assert.equal(result.passed, false);
});

test("blank questions count as wrong", () => {
  assert.equal(gradeMockExam(EXAM, {}).correct, 0);
});

test("answer sheets naming unknown questions or options are refused", () => {
  assert.deepEqual(parseMockAnswers(EXAM, { v1: 2 }), { v1: 2 });
  assert.equal(parseMockAnswers(EXAM, { x9: 0 }), null);
  assert.equal(parseMockAnswers(EXAM, { v1: 4 }), null);
  assert.equal(parseMockAnswers(EXAM, { v1: 1.5 }), null);
  assert.equal(parseMockAnswers(EXAM, [0, 1]), null);
});

// ---- Weak characters (kana and kanji in the mistake notebook)
const { isWeakCharacter, WEAK_ACCURACY } = require("../src/services/character-progress");

test("a character never missed is not weak, however few answers it has", () => {
  assert.equal(isWeakCharacter(1, 0), false);
});

test("a missed character below the threshold is weak", () => {
  assert.equal(isWeakCharacter(1, 1), true);
});

test("a mastered character under the threshold is still weak", () => {
  // 41 of 50 = 82%: mastered (80%+, 3+ right) but below 85%.
  assert.deepEqual([require("../src/services/character-progress").characterProgress(41, 9).status, isWeakCharacter(41, 9)], ["mastered", true]);
});

test("a character at the threshold is no longer weak", () => {
  assert.equal(WEAK_ACCURACY, 85);
  assert.equal(isWeakCharacter(17, 3), false);
});
