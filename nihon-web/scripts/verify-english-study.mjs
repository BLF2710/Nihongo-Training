// The English study tools (lib/englishStudy.ts), English lesson edits from the admin area (data/englishLessonEdits.ts)
// and the English mock exams' import rules (scripts/english-course/mockExam.ts). Run with --experimental-strip-types.
import assert from "node:assert/strict";
import { test } from "node:test";
import { englishDeckItemIds, englishProgressByLevel, englishWordId, foldForSearch, pickRandom, searchWords, studyGrammarOf, studyQuestionsOf, studyWordsOf, unitsOfLevel, wordQuestionsOf } from "../src/lib/englishStudy.ts";
import { matchEnglishSpeech, speechScore, speechWords } from "../src/lib/englishSpeechMatch.ts";
import { buildEnglishListeningRound, buildEnglishSpeakingRound, ENGLISH_ROUND_SIZE, hasSkillMaterial, skillMaterialOf } from "../src/lib/englishSkillRounds.ts";
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

const dialogue = [
  { speaker: "Lan", english: "Where are you from?", vietnamese: "Bạn đến từ đâu?" },
  { speaker: "Tom", english: "I'm from Leeds.", vietnamese: "Tôi đến từ Leeds." },
  { speaker: "Lan", english: "Is it far?", vietnamese: "Có xa không?" },
];
const talking = lesson("english-a2-unit-1-talk", { examples: [{ english: "I am a nurse.", vietnamese: "Tôi là y tá." }], dialogue,
  vocabulary: ["castle", "bridge", "river", "market", "abbey"].map((text, index) => word(text, `nghĩa ${index}`)) });

test("speech is compared as plain words, with contractions and small numbers written out", () => {
  assert.deepEqual(speechWords("I'm 12, I can't go!"), ["i", "am", "twelve", "i", "cannot", "go"]);
});

test("an American spelling from the recogniser counts as the British one", () => {
  assert.equal(speechScore("My favourite colour", "my favorite color"), 1);
});

test("speech that says the sentence, give or take a word, is accepted", () => {
  assert.equal(matchEnglishSpeech("Could you tell me the way to the station?", ["could you tell me way to the station"]).matched, true);
});

test("speech that says something else, or rambles on, is not", () => {
  const target = "I'm from Leeds.";
  assert.deepEqual([matchEnglishSpeech(target, ["I'm from London"]).matched, matchEnglishSpeech(target, ["I'm from Leeds and I really love it there"]).matched, matchEnglishSpeech(target, []).matched], [false, false, false]);
});

test("the best of the recogniser's guesses is the one judged", () => {
  assert.deepEqual(matchEnglishSpeech("I'm from Leeds.", ["I'm from leaves", "I am from Leeds"]), { matched: true, heard: "I am from Leeds" });
});

test("every pair of consecutive conversation lines is an exchange", () => {
  const { exchanges } = skillMaterialOf([talking]);
  assert.deepEqual(exchanges.map(({ lead, reply }) => [lead.speaker, reply.speaker]), [["Lan", "Tom"], ["Tom", "Lan"]]);
});

test("a listening question offers the right meaning among others, each once", () => {
  const [exercise] = buildEnglishListeningRound(skillMaterialOf([talking]), "vocabulary", () => 0.3);
  assert.ok(exercise.choices.includes(exercise.answer) && new Set(exercise.choices).size === exercise.choices.length && exercise.audio.length === 1);
});

test("a conversation question plays both lines and asks for the reply", () => {
  const exercises = buildEnglishListeningRound(skillMaterialOf([talking]), "dialogue");
  assert.ok(exercises.every(exercise => exercise.audio.length === 2 && exercise.audio[1] === exercise.answer && exercise.areChoicesEnglish));
});

test("speaking a reply gives the other speaker's line first", () => {
  const [first] = buildEnglishSpeakingRound(skillMaterialOf([talking]), "dialogue", () => 0);
  assert.ok(first.lead && first.speaker && first.target !== first.lead.english);
});

test("a round has at most ten exercises", () => {
  const many = lesson("english-a2-unit-2-many", { vocabulary: Array.from({ length: 15 }, (_, index) => word(`word${index}`, `nghĩa ${index}`)) });
  assert.equal(buildEnglishSpeakingRound(skillMaterialOf([many]), "vocabulary").length, ENGLISH_ROUND_SIZE);
});

test("a section without material is reported as empty", () => {
  assert.equal(hasSkillMaterial(skillMaterialOf([first]), "dialogue"), false);
});

test("a word question asks the meaning and offers it among other words' meanings", () => {
  const [question] = wordQuestionsOf([talking], () => 0.4);
  assert.ok(question.prompt.includes("castle") && question.correct === "nghĩa 0" && question.options.includes("nghĩa 0") && question.options.length === 4 && question.lessonId === talking.id);
});

// The English study dashboard (lib/englishDashboard.ts).
import { englishFocusUnit, englishNextStep, englishTodayPlan, englishUnitsOfLevel } from "../src/lib/englishDashboard.ts";

const dashLesson = (slug, completed = false, allowed = true) => ({ slug, title: `Lesson ${slug}`, allowed, completed });
const dashUnit = (number, changes = {}) => ({
  id: `english-a2-unit-${number}`, number, title: `Unit ${number}`, allowed: true, completed: false, completedLessons: 0, totalLessons: 2,
  assessmentUnlocked: false, assessmentPassed: false, lessons: [dashLesson(`a2-unit-${number}-one`), dashLesson(`a2-unit-${number}-two`, false, false)], ...changes,
});

test("the dashboard only shows the chosen level's units", () => {
  const units = [dashUnit(1), { ...dashUnit(1), id: "english-b1-unit-1" }, { ...dashUnit(2), isPlaceholder: true }];
  assert.deepEqual(englishUnitsOfLevel(units, "A2").map(unit => unit.id), ["english-a2-unit-1"]);
});

test("the next step is the first open lesson of the first unfinished unit", () => {
  const step = englishNextStep([dashUnit(1, { completed: true }), dashUnit(2)]);
  assert.deepEqual([step.kind, step.href], ["lesson", "/lessons/english/a2-unit-2-one"]);
});

test("once a unit's lessons are done, the next step is its unit test", () => {
  const step = englishNextStep([dashUnit(1, { assessmentUnlocked: true })]);
  assert.deepEqual([step.kind, step.href], ["assessment", "/quizzes/english-a2-unit-1"]);
});

test("a finished level sends the learner to choose the next one", () => {
  assert.equal(englishNextStep([dashUnit(1, { completed: true })]).kind, "level-complete");
});

test("the unit to review is the one in progress", () => {
  const units = [dashUnit(1, { completed: true, completedLessons: 2 }), dashUnit(2, { completedLessons: 1 }), dashUnit(3)];
  assert.equal(englishFocusUnit(units)?.number, 2);
});

test("today's plan has the next lesson, flashcards, a review and a skill that changes by day", () => {
  const units = [dashUnit(1, { completedLessons: 1 })];
  const plan = (day) => englishTodayPlan(englishNextStep(units), englishFocusUnit(units), 3, day).map(item => item.href);
  assert.deepEqual([plan(0), plan(1)[3]], [["/lessons/english/a2-unit-1-one", "/english/flashcards", "/english/review?unit=english-a2-unit-1", "/english/listening?unit=english-a2-unit-1"], "/english/speaking?unit=english-a2-unit-1"]);
});

test("flashcards are left out of the plan when none are due", () => {
  assert.equal(englishTodayPlan({ kind: "nothing-open", href: "/lessons" }, undefined, 0, 0).length, 0);
});
