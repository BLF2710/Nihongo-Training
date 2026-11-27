import type { EnglishLevel, EnglishLessonSummary, EnglishUnit, EnglishWord, GrammarPoint, Question } from "../../../shared/course/english/schema.ts";

// The English study tools (vocabulary, grammar, flashcards, review) reuse the lessons' own content: nothing here is
// copied into a second catalogue. Review lessons only revisit their unit's words, so the reference pages and the
// flashcard deck leave them out and every word appears once, under the lesson that teaches it.

/** Where a word or grammar point is taught. */
export type StudySource = { lessonId: string; lessonSlug: string; lessonTitle: string; lessonNumber: number; unitId: string; unitNumber: number; level: EnglishLevel };
export type StudyWord = EnglishWord & StudySource & { id: string };
export type StudyGrammarPoint = GrammarPoint & StudySource & { id: string };
/** A practice question from a lesson, with the lesson it comes from. */
export type StudyQuestion = Question & StudySource & { id: string };

/** A word's flashcard id: `<lesson id>:<word>`, the form the server accepts for words of completed lessons. */
export const englishWordId = (lessonId: string, word: string) => `${lessonId}:${word}`;
export const isEnglishItemId = (itemId: string) => itemId.startsWith("english-");

const teachingLessons = (lessons: readonly EnglishLessonSummary[]) => lessons.filter(lesson => !lesson.isReview);

const sourceOf = (lesson: EnglishLessonSummary): StudySource => ({
  lessonId: lesson.id, lessonSlug: lesson.slug, lessonTitle: lesson.title, lessonNumber: lesson.lessonNumber,
  unitId: lesson.unitId, unitNumber: lesson.unitNumber, level: lesson.level,
});

/** Every word the course teaches, in course order. */
export function studyWordsOf(lessons: readonly EnglishLessonSummary[]): StudyWord[] {
  return teachingLessons(lessons).flatMap(lesson => lesson.vocabulary.map(word => ({ ...word, ...sourceOf(lesson), id: englishWordId(lesson.id, word.word) })));
}

/** Every grammar point the course teaches, in course order. */
export function studyGrammarOf(lessons: readonly EnglishLessonSummary[]): StudyGrammarPoint[] {
  return teachingLessons(lessons).flatMap(lesson => lesson.grammar.map((point, index) => ({ ...point, ...sourceOf(lesson), id: `${lesson.id}:grammar-${index + 1}` })));
}

/** The units of one level, in course order. */
export const unitsOfLevel = (units: readonly EnglishUnit[], level: EnglishLevel) =>
  units.filter(unit => unit.level === level && unit.published).toSorted((a, b) => a.number - b.number);

// Vietnamese is searched without its tone marks, so "bat binh dang" finds "bất bình đẳng".
const DIACRITICS = /\p{M}/gu;
export const foldForSearch = (text: string) => text.normalize("NFD").replace(DIACRITICS, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/** Words whose English, Vietnamese meaning or definition contains the query. An empty query matches everything. */
export function searchWords<T extends EnglishWord>(words: readonly T[], query: string): T[] {
  const folded = foldForSearch(query);
  if (!folded) return [...words];
  return words.filter(word => [word.word, word.vietnamese, word.definition].some(text => foldForSearch(text).includes(folded)));
}

/** The flashcard ids of the words in the learner's completed lessons. */
export function englishDeckItemIds(lessons: readonly EnglishLessonSummary[], completedLessonIds: ReadonlySet<string>): string[] {
  return studyWordsOf(lessons.filter(lesson => completedLessonIds.has(lesson.id))).map(word => word.id);
}

/** Practice and challenge questions of the given lessons, each with a stable id. */
export function studyQuestionsOf(lessons: readonly (EnglishLessonSummary & { practice: readonly Question[]; challenge: readonly Question[] })[]): StudyQuestion[] {
  return lessons.flatMap(lesson => [
    ...lesson.practice.map((question, index) => ({ ...question, ...sourceOf(lesson), id: `${lesson.id}:practice-${index + 1}` })),
    ...lesson.challenge.map((question, index) => ({ ...question, ...sourceOf(lesson), id: `${lesson.id}:challenge-${index + 1}` })),
  ]);
}

const WORD_QUESTION_OPTIONS = 4;

/** A "What does … mean?" question for every word the lessons teach, its other options the meanings of other words
 *  among them, so a review covers the words as well as the lessons' own questions. */
export function wordQuestionsOf(lessons: readonly EnglishLessonSummary[], random: () => number = Math.random): StudyQuestion[] {
  const words = studyWordsOf(lessons);
  const meanings = [...new Set(words.map(word => word.vietnamese))];
  return words.map(({ lessonId, lessonSlug, lessonTitle, lessonNumber, unitId, unitNumber, level, ...word }) => ({
    lessonId, lessonSlug, lessonTitle, lessonNumber, unitId, unitNumber, level, id: `${lessonId}:word:${word.word}`,
    prompt: `What does “${word.word}” mean?`, correct: word.vietnamese, explanation: `${word.word} ${word.ipa}: ${word.definition}`,
    options: pickRandom([word.vietnamese, ...pickRandom(meanings.filter(meaning => meaning !== word.vietnamese), WORD_QUESTION_OPTIONS - 1, random)], WORD_QUESTION_OPTIONS, random),
  }));
}

/** A random selection of `count` items, in random order; `random` returns numbers in [0, 1). */
export function pickRandom<T>(items: readonly T[], count: number, random: () => number = Math.random): T[] {
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return pool.slice(0, Math.max(0, count));
}

/** What the statistics page shows for one English level. */
export type EnglishLevelProgress = { level: EnglishLevel; lessonsDone: number; lessonsTotal: number; unitsDone: number; unitsTotal: number };
type UnitProgress = { id: string; isPlaceholder?: boolean; completed: boolean; completedLessons: number; totalLessons: number };

/** Lessons and units completed in each English level, in course order; levels without units are left out. */
export function englishProgressByLevel(units: readonly UnitProgress[], levels: readonly EnglishLevel[]): EnglishLevelProgress[] {
  return levels.flatMap(level => {
    const prefix = `english-${level.toLowerCase()}-unit-`;
    const inLevel = units.filter(unit => unit.id.startsWith(prefix) && !unit.isPlaceholder);
    if (!inLevel.length) return [];
    const sum = (count: (unit: UnitProgress) => number) => inLevel.reduce((total, unit) => total + count(unit), 0);
    return [{ level, lessonsDone: sum(unit => unit.completedLessons), lessonsTotal: sum(unit => unit.totalLessons), unitsDone: inLevel.filter(unit => unit.completed).length, unitsTotal: inLevel.length }];
  });
}
