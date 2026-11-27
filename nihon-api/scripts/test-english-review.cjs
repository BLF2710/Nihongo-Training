// The server-graded English review (src/learning/englishReview.ts): rounds drawn from completed lessons, without
// answers, and graded by question id. No network or database.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const { QUESTIONS_PER_ROUND, drawReviewRound, findReviewQuestion, gradeReviewAnswer, isEnglishReviewScope, isLessonInScope, lessonIdOf } = require("../src/learning/englishReview");

const word = (name, vietnamese) => ({ word: name, ipa: "/x/", vietnamese, definition: `${name} means ${vietnamese}` });
const question = (prompt, correct) => ({ prompt, options: [correct, "other", "another"], correct, explanation: `Because ${correct}.` });
const lesson = (id, unitId) => ({
  id, unitId, level: "A2", unitNumber: Number(unitId.split("-").pop()), title: `Lesson ${id}`, isReview: false,
  vocabulary: [word("cat", "con mèo"), word("dog", "con chó"), word("bird", "con chim"), word("fish", "con cá")],
  practice: [question("Pick one", "one"), question("Pick two", "two")], challenge: [question("Pick three", "three")],
});
const unitOne = lesson("english-a2-unit-1-pets", "english-a2-unit-1");
const unitTwo = lesson("english-a2-unit-2-food", "english-a2-unit-2");
const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test("a review covers an English unit or a whole level", () => {
  assert.deepEqual(["english-a2-unit-3", "english-c1", "english-a2-unit-", "japanese-n5-unit-1", 5].map(isEnglishReviewScope), [true, true, false, false, false]);
});

test("a level's review takes its units' lessons; a unit's only its own", () => {
  assert.deepEqual([isLessonInScope(unitTwo, "english-a2"), isLessonInScope(unitTwo, "english-a2-unit-2"), isLessonInScope(unitTwo, "english-a2-unit-1"), isLessonInScope(unitTwo, "english-b1")], [true, true, false, false]);
});

test("a round has ten different questions and never shows their answers", () => {
  const round = drawReviewRound([unitOne, unitTwo], seeded());
  assert.equal(round.length, QUESTIONS_PER_ROUND);
  assert.equal(new Set(round.map(item => item.id)).size, QUESTIONS_PER_ROUND);
  assert.ok(round.every(item => !("correct" in item) && !("explanation" in item)));
});

test("a round is empty when no lesson has been completed", () => {
  assert.deepEqual(drawReviewRound([], seeded()), []);
});

test("a word question offers its meaning among four different options", () => {
  const found = findReviewQuestion(unitOne, "english-a2-unit-1-pets:word-2", seeded());
  assert.deepEqual([found.correct, found.options.length, new Set(found.options).size, found.options.includes("con chó")], ["con chó", 4, 4, true]);
});

test("a question id names its lesson, and anything else names none", () => {
  assert.deepEqual(["english-a2-unit-1-pets:challenge-1", "english-a2-unit-1-pets:hint-1", "japanese-n5-unit-1-x:word-1", 12].map(lessonIdOf), ["english-a2-unit-1-pets", null, null, null]);
});

test("a review lesson asks its own questions but not its unit's words again", () => {
  const revision = { ...unitOne, id: "english-a2-unit-1-review", isReview: true };
  assert.deepEqual([findReviewQuestion(revision, "english-a2-unit-1-review:word-1", seeded()), findReviewQuestion(revision, "english-a2-unit-1-review:practice-1", seeded())?.correct], [null, "one"]);
});

test("an id past the lesson's questions finds nothing", () => {
  assert.equal(findReviewQuestion(unitOne, "english-a2-unit-1-pets:practice-9", seeded()), null);
});

test("the lesson's answer is graded right, with the solution and explanation", () => {
  const found = findReviewQuestion(unitOne, "english-a2-unit-1-pets:practice-2", seeded());
  assert.deepEqual(gradeReviewAnswer(found, "two"), { correct: true, solution: "two", explanation: "Because two." });
});

test("another option is graded wrong and shows the solution", () => {
  const found = findReviewQuestion(unitOne, "english-a2-unit-1-pets:practice-2", seeded());
  assert.deepEqual(gradeReviewAnswer(found, "other"), { correct: false, solution: "two", explanation: "Because two." });
});
