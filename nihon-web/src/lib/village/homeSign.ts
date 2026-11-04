// The sign on the learner's own house in the village square: their name and のいえ ("'s house"). Pure, so it runs
// under node.
import type { VillageLayout } from "../errands/village.ts";

/** Longer names are cut short (in characters, not UTF-16 units), so the sign still fits across the house. */
const MAX_NAME_CHARACTERS = 10;
const PLAIN_SIGN = "いえ";

export function homeSign(name: string | null): string {
  const characters = Array.from(name?.normalize("NFC").trim() ?? "");
  if (characters.length === 0) return PLAIN_SIGN;
  const shown = characters.length > MAX_NAME_CHARACTERS ? `${characters.slice(0, MAX_NAME_CHARACTERS - 1).join("")}…` : characters.join("");
  return `${shown} の${PLAIN_SIGN}`;
}

/** The layout with the building `homeId` signed for `name`. */
export function withHomeSign(layout: VillageLayout, homeId: string, name: string | null): VillageLayout {
  const sign = homeSign(name);
  return { ...layout, buildings: layout.buildings.map(building => building.id === homeId ? { ...building, sign } : building) };
}
