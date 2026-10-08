import { pool } from "../config/db";

export async function listCompletedLessonIds(userId: number): Promise<string[]> {
  const result = await pool.query("SELECT lesson_id FROM lesson_progress WHERE user_id=$1", [userId]);
  return result.rows.map(row => row.lesson_id);
}

export async function isLessonCompleted(userId: number, lessonId: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2", [userId, lessonId]);
  return Boolean(result.rowCount);
}

/** Marks the lesson complete, keeping the best challenge score across retakes. */
export async function saveLessonScore(userId: number, lessonId: string, challengeScore: number) {
  await pool.query(
    "INSERT INTO lesson_progress (user_id,lesson_id,challenge_score) VALUES ($1,$2,$3) ON CONFLICT (user_id,lesson_id) DO UPDATE SET challenge_score=GREATEST(lesson_progress.challenge_score, EXCLUDED.challenge_score), updated_at=NOW()",
    [userId, lessonId, challengeScore]
  );
}

export async function getLessonSummary(userId: number, lessonId: string): Promise<{ lessons: number; bestScore: number; completedLesson: boolean }> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS lessons, COALESCE(MAX(challenge_score), 0)::int AS best_score,
    BOOL_OR(lesson_id = $2) AS completed_lesson FROM lesson_progress WHERE user_id=$1`,
    [userId, lessonId]
  );
  const row = result.rows[0];
  return { lessons: row.lessons, bestScore: row.best_score, completedLesson: row.completed_lesson === true };
}
