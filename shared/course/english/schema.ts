// The English course's content, as the importer writes it (shared/course/english/*.json) and the site reads it.
// The course is for Vietnamese speakers improving their English: every word and grammar point carries both an English
// and a Vietnamese explanation, and the grammar is shown in English first (docs/ENGLISH.md). British English
// throughout. Type-only on the site; the importer (scripts/english-course) also uses the constants.

/** CEFR levels, in course order: an A2 refresher, then B1 to C1. Ids carry them: `english-a2-unit-1-…`. */
export const ENGLISH_LEVELS = ["A2", "B1", "B2", "C1"] as const;
export type EnglishLevel = typeof ENGLISH_LEVELS[number];

export const PARTS_OF_SPEECH = [
  "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "determiner",
  "phrasal verb", "phrase", "collocation", "idiom",
] as const;
export type PartOfSpeech = typeof PARTS_OF_SPEECH[number];

/** One piece of text in both languages. */
export type Bilingual = { english: string; vietnamese: string };

/** A word or phrase: how it sounds (British IPA between slashes), what it means in Vietnamese, a short English
 *  definition, and a sentence using it. */
export type EnglishWord = {
  word: string; ipa: string; partOfSpeech: PartOfSpeech; vietnamese: string; definition: string; example: Bilingual;
};

/** A typical error and its fix, with the reason in both languages. */
export type CommonMistake = { wrong: string; right: string; why: Bilingual };

export type GrammarPoint = {
  title: string; pattern: string; explanation: Bilingual; examples: readonly Bilingual[]; mistake?: CommonMistake;
};

export type DialogueLine = { speaker: string } & Bilingual;

export type Question = { prompt: string; options: readonly string[]; correct: string; explanation: string };

/** What every page listing lessons needs; the lesson page also loads the body. */
export type EnglishLessonSummary = {
  id: string; slug: string; unitId: string; level: EnglishLevel; unitNumber: number; lessonNumber: number; isReview: boolean;
  title: string; titleVi: string;
  vocabulary: readonly EnglishWord[]; grammar: readonly GrammarPoint[]; examples: readonly Bilingual[]; dialogue: readonly DialogueLine[];
};
export type EnglishLessonBody = { objectives: readonly string[]; practice: readonly Question[]; challenge: readonly Question[] };
export type EnglishLesson = EnglishLessonSummary & EnglishLessonBody;

export type EnglishUnit = {
  id: string; level: EnglishLevel; number: number; sequence: number; title: string; titleVi: string; description: string;
  lessonIds: readonly string[]; assessmentId: string; published: boolean;
};

/** Assessment questions keep their answer on the server (nihon-api/src/data/imported-english-assessments.json). */
export type EnglishAssessmentQuestion = { id: string; prompt: string; options: readonly string[]; correctIndex: number; explanation: string };
export type EnglishAssessment = { id: string; passPercent: number; questions: readonly EnglishAssessmentQuestion[] };

/** An end-of-level practice exam (shared/course/english/mock-exams.json). Its answers are public, like the lessons':
 *  the server grades it only so the result and its mistakes are saved. */
export type EnglishMockQuestion = { id: string; prompt: string; options: readonly string[]; correctIndex: number; explanation: string };
export type EnglishMockGroup = { instruction: string; passage?: string; questions: readonly EnglishMockQuestion[] };
export type EnglishMockSection = { id: string; title: string; titleVi: string; groups: readonly EnglishMockGroup[] };
export type EnglishMockExam = {
  id: string; level: EnglishLevel; title: string; minutes: number; passPercent: number; sectionMinPercent: number; sections: readonly EnglishMockSection[];
};
