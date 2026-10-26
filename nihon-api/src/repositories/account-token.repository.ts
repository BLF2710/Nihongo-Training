import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type AccountTokenPurpose = "password_reset" | "email_verification";
export type AccountTokenRow = { id: number; user_id: number; purpose: AccountTokenPurpose; email: string; expires_at: Date; used_at: Date | null };

/** Stores a new link (by hash) and retires the account's earlier unused links for the same purpose. */
export async function replaceAccountToken(db: Queryable, token: { userId: number; purpose: AccountTokenPurpose; tokenHash: string; email: string; lifetimeSeconds: number }) {
  await db.query("UPDATE account_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL", [token.userId, token.purpose]);
  await db.query(
    "INSERT INTO account_tokens (user_id, purpose, token_hash, email, expires_at) VALUES ($1, $2, $3, $4, NOW() + make_interval(secs => $5))",
    [token.userId, token.purpose, token.tokenHash, token.email, token.lifetimeSeconds]);
}

/** Locks and returns an unused, unexpired link with this hash and purpose. */
export async function takeValidAccountToken(db: Queryable, tokenHash: string, purpose: AccountTokenPurpose): Promise<AccountTokenRow | undefined> {
  const result = await db.query(
    `SELECT id, user_id, purpose, email, expires_at, used_at FROM account_tokens
      WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE`, [tokenHash, purpose]);
  return result.rows[0] ? { ...result.rows[0], id: Number(result.rows[0].id) } : undefined;
}

export async function markAccountTokenUsed(db: Queryable, id: number) {
  await db.query("UPDATE account_tokens SET used_at = NOW() WHERE id = $1", [id]);
}

/** How many links of a purpose were created for an account recently (a per-account limit on emails sent). */
export async function countRecentAccountTokens(userId: number, purpose: AccountTokenPurpose, seconds: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM account_tokens WHERE user_id = $1 AND purpose = $2 AND created_at > NOW() - make_interval(secs => $3)", [userId, purpose, seconds]);
  return result.rows[0].count;
}
