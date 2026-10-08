import { withTransaction } from "../db/transaction";
import {
  findLatestMigration, getSettings, listContentAvailability, setContentAvailability, updateSettings,
} from "../repositories/site.repository";
import {
  countActiveAdmins, countUsersByState, countUsersMatching, findActiveAccount, isActiveAdmin,
  lockAdministratorChanges, lockUserRoleAndStatus, searchUsers, updateAccount,
} from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { EMAIL_PATTERN, USERNAME_PATTERN } from "../utils/validation";
import { CONTENT, isManagedContent } from "./admin-content.service";

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
      return updateAccount(client, { id, username, email: email.trim().toLowerCase(), role, status });
    });
  } catch (error) {
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) throw new HttpError(409, "That username or email is already in use.");
    throw error;
  }
}

export async function getSystemSettings() {
  return getSettings();
}

export async function saveSettings(actorId: number, input: Record<string, unknown>) {
  const { registration_enabled, announcement } = input;
  if (typeof registration_enabled !== "boolean" || typeof announcement !== "string" || announcement.length > 500) {
    throw new HttpError(400, "Use a valid registration setting and an announcement of at most 500 characters.");
  }
  return updateSettings(registration_enabled, announcement.trim(), actorId);
}

export async function listContent() {
  const saved = await listContentAvailability();
  return { items: CONTENT.map(item => ({ ...item, enabled: saved.find(row => row.content_key === item.key)?.enabled ?? true })) };
}

export async function setContentEnabled(actorId: number, key: string, enabled: unknown) {
  if (!isManagedContent(key) || typeof enabled !== "boolean") throw new HttpError(400, "Invalid content or availability.");
  await setContentAvailability(key, enabled, actorId);
  return { key, enabled };
}
