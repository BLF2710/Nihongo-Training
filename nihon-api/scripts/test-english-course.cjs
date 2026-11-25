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
