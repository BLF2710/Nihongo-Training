import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type KanjiProgressRow = { kanji_id: string; correct_count: number; wrong_count: number; last_practiced_at: Date | null };
export type PracticeQuestionRow = {
  kanji_id: string; options: string[]; correct_index: number; answer_index: number | null;
};

export async function listKanjiProgress(userId: number): Promise<KanjiProgressRow[]> {
  const result = await pool.query("SELECT kanji_id, correct_count, wrong_count, last_practiced_at FROM user_kanji_progress WHERE user_id=$1", [userId]);
  return result.rows;
}

export async function findKanjiProgress(userId: number, kanjiId: string, db: Queryable): Promise<KanjiProgressRow> {
  const result = await db.query("SELECT * FROM user_kanji_progress WHERE user_id=$1 AND kanji_id=$2", [userId, kanjiId]);
  return result.rows[0];
}

export async function recordKanjiAnswer(db: Queryable, userId: number, kanjiId: string, correct: boolean) {
  await db.query(
    `INSERT INTO user_kanji_progress (user_id,kanji_id,correct_count,wrong_count)
        VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,kanji_id) DO UPDATE SET
        correct_count=user_kanji_progress.correct_count+EXCLUDED.correct_count,
        wrong_count=user_kanji_progress.wrong_count+EXCLUDED.wrong_count,
        last_practiced_at=NOW(), updated_at=NOW()`,
    [userId, kanjiId, correct ? 1 : 0, correct ? 0 : 1]
  );
}

/** Keeps a user-owned question token so browser-saved sessions can resume later. */
export async function insertPracticeQuestion(
  db: Queryable,
  question: { id: string; userId: number; kanjiId: string; kind: string; options: string[]; correctIndex: number }
) {
  await db.query(
    `INSERT INTO kanji_practice_questions (id,user_id,kanji_id,kind,options,correct_index,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,NOW() + INTERVAL '1 hour')`,
    [question.id, question.userId, question.kanjiId, question.kind, JSON.stringify(question.options), question.correctIndex]
  );
}

export async function lockPracticeQuestion(questionId: string, userId: number, db: Queryable): Promise<PracticeQuestionRow | undefined> {
  const result = await db.query("SELECT *, expires_at < NOW() AS expired FROM kanji_practice_questions WHERE id=$1 AND user_id=$2 FOR UPDATE", [questionId, userId]);
  return result.rows[0];
}

export async function savePracticeAnswer(db: Queryable, questionId: string, answerIndex: number) {
  await db.query("UPDATE kanji_practice_questions SET answer_index=$1, answered_at=NOW() WHERE id=$2", [answerIndex, questionId]);
}
