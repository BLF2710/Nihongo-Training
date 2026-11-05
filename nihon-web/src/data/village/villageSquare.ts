// The village square (ひろば): the whole island cast, each in front of their building, as a way into the site. It's
// laid out on Island Errands' village, with nothing closed off: the square has no story, so no gates.
// What they say comes from lib/village/villageNews; this is only where everything stands.
import { MATSURI_LANTERNS, MATSURI_MAP } from "../errands/matsuriVillage.ts";
import type { VillageLayout } from "../../lib/errands/village.ts";
import type { Door } from "../../lib/village/villageDoors.ts";

/** The learner's own house: its sign shows their name (see lib/village/homeSign). */
export const HOME_BUILDING_ID = "home";

export const VILLAGE_SQUARE: VillageLayout = {
  map: MATSURI_MAP,
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

export const VILLAGE_DOORS: readonly Door[] = [
  { id: "home", tile: { x: 22, y: 12 }, href: "/profile", label: "Your house" },
];
