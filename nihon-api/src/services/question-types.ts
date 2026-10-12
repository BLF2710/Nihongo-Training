import type { BankQuestionType } from "../repositories/question-bank.repository";
import { shuffled } from "../utils/random";

export type MultipleChoiceContent = { prompt: string; options: string[]; correctIndex: number; explanation?: string };
export type WordMatchContent = { prompt?: string; pairs: { left: string; right: string }[] };
export type WordScrambleContent = { answer: string; hint: string };

/** What the learner sees: never contains the answer. */
export type PresentedQuestion =
  | { type: "multiple_choice"; prompt: string; options: string[] }
  | { type: "word_match"; prompt: string; left: string[]; right: string[] }
  | { type: "word_scramble"; hint: string; letters: string[] };
export type Graded = { correct: boolean; solution: string; explanation?: string };

// Everything the bank needs to know about one kind of question. Add a kind by adding an entry.
type QuestionType<Content> = {
  /** Cleaned content, or null when the admin's input is not a valid question of this kind. */
  parse(input: Record<string, unknown>): Content | null;
  present(content: Content): PresentedQuestion;
  /** Null when the submitted answer has the wrong shape for this kind. */
  grade(content: Content, answer: unknown): Graded | null;
};

const text = (value: unknown, max: number) => typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : null;
const allDistinct = (values: string[]) => new Set(values).size === values.length;
const sameText = (a: string, b: string) => a.normalize("NFKC").trim().toLowerCase() === b.normalize("NFKC").trim().toLowerCase();

const multipleChoice: QuestionType<MultipleChoiceContent> = {
  parse(input) {
    const prompt = text(input.prompt, 300);
    const options = Array.isArray(input.options) ? input.options.map(option => text(option, 120)) : [];
    const correctIndex = input.correctIndex;
    if (!prompt || options.length < 2 || options.length > 6 || options.some(option => !option) || !allDistinct(options as string[])) return null;
    if (typeof correctIndex !== "number" || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) return null;
    const explanation = input.explanation === undefined || input.explanation === "" ? undefined : text(input.explanation, 300);
    if (explanation === null) return null;
    return { prompt, options: options as string[], correctIndex, ...(explanation ? { explanation } : {}) };
  },
  present: ({ prompt, options }) => ({ type: "multiple_choice", prompt, options }),
  grade(content, answer) {
    if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= content.options.length) return null;
    return { correct: answer === content.correctIndex, solution: content.options[content.correctIndex], explanation: content.explanation };
  },
};

const wordMatch: QuestionType<WordMatchContent> = {
  parse(input) {
    const pairs = Array.isArray(input.pairs) ? input.pairs.map(pair => ({ left: text(pair?.left, 60), right: text(pair?.right, 60) })) : [];
    if (pairs.length < 2 || pairs.length > 8 || pairs.some(pair => !pair.left || !pair.right)) return null;
    const clean = pairs as { left: string; right: string }[];
    if (!allDistinct(clean.map(pair => pair.left)) || !allDistinct(clean.map(pair => pair.right))) return null;
    const prompt = input.prompt === undefined || input.prompt === "" ? undefined : text(input.prompt, 200);
    if (prompt === null) return null;
    return { ...(prompt ? { prompt } : {}), pairs: clean };
  },
  present: ({ prompt, pairs }) => ({
    type: "word_match", prompt: prompt ?? "Match each word with its meaning.",
    left: pairs.map(pair => pair.left), right: shuffled(pairs.map(pair => pair.right)),
  }),
  // The answer lists the chosen right-hand item for each left-hand item, in the order they were presented.
  grade(content, answer) {
    if (!Array.isArray(answer) || answer.length !== content.pairs.length || answer.some(item => typeof item !== "string")) return null;
    return {
      correct: content.pairs.every((pair, index) => pair.right === answer[index]),
      solution: content.pairs.map(pair => `${pair.left} = ${pair.right}`).join(" · "),
    };
  },
};

const wordScramble: QuestionType<WordScrambleContent> = {
  parse(input) {
    const answer = text(input.answer, 20);
    const hint = text(input.hint, 200);
    if (!answer || !hint || [...answer].length < 2 || /\s/.test(answer)) return null;
    return { answer, hint };
  },
  present({ answer, hint }) {
    const original = [...answer];
    let letters = shuffled(original);
    // A word whose letters are all the same cannot be scrambled; anything else must not be shown solved.
    for (let attempt = 0; attempt < 10 && letters.join("") === answer && new Set(original).size > 1; attempt++) letters = shuffled(original);
    return { type: "word_scramble", hint, letters };
  },
  grade(content, answer) {
    if (typeof answer !== "string") return null;
    return { correct: sameText(answer, content.answer), solution: content.answer };
  },
};

export const QUESTION_TYPES = { multiple_choice: multipleChoice, word_match: wordMatch, word_scramble: wordScramble } as const;
export const isQuestionType = (value: unknown): value is BankQuestionType => typeof value === "string" && value in QUESTION_TYPES;
// Stored content was validated by `parse` when it was saved.
export const questionType = (type: BankQuestionType) => QUESTION_TYPES[type] as QuestionType<unknown>;
