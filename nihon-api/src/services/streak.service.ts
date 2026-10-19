import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import { isKnownTimeZone, recordActivity, setTimeZone } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";

/**
 * Marks today as a learning day. Called by every graded learning action (lessons, practice answers,
 * assessments, reviews, games), never by page views, so idle time and clicking around do not count.
 * Pass the surrounding transaction's client when there is one.
 */
export async function recordLearningActivity(userId: number, db: Queryable = pool) {
  return recordActivity(db, userId);
}

/** Saves the learner's IANA time zone (for example "Asia/Ho_Chi_Minh"), which decides when their day starts. */
export async function saveTimeZone(userId: number, zone: unknown) {
  if (typeof zone !== "string" || zone.length > 64 || !/^[A-Za-z0-9_+\-/]+$/.test(zone) || !(await isKnownTimeZone(zone))) {
    throw new HttpError(400, "Unknown time zone.");
  }
  await setTimeZone(userId, zone);
  return { timeZone: zone };
}
