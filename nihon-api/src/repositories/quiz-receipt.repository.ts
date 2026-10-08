import type { Queryable } from "../db/transaction";

export type QuizReceipt = { character_type: string; kana_id: number; answer: string; response: unknown };

/** Serializes one user's Kana submissions for the surrounding transaction. */
export async function lockKanaSubmissions(userId: number, db: Queryable) {
  await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`kana:${userId}`]);
}

export async function findReceipt(userId: number, submissionId: string, db: Queryable): Promise<QuizReceipt | undefined> {
  const result = await db.query("SELECT * FROM quiz_answer_receipts WHERE user_id=$1 AND submission_id=$2", [userId, submissionId]);
  return result.rows[0];
}

export async function insertReceipt(
  db: Queryable,
  receipt: { userId: number; submissionId: string; script: string; kanaId: unknown; answer: string; response: unknown }
) {
  await db.query(
    "INSERT INTO quiz_answer_receipts (user_id,submission_id,character_type,kana_id,answer,response) VALUES ($1,$2,$3,$4,$5,$6)",
    [receipt.userId, receipt.submissionId, receipt.script, receipt.kanaId, receipt.answer, JSON.stringify(receipt.response)]
  );
}
