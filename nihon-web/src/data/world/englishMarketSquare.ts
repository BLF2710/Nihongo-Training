// The market square (/english/market-square), at the east end of the English isle's shore lane (docs/ENGLISH.md, phase
// 4): the English learner's town square, as the village square is the Japanese learner's. Built from KayKit models (CC0,
// Kay Lousberg; scripts/world-models). Content only. Round a cobbled square: the tavern (word games), the market stalls
// (vocabulary) and two houses along the north, the scribe's tent (grammar) to the west, the stage (speaking) to the east
// and the well in the middle. Four townsfolk give the day's news and errands (lib/englishTown), and the banners round
// the square turn from blue to gold as the errands get done. The lane back to the island leaves to the west.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import { groundTakenBy, tilesOfPeople } from "../../lib/world/islandModels.ts";
import type { IslandPerson, ModelPlacement, SwitchedLantern } from "../../lib/world/islandModels.ts";
import { place } from "./islandModelArt.ts";
import { doorTile, townspersonStanding } from "./modelIsland.ts";
import type { ModelIsland, TownsfolkPlace } from "./modelIsland.ts";

const MOUNTAIN_SCALE = 4;
const COPSE_SCALE = 0.8;
const WIDTH = 32;

const tavern = place("tavern", { x: 3, y: 2 });
const market = place("market", { x: 13, y: 2 });
const tent = place("tent", { x: 4, y: 11 });
const stage = place("stage", { x: 24, y: 10 });

const MODELS: readonly ModelPlacement[] = [
  tavern, market, tent, stage, place("well", { x: 15, y: 11 }),
  place("home_B", { x: 21, y: 2 }), place("home_A", { x: 26, y: 3 }, { isMirrored: true }),
  place("crate_open", { x: 12, y: 5 }), place("barrel", { x: 18, y: 5 }), place("sack", { x: 19, y: 5 }, { isWalkable: true }),
  place("barrel", { x: 8, y: 4 }), place("wheelbarrow", { x: 10, y: 14 }), place("crate_A_big", { x: 28, y: 14 }),
  place("trees_A_small", { x: 1, y: 18 }, { scale: COPSE_SCALE }), place("tree_single_A", { x: 12, y: 19 }), place("tree_single_B", { x: 19, y: 19 }),
  place("trees_A_small", { x: 27, y: 18 }, { scale: COPSE_SCALE }), place("tree_single_B", { x: 30, y: 2 }), place("tree_single_A", { x: 1, y: 3 }),
];

/** Round the square: the errand banners, blue until the day's errands are done, gold as they get done. */
const BANNER_TILES: readonly Vector[] = [2, 9, 21, 29].flatMap(x => [{ x, y: 8 }, { x, y: 16 }]);
const BANNERS: readonly SwitchedLantern[] = BANNER_TILES.map(tile => ({ lit: place("flag_yellow", tile), unlit: place("flag_blue", tile) }));

const TOWNSFOLK: readonly TownsfolkPlace[] = [
  { id: "barbarian", tile: { x: 18, y: 7 }, facing: "down" },
  { id: "rogue_hooded", tile: { x: 8, y: 7 }, facing: "down" },
  { id: "mage", tile: { x: 18, y: 12 }, facing: "left" },
  { id: "ranger", tile: { x: 23, y: 12 }, facing: "right" },
];
const PEOPLE: readonly IslandPerson[] = TOWNSFOLK.map(townspersonStanding);

const BACKDROP: readonly ModelPlacement[] = [
  place("mountain_B_grass_trees", { x: -8, y: -26 }, { scale: MOUNTAIN_SCALE }), place("mountain_A_grass_trees", { x: 16, y: -28 }, { scale: MOUNTAIN_SCALE }),
  place("hills_A_trees", { x: 36, y: -6 }, { scale: MOUNTAIN_SCALE * 0.7 }), place("hills_B_trees", { x: -16, y: 4 }, { scale: MOUNTAIN_SCALE * 0.6 }),
];

const DOORS: readonly Door[] = [
  { id: "tavern", label: "The tavern: word games", href: "/arcade", tile: doorTile(tavern) },
  { id: "market", label: "The market stalls: vocabulary", href: "/english/vocabulary", tile: doorTile(market) },
  { id: "tent", label: "The scribe's tent: grammar", href: "/english/grammar", tile: doorTile(tent) },
  { id: "stage", label: "The stage: speaking", href: "/english/speaking", tile: doorTile(stage), action: "Perform" },
  { id: "lane", label: "The lane: back to the island", href: "/english/island", tile: { x: 0, y: 12 }, action: "Leave" },
];

const grass = (length: number) => ".".repeat(length);
const square = (road: string) => `${road}${"=".repeat(WIDTH - 2)}.`;
const MAP = parseTownMap([
  ...Array.from({ length: 7 }, () => grass(WIDTH)),
  ...Array.from({ length: 5 }, () => square(".")),
  // The lane west, back to the island, leaves from the middle of the square.
  square("="), square("="),
  ...Array.from({ length: 4 }, () => square(".")),
  ...Array.from({ length: 4 }, () => grass(WIDTH)),
]);

export const ENGLISH_MARKET_SQUARE: ModelIsland = {
  name: "The Market Square", localName: "Quảng trường chợ", doors: DOORS, townsfolk: TOWNSFOLK,
  scene: { map: MAP, models: MODELS, people: PEOPLE, backdrop: BACKDROP, traveller: "rogue", doors: DOORS, lanterns: BANNERS },
  layout: {
    map: MAP, start: { x: 2, y: 12 }, buildings: [], gates: [], lanterns: [], villagers: [],
    obstacles: [...groundTakenBy(MODELS), ...BANNER_TILES.map(tile => ({ ...tile, width: 1, height: 1 })), ...tilesOfPeople(PEOPLE)],
  },
};
