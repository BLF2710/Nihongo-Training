// The English study tools (lib/englishStudy.ts), English lesson edits from the admin area (data/englishLessonEdits.ts)
// and the English mock exams' import rules (scripts/english-course/mockExam.ts). Run with --experimental-strip-types.
import assert from "node:assert/strict";
import { test } from "node:test";
import { englishDeckItemIds, englishProgressByLevel, englishWordId, foldForSearch, pickRandom, searchWords, studyGrammarOf, studyQuestionsOf, studyWordsOf, unitsOfLevel } from "../src/lib/englishStudy.ts";
import { editableEnglishLesson, ENGLISH_EDITABLE_FIELDS, withEnglishEdit } from "../src/data/englishLessonEdits.ts";
import { buildMockExam, MIN_QUESTIONS_PER_SECTION, mockExamErrors, mockExamIdOf } from "../../scripts/english-course/mockExam.ts";
import { mockExam as a2MockExam } from "../../docs/curriculum/english/a2/mock-exam.ts";
import { mockExam as b1MockExam } from "../../docs/curriculum/english/b1/mock-exam.ts";
import { mockExam as b2MockExam } from "../../docs/curriculum/english/b2/mock-exam.ts";
import { mockExam as c1MockExam } from "../../docs/curriculum/english/c1/mock-exam.ts";

const word = (text, vietnamese = "từ") => ({ word: text, ipa: "/wɜːd/", partOfSpeech: "noun", vietnamese, definition: `a ${text}`, example: { english: `A ${text}.`, vietnamese: "Một từ." } });
const question = prompt => ({ prompt, options: ["a", "b", "c"], correct: "a", explanation: "" });
const lesson = (id, changes = {}) => ({
  id, slug: id.replace("english-", ""), unitId: id.split("-").slice(0, 4).join("-"), level: "A2", unitNumber: 1, lessonNumber: 1, isReview: false,
  title: `Lesson ${id}`, titleVi: "Bài", objectives: ["Learn"], vocabulary: [word("castle", "lâu đài")], grammar: [{ title: "Be", pattern: "I am", explanation: { english: "Use be.", vietnamese: "Dùng be." }, examples: [] }],
  examples: [], dialogue: [], practice: [question("p1")], challenge: [question("c1")], ...changes,
});
const first = lesson("english-a2-unit-1-hello");
const review = lesson("english-a2-unit-1-review", { isReview: true, vocabulary: [word("castle", "lâu đài")] });

test("each word is listed once, under the lesson that teaches it, not its unit's review", () => {
  assert.deepEqual(studyWordsOf([first, review]).map(item => item.id), [englishWordId(first.id, "castle")]);
});

test("a word's flashcard id is its lesson id and the word", () => {
  assert.equal(englishWordId(first.id, "castle"), "english-a2-unit-1-hello:castle");
});

test("grammar points are numbered within their lesson, and reviews are left out", () => {
  assert.deepEqual(studyGrammarOf([first, review]).map(point => point.id), [`${first.id}:grammar-1`]);
});

test("searching ignores Vietnamese tone marks and đ", () => {
  assert.equal(foldForSearch("  Bất Bình Đẳng "), "bat binh dang");
});

test("a search finds words by their English, Vietnamese or definition", () => {
  const words = [word("castle", "lâu đài"), word("bridge", "cây cầu")];
  assert.deepEqual([searchWords(words, "lau dai"), searchWords(words, "a bridge"), searchWords(words, "")].map(found => found.map(item => item.word)), [["castle"], ["bridge"], ["castle", "bridge"]]);
});

test("the flashcard deck holds the words of completed lessons only", () => {
  const second = lesson("english-a2-unit-1-family", { vocabulary: [word("mother")] });
  assert.deepEqual(englishDeckItemIds([first, second], new Set([second.id])), [englishWordId(second.id, "mother")]);
});

test("review questions come from practice and challenge, each with a stable id", () => {
  assert.deepEqual(studyQuestionsOf([first]).map(item => item.id), [`${first.id}:practice-1`, `${first.id}:challenge-1`]);
});

test("a random pick takes the number asked for without repeating, or all there are", () => {
  const picked = pickRandom([1, 2, 3, 4, 5], 3, () => 0.5);
  assert.deepEqual([picked.length, new Set(picked).size, pickRandom([1, 2], 5).length], [3, 3, 2]);
});

test("a level's units are its published ones, in course order", () => {
  const units = [{ id: "b", level: "A2", number: 2, published: true }, { id: "a", level: "A2", number: 1, published: true }, { id: "c", level: "A2", number: 3, published: false }, { id: "d", level: "B1", number: 1, published: true }];
  assert.deepEqual(unitsOfLevel(units, "A2").map(unit => unit.id), ["a", "b"]);
});

test("progress is summed per level, and levels without units are left out", () => {
  const units = [
    { id: "english-a2-unit-1", completed: true, completedLessons: 6, totalLessons: 6 },
    { id: "english-a2-unit-2", completed: false, completedLessons: 2, totalLessons: 6 },
    { id: "japanese-n5-unit-1", completed: true, completedLessons: 6, totalLessons: 6 },
  ];
  assert.deepEqual(englishProgressByLevel(units, ["A2", "B1"]), [{ level: "A2", lessonsDone: 8, lessonsTotal: 12, unitsDone: 1, unitsTotal: 2 }]);
});

test("a published English edit replaces the lesson's content and keeps its place in the course", () => {
  const edited = withEnglishEdit(first, { ...editableEnglishLesson(first), title: "Edited" });
  assert.deepEqual([edited.title, edited.id, edited.unitId, edited.lessonNumber], ["Edited", first.id, first.unitId, first.lessonNumber]);
});

test("a lesson without an edit is left as it is", () => {
  assert.equal(withEnglishEdit(first, undefined), first);
});

test("the editable part of a lesson is exactly its editable fields", () => {
  assert.deepEqual(Object.keys(editableEnglishLesson(first)).sort(), [...ENGLISH_EDITABLE_FIELDS].sort());
});

const MOCK_EXAMS = [a2MockExam, b1MockExam, b2MockExam, c1MockExam];

test("every level's mock exam passes the import rules", () => {
  assert.deepEqual(MOCK_EXAMS.flatMap(exam => mockExamErrors(exam, exam.level)), []);
});

test("a mock exam section needs enough questions", () => {
  const exam = { ...a2MockExam, sections: [{ ...a2MockExam.sections[0], groups: [{ ...a2MockExam.sections[0].groups[0], questions: a2MockExam.sections[0].groups[0].questions.slice(0, MIN_QUESTIONS_PER_SECTION - 1) }] }] };
  assert.deepEqual(mockExamErrors(exam, "exam"), [`exam.sections[0] has ${MIN_QUESTIONS_PER_SECTION - 1} questions (at least ${MIN_QUESTIONS_PER_SECTION})`]);
});

test("a mock exam may not repeat a question id", () => {
  const [section] = a2MockExam.sections, [group] = section.groups;
  const exam = { ...a2MockExam, sections: [{ ...section, groups: [{ ...group, questions: [...group.questions, group.questions[0]] }] }] };
  assert.deepEqual(mockExamErrors(exam, "exam"), ["exam repeats a question id"]);
});

test("a built mock exam keeps each correct answer at its stored index", () => {
  const built = buildMockExam(b2MockExam);
  const sourceQuestions = b2MockExam.sections.flatMap(section => section.groups.flatMap(group => group.questions));
  const builtQuestions = built.sections.flatMap(section => section.groups.flatMap(group => group.questions));
  assert.deepEqual([built.id, builtQuestions.map(item => item.options[item.correctIndex])], [mockExamIdOf("B2"), sourceQuestions.map(item => item.correct)]);
});
