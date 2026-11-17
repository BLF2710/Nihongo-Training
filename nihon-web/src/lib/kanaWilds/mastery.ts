// A kana's level is the learner's real mastery of it (docs/KANA-BATTLE.md section 8): the right and wrong answers the
// site stores for that kana, from quizzes, reviews and battles alike. Pure; the API supplies the counts.
import { tileKanaById } from "./gojuon.ts";

export type MasteryLevel = 1 | 2 | 3 | 4 | 5;
/** The answers given for one hiragana (its catalog id), as the API reports them. */
export type KanaAnswers = { kanaId: number; correct: number; wrong: number };
/** Each kana's level, by character; a kana missing from it is level 1. */
export type KanaLevels = ReadonlyMap<string, MasteryLevel>;

export const FIRST_LEVEL: MasteryLevel = 1;
/** What each level above the first asks for: at least this many answers, with at least this share right. */
export const MASTERY_STEPS: readonly { level: MasteryLevel; minAnswers: number; minAccuracy: number }[] = [
  { level: 2, minAnswers: 5, minAccuracy: 0.6 },
  { level: 3, minAnswers: 15, minAccuracy: 0.75 },
  { level: 4, minAnswers: 30, minAccuracy: 0.85 },
  { level: 5, minAnswers: 50, minAccuracy: 0.92 },
];
/** How much power each of a word's kana adds, by that kana's level. Level 1 is the game's original tile power. */
export const TILE_POWER_BY_LEVEL: Readonly<Record<MasteryLevel, number>> = { 1: 3, 2: 3.5, 3: 4, 4: 4.5, 5: 5 };
export const NO_LEVELS: KanaLevels = new Map();

/** The highest level whose answer count and accuracy the kana has reached; a caught kana is at least level 1. */
export function masteryLevel(correct: number, wrong: number): MasteryLevel {
  const answered = correct + wrong;
  const accuracy = answered === 0 ? 0 : correct / answered;
  return MASTERY_STEPS.reduce<MasteryLevel>(
    (level, step) => answered >= step.minAnswers && accuracy >= step.minAccuracy ? step.level : level, FIRST_LEVEL);
}

/** The levels of the kana the answers are for, by character: basic and voiced kana (other ids are skipped). */
export function kanaLevelsOf(answers: readonly KanaAnswers[]): KanaLevels {
  return new Map(answers.flatMap(({ kanaId, correct, wrong }) => {
    const kana = tileKanaById(kanaId);
    return kana ? [[kana.kana, masteryLevel(correct, wrong)] as const] : [];
  }));
}

export const levelOf = (levels: KanaLevels, character: string): MasteryLevel => levels.get(character) ?? FIRST_LEVEL;

/** A word's power before matchups: each of its kana adds its level's tile power (a repeated kana counts each time). */
export const wordPower = (japanese: string, levels: KanaLevels) =>
  [...japanese].reduce((power, character) => power + TILE_POWER_BY_LEVEL[levelOf(levels, character)], 0);
