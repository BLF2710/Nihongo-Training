// Which wild kana appears in the tall grass: kana not yet caught, from the earliest rows still incomplete, so the
// table fills in row by row. Once everything is caught, owned kana still appear for practice.
import { BASIC_HIRAGANA, HIRAGANA_ROWS } from "./gojuon.ts";
import type { WildKana } from "./gojuon.ts";

/** How many incomplete rows wild kana come from at once. */
export const ENCOUNTER_ROW_SPAN = 2;

export type Encounter = { kana: WildKana; isCatchable: boolean };

const pickOne = <T>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(random() * items.length))];

export function pickEncounter(ownedIds: ReadonlySet<number>, random: () => number): Encounter {
  const openRows = HIRAGANA_ROWS.filter(({ kana }) => kana.some(item => !ownedIds.has(item.id))).slice(0, ENCOUNTER_ROW_SPAN);
  const wild = openRows.flatMap(({ kana }) => kana.filter(item => !ownedIds.has(item.id)));
  if (wild.length) return { kana: pickOne(wild, random), isCatchable: true };
  return { kana: pickOne(BASIC_HIRAGANA, random), isCatchable: false };
}
