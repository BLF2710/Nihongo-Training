// A challenge (docs/WORLD.md section 4): one of the island cast waits on their island with a team of kana. The player
// fights them one after another, with the HP left from each round. Pure; the rounds themselves are ordinary battles.
import type { CharacterId } from "../cast.ts";
import { PLAYER_MAX_HP } from "../kanaWilds/battle.ts";
import type { BattleState } from "../kanaWilds/battle.ts";
import type { DefenceStyle } from "../kanaWilds/defenceStyles.ts";
import { tileKanaByCharacter } from "../kanaWilds/gojuon.ts";
import { levelOf } from "../kanaWilds/mastery.ts";
import type { KanaLevels } from "../kanaWilds/mastery.ts";
import { shuffle } from "../random.ts";
import type { WildKana } from "../kanaWilds/gojuon.ts";
import type { KanaMistake } from "../kanaWilds/mistakes.ts";

export const CHALLENGER_IDS = ["chun", "tama", "pon", "sensei", "zen", "kurama"] as const;
export type ChallengerId = (typeof CHALLENGER_IDS)[number];
export const isChallengerId = (value: string): value is ChallengerId => CHALLENGER_IDS.some(id => id === value);
/** What beating a challenger gives besides rows in a path's grass (lib/world/routes): a skill for wild battles, a
 *  kind of evolution for the player's kana, or (Kurama, the last) first way into the katakana wilds to come. */
export type ChallengerReward = "sharp-eyes" | "voiced-evolution" | "small-kana-evolution" | "katakana-wilds";

/** A challenger's team: the same kana every time; or chosen from the player's own kana as the challenge starts, their
 *  weakest (lowest level) or a mix of all of them (basic, voiced and small kana alike). */
export type ChallengerTeam = { kind: "fixed"; kana: readonly WildKana[] } | { kind: "weakest" | "mixed"; size: number };

/** `defence`: the challenger's signature way of attacking (docs/KANA-BATTLE.md section 9). */
export type Challenger = { id: ChallengerId; character: CharacterId; team: ChallengerTeam; defence: DefenceStyle; reward?: ChallengerReward };

type Readings = { readonly answered: number; readonly correct: number };
export type Challenge = {
  readonly challenger: Challenger; readonly team: readonly WildKana[]; readonly round: number; readonly playerHp: number; readonly readings: Readings;
  /** Every kana the player mixed up so far, over all rounds. */
  readonly mistakes: readonly KanaMistake[];
};
export type ChallengeOutcome = "won" | "lost" | "ran";
/** How a challenge went, for the result screen. */
export type ChallengeSummary = { outcome: ChallengeOutcome; team: readonly WildKana[]; readings: Readings; mistakes: readonly KanaMistake[] };
export type ChallengeStep =
  | { kind: "next"; challenge: Challenge }
  | { kind: "over"; summary: ChallengeSummary };

/** A content mistake: a challenger's team names a kana that can't be a tile. */
export class UnknownTeamKanaError extends Error {
  constructor(character: string) {
    super(`${character} is not a basic or voiced hiragana, so it can't be on a challenger's team.`);
    this.name = "UnknownTeamKanaError";
  }
}

/** A fixed team, from its kana; fails loudly on a kana that can't be a tile (basic or voiced hiragana). */
export function teamOf(characters: string): ChallengerTeam {
  return { kind: "fixed", kana: [...characters].map(character => {
    const kana = tileKanaByCharacter(character);
    if (!kana) throw new UnknownTeamKanaError(character);
    return kana;
  }) };
}

/** What the player has, for a team made of their weakest kana: the tile kana they own (or evolved), their levels. */
export type PlayerKana = { tiles: readonly WildKana[]; levels: KanaLevels; random: () => number };

/** The kana the player will face: a fixed team as it is; their lowest-level kana (ties at random); or a random mix. */
export function teamFor(challenger: Challenger, { tiles, levels, random }: PlayerKana): readonly WildKana[] {
  const { team } = challenger;
  if (team.kind === "fixed") return team.kana;
  const shuffled = shuffle(tiles, random);
  const ordered = team.kind === "weakest" ? shuffled.sort((a, b) => levelOf(levels, a.kana) - levelOf(levels, b.kana)) : shuffled;
  return ordered.slice(0, team.size);
}

export const startChallenge = (challenger: Challenger, team: readonly WildKana[]): Challenge =>
  ({ challenger, team, round: 0, playerHp: PLAYER_MAX_HP, readings: { answered: 0, correct: 0 }, mistakes: [] });

/** The challenger's kana the player is facing now. */
export const kanaInPlay = (challenge: Challenge): WildKana => challenge.team[challenge.round];

/** After a round: on to the challenger's next kana with the HP left, or the challenge is over. */
export function afterRound(challenge: Challenge, ended: BattleState): ChallengeStep {
  const readings = { answered: challenge.readings.answered + ended.readings.answered, correct: challenge.readings.correct + ended.readings.correct };
  const mistakes = [...challenge.mistakes, ...ended.mistakes];
  const { team } = challenge;
  if (ended.outcome !== "won") return { kind: "over", summary: { outcome: ended.outcome === "lost" ? "lost" : "ran", team, readings, mistakes } };
  const round = challenge.round + 1;
  if (round >= team.length) return { kind: "over", summary: { outcome: "won", team, readings, mistakes } };
  return { kind: "next", challenge: { ...challenge, round, playerHp: ended.playerHp, readings, mistakes } };
}
