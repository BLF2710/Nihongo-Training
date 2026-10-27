import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type LessonEditRow = {
  lesson_id: string; draft: unknown; draft_updated_at: Date | null; draft_by: string | null;
  published: unknown; published_at: Date | null; published_by: string | null; revision: number;
};

const COLUMNS = `e.lesson_id, e.draft, e.draft_updated_at, d.username AS draft_by, e.published, e.published_at, p.username AS published_by, e.revision
  FROM lesson_edits e LEFT JOIN users d ON d.id = e.draft_updated_by LEFT JOIN users p ON p.id = e.published_by`;

export async function listLessonEdits(): Promise<LessonEditRow[]> {
  const result = await pool.query(`SELECT ${COLUMNS} WHERE e.draft IS NOT NULL OR e.published IS NOT NULL ORDER BY GREATEST(e.draft_updated_at, e.published_at) DESC NULLS LAST`);
  return result.rows;
}

export async function findLessonEdit(db: Queryable, lessonId: string, lock = false): Promise<LessonEditRow | undefined> {
  const result = await db.query(`SELECT ${COLUMNS} WHERE e.lesson_id = $1${lock ? " FOR UPDATE OF e" : ""}`, [lessonId]);
  return result.rows[0];
}

export async function saveDraft(lessonId: string, draft: unknown, adminId: number) {
  await pool.query(
    `INSERT INTO lesson_edits (lesson_id, draft, draft_updated_at, draft_updated_by) VALUES ($1, $2, NOW(), $3)
     ON CONFLICT (lesson_id) DO UPDATE SET draft = $2, draft_updated_at = NOW(), draft_updated_by = $3`, [lessonId, JSON.stringify(draft), adminId]);
}

export async function clearDraft(db: Queryable, lessonId: string) {
  await db.query("UPDATE lesson_edits SET draft = NULL, draft_updated_at = NULL, draft_updated_by = NULL WHERE lesson_id = $1", [lessonId]);
}

/** Makes the content the published version (and clears the draft it came from). */
export async function publish(db: Queryable, lessonId: string, content: unknown, adminId: number) {
  await db.query(
    `UPDATE lesson_edits SET published = $2, published_at = NOW(), published_by = $3, revision = revision + 1,
            draft = NULL, draft_updated_at = NULL, draft_updated_by = NULL WHERE lesson_id = $1`, [lessonId, JSON.stringify(content), adminId]);
}

export async function unpublish(db: Queryable, lessonId: string) {
  await db.query("UPDATE lesson_edits SET published = NULL, published_at = NULL, published_by = NULL, revision = revision + 1 WHERE lesson_id = $1", [lessonId]);
}

/** Every published edit, and a number that changes whenever any of them does. */
export async function listPublishedEdits(): Promise<{ revision: number; lessons: { lesson_id: string; published: unknown }[] }> {
  const result = await pool.query("SELECT lesson_id, published, revision FROM lesson_edits");
  const rows = result.rows as { lesson_id: string; published: unknown; revision: number }[];
  return { revision: rows.reduce((sum, row) => sum + row.revision, 0), lessons: rows.filter(row => row.published !== null) };
}
