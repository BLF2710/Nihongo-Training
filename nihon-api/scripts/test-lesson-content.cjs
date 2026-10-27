// Validation of lesson content edited in the admin area. No network or database.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const lessons = require("../../shared/course/lessons.json");
const { parseLessonContent } = require("../src/content/lessonContent");

const EDITABLE = ["title", "titleJp", "objectives", "vocabulary", "concept", "examples", "dialogue", "grammar", "reading", "practice", "challenge"];
const editable = lesson => Object.fromEntries(EDITABLE.filter(key => lesson[key] !== undefined).map(key => [key, lesson[key]]));
const sample = () => structuredClone(editable(lessons[0]));
const errorsOf = content => { const result = parseLessonContent(content); assert.equal(result.ok, false); return result.errors; };

test("every lesson in the course is valid content as it stands", () => {
  const failures = lessons.map(lesson => [lesson.id, parseLessonContent(editable(lesson))]).filter(([, result]) => !result.ok);
  assert.deepEqual(failures.map(([id, result]) => [id, result.errors.slice(0, 3)]), []);
});

test("returns the content trimmed and in NFC form", () => {
  const content = sample(); content.title = "  Café talk  ";
  const result = parseLessonContent(content);
  assert.equal(result.ok, true); assert.equal(result.content.title, "Café talk"); assert.equal(result.content.title, "Café talk".normalize("NFC"));
});

test("the correct answer must be one of the options", () => {
  const content = sample(); content.practice[0].correct = "not an option";
  assert.deepEqual(errorsOf(content), ["practice 1: correct answer: must be one of the options"]);
});

test("reports every problem at once, with where it is", () => {
  const content = sample(); content.title = ""; content.vocabulary[1] = ["only", "two"]; content.challenge = [];
  assert.deepEqual(errorsOf(content), ["title: is required", "word 2: must have 3 parts", "challenge: needs at least 1"]);
});

test("a question needs at least two different options", () => {
  const content = sample(); content.practice[0].options = ["a", "a"]; content.practice[0].correct = "a";
  assert.deepEqual(errorsOf(content), ["practice 1: options: must all be different"]);
});

test("romaji may be empty but the word and meaning may not", () => {
  const content = sample(); content.vocabulary[0] = ["猫", "", ""];
  assert.deepEqual(errorsOf(content), ["word 1: meaning: is required"]);
});

test("rejects text that is far too long", () => {
  const content = sample(); content.concept.text = "あ".repeat(3001);
  assert.deepEqual(errorsOf(content), ["concept: text: must be at most 3000 characters"]);
});

test("an export applied to the course files replaces the edited fields and lists lessons it can't change", () => {
  const { applyLessonEdits } = require("../../scripts/course-import/apply-lesson-edits.mjs");
  const [first, second] = lessons;
  const edit = { ...editable(first), title: "Edited", grammar: undefined };
  const result = applyLessonEdits([first, second], { [first.id]: edit, "japanese-n5-unit-1-introductions": editable(first) });
  assert.equal(result.lessons[0].title, "Edited"); assert.equal(result.lessons[0].slug, first.slug, "ids, slugs and units are kept");
  assert.equal("grammar" in result.lessons[0], false, "a field the edit removed is removed");
  assert.equal(result.lessons[1], second, "other lessons are untouched");
  assert.deepEqual([result.applied, result.missing], [[first.id], ["japanese-n5-unit-1-introductions"]]);
});
