import type { BankQuestion, BankQuestionType, QuestionContent } from "../../api/admin";

// One entry per kind of question the bank supports: its name, a blank form, and a ready-made example.
export const QUESTION_KINDS: Record<BankQuestionType, { label: string; description: string; blank: QuestionContent; example: QuestionContent }> = {
  multiple_choice: {
    label: "Multiple choice", description: "A prompt with two to six options and one correct answer.",
    blank: { prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    example: { prompt: "Which greeting do you use in the morning?", options: ["おはようございます", "こんばんは", "またね", "すみません"], correctIndex: 0, explanation: "おはようございます is the polite morning greeting." },
  },
  word_match: {
    label: "Word match", description: "Two to eight pairs. Learners match each word to its partner.",
    blank: { prompt: "", pairs: [{ left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }] },
    example: { prompt: "Match each word with its meaning.", pairs: [{ left: "ねこ", right: "cat" }, { left: "いぬ", right: "dog" }, { left: "とり", right: "bird" }, { left: "さかな", right: "fish" }] },
  },
  word_scramble: {
    label: "Word scramble", description: "One word shown with its letters shuffled, plus a hint.",
    blank: { answer: "", hint: "" },
    example: { answer: "ともだち", hint: "friend" },
  },
};
export const QUESTION_TYPES = Object.keys(QUESTION_KINDS) as BankQuestionType[];

/** A one-line description of a question for lists. */
export function summarize(question: Pick<BankQuestion, "content">): string {
  const content = question.content;
  if ("options" in content) return content.prompt;
  if ("pairs" in content) return content.pairs.map(pair => `${pair.left} = ${pair.right}`).join(" · ");
  return `${content.answer} — ${content.hint}`;
}
