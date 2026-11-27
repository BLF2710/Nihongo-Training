// The English course as the API serves it (src/data/imported-course.ts): its own unlock chain beside the Japanese
// one. No network or database.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const { UNITS } = require("../src/data/units");
const { LESSONS } = require("../src/data/lessons");
const { UNIT_ASSESSMENTS } = require("../src/data/unit-assessments");
const { getUnitAccess } = require("../src/services/unit.service");
const { courseLevelOf } = require("../src/learning/courseLevel");

const englishUnits = UNITS.filter(unit => unit.id.startsWith("english-"));
const NO_UNITS_DONE = new Set();
const FIRST_LEVEL = 1;

test("the live English units are served, A2 Unit 1 first", () => {
  assert.ok(englishUnits.length > 0);
  assert.equal(englishUnits[0].id, "english-a2-unit-1");
});

test("English A2 Unit 1 is open from the start: it waits on no Japanese unit", () => {
  const [first] = englishUnits;
  assert.equal(first.previousUnitId, undefined);
  assert.deepEqual(getUnitAccess(first, FIRST_LEVEL, NO_UNITS_DONE), { allowed: true, reasons: [] });
});

test("each English unit after the first waits on the English unit before it", () => {
  englishUnits.slice(1).forEach((unit, index) => assert.equal(unit.previousUnitId, englishUnits[index].id));
});

test("an English unit's lessons open one after another", () => {
  const [first] = englishUnits;
  const lessons = first.lessonIds.map(id => LESSONS.find(lesson => lesson.id === id));
  assert.equal(lessons[0].previousLessonId, undefined);
  lessons.slice(1).forEach((lesson, index) => assert.equal(lesson.previousLessonId, lessons[index].id));
  assert.equal(lessons[0].unit, "English A2 Unit 1");
});

test("every live English unit has its assessment", () => {
  for (const unit of englishUnits) assert.ok(UNIT_ASSESSMENTS.some(assessment => assessment.id === unit.assessmentId), unit.id);
});

test("course levels are read from Japanese and English ids alike", () => {
  assert.deepEqual(["japanese-n5-unit-4", "english-b2-unit-1-…", "practice"].map(courseLevelOf), ["N5", "B2", ""]);
});

test("English listening and speaking may be saved for a unit or a whole level", () => {
  const { isPracticeScope } = require("../src/services/practice-activity.service");
  assert.deepEqual(["english-a2-unit-3", "english-c1", "japanese-n5-unit-1", "english-x9", "N5"].map(scope => isPracticeScope("listening", scope)), [true, true, true, false, false]);
});

test("an English review round may be saved for an English unit or level, never a Japanese one", () => {
  const { isPracticeScope } = require("../src/services/practice-activity.service");
  assert.deepEqual(["english-b1-unit-2", "english-b1", "japanese-n5-unit-1", "N5"].map(scope => isPracticeScope("review", scope)), [true, true, false, false]);
});

const { ENGLISH_MISTAKE_KEY } = require("../src/repositories/mistake.repository");
const { mistakeKeys, toMistakeCourse } = require("../src/services/mistake.service");

test("English lesson, unit test and A2–C1 mock exam mistakes go to the English notebook", () => {
  const isEnglish = key => new RegExp(ENGLISH_MISTAKE_KEY).test(key);
  const english = [mistakeKeys.lesson("english-a2-unit-1-introductions", "Hello"), mistakeKeys.assessment("english-b1-unit-2-assessment", "q1"), mistakeKeys.mockExam("C1", "q3"),
    mistakeKeys.englishReview("english-a2-unit-1-introductions:word-2")];
  assert.deepEqual(english.map(isEnglish), [true, true, true, true]);
});

test("Japanese lesson, test, review, mock exam, kana and kanji mistakes stay in the Japanese notebook", () => {
  const isEnglish = key => new RegExp(ENGLISH_MISTAKE_KEY).test(key);
  const japanese = [mistakeKeys.lesson("japanese-n5-unit-1-greetings", "こんにちは"), mistakeKeys.assessment("japanese-n5-unit-1-assessment", "q1"),
    mistakeKeys.bank(12), mistakeKeys.mockExam("N5", "q3"), mistakeKeys.kana("hiragana", 4), mistakeKeys.kanji("k1", "meaning")];
  assert.deepEqual(japanese.map(isEnglish), [false, false, false, false, false, false]);
});

test("the notebook's course is japanese, english, or both when not given; anything else is refused", () => {
  assert.deepEqual([toMistakeCourse("english"), toMistakeCourse("japanese"), toMistakeCourse(undefined)], ["english", "japanese", null]);
  assert.throws(() => toMistakeCourse("french"), /Unknown course/);
});
