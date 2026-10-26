import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import type { CourseLevel } from "../grading/jfGrading";

export type NewSpeakingAttempt = {
  userId: number; taskId: string; level: CourseLevel; score: number; band: number; met: boolean;
  deliverySource: "azure" | "browser"; transcript: string; result: unknown;
};
export type SpeakingAttemptRow = { id: number; task_id: string; course_level: CourseLevel; score: number; band: number; met: boolean; created_at: Date; result: Record<string, unknown> };
export type TaskSummaryRow = { task_id: string; attempts: number; best_score: number; best_band: number; met: boolean };

export async function insertSpeakingAttempt(db: Queryable, attempt: NewSpeakingAttempt): Promise<{ id: number; createdAt: Date }> {
  const result = await db.query(
    `INSERT INTO speaking_attempts (user_id, task_id, course_level, score, band, met, delivery_source, transcript, result)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, created_at`,
    [attempt.userId, attempt.taskId, attempt.level, attempt.score, attempt.band, attempt.met, attempt.deliverySource, attempt.transcript, JSON.stringify(attempt.result)]);
  return { id: Number(result.rows[0].id), createdAt: result.rows[0].created_at };
}

export async function countSpeakingAttemptsSince(userId: number, seconds: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM speaking_attempts WHERE user_id = $1 AND created_at > NOW() - make_interval(secs => $2)", [userId, seconds]);
  return result.rows[0].count;
}

/** Per task of a level: number of attempts, best score and whether the target was ever met. */
export async function summarizeSpeakingTasks(userId: number, level: CourseLevel): Promise<TaskSummaryRow[]> {
  const result = await pool.query(
    `SELECT task_id, COUNT(*)::int AS attempts, MAX(score)::int AS best_score, MAX(band)::int AS best_band, BOOL_OR(met) AS met
       FROM speaking_attempts WHERE user_id = $1 AND course_level = $2 GROUP BY task_id`, [userId, level]);
  return result.rows;
}

export async function listSpeakingAttempts(userId: number, taskId: string, limit: number): Promise<SpeakingAttemptRow[]> {
  const result = await pool.query(
    `SELECT id, task_id, course_level, score, band, met, created_at, result FROM speaking_attempts
      WHERE user_id = $1 AND task_id = $2 ORDER BY id DESC LIMIT $3`, [userId, taskId, limit]);
  return result.rows.map(row => ({ ...row, id: Number(row.id) }));
}

export async function findSpeakingAttempt(userId: number, id: number): Promise<SpeakingAttemptRow | undefined> {
  const result = await pool.query("SELECT id, task_id, course_level, score, band, met, created_at, result FROM speaking_attempts WHERE user_id = $1 AND id = $2", [userId, id]);
  return result.rows[0] ? { ...result.rows[0], id: Number(result.rows[0].id) } : undefined;
}
