// Checks that the lesson-page fields (practice, challenge, concept, objectives) are split out of the main bundle
// and still reach the lesson page, one chunk per unit. Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { CourseLessonFormatError, LESSON_BODY_FIELDS, splitLessons } from "../build-tools/courseLessonSplit.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const courseLessons = JSON.parse(readFileSync(resolve(root, "../shared/course/lessons.json"), "utf8"));
const body = name => ({ objectives: [`${name} goal`], concept: { title: name, text: "", examples: [] }, practice: [], challenge: [] });

test("keeps everything but the lesson-page fields in the summaries", () => {
  const { summaries } = splitLessons([{ id: "a-1", unitId: "a", title: "First", vocabulary: [], ...body("a-1") }]);
  assert.deepEqual(summaries, [{ id: "a-1", unitId: "a", title: "First", vocabulary: [] }]);
});

test("groups the lesson-page fields by unit and lesson id", () => {
  const { bodiesByUnit } = splitLessons([{ id: "a-1", unitId: "a", ...body("a-1") }, { id: "a-2", unitId: "a", ...body("a-2") }, { id: "b-1", unitId: "b", ...body("b-1") }]);
  assert.deepEqual(Object.fromEntries(bodiesByUnit), { a: { "a-1": body("a-1"), "a-2": body("a-2") }, b: { "b-1": body("b-1") } });
});

test("rejects a lesson without a unit", () => {
  assert.throws(() => splitLessons([{ id: "a-1" }]), CourseLessonFormatError);
});

test("leaves no lesson-page field in the real course summaries", () => {
  const { summaries } = splitLessons(courseLessons);
  assert.equal(summaries.filter(summary => LESSON_BODY_FIELDS.some(field => field in summary)).length, 0);
});

test("the built main bundle has lesson titles but not challenge explanations, which are in unit chunks", async () => {
  const lesson = courseLessons.find(item => item.challenge.length > 0);
  const explanation = JSON.stringify(lesson.challenge[0].explanation).slice(1, -1);
  const output = await build({ root, logLevel: "silent", build: { write: false } });
  const chunks = (Array.isArray(output) ? output : [output]).flatMap(result => result.output).filter(file => file.type === "chunk");
  const entry = chunks.find(chunk => chunk.isEntry);
  assert.ok(entry.code.includes(JSON.stringify(lesson.title).slice(1, -1)), "the lesson title is in the main bundle");
  assert.ok(!entry.code.includes(explanation), "the challenge explanation is not in the main bundle");
  assert.ok(chunks.some(chunk => chunk.name === lesson.unitId && chunk.code.includes(explanation)), "the unit chunk has it");
});
