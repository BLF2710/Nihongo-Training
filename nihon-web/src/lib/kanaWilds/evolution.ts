// Evolution (docs/KANA-BATTLE.md section 9): once Sensei is beaten, a kana the player owns evolves into its voiced
// form when they have mastered it well enough: か → が, さ → ざ, た → だ, は → ば, and ば → ぱ. Nothing is caught
// again, and the base kana stays. Pure; mastery comes from the answers the API reports.
import { HIRAGANA_ROWS, VOICED_ROWS_OF_KANA } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";
import { levelOf } from "./mastery.ts";
import type { KanaLevels, MasteryLevel } from "./mastery.ts";

/** A kana evolves once its mastery reaches this level. */
export const EVOLVE_AT_LEVEL: MasteryLevel = 3;

/** Which row evolves into which: the voiced row's kana in the same places as the base row's. */
const ROW_EVOLUTIONS: readonly (readonly [string, string])[] = [["k", "g"], ["s", "z"], ["t", "d"], ["h", "b"], ["b", "p"]];

const rowOf = (row: string) => [...HIRAGANA_ROWS, ...VOICED_ROWS_OF_KANA].find(candidate => candidate.row === row)?.kana ?? [];

const EVOLUTIONS: ReadonlyMap<string, WildKana> = new Map(ROW_EVOLUTIONS.flatMap(([base, voiced]) =>
  rowOf(base).flatMap((kana, index) => {
    const evolved = rowOf(voiced)[index];
    return evolved ? [[kana.kana, evolved] as const] : [];
  })));

/** What `kana` evolves into, if anything. */
export const evolutionOf = (kana: string): WildKana | undefined => EVOLUTIONS.get(kana);

/** The kana that have evolved from `owned` (characters): every evolution whose kana has reached EVOLVE_AT_LEVEL,
 *  then theirs in turn (ば → ぱ), in table order. */
export function evolvedKana(owned: ReadonlySet<string>, levels: KanaLevels): WildKana[] {
  const evolved: WildKana[] = [];
  let frontier = [...owned];
  while (frontier.length) {
    const next = frontier.flatMap(kana => {
      const form = evolutionOf(kana);
      const isReady = form && levelOf(levels, kana) >= EVOLVE_AT_LEVEL && !owned.has(form.kana) && !evolved.includes(form);
      return isReady ? [form] : [];
    });
    evolved.push(...next);
    frontier = next.map(form => form.kana);
  }
  return evolved.sort((a, b) => a.id - b.id);
}

/** An evolution still to come: the owned kana, what it becomes, and how far its mastery has to go. */
export type PendingEvolution = { from: string; to: string; level: MasteryLevel };

/** The evolutions the player's kana are working toward, the closest first: owned (or evolved) kana that evolve but
 *  haven't yet. */
export function pendingEvolutions(owned: ReadonlySet<string>, levels: KanaLevels): PendingEvolution[] {
  const have = new Set([...owned, ...evolvedKana(owned, levels).map(kana => kana.kana)]);
  return [...have].flatMap(kana => {
    const form = evolutionOf(kana);
    return form && !have.has(form.kana) ? [{ from: kana, to: form.kana, level: levelOf(levels, kana) }] : [];
  }).sort((a, b) => b.level - a.level);
}
