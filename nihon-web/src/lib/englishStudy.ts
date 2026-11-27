import type { EnglishLevel, EnglishLessonSummary, EnglishUnit, EnglishWord, GrammarPoint } from "../../../shared/course/english/schema.ts";

// The English study tools (vocabulary, grammar, flashcards) reuse the lessons' own content: nothing here is
// copied into a second catalogue. Review lessons only revisit their unit's words, so the reference pages and the
// flashcard deck leave them out and every word appears once, under the lesson that teaches it.

/** Where a word or grammar point is taught. */
export type StudySource = { lessonId: string; lessonSlug: string; lessonTitle: string; lessonNumber: number; unitId: string; unitNumber: number; level: EnglishLevel };
export type StudyWord = EnglishWord & StudySource & { id: string };
export type StudyGrammarPoint = GrammarPoint & StudySource & { id: string };

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

/** One row of the server's English practice summary: a kind's sessions in a level. */
export type EnglishPracticeRow = { kind: string; level: string; sessions: number; answered: number; correct: number };
export const ENGLISH_PRACTICE_KINDS = ["listening", "speaking", "review"] as const;
export type EnglishPracticeKind = (typeof ENGLISH_PRACTICE_KINDS)[number];
export type EnglishPracticeOfKind = { kind: EnglishPracticeKind; sessions: number; accuracyPercent: number };

/** A level's listening, speaking and review rounds, in that order, leaving out the kinds not yet practised there. */
export function englishPracticeOfLevel(rows: readonly EnglishPracticeRow[], level: EnglishLevel): EnglishPracticeOfKind[] {
  return ENGLISH_PRACTICE_KINDS.flatMap(kind => {
    const row = rows.find(item => item.kind === kind && item.level === level);
    if (!row || row.sessions === 0) return [];
    return [{ kind, sessions: row.sessions, accuracyPercent: row.answered ? Math.round((row.correct / row.answered) * 100) : 0 }];
  });
}
