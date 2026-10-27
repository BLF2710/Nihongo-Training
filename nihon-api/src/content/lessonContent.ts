// The part of a lesson an administrator can edit, and its validation. Furigana is written as in the course files
// (<ruby>漢字<rt>かんじ</rt></ruby>); text is stored as entered and shown through the site's furigana renderer.

export type Question = { prompt: string; options: string[]; correct: string; explanation: string };
export type GrammarPoint = { title: string; pattern: string; explanation: string; examples: { japanese: string; romaji: string; meaning: string }[]; notes?: string[] };
export type ReadingPassage = { genre: string; text: string; translation: string; questions: Question[] };
export type LessonContent = {
  title: string; titleJp?: string; objectives: string[];
  /** [word, romaji (may be empty), meaning] */
  vocabulary: [string, string, string][];
  concept: { title: string; text: string; examples: string[] };
  /** [Japanese, translation] */
  examples: [string, string][];
  /** [speaker A, line A, speaker B, line B] */
  dialogue: [string, string, string, string][];
  grammar?: GrammarPoint[];
  reading?: ReadingPassage;
  practice: Question[];
  challenge: Question[];
};
export type LessonContentResult = { ok: true; content: LessonContent } | { ok: false; errors: string[] };

const LIMITS = { shortText: 300, longText: 3000, listItems: 40, questions: 20, minOptions: 2, maxOptions: 6 } as const;

// Collects every problem with a path such as "practice 2: correct answer", so the editor can show them all at once.
class Checker {
  readonly errors: string[] = [];
  fail(path: string, message: string) { this.errors.push(`${path}: ${message}`); }

  text(value: unknown, path: string, options: { max?: number; optional?: boolean } = {}): string {
    const max = options.max ?? LIMITS.shortText;
    if (typeof value !== "string") { this.fail(path, "must be text"); return ""; }
    const text = value.normalize("NFC").trim();
    if (!text && !options.optional) this.fail(path, "is required");
    if (text.length > max) this.fail(path, `must be at most ${max} characters`);
    return text;
  }

  list<T>(value: unknown, path: string, item: (entry: unknown, itemPath: string) => T, options: { min?: number; max?: number } = {}): T[] {
    if (!Array.isArray(value)) { this.fail(path, "must be a list"); return []; }
    const min = options.min ?? 0, max = options.max ?? LIMITS.listItems;
    if (value.length < min) this.fail(path, `needs at least ${min}`);
    if (value.length > max) this.fail(path, `can have at most ${max}`);
    return value.slice(0, max).map((entry, index) => item(entry, `${path} ${index + 1}`));
  }

  tuple<N extends number>(value: unknown, path: string, labels: string[] & { length: N }, optional: number[] = []): string[] {
    if (!Array.isArray(value) || value.length !== labels.length) { this.fail(path, `must have ${labels.length} parts`); return labels.map(() => ""); }
    return labels.map((label, index) => this.text(value[index], `${path}: ${label}`, { optional: optional.includes(index) }));
  }

  record(value: unknown, path: string): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) { this.fail(path, "is missing"); return {}; }
    return value as Record<string, unknown>;
  }

  question(value: unknown, path: string): Question {
    const raw = this.record(value, path);
    const prompt = this.text(raw.prompt, `${path}: prompt`, { max: LIMITS.longText });
    const options = this.list(raw.options, `${path}: options`, (option, optionPath) => this.text(option, optionPath), { min: LIMITS.minOptions, max: LIMITS.maxOptions });
    const correct = this.text(raw.correct, `${path}: correct answer`);
    const explanation = this.text(raw.explanation, `${path}: explanation`, { max: LIMITS.longText, optional: true });
    if (new Set(options).size !== options.length) this.fail(`${path}: options`, "must all be different");
    if (correct && !options.includes(correct)) this.fail(`${path}: correct answer`, "must be one of the options");
    return { prompt, options, correct, explanation };
  }

  grammarPoint(value: unknown, path: string): GrammarPoint {
    const raw = this.record(value, path);
    const notes = raw.notes === undefined ? undefined : this.list(raw.notes, `${path}: notes`, (note, notePath) => this.text(note, notePath, { max: LIMITS.longText }));
    return {
      title: this.text(raw.title, `${path}: title`), pattern: this.text(raw.pattern, `${path}: pattern`),
      explanation: this.text(raw.explanation, `${path}: explanation`, { max: LIMITS.longText }),
      examples: this.list(raw.examples, `${path}: examples`, (example, examplePath) => {
        const entry = this.record(example, examplePath);
        return { japanese: this.text(entry.japanese, `${examplePath}: Japanese`), romaji: this.text(entry.romaji, `${examplePath}: romaji`, { optional: true }), meaning: this.text(entry.meaning, `${examplePath}: meaning`) };
      }),
      ...(notes ? { notes } : {}),
    };
  }

  reading(value: unknown, path: string): ReadingPassage {
    const raw = this.record(value, path);
    return {
      genre: this.text(raw.genre, `${path}: genre`), text: this.text(raw.text, `${path}: text`, { max: LIMITS.longText }),
      translation: this.text(raw.translation, `${path}: translation`, { max: LIMITS.longText }),
      questions: this.list(raw.questions, `${path}: questions`, (question, questionPath) => this.question(question, questionPath), { min: 1, max: LIMITS.questions }),
    };
  }
}

/** Checks edited lesson content and returns it cleaned (trimmed, NFC), or every problem found. */
export function parseLessonContent(value: unknown): LessonContentResult {
  const check = new Checker();
  const raw = check.record(value, "lesson");
  const concept = check.record(raw.concept, "concept");
  const titleJp = raw.titleJp === undefined ? undefined : check.text(raw.titleJp, "Japanese title", { optional: true });
  const content: LessonContent = {
    title: check.text(raw.title, "title"),
    ...(titleJp ? { titleJp } : {}),
    objectives: check.list(raw.objectives, "objective", (item, path) => check.text(item, path), { min: 1 }),
    vocabulary: check.list(raw.vocabulary, "word", (item, path) => check.tuple(item, path, ["word", "romaji", "meaning"], [1]) as [string, string, string], { min: 1 }),
    concept: {
      title: check.text(concept.title, "concept: title"), text: check.text(concept.text, "concept: text", { max: LIMITS.longText }),
      examples: check.list(concept.examples, "concept example", (item, path) => check.text(item, path)),
    },
    examples: check.list(raw.examples, "example", (item, path) => check.tuple(item, path, ["Japanese", "translation"]) as [string, string]),
    dialogue: check.list(raw.dialogue, "dialogue line", (item, path) => check.tuple(item, path, ["speaker A", "line A", "speaker B", "line B"]) as [string, string, string, string]),
    ...(raw.grammar === undefined ? {} : { grammar: check.list(raw.grammar, "grammar point", (item, path) => check.grammarPoint(item, path)) }),
    ...(raw.reading === undefined || raw.reading === null ? {} : { reading: check.reading(raw.reading, "reading") }),
    practice: check.list(raw.practice, "practice", (item, path) => check.question(item, path), { min: 1, max: LIMITS.questions }),
    challenge: check.list(raw.challenge, "challenge", (item, path) => check.question(item, path), { min: 1, max: LIMITS.questions }),
  };
  return check.errors.length ? { ok: false, errors: check.errors } : { ok: true, content };
}
