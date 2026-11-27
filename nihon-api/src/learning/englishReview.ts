// The English review (/english/review): rounds of questions drawn from the learner's completed English lessons (their
// practice and challenge questions, and "What does … mean?" for every word they teach), for one unit or a whole level,
// graded here on the server. Pure: the service passes in the lessons and the randomness.

/** What a review needs of an English lesson (shared/course/english/lessons.json, with any published edit applied). */
export type ReviewLesson = {
  id: string; unitId: string; level: string; unitNumber: number; title: string; isReview: boolean;
  vocabulary: readonly { word: string; ipa: string; vietnamese: string; definition: string }[];
  practice: readonly ReviewSourceQuestion[]; challenge: readonly ReviewSourceQuestion[];
};
type ReviewSourceQuestion = { prompt: string; options: readonly string[]; correct: string; explanation: string };

/** A question of the review as the browser sees it: no answer. `id` names where it comes from, for grading. */
export type PresentedReviewQuestion = { id: string; prompt: string; options: string[]; lessonId: string; lessonTitle: string; level: string; unitNumber: number };
/** A question with its answer, as it is graded. */
export type ReviewQuestion = PresentedReviewQuestion & { correct: string; explanation: string };

/** A unit (`english-a2-unit-3`) or a whole level (`english-a2`), the cumulative review. */
const SCOPE = /^english-(a2|b1|b2|c1)(-unit-\d{1,2})?$/;
export const QUESTIONS_PER_ROUND = 10;
const WORD_OPTIONS = 4;
/** `<lesson id>:practice-<n>`, `<lesson id>:challenge-<n>` or `<lesson id>:word-<n>`, counted from 1. */
const QUESTION_ID = /^(english-[a-z0-9-]+):(practice|challenge|word)-(\d{1,3})$/;

export const isEnglishReviewScope = (scope: unknown): scope is string => typeof scope === "string" && SCOPE.test(scope);

/** Whether a lesson belongs to the scope: its unit, or its level. */
export const isLessonInScope = (lesson: ReviewLesson, scope: string): boolean =>
  lesson.unitId === scope || lesson.unitId.startsWith(`${scope}-unit-`);

/** A random selection of `count` items, in random order; `random` returns numbers in [0, 1). */
export function pickRandom<T>(items: readonly T[], count: number, random: () => number): T[] {
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return pool.slice(0, Math.max(0, count));
}

const sourceOf = (lesson: ReviewLesson) => ({ lessonId: lesson.id, lessonTitle: lesson.title, level: lesson.level, unitNumber: lesson.unitNumber });

/** Every question a set of lessons gives, with its answer. A word's other options are other words' meanings among
 *  `meanings` (all the lessons reviewed together), chosen with `random`. */
function questionsOf(lesson: ReviewLesson, meanings: readonly string[], random: () => number): ReviewQuestion[] {
  const fromLesson = (kind: "practice" | "challenge") => lesson[kind].map((question, index) => ({
    ...sourceOf(lesson), id: `${lesson.id}:${kind}-${index + 1}`, prompt: question.prompt, options: [...question.options], correct: question.correct, explanation: question.explanation,
  }));
  // A review lesson only revisits its unit's words, which the lessons teaching them already ask.
  const words = (lesson.isReview ? [] : lesson.vocabulary).map((word, index) => ({
    ...sourceOf(lesson), id: `${lesson.id}:word-${index + 1}`, prompt: `What does “${word.word}” mean?`, correct: word.vietnamese,
    explanation: `${word.word} ${word.ipa}: ${word.definition}`,
    options: pickRandom([word.vietnamese, ...pickRandom(meanings.filter(meaning => meaning !== word.vietnamese), WORD_OPTIONS - 1, random)], WORD_OPTIONS, random),
  }));
  return [...fromLesson("practice"), ...fromLesson("challenge"), ...words];
}

/** A round: `QUESTIONS_PER_ROUND` questions drawn from the lessons, without their answers. */
export function drawReviewRound(lessons: readonly ReviewLesson[], random: () => number): PresentedReviewQuestion[] {
  const meanings = [...new Set(lessons.filter(lesson => !lesson.isReview).flatMap(lesson => lesson.vocabulary.map(word => word.vietnamese)))];
  return pickRandom(lessons.flatMap(lesson => questionsOf(lesson, meanings, random)), QUESTIONS_PER_ROUND, random)
    .map(({ correct: _correct, explanation: _explanation, ...presented }) => presented);
}

/** Which lesson a question id names, or null when it isn't a review question's id. */
export function lessonIdOf(questionId: unknown): string | null {
  return typeof questionId === "string" ? QUESTION_ID.exec(questionId)?.[1] ?? null : null;
}

/** The question an id names, with its answer (a word's options drawn from its own lesson's words), or null. */
export function findReviewQuestion(lesson: ReviewLesson, questionId: string, random: () => number): ReviewQuestion | null {
  const meanings = lesson.vocabulary.map(word => word.vietnamese);
  return questionsOf(lesson, meanings, random).find(question => question.id === questionId) ?? null;
}

export type GradedReviewAnswer = { correct: boolean; solution: string; explanation: string };

/** Grades an answer: right when it is the question's answer, exactly. */
export const gradeReviewAnswer = (question: ReviewQuestion, answer: string): GradedReviewAnswer =>
  ({ correct: answer === question.correct, solution: question.correct, explanation: question.explanation });
