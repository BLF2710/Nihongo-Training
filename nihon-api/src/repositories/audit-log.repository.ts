import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type AuditEntry = { actorId: number; action: string; targetUserId?: number | null; targetRef?: string | null; details?: Record<string, unknown> };
export type AuditRow = {
  id: string; action: string; target_ref: string | null; details: Record<string, unknown>; created_at: Date;
  actor_username: string | null; target_username: string | null;
};
export type AuditFilter = { action?: string; actor?: string; target?: string; before?: number; limit: number };

export async function insertAuditEntry(db: Queryable, entry: AuditEntry) {
  await db.query("INSERT INTO admin_audit_log (actor_id, action, target_user_id, target_ref, details) VALUES ($1, $2, $3, $4, $5)",
    [entry.actorId, entry.action, entry.targetUserId ?? null, entry.targetRef ?? null, JSON.stringify(entry.details ?? {})]);
}

/** Newest first. `action` matches a whole action or a group ("user" matches "user.suspended"). */
export async function listAuditEntries(filter: AuditFilter): Promise<AuditRow[]> {
  const result = await pool.query(
    `SELECT l.id, l.action, l.target_ref, l.details, l.created_at, a.username AS actor_username, t.username AS target_username
       FROM admin_audit_log l LEFT JOIN users a ON a.id = l.actor_id LEFT JOIN users t ON t.id = l.target_user_id
      WHERE ($1::text IS NULL OR l.action = $1 OR l.action LIKE $1 || '.%')
        AND ($2::text IS NULL OR LOWER(a.username) = LOWER($2))
        AND ($3::text IS NULL OR LOWER(t.username) = LOWER($3) OR l.target_ref = $3)
        AND ($4::bigint IS NULL OR l.id < $4)
      ORDER BY l.id DESC LIMIT $5`,
    [filter.action ?? null, filter.actor ?? null, filter.target ?? null, filter.before ?? null, filter.limit]);
  return result.rows;
}
