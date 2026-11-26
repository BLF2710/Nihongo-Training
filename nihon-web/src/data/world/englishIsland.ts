// The English island on foot (docs/ENGLISH.md, phase 4): a shire round a castle, built from KayKit models (CC0, Kay
// Lousberg; scripts/world-models) and drawn in real 3D. Content only. North, behind a castle green, the castle (your
// level) and its watchtower (your progress); a river across the middle with a bridge; south of it the village square,
// with the church school (lessons) and the tavern (word games), and cottages along a lane by the shore. Hills and
// mountains rise from the sea beyond.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import type { VillageLayout } from "../../lib/errands/village.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import { groundTakenBy, tilesOfPeople } from "../../lib/world/islandModels.ts";
import type { Island3D, IslandPerson, ModelPlacement } from "../../lib/world/islandModels.ts";
import { place } from "./islandModelArt.ts";

/** An island walked in 3D: `localName` is its name in the learner's own language; `layout` is what walking needs. */
export type ModelIsland = { name: string; localName: string; scene: Island3D; layout: VillageLayout; doors: readonly Door[] };

/** Small enough that the whole castle shows on a laptop with the traveller at its gate. */
const CASTLE_SCALE = 0.85;
const FIELD_SCALE = 0.7;
const COPSE_SCALE = 0.8;
const MARKET_SCALE = 0.8;
/** The forest pack's trees are modelled bigger than the medieval pack's buildings. */
const FOREST_SCALE = 0.3;
const BUSH_SCALE = 0.4;
const GRASS_SCALE = 0.5;
/** The mountains beyond the shore are far bigger than the hexagon tiles they were modelled on. */
const MOUNTAIN_SCALE = 4;

const castle = place("castle", { x: 15, y: 2 }, { scale: CASTLE_SCALE });
const watchtower = place("tower_A", { x: 9, y: 5 });
const church = place("church", { x: 6, y: 18 });
const tavern = place("tavern", { x: 24, y: 17 });

const MODELS: readonly ModelPlacement[] = [
  castle, watchtower, place("tower_A", { x: 23, y: 5 }, { isMirrored: true }),
  place("fence_stone", { x: 12, y: 7 }), place("fence_stone", { x: 20, y: 7 }),
  place("flag_blue", { x: 14, y: 9 }, { isWalkable: true }), place("flag_blue", { x: 19, y: 9 }, { isWalkable: true }),
  place("trees_A_medium", { x: 2, y: 1 }), place("trees_B_medium", { x: 27, y: 1 }),
  place("windmill", { x: 3, y: 8 }), place("grain", { x: 4, y: 11 }, { scale: FIELD_SCALE }), place("wheelbarrow", { x: 8, y: 13 }),
  place("trees_A_small", { x: 11, y: 11 }, { scale: COPSE_SCALE }), place("tree_single_A", { x: 23, y: 10 }),
  place("blacksmith", { x: 27, y: 8 }), place("rock_single_C", { x: 31, y: 12 }), place("resource_lumber", { x: 30, y: 13 }),
  church, tavern, place("market", { x: 19, y: 18 }, { scale: MARKET_SCALE }), place("well", { x: 13, y: 21 }),
  place("barrel", { x: 28, y: 21 }), place("barrel", { x: 29, y: 21 }), place("crate_open", { x: 18, y: 22 }), place("sack", { x: 19, y: 22 }, { isWalkable: true }),
  place("tree_single_B", { x: 1, y: 20 }), place("tree_single_A", { x: 31, y: 19 }, { isMirrored: true }),
  place("home_A", { x: 3, y: 24 }), place("home_B", { x: 7, y: 24 }), place("forest_tree_3_a", { x: 11, y: 24 }, { scale: FOREST_SCALE }),
  place("forest_tree_1_a", { x: 20, y: 24 }, { scale: FOREST_SCALE }), place("home_A", { x: 24, y: 24 }, { isMirrored: true }), place("home_B", { x: 28, y: 24 }, { isMirrored: true }),
  place("forest_tree_2_a", { x: 29, y: 17 }, { scale: FOREST_SCALE }), place("forest_bush_3_a", { x: 3, y: 21 }, { scale: BUSH_SCALE }),
  place("forest_bush_3_a", { x: 14, y: 25 }, { scale: BUSH_SCALE, isMirrored: true }), place("forest_bush_3_a", { x: 18, y: 25 }, { scale: BUSH_SCALE }),
  ...[{ x: 24, y: 12 }, { x: 4, y: 17 }, { x: 22, y: 13 }, { x: 6, y: 6 }].map(corner => place("forest_grass_1_a", corner, { scale: GRASS_SCALE, isWalkable: true })),
];

/** The adventurers who live on the island, each at a door or a landmark. */
const PEOPLE: readonly IslandPerson[] = [
  { id: "knight", model: "knight", tile: { x: 15, y: 8 }, facing: "down" },
  { id: "mage", model: "mage", tile: { x: 5, y: 21 }, facing: "right" },
  { id: "barbarian", model: "barbarian", tile: { x: 27, y: 22 }, facing: "down" },
  { id: "ranger", model: "ranger", tile: { x: 19, y: 17 }, facing: "left" },
  { id: "rogue_hooded", model: "rogue_hooded", tile: { x: 23, y: 21 }, facing: "left" },
];

/** Mountains and wooded hills rising from the sea beyond the northern shore, and islets off the east and west. */
const BACKDROP: readonly ModelPlacement[] = [
  place("mountain_B_grass_trees", { x: -14, y: -26 }, { scale: MOUNTAIN_SCALE }), place("mountain_A_grass_trees", { x: 4, y: -30 }, { scale: MOUNTAIN_SCALE * 1.2 }),
  place("mountain_C_grass", { x: 24, y: -27 }, { scale: MOUNTAIN_SCALE }), place("hills_A_trees", { x: 38, y: -12 }, { scale: MOUNTAIN_SCALE * 0.7 }),
  place("hills_B_trees", { x: -16, y: -8 }, { scale: MOUNTAIN_SCALE * 0.7 }), place("hills_A_trees", { x: 40, y: 10 }, { scale: MOUNTAIN_SCALE * 0.5, isMirrored: true }),
  place("hills_B_trees", { x: -14, y: 14 }, { scale: MOUNTAIN_SCALE * 0.5 }),
];

/** The tile in front of the middle of a model's front, where its door is. */
const doorTile = ({ at }: ModelPlacement): Vector => ({ x: at.x + Math.floor(at.width / 2), y: at.y + at.height });

const DOORS: readonly Door[] = [
  { id: "castle", label: "The castle: choose your level", href: "/levels", tile: doorTile(castle) },
  { id: "watchtower", label: "The watchtower: your progress", href: "/statistics/english", tile: doorTile(watchtower) },
  { id: "church", label: "The church school: lessons", href: "/lessons", tile: doorTile(church) },
  { id: "tavern", label: "The tavern: word games", href: "/arcade", tile: doorTile(tavern) },
];

const MAP = parseTownMap([
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~................................~",
  "~................................~",
  "~................................~",
  "~................................~",
  "~................................~",
  "~................................~",
  "~................................~",
  "~.........,,,,,,,,,,,,,,,........~",
  "~.........,,,,,,,,,,,,,,,........~",
  "~.........,,,,,,,,,,,,,,,........~",
  "~................=...............~",
  "~................=...............~",
  "~................=...............~",
  "~................=...............~",
  "~~~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~~~",
  "~................=...............~",
  "~................=...............~",
  "~.........==============.........~",
  "~.........==============.........~",
  "~.....=======================....~",
  "~.....=======================....~",
  "~.....=======================....~",
  "~................=...............~",
  "~................=...............~",
  "~................=...............~",
  "~..============================..~",
  "~................=...............~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
]);

export const ENGLISH_ISLAND: ModelIsland = {
  name: "The English Isle", localName: "Đảo Tiếng Anh", doors: DOORS,
  scene: { map: MAP, models: MODELS, people: PEOPLE, backdrop: BACKDROP, traveller: "rogue", doors: DOORS },
  layout: {
    map: MAP, start: { x: 17, y: 24 }, buildings: [], gates: [], lanterns: [], villagers: [],
    obstacles: [...groundTakenBy(MODELS), ...tilesOfPeople(PEOPLE)],
  },
};
