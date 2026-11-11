// The words a player can attack with: course vocabulary written only in basic hiragana, spelled from kana they own.
import { isBasicHiragana } from "./gojuon.ts";

export type VocabularyEntry = { japanese: string; romaji: string; meaning: string };
export type BattleWord = { japanese: string; romaji: string; meaning: string };

const isSpelledInBasicHiragana = (japanese: string) => japanese.length > 0 && [...japanese].every(isBasicHiragana);

/** Every distinct word of the course that basic hiragana tiles can spell (voiced and small kana come with evolutions). */
export function collectBattleWords(entries: readonly VocabularyEntry[]): BattleWord[] {
  const words = new Map<string, BattleWord>();
  for (const { japanese, romaji, meaning } of entries) {
    const word = japanese.trim();
    if (!isSpelledInBasicHiragana(word) || words.has(word) || !romaji.trim() || !meaning.trim()) continue;
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
