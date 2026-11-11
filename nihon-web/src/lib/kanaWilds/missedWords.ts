// The words a player has read wrong in battle, most recent first, so the hand can deal them again for practice.
// Pure list updates here; where the list is kept is up to the caller.

/** The most missed words remembered; older ones drop off. */
export const MAX_MISSED_WORDS = 40;

/** A wrong reading puts the word at the front; a right one clears it. */
export function noteReading(missed: readonly string[], word: string, isCorrect: boolean): string[] {
  const others = missed.filter(item => item !== word);
  return isCorrect ? others : [word, ...others].slice(0, MAX_MISSED_WORDS);
}

/** The newest words: those that use a kana from the player's latest catches. */
export function wordsUsingKana(words: readonly { japanese: string }[], kana: ReadonlySet<string>): Set<string> {
  return new Set(words.filter(word => [...word.japanese].some(character => kana.has(character))).map(word => word.japanese));
}
