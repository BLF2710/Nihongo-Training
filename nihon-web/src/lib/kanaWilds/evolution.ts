// Evolution (docs/KANA-BATTLE.md section 9): a kana the player owns evolves once they have mastered it well enough, in
// the kinds of evolution they have opened. Beating Sensei opens the voiced kind (か → が, さ → ざ, た → だ, は → ば, then
// ば → ぱ); beating Zen opens the small-kana kind (き → きゃ, きゅ, きょ, and ぎ → ぎゃ… once ぎ has evolved). Nothing is
// caught again, and the base kana stays. Pure; mastery comes from the answers the API reports.
import { HIRAGANA_ROWS, VOICED_ROWS_OF_KANA, YOON_HIRAGANA } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";
import { levelOf } from "./mastery.ts";
import type { KanaLevels, MasteryLevel } from "./mastery.ts";

/** A kana evolves once its mastery reaches this level. */
export const EVOLVE_AT_LEVEL: MasteryLevel = 3;

export type EvolutionKind = "voiced" | "small-kana";
export type EvolutionKinds = ReadonlySet<EvolutionKind>;
/** One kana evolving into another. */
export type Evolution = { from: string; to: WildKana; kind: EvolutionKind };

/** Which row evolves into which: the voiced row's kana in the same places as the base row's. */
const ROW_EVOLUTIONS: readonly (readonly [string, string])[] = [["k", "g"], ["s", "z"], ["t", "d"], ["h", "b"], ["b", "p"]];

const rowOf = (row: string) => [...HIRAGANA_ROWS, ...VOICED_ROWS_OF_KANA].find(candidate => candidate.row === row)?.kana ?? [];

const VOICED_EVOLUTIONS: readonly Evolution[] = ROW_EVOLUTIONS.flatMap(([base, voiced]) =>
  rowOf(base).flatMap((kana, index) => {
    const evolved = rowOf(voiced)[index];
    return evolved ? [{ from: kana.kana, to: evolved, kind: "voiced" as const }] : [];
  }));

/** Each small-kana combination comes from its first kana: きゃ from き. */
const SMALL_KANA_EVOLUTIONS: readonly Evolution[] = YOON_HIRAGANA.map(to => ({ from: [...to.kana][0] ?? "", to, kind: "small-kana" as const }));

const EVOLUTIONS: readonly Evolution[] = [...VOICED_EVOLUTIONS, ...SMALL_KANA_EVOLUTIONS];

/** What `kana` evolves into in the kinds open, if anything. */
export const evolutionsOf = (kana: string, kinds: EvolutionKinds): Evolution[] =>
  EVOLUTIONS.filter(evolution => evolution.from === kana && kinds.has(evolution.kind));

/** The evolutions that have happened from `owned` (characters): every one whose kana has reached EVOLVE_AT_LEVEL,
 *  then theirs in turn (ば → ぱ, ぎ → ぎゃ), in table order of what they became. */
export function evolutionsMade(owned: ReadonlySet<string>, levels: KanaLevels, kinds: EvolutionKinds): Evolution[] {
  const made = new Map<string, Evolution>();
  let frontier = [...owned];
  while (frontier.length) {
    const next = frontier.flatMap(kana => levelOf(levels, kana) < EVOLVE_AT_LEVEL ? [] : evolutionsOf(kana, kinds))
      .filter(evolution => !owned.has(evolution.to.kana) && !made.has(evolution.to.kana));
    next.forEach(evolution => made.set(evolution.to.kana, evolution));
    frontier = next.map(evolution => evolution.to.kana);
  }
  return [...made.values()].sort((a, b) => a.to.id - b.to.id);
}

/** The kana that have evolved from `owned`, in table order. */
export const evolvedKana = (owned: ReadonlySet<string>, levels: KanaLevels, kinds: EvolutionKinds): WildKana[] =>
  evolutionsMade(owned, levels, kinds).map(evolution => evolution.to);

/** An evolution still to come: the owned kana, what it becomes (small kana: three at once), and its mastery now. */
export type PendingEvolution = { from: string; to: readonly string[]; level: MasteryLevel };

/** The evolutions the player's kana are working toward, the closest first: owned (or evolved) kana that evolve but
 *  haven't yet. */
export function pendingEvolutions(owned: ReadonlySet<string>, levels: KanaLevels, kinds: EvolutionKinds): PendingEvolution[] {
  const have = new Set([...owned, ...evolvedKana(owned, levels, kinds).map(kana => kana.kana)]);
  return [...have].flatMap(kana => {
    const forms = evolutionsOf(kana, kinds).map(evolution => evolution.to.kana).filter(form => !have.has(form));
    return forms.length ? [{ from: kana, to: forms, level: levelOf(levels, kana) }] : [];
  }).sort((a, b) => b.level - a.level);
}

/** The evolutions not yet announced to the player (the evolution moment: "か evolved into が!"). */
export const unannouncedEvolutions = (made: readonly Evolution[], announced: ReadonlySet<string>): Evolution[] =>
  made.filter(evolution => !announced.has(evolution.to.kana));
