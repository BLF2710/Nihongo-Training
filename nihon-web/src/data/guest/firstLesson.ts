import { HIRAGANA_MNEMONICS } from "../kanaMnemonics.ts";

// The guest's first lesson on the Kana island: three hiragana, heard, matched, then read together as a real word.

export type LessonKana = { kana: string; romaji: string; memoryAid: string };
export type LessonWord = { text: string; romaji: string; meaning: string };

const kana = (character: string, romaji: string): LessonKana => ({ kana: character, romaji, memoryAid: HIRAGANA_MNEMONICS[character] ?? "" });

export const FIRST_LESSON_KANA: readonly LessonKana[] = [kana("あ", "a"), kana("い", "i"), kana("う", "u")];

/** The word the learner reads at the end, made only of the kana they just met. */
export const FIRST_LESSON_WORD: LessonWord = { text: "あい", romaji: "ai", meaning: "love" };

/** What the guide says at each step, in Japanese with English beside it. */
export const FIRST_LESSON_LINES = {
  meet: { japanese: "これは あ、い、う。", english: "These are a, i, u. Tap each one to hear it." },
  match: { japanese: "どれ？", english: "Which one did you hear?" },
  read: { japanese: "よめますね！", english: "You can read it already!" },
  name: { japanese: "おなまえは？", english: "What's your name?" },
} as const;
