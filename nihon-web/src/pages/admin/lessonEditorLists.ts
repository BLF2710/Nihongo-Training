import { button } from './adminData';

// Helpers the lesson editors' list fields share.

export const small = button.replace('px-4 py-2', 'px-2 py-1');

/** A question as an editor changes it; both courses' questions have this shape (the English course's lists are read-only). */
export type EditableQuestion = { prompt: string; options: string[]; correct: string; explanation: string };
export type QuestionShape = Readonly<{ prompt: string; options: readonly string[]; correct: string; explanation: string }>;
export const editableQuestion = (question: QuestionShape): EditableQuestion => ({ ...question, options: [...question.options] });

export function move<T>(items: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return [...items];
  const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
  return next;
}
export const replace = <T,>(items: readonly T[], index: number, item: T) => items.map((current, at) => at === index ? item : current);
