// The islands at the far end of the wild paths, on foot (docs/WORLD.md section 3). Content only.
// Each island has its own ground and look, after its art on the island map: the Kana island a temple garden under
// cherry trees, the Practice island a courtyard in a bamboo grove, the Games island a festival ground, the Lessons
// island a temple school in an autumn maple garden, the Review island a zen garden among pines, Fuji high on a snowy
// mountain above the clouds. Each island's bridge is on the side facing Home, where its path arrives: west for Kana, east for Practice
// and Review, north for Games, south for Lessons; Fuji's pier faces east, where the ferry comes in from Practice.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Building, BuildingLook, RoofColour } from "../../lib/errands/village.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import type { IslandScene } from "../../lib/world/islandScenes.ts";
import type { IslandId } from "../../lib/islandMap.ts";
import type { Surroundings } from "../../lib/world/sceneTheme.ts";
import { CHALLENGERS } from "./challengers.ts";
import { routeHref } from "../../lib/world/routes.ts";
import type { RouteId } from "../../lib/world/routes.ts";
import { groundBlockedBy } from "../../lib/world/islandProps.ts";
import type { IslandProp } from "../../lib/world/islandProps.ts";

/** The island's bridge to its path: the tile at its end (the way back) and where the traveller arrives off the path,
 *  on the road just past it. */
type Bridge = { end: Vector; arrival: Vector };
const WEST_BRIDGE: Bridge = { end: { x: 1, y: 6 }, arrival: { x: 5, y: 7 } };
const EAST_BRIDGE: Bridge = { end: { x: 28, y: 6 }, arrival: { x: 23, y: 7 } };
const NORTH_BRIDGE: Bridge = { end: { x: 14, y: 1 }, arrival: { x: 15, y: 5 } };
const SOUTH_BRIDGE: Bridge = { end: { x: 14, y: 12 }, arrival: { x: 15, y: 10 } };
const PAGODA_SIZE = { width: 4, height: 4 };
const HALL_SIZE = { width: 4, height: 3 };
const STALL_SIZE = { width: 4, height: 2 };

/** A building of the island (its top-left tile `at`) and the page its door opens. `sign` is the Japanese on it;
 *  `label` says it in English. Its door is in the middle of its front (south) wall. */
type Stop = { id: string; sign: string; label: string; href: string; look: BuildingLook; roof: RoofColour; at: Vector; size: { width: number; height: number } };

const buildingOf = ({ id, sign, label, look, roof, at, size }: Stop): Building => ({ id, sign, label, look, roof, ...at, ...size });
const doorOf = ({ id, label, href, at, size }: Stop): Door => ({ id, label, href, tile: { x: at.x + size.width / 2, y: at.y + size.height } });

/** A path on from the island, further out, over its own bridge: where it goes, said on the bridge. */
type Onward = { route: RouteId; bridge: Bridge; label: string };

/** `route` and `bridge`: the path the island is reached by, and its bridge (`backTo` names where that path leads back
 *  to; `backLabel`, said at the bridge, is "Back along <pathName> to <backTo>" unless given); `onward`, any path on from
 *  the island. `props`, the shrine pieces standing about it in 3D. */
type IslandContent = Omit<IslandScene, "layout" | "doors" | "arrivals" | "surroundings" | "props"> & {
  surroundings?: Surroundings;
  rows: readonly string[]; stops: readonly Stop[]; challengerTile: Vector; lanterns?: readonly Vector[];
  route: RouteId; pathName: string; bridge: Bridge; backTo?: string; backLabel?: string; onward?: readonly Onward[];
  props?: readonly IslandProp[];
};

function islandScene({ rows, stops, challengerTile, lanterns = [], route, pathName, bridge, backTo = "the village", backLabel, onward = [], surroundings = "water", props = [], ...scene }: IslandContent): IslandScene {
  const backToPath: Door = { id: "path-back", label: backLabel ?? `Back along ${pathName} to ${backTo}`, href: routeHref(route, scene.island), tile: bridge.end, action: "Go" };
  const pathsOn = onward.map((path): Door => ({ id: `path-${path.route}`, label: path.label, href: routeHref(path.route, scene.island), tile: path.bridge.end, action: "Go" }));
  return {
    ...scene,
    surroundings,
    props,
    layout: {
      map: parseTownMap(rows), start: bridge.arrival, buildings: stops.map(buildingOf), gates: [], lanterns,
      villagers: [{ id: CHALLENGERS[scene.challenger].character, tile: challengerTile }],
      obstacles: [...props.flatMap(groundBlockedBy), ...lanterns.map(at => ({ ...at, width: 1, height: 1 }))],
    },
    doors: [...stops.map(doorOf), backToPath, ...pathsOn],
    arrivals: [{ route, tile: bridge.arrival }, ...onward.map(path => ({ route: path.route, tile: path.bridge.arrival }))],
  };
}

const KANA = islandScene({
  island: "kana", name: "The Kana island", japaneseName: "かなのしま", challenger: "chun", route: "home-kana", pathName: "the meadow path",
  theme: "sakura", bridge: WEST_BRIDGE,
  // A temple garden: a building at each corner (the front two a row back from the road, so they don't hide whoever
  // walks it), and Chun in the petal-strewn square under a ring of cherry trees, a great one at its head.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~S....SSSSSSSSSSSSSS....S~~~",
    "~S.......S..........S.......S~",
    "~S.S.......SSS.SS.S.......S.S~",
    "~S...===...pppSSppp....===.pS~",
    "~S...===...pppSSppp....===..S~",
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
  // A gravel courtyard inside a bamboo grove, kept like a shrine's: two halls at the back, one at the front, and Tama by
  // the pond. The road in from the east passes under a great torii between guardian lions; a roofed gate stands over
  // the way to the west pier, where the ferry leaves for Fuji. Lanterns flank the halls, a taiko drum stands by the
  // dojo, a water basin by the pond, a rack of prayer boards by the reading house, and a little shrine in a corner.
  onward: [{ route: "practice-fuji", bridge: WEST_BRIDGE, label: "The ferry (わたしぶね) from the west pier to Fuji" }],
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~BBBBBBBBBBBBBBBBBBBBBBBBBBBB~",
    "~BBB......................BBB~",
    "~BB........................BB~",
    "~B..........................B~",
    "~B.,,,,,,,,,,,,,,,,,,.......B~",
    "bbb,,,,,,,,,,,,,,,,,,======bbb",
    "bbb,,,,,,,,,,,,,,,,,,======bbb",
    "~B.,,,,,*~~~~,,,,,,,,.......B~",
    "~B.,,,,,,~~~~*,,,,,,,....*..B~",
    "~BB,,,,,,,,,,,,,,,,,,......BB~",
    "~BBB,,,,,,,,BB,,,,,,B.....BBB~",
    "~BBBBBBBBBBBBB,,,,,,BBBBBBBBB~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 7, y: 9 },
  props: [
    { kind: "torii", at: { x: 25, y: 5, width: 1, height: 4 }, facing: "right" },
    { kind: "komainu", at: { x: 26, y: 5, width: 1, height: 1 } },
    { kind: "komainu", at: { x: 26, y: 8, width: 1, height: 1 }, facing: "up" },
    { kind: "gate", at: { x: 3, y: 5, width: 1, height: 4 }, facing: "left" },
    { kind: "stone-lantern", at: { x: 5, y: 4, width: 1, height: 1 } },
    { kind: "stone-lantern", at: { x: 10, y: 4, width: 1, height: 1 } },
    { kind: "stone-lantern", at: { x: 21, y: 4, width: 1, height: 1 } },
    { kind: "stone-lantern", at: { x: 26, y: 4, width: 1, height: 1 } },
    { kind: "taiko", at: { x: 11, y: 3, width: 1, height: 1 } },
    { kind: "temizuya", at: { x: 13, y: 8, width: 2, height: 1 } },
    { kind: "ema-rack", at: { x: 20, y: 10, width: 1, height: 1 } },
    { kind: "hokora", at: { x: 25, y: 10, width: 1, height: 1 } },
    { kind: "torii", at: { x: 25, y: 11, width: 1, height: 1 } },
  ],
  stops: [
    { id: "listening", sign: "きく", label: "Listening: words, sentences and dialogues", href: "/listening", look: "practice-hall", roof: "wood", at: { x: 22, y: 2 }, size: HALL_SIZE },
    { id: "speaking", sign: "はなす", label: "Speaking: say it aloud and get checked", href: "/speaking", look: "dojo", roof: "vermilion", at: { x: 6, y: 2 }, size: HALL_SIZE },
    { id: "reading", sign: "よむ", label: "Reading: short passages with questions", href: "/reading", look: "calligraphy", roof: "indigo", at: { x: 15, y: 9 }, size: HALL_SIZE },
  ],
});

const GAMES = islandScene({
  island: "games", name: "The Games island", japaneseName: "あそびのしま", challenger: "pon", route: "home-games", pathName: "the forest path",
  theme: "festival", bridge: NORTH_BRIDGE,
  // A festival ground: stalls round a square of beaten earth hung with lanterns, and Pon by the goldfish pool. A torii
  // stands where the bridge comes in, between festival banners; strings of lanterns hang either side of the pool. The
  // festival tower stands on the grass in the north-east corner, a great drum against the east edge, and dumpling
  // carts with their stools in the open on either side of the square, each with room to walk all round it. Tea
  // benches wait under red parasols by tea banners, and a rickshaw, a wayside shrine and a rack of prayer boards stand
  // on the grass.
  rows: [
    "~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~",
    "~~~TTTTTTTTTT~bb~TTTTTTTTTT~~~",
    "~T..TT........==........T...T~",
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
  props: [
    { kind: "torii", at: { x: 13, y: 3, width: 4, height: 1 } },
    { kind: "lantern-string", at: { x: 12, y: 6, width: 7, height: 1 } },
    { kind: "lantern-string", at: { x: 12, y: 9, width: 7, height: 1 } },
    { kind: "watchtower", at: { x: 25, y: 2, width: 3, height: 3 } },
    { kind: "taiko", at: { x: 26, y: 6, width: 2, height: 2 } },
    { kind: "yatai", at: { x: 9, y: 8, width: 2, height: 2 } },
    { kind: "yatai", at: { x: 4, y: 4, width: 2, height: 2 } },
    { kind: "yatai", at: { x: 22, y: 6, width: 2, height: 2 } },
    { kind: "nobori", at: { x: 12, y: 3, width: 1, height: 1 } },
    { kind: "nobori", at: { x: 21, y: 3, width: 1, height: 1 } },
    { kind: "nobori-dango", at: { x: 7, y: 3, width: 1, height: 1 } },
    { kind: "nobori-dango", at: { x: 8, y: 8, width: 1, height: 1 } },
    { kind: "nobori-tea", at: { x: 3, y: 9, width: 1, height: 1 } },
    { kind: "nobori-tea", at: { x: 27, y: 9, width: 1, height: 1 } },
    { kind: "tea-bench", at: { x: 5, y: 10, width: 2, height: 2 } },
    { kind: "tea-bench", at: { x: 26, y: 10, width: 2, height: 2 } },
    { kind: "rickshaw", at: { x: 2, y: 3, width: 2, height: 1 }, facing: "right" },
    { kind: "hokora", at: { x: 6, y: 2, width: 1, height: 1 } },
    { kind: "ema-rack", at: { x: 24, y: 3, width: 1, height: 1 } },
  ],
  lanterns: [{ x: 7, y: 4 }, { x: 12, y: 6 }, { x: 18, y: 6 }, { x: 12, y: 9 }, { x: 18, y: 9 }, { x: 8, y: 11 }, { x: 25, y: 11 }],
  stops: [
    { id: "errands", sign: "おつかい", label: "Island Errands: walk the village and run errands in Japanese", href: "/games/errands", look: "stall", roof: "vermilion", at: { x: 8, y: 2 }, size: STALL_SIZE },
    { id: "particles", sign: "じょし", label: "Particle Drop: fill in は, を, に against the clock", href: "/games/particles", look: "stall", roof: "indigo", at: { x: 17, y: 2 }, size: STALL_SIZE },
    { id: "kana-speed", sign: "はやよみ", label: "Kana speed quiz: read kana as fast as you can", href: "/practice?type=hiragana", look: "stall", roof: "moss", at: { x: 20, y: 9 }, size: STALL_SIZE },
  ],
});

const LESSONS = islandScene({
  island: "lessons", name: "The Lessons island", japaneseName: "まなびのしま", challenger: "sensei", route: "home-lessons", pathName: "the stone path",
  theme: "maple", bridge: SOUTH_BRIDGE,
  // A temple school in a maple garden: stepping stones lead straight from the bridge, between two ponds and past
  // stone lanterns, to the five-storey pagoda; two halls flank it along the top and two stand at the bottom corners.
  // Sensei waits beside the approach, which passes under a torii between guardian lion-dogs; prayer boards hang by
  // the grammar hall.
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
  props: [
    { kind: "torii", at: { x: 13, y: 8, width: 4, height: 1 } },
    { kind: "komainu", at: { x: 13, y: 10, width: 1, height: 1 }, facing: "right" },
    { kind: "komainu", at: { x: 16, y: 10, width: 1, height: 1 }, facing: "left" },
    { kind: "ema-rack", at: { x: 27, y: 4, width: 1, height: 1 } },
  ],
  lanterns: [{ x: 13, y: 11 }, { x: 16, y: 11 }, { x: 12, y: 5 }, { x: 17, y: 5 }],
  stops: [
    { id: "units", sign: "がっこう", label: "All units: every unit of your level and what is open", href: "/lessons", look: "school", roof: "indigo", at: { x: 4, y: 1 }, size: HALL_SIZE },
    { id: "mock-exam", sign: "もぎしけん", label: "Mock exam: a timed end-of-level exam", href: "/mock-exam", look: "pagoda", roof: "indigo", at: { x: 13, y: 1 }, size: PAGODA_SIZE },
    { id: "grammar", sign: "ぶんぽう", label: "Grammar: patterns with clear examples", href: "/grammar", look: "calligraphy", roof: "wood", at: { x: 21, y: 1 }, size: HALL_SIZE },
    { id: "vocabulary", sign: "ことば", label: "Vocabulary: words by unit, with audio", href: "/vocabulary", look: "kana-school", roof: "moss", at: { x: 4, y: 8 }, size: HALL_SIZE },
    { id: "assessments", sign: "しけん", label: "Unit assessments: score 80% to complete a unit", href: "/quizzes", look: "dojo", roof: "vermilion", at: { x: 21, y: 8 }, size: HALL_SIZE },
  ],
});

const REVIEW = islandScene({
  island: "review", name: "The Review island", japaneseName: "ふくしゅうのしま", challenger: "zen", route: "home-review", pathName: "the pine path",
  theme: "zen", bridge: EAST_BRIDGE,
  // A zen garden among pines: raked gravel with its rocks in the middle, two halls at the back, one at the front by the
  // gap in the pines, and Zen by the pond, with a snow-viewing lantern at its edge. Azaleas grow by the pines and a
  // water basin stands by the shrine.
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~PPPPPPPPPPPPPPPPPPPPPPPPPPPP~",
    "~PPP......................PPP~",
    "~PP........................PP~",
    "~P..........................P~",
    "~P..zzzzzzzzzzzzz...........P~",
    "~P..zzkzzzzzzzkzz...=======bbb",
    "~P..zzzzzzzkzzzzz...=======bbb",
    "~P..zzzzzzzzzzzzz...........P~",
    "~P..~~~~~o..................P~",
    "~P..~~~~~.o.................P~",
    "~PP..~~k...o...............PP~",
    "~PPPPPPPPPPPP......PPPPPPPPPP~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  challengerTile: { x: 11, y: 9 },
  props: [
    { kind: "yukimi-lantern", at: { x: 9, y: 11, width: 1, height: 1 } },
    { kind: "temizuya", at: { x: 19, y: 10, width: 2, height: 1 } },
    { kind: "bush", at: { x: 3, y: 4, width: 1, height: 1 } },
    { kind: "bush", at: { x: 27, y: 9, width: 1, height: 1 } },
    { kind: "bush", at: { x: 12, y: 11, width: 1, height: 1 } },
  ],
  lanterns: [{ x: 19, y: 5 }, { x: 19, y: 8 }],
  stops: [
    { id: "daily-review", sign: "まいにち", label: "Daily review: spaced repetition for your words and kanji", href: "/srs", look: "teahouse", roof: "moss", at: { x: 22, y: 2 }, size: HALL_SIZE },
    { id: "mistakes", sign: "まちがい", label: "Mistake notebook: practise the questions you got wrong", href: "/mistakes", look: "calligraphy", roof: "indigo", at: { x: 6, y: 2 }, size: HALL_SIZE },
    { id: "unit-review", sign: "ふくしゅう", label: "Unit review: mixed questions per unit or level", href: "/review", look: "shrine", roof: "wood", at: { x: 14, y: 9 }, size: HALL_SIZE },
  ],
});

const FUJI = islandScene({
  island: "fuji", name: "Fuji", japaneseName: "ふじ", challenger: "kurama", route: "practice-fuji", pathName: "the ferry",
  backTo: "the Practice island", backLabel: "The ferry (わたしぶね) back to the Practice island", theme: "summit", surroundings: "clouds", bridge: EAST_BRIDGE,
  // High on the snowy mountain (the ground itself is snow, deeper in drifts), ringed by rocks, with the sea of clouds
  // below its edge and the summit rising behind (SummitBackdrop): Kurama's dojo in the middle at the head of the road, which
  // goes down a stone stairway over the eastern edge to the pier, a shrine and a hall either side of it, pines below.
  // A torii stands at the head of the stairway, lion-dogs guard the dojo, and a bell tower stands in the snow.
  rows: [
    "cccccccccccccccccccccccccccccc",
    "ckkkkkkkkkkkkkkkkkkkkkkkkkkkkc",
    "cknn....nnnnn....nn....nnnnnkc",
    "ckn.....nnnn.....nn.....nnnnkc",
    "ckn.......................nnkc",
    "ck.......k..,,,,,,,......k..kc",
    "ck............=============^^^",
    "ck.........k..=============^^^",
    "cknnn.........o.............kc",
    "cknn.....k.....o............kc",
    "ckn...........o.......k...PPkc",
    "ckPPP......P.............PPPkc",
    "cPPPPPPPPPPPPPPPPPPPPPPPPPPPPc",
    "cccccccccccccccccccccccccccccc",
  ],
  challengerTile: { x: 17, y: 9 },
  props: [
    { kind: "torii", at: { x: 26, y: 5, width: 1, height: 4 }, facing: "right" },
    { kind: "komainu", at: { x: 13, y: 5, width: 1, height: 1 }, facing: "right" },
    { kind: "komainu", at: { x: 17, y: 5, width: 1, height: 1 }, facing: "left" },
    { kind: "bell-tower", at: { x: 5, y: 8, width: 3, height: 3 } },
  ],
  lanterns: [{ x: 12, y: 6 }, { x: 19, y: 8 }],
  stops: [
    { id: "levels", sign: "のぼる", label: "Choose your level: move up when you are ready", href: "/levels", look: "shrine", roof: "vermilion", at: { x: 4, y: 2 }, size: HALL_SIZE },
    { id: "dojo-exam", sign: "もぎしけん", label: "Mock exam: a timed end-of-level exam", href: "/mock-exam", look: "dojo", roof: "wood", at: { x: 13, y: 2 }, size: HALL_SIZE },
    { id: "statistics", sign: "きろく", label: "Your statistics: accuracy, time studied and test results", href: "/statistics/japanese", look: "practice-hall", roof: "indigo", at: { x: 19, y: 2 }, size: HALL_SIZE },
  ],
});

export const ISLAND_SCENES: readonly IslandScene[] = [KANA, PRACTICE, GAMES, LESSONS, REVIEW, FUJI];

/** The islands walked in real 3D (components/world3d/japanese builds their models): all of them. */
export const ISLANDS_IN_3D: ReadonlySet<IslandId> = new Set<IslandId>(ISLAND_SCENES.map(scene => scene.island));

export const islandSceneOf = (island: string): IslandScene | null => ISLAND_SCENES.find(scene => scene.island === island) ?? null;
