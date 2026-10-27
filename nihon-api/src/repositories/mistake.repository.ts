import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type MistakeSource = "lesson" | "review" | "assessment" | "mock_exam";
/** What the notebook shows: the question as the learner saw it, the right answer and what they chose. */
export type MistakePayload = { label: string; prompt: string; options?: string[]; answer: string; given?: string; explanation?: string };
/** One graded answer: a wrong one is noted (or noted again); a right one counts toward clearing an open mistake. */
export type AnswerOutcome = { source: MistakeSource; itemKey: string; correct: boolean; payload: MistakePayload };
export type Mistake = {
  id: number; source: MistakeSource; itemKey: string; payload: MistakePayload; wrongCount: number; correctStreak: number;
  firstWrongAt: Date; lastWrongAt: Date; resolvedAt: Date | null;
};

/** Correct answers in a row that clear a mistake from the notebook. */
export const CORRECT_IN_A_ROW_TO_RESOLVE = 2;
export const MAX_MISTAKES_LISTED = 200;

type MistakeRow = { id: string; source: MistakeSource; item_key: string; payload: MistakePayload; wrong_count: number; correct_streak: number; first_wrong_at: Date; last_wrong_at: Date; resolved_at: Date | null };
const toMistake = (row: MistakeRow): Mistake => ({
  id: Number(row.id), source: row.source, itemKey: row.item_key, payload: row.payload, wrongCount: row.wrong_count,
  correctStreak: row.correct_streak, firstWrongAt: row.first_wrong_at, lastWrongAt: row.last_wrong_at, resolvedAt: row.resolved_at,
});
const COLUMNS = "id, source, item_key, payload, wrong_count, correct_streak, first_wrong_at, last_wrong_at, resolved_at";

async function noteWrongAnswer(db: Queryable, userId: number, outcome: AnswerOutcome) {
  await db.query(
    `INSERT INTO mistakes (user_id, source, item_key, payload) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, item_key) DO UPDATE SET source = EXCLUDED.source, payload = EXCLUDED.payload,
       wrong_count = mistakes.wrong_count + 1, correct_streak = 0, last_wrong_at = NOW(), resolved_at = NULL`,
    [userId, outcome.source, outcome.itemKey, JSON.stringify(outcome.payload)]);
}

async function noteRightAnswer(db: Queryable, userId: number, itemKey: string) {
  await db.query(
    `UPDATE mistakes SET correct_streak = correct_streak + 1,
            resolved_at = CASE WHEN correct_streak + 1 >= $3 THEN NOW() ELSE NULL END
      WHERE user_id = $1 AND item_key = $2 AND resolved_at IS NULL`, [userId, itemKey, CORRECT_IN_A_ROW_TO_RESOLVE]);
}

export async function recordAnswerOutcomes(db: Queryable, userId: number, outcomes: AnswerOutcome[]) {
  for (const outcome of outcomes) {
    if (outcome.correct) await noteRightAnswer(db, userId, outcome.itemKey);
    else await noteWrongAnswer(db, userId, outcome);
  }
}

/** A practice answer in the notebook: right ones count toward clearing it, a wrong one starts the count again. */
export async function recordPracticeAnswer(userId: number, id: number, correct: boolean): Promise<Mistake | undefined> {
  const result = correct
    ? await pool.query(
      `UPDATE mistakes SET correct_streak = correct_streak + 1, resolved_at = CASE WHEN correct_streak + 1 >= $3 THEN NOW() ELSE NULL END
        WHERE user_id = $1 AND id = $2 AND resolved_at IS NULL RETURNING ${COLUMNS}`, [userId, id, CORRECT_IN_A_ROW_TO_RESOLVE])
    : await pool.query(
      `UPDATE mistakes SET wrong_count = wrong_count + 1, correct_streak = 0, last_wrong_at = NOW()
        WHERE user_id = $1 AND id = $2 AND resolved_at IS NULL RETURNING ${COLUMNS}`, [userId, id]);
  return result.rows[0] && toMistake(result.rows[0]);
}

export async function listMistakes(userId: number, resolved: boolean): Promise<Mistake[]> {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM mistakes WHERE user_id = $1 AND (resolved_at IS NOT NULL) = $2
      ORDER BY ${resolved ? "resolved_at" : "last_wrong_at"} DESC LIMIT $3`, [userId, resolved, MAX_MISTAKES_LISTED]);
  return result.rows.map(toMistake);
}

export async function findMistake(userId: number, id: number): Promise<Mistake | undefined> {
  const result = await pool.query(`SELECT ${COLUMNS} FROM mistakes WHERE user_id = $1 AND id = $2`, [userId, id]);
  return result.rows[0] && toMistake(result.rows[0]);
}

export async function deleteMistake(userId: number, id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM mistakes WHERE user_id = $1 AND id = $2", [userId, id]);
  return Boolean(result.rowCount);
}

export type MistakeCounts = { open: number; resolved: number; bySource: Record<MistakeSource, number> };

export async function countMistakes(userId: number): Promise<MistakeCounts> {
  const result = await pool.query(
    `SELECT source, COUNT(*) FILTER (WHERE resolved_at IS NULL)::int AS open, COUNT(*) FILTER (WHERE resolved_at IS NOT NULL)::int AS resolved
       FROM mistakes WHERE user_id = $1 GROUP BY source`, [userId]);
  const bySource: Record<MistakeSource, number> = { lesson: 0, review: 0, assessment: 0, mock_exam: 0 };
  let open = 0, resolved = 0;
  const rows: { source: MistakeSource; open: number; resolved: number }[] = result.rows;
  for (const row of rows) {
    bySource[row.source] = row.open;
    open += row.open;
    resolved += row.resolved;
  }
  return { open, resolved, bySource };
}
