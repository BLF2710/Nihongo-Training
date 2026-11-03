import type { IslandId } from "./islandMap.ts";

// Each island's pages are laid out on a board in that island's material (components/theme/IslandBoard.tsx), with its
// Japanese name on the plaque: the Home island's notice board, the practice hall's bamboo, the zen garden's raked sand…
export type BoardMaterial = "wood" | "bamboo" | "sand" | "lacquer" | "shoji" | "indigo" | "tatami" | "harbour" | "stone";
export type Board = { material: BoardMaterial; plaque: string };

export const BOARDS: Readonly<Record<IslandId, Board>> = {
  home: { material: "wood", plaque: "掲示板" },
  lessons: { material: "wood", plaque: "教室" },
  practice: { material: "bamboo", plaque: "稽古" },
  games: { material: "lacquer", plaque: "祭り" },
  review: { material: "sand", plaque: "庭" },
  kanji: { material: "shoji", plaque: "書道" },
  kana: { material: "indigo", plaque: "かな" },
  fuji: { material: "tatami", plaque: "道場" },
  harbour: { material: "harbour", plaque: "港" },
  teahouse: { material: "tatami", plaque: "茶屋" },
  belltower: { material: "wood", plaque: "時" },
  onsen: { material: "stone", plaque: "温泉" },
};
