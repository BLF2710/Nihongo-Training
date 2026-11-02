// Islands grow with the learner's own progress: each ring island has growth steps reached by one measure of its work,
// and Home's shrine grows with every JLPT level completed. Pure rules (no React), so they run in node tests.
import type { IslandId } from "./islandMap.ts";

/** The progress the map grows from. A measure is null while it is unknown (still loading, or its request failed). */
export type GrowthFacts = {
  completedLessons: number | null;
  levelsCompleted: number | null;
  practiceSessions: number | null;
  gamesPlayed: number | null;
  matureCards: number | null;
  kanjiMastered: number | null;
  kanaMastered: number | null;
};
export type GrowthMeasure = keyof GrowthFacts;

/** How far an island has grown: its step (0 = not yet), the measure's value, and where the next step begins. */
export type IslandGrowth = { stage: number; maxStage: number; measure: GrowthMeasure; value: number; nextAt: number | null };

type GrowthRule = { measure: GrowthMeasure; steps: readonly number[] };

export const GROWTH_RULES: Partial<Record<IslandId, GrowthRule>> = {
  home: { measure: "levelsCompleted", steps: [1, 2, 3, 4, 5] },
  lessons: { measure: "completedLessons", steps: [5, 20, 50] },
  practice: { measure: "practiceSessions", steps: [5, 20, 50] },
  games: { measure: "gamesPlayed", steps: [3, 15, 40] },
  review: { measure: "matureCards", steps: [10, 50, 150] },
  kanji: { measure: "kanjiMastered", steps: [10, 50, 150] },
  kana: { measure: "kanaMastered", steps: [15, 46, 92] },
};

/** An island's growth, or null when it does not grow or its measure is still unknown. */
export function islandGrowth(id: IslandId, facts: GrowthFacts): IslandGrowth | null {
  const rule = GROWTH_RULES[id];
  if (!rule) return null;
  const value = facts[rule.measure];
  if (value === null) return null;
  const stage = rule.steps.filter(step => value >= step).length;
  return { stage, maxStage: rule.steps.length, measure: rule.measure, value, nextAt: rule.steps[stage] ?? null };
}

/** Practice sessions by kind, from the learning overview: listening, speaking and reading grow Practice; the particle
 *  game grows Games. */
export const PRACTICE_KINDS: readonly string[] = ["listening", "speaking", "reading"];
export const GAME_KINDS: readonly string[] = ["particles"];

export function sessionsOf(practice: readonly { kind: string; sessions: number }[], kinds: readonly string[]): number {
  return practice.filter(item => kinds.includes(item.kind)).reduce((sum, item) => sum + item.sessions, 0);
}
