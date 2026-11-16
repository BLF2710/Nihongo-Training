// Which wild kana appears in the tall grass: kana not yet caught, from the earliest of the given rows still incomplete,
// so the table fills in row by row. Once those rows are all caught, their kana still appear for practice.
import { HIRAGANA_ROWS } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";

/** How many incomplete rows wild kana come from at once. */
export const ENCOUNTER_ROW_SPAN = 2;

export type Encounter = { kana: WildKana; isCatchable: boolean };

const pickOne = <T>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(random() * items.length))];

/** A wild kana from `wildRows` (row keys, as in HIRAGANA_ROWS): a path's rows, or every row of the paths open. */
export function pickEncounter(ownedIds: ReadonlySet<number>, wildRows: readonly string[], random: () => number): Encounter {
  const rows = HIRAGANA_ROWS.filter(({ row }) => wildRows.includes(row));
  if (!rows.length) throw new Error("Wild kana need at least one row to come from.");
  const openRows = rows.filter(({ kana }) => kana.some(item => !ownedIds.has(item.id))).slice(0, ENCOUNTER_ROW_SPAN);
  const wild = openRows.flatMap(({ kana }) => kana.filter(item => !ownedIds.has(item.id)));
  if (wild.length) return { kana: pickOne(wild, random), isCatchable: true };
  return { kana: pickOne(rows.flatMap(({ kana }) => kana), random), isCatchable: false };
}
