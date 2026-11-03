import type { IslandId } from "./islandMap.ts";

/** The island cast: one character per island, who speaks on that island's pages (components/cast). */
export type CharacterId = "kon" | "hakase" | "tama" | "pon" | "zen" | "tsuru" | "chun" | "kurama" | "hato" | "sensei" | "momo";
/** How a character looks while speaking: pleased, settled, or concerned. */
export type Mood = "happy" | "calm" | "worried";
export type Character = { id: CharacterId; name: string; role: string; island: IslandId };

export const CAST: Readonly<Record<CharacterId, Character>> = {
  kon: { id: "kon", name: "Kon", role: "the shrine fox", island: "home" },
  hakase: { id: "hakase", name: "Hakase", role: "the professor owl", island: "lessons" },
  tama: { id: "tama", name: "Tama", role: "the practice cat", island: "practice" },
  pon: { id: "pon", name: "Pon", role: "the festival tanuki", island: "games" },
  zen: { id: "zen", name: "Zen", role: "the garden monk", island: "review" },
  tsuru: { id: "tsuru", name: "Tsuru", role: "the calligrapher crane", island: "kanji" },
  chun: { id: "chun", name: "Chun", role: "the kana sparrow", island: "kana" },
  kurama: { id: "kurama", name: "Kurama", role: "the tengu of the dojo", island: "fuji" },
  hato: { id: "hato", name: "Hato", role: "the carrier pigeon", island: "harbour" },
  sensei: { id: "sensei", name: "Sensei", role: "of the tea house", island: "teahouse" },
  momo: { id: "momo", name: "Momo", role: "the onsen monkey", island: "onsen" },
};

/** The character who lives on an island; the Time island has none of its own, so Kon speaks for it. */
export function characterOf(island: IslandId): Character {
  return Object.values(CAST).find(character => character.island === island) ?? CAST.kon;
}

/** "Zen, the garden monk": how a character is introduced beside what they say. */
export const introduce = ({ name, role }: Character) => `${name}, ${role}`;
