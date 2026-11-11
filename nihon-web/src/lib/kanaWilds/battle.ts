// One battle against a wild kana (docs/KANA-BATTLE.md sections 4–7). Pure state transitions: the screen asks the
// questions, then hands each result to these functions.
import type { Vowel, WildKana } from "./gojuon.ts";
import { MATCHUP_MULTIPLIER, matchup, vowelOfWord } from "./vowelCircle.ts";
import type { Matchup } from "./vowelCircle.ts";
import type { BattleWord } from "./words.ts";

export const PLAYER_MAX_HP = 30;
export const ENEMY_MAX_HP = 20;
/** Each kana in a word adds this much power. */
export const TILE_POWER = 3;
export const CRITICAL_MULTIPLIER = 1.25;
/** Playing the same word again in one battle multiplies its power by this each time. */
export const FATIGUE_FACTOR = 0.5;
export const ENEMY_ATTACK_POWER = 6;
/** Catching opens once the enemy is at or below this share of its HP, at a low chance that rises as it weakens. */
export const CATCH_HP_SHARE = 0.6;
/** The chance that a good trace catches the kana just as catching opens; it rises to certain at 0 HP. */
export const MIN_CATCH_CHANCE = 0.4;
/** A perfect block (answered before the attack finished drawing) hits back for this much. */
export const COUNTER_DAMAGE = 2;
export const MAX_CATCH_TRIES = 3;
/** How far (in KanjiVG's 109-unit box) a traced stroke may stray: strict at the catch threshold, loose at 0 HP. */
export const CATCH_TOLERANCE = { strictest: 15, loosest: 27 } as const;
/** Redrawing gives up the attack but braces the player: a missed block on the enemy's next attack hurts this much less. */
export const BRACED_DAMAGE_FACTOR = 0.5;

export type Phase = "attack" | "defend" | "over";
export type Outcome = "caught" | "fled" | "lost" | "ran";
/** How the player met an enemy attack: read right before it finished drawing, read right after, or read wrong. */
export type DefenceResult = "perfect" | "blocked" | "missed";
export type BattleEvent =
  | { kind: "hit"; word: string; damage: number; matchup: Matchup; isCritical: boolean }
  | { kind: "fizzle"; word: string }
  | { kind: "blocked"; counterDamage: number }
  | { kind: "hurt"; damage: number; matchup: Matchup; wasBraced: boolean }
  | { kind: "redrew" }
  | { kind: "catch-failed"; triesLeft: number; reason: "trace" | "broke-out" }
  | { kind: "ended"; outcome: Outcome };

export type BattleState = {
  readonly enemy: WildKana;
  readonly isCatchable: boolean;
  readonly enemyHp: number;
  readonly playerHp: number;
  /** The vowel of the word last played; the enemy's attacks are judged against it. */
  readonly stance: Vowel | null;
  /** Set by a redraw: the enemy's next attack is easier to block (fewer choices) and softer if it lands. */
  readonly isBraced: boolean;
  readonly timesPlayed: Readonly<Record<string, number>>;
  readonly catchTries: number;
  readonly phase: Phase;
  readonly outcome: Outcome | null;
  readonly readings: { readonly answered: number; readonly correct: number };
  readonly lastEvent: BattleEvent | null;
};

export function startBattle(enemy: WildKana, isCatchable: boolean): BattleState {
  return {
    enemy, isCatchable, enemyHp: ENEMY_MAX_HP, playerHp: PLAYER_MAX_HP, stance: null, isBraced: false, timesPlayed: {}, catchTries: 0,
    phase: "attack", outcome: null, readings: { answered: 0, correct: 0 }, lastEvent: null,
  };
}

const counted = (state: BattleState, isCorrect: boolean) =>
  ({ answered: state.readings.answered + 1, correct: state.readings.correct + (isCorrect ? 1 : 0) });

/** An exhausted enemy (0 HP) no longer fights back, so the player can take their time catching it. */
export const isExhausted = (state: BattleState) => state.enemyHp === 0;
const turnAfterPlayer = (state: BattleState): Phase => (isExhausted(state) ? "attack" : "defend");

/** What a word would do to this enemy: its damage and the matchup, for showing the choices before playing one. */
export function previewAttack(word: BattleWord, enemyVowel: Vowel | null, timesPlayed: number, isCritical = false) {
  const wordMatchup = matchup(vowelOfWord(word.japanese), enemyVowel);
  const power = [...word.japanese].length * TILE_POWER * MATCHUP_MULTIPLIER[wordMatchup] * FATIGUE_FACTOR ** timesPlayed;
  return { damage: Math.max(1, Math.round(power * (isCritical ? CRITICAL_MULTIPLIER : 1))), matchup: wordMatchup };
}

/** The player plays a word: read right it hits (harder if the meaning was right too), read wrong it fizzles. */
export function playWord(state: BattleState, play: { word: BattleWord; isReadingCorrect: boolean; isMeaningCorrect: boolean }): BattleState {
  if (state.phase !== "attack") return state;
  const { word, isReadingCorrect, isMeaningCorrect } = play;
  const timesPlayed = { ...state.timesPlayed, [word.japanese]: (state.timesPlayed[word.japanese] ?? 0) + 1 };
  const base = { ...state, timesPlayed, stance: vowelOfWord(word.japanese), readings: counted(state, isReadingCorrect) };
  if (!isReadingCorrect) return { ...base, phase: turnAfterPlayer(state), lastEvent: { kind: "fizzle", word: word.japanese } };
  const { damage, matchup: wordMatchup } = previewAttack(word, state.enemy.vowel, state.timesPlayed[word.japanese] ?? 0, isMeaningCorrect);
  const hit = { ...base, enemyHp: Math.max(0, state.enemyHp - damage) };
  return { ...hit, phase: turnAfterPlayer(hit), lastEvent: { kind: "hit", word: word.japanese, damage, matchup: wordMatchup, isCritical: isMeaningCorrect } };
}

export function enemyAttackDamage(enemyVowel: Vowel | null, stance: Vowel | null) {
  const attackMatchup = matchup(enemyVowel, stance);
  return { damage: Math.round(ENEMY_ATTACK_POWER * MATCHUP_MULTIPLIER[attackMatchup]), matchup: attackMatchup };
}

/** The player swaps their hand for a new one: no attack this turn, but they brace for the enemy's. */
export function redraw(state: BattleState): BattleState {
  if (state.phase !== "attack" || isExhausted(state)) return state;
  return { ...state, isBraced: true, phase: "defend", lastEvent: { kind: "redrew" } };
}

/**
 * The enemy attacks: reading it right blocks the attack (a perfect block also hits back), reading it wrong takes the
 * hit, judged against the stance.
 */
export function defend(state: BattleState, result: DefenceResult): BattleState {
  if (state.phase !== "defend") return state;
  const readings = counted(state, result !== "missed");
  const wasBraced = state.isBraced;
  const settled = { ...state, readings, isBraced: false };
  if (result !== "missed") {
    const counterDamage = result === "perfect" ? Math.min(COUNTER_DAMAGE, state.enemyHp) : 0;
    return { ...settled, enemyHp: state.enemyHp - counterDamage, phase: "attack", lastEvent: { kind: "blocked", counterDamage } };
  }
  const attack = enemyAttackDamage(state.enemy.vowel, state.stance);
  const damage = wasBraced ? Math.max(1, Math.round(attack.damage * BRACED_DAMAGE_FACTOR)) : attack.damage;
  const playerHp = Math.max(0, state.playerHp - damage);
  if (playerHp === 0) return end({ ...settled, playerHp }, "lost");
  return { ...settled, playerHp, phase: "attack", lastEvent: { kind: "hurt", damage, matchup: attack.matchup, wasBraced } };
}

export const canCatch = (state: BattleState) =>
  state.phase === "attack" && state.isCatchable && state.enemyHp <= ENEMY_MAX_HP * CATCH_HP_SHARE;

/** 0 just as catching opens, 1 at 0 HP: how far the enemy is worn down within the catching range. */
function weakness(state: BattleState): number {
  return 1 - Math.min(1, state.enemyHp / (ENEMY_MAX_HP * CATCH_HP_SHARE));
}

/** The tracing tolerance for a catch now: the weaker the enemy, the more forgiving. */
export function catchTolerance(state: BattleState): number {
  return CATCH_TOLERANCE.strictest + (CATCH_TOLERANCE.loosest - CATCH_TOLERANCE.strictest) * weakness(state);
}

/** The chance a good trace catches the enemy now: low as catching opens, certain at 0 HP. */
export function catchChance(state: BattleState): number {
  return MIN_CATCH_CHANCE + (1 - MIN_CATCH_CHANCE) * weakness(state);
}

/**
 * A catch attempt: a good trace catches it if the roll (0–1, from the caller's random source) is under the catch
 * chance. A missed trace or a lost roll lets it strike back, and after the last try it flees.
 */
export function attemptCatch(state: BattleState, isTraceAccepted: boolean, roll: number): BattleState {
  if (!canCatch(state)) return state;
  if (isTraceAccepted && roll < catchChance(state)) return end(state, "caught");
  const catchTries = state.catchTries + 1;
  if (catchTries >= MAX_CATCH_TRIES) return end({ ...state, catchTries }, "fled");
  const reason = isTraceAccepted ? "broke-out" : "trace";
  return { ...state, catchTries, phase: turnAfterPlayer(state), lastEvent: { kind: "catch-failed", triesLeft: MAX_CATCH_TRIES - catchTries, reason } };
}

export const runAway = (state: BattleState): BattleState => (state.phase === "over" ? state : end(state, "ran"));

function end(state: BattleState, outcome: Outcome): BattleState {
  return { ...state, phase: "over", outcome, lastEvent: { kind: "ended", outcome } };
}
