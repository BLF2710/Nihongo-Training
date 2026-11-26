// The wild paths from the home village to the islands (see docs/WORLD.md). Content only; the rules live in lib/world.
// Each path runs the way its island lies from Home on the island map (`heading`): Home's end is on the side it comes
// from, the island's on the side it heads to, each over a bridge.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { WildRoute } from "../../lib/world/routes.ts";
import { groundBlockedBy } from "../../lib/world/islandProps.ts";
import type { IslandProp } from "../../lib/world/islandProps.ts";

const NOTHING_STANDING = { buildings: [], gates: [], villagers: [] } as const;

/** Along the meadow path to the Kana island: flowering bushes, mossy rocks and a stone by the pond, a stone lantern
 *  and a rack of prayer boards where learners wish for their kana to stick. */
const KANA_PROPS: readonly IslandProp[] = [
  { kind: "bush", at: { x: 6, y: 1, width: 1, height: 1 } },
  { kind: "bush-small", at: { x: 5, y: 2, width: 1, height: 1 } },
  { kind: "rock-large", at: { x: 3, y: 3, width: 2, height: 2 } },
  { kind: "moss-mound", at: { x: 30, y: 1, width: 2, height: 1 } },
  { kind: "bush", at: { x: 30, y: 3, width: 1, height: 1 } },
  { kind: "bush-small", at: { x: 31, y: 4, width: 1, height: 1 } },
  { kind: "stone-lantern", at: { x: 11, y: 6, width: 1, height: 1 } },
  { kind: "ema-rack", at: { x: 24, y: 6, width: 1, height: 1 } },
  { kind: "bush-small", at: { x: 24, y: 7, width: 1, height: 1 } },
  { kind: "rock-cluster", at: { x: 13, y: 12, width: 1, height: 1 } },
  { kind: "rock-flat", at: { x: 20, y: 12, width: 1, height: 1 } },
];

/** のはら, the meadow path east from Home to the Kana island: a flower meadow under cherry trees, with a pond. The path
 *  winds round most of the tall grass, but one band of it (columns 17–18) crosses the whole way. */
const HOME_KANA: WildRoute = {
  id: "home-kana",
  theme: "sakura",
  name: "The meadow path",
  japaneseName: "のはら",
  between: ["home", "kana"],
  heading: "east",
  layout: {
    map: parseTownMap([
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
      "SSSSS......S*..p.ww...wwwwwwSS...SSS",
      "SSS.........S....ww...wwwwww.p..SSSS",
      "SSS..*..========.ww.========..*..SSS",
      "~~~.p.*.========.ww.========.*...~~~",
      "~~~.....==.p..==.ww.==*.S.==.....~~~",
      "bbb=======....==.ww.==..*.=======bbb",
      "bbb=======...*==.ww.==.p..=======bbb",
      "~~~...S..*~~~.==.ww.==......p....~~~",
      "~~~wwwwwww~~~.===ww===.wwwwwwwww.~~~",
      "SSSwwwwwwwpw..===ww===.wwwwwwwww.SSS",
      "SSSwwwwwwwww.....ww....wwwwwwwww.SSS",
      "SSSwwwwwwwww.....ww....wwwwwwwww.SSS",
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
    ]),
    start: { x: 4, y: 7 },
    lanterns: [],
    ...NOTHING_STANDING,
    obstacles: KANA_PROPS.flatMap(groundBlockedBy),
  },
  props: KANA_PROPS,
  exits: [
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "kana", label: "On to the Kana island" },
  ],
  travel: "foot",
  grass: "own-rows",
  wildRows: ["vowels", "k"],
};

/** Along the riverside path to the Practice island: moss and rocks under the bamboo, stone lanterns, and a drum
 *  that sounds from the dojo ahead. */
const PRACTICE_PROPS: readonly IslandProp[] = [
  { kind: "bush-small", at: { x: 12, y: 1, width: 1, height: 1 } },
  { kind: "rock-cluster", at: { x: 13, y: 2, width: 1, height: 1 } },
  { kind: "stone-lantern", at: { x: 16, y: 3, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 13, y: 4, width: 2, height: 1 } },
  { kind: "rock-medium", at: { x: 20, y: 4, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 23, y: 4, width: 2, height: 1 } },
  { kind: "taiko", at: { x: 26, y: 4, width: 1, height: 1 } },
  { kind: "rock-cluster", at: { x: 27, y: 2, width: 1, height: 1 } },
  { kind: "stone-lantern", at: { x: 27, y: 1, width: 1, height: 1 } },
];

/** かわべ, the riverside path west from Home to the Practice island: along the north bank of a river, through bamboo.
 *  A stream comes down to the river (bridged on rows 6–7), and a band of tall grass (columns 9–10) runs from the bamboo
 *  to the water. */
const HOME_PRACTICE: WildRoute = {
  id: "home-practice",
  theme: "bamboo",
  name: "The riverside path",
  japaneseName: "かわべ",
  between: ["home", "practice"],
  heading: "west",
  layout: {
    map: parseTownMap([
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBwwww.ww..BB..~~.wwwwwBB..wwwwBBB",
      "BBBBwwww.ww....B.~~.wwwww....wwwwBBB",
      "BBB.wwww.ww.B....~~B.........wwwwBBB",
      "~~~.wwww.ww...*..~~..............~~~",
      "~~~......ww......~~..............~~~",
      "bbb======ww======bb==============bbb",
      "bbb======ww======bb==============bbb",
      "~~~..*...ww.wwwww~~..*........*..~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      "BBB~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~BBB",
      "BBB~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~BBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ]),
    start: { x: 32, y: 7 },
    lanterns: [],
    ...NOTHING_STANDING,
    obstacles: PRACTICE_PROPS.flatMap(groundBlockedBy),
  },
  props: PRACTICE_PROPS,
  exits: [
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "practice", label: "On to the Practice island" },
  ],
  // Quiet until Chun is beaten: then the さ and た rows come.
  travel: "foot",
  grass: "own-rows",
  wildRows: [],
  rewardRows: { rows: ["s", "t"], until: "chun" },
};

/** Paper lanterns along the forest path, as on the way to a festival. */
const FOREST_LANTERNS = [{ x: 9, y: 4 }, { x: 1, y: 9 }, { x: 14, y: 11 }, { x: 1, y: 17 }, { x: 14, y: 17 }, { x: 2, y: 22 }, { x: 14, y: 24 }, { x: 6, y: 30 }];

/** Along the forest path to the Games island: the festival spilling out into the wood, a food stall and a tea bench,
 *  banners and a drum, among the lanterns already hung there. */
const GAMES_PROPS: readonly IslandProp[] = [
  { kind: "nobori", at: { x: 4, y: 3, width: 1, height: 1 } },
  { kind: "nobori", at: { x: 13, y: 4, width: 1, height: 1 } },
  { kind: "yatai", at: { x: 11, y: 5, width: 2, height: 2 } },
  { kind: "tea-bench", at: { x: 13, y: 5, width: 2, height: 2 } },
  { kind: "taiko", at: { x: 2, y: 14, width: 1, height: 1 } },
  { kind: "rock-medium", at: { x: 1, y: 16, width: 1, height: 1 } },
  { kind: "nobori", at: { x: 1, y: 23, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 3, y: 26, width: 2, height: 1 } },
  { kind: "bush-small", at: { x: 1, y: 27, width: 1, height: 1 } },
  { kind: "rock-cluster", at: { x: 11, y: 32, width: 1, height: 1 } },
  { kind: "nobori", at: { x: 12, y: 32, width: 1, height: 1 } },
];

/** もり, the forest path south from Home down to the Games island: switchbacks through a dark wood hung with festival
 *  lanterns, with a band of tall grass (rows 18–20) right across. */
const HOME_GAMES: WildRoute = {
  id: "home-games",
  theme: "festival",
  name: "The forest path",
  japaneseName: "もり",
  between: ["home", "games"],
  heading: "south",
  layout: {
    map: parseTownMap([
      "TTTTT~~bb~~TTTTT",
      "TTTTT~~bb~~TTTTT",
      "TTTTT~~bb~~TTTTT",
      "TTT....==.TT.T.T",
      "T...*..==...T..T",
      "T.=======......T",
      "T.=======......T",
      "T.==.wwwwwwTT..T",
      "T.==Twwwwww..T.T",
      "T.==...........T",
      "T.============.T",
      "T.============.T",
      "T.....TT....==TT",
      "TT...wwwwwT.==.T",
      "T....wwwww..==.T",
      "TT.......*..==.T",
      "T..===========.T",
      "T..===========.T",
      "TwwwwwwwwwwwwwwT",
      "TwwwwwwwwwwwwwwT",
      "TwwwwwwwwwwwwwwT",
      "TT.==T...T...T.T",
      "T..==.T.......TT",
      "T..===========.T",
      "T..===========.T",
      "T.....wwwww.==.T",
      "TT....wwwww.==TT",
      "T.T...*..T..==.T",
      "T......=======.T",
      "Twwww..=======.T",
      "Twwww..==......T",
      "TwwwwT.==.T..T.T",
      "T......==......T",
      "TTTTT~~bb~~TTTTT",
      "TTTTT~~bb~~TTTTT",
      "TTTTT~~bb~~TTTTT",
    ]),
    start: { x: 8, y: 4 },
    lanterns: FOREST_LANTERNS,
    ...NOTHING_STANDING,
    obstacles: GAMES_PROPS.flatMap(groundBlockedBy),
  },
  props: GAMES_PROPS,
  exits: [
    { tile: { x: 7, y: 1 }, arrival: { x: 8, y: 4 }, island: "home", label: "Back to the village" },
    { tile: { x: 7, y: 34 }, arrival: { x: 8, y: 31 }, island: "games", label: "On to the Games island" },
  ],
  travel: "foot",
  grass: "own-rows",
  wildRows: ["n", "h"],
};

/** Stone lanterns along the stone path. */
const STONE_PATH_LANTERNS = [{ x: 9, y: 31 }, { x: 2, y: 27 }, { x: 13, y: 24 }, { x: 6, y: 16 }, { x: 9, y: 14 }, { x: 9, y: 7 }, { x: 2, y: 6 }, { x: 9, y: 3 }];

/** Along the stone path to the Lessons island: a wayside shrine with prayer boards for good marks, and mossy rocks
 *  among the autumn maples. */
const LESSONS_PROPS: readonly IslandProp[] = [
  { kind: "rock-large", at: { x: 10, y: 9, width: 2, height: 2 } },
  { kind: "hokora", at: { x: 12, y: 10, width: 1, height: 1 } },
  { kind: "ema-rack", at: { x: 12, y: 11, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 2, y: 14, width: 2, height: 1 } },
  { kind: "rock-medium", at: { x: 13, y: 15, width: 1, height: 1 } },
  { kind: "rock-small", at: { x: 14, y: 18, width: 1, height: 1 } },
  { kind: "rock-flat", at: { x: 7, y: 19, width: 1, height: 1 } },
  { kind: "rock-cluster", at: { x: 1, y: 28, width: 1, height: 1 } },
  { kind: "rock-medium", at: { x: 4, y: 31, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 1, y: 32, width: 2, height: 1 } },
  { kind: "rock-flat", at: { x: 11, y: 32, width: 1, height: 1 } },
];

/** いしみち, the stone path north from Home up to the Lessons island: stepping stones climbing through autumn maples,
 *  over a stream on a little bridge (rows 12–13) and a band of tall grass (rows 21–23) right across. */
const HOME_LESSONS: WildRoute = {
  id: "home-lessons",
  theme: "maple",
  name: "The stone path",
  japaneseName: "いしみち",
  between: ["home", "lessons"],
  heading: "north",
  layout: {
    map: parseTownMap([
      "MMMMM~~bb~~MMMMM",
      "MMMMM~~bb~~MMMMM",
      "MMMMM~~bb~~MMMMM",
      "MMM....oo....MMM",
      "M..oooooo.wwww.M",
      "M..oooooo.wwww.M",
      "M..ooM...Mwwww.M",
      "MM.oo.....wwww.M",
      "M..oooooo..l...M",
      "M.loooooo...M..M",
      "MM.....oo.l..M.M",
      "M.M.l..ool...M.M",
      "M~~~~~~bb~~~~~~M",
      "M~~~~~~bb~~~~~~M",
      "MM...M.oo...M..M",
      "M......ooooo..MM",
      "M.wwww.oooool..M",
      "M.wwww....oo.M.M",
      "M.wwww.M..ool..M",
      "M.wwww..l.ooM..M",
      "MM....l...oo..MM",
      "MwwwwwwwwwwwwwwM",
      "MwwwwwwwwwwwwwwM",
      "MwwwwwwwwwwwwwwM",
      "M...oooooooo...M",
      "Ml..ooooooo.M..M",
      "M.M.ool......l.M",
      "M...oo...l.wwwwM",
      "M...ooooo..wwwwM",
      "M...ooooo..wwwwM",
      "MM.l...oo..wwwwM",
      "M.M....oo.l....M",
      "M....l.oo....M.M",
      "MMMMM~~bb~~MMMMM",
      "MMMMM~~bb~~MMMMM",
      "MMMMM~~bb~~MMMMM",
    ]),
    start: { x: 8, y: 31 },
    lanterns: STONE_PATH_LANTERNS,
    ...NOTHING_STANDING,
    obstacles: LESSONS_PROPS.flatMap(groundBlockedBy),
  },
  props: LESSONS_PROPS,
  exits: [
    { tile: { x: 7, y: 34 }, arrival: { x: 8, y: 31 }, island: "home", label: "Back to the village" },
    { tile: { x: 7, y: 1 }, arrival: { x: 8, y: 4 }, island: "lessons", label: "On to the Lessons island" },
  ],
  // Quiet until Tama is beaten: then the rest of the table comes.
  travel: "foot",
  grass: "own-rows",
  wildRows: [],
  rewardRows: { rows: ["m", "y", "r", "w", "final-n"], until: "tama" },
};

/** Along the pine path to the Review island: a garden of set rocks, moss and flat stones, with snow-viewing lanterns
 *  by its pond. */
const REVIEW_PROPS: readonly IslandProp[] = [
  { kind: "rock-cluster", at: { x: 5, y: 1, width: 1, height: 1 } },
  { kind: "rock-large", at: { x: 3, y: 3, width: 2, height: 2 } },
  { kind: "moss-mound", at: { x: 18, y: 2, width: 2, height: 1 } },
  { kind: "rock-flat", at: { x: 19, y: 4, width: 1, height: 1 } },
  { kind: "yukimi-lantern", at: { x: 17, y: 4, width: 1, height: 1 } },
  { kind: "rock-large", at: { x: 31, y: 2, width: 2, height: 2 } },
  { kind: "rock-medium", at: { x: 30, y: 4, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 30, y: 9, width: 2, height: 1 } },
  { kind: "rock-small", at: { x: 31, y: 11, width: 1, height: 1 } },
  { kind: "yukimi-lantern", at: { x: 10, y: 11, width: 1, height: 1 } },
  { kind: "rock-flat", at: { x: 8, y: 12, width: 1, height: 1 } },
  { kind: "moss-mound", at: { x: 9, y: 12, width: 2, height: 1 } },
  { kind: "rock-cluster", at: { x: 28, y: 12, width: 1, height: 1 } },
];

/** まつみち, the pine path west from Home to the Review island: a garden walk between pines, past raked gravel, mossy
 *  rocks and a pond with stepping stones. Its band of tall grass (columns 14–15) holds only kana already caught, from
 *  every path's rows: a review on the way to review. */
const HOME_REVIEW: WildRoute = {
  id: "home-review",
  theme: "zen",
  name: "The pine path",
  japaneseName: "まつみち",
  between: ["home", "review"],
  heading: "west",
  layout: {
    map: parseTownMap([
      "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
      "PPPP...zzzzzzzwwPP...zzzzzzzzz..PPPP",
      "PPP...zzkzzzzzww.....zzzzkzzzz...PPP",
      "PPP...zzzzzkzzww.P...zzzzzzzzz...PPP",
      "~~~...zzzzzzzzww.....zzkzzzzzz...~~~",
      "~~~...........ww.k...............~~~",
      "bbb===========ww=================bbb",
      "bbb===========ww=================bbb",
      "~~~.....oo....ww...........oo....~~~",
      "~~~..~~~~~oo..wwzzzzzzzz..oo.....~~~",
      "PPP.~~~~~~~o..wwkzzzzkzz..o..P...PPP",
      "PPP..~~~~k..oowwzzzzzzzzzoo...P..PPP",
      "PPPP..P.......wwzzzzzzzz.......PPPPP",
      "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
    ]),
    start: { x: 32, y: 7 },
    lanterns: [{ x: 15, y: 5 }, { x: 22, y: 8 }],
    ...NOTHING_STANDING,
    obstacles: REVIEW_PROPS.flatMap(groundBlockedBy),
  },
  props: REVIEW_PROPS,
  exits: [
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "review", label: "On to the Review island" },
  ],
  travel: "foot",
  grass: "review",
  wildRows: [],
};

/** わたしぶね, the ferry west from the Practice island to Fuji, the furthest out. Fuji has no bridge on the island map,
 *  so the way is by boat: rowed out over the open sea from the Practice island's pier, past rocks, to Fuji's snowy
 *  shore. Its rough water (a band right across at columns 16–19, and a patch to the south-east) holds every row open on the other paths, caught or
 *  not: everything, as Kurama's team is. */
const PRACTICE_FUJI: WildRoute = {
  id: "practice-fuji",
  theme: "mountain",
  // Fuji's flank rises behind the western shore, up to the island high above, a path zigzagging up it from the pier.
  mountainside: { side: "west", inset: 1 },
  name: "The ferry",
  japaneseName: "わたしぶね",
  between: ["practice", "fuji"],
  heading: "west",
  travel: "boat",
  layout: {
    map: parseTownMap([
      "nPkssssssssssssssvvsssssssssssssskBB",
      "nPksskkssssssssssvvsssssssssssssskBB",
      "nPkssssssssssssssvvsssssssssssssskBB",
      "nPkssssssskkssssvvvsssssssssssssskBB",
      "nPksssssssksssssvvvsssssskksssssskBB",
      "nPksssssssssssssvvvsssssssssssssskBB",
      "===jjssssssssssssvvssssssssssssjj===",
      "===jjssssssssssssvvssssssssssssjj===",
      "nPkssssssssssssssvvvssssssssssssskBB",
      "nPkssssssssssssssvvvsssvvvvsssssskBB",
      "nPkssssskksssssssvvvsssvvvvsssssskBB",
      "nPkssssssssssssssvvssssvvvvsssssskBB",
      "nPkssssssssssksssvvssssssssskkssskBB",
      "nPkssssssssssssssvvsssssssssssssskBB",
    ]),
    start: { x: 27, y: 7 },
    lanterns: [],
    ...NOTHING_STANDING,
  },
  exits: [
    { tile: { x: 30, y: 6 }, arrival: { x: 27, y: 7 }, island: "practice", label: "Step ashore on the Practice island" },
    { tile: { x: 5, y: 6 }, arrival: { x: 8, y: 7 }, island: "fuji", label: "Step ashore on Fuji" },
  ],
  grass: "every-open-row",
  wildRows: [],
};

export const WILD_ROUTES: readonly WildRoute[] = [HOME_KANA, HOME_PRACTICE, HOME_GAMES, HOME_LESSONS, HOME_REVIEW, PRACTICE_FUJI];

export const routeById = (id: string): WildRoute | null => WILD_ROUTES.find(route => route.id === id) ?? null;
