import api from "./axios";

export type XpSource =
  | "lesson_completion" | "lesson_challenge" | "assessment" | "quiz" | "game" | "review" | "mistake" | "kanji"
  | "practice" | "mock_exam" | "mock_exam_pass" | "speaking_test" | "daily_goal" | "achievement" | "streak";
export type ActivitySource = Exclude<XpSource, "achievement" | "streak">;
export type AchievementCategory = "lessons" | "units" | "review" | "kanji" | "streaks" | "tests" | "friends" | "levels";

export type LevelProgress = { level: number; currentLevelXp: number; nextLevelXp: number; progressXp: number; progressPercent: number };
export type Rank = { name: string; xp: number };
export type Achievement = {
  id: string; title: string; description: string; xpReward: number; category: AchievementCategory; icon: string;
  goal: number; progress: number; earnedAt: string | null;
};
export type TodayActivity = { source: ActivitySource; amount: number; dailyCap: number | null; earned: number };
export type Gamification = {
  xp: number; level: LevelProgress; rank: string; nextRank: Rank | null; ranks: Rank[];
  streak: { current: number; longest: number };
  today: { date: string; xp: number; activities: TodayActivity[] };
  achievements: Achievement[];
  recent: { source: XpSource; amount: number; createdAt: string }[];
};

export async function fetchGamification(signal?: AbortSignal) {
  return (await api.get<Gamification>("/profile/me/gamification", { signal })).data;
}
