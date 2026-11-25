// The English course's import rules (scripts/english-course) and its levels on the site (lib/courseLevel.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { americanSpellingsIn } from "../../scripts/english-course/britishSpelling.ts";
import { buildEnglishCourse } from "../../scripts/english-course/build.ts";
import { lessonErrors, questionErrors, unitErrors } from "../../scripts/english-course/validate.ts";
import { blueprint as a2Blueprint } from "../../docs/curriculum/english/a2/blueprint.ts";
import { unit as a2Unit1 } from "../../docs/curriculum/english/a2/unit-1.ts";
import { unit as a2Unit2 } from "../../docs/curriculum/english/a2/unit-2.ts";
import { unit as a2Unit3 } from "../../docs/curriculum/english/a2/unit-3.ts";
import { unit as a2Unit4 } from "../../docs/curriculum/english/a2/unit-4.ts";
import { unit as a2Unit5 } from "../../docs/curriculum/english/a2/unit-5.ts";
import { unit as a2Unit6 } from "../../docs/curriculum/english/a2/unit-6.ts";
import { dialoguePageOfLine, dialoguePagesOf } from "../src/lib/dialoguePages.ts";
import { englishLevelOfId, levelOfId, studyLevelOfId } from "../src/lib/courseLevel.ts";

const lessonOf = (index = 0) => a2Unit1.lessons[index];
const withLesson = (changes) => ({ ...lessonOf(), ...changes });

test("the A2 sources pass every rule and Unit 1 goes live with its six lessons and assessment", () => {
  const { course, errors } = buildEnglishCourse([a2Blueprint], [a2Unit1]);
  assert.deepEqual(errors, []);
  const live = course.units.filter(unit => unit.published);
  assert.deepEqual(live.map(unit => unit.id), ["english-a2-unit-1"]);
  assert.equal(course.lessons.length, 6);
  assert.equal(course.assessments.length, 1);
});

test("all six A2 units pass every rule and the whole level goes live", () => {
  const { course, errors } = buildEnglishCourse([a2Blueprint], [a2Unit1, a2Unit2, a2Unit3, a2Unit4, a2Unit5, a2Unit6]);
  assert.deepEqual(errors, []);
  assert.ok(course.units.every(unit => unit.published));
  assert.equal(course.lessons.length, 36);
  assert.equal(course.assessments.length, 6);
});

test("ids and slugs are made from the level, unit and lesson key", () => {
  const { course } = buildEnglishCourse([a2Blueprint], [a2Unit1]);
  const first = course.lessons[0];
  assert.deepEqual([first.id, first.slug, first.unitId, first.lessonNumber], ["english-a2-unit-1-introductions", "a2-unit-1-introductions", "english-a2-unit-1", 1]);
  assert.equal(course.units[0].assessmentId, "english-a2-unit-1-assessment");
});

test("a unit without a source is planned but not live, and has no lessons", () => {
  const { course } = buildEnglishCourse([a2Blueprint], []);
  assert.equal(course.units.length, a2Blueprint.units.length);
  assert.ok(course.units.every(unit => !unit.published));
  assert.deepEqual(course.lessons, []);
});

test("the assessment keeps each answer as the index of the correct option", () => {
  const { course } = buildEnglishCourse([a2Blueprint], [a2Unit1]);
  const [question] = course.assessments[0].questions;
  assert.equal(question.options[question.correctIndex], a2Unit1.assessment[0].correct);
});

test("options are shuffled at import, the same way every time, so the correct answer is not always first", () => {
  const first = buildEnglishCourse([a2Blueprint], [a2Unit1]).course;
  const again = buildEnglishCourse([a2Blueprint], [a2Unit1]).course;
  const questions = [...first.lessons.flatMap(lesson => [...lesson.practice, ...lesson.challenge]), ...first.assessments[0].questions];
  const correctOf = question => "correct" in question ? question.correct : question.options[question.correctIndex];
  assert.deepEqual(again, first);
  assert.ok(questions.filter(question => question.options[0] !== correctOf(question)).length > questions.length / 2);
});

test("shuffling keeps every option and the assessment answer index still names the correct one", () => {
  const { course } = buildEnglishCourse([a2Blueprint], [a2Unit1]);
  course.assessments[0].questions.forEach((question, index) => {
    const source = a2Unit1.assessment[index];
    assert.deepEqual([...question.options].sort(), [...source.options].sort());
    assert.equal(question.options[question.correctIndex], source.correct);
  });
});

test("a unit that breaks a rule is reported and kept off the site", () => {
  const broken = { ...a2Unit1, assessment: a2Unit1.assessment.slice(1) };
  const { course, errors } = buildEnglishCourse([a2Blueprint], [broken]);
  assert.ok(errors.some(error => error.includes("14 assessment questions")));
  assert.ok(course.units.every(unit => !unit.published));
});

test("American spellings are found with their British forms; British ones pass", () => {
  assert.deepEqual(americanSpellingsIn("My favorite Color is gray."), ["favorite → favourite", "color → colour", "gray → grey"]);
  assert.deepEqual(americanSpellingsIn("My favourite colour is grey."), []);
});

test("a lesson written with an American spelling is refused", () => {
  const lesson = withLesson({ objectives: ["Talk about your favorite food"] });
  assert.ok(lessonErrors(lesson, "lesson").some(error => error.includes("favorite → favourite")));
});

test("a word without IPA between slashes is refused", () => {
  const [word, ...rest] = lessonOf().vocabulary;
  const lesson = withLesson({ vocabulary: [{ ...word, ipa: "in-tro-duce" }, ...rest] });
  assert.ok(lessonErrors(lesson, "lesson").some(error => error.includes("is not IPA")));
});

test("a Vietnamese text that only repeats the English is refused", () => {
  const [example, ...rest] = lessonOf().examples;
  const lesson = withLesson({ examples: [{ english: example.english, vietnamese: example.english }, ...rest] });
  assert.ok(lessonErrors(lesson, "lesson").some(error => error.includes("the Vietnamese is the same as the English")));
});

test("text must be in composed (NFC) form, so typed answers compare equal", () => {
  const decomposed = "Tiếng Việt";
  const lesson = withLesson({ objectives: [decomposed] });
  assert.ok(lessonErrors(lesson, "lesson").some(error => error.includes("NFC")));
});

test("a question whose answer is not among its options is refused", () => {
  const errors = questionErrors({ prompt: "Pick one", options: ["a", "b", "c"], correct: "d", explanation: "-" }, "q");
  assert.deepEqual(errors, ["q: the correct answer is not one of the options"]);
});

test("a review may only revisit words the unit's lessons teach", () => {
  const review = a2Unit1.lessons.at(-1);
  const newWord = { ...review.vocabulary[0], word: "castle" };
  const unit = { ...a2Unit1, lessons: [...a2Unit1.lessons.slice(0, -1), { ...review, vocabulary: [...review.vocabulary, newWord] }] };
  const errors = unitErrors(unit, a2Blueprint.units[0], "unit");
  assert.ok(errors.some(error => error.includes(`the review lists "castle"`)));
});

test("a lesson title must match the blueprint's", () => {
  const unit = { ...a2Unit1, lessons: [{ ...lessonOf(), title: "Hello There" }, ...a2Unit1.lessons.slice(1)] };
  assert.ok(unitErrors(unit, a2Blueprint.units[0], "unit").some(error => error.includes("differs from the blueprint")));
});

test("English ids give their CEFR level, Japanese ids their JLPT level, and neither is taken for the other", () => {
  assert.equal(englishLevelOfId("english-b1-unit-3-stories"), "B1");
  assert.equal(levelOfId("english-a2-unit-1"), null);
  assert.equal(englishLevelOfId("japanese-n5-unit-4"), null);
  assert.deepEqual(["english-a2-unit-1", "japanese-n4-unit-2", "practice"].map(studyLevelOfId), ["A2", "N4", null]);
});

test("a phone shows a conversation four lines at a time, each page labelled with its lines", () => {
  assert.deepEqual(dialoguePagesOf(7).map(page => page.label), ["Lines 1–4", "Lines 5–7"]);
  assert.deepEqual(dialoguePagesOf(5).map(page => page.label), ["Lines 1–4", "Line 5"]);
  assert.equal(dialoguePagesOf(4).length, 1);
  assert.equal(dialoguePageOfLine(4), 1);
});
