// The islands at the far end of the wild paths, on foot (docs/WORLD.md section 3). Content only.
// Each island has its own ground and look, after its art on the island map: the Kana island a temple garden under
// cherry trees, the Practice island a courtyard in a bamboo grove, the Games island a festival ground. All share the
// way in: a bridge on the west side (rows 6–7) where the path arrives.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Building, BuildingLook, RoofColour } from "../../lib/errands/village.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import type { IslandScene } from "../../lib/world/islandScenes.ts";
import { CHALLENGERS } from "./challengers.ts";
import { routeHref } from "../../lib/world/routes.ts";
import type { RouteId } from "../../lib/world/routes.ts";

/** Where the path arrives: on the road just past the bridge. */
const ARRIVAL = { x: 5, y: 7 };
const BRIDGE_END = { x: 1, y: 6 };
const HALL_SIZE = { width: 4, height: 3 };
const STALL_SIZE = { width: 4, height: 2 };

/** A building of the island (its top-left tile `at`) and the page its door opens. `sign` is the Japanese on it;
 *  `label` says it in English. Its door is in the middle of its front (south) wall. */
type Stop = { id: string; sign: string; label: string; href: string; look: BuildingLook; roof: RoofColour; at: Vector; size: { width: number; height: number } };

const buildingOf = ({ id, sign, label, look, roof, at, size }: Stop): Building => ({ id, sign, label, look, roof, ...at, ...size });
const doorOf = ({ id, label, href, at, size }: Stop): Door => ({ id, label, href, tile: { x: at.x + size.width / 2, y: at.y + size.height } });

type IslandContent = Omit<IslandScene, "layout" | "doors"> & {
  rows: readonly string[]; stops: readonly Stop[]; challengerTile: Vector; lanterns?: readonly Vector[];
  route: RouteId; pathName: string;
};

function islandScene({ rows, stops, challengerTile, lanterns = [], route, pathName, ...scene }: IslandContent): IslandScene {
  const backToPath: Door = { id: "path-back", label: `Back along ${pathName} to the village`, href: routeHref(route, scene.island), tile: BRIDGE_END, action: "Go" };
  return {
    ...scene,
    layout: {
      map: parseTownMap(rows), start: ARRIVAL, buildings: stops.map(buildingOf), gates: [], lanterns,
      villagers: [{ id: CHALLENGERS[scene.challenger].character, tile: challengerTile }],
    },
    doors: [...stops.map(doorOf), backToPath],
  };
}

const KANA = islandScene({
  island: "kana", name: "The Kana island", japaneseName: "かなのしま", challenger: "chun", route: "home-kana", pathName: "the meadow path",
  theme: "sakura",
  // A temple garden: a building at each corner (the front two a row back from the road, so they don't hide whoever
  // walks it), and Chun in the petal-strewn square under a ring of cherry trees.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~S....SSSSSSSSSSSSSS....S~~~",
    "~S.......S..........S.......S~",
    "~S.S.......SSS.SS.S.......S.S~",
    "~S...===...pppppppp....===.pS~",
    "~S...===...pppppppp....===..S~",
    "bbb=========================S~",
    "bbb=========================S~",
    "~S......=..pppppppp..=......S~",
    "~Sp.....=.SppppppppS.=......S~",
    "~S.S....=..SS.pp.SS..=....S.S~",
    "~S......=............=......S~",
    "~~~S.====............====.S~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 15, y: 8 },
  stops: [
    { id: "hiragana", sign: "ひらがな", label: "Hiragana: flashcards, stroke order and writing", href: "/learn/hiragana", look: "kana-school", roof: "indigo", at: { x: 4, y: 1 }, size: HALL_SIZE },
    { id: "katakana", sign: "カタカナ", label: "Katakana: flashcards, stroke order and writing", href: "/learn/katakana", look: "kana-school", roof: "vermilion", at: { x: 22, y: 1 }, size: HALL_SIZE },
    { id: "kana-review", sign: "ふくしゅう", label: "Kana review: characters you still find hard", href: "/review/hiragana", look: "calligraphy", roof: "moss", at: { x: 4, y: 9 }, size: HALL_SIZE },
    { id: "kana-wilds", sign: "ずかん", label: "Kana Wilds: your kana collection", href: "/games/kana-wilds", look: "stall", roof: "wood", at: { x: 22, y: 9 }, size: HALL_SIZE },
  ],
});

const PRACTICE = islandScene({
  island: "practice", name: "The Practice island", japaneseName: "れんしゅうのしま", challenger: "tama", route: "home-practice", pathName: "the riverside path",
  theme: "bamboo",
  // A gravel courtyard inside a bamboo grove: two halls at the back, one at the front, and Tama by the pond.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~BBBBBBBBBBBBBBBBBBBBBBBBBBBB~",
    "~BBB......................BBB~",
    "~BB........................BB~",
    "~B..........................B~",
    "~B.......,,,,,,,,,,,,,,,,,,.B~",
    "bbb======,,,,,,,,,,,,,,,,,,.B~",
    "bbb======,,,,,,,,,,,,,,,,,,.B~",
    "~B.......,,,,,,,,~~~~*,,,,,.B~",
    "~B..*....,,,,,,,*~~~~,,,,,,.B~",
    "~BB......,,,,,,,,,,,,,,,,,,BB~",
    "~BBB.....B,,,,,,BB,,,,,,,,BBB~",
    "~BBBBBBBBB,,,,,,BBBBBBBBBBBBB~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 22, y: 9 },
  stops: [
    { id: "listening", sign: "きく", label: "Listening: words, sentences and dialogues", href: "/listening", look: "practice-hall", roof: "wood", at: { x: 4, y: 2 }, size: HALL_SIZE },
    { id: "speaking", sign: "はなす", label: "Speaking: say it aloud and get checked", href: "/speaking", look: "dojo", roof: "vermilion", at: { x: 20, y: 2 }, size: HALL_SIZE },
    { id: "reading", sign: "よむ", label: "Reading: short passages with questions", href: "/reading", look: "calligraphy", roof: "indigo", at: { x: 11, y: 9 }, size: HALL_SIZE },
  ],
});

const GAMES = islandScene({
  island: "games", name: "The Games island", japaneseName: "あそびのしま", challenger: "pon", route: "home-games", pathName: "the forest path",
  theme: "festival",
  // A festival ground: stalls round a square of beaten earth hung with lanterns, and Pon by the goldfish pool.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~TTTTTTTTTTTTTTTTTTTTTTTT~~~",
    "~T..TT..................TT..T~",
    "~T....*.....................T~",
    "~T......==================..T~",
    "~T......==================.TT~",
    "bbb=======================..T~",
    "bbb==========ggggg========..T~",
    "~T......=====ggggg========..T~",
    "~T..*...==================*.T~",
    "~T.T....==================..T~",
    "~T..T...==================..T~",
    "~~~TTTTTTTTTTTTTTTTTTTTTTTT~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 15, y: 9 },
  lanterns: [{ x: 7, y: 4 }, { x: 26, y: 4 }, { x: 12, y: 6 }, { x: 18, y: 6 }, { x: 12, y: 9 }, { x: 18, y: 9 }, { x: 8, y: 11 }, { x: 25, y: 11 }],
  stops: [
    { id: "errands", sign: "おつかい", label: "Island Errands: walk the village and run errands in Japanese", href: "/games/errands", look: "stall", roof: "vermilion", at: { x: 8, y: 2 }, size: STALL_SIZE },
    { id: "particles", sign: "じょし", label: "Particle Drop: fill in は, を, に against the clock", href: "/games/particles", look: "stall", roof: "indigo", at: { x: 17, y: 2 }, size: STALL_SIZE },
    { id: "kana-speed", sign: "はやよみ", label: "Kana speed quiz: read kana as fast as you can", href: "/practice?type=hiragana", look: "stall", roof: "moss", at: { x: 19, y: 9 }, size: STALL_SIZE },
  ],
});

export const ISLAND_SCENES: readonly IslandScene[] = [KANA, PRACTICE, GAMES];

export const islandSceneOf = (island: string): IslandScene | null => ISLAND_SCENES.find(scene => scene.island === island) ?? null;
