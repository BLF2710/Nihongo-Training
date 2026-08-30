export type LevelProgress = { level: number; currentLevelXp: number; nextLevelXp: number | null; progressXp: number; progressPercent: number };

// Total XP required to enter each level; extend this list as the curriculum grows.
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
export const RANK_THRESHOLDS = [
  { name: "Beginner", xp: 0 }, { name: "Bronze", xp: 250 }, { name: "Silver", xp: 1000 },
  { name: "Gold", xp: 2500 }, { name: "Platinum", xp: 5000 }, { name: "Diamond", xp: 10000 }, { name: "Master", xp: 20000 }
];

export function getXPForLevel(level: number) { return LEVEL_THRESHOLDS[Math.max(0, level - 1)] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; }
export function getLevelFromXP(xp: number) { return LEVEL_THRESHOLDS.reduce((level, threshold, index) => xp >= threshold ? index + 1 : level, 1); }
export function getXPProgress(xp: number): LevelProgress {
  const level = getLevelFromXP(xp); const currentLevelXp = getXPForLevel(level); const nextLevelXp = LEVEL_THRESHOLDS[level] ?? null;
  return { level, currentLevelXp, nextLevelXp, progressXp: xp - currentLevelXp, progressPercent: nextLevelXp ? Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100) : 100 };
}
export function getRankFromXP(xp: number) { return RANK_THRESHOLDS.reduce((rank, item) => xp >= item.xp ? item.name : rank, RANK_THRESHOLDS[0].name); }
