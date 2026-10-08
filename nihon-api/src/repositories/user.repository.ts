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

export async function findUserRoleAndStatus(userId: number): Promise<{ role: string; status: string } | undefined> {
  const result = await pool.query("SELECT role, status FROM users WHERE id=$1", [userId]);
  return result.rows[0];
}

export async function findActiveAccount(userId: number) {
  const result = await pool.query("SELECT id, username, role FROM users WHERE id=$1 AND status='active'", [userId]);
  return result.rows[0];
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
  const userId = result.rows[0].id;
  await db.query("INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)", [userId, account.displayName]);
  await db.query("INSERT INTO user_gamification (user_id) VALUES ($1)", [userId]);
}

export async function recordLogin(userId: number) {
  await pool.query("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", [userId]);
}

export async function updatePassword(userId: number, passwordHash: string) {
  await pool.query("UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2", [passwordHash, userId]);
}

export async function deactivateUser(userId: number) {
  await pool.query("UPDATE users SET status='inactive', updated_at=NOW() WHERE id=$1", [userId]);
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
    `SELECT id,username,email,role,status,created_at,last_login_at FROM users WHERE ${SEARCH_FILTER} ORDER BY id LIMIT $2 OFFSET $3`,
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

export async function updateAccount(db: Queryable, edit: AccountEdit) {
  const result = await db.query(
    "UPDATE users SET username=$1,email=$2,role=$3,status=$4,updated_at=NOW() WHERE id=$5 RETURNING id,username,email,role,status",
    [edit.username, edit.email, edit.role, edit.status, edit.id]
  );
  return result.rows[0];
}
