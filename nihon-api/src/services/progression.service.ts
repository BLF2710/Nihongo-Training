export type LevelProgress = { level: number; currentLevelXp: number; nextLevelXp: number; progressXp: number; progressPercent: number };
export type Rank = { name: string; xp: number };

// Each level costs 50 XP more than the one before: 0, 100, 250, 450, 700, 1000, 1350, ... with no top level.
const LEVEL_STEP_XP = 25;

export const RANK_THRESHOLDS: readonly Rank[] = [
  { name: "Beginner", xp: 0 }, { name: "Bronze", xp: 250 }, { name: "Silver", xp: 1000 },
  { name: "Gold", xp: 2500 }, { name: "Platinum", xp: 5000 }, { name: "Diamond", xp: 10000 }, { name: "Master", xp: 20000 },
];

/** Total XP needed to reach a level. */
export function getXPForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return LEVEL_STEP_XP * (n - 1) * (n + 2);
}

export function getLevelFromXP(xp: number): number {
  const safeXp = Math.max(0, xp);
  // Solves getXPForLevel(n) <= xp for n, then steps once either way to undo floating-point rounding.
  let level = Math.max(1, Math.floor((Math.sqrt(9 + 4 * safeXp / LEVEL_STEP_XP) - 1) / 2));
  while (getXPForLevel(level + 1) <= safeXp) level++;
  while (level > 1 && getXPForLevel(level) > safeXp) level--;
  return level;
}

export function getXPProgress(xp: number): LevelProgress {
  const level = getLevelFromXP(xp);
  const currentLevelXp = getXPForLevel(level), nextLevelXp = getXPForLevel(level + 1);
  const progressXp = xp - currentLevelXp;
  return { level, currentLevelXp, nextLevelXp, progressXp, progressPercent: Math.floor(progressXp / (nextLevelXp - currentLevelXp) * 100) };
}

export function getRankFromXP(xp: number): string { return RANK_THRESHOLDS.reduce((rank, item) => xp >= item.xp ? item.name : rank, RANK_THRESHOLDS[0].name); }

export function getNextRank(xp: number): Rank | null { return RANK_THRESHOLDS.find(item => item.xp > xp) ?? null; }
