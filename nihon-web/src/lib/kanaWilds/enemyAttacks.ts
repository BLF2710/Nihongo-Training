// What a hidden wild kana attacks with: kana from its moveset (its look-alikes and row-mates) or course words that
// contain it. Never itself, so its attacks are clues to what it is rather than giving it away.
import { BASIC_HIRAGANA, HIRAGANA_ROWS } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";
import { LOOK_ALIKES } from "./choices.ts";
import type { BattleWord } from "./words.ts";

export type EnemyAttack = { kind: "kana"; kana: WildKana } | { kind: "word"; word: BattleWord };

/** Word attacks longer than this (in kana) take too long to draw. */
export const MAX_ATTACK_WORD_LENGTH = 4;
/** The share of word attacks: the first row attacks mostly with kana, each later row a little more with words. */
export const WORD_ATTACK_SHARE = { first: 0.2, perRow: 0.05, most: 0.7 } as const;

const pickOne = <T>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(random() * items.length))];

/** Its look-alikes and the other kana of its row. */
export function movesetOf(enemy: WildKana): WildKana[] {
  const lookAlikes = LOOK_ALIKES.find(group => group.includes(enemy.kana)) ?? "";
  const moves = BASIC_HIRAGANA.filter(item => item.id !== enemy.id && (item.row === enemy.row || lookAlikes.includes(item.kana)));
  // ん has no row-mates and no look-alikes but そ; the vowels stand in so it always has moves.
  return moves.length ? moves : [...HIRAGANA_ROWS[0].kana];
}

export const attackWordsOf = (enemy: WildKana, words: readonly BattleWord[]) =>
  words.filter(word => word.japanese.includes(enemy.kana) && [...word.japanese].length <= MAX_ATTACK_WORD_LENGTH);

export function wordAttackShare(enemy: WildKana): number {
  const rowIndex = HIRAGANA_ROWS.findIndex(({ row }) => row === enemy.row);
  return Math.min(WORD_ATTACK_SHARE.most, WORD_ATTACK_SHARE.first + WORD_ATTACK_SHARE.perRow * Math.max(0, rowIndex));
}

export function pickEnemyAttack(enemy: WildKana, words: readonly BattleWord[], random: () => number): EnemyAttack {
  const attackWords = attackWordsOf(enemy, words);
  if (attackWords.length && random() < wordAttackShare(enemy)) return { kind: "word", word: pickOne(attackWords, random) };
  return { kind: "kana", kana: pickOne(movesetOf(enemy), random) };
}
