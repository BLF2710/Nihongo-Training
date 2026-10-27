import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import { insertAuditEntry, listAuditEntries } from "../repositories/audit-log.repository";
import type { AuditEntry } from "../repositories/audit-log.repository";
import { HttpError } from "../utils/http-error";
import { USERNAME_PATTERN } from "../utils/validation";

export const AUDIT_ACTIONS = [
  "user.role_changed", "user.suspended", "user.reactivated", "user.details_changed", "user.lessons_unlocked", "user.lessons_relocked",
  "settings.updated", "content.enabled", "content.disabled",
  "question.created", "question.updated", "question.deleted",
  "support.replied", "support.closed", "support.reopened",
  "reports.resolved",
  "lesson.published", "lesson.reverted", "lesson.draft_discarded",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
const AUDIT_GROUPS = [...new Set(AUDIT_ACTIONS.map(action => action.split(".")[0]))];

const PAGE_SIZE = 50;
const MAX_FILTER_LENGTH = 160;

/**
 * Records an administrator action. Pass the transaction that made the change, so the entry exists exactly when the
 * change does.
 */
export async function recordAdminAction(db: Queryable, entry: AuditEntry & { action: AuditAction }) {
  await insertAuditEntry(db, entry);
}
export const recordAdminActionNow = (entry: AuditEntry & { action: AuditAction }) => recordAdminAction(pool, entry);

function optionalText(value: unknown, isValid: (text: string) => boolean): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || value.length > MAX_FILTER_LENGTH || !isValid(value.trim())) throw new HttpError(400, "Invalid audit log filter.");
  return value.trim().replace(/^@/, "");
}

/** One page of the audit log, newest first, optionally filtered by action (or group), administrator or target. */
export async function getAuditLog(query: Record<string, unknown>) {
  const action = optionalText(query.action, text => (AUDIT_ACTIONS as readonly string[]).includes(text) || AUDIT_GROUPS.includes(text));
  const actor = optionalText(query.actor, text => USERNAME_PATTERN.test(text.replace(/^@/, "")));
  const target = optionalText(query.target, () => true);
  const before = query.before === undefined ? undefined : Number(query.before);
  if (before !== undefined && (!Number.isSafeInteger(before) || before < 1)) throw new HttpError(400, "Invalid audit log page.");
  const rows = await listAuditEntries({ action, actor, target, before, limit: PAGE_SIZE + 1 });
  return {
    entries: rows.slice(0, PAGE_SIZE).map(row => ({
      id: Number(row.id), action: row.action, at: row.created_at, actor: row.actor_username, targetUser: row.target_username,
      targetRef: row.target_ref, details: row.details,
    })),
    hasMore: rows.length > PAGE_SIZE,
    actions: AUDIT_ACTIONS,
  };
}
