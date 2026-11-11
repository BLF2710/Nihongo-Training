// The hand of words dealt for each attack turn (instead of always offering the strongest words). Slots make sure
// every hand has words worth having for different reasons; any slot with no candidates is filled at random.
import { shuffle } from "../random.ts";
import type { Vowel } from "./gojuon.ts";
import { matchup, vowelOfWord } from "./vowelCircle.ts";
import type { BattleWord } from "./words.ts";

export const HAND_SIZE = 8;
/** Words this short (in kana) fill the "short" slot, so the everyday basics stay in play. */
export const SHORT_WORD_LENGTH = 2;

export type HandSource = {
  /** Every word the player can spell. */
  words: readonly BattleWord[];
  enemyVowel: Vowel | null;
  /** Words opened by the player's latest catches. */
  newWords: ReadonlySet<string>;
  /** Words the player has read wrong before. */
  missedWords: ReadonlySet<string>;
  /** Words to leave out when possible: the ones already played this battle. */
  recentlyPlayed: ReadonlySet<string>;
};

type Slot = { count: number; fits: (word: BattleWord, source: HandSource) => boolean };

/** In dealing order. Whatever is left of the hand after them is dealt from any word. */
const SLOTS: readonly Slot[] = [
  { count: 2, fits: (word, { enemyVowel }) => matchup(vowelOfWord(word.japanese), enemyVowel) === "strong" },
  { count: 1, fits: (word, { newWords }) => newWords.has(word.japanese) },
  { count: 1, fits: (word, { missedWords }) => missedWords.has(word.japanese) },
  { count: 1, fits: word => [...word.japanese].length <= SHORT_WORD_LENGTH },
];

export function dealHand(source: HandSource, random: () => number): BattleWord[] {
  if (source.words.length <= HAND_SIZE) return [...source.words];
  const fresh = source.words.filter(word => !source.recentlyPlayed.has(word.japanese));
  // Words played this battle come back only when there aren't enough fresh ones.
  const deck = [...shuffle(fresh, random), ...shuffle(source.words.filter(word => source.recentlyPlayed.has(word.japanese)), random)];
  const hand: BattleWord[] = [];
  const take = (word: BattleWord) => { if (hand.length < HAND_SIZE && !hand.includes(word)) hand.push(word); };
  for (const slot of SLOTS) {
    deck.filter(word => !hand.includes(word) && slot.fits(word, source)).slice(0, slot.count).forEach(take);
  }
  deck.forEach(take);
  return hand;
}

/** How many of the latest catches count as "new" for the hand's new-word slot. */
export const NEW_CATCH_COUNT = 2;

/** The ids of the latest caught kana (the collection is in the order caught; the starter set doesn't count). */
export function latestCatches(kanaIds: readonly number[], starterSetIds: ReadonlySet<number>): number[] {
  return kanaIds.filter(id => !starterSetIds.has(id)).slice(-NEW_CATCH_COUNT);
}
