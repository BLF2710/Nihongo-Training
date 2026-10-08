import { pool } from "../config/db";

export type AssessmentProgressRow = { assessment_id: string; best_score: string; passed_at: Date | null };

export async function listAssessmentProgress(userId: number): Promise<AssessmentProgressRow[]> {
  const result = await pool.query("SELECT assessment_id, best_score, passed_at FROM user_assessment_progress WHERE user_id=$1", [userId]);
  return result.rows;
}

/** Atomic upsert keeps the first pass and best score across retakes/retries. */
export async function saveAssessmentAttempt(userId: number, assessmentId: string, accuracy: number, passed: boolean): Promise<{ passed: boolean; bestScore: number }> {
  const result = await pool.query(
    `INSERT INTO user_assessment_progress (user_id, assessment_id, best_score, last_score, passed_at)
      VALUES ($1,$2,$3,$3,CASE WHEN $4 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, assessment_id) DO UPDATE SET
        best_score=GREATEST(user_assessment_progress.best_score, EXCLUDED.best_score),
        last_score=EXCLUDED.last_score,
        passed_at=COALESCE(user_assessment_progress.passed_at, EXCLUDED.passed_at), updated_at=NOW()
      RETURNING passed_at, best_score`,
    [userId, assessmentId, accuracy, passed]
  );
  return { passed: result.rows[0].passed_at !== null, bestScore: Number(result.rows[0].best_score) };
}
