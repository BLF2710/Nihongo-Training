import { shuffle } from "./random";

// The order in which the Speed Quiz shows characters. Both modes deal from a shuffled deck rather than picking at
// random each time, so every chosen character appears before any character comes back.
//   round:     each chosen character once, then the round ends
//   unlimited: when the deck runs out it is reshuffled, never starting with the character just shown
export type QuizMode = "round" | "unlimited";

/** A freshly shuffled deck that does not start with `lastId` (unless it is the only character). */
export function shuffledDeck(ids: readonly number[], lastId: number | null = null, random: () => number = Math.random): number[] {
  const deck = shuffle([...new Set(ids)], random);
  if (deck.length > 1 && deck[0] === lastId) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
  return deck;
}

/** The next character and the deck that remains. In a round, `id` is null once every character has been shown. */
export function draw(deck: readonly number[], mode: QuizMode, ids: readonly number[], lastId: number | null, random: () => number = Math.random): { id: number | null; deck: number[] } {
  const source = deck.length ? deck : mode === "unlimited" ? shuffledDeck(ids, lastId, random) : [];
  const [id = null, ...rest] = source;
  return { id, deck: rest };
}
