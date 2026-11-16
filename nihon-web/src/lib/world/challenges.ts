// A challenge (docs/WORLD.md section 4): one of the island cast waits on their island with a team of kana. The player
// fights them one after another, with the HP left from each round. Pure; the rounds themselves are ordinary battles.
import type { CharacterId } from "../cast.ts";
import { PLAYER_MAX_HP } from "../kanaWilds/battle.ts";
import type { BattleState } from "../kanaWilds/battle.ts";
import { kanaByCharacter } from "../kanaWilds/gojuon.ts";
import type { WildKana } from "../kanaWilds/gojuon.ts";

export type ChallengerId = "chun" | "tama" | "pon";
export type Challenger = { id: ChallengerId; character: CharacterId; team: readonly WildKana[] };

type Readings = { readonly answered: number; readonly correct: number };
export type Challenge = { readonly challenger: Challenger; readonly round: number; readonly playerHp: number; readonly readings: Readings };
export type ChallengeOutcome = "won" | "lost" | "ran";
export type ChallengeStep =
  | { kind: "next"; challenge: Challenge }
  | { kind: "over"; outcome: ChallengeOutcome; readings: Readings };

/** A challenger's team, from its kana; fails loudly on a kana that isn't basic hiragana (a content mistake). */
export function teamOf(characters: string): WildKana[] {
  return [...characters].map(character => {
    const kana = kanaByCharacter(character);
    if (!kana) throw new Error(`${character} is not a basic hiragana, so it can't be on a challenger's team.`);
    return kana;
  });
}

export const startChallenge = (challenger: Challenger): Challenge =>
  ({ challenger, round: 0, playerHp: PLAYER_MAX_HP, readings: { answered: 0, correct: 0 } });

/** The challenger's kana the player is facing now. */
export const kanaInPlay = (challenge: Challenge): WildKana => challenge.challenger.team[challenge.round];

/** After a round: on to the challenger's next kana with the HP left, or the challenge is over. */
export function afterRound(challenge: Challenge, ended: BattleState): ChallengeStep {
  const readings = { answered: challenge.readings.answered + ended.readings.answered, correct: challenge.readings.correct + ended.readings.correct };
  if (ended.outcome !== "won") return { kind: "over", outcome: ended.outcome === "lost" ? "lost" : "ran", readings };
  const round = challenge.round + 1;
  if (round >= challenge.challenger.team.length) return { kind: "over", outcome: "won", readings };
  return { kind: "next", challenge: { ...challenge, round, playerHp: ended.playerHp, readings } };
}
