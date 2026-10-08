import { getAchievementReward, grantAchievement } from "../repositories/achievement.repository";
import { getCurrentStreak } from "../repositories/gamification.repository";
import { getLessonSummary } from "../repositories/lesson-progress.repository";
import { awardXP } from "./xp.service";

const FIRST_N5_LESSON_ID = "japanese-n5-unit-1-hello";

type AchievementFacts = { lessons: number; bestScore: number; completedFirstN5Lesson: boolean; currentStreak: number };

// Checked in this order; add an achievement by adding a rule.
const ACHIEVEMENT_RULES: { id: string; earned: (facts: AchievementFacts) => boolean }[] = [
  { id: "first_steps", earned: facts => facts.lessons > 0 },
  { id: "week_warrior", earned: facts => facts.currentStreak >= 7 },
  // Vocabulary has no persisted vocabulary-item model yet; it remains unavailable until that existing curriculum data exists.
  { id: "vocabulary_starter", earned: () => false },
  { id: "japanese_beginner", earned: facts => facts.completedFirstN5Lesson },
  { id: "perfect_score", earned: facts => facts.bestScore === 100 },
];

export async function evaluateAchievements(userId: number) {
  const summary = await getLessonSummary(userId, FIRST_N5_LESSON_ID);
  const currentStreak = await getCurrentStreak(userId);
  const facts: AchievementFacts = { lessons: summary.lessons, bestScore: summary.bestScore, completedFirstN5Lesson: summary.completedLesson, currentStreak };
  const newlyEarned: string[] = [];
  for (const rule of ACHIEVEMENT_RULES) {
    if (!rule.earned(facts)) continue;
    if (!(await grantAchievement(userId, rule.id))) continue;
    await awardXP(userId, await getAchievementReward(rule.id), "achievement", rule.id);
    newlyEarned.push(rule.id);
  }
  return newlyEarned;
}
