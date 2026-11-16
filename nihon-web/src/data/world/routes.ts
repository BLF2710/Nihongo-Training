// The wild paths from the home village to the islands (see docs/WORLD.md). Content only; the rules live in lib/world.
// Each path's west end (column 1) leads back to the village and its east end (column 34) onto its island.
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { WildRoute } from "../../lib/world/routes.ts";

/** Paper lanterns along the forest path, as on the way to a festival. */
const FOREST_LANTERNS = [{ x: 5, y: 2 }, { x: 14, y: 3 }, { x: 24, y: 3 }, { x: 29, y: 2 }, { x: 8, y: 8 }, { x: 16, y: 8 }, { x: 24, y: 8 }, { x: 31, y: 8 }];

/** のはら, the meadow path along the bridge from Home to the Kana island, under cherry trees. The path winds round most
 *  of the tall grass, but one band of it (columns 17–18) crosses the whole way. */
const HOME_KANA: WildRoute = {
  id: "home-kana",
  theme: "sakura",
  name: "The meadow path",
  japaneseName: "のはら",
  between: ["home", "kana"],
  layout: {
    map: parseTownMap([
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
      "SS.wwwww...SS....wwp.wwwwwww.....p.S",
      "S.Swwwww..p......ww..wwwwwww...SS..S",
      "Sp.wwwww=========ww==wwwwwww.p..S..S",
      "~~~wwwww=========ww==wwwwwww..*..~~~",
      "~~~.p...==.p.....ww==wwwwwww....p~~~",
      "bbb=======.*....pww==wwwwwww=====bbb",
      "bbb=======....p..ww==p......=====bbb",
      "~~~..p......p....ww==...*.p.==...~~~",
      "~~~pwwwwwwwwww...ww===========.p.~~~",
      "Sp..wwwwwwwwwwSS.ww===========.....S",
      "S...wwwwwwwwww...ww.p...wwwwwwww..pS",
      "S...wwwwwwwwww...ww.....wwwwwwwwp..S",
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
    ]),
    start: { x: 4, y: 7 },
    buildings: [],
    gates: [],
    lanterns: [],
    villagers: [],
  },
  exits: [
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "kana", label: "On to the Kana island" },
  ],
  wildRows: ["vowels", "k"],
};

/** かわべ, the riverside path along the bridge from Home to the Practice island, through bamboo. A river crosses it
 *  (one bridge, rows 6–7), and past the river a band of tall grass (columns 23–24) crosses the whole way. */
const HOME_PRACTICE: WildRoute = {
  id: "home-practice",
  theme: "bamboo",
  name: "The riverside path",
  japaneseName: "かわべ",
  between: ["home", "practice"],
  layout: {
    map: parseTownMap([
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "B..wwww.....B.....~~~..ww.....wwww.B",
      "B..wwww...........~~~..ww.....wwww.B",
      "B..wwww..=======..~~~..ww..=====...B",
      "~~~wwww..=.....=..~~~..ww..=...=..~~",
      "~~~......=.....=..~~~..ww..=...=.~~~",
      "bbb======.......==bbb==ww==.....=bbb",
      "bbb=======.......=bbb==ww========bbb",
      "~~~...............~~~..ww........~~~",
      "~~~.wwwwwww.......~~~..ww...wwww..~~",
      "B...wwwwwww...B...~~~..ww...wwww...B",
      "B...wwwwwww.......~~~..ww...wwww...B",
      "B.....*...........~~~..ww......*...B",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ]),
    start: { x: 4, y: 7 },
    buildings: [],
    gates: [],
    lanterns: [],
    villagers: [],
  },
  exits: [
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "practice", label: "On to the Practice island" },
  ],
  wildRows: ["s", "t"],
};

/** もり, the forest path along the bridge from Home to the Games island: winding between trees hung with festival
 *  lanterns, with a wide band of tall grass (columns 18–22) across the middle. */
const HOME_GAMES: WildRoute = {
  id: "home-games",
  theme: "festival",
  name: "The forest path",
  japaneseName: "もり",
  between: ["home", "games"],
  layout: {
    map: parseTownMap([
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
      "TTTT..wwww..TTTT..wwwww..TTT..wwwTTT",
      "TT....wwww....TT..wwwww........wwwTT",
      "T..=======.....=..wwwww..======...TT",
      "~~~=.....=.....=..wwwww..=....=..~~~",
      "~~~=..T..=..T..=..wwwww..=....=..~~~",
      "bbb====..=======..wwwww..======.=bbb",
      "bbb=======.....===wwwww===....===bbb",
      "~~~...T.....T.....wwwww.....T.....~~",
      "~~~..wwww.........wwwww....wwww...~~",
      "T....wwww...TT....wwwww....wwww....T",
      "T..T.wwww.........wwwww....wwww..T.T",
      "TT.......*....TT..wwwww......*....TT",
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    ]),
    start: { x: 4, y: 7 },
    buildings: [],
    gates: [],
    lanterns: FOREST_LANTERNS,
    villagers: [],
  },
  exits: [
    { tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "home", label: "Back to the village" },
    { tile: { x: 34, y: 6 }, arrival: { x: 32, y: 7 }, island: "games", label: "On to the Games island" },
  ],
  wildRows: ["n", "h"],
};

export const WILD_ROUTES: readonly WildRoute[] = [HOME_KANA, HOME_PRACTICE, HOME_GAMES];

export const routeById = (id: string): WildRoute | null => WILD_ROUTES.find(route => route.id === id) ?? null;
