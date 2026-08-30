import { pool } from "../config/db";
import { getLevelFromXP, getRankFromXP } from "./progression.service";

export type XPSource = "lesson_completion" | "lesson_challenge" | "quiz" | "game" | "achievement" | "streak";
export async function awardXP(userId: number, amount: number, source: XPSource, referenceId: string) {
  if (!Number.isInteger(amount) || amount <= 0 || !referenceId) throw new Error("Invalid XP award");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query("SELECT xp FROM user_gamification WHERE user_id=$1 FOR UPDATE", [userId]);
    if (!before.rows[0]) throw new Error("Gamification profile not found");
    const event = await client.query("INSERT INTO xp_events (user_id, amount, source, reference_id) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,source,reference_id) DO NOTHING RETURNING id", [userId, amount, source, referenceId]);
    const oldXp = Number(before.rows[0].xp);
    if (!event.rowCount) { await client.query("COMMIT"); return { awarded: false, oldXp, xp: oldXp, oldLevel: getLevelFromXP(oldXp), level: getLevelFromXP(oldXp), oldRank: getRankFromXP(oldXp), rank: getRankFromXP(oldXp) }; }
    const updated = await client.query("UPDATE user_gamification SET xp=xp+$1, updated_at=NOW() WHERE user_id=$2 RETURNING xp", [amount, userId]);
    const xp = Number(updated.rows[0].xp);
    await client.query("COMMIT");
    return { awarded: true, oldXp, xp, oldLevel: getLevelFromXP(oldXp), level: getLevelFromXP(xp), oldRank: getRankFromXP(oldXp), rank: getRankFromXP(xp) };
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
