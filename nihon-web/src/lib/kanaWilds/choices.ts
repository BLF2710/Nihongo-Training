// The four choices for each question in a battle: a word's reading, its meaning, and the enemy kana's reading.
import { shuffle } from "../random.ts";
import { BASIC_HIRAGANA } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";
import type { BattleWord } from "./words.ts";

export const CHOICE_COUNT = 4;

/** Kana that learners mix up. Defending against a kana with look-alikes offers them as the wrong choices. */
export const LOOK_ALIKES: readonly string[] = ["ぬめ", "ねれわ", "るろ", "さちき", "はほけ", "いり", "こに", "うら", "しつ", "そん", "たな", "まも", "あお", "くへ", "すむ"];

function pickDistinct(correct: string, candidates: readonly string[], random: () => number): string[] {
  const others = [...new Set(candidates)].filter(candidate => candidate !== correct);
  return shuffle([correct, ...shuffle(others, random).slice(0, CHOICE_COUNT - 1)], random);
}

/** The word's romaji and three other words' romaji, preferring words of the same length so the length gives nothing away. */
export function readingChoices(word: BattleWord, pool: readonly BattleWord[], random: () => number): string[] {
  const sameLength = pool.filter(other => other.japanese.length === word.japanese.length).map(other => other.romaji);
  const filler = pool.map(other => other.romaji);
  const distractors = [...shuffle(sameLength, random), ...shuffle(filler, random)];
  return pickDistinct(word.romaji, distractors, random);
}

export function meaningChoices(word: BattleWord, pool: readonly BattleWord[], random: () => number): string[] {
  return pickDistinct(word.meaning, shuffle(pool.map(other => other.meaning), random), random);
}

/** The enemy's romaji with its look-alikes first, filled up with other basic kana. */
export function defenceChoices(enemy: WildKana, random: () => number): string[] {
  const group = LOOK_ALIKES.find(set => set.includes(enemy.kana)) ?? "";
  const lookAlikes = BASIC_HIRAGANA.filter(item => group.includes(item.kana)).map(item => item.romaji);
  const others = shuffle(BASIC_HIRAGANA.map(item => item.romaji), random);
  const wrong = [...shuffle(lookAlikes, random), ...others].filter(romaji => romaji !== enemy.romaji);
  return shuffle([enemy.romaji, ...[...new Set(wrong)].slice(0, CHOICE_COUNT - 1)], random);
}

/**
 * The catch without drawing: which kana is it? The answer among its look-alikes and row-mates, so it takes the same
 * working out as a trace (from the strokes shown and the attacks), filled up with other kana when those run short.
 */
export function catchChoices(enemy: WildKana, random: () => number): string[] {
  const group = LOOK_ALIKES.find(set => set.includes(enemy.kana)) ?? "";
  const others = BASIC_HIRAGANA.filter(item => item.id !== enemy.id);
  const lookAlikes = others.filter(item => group.includes(item.kana));
  const rowMates = others.filter(item => item.row === enemy.row && !group.includes(item.kana));
  const close = [...shuffle(lookAlikes, random), ...shuffle(rowMates, random), ...shuffle(others, random)].map(item => item.kana);
  return shuffle([enemy.kana, ...[...new Set(close)].slice(0, CHOICE_COUNT - 1)], random);
}

/** Choices when braced (after a redraw): two, and never a look-alike, so the block is easier. */
export const BRACED_CHOICE_COUNT = 2;

export function bracedDefenceChoices(enemy: WildKana, random: () => number): string[] {
  const group = LOOK_ALIKES.find(set => set.includes(enemy.kana)) ?? enemy.kana;
  const others = BASIC_HIRAGANA.filter(item => !group.includes(item.kana) && item.romaji !== enemy.romaji);
  return shuffle([enemy.romaji, ...shuffle(others, random).slice(0, BRACED_CHOICE_COUNT - 1).map(item => item.romaji)], random);
}

/** A word's reading when braced: the answer and one other. */
export function bracedReadingChoices(word: BattleWord, pool: readonly BattleWord[], random: () => number): string[] {
  const [other] = readingChoices(word, pool, random).filter(choice => choice !== word.romaji);
  return shuffle([word.romaji, ...(other ? [other] : [])], random);
}

const lookAlikeGroupOf = (kana: WildKana) => LOOK_ALIKES.find(set => set.includes(kana.kana)) ?? kana.kana;

/** The kana that learners mix up with this one (itself included), or just itself when it has none. */
export const lookAlikesOf = (kana: WildKana): WildKana[] => BASIC_HIRAGANA.filter(item => lookAlikeGroupOf(kana).includes(item.kana));

/** Every wrong choice is a kana learners mix up: its own look-alikes first, then those of other kana. */
export function lookAlikeChoices(kana: WildKana, random: () => number): string[] {
  const others = BASIC_HIRAGANA.filter(item => LOOK_ALIKES.some(set => set.includes(item.kana)) && !lookAlikeGroupOf(kana).includes(item.kana));
  const wrong = [...shuffle(lookAlikesOf(kana), random), ...shuffle(others, random)].map(item => item.romaji).filter(romaji => romaji !== kana.romaji);
  return shuffle([kana.romaji, ...wrong.slice(0, CHOICE_COUNT - 1)], random);
}

/** A shouted kana: the kana that sound like it (the same vowel, then the same row), as kana to pick from. */
export function soundAlikeChoices(kana: WildKana, random: () => number): string[] {
  const others = BASIC_HIRAGANA.filter(item => item.id !== kana.id);
  const sameVowel = others.filter(item => item.vowel !== null && item.vowel === kana.vowel);
  const sameRow = others.filter(item => item.row === kana.row);
  const close = [...shuffle(sameVowel, random), ...shuffle(sameRow, random), ...shuffle(others, random)].map(item => item.kana);
  return shuffle([kana.kana, ...[...new Set(close)].slice(0, CHOICE_COUNT - 1)], random);
}

/** A shouted kana when braced: it and one kana that sounds nothing like it (another vowel and row). */
export function bracedSoundChoices(kana: WildKana, random: () => number): string[] {
  const unlike = BASIC_HIRAGANA.filter(item => item.vowel !== kana.vowel && item.row !== kana.row);
  return shuffle([kana.kana, ...shuffle(unlike, random).slice(0, BRACED_CHOICE_COUNT - 1).map(item => item.kana)], random);
}
