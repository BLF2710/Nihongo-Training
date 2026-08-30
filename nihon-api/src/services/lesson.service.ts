import { pool } from "../config/db";
import { getLevelFromXP, getRankFromXP, RANK_THRESHOLDS } from "./progression.service";

export type LessonDefinition = { id: string; title: string; unit: string; previousLessonId?: string; minimumLevel?: number; minimumRank?: string };
export const LESSONS: LessonDefinition[] = [
  { id: "japanese-n5-unit-1-hello", title: "How to Say Hello", unit: "Japanese N5 Unit 1" },
  { id: "japanese-n5-unit-1-introductions", title: "Introducing Yourself", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-hello", minimumLevel: 2 },
  { id: "japanese-n5-unit-1-origin", title: "Where Are You From?", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-introductions" },
  { id: "japanese-n5-unit-1-questions", title: "Basic Questions", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-origin" },
  { id: "japanese-n5-unit-1-numbers-age", title: "Numbers & Age", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-questions" },
  { id: "japanese-n5-unit-1-demonstratives", title: "This, That & Those", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-numbers-age" }
];
export async function canUserAccessLesson(userId: number, lesson: LessonDefinition) {
  const user = await pool.query("SELECT xp FROM user_gamification WHERE user_id=$1", [userId]); const xp = Number(user.rows[0]?.xp ?? 0);
  const completed = lesson.previousLessonId ? await pool.query("SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2", [userId, lesson.previousLessonId]) : null;
  const rank = getRankFromXP(xp); const requiredRankIndex = lesson.minimumRank ? RANK_THRESHOLDS.findIndex((item) => item.name === lesson.minimumRank) : -1; const rankIndex = RANK_THRESHOLDS.findIndex((item) => item.name === rank);
  const reasons = [lesson.previousLessonId && !(completed?.rowCount) ? "Complete the previous lesson" : null, lesson.minimumLevel && getLevelFromXP(xp) < lesson.minimumLevel ? `Reach Level ${lesson.minimumLevel}` : null, requiredRankIndex >= 0 && rankIndex < requiredRankIndex ? `Reach ${lesson.minimumRank}` : null].filter(Boolean) as string[];
  return { allowed: reasons.length === 0, reasons };
}
