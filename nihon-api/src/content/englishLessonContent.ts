// The part of an English lesson an administrator can edit, and its validation: the same rules the English importer
// applies (scripts/english-course/validate.ts), so an edited lesson is as sound as one from the course files. The
// shape is shared/course/english/schema.ts's EnglishLesson without its place in the course (id, unit, number).
import { Checker, LIMITS } from "./lessonContent";
import type { LessonContentResult as JapaneseResult } from "./lessonContent";

/** Kept equal to shared/course/english/schema.ts's PARTS_OF_SPEECH (scripts/test-lesson-content.cjs checks it). */
export const ENGLISH_PARTS_OF_SPEECH = [
  "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "determiner",
  "phrasal verb", "phrase", "collocation", "idiom",
] as const;
type PartOfSpeech = typeof ENGLISH_PARTS_OF_SPEECH[number];

type Bilingual = { english: string; vietnamese: string };
type EnglishWord = { word: string; ipa: string; partOfSpeech: PartOfSpeech; vietnamese: string; definition: string; example: Bilingual };
type CommonMistake = { wrong: string; right: string; why: Bilingual };
type GrammarPoint = { title: string; pattern: string; explanation: Bilingual; examples: Bilingual[]; mistake?: CommonMistake };
type Question = { prompt: string; options: string[]; correct: string; explanation: string };
export type EnglishLessonContent = {
  title: string; titleVi: string; objectives: string[]; vocabulary: EnglishWord[]; grammar: GrammarPoint[];
  examples: Bilingual[]; dialogue: ({ speaker: string } & Bilingual)[]; practice: Question[]; challenge: Question[];
};
export type EnglishLessonContentResult = { ok: true; content: EnglishLessonContent } | Extract<JapaneseResult, { ok: false }>;

export const ENGLISH_LESSON_ID_PREFIX = "english-";
export const isEnglishLessonId = (lessonId: string) => lessonId.startsWith(ENGLISH_LESSON_ID_PREFIX);

const MIN_PRACTICE_QUESTIONS = 4, MIN_CHALLENGE_QUESTIONS = 5;
const MIN_OPTIONS = 3, MAX_OPTIONS = 4;
/** British IPA between slashes, as dictionaries print it: /ˈkæsl/. */
const IPA = /^\/[^/\s][^/]*\/$/;
const isPartOfSpeech = (value: string): value is PartOfSpeech => ENGLISH_PARTS_OF_SPEECH.some(part => part === value);

/** The English course's own rules on top of the shared checks. */
class EnglishChecker extends Checker {
  bilingual(value: unknown, path: string, max: number = LIMITS.shortText): Bilingual {
    const raw = this.record(value, path);
    const english = this.text(raw.english, `${path}: English`, { max }), vietnamese = this.text(raw.vietnamese, `${path}: Vietnamese`, { max });
    if (english && english === vietnamese) this.fail(path, "the Vietnamese is the same as the English");
    return { english, vietnamese };
  }

  word(value: unknown, path: string): EnglishWord {
    const raw = this.record(value, path);
    const ipa = this.text(raw.ipa, `${path}: IPA`);
    if (ipa && !IPA.test(ipa)) this.fail(`${path}: IPA`, "must be written between slashes, like /ˈkæsl/");
    const partOfSpeech = this.text(raw.partOfSpeech, `${path}: part of speech`);
    if (partOfSpeech && !isPartOfSpeech(partOfSpeech)) this.fail(`${path}: part of speech`, `must be one of: ${ENGLISH_PARTS_OF_SPEECH.join(", ")}`);
    return {
      word: this.text(raw.word, `${path}: word`), ipa, partOfSpeech: isPartOfSpeech(partOfSpeech) ? partOfSpeech : ENGLISH_PARTS_OF_SPEECH[0], // only kept when valid: an error was recorded otherwise
      vietnamese: this.text(raw.vietnamese, `${path}: Vietnamese`), definition: this.text(raw.definition, `${path}: definition`),
      example: this.bilingual(raw.example, `${path}: example`),
    };
  }

  grammar(value: unknown, path: string): GrammarPoint {
    const raw = this.record(value, path);
    const mistake = raw.mistake === undefined ? undefined : this.mistake(raw.mistake, `${path}: common mistake`);
    return {
      title: this.text(raw.title, `${path}: title`), pattern: this.text(raw.pattern, `${path}: pattern`),
      explanation: this.bilingual(raw.explanation, `${path}: explanation`, LIMITS.longText),
      examples: this.list(raw.examples, `${path}: examples`, (example, examplePath) => this.bilingual(example, examplePath), { min: 1 }),
      ...(mistake ? { mistake } : {}),
    };
  }

  mistake(value: unknown, path: string): CommonMistake {
    const raw = this.record(value, path);
    return { wrong: this.text(raw.wrong, `${path}: wrong`), right: this.text(raw.right, `${path}: right`), why: this.bilingual(raw.why, `${path}: why`, LIMITS.longText) };
  }

  dialogueLine(value: unknown, path: string): { speaker: string } & Bilingual {
    const raw = this.record(value, path);
    return { speaker: this.text(raw.speaker, `${path}: speaker`), ...this.bilingual(raw, path) };
  }

  englishQuestion(value: unknown, path: string): Question {
    const question = this.question(value, path);
    if (question.options.length < MIN_OPTIONS || question.options.length > MAX_OPTIONS) this.fail(`${path}: options`, `needs ${MIN_OPTIONS} or ${MAX_OPTIONS}`);
    return question;
  }

  questions(value: unknown, path: string, min: number): Question[] {
    return this.list(value, path, (item, itemPath) => this.englishQuestion(item, itemPath), { min, max: LIMITS.questions });
  }
}

/** Checks edited English lesson content and returns it cleaned (trimmed, NFC), or every problem found. */
export function parseEnglishLessonContent(value: unknown): EnglishLessonContentResult {
  const check = new EnglishChecker();
  const raw = check.record(value, "lesson");
  const content: EnglishLessonContent = {
    title: check.text(raw.title, "title"), titleVi: check.text(raw.titleVi, "Vietnamese title"),
    objectives: check.list(raw.objectives, "objective", (item, path) => check.text(item, path), { min: 1 }),
    vocabulary: check.list(raw.vocabulary, "word", (item, path) => check.word(item, path), { min: 1 }),
    grammar: check.list(raw.grammar, "grammar point", (item, path) => check.grammar(item, path)),
    examples: check.list(raw.examples, "example", (item, path) => check.bilingual(item, path)),
    dialogue: check.list(raw.dialogue, "dialogue line", (item, path) => check.dialogueLine(item, path)),
    practice: check.questions(raw.practice, "practice", MIN_PRACTICE_QUESTIONS),
    challenge: check.questions(raw.challenge, "challenge", MIN_CHALLENGE_QUESTIONS),
  };
  return check.errors.length ? { ok: false, errors: check.errors } : { ok: true, content };
}
