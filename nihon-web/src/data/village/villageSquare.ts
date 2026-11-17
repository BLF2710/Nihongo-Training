// The village square (ひろば): the whole island cast, each in front of their building, as a way into the site. It's
// laid out on Island Errands' village, with nothing closed off: the square has no story, so no gates. Four of its
// roads run on out of the village (a gap in the trees), each onto a wild path to an island, on the side of the village
// the island lies on the map (the path's heading).
// What they say comes from lib/village/villageNews; this is only where everything stands.
import { MATSURI_LANTERNS, MATSURI_MAP } from "../errands/matsuriVillage.ts";
import type { Vector } from "../../lib/errands/movement.ts";
import { withTerrain } from "../../lib/errands/townMap.ts";
import type { VillageLayout } from "../../lib/errands/village.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import { routeHref } from "../../lib/world/routes.ts";
import type { RouteId } from "../../lib/world/routes.ts";

/** A road out of the square: where it leaves the map (cut through the trees), the gate tile at its end, where the
 *  traveller appears coming back off the path, and what the gate says. */
type RoadOut = { route: RouteId; gap: readonly Vector[]; gate: Vector; arrival: Vector; label: string };

const ROADS_OUT: readonly RoadOut[] = [
  { route: "home-kana", gap: [{ x: 35, y: 15 }, { x: 35, y: 16 }], gate: { x: 34, y: 15 }, arrival: { x: 32, y: 15 }, label: "The meadow path (のはら), east to the Kana island" },
  { route: "home-practice", gap: [{ x: 0, y: 15 }, { x: 0, y: 16 }], gate: { x: 1, y: 15 }, arrival: { x: 3, y: 15 }, label: "The riverside path (かわべ), west to the Practice island" },
  { route: "home-games", gap: [{ x: 8, y: 23 }, { x: 9, y: 23 }], gate: { x: 8, y: 22 }, arrival: { x: 8, y: 20 }, label: "The forest path (もり), south to the Games island" },
  { route: "home-lessons", gap: [{ x: 26, y: 0 }, { x: 27, y: 0 }], gate: { x: 26, y: 1 }, arrival: { x: 27, y: 4 }, label: "The stone path (いしみち), north to the Lessons island" },
];

/** The learner's own house: its sign shows their name (see lib/village/homeSign). */
export const HOME_BUILDING_ID = "home";

export const VILLAGE_SQUARE: VillageLayout = {
  map: withTerrain(MATSURI_MAP, ROADS_OUT.flatMap(road => road.gap), "path"),
  start: { x: 18, y: 16 },
  buildings: [
    { id: "teahouse", x: 11, y: 2, width: 5, height: 3, sign: "茶", label: "The tea house: the study assistant", roof: "moss", look: "teahouse" },
    { id: "school", x: 20, y: 2, width: 6, height: 3, sign: "学校", label: "The school: lessons", roof: "indigo", look: "school" },
    { id: "practice-hall", x: 29, y: 2, width: 4, height: 3, sign: "練習", label: "The practice hall", roof: "wood", look: "practice-hall" },
    // The learner's own house, in the field by the main road; its door opens their profile.
    { id: HOME_BUILDING_ID, x: 20, y: 9, width: 5, height: 3, sign: "いえ", label: "Your house: your profile", roof: "wood", look: "home" },
    { id: "shrine", x: 29, y: 9, width: 4, height: 3, sign: "神社", label: "The shrine: today's goal", roof: "vermilion", look: "shrine" },
    { id: "kana-school", x: 2, y: 11, width: 5, height: 3, sign: "かな", label: "The kana school", roof: "indigo", look: "kana-school" },
    { id: "stall", x: 11, y: 11, width: 4, height: 2, sign: "まつり", label: "The festival stall: games", roof: "vermilion", look: "stall" },
    { id: "dojo", x: 2, y: 18, width: 4, height: 3, sign: "道場", label: "The dojo: exams", roof: "wood", look: "dojo" },
    { id: "calligraphy", x: 11, y: 18, width: 4, height: 3, sign: "書道", label: "The calligraphy hall: kanji", roof: "moss", look: "calligraphy" },
    { id: "post-office", x: 20, y: 18, width: 5, height: 3, sign: "〒", label: "The post office: messages", roof: "vermilion", look: "post-office" },
    { id: "onsen", x: 29, y: 18, width: 4, height: 3, sign: "温泉", label: "The hot spring: achievements", roof: "indigo", look: "onsen" },
  ],
  gates: [],
  lanterns: MATSURI_LANTERNS,
  villagers: [
    // Zen keeps the review cards in the garden by the pond.
    { id: "zen", tile: { x: 6, y: 3 } },
    { id: "sensei", tile: { x: 13, y: 5 } },
    { id: "hakase", tile: { x: 22, y: 5 } },
    { id: "tama", tile: { x: 31, y: 5 } },
    { id: "kon", tile: { x: 32, y: 12 } },
    { id: "pon", tile: { x: 12, y: 13 } },
    { id: "chun", tile: { x: 4, y: 14 } },
    { id: "kurama", tile: { x: 3, y: 21 } },
    { id: "tsuru", tile: { x: 13, y: 21 } },
    { id: "hato", tile: { x: 22, y: 21 } },
    { id: "momo", tile: { x: 31, y: 21 } },
  ],
};

/** The end of a road out of the square, where a wild path begins. */
const pathGate = ({ route, gate, label }: RoadOut): Door => ({ id: `path-${route}`, tile: gate, href: routeHref(route, "home"), label, action: "Go" });

export const VILLAGE_DOORS: readonly Door[] = [
  { id: "home", tile: { x: 22, y: 12 }, href: "/profile", label: "Your house" },
  ...ROADS_OUT.map(pathGate),
];

/** Where the traveller appears coming back off a wild path: just inside the end of its road (null for no such path). */
export const villageArrivalFrom = (routeId: string): Vector | null => ROADS_OUT.find(road => road.route === routeId)?.arrival ?? null;
