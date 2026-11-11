// The vowel circle a → i → u → e → o → a: each vowel beats the next one. A word's vowel is its last kana's.
import { kanaByCharacter } from "./gojuon.ts";
import type { Vowel } from "./gojuon.ts";

export const VOWEL_CIRCLE: readonly Vowel[] = ["a", "i", "u", "e", "o"];
export type Matchup = "strong" | "neutral" | "weak";
export const MATCHUP_MULTIPLIER: Readonly<Record<Matchup, number>> = { strong: 1.5, neutral: 1, weak: 0.5 };

const next = (vowel: Vowel) => VOWEL_CIRCLE[(VOWEL_CIRCLE.indexOf(vowel) + 1) % VOWEL_CIRCLE.length];

/** How an attack of one vowel fares against a defender of another; ん (no vowel) is always neutral. */
export function matchup(attacker: Vowel | null, defender: Vowel | null): Matchup {
  if (!attacker || !defender) return "neutral";
  if (next(attacker) === defender) return "strong";
  if (next(defender) === attacker) return "weak";
  return "neutral";
}

/** The vowel the word counts as: its last kana's, or null for a word ending in ん. */
export function vowelOfWord(word: string): Vowel | null {
  const last = [...word].at(-1);
  return last ? kanaByCharacter(last)?.vowel ?? null : null;
}

/** The vowel that this one beats, and the one that beats it, for explaining a matchup. */
export const beatenBy = (vowel: Vowel) => VOWEL_CIRCLE[(VOWEL_CIRCLE.indexOf(vowel) + VOWEL_CIRCLE.length - 1) % VOWEL_CIRCLE.length];
export const beats = next;
