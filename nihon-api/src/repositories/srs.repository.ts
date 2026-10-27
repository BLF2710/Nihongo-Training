import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import type { CardState, ScheduledCard, SrsGrade } from "../learning/srsScheduler";

export type SrsItemType = "vocabulary" | "kanji";
export type SrsCard = CardState & { itemType: SrsItemType; itemId: string; dueAt: Date; isNew: boolean };

// A learner's "day" is the calendar date in their own time zone, as for the streak.
const zone = "COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = $1), 'UTC')";
const startOfToday = `((NOW() AT TIME ZONE ${zone})::date::timestamp AT TIME ZONE ${zone})`;

type CardRow = { item_type: SrsItemType; item_id: string; ease: string; interval_days: string; repetitions: number; lapses: number; due_at: Date; last_reviewed_at: Date | null };
const toCard = (row: CardRow): SrsCard => ({
  itemType: row.item_type, itemId: row.item_id, ease: Number(row.ease), intervalDays: Number(row.interval_days),
  repetitions: row.repetitions, lapses: row.lapses, dueAt: row.due_at, isNew: row.last_reviewed_at === null,
});
const CARD_COLUMNS = "item_type, item_id, ease, interval_days, repetitions, lapses, due_at, last_reviewed_at";

/** Adds cards the learner doesn't have yet; returns how many were added. */
export async function insertCards(userId: number, items: { itemType: SrsItemType; itemId: string }[]): Promise<number> {
  if (!items.length) return 0;
  const result = await pool.query(
    `INSERT INTO srs_cards (user_id, item_type, item_id)
     SELECT $1, item.type, item.id FROM UNNEST($2::varchar[], $3::varchar[]) AS item(type, id)
     ON CONFLICT DO NOTHING`,
    [userId, items.map(item => item.itemType), items.map(item => item.itemId)]);
  return result.rowCount ?? 0;
}

export async function countNewReviewedToday(userId: number): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM srs_reviews WHERE user_id = $1 AND was_new AND reviewed_at >= ${startOfToday}`, [userId]);
  return result.rows[0].count;
}

/** Cards already studied that are due now, earliest first. */
export async function listDueCards(userId: number, limit: number): Promise<SrsCard[]> {
  const result = await pool.query(
    `SELECT ${CARD_COLUMNS} FROM srs_cards WHERE user_id = $1 AND last_reviewed_at IS NOT NULL AND due_at <= NOW()
      ORDER BY due_at LIMIT $2`, [userId, limit]);
  return result.rows.map(toCard);
}

/** Cards never studied, in the order they were added (lesson order). */
export async function listNewCards(userId: number, limit: number): Promise<SrsCard[]> {
  if (limit <= 0) return [];
  const result = await pool.query(
    `SELECT ${CARD_COLUMNS} FROM srs_cards WHERE user_id = $1 AND last_reviewed_at IS NULL ORDER BY created_at, item_id LIMIT $2`, [userId, limit]);
  return result.rows.map(toCard);
}

export async function findCardForUpdate(db: Queryable, userId: number, itemType: SrsItemType, itemId: string): Promise<SrsCard | undefined> {
  const result = await db.query(`SELECT ${CARD_COLUMNS} FROM srs_cards WHERE user_id = $1 AND item_type = $2 AND item_id = $3 FOR UPDATE`, [userId, itemType, itemId]);
  return result.rows[0] && toCard(result.rows[0]);
}

export async function saveReview(db: Queryable, review: { userId: number; card: SrsCard; grade: SrsGrade; next: ScheduledCard }) {
  const { userId, card, grade, next } = review;
  await db.query(
    `UPDATE srs_cards SET ease = $4, interval_days = $5, repetitions = $6, lapses = $7, due_at = $8, last_reviewed_at = NOW()
      WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
    [userId, card.itemType, card.itemId, next.ease, next.intervalDays, next.repetitions, next.lapses, next.dueAt]);
  await db.query("INSERT INTO srs_reviews (user_id, item_type, item_id, grade, was_new) VALUES ($1, $2, $3, $4, $5)",
    [userId, card.itemType, card.itemId, grade, card.isNew]);
}

export type SrsCounts = { total: number; newCards: number; dueNow: number; dueToday: number; learned: number; mature: number; reviewedToday: number };

/** Card counts for the dashboard and statistics. "Mature" cards have an interval of three weeks or more. */
export async function getCardCounts(userId: number): Promise<SrsCounts> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE last_reviewed_at IS NULL)::int AS new_cards,
            COUNT(*) FILTER (WHERE last_reviewed_at IS NOT NULL AND due_at <= NOW())::int AS due_now,
            COUNT(*) FILTER (WHERE last_reviewed_at IS NOT NULL AND due_at < ${startOfToday} + INTERVAL '1 day')::int AS due_today,
            COUNT(*) FILTER (WHERE repetitions > 0)::int AS learned,
            COUNT(*) FILTER (WHERE interval_days >= 21)::int AS mature,
            (SELECT COUNT(*)::int FROM srs_reviews WHERE user_id = $1 AND reviewed_at >= ${startOfToday}) AS reviewed_today
       FROM srs_cards WHERE user_id = $1`, [userId]);
  const row = result.rows[0];
  return { total: row.total, newCards: row.new_cards, dueNow: row.due_now, dueToday: row.due_today, learned: row.learned, mature: row.mature, reviewedToday: row.reviewed_today };
}

/** Reviews per day for the last `days` days (learner's days), oldest first, with how many were remembered. */
export async function listDailyReviews(userId: number, days: number): Promise<{ day: string; reviews: number; remembered: number }[]> {
  const result = await pool.query(
    `SELECT to_char((reviewed_at AT TIME ZONE ${zone})::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS reviews,
            COUNT(*) FILTER (WHERE grade <> 'again')::int AS remembered
       FROM srs_reviews WHERE user_id = $1 AND reviewed_at >= ${startOfToday} - make_interval(days => $2 - 1)
      GROUP BY 1 ORDER BY 1`, [userId, days]);
  return result.rows;
}
