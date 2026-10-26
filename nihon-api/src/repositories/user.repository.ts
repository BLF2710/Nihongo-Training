import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type AccountEdit = { id: number; username: string; email: string; role: string; status: string };

// ---- Lookup

export async function findUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return result.rows[0];
}

export async function findUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  return result.rows[0];
}

export async function findUserByLogin(login: string) {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)",
    [login]
  );
  return result.rows[0];
}

export async function findUserStatus(userId: number): Promise<string | undefined> {
  const result = await pool.query("SELECT status FROM users WHERE id=$1", [userId]);
  return result.rows[0]?.status;
}

/** What decides whether a sign-in token is still valid: the account status and its current token version. */
export async function findSessionState(userId: number): Promise<{ status: string; tokenVersion: number } | undefined> {
  const result = await pool.query("SELECT status, token_version FROM users WHERE id=$1", [userId]);
  return result.rows[0] ? { status: result.rows[0].status, tokenVersion: Number(result.rows[0].token_version) } : undefined;
}

/** The account's address and whether it has been verified. */
export async function findAccountEmail(userId: number): Promise<{ email: string; username: string; status: string; emailVerifiedAt: Date | null } | undefined> {
  const result = await pool.query("SELECT email, username, status, email_verified_at FROM users WHERE id=$1", [userId]);
  const row = result.rows[0];
  return row ? { email: row.email, username: row.username, status: row.status, emailVerifiedAt: row.email_verified_at } : undefined;
}

export async function findUserRoleAndStatus(userId: number): Promise<{ role: string; status: string } | undefined> {
  const result = await pool.query("SELECT role, status FROM users WHERE id=$1", [userId]);
  return result.rows[0];
}

export async function findActiveAccount(userId: number) {
  const result = await pool.query("SELECT id, username, role FROM users WHERE id=$1 AND status='active'", [userId]);
  return result.rows[0];
}

export async function hasAllLessonsUnlocked(userId: number): Promise<boolean> {
  const result = await pool.query("SELECT all_lessons_unlocked FROM users WHERE id=$1", [userId]);
  return result.rows[0]?.all_lessons_unlocked === true;
}

export async function findPasswordHash(userId: number): Promise<string | undefined> {
  const result = await pool.query("SELECT password FROM users WHERE id=$1", [userId]);
  return result.rows[0]?.password;
}

// ---- Account lifecycle

/** Creates the user together with its profile and gamification rows. */
export async function createAccount(
  db: Queryable,
  account: { username: string; email: string; passwordHash: string; displayName: string }
) {
  const result = await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", [account.username, account.email, account.passwordHash]);
  const userId: number = result.rows[0].id;
  await db.query("INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)", [userId, account.displayName]);
  await db.query("INSERT INTO user_gamification (user_id) VALUES ($1)", [userId]);
  return userId;
}

export async function recordLogin(userId: number) {
  await pool.query("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", [userId]);
}

/** Sets a new password and ends every existing session (their tokens carry the old version). Returns the new version. */
export async function updatePasswordAndRevokeSessions(db: Queryable, userId: number, passwordHash: string): Promise<number> {
  const result = await db.query("UPDATE users SET password=$1, token_version = token_version + 1, updated_at=NOW() WHERE id=$2 RETURNING token_version", [passwordHash, userId]);
  return Number(result.rows[0].token_version);
}

/** Ends every existing session of the account. Returns the new version. */
export async function revokeSessions(db: Queryable, userId: number): Promise<number> {
  const result = await db.query("UPDATE users SET token_version = token_version + 1, updated_at=NOW() WHERE id=$1 RETURNING token_version", [userId]);
  return Number(result.rows[0].token_version);
}

/** Marks the address as verified, only if it is still the account's address. */
export async function markEmailVerified(db: Queryable, userId: number, email: string): Promise<boolean> {
  const result = await db.query("UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at=NOW() WHERE id=$1 AND LOWER(email)=LOWER($2)", [userId, email]);
  return (result.rowCount ?? 0) > 0;
}

export async function deactivateUser(userId: number) {
  await pool.query("UPDATE users SET status='inactive', token_version = token_version + 1, updated_at=NOW() WHERE id=$1", [userId]);
}

// ---- Administration

const SEARCH_FILTER = "($1='' OR username ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')";

export async function countUsersByState() {
  const result = await pool.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='active')::int AS active, COUNT(*) FILTER (WHERE role='admin' AND status='active')::int AS admins FROM users");
  return result.rows[0];
}

export async function countUsersMatching(search: string): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*)::int AS total FROM users WHERE ${SEARCH_FILTER}`, [search]);
  return result.rows[0].total;
}

export async function searchUsers(search: string, limit: number, offset: number) {
  const result = await pool.query(
    `SELECT id,username,email,role,status,all_lessons_unlocked,created_at,last_login_at FROM users WHERE ${SEARCH_FILTER} ORDER BY id LIMIT $2 OFFSET $3`,
    [search, limit, offset]
  );
  return result.rows;
}

/** Serializes administrator changes so two concurrent edits cannot remove the last admin. */
export async function lockAdministratorChanges(db: Queryable) {
  await db.query("SELECT pg_advisory_xact_lock(731907)");
}

export async function isActiveAdmin(userId: number, db: Queryable): Promise<boolean> {
  const result = await db.query("SELECT 1 FROM users WHERE id=$1 AND role='admin' AND status='active'", [userId]);
  return Boolean(result.rowCount);
}

export async function lockUserRoleAndStatus(userId: number, db: Queryable): Promise<{ role: string; status: string } | undefined> {
  const result = await db.query("SELECT role,status FROM users WHERE id=$1 FOR UPDATE", [userId]);
  return result.rows[0];
}

export async function countActiveAdmins(db: Queryable): Promise<number> {
  const result = await db.query("SELECT COUNT(*)::int AS count FROM users WHERE role='admin' AND status='active'");
  return result.rows[0].count;
}

/** Null when the account does not exist. */
export async function setAllLessonsUnlocked(userId: number, unlocked: boolean): Promise<{ id: number; all_lessons_unlocked: boolean } | null> {
  const result = await pool.query("UPDATE users SET all_lessons_unlocked=$1, updated_at=NOW() WHERE id=$2 RETURNING id, all_lessons_unlocked", [unlocked, userId]);
  return result.rows[0] ?? null;
}

export async function updateAccount(db: Queryable, edit: AccountEdit) {
  const result = await db.query(
    "UPDATE users SET username=$1,email=$2,role=$3,status=$4,updated_at=NOW() WHERE id=$5 RETURNING id,username,email,role,status",
    [edit.username, edit.email, edit.role, edit.status, edit.id]
  );
  return result.rows[0];
}
