// The castle courtyard (/english/castle), inside the English isle's castle (docs/ENGLISH.md, phase 4), built from KayKit
// models (CC0, Kay Lousberg; scripts/world-models). Content only. A curtain wall round three sides, with low stone fences
// and the gatehouse on the south, so the camera sees in. The keep's great hall (choose your level, then the study
// dashboard) stands at the back, the barracks (unit tests) to the west, the catapult tower (your progress) to the
// east, and the training yard's targets (the mock exam) in the south-east. Sir Edmund, the castle knight, keeps the yard.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import { groundTakenBy, tilesOfPeople } from "../../lib/world/islandModels.ts";
import type { ModelPlacement } from "../../lib/world/islandModels.ts";
import { place } from "./islandModelArt.ts";
import { doorTile, townspersonStanding } from "./modelIsland.ts";
import type { ModelIsland, TownsfolkPlace } from "./modelIsland.ts";

const KEEP_SCALE = 0.85;
/** Lower than the walls, so the camera, looking in from the south, sees the traveller over it. */
const GATEHOUSE_SCALE = 0.6;
const MOUNTAIN_SCALE = 4;
/** The pack's straight wall is two model units long: six tiles. */
const WALL_LENGTH = 6;
const WIDTH = 30;

const keep = place("castle", { x: 13, y: 2 }, { scale: KEEP_SCALE });
const barracks = place("barracks", { x: 4, y: 3 });
const tower = place("tower_catapult", { x: 23, y: 3 });
const gatehouse = place("wall_straight_gate", { x: 12, y: 14 }, { scale: GATEHOUSE_SCALE });

const northWall = [0, 1, 2, 3, 4].map(index => place("wall_straight", { x: index * WALL_LENGTH, y: 0 }));
const sideWalls = [2, 8].flatMap(y => [place("wall_straight", { x: 0, y }, { facing: "right" }), place("wall_straight", { x: WIDTH - 2, y }, { facing: "left" })]);
/** Low fences either side of the gatehouse, three tiles each, and stores stacked in the corner they leave. */
const southFences = [0, 3, 6, 9, 16, 19, 22, 25].map(x => place("fence_stone", { x, y: 14 }, { facing: "right" }));
const cornerStores = [place("crate_A_big", { x: 28, y: 14 }), place("barrel", { x: 29, y: 14 })];

const MODELS: readonly ModelPlacement[] = [
  ...northWall, ...sideWalls, ...southFences, ...cornerStores, gatehouse, keep, barracks, tower,
  place("flag_red", { x: 12, y: 8 }, { isWalkable: true }), place("flag_red", { x: 18, y: 8 }, { isWalkable: true }),
  place("barrel", { x: 3, y: 9 }), place("crate_A_big", { x: 4, y: 9 }), place("bucket_water", { x: 9, y: 9 }), place("resource_stone", { x: 26, y: 8 }),
  place("weaponrack", { x: 20, y: 11 }), ...[22, 24, 26].map(x => place("target", { x, y: 11 })),
];

const TOWNSFOLK: readonly TownsfolkPlace[] = [{ id: "knight", tile: { x: 13, y: 10 }, facing: "right" }];
const PEOPLE = TOWNSFOLK.map(townspersonStanding);

const BACKDROP: readonly ModelPlacement[] = [
  place("mountain_A_grass_trees", { x: -4, y: -26 }, { scale: MOUNTAIN_SCALE }), place("mountain_C_grass", { x: 20, y: -24 }, { scale: MOUNTAIN_SCALE }),
  place("hills_A_trees", { x: 34, y: -8 }, { scale: MOUNTAIN_SCALE * 0.7 }), place("hills_B_trees", { x: -16, y: -6 }, { scale: MOUNTAIN_SCALE * 0.7 }),
];

const DOORS: readonly Door[] = [
  { id: "great-hall", label: "The great hall: choose your level", href: "/levels?next=/dashboard", tile: doorTile(keep) },
  { id: "barracks", label: "The barracks: unit tests", href: "/quizzes", tile: doorTile(barracks) },
  { id: "tower", label: "The tower: your progress", href: "/statistics/english", tile: doorTile(tower) },
  { id: "training-yard", label: "The training yard: mock exam", href: "/english/mock-exam", tile: { x: 24, y: 12 }, action: "Train" },
  { id: "gate", label: "The gate: back to the island", href: "/english/island", tile: { x: 14, y: 13 }, action: "Leave" },
];

const MAP = parseTownMap([
  ...Array.from({ length: 8 }, () => ",".repeat(WIDTH)),
  ...Array.from({ length: 6 }, () => `${",".repeat(15)}=${",".repeat(WIDTH - 16)}`),
  ...Array.from({ length: 3 }, () => ",".repeat(WIDTH)),
]);

export const ENGLISH_COURTYARD: ModelIsland = {
  name: "The Castle Courtyard", localName: "Sân lâu đài", doors: DOORS, townsfolk: TOWNSFOLK,
  scene: { map: MAP, models: MODELS, people: PEOPLE, backdrop: BACKDROP, traveller: "rogue", doors: DOORS },
  layout: {
    // In the middle of a tile (positions are at the traveller's feet), clear of Sir Edmund and the gate.
    map: MAP, start: { x: 16.5, y: 11.5 }, buildings: [], gates: [], lanterns: [], villagers: [],
    obstacles: [...groundTakenBy(MODELS), ...tilesOfPeople(PEOPLE)],
  },
};
