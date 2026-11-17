// A challenge (docs/WORLD.md section 4): one of the island cast waits on their island with a team of kana. The player
// fights them one after another, with the HP left from each round. Pure; the rounds themselves are ordinary battles.
import type { CharacterId } from "../cast.ts";
import { PLAYER_MAX_HP } from "../kanaWilds/battle.ts";
import type { BattleState } from "../kanaWilds/battle.ts";
import type { DefenceStyle } from "../kanaWilds/defenceStyles.ts";
import { tileKanaByCharacter } from "../kanaWilds/gojuon.ts";
import type { WildKana } from "../kanaWilds/gojuon.ts";
import type { KanaMistake } from "../kanaWilds/mistakes.ts";

export const CHALLENGER_IDS = ["chun", "tama", "pon", "sensei"] as const;
export type ChallengerId = (typeof CHALLENGER_IDS)[number];
export const isChallengerId = (value: string): value is ChallengerId => CHALLENGER_IDS.some(id => id === value);
/** What beating a challenger gives besides rows in a path's grass (lib/world/routes): a skill for wild battles, or
 *  evolution for the player's kana. */
export type ChallengerReward = "sharp-eyes" | "evolution";

/** `defence`: the challenger's signature way of attacking (docs/KANA-BATTLE.md section 9). */
export type Challenger = { id: ChallengerId; character: CharacterId; team: readonly WildKana[]; defence: DefenceStyle; reward?: ChallengerReward };

type Readings = { readonly answered: number; readonly correct: number };
export type Challenge = {
  readonly challenger: Challenger; readonly round: number; readonly playerHp: number; readonly readings: Readings;
  /** Every kana the player mixed up so far, over all rounds. */
  readonly mistakes: readonly KanaMistake[];
};
export type ChallengeOutcome = "won" | "lost" | "ran";
/** How a challenge went, for the result screen. */
export type ChallengeSummary = { outcome: ChallengeOutcome; readings: Readings; mistakes: readonly KanaMistake[] };
export type ChallengeStep =
  | { kind: "next"; challenge: Challenge }
  | { kind: "over"; summary: ChallengeSummary };

/** A challenger's team, from its kana; fails loudly on a kana that can't be a tile (basic or voiced hiragana): a
 *  content mistake. */
export function teamOf(characters: string): WildKana[] {
  return [...characters].map(character => {
    const kana = tileKanaByCharacter(character);
    if (!kana) throw new Error(`${character} is not a basic or voiced hiragana, so it can't be on a challenger's team.`);
    return kana;
  });
}

export const startChallenge = (challenger: Challenger): Challenge =>
  ({ challenger, round: 0, playerHp: PLAYER_MAX_HP, readings: { answered: 0, correct: 0 }, mistakes: [] });

/** The challenger's kana the player is facing now. */
export const kanaInPlay = (challenge: Challenge): WildKana => challenge.challenger.team[challenge.round];

/** After a round: on to the challenger's next kana with the HP left, or the challenge is over. */
export function afterRound(challenge: Challenge, ended: BattleState): ChallengeStep {
  const readings = { answered: challenge.readings.answered + ended.readings.answered, correct: challenge.readings.correct + ended.readings.correct };
  const mistakes = [...challenge.mistakes, ...ended.mistakes];
  if (ended.outcome !== "won") return { kind: "over", summary: { outcome: ended.outcome === "lost" ? "lost" : "ran", readings, mistakes } };
  const round = challenge.round + 1;
  if (round >= challenge.challenger.team.length) return { kind: "over", summary: { outcome: "won", readings, mistakes } };
  return { kind: "next", challenge: { ...challenge, round, playerHp: ended.playerHp, readings, mistakes } };
}
