import type { Achievement, AchievementCategory, ActivitySource, XpSource } from "../api/gamification";

/** How each kind of XP is described to learners, and where to go to earn it. */
export const XP_SOURCES: Record<XpSource, { icon: string; label: string; how: string; href?: string }> = {
  lesson_completion: { icon: "📖", label: "Lessons", how: "Finish a lesson (once per lesson)", href: "/lessons" },
  lesson_challenge: { icon: "💯", label: "Perfect challenges", how: "Score 100% on a lesson's challenge", href: "/lessons" },
  assessment: { icon: "🎓", label: "Unit assessments", how: "Pass a unit assessment (once per unit)", href: "/quizzes" },
  quiz: { icon: "あ", label: "Kana quizzes", how: "Every 10 correct kana answers", href: "/practice?type=hiragana" },
  game: { icon: "🧩", label: "English games", how: "Finish an English Arcade game", href: "/arcade" },
  review: { icon: "🗂️", label: "Daily review", how: "Each card you review", href: "/srs" },
  mistake: { icon: "📒", label: "Mistakes cleared", how: "Clear a question from your mistake notebook", href: "/mistakes" },
  kanji: { icon: "漢", label: "Kanji practice", how: "Each correct kanji practice answer", href: "/learn/kanji/practice" },
  practice: { icon: "🎧", label: "Listening, speaking, reading", how: "Finish a practice session", href: "/listening" },
  mock_exam: { icon: "📝", label: "Mock exams", how: "Finish a mock exam", href: "/mock-exam" },
  mock_exam_pass: { icon: "🏅", label: "Mock exam passed", how: "Pass a level's mock exam (once per level)", href: "/mock-exam" },
  speaking_test: { icon: "🗣️", label: "Speaking tests", how: "Get a speaking test graded", href: "/speaking/test" },
  daily_goal: { icon: "🎯", label: "Daily goal", how: "Meet your daily study goal", href: "/settings/learning" },
  achievement: { icon: "🏆", label: "Achievement", how: "Earn an achievement" },
  streak: { icon: "🔥", label: "Streak", how: "Keep your streak" },
};

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: "lessons", label: "Lessons", icon: "📖" }, { id: "units", label: "Units", icon: "🎓" }, { id: "review", label: "Review", icon: "🗂️" },
  { id: "kanji", label: "Kanji", icon: "漢" }, { id: "streaks", label: "Streaks", icon: "🔥" }, { id: "tests", label: "Practice & tests", icon: "📝" },
  { id: "friends", label: "Friends", icon: "🤝" }, { id: "levels", label: "Levels", icon: "⭐" },
];

export const isEarned = (achievement: Achievement) => achievement.earnedAt !== null;

/** Share of the goal reached, 0 to 100. */
export const achievementPercent = (achievement: Achievement) => isEarned(achievement) ? 100 : Math.floor(achievement.progress / achievement.goal * 100);

/** The unearned achievements the learner is closest to finishing. */
export function nextAchievements(achievements: Achievement[], count: number): Achievement[] {
  return achievements.filter(item => !isEarned(item)).sort((a, b) => achievementPercent(b) - achievementPercent(a)).slice(0, count);
}

/** Earned achievements, most recent first. */
export function latestEarned(achievements: Achievement[], count: number): Achievement[] {
  return achievements.filter(isEarned).sort((a, b) => String(b.earnedAt).localeCompare(String(a.earnedAt))).slice(0, count);
}

/** "8 / 30 XP today", or "no daily limit". */
export function describeCap(activity: { dailyCap: number | null; earned: number }): string {
  return activity.dailyCap === null ? "No daily limit" : `${activity.earned} / ${activity.dailyCap} XP today`;
}

export const isCapReached = (activity: { dailyCap: number | null; earned: number }) => activity.dailyCap !== null && activity.earned >= activity.dailyCap;

export const SHOWN_SOURCES: ActivitySource[] = [
  "lesson_completion", "lesson_challenge", "assessment", "review", "mistake", "kanji", "practice", "mock_exam", "mock_exam_pass", "speaking_test", "daily_goal", "quiz", "game",
];
