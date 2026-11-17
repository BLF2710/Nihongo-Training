// How an enemy's attack is met (docs/KANA-BATTLE.md section 6). Wild kana are read as they are drawn; each challenger
// has a signature defence (section 9): Chun's attacks are all look-alikes, Tama shouts, Pon's draw slowly for a
// stroke reveal, Sensei casts whole words, Zen asks for recall (type the reading, no choices), Kurama writes with a
// brush. Pure: what the enemy attacks with and how an answer is judged; the screen asks the question.
import type { DefenceResult } from "./battle.ts";
import { lookAlikesOf } from "./choices.ts";
import { attackWordsOf, movesetOf, pickEnemyAttack, pickOne } from "./enemyAttacks.ts";
import type { EnemyAttack } from "./enemyAttacks.ts";
import type { WildKana } from "./gojuon.ts";
import type { BattleWord } from "./words.ts";

export type DefenceStyle = "reading" | "look-alikes" | "shout" | "stroke-reveal" | "word-attack" | "recall" | "brush";

type AttackPicker = (enemy: WildKana, words: readonly BattleWord[], random: () => number) => EnemyAttack;

const kanaAttack = (kana: WildKana): EnemyAttack => ({ kind: "kana", kana });

const ATTACK_PICKERS: Readonly<Record<DefenceStyle, AttackPicker>> = {
  reading: pickEnemyAttack,
  // Itself or one of its look-alikes, so every attack is a kana worth telling apart.
  "look-alikes": (enemy, words, random) => {
    const group = lookAlikesOf(enemy);
    return group.length > 1 ? kanaAttack(pickOne(group, random)) : pickEnemyAttack(enemy, words, random);
  },
  // A single kana: itself or its moveset. Words are not shouted.
  shout: (enemy, _words, random) => kanaAttack(pickOne([enemy, ...movesetOf(enemy)], random)),
  "stroke-reveal": pickEnemyAttack,
  // A word with the kana in it, whenever there is one.
  "word-attack": (enemy, words, random) => {
    const attackWords = attackWordsOf(enemy, words);
    return attackWords.length ? { kind: "word", word: pickOne(attackWords, random) } : pickEnemyAttack(enemy, words, random);
  },
  // Always the kana itself: Zen's team is the player's weakest kana, and recalling them is the point.
  recall: enemy => kanaAttack(enemy),
  // Kana and words alike, as wild kana attack: the difficulty is the brush, not what is written.
  brush: pickEnemyAttack,
};

/** What the enemy attacks with on its turn, for this defence. */
export const pickAttack = (style: DefenceStyle, enemy: WildKana, words: readonly BattleWord[], random: () => number): EnemyAttack =>
  ATTACK_PICKERS[style](enemy, words, random);

/** An attack read as it is drawn: right before it is all drawn is a perfect block, right after is a block. */
export function drawnBlock(isCorrect: boolean, drawn: number, total: number): DefenceResult {
  if (!isCorrect) return "missed";
  return drawn < total ? "perfect" : "blocked";
}

/**
 * The stroke reveal: the earlier the right answer, the better the block. Before half the strokes are drawn it is
 * perfect, before the last it glances off (a quarter of the hit), once it is all drawn it grazes (half).
 */
export function revealBlock(isCorrect: boolean, drawn: number, total: number): DefenceResult {
  if (!isCorrect) return "missed";
  if (drawn < total / 2) return "perfect";
  return drawn < total ? "glanced" : "grazed";
}

/** A typed reading as it is compared: composed (NFC), without spaces around it, in lower case. */
export const typedReading = (typed: string): string => typed.normalize("NFC").trim().toLowerCase();

/** A shouted kana: picked right on the first hearing is a perfect block; after hearing it again, a block. */
export function heardBlock(isCorrect: boolean, timesHeard: number): DefenceResult {
  if (!isCorrect) return "missed";
  return timesHeard <= 1 ? "perfect" : "blocked";
}
