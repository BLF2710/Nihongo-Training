// The village square (ひろば), Home: the main island, where the whole cast lives, each in front of their building, as a
// way into the site. Drawn in 3D as a town: a shrine in its own gravel precinct behind a torii in the north-west, the
// tea house, a grand two-storey hot-spring inn and the school along the north lane, the learner's own townhouse with
// the kana school, the festival stall, the practice hall and the post office facing the main road, and a street of
// townhouses, the dojo and a festival corner south of it. Each row of buildings stands well back from the road behind
// it (north of it), so the camera, looking down from the south, sees whoever walks there over their roofs. Five roads run out of the village over bridges, each
// onto a wild path to an island, on the side of the village the island lies on the map (the path's heading). The
// square has no story, so no gates.
// What the villagers say comes from lib/village/villageNews; this is only where everything stands.
import type { Vector } from "../../lib/errands/movement.ts";
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { VillageLayout } from "../../lib/errands/village.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import { groundBlockedBy } from "../../lib/world/islandProps.ts";
import type { IslandProp } from "../../lib/world/islandProps.ts";
import { routeHref } from "../../lib/world/routes.ts";
import type { RouteId } from "../../lib/world/routes.ts";

/** A road out of the square: the gate tile at its end (by the bridge it leaves over), where the traveller appears
 *  coming back off the path, and what the gate says. */
type RoadOut = { route: RouteId; gate: Vector; arrival: Vector; label: string };

const ROADS_OUT: readonly RoadOut[] = [
  { route: "home-kana", gate: { x: 34, y: 15 }, arrival: { x: 32, y: 16 }, label: "The meadow path (のはら), east to the Kana island" },
  // Two roads leave westward: the Practice island lies north-west of Home on the map, the Review island south-west.
  { route: "home-practice", gate: { x: 1, y: 7 }, arrival: { x: 4, y: 8 }, label: "The riverside path (かわべ), west to the Practice island" },
  { route: "home-review", gate: { x: 1, y: 15 }, arrival: { x: 3, y: 16 }, label: "The pine path (まつみち), west to the Review island" },
  { route: "home-games", gate: { x: 8, y: 22 }, arrival: { x: 8, y: 20 }, label: "The forest path (もり), south to the Games island" },
  { route: "home-lessons", gate: { x: 26, y: 1 }, arrival: { x: 27, y: 4 }, label: "The stone path (いしみち), north to the Lessons island" },
];

/** The learner's own house: its sign shows their name (see lib/village/homeSign). */
export const HOME_BUILDING_ID = "home";

/** The pieces standing about the square, drawn in 3D: the shrine's torii, guardians, lanterns, water basin and prayer
 *  boards, banners by the tea house and the stall, and the festival corner's food cart, tea bench and drum. */
export const VILLAGE_PROPS: readonly IslandProp[] = [
  { kind: "torii", at: { x: 6, y: 6, width: 4, height: 1 } },
  { kind: "komainu", at: { x: 6, y: 5, width: 1, height: 1 }, facing: "right" },
  { kind: "komainu", at: { x: 9, y: 5, width: 1, height: 1 }, facing: "left" },
  { kind: "stone-lantern", at: { x: 5, y: 2, width: 1, height: 1 } },
  { kind: "stone-lantern", at: { x: 10, y: 2, width: 1, height: 1 } },
  { kind: "temizuya", at: { x: 3, y: 2, width: 2, height: 1 } },
  { kind: "ema-rack", at: { x: 11, y: 3, width: 1, height: 1 } },
  { kind: "nobori-tea", at: { x: 17, y: 3, width: 1, height: 1 } },
  { kind: "nobori-dango", at: { x: 12, y: 12, width: 1, height: 1 } },
  { kind: "nobori", at: { x: 26, y: 19, width: 1, height: 1 } },
  { kind: "yatai", at: { x: 27, y: 19, width: 2, height: 2 } },
  { kind: "tea-bench", at: { x: 29, y: 19, width: 2, height: 2 } },
  { kind: "taiko", at: { x: 32, y: 19, width: 2, height: 2 } },
];
/** Along both sides of the main road: paper lanterns, lit as the learner gets the day's errands done. */
const LANTERNS: readonly Vector[] = [2, 6, 11, 15, 20, 24, 29, 32].flatMap(x => [{ x, y: 14 }, { x, y: 17 }]);

export const VILLAGE_SQUARE: VillageLayout = {
  map: parseTownMap([
    "TTTTTTTTTTTTTTTTTTTTTTTTTTbbTTTTTTTT",
    "TSS,,,,,,,,,S....S........==.......T",
    "TSS,,,,,,,,,..............==.......T",
    "T,,,,,,,,,,,..............==.......T",
    "T,~~,,,oo,,,..............==.......T",
    "T,~~,,,oo,=========================T",
    "T,,,,,,oo,,,..*....*....*.==.....*.T",
    "b======oo===================..*....T",
    "b======oo===================S.....ST",
    "T..*....*....S............==.......T",
    "T...........*............*==.......T",
    "T.........................==.......T",
    "T.........................==......*T",
    "TS...............*.S......==*......T",
    "T.....................==..==.......T",
    "b==================================b",
    "b==================================b",
    "T...*...==................*........T",
    "T.......==......*....*.............T",
    "T.......==.........................T",
    "T.......==.........................T",
    "TT......==S........................T",
    "TT......==.......................TTT",
    "TTTTTTTTbbTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ]),
  start: { x: 18, y: 16 },
  buildings: [
    { id: "shrine", x: 6, y: 1, width: 4, height: 3, sign: "神社", label: "The shrine: today's goal", roof: "vermilion", look: "shrine" },
    { id: "teahouse", x: 12, y: 2, width: 5, height: 3, sign: "茶", label: "The tea house: the study assistant", roof: "moss", look: "teahouse" },
    { id: "onsen", x: 18, y: 1, width: 8, height: 4, sign: "温泉", label: "The hot spring inn: achievements", roof: "indigo", look: "onsen" },
    { id: "school", x: 29, y: 2, width: 6, height: 3, sign: "学校", label: "The school: lessons", roof: "indigo", look: "school" },
    { id: "kana-school", x: 2, y: 11, width: 5, height: 3, sign: "かな", label: "The kana school", roof: "indigo", look: "kana-school" },
    { id: "stall", x: 8, y: 12, width: 4, height: 2, sign: "まつり", label: "The festival stall: games", roof: "vermilion", look: "stall" },
    { id: "practice-hall", x: 14, y: 11, width: 4, height: 3, sign: "練習", label: "The practice hall", roof: "wood", look: "practice-hall" },
    // The learner's own townhouse, in the middle of the village by the path down to the main road; its door opens
    // their profile.
    { id: HOME_BUILDING_ID, x: 20, y: 11, width: 5, height: 3, sign: "いえ", label: "Your house: your profile", roof: "wood", look: "home" },
    { id: "post-office", x: 29, y: 11, width: 5, height: 3, sign: "〒", label: "The post office: messages", roof: "vermilion", look: "post-office" },
    { id: "dojo", x: 2, y: 19, width: 4, height: 3, sign: "道場", label: "The dojo: exams", roof: "wood", look: "dojo" },
    { id: "calligraphy", x: 11, y: 19, width: 4, height: 3, sign: "書道", label: "The calligraphy hall: kanji", roof: "moss", look: "calligraphy" },
    { id: "sake-house", x: 17, y: 19, width: 4, height: 3, sign: "さけ", label: "The sake brewer's", roof: "indigo", look: "house" },
    { id: "bakery", x: 22, y: 19, width: 4, height: 3, sign: "パン", label: "Tama's bakery", roof: "moss", look: "bakery" },
  ],
  gates: [],
  lanterns: LANTERNS,
  villagers: [
    // Kon keeps the shrine; Zen sits by its pond with the review cards.
    { id: "kon", tile: { x: 10, y: 4 } },
    { id: "zen", tile: { x: 4, y: 4 } },
    { id: "sensei", tile: { x: 12, y: 5 } },
    { id: "momo", tile: { x: 20, y: 5 } },
    { id: "hakase", tile: { x: 30, y: 5 } },
    { id: "chun", tile: { x: 7, y: 13 } },
    { id: "pon", tile: { x: 12, y: 13 } },
    { id: "tama", tile: { x: 18, y: 12 } },
    { id: "hato", tile: { x: 34, y: 13 } },
    { id: "kurama", tile: { x: 6, y: 21 } },
    { id: "tsuru", tile: { x: 15, y: 21 } },
  ],
  obstacles: [...VILLAGE_PROPS.flatMap(groundBlockedBy), ...LANTERNS.map(at => ({ ...at, width: 1, height: 1 }))],
};

/** The end of a road out of the square, where a wild path begins. */
const pathGate = ({ route, gate, label }: RoadOut): Door => ({ id: `path-${route}`, tile: gate, href: routeHref(route, "home"), label, action: "Go" });

export const VILLAGE_DOORS: readonly Door[] = [
  { id: "home", tile: { x: 22, y: 14 }, href: "/profile", label: "Your house" },
  ...ROADS_OUT.map(pathGate),
];

/** Where the traveller appears coming back off a wild path: just inside the end of its road (null for no such path). */
export const villageArrivalFrom = (routeId: string): Vector | null => ROADS_OUT.find(road => road.route === routeId)?.arrival ?? null;
