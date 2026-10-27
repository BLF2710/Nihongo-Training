import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import type { MockResult, SectionResult } from "../learning/mockExamGrading";

export type SavedMockResult = MockResult & { id: number; level: string; timedOut: boolean; createdAt: Date };

type ResultRow = { id: string; course_level: string; correct: number; total: number; percent: number; passed: boolean; timed_out: boolean; sections: SectionResult[]; created_at: Date };
const toResult = (row: ResultRow): SavedMockResult => ({
  id: Number(row.id), level: row.course_level, correct: row.correct, total: row.total, percent: row.percent, passed: row.passed,
  timedOut: row.timed_out, sections: row.sections, createdAt: row.created_at,
});
const COLUMNS = "id, course_level, correct, total, percent, passed, timed_out, sections, created_at";

export async function insertMockResult(db: Queryable, userId: number, level: string, result: MockResult & { timedOut: boolean }): Promise<SavedMockResult> {
  const saved = await db.query(
    `INSERT INTO mock_exam_results (user_id, course_level, correct, total, percent, passed, timed_out, sections)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COLUMNS}`,
    [userId, level, result.correct, result.total, result.percent, result.passed, result.timedOut, JSON.stringify(result.sections)]);
  return toResult(saved.rows[0]);
}

/** Newest first; `level` limits it to one course level. */
export async function listMockResults(userId: number, limit: number, level?: string): Promise<SavedMockResult[]> {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM mock_exam_results WHERE user_id = $1 AND ($2::varchar IS NULL OR course_level = $2)
      ORDER BY created_at DESC, id DESC LIMIT $3`, [userId, level ?? null, limit]);
  return result.rows.map(toResult);
}

export async function countRecentMockResults(userId: number, seconds: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM mock_exam_results WHERE user_id = $1 AND created_at > NOW() - make_interval(secs => $2)", [userId, seconds]);
  return result.rows[0].count;
}

export async function getMockBest(userId: number, level: string): Promise<{ attempts: number; bestPercent: number | null; hasPassed: boolean }> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS attempts, MAX(percent)::int AS best_percent, COALESCE(BOOL_OR(passed), FALSE) AS has_passed
       FROM mock_exam_results WHERE user_id = $1 AND course_level = $2`, [userId, level]);
  const row = result.rows[0];
  return { attempts: row.attempts, bestPercent: row.best_percent, hasPassed: row.has_passed };
}
