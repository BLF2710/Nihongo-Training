import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type PracticeKind = "listening" | "speaking" | "reading" | "mock-exam";

export async function insertPracticeSession(db: Queryable, session: { userId: number; kind: PracticeKind; scope: string; answered: number; correct: number }) {
  await db.query("INSERT INTO practice_sessions (user_id, kind, scope, answered, correct) VALUES ($1, $2, $3, $4, $5)",
    [session.userId, session.kind, session.scope, session.answered, session.correct]);
}

export async function countRecentPracticeSessions(userId: number, seconds: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM practice_sessions WHERE user_id = $1 AND created_at > NOW() - make_interval(secs => $2)", [userId, seconds]);
  return result.rows[0].count;
}
