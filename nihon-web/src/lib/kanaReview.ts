export type KanaScript = "hiragana" | "katakana";
export type CharacterStat = {
  id: number; kana: string; romaji: string;
  correctCount: number; wrongCount: number; total: number; accuracy: number;
  status: "mastered" | "learning" | "untested";
};
export const REVIEW_SIZES = [5, 10, 15, 20] as const;
export type ReviewSize = typeof REVIEW_SIZES[number];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Status and accuracy are supplied by /statistics, never recalculated here.
export function selectReviewCharacters(characters: CharacterStat[], size: ReviewSize, random = Math.random) {
  const unique = [...new Map(characters.map(c => [c.id, c])).values()];
  const learning = shuffle(unique.filter(c => c.status === "learning"), random).sort((a, b) => a.accuracy - b.accuracy);
  const untested = shuffle(unique.filter(c => c.status === "untested"), random);
  const mastered = shuffle(unique.filter(c => c.status === "mastered"), random);
  const quotas = { 5: [3, 2, 0], 10: [6, 3, 1], 15: [9, 4, 2], 20: [12, 6, 2] }[size];
  const groups = [learning, untested, mastered];
  const selected = groups.flatMap((group, i) => group.slice(0, quotas[i]));
  const ids = new Set(selected.map(c => c.id));
  for (const character of groups.flat()) {
    if (selected.length >= size) break;
    if (!ids.has(character.id)) { selected.push(character); ids.add(character.id); }
  }
  return shuffle(selected, random);
}

export function reviewChoices(character: CharacterStat, catalog: CharacterStat[], random = Math.random) {
  const readings = [...new Set(catalog.map(c => c.romaji.trim().toLowerCase()))];
  const distractors = shuffle(readings.filter(r => !isRomajiMatch(character.romaji, r)), random).slice(0, 3);
  if (distractors.length < 3) throw new Error("Not enough distinct readings for four choices");
  return shuffle([character.romaji, ...distractors], random);
}
import { isRomajiMatch } from "./romaji";
