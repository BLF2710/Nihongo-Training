// A village: its ground, buildings, gates, villagers and errands, and what stands in the traveller's way right now.
import type { CharacterId } from "../cast.ts";
import type { Villager } from "./conversation.ts";
import { meetsAll } from "./errandsState.ts";
import type { Condition, ErrandsState, ItemId, Quest } from "./errandsState.ts";
import type { Vector } from "./movement.ts";
import { blockedTiles } from "./townMap.ts";
import type { Rect, TileKey, TownMap } from "./townMap.ts";

export type RoofColour = "vermilion" | "indigo" | "moss" | "wood";
/** What a building is, which decides how it's drawn (a shrine has a torii in front, the post office a postbox…). */
export type BuildingLook =
  | "house" | "home" | "bakery" | "school" | "kana-school" | "shrine" | "dojo" | "calligraphy"
  | "post-office" | "stall" | "teahouse" | "practice-hall" | "onsen";
/** A building's sign is Japanese (its kanji or kana is part of what the learner reads); `label` says it in English. */
export type Building = Rect & { id: string; sign: string; label: string; roof: RoofColour; look: BuildingLook };
export type Gate = Rect & { id: string; label: string; opensWhen: readonly Condition[] };
export type Item = { id: ItemId; japanese: string; english: string; icon: string };
/** Someone standing on a tile of the village. */
export type Resident = { id: CharacterId; tile: Vector };

/** What a village looks like and where people stand: enough to walk around it. `lanterns` are paper lanterns along the
 *  streets, lit as the learner gets things done. */
export type VillageLayout = {
  map: TownMap; start: Vector;
  buildings: readonly Building[]; gates: readonly Gate[]; lanterns: readonly Vector[];
  villagers: readonly Resident[];
};

/** A story village: a layout whose villagers talk, with errands to run. Its lanterns light once every errand is done. */
export type Village = Omit<VillageLayout, "villagers"> & {
  id: string; name: string; japaneseName: string; level: "N5";
  villagers: readonly Villager[]; quests: readonly Quest[]; items: Readonly<Record<ItemId, Item>>;
  lanternsLitWhen: readonly Condition[];
};

export const isGateOpen = (gate: Gate, state: ErrandsState) => meetsAll(state, gate.opensWhen);

export const openGateIds = (village: Village, state: ErrandsState) => village.gates.filter(gate => isGateOpen(gate, state)).map(gate => gate.id);

/** The tiles that can't be walked through with these gates open: blocking ground, buildings, closed gates and villagers. */
export function blockedTilesWithOpenGates(village: VillageLayout, openIds: readonly string[]): ReadonlySet<TileKey> {
  const closedGates = village.gates.filter(gate => !openIds.includes(gate.id));
  const villagers = village.villagers.map(({ tile }) => ({ ...tile, width: 1, height: 1 }));
  return blockedTiles(village.map, [...village.buildings, ...closedGates, ...villagers]);
}

export const villageBlockedTiles = (village: Village, state: ErrandsState) => blockedTilesWithOpenGates(village, openGateIds(village, state));

export const isVillageComplete = (village: Village, state: ErrandsState) => village.quests.every(quest => state.finished.includes(quest.id));
