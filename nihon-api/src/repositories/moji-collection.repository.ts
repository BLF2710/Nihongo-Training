import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type CollectionOrigin = "starter" | "caught";
export type CollectedKana = { kanaId: number; origin: CollectionOrigin; caughtAt: Date };

/** The learner's collected hiragana, oldest first. */
export async function listCollection(userId: number, db: Queryable = pool): Promise<CollectedKana[]> {
  const result = await db.query(
    "SELECT kana_id, origin, caught_at FROM moji_collection WHERE user_id = $1 ORDER BY caught_at, kana_id",
    [userId],
  );
  return result.rows.map(row => ({ kanaId: row.kana_id, origin: row.origin, caughtAt: row.caught_at }));
}

/** Serialises starter choices for one learner, so two requests at once can't both start a collection. */
export async function lockCollection(db: Queryable, userId: number) {
  await db.query("SELECT pg_advisory_xact_lock(hashtext('moji_collection'), $1)", [userId]);
}

export async function addStarterKana(db: Queryable, userId: number, kanaIds: readonly number[]) {
  await db.query(
    "INSERT INTO moji_collection (user_id, kana_id, origin) SELECT $1, kana_id, 'starter' FROM UNNEST($2::int[]) AS kana_id",
    [userId, kanaIds],
  );
}

/** Adds a caught kana; true when it is new to the collection. */
export async function addCaughtKana(userId: number, kanaId: number): Promise<boolean> {
  const result = await pool.query(
    "INSERT INTO moji_collection (user_id, kana_id, origin) VALUES ($1, $2, 'caught') ON CONFLICT DO NOTHING",
    [userId, kanaId],
  );
  return result.rowCount === 1;
}
