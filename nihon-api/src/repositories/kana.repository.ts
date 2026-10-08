import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import type { KanaScript } from "../utils/kana-script";

export type KanaRow = { id: number; kana: string; romaji: string };

// Each script keeps its characters and per-user progress in its own tables.
const TABLES: Record<KanaScript, { characters: string; progress: string; characterId: string }> = {
  hiragana: { characters: "hiraganas", progress: "user_progress", characterId: "hiragana_id" },
  katakana: { characters: "katakanas", progress: "user_katakana_progress", characterId: "katakana_id" }
};

// ---- Characters

export async function findRandomKana(script: KanaScript): Promise<KanaRow | undefined> {
  const result = await pool.query(`SELECT * FROM ${TABLES[script].characters} ORDER BY RANDOM() LIMIT 1`);
  return result.rows[0];
}

export async function listKana(script: KanaScript): Promise<KanaRow[]> {
  const result = await pool.query(`SELECT id, kana, romaji FROM ${TABLES[script].characters} ORDER BY id ASC`);
  return result.rows;
}

export async function findKanaById(script: KanaScript, kanaId: unknown, db: Queryable): Promise<KanaRow | undefined> {
  const result = await db.query(`SELECT * FROM ${TABLES[script].characters} WHERE id = $1`, [kanaId]);
  return result.rows[0];
}

// ---- Per-user progress

/** Adds one answer to the user's tally for a character. */
export async function recordKanaAnswer(db: Queryable, script: KanaScript, userId: number, kanaId: unknown, correct: boolean) {
  const { progress, characterId } = TABLES[script];
  const counts = [correct ? 1 : 0, correct ? 0 : 1];
  const existing = await db.query(`SELECT * FROM ${progress} WHERE user_id = $1 AND ${characterId} = $2`, [userId, kanaId]);
  if (existing.rows.length === 0) {
    await db.query(`INSERT INTO ${progress} (user_id, ${characterId}, correct_count, wrong_count) VALUES ($1, $2, $3, $4)`, [userId, kanaId, ...counts]);
  } else {
    await db.query(`UPDATE ${progress} SET correct_count = correct_count + $1, wrong_count = wrong_count + $2 WHERE user_id = $3 AND ${characterId} = $4`, [...counts, userId, kanaId]);
  }
}

export async function countCorrectAnswers(script: KanaScript, userId: number, db: Queryable): Promise<number> {
  const result = await db.query(`SELECT COALESCE(SUM(correct_count), 0) AS total_correct FROM ${TABLES[script].progress} WHERE user_id = $1`, [userId]);
  return Number(result.rows[0].total_correct);
}

export async function getAnswerTotals(script: KanaScript, userId: number): Promise<{ correct: number; wrong: number }> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(correct_count), 0) AS total_correct, COALESCE(SUM(wrong_count), 0) AS total_wrong
     FROM ${TABLES[script].progress} WHERE user_id = $1`,
    [userId]
  );
  return { correct: Number(result.rows[0].total_correct), wrong: Number(result.rows[0].total_wrong) };
}

/** Every character of the script with the user's answer counts (zero when never answered). */
export async function listKanaWithProgress(script: KanaScript, userId: number): Promise<(KanaRow & { correctCount: number; wrongCount: number })[]> {
  const { characters, progress, characterId } = TABLES[script];
  const result = await pool.query(
    `SELECT c.id, c.kana, c.romaji,
       COALESCE(p.correct_count, 0) AS correct_count,
       COALESCE(p.wrong_count, 0) AS wrong_count
     FROM ${characters} c
     LEFT JOIN ${progress} p ON c.id = p.${characterId} AND p.user_id = $1
     ORDER BY c.id ASC`,
    [userId]
  );
  return result.rows.map(row => ({
    id: row.id, kana: row.kana, romaji: row.romaji,
    correctCount: Number(row.correct_count), wrongCount: Number(row.wrong_count)
  }));
}
