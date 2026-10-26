import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type IdentityProvider = "google";
export type LinkedAccount = { userId: number; role: string; status: string; tokenVersion: number; username: string; email: string };

const ACCOUNT_COLUMNS = "u.id AS user_id, u.role, u.status, u.token_version, u.username, u.email";
const toAccount = (row: Record<string, unknown>): LinkedAccount => ({
  userId: Number(row.user_id), role: String(row.role), status: String(row.status), tokenVersion: Number(row.token_version), username: String(row.username), email: String(row.email),
});

/** The account linked to a provider's account id. */
export async function findAccountByIdentity(provider: IdentityProvider, subject: string): Promise<LinkedAccount | undefined> {
  const result = await pool.query(`SELECT ${ACCOUNT_COLUMNS} FROM user_identities i JOIN users u ON u.id = i.user_id WHERE i.provider = $1 AND i.provider_subject = $2`, [provider, subject]);
  return result.rows[0] ? toAccount(result.rows[0]) : undefined;
}

/** An account by email address, with whether that address has been confirmed. */
export async function findAccountByEmail(email: string): Promise<(LinkedAccount & { emailVerified: boolean }) | undefined> {
  const result = await pool.query(`SELECT ${ACCOUNT_COLUMNS}, u.email_verified_at FROM users u WHERE LOWER(u.email) = LOWER($1)`, [email]);
  return result.rows[0] ? { ...toAccount(result.rows[0]), emailVerified: result.rows[0].email_verified_at !== null } : undefined;
}

export async function findIdentityOfUser(userId: number, provider: IdentityProvider): Promise<{ subject: string; email: string } | undefined> {
  const result = await pool.query("SELECT provider_subject, email FROM user_identities WHERE user_id = $1 AND provider = $2", [userId, provider]);
  return result.rows[0] ? { subject: result.rows[0].provider_subject, email: result.rows[0].email } : undefined;
}

export async function linkIdentity(db: Queryable, link: { userId: number; provider: IdentityProvider; subject: string; email: string }) {
  await db.query("INSERT INTO user_identities (user_id, provider, provider_subject, email) VALUES ($1, $2, $3, $4)", [link.userId, link.provider, link.subject, link.email]);
}

export async function touchIdentity(provider: IdentityProvider, subject: string, email: string) {
  await pool.query("UPDATE user_identities SET last_used_at = NOW(), email = $3 WHERE provider = $1 AND provider_subject = $2", [provider, subject, email]);
}

export async function unlinkIdentity(userId: number, provider: IdentityProvider): Promise<boolean> {
  const result = await pool.query("DELETE FROM user_identities WHERE user_id = $1 AND provider = $2", [userId, provider]);
  return (result.rowCount ?? 0) > 0;
}

export async function usernameTaken(username: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  return Boolean(result.rowCount);
}

/** A new account created through a provider: no password, address already confirmed by the provider. */
export async function createProviderAccount(db: Queryable, account: { username: string; email: string; displayName: string }): Promise<number> {
  const result = await db.query("INSERT INTO users (username, email, password, email_verified_at) VALUES ($1, $2, NULL, NOW()) RETURNING id", [account.username, account.email]);
  const userId: number = result.rows[0].id;
  await db.query("INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)", [userId, account.displayName]);
  await db.query("INSERT INTO user_gamification (user_id) VALUES ($1)", [userId]);
  return userId;
}
