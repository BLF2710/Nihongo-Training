import { pool } from "../config/db";

/** The learner's flashcard kanji, in the order they were added. */
export async function listFlashcardKanji(userId: number): Promise<string[]> {
  const result = await pool.query("SELECT kanji_id FROM kanji_flashcards WHERE user_id = $1 ORDER BY added_at, kanji_id", [userId]);
  return result.rows.map(row => row.kanji_id);
}

export async function countFlashcardKanji(userId: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM kanji_flashcards WHERE user_id = $1", [userId]);
  return result.rows[0].count;
}

/** Adds a kanji; adding one that is already there changes nothing. */
export async function addFlashcardKanji(userId: number, kanjiId: string) {
  await pool.query("INSERT INTO kanji_flashcards (user_id, kanji_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, kanjiId]);
}

export async function removeFlashcardKanji(userId: number, kanjiId: string) {
  await pool.query("DELETE FROM kanji_flashcards WHERE user_id = $1 AND kanji_id = $2", [userId, kanjiId]);
}
