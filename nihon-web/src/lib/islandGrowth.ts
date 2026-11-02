// Islands grow with the learner's own progress: each ring island has one or more growth tracks, each reached by one
// measure of its work (Practice has a track per skill, Review one for cards learned and one for mature cards), and Home's
// torii grows with every JLPT level completed. Pure rules (no React), so they run in node tests.
import type { IslandId } from "./islandMap.ts";

/** The progress the map grows from. A measure is null while it is unknown (still loading, or its request failed). */
export type GrowthFacts = {
  completedLessons: number | null;
  levelsCompleted: number | null;
  listeningSessions: number | null;
  speakingSessions: number | null;
  readingSessions: number | null;
  gamesPlayed: number | null;
  cardsLearned: number | null;
  matureCards: number | null;
  kanjiMastered: number | null;
  kanaMastered: number | null;
};
export type GrowthMeasure = keyof GrowthFacts;

/** How far one track has grown: its step (0 = not yet), the measure's value, and where the next step begins. */
export type GrowthTrack = { measure: GrowthMeasure; stage: number; maxStage: number; value: number; nextAt: number | null };
/** An island's growth: its tracks in order, and their steps added up. */
export type IslandGrowth = { stage: number; maxStage: number; tracks: readonly GrowthTrack[] };

type GrowthRule = { measure: GrowthMeasure; steps: readonly number[] };

const SKILL_STEPS = [3, 10, 25] as const;

export const GROWTH_RULES: Partial<Record<IslandId, readonly GrowthRule[]>> = {
  home: [{ measure: "levelsCompleted", steps: [1, 2, 3, 4, 5] }],
  lessons: [{ measure: "completedLessons", steps: [5, 20, 50] }],
  practice: [
    { measure: "listeningSessions", steps: SKILL_STEPS },
    { measure: "speakingSessions", steps: SKILL_STEPS },
    { measure: "readingSessions", steps: SKILL_STEPS },
  ],
  games: [{ measure: "gamesPlayed", steps: [3, 10, 25, 50] }],
  review: [{ measure: "cardsLearned", steps: [20, 100, 300] }, { measure: "matureCards", steps: [10, 50, 150] }],
  kanji: [{ measure: "kanjiMastered", steps: [10, 50, 150] }],
  kana: [{ measure: "kanaMastered", steps: [15, 46, 92] }],
};

function trackGrowth(rule: GrowthRule, value: number): GrowthTrack {
  const stage = rule.steps.filter(step => value >= step).length;
  return { measure: rule.measure, stage, maxStage: rule.steps.length, value, nextAt: rule.steps[stage] ?? null };
}

/** An island's growth, or null when it does not grow or any of its measures is still unknown. */
export function islandGrowth(id: IslandId, facts: GrowthFacts): IslandGrowth | null {
  const rules = GROWTH_RULES[id];
  if (!rules) return null;
  const tracks: GrowthTrack[] = [];
  for (const rule of rules) {
    const value = facts[rule.measure];
    if (value === null) return null;
    tracks.push(trackGrowth(rule, value));
  }
  return { stage: sumOf(tracks.map(track => track.stage)), maxStage: sumOf(tracks.map(track => track.maxStage)), tracks };
}

const sumOf = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0);

/** Practice sessions by kind, from the learning overview (the particle game is a kind too: it grows Games). */
export const GAME_KINDS: readonly string[] = ["particles"];

export function sessionsOf(practice: readonly { kind: string; sessions: number }[], kinds: readonly string[]): number {
  return practice.filter(item => kinds.includes(item.kind)).reduce((sum, item) => sum + item.sessions, 0);
}

/** Splits an island's total step among its tracks, one step to each in turn (as a preview shows a total). */
export function spreadStage(stage: number, maxStages: readonly number[]): number[] {
  const stages = maxStages.map(() => 0);
  let remaining = Math.min(stage, sumOf(maxStages));
  while (remaining > 0) {
    for (const [index, maxStage] of maxStages.entries()) {
      if (remaining === 0 || stages[index] >= maxStage) continue;
      stages[index] += 1;
      remaining -= 1;
    }
  }
  return stages;
}
