// The words a player can attack with: course vocabulary written in kana they can have as tiles (basic hiragana, and
// voiced kana once evolved), spelled from kana they own.
import { isBasicHiragana } from "./gojuon.ts";

export type VocabularyEntry = { japanese: string; romaji: string; meaning: string };
export type BattleWord = { japanese: string; romaji: string; meaning: string };

/**
 * Every distinct word of the course whose every kana `isTile` accepts: by default basic hiragana (the wild battles'
 * words); with isTileKana, voiced kana too (the words evolutions open).
 */
export function collectBattleWords(entries: readonly VocabularyEntry[], isTile: (character: string) => boolean = isBasicHiragana): BattleWord[] {
  const words = new Map<string, BattleWord>();
  for (const { japanese, romaji, meaning } of entries) {
    const word = japanese.trim();
    const isSpelledInTiles = word.length > 0 && [...word].every(isTile);
    if (!isSpelledInTiles || words.has(word) || !romaji.trim() || !meaning.trim()) continue;
    words.set(word, { japanese: word, romaji: romaji.trim().toLowerCase(), meaning: meaning.trim() });
  }
  return [...words.values()];
}

/** The words whose every kana is one the player owns (a kana can be used more than once in a word). */
export const playableWords = (words: readonly BattleWord[], owned: ReadonlySet<string>) =>
  words.filter(word => [...word.japanese].every(character => owned.has(character)));

/** How many more words become playable once `kana` joins the collection. */
export function countWordsOpenedBy(words: readonly BattleWord[], owned: ReadonlySet<string>, kana: string): number {
  if (owned.has(kana)) return 0;
  return playableWords(words, new Set([...owned, kana])).length - playableWords(words, owned).length;
}
