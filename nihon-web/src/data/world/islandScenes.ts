// The islands at the far end of the wild paths, on foot (docs/WORLD.md section 3). Content only.
// Each island has its own ground and look, after its art on the island map: the Kana island a temple garden under
// cherry trees, the Practice island a courtyard in a bamboo grove, the Games island a festival ground, the Lessons
// island a temple school in an autumn maple garden. Each island's bridge is on the side facing Home, where its path
// arrives: west for Kana, east for Practice, north for Games, south for Lessons.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Building, BuildingLook, RoofColour } from "../../lib/errands/village.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import type { IslandScene } from "../../lib/world/islandScenes.ts";
import { CHALLENGERS } from "./challengers.ts";
import { routeHref } from "../../lib/world/routes.ts";
import type { RouteId } from "../../lib/world/routes.ts";

/** The island's bridge to its path: the tile at its end (the way back) and where the traveller arrives off the path,
 *  on the road just past it. */
type Bridge = { end: Vector; arrival: Vector };
const WEST_BRIDGE: Bridge = { end: { x: 1, y: 6 }, arrival: { x: 5, y: 7 } };
const EAST_BRIDGE: Bridge = { end: { x: 28, y: 6 }, arrival: { x: 23, y: 7 } };
const NORTH_BRIDGE: Bridge = { end: { x: 14, y: 1 }, arrival: { x: 15, y: 5 } };
const SOUTH_BRIDGE: Bridge = { end: { x: 14, y: 12 }, arrival: { x: 15, y: 10 } };
const PAGODA_SIZE = { width: 4, height: 3 };
const HALL_SIZE = { width: 4, height: 3 };
const STALL_SIZE = { width: 4, height: 2 };

/** A building of the island (its top-left tile `at`) and the page its door opens. `sign` is the Japanese on it;
 *  `label` says it in English. Its door is in the middle of its front (south) wall. */
type Stop = { id: string; sign: string; label: string; href: string; look: BuildingLook; roof: RoofColour; at: Vector; size: { width: number; height: number } };

const buildingOf = ({ id, sign, label, look, roof, at, size }: Stop): Building => ({ id, sign, label, look, roof, ...at, ...size });
const doorOf = ({ id, label, href, at, size }: Stop): Door => ({ id, label, href, tile: { x: at.x + size.width / 2, y: at.y + size.height } });

type IslandContent = Omit<IslandScene, "layout" | "doors"> & {
  rows: readonly string[]; stops: readonly Stop[]; challengerTile: Vector; lanterns?: readonly Vector[];
  route: RouteId; pathName: string; bridge: Bridge;
};

function islandScene({ rows, stops, challengerTile, lanterns = [], route, pathName, bridge, ...scene }: IslandContent): IslandScene {
  const backToPath: Door = { id: "path-back", label: `Back along ${pathName} to the village`, href: routeHref(route, scene.island), tile: bridge.end, action: "Go" };
  return {
    ...scene,
    layout: {
      map: parseTownMap(rows), start: bridge.arrival, buildings: stops.map(buildingOf), gates: [], lanterns,
      villagers: [{ id: CHALLENGERS[scene.challenger].character, tile: challengerTile }],
    },
    doors: [...stops.map(doorOf), backToPath],
  };
}

const KANA = islandScene({
  island: "kana", name: "The Kana island", japaneseName: "かなのしま", challenger: "chun", route: "home-kana", pathName: "the meadow path",
  theme: "sakura", bridge: WEST_BRIDGE,
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
  theme: "bamboo", bridge: EAST_BRIDGE,
  // A gravel courtyard inside a bamboo grove: two halls at the back, one at the front, and Tama by the pond.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~BBBBBBBBBBBBBBBBBBBBBBBBBBBB~",
    "~BBB......................BBB~",
    "~BB........................BB~",
    "~B..........................B~",
    "~B.,,,,,,,,,,,,,,,,,,.......B~",
    "~B.,,,,,,,,,,,,,,,,,,======bbb",
    "~B.,,,,,,,,,,,,,,,,,,======bbb",
    "~B.,,,,,*~~~~,,,,,,,,.......B~",
    "~B.,,,,,,~~~~*,,,,,,,....*..B~",
    "~BB,,,,,,,,,,,,,,,,,,......BB~",
    "~BBB,,,,,,,,BB,,,,,,B.....BBB~",
    "~BBBBBBBBBBBBB,,,,,,BBBBBBBBB~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 7, y: 9 },
  stops: [
    { id: "listening", sign: "きく", label: "Listening: words, sentences and dialogues", href: "/listening", look: "practice-hall", roof: "wood", at: { x: 22, y: 2 }, size: HALL_SIZE },
    { id: "speaking", sign: "はなす", label: "Speaking: say it aloud and get checked", href: "/speaking", look: "dojo", roof: "vermilion", at: { x: 6, y: 2 }, size: HALL_SIZE },
    { id: "reading", sign: "よむ", label: "Reading: short passages with questions", href: "/reading", look: "calligraphy", roof: "indigo", at: { x: 15, y: 9 }, size: HALL_SIZE },
  ],
});

const GAMES = islandScene({
  island: "games", name: "The Games island", japaneseName: "あそびのしま", challenger: "pon", route: "home-games", pathName: "the forest path",
  theme: "festival", bridge: NORTH_BRIDGE,
  // A festival ground: stalls round a square of beaten earth hung with lanterns, and Pon by the goldfish pool.
  rows: [
    "~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~",
    "~~~TTTTTTTTTT~bb~TTTTTTTTTT~~~",
    "~T..TT........==........TT..T~",
    "~T....*.......==............T~",
    "~T......==================..T~",
    "~T......==================.TT~",
    "~T.=======================..T~",
    "~T.==========ggggg========..T~",
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

const LESSONS = islandScene({
  island: "lessons", name: "The Lessons island", japaneseName: "まなびのしま", challenger: "sensei", route: "home-lessons", pathName: "the stone path",
  theme: "maple", bridge: SOUTH_BRIDGE,
  // A temple school in a maple garden: stepping stones lead straight from the bridge, between two ponds and past
  // stone lanterns, to the five-storey pagoda; two halls flank it along the top and two stand at the bottom corners.
  // Sensei waits beside the approach.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~M......MM......MM......M~~~",
    "~M..........................M~",
    "~M.M.......M......M.......M.M~",
    "~M..l.o..l..l.oo....l..o....M~",
    "~M....o...l...oo.l.l...o.l..M~",
    "~M.oooooooooooooooooooooooo.M~",
    "~M.oooooooooooooooooooooooo.M~",
    "~Mlo.....l.l..oo..l.l.....o.M~",
    "~M.o......~~~loo.~~~......olM~",
    "~M.o......~~~.ool~~~......o.M~",
    "~M.oooo.MM..M.oo.M..MM.oooo.M~",
    "~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 17, y: 8 },
  lanterns: [{ x: 13, y: 11 }, { x: 16, y: 11 }, { x: 12, y: 5 }, { x: 17, y: 5 }],
  stops: [
    { id: "units", sign: "がっこう", label: "All units: every unit of your level and what is open", href: "/lessons", look: "school", roof: "indigo", at: { x: 4, y: 1 }, size: HALL_SIZE },
    { id: "mock-exam", sign: "もぎしけん", label: "Mock exam: a timed end-of-level exam", href: "/mock-exam", look: "pagoda", roof: "indigo", at: { x: 13, y: 1 }, size: PAGODA_SIZE },
    { id: "grammar", sign: "ぶんぽう", label: "Grammar: patterns with clear examples", href: "/grammar", look: "calligraphy", roof: "wood", at: { x: 21, y: 1 }, size: HALL_SIZE },
    { id: "vocabulary", sign: "ことば", label: "Vocabulary: words by unit, with audio", href: "/vocabulary", look: "kana-school", roof: "moss", at: { x: 4, y: 8 }, size: HALL_SIZE },
    { id: "assessments", sign: "しけん", label: "Unit assessments: score 80% to complete a unit", href: "/quizzes", look: "dojo", roof: "vermilion", at: { x: 21, y: 8 }, size: HALL_SIZE },
  ],
});

export const ISLAND_SCENES: readonly IslandScene[] = [KANA, PRACTICE, GAMES, LESSONS];

export const islandSceneOf = (island: string): IslandScene | null => ISLAND_SCENES.find(scene => scene.island === island) ?? null;
