import { withTransaction } from "../db/transaction";
import {
  findLatestMigration, getSettings, listContentAvailability, setContentAvailability, updateSettings,
} from "../repositories/site.repository";
import {
  countActiveAdmins, countUsersByState, countUsersMatching, findActiveAccount, isActiveAdmin,
  lockAdministratorChanges, lockUserRoleAndStatus, searchUsers, setAllLessonsUnlocked, updateAccount,
} from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { EMAIL_PATTERN, USERNAME_PATTERN } from "../utils/validation";
import { CONTENT, isManagedContent } from "./admin-content.service";
import { recordAdminAction, recordAdminActionNow } from "./audit-log.service";
import type { AuditAction } from "./audit-log.service";

const USERS_PAGE_SIZE = 20;
const MAX_USERS_PAGE = 100000;
const UNIQUE_VIOLATION = "23505";

type UserEdit = { username: string; email: string; role: string; status: string };

const isActiveAdminState = (role: string, status: string) => role === "admin" && status === "active";

function isValidUserEdit(id: number, edit: Record<string, unknown>): edit is UserEdit {
  const { username, email, role, status } = edit;
  return Number.isSafeInteger(id) && id >= 1 &&
    typeof username === "string" && USERNAME_PATTERN.test(username) &&
    typeof email === "string" && email.length <= 254 && EMAIL_PATTERN.test(email) &&
    ["learner", "admin"].includes(role as string) && ["active", "suspended"].includes(status as string);
}

export async function getAccess(userId: number) {
  const account = await findActiveAccount(userId);
  if (!account) throw new HttpError(403, "This account is inactive.");
  return account;
}

export async function getOverview() {
  const started = Date.now();
  const users = await countUsersByState();
  const latestMigration = await findLatestMigration();
  return {
    users, database: "connected", databaseLatencyMs: Date.now() - started, uptimeSeconds: Math.floor(process.uptime()),
    checkedAt: new Date().toISOString(), latestMigration,
  };
}

export async function listUsers(rawSearch: unknown, rawPage: unknown) {
  const search = typeof rawSearch === "string" ? rawSearch.trim().slice(0, 100) : "";
  const page = Number(rawPage ?? 1);
  if (!Number.isInteger(page) || page < 1 || page > MAX_USERS_PAGE) throw new HttpError(400, "Invalid page.");
  const total = await countUsersMatching(search);
  const users = await searchUsers(search, USERS_PAGE_SIZE, (page - 1) * USERS_PAGE_SIZE);
  return { users, page, total, pageSize: USERS_PAGE_SIZE };
}

type Account = { username: string; email: string; role: string; status: string };
type AccountChange = { action: AuditAction; details: Record<string, unknown> };

/** Audit entries for an account edit. The email address itself is not copied into the log, only that it changed. */
function accountChanges(before: Account, after: Account): AccountChange[] {
  const changes: AccountChange[] = [];
  if (before.status !== after.status) changes.push({ action: after.status === "suspended" ? "user.suspended" : "user.reactivated", details: {} });
  if (before.role !== after.role) changes.push({ action: "user.role_changed", details: { from: before.role, to: after.role } });
  const fields = {
    ...(before.username !== after.username ? { username: { from: before.username, to: after.username } } : {}),
    ...(before.email !== after.email ? { email: "changed" } : {}),
  };
  if (Object.keys(fields).length) changes.push({ action: "user.details_changed", details: fields });
  return changes;
}

/** Edits an account while guaranteeing that at least one active administrator always remains. */
export async function updateUser(actorId: number, id: number, edit: Record<string, unknown>) {
  if (!isValidUserEdit(id, edit)) throw new HttpError(400, "Enter a valid username, email, role, and status.");
  const { username, email, role, status } = edit;
  const keepsAdminAccess = isActiveAdminState(role, status);
  if (id === actorId && !keepsAdminAccess) {
    throw new HttpError(409, "You cannot remove your own administrator access or suspend your own account.");
  }
  try {
    return await withTransaction(async client => {
      await lockAdministratorChanges(client);
      if (!(await isActiveAdmin(actorId, client))) throw new HttpError(403, "Administrator access is required.");
      const target = await lockUserRoleAndStatus(id, client);
      if (!target) throw new HttpError(404, "User not found.");
      if (isActiveAdminState(target.role, target.status) && !keepsAdminAccess && await countActiveAdmins(client) <= 1) {
        throw new HttpError(409, "At least one active administrator must remain.");
      }
      const updated = await updateAccount(client, { id, username, email: email.trim().toLowerCase(), role, status });
      for (const change of accountChanges(target, updated)) await recordAdminAction(client, { actorId, targetUserId: id, ...change });
      return updated;
    });
  } catch (error) {
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) throw new HttpError(409, "That username or email is already in use.");
    throw error;
  }
}

/** Opens (or restores normal progression for) every unit and lesson of one account. Progress and XP are not changed. */
export async function setLessonAccess(actorId: number, rawId: unknown, unlocked: unknown) {
  const id = Number(rawId);
  if (typeof unlocked !== "boolean") throw new HttpError(400, "Choose whether all lessons are unlocked.");
  const updated = Number.isSafeInteger(id) && id >= 1 ? await setAllLessonsUnlocked(id, unlocked) : null;
  if (!updated) throw new HttpError(404, "User not found.");
  await recordAdminActionNow({ actorId, action: unlocked ? "user.lessons_unlocked" : "user.lessons_relocked", targetUserId: id });
  return updated;
}

export async function getSystemSettings() {
  return getSettings();
}

export async function saveSettings(actorId: number, input: Record<string, unknown>) {
  const { registration_enabled, announcement } = input;
  // Left out by older clients: keeps the announcement visible to everyone, as before.
  const audience = input.announcement_audience ?? "everyone";
  if (typeof registration_enabled !== "boolean" || typeof announcement !== "string" || announcement.length > 500 || (audience !== "everyone" && audience !== "learners")) {
    throw new HttpError(400, "Use a valid registration setting, an announcement of at most 500 characters and an audience of everyone or learners.");
  }
  const saved = await updateSettings(registration_enabled, announcement.trim(), audience, actorId);
  await recordAdminActionNow({ actorId, action: "settings.updated", details: { registrationEnabled: registration_enabled, announcement: announcement.trim(), audience } });
  return saved;
}

export async function listContent() {
  const saved = await listContentAvailability();
  return { items: CONTENT.map(item => ({ ...item, enabled: saved.find(row => row.content_key === item.key)?.enabled ?? true })) };
}

export async function setContentEnabled(actorId: number, key: string, enabled: unknown) {
  if (!isManagedContent(key) || typeof enabled !== "boolean") throw new HttpError(400, "Invalid content or availability.");
  await setContentAvailability(key, enabled, actorId);
  await recordAdminActionNow({ actorId, action: enabled ? "content.enabled" : "content.disabled", targetRef: key });
  return { key, enabled };
}
