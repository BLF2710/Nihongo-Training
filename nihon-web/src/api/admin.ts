import api from "./axios";

export type Settings = { registration_enabled: boolean; announcement: string; updated_at: string };
export type UserEdit = { username: string; email: string; role: "learner" | "admin"; status: "active" | "suspended" };

/** Reads any admin resource; `path` starts with /admin. */
export async function fetchAdmin<T>(path: string, signal?: AbortSignal) {
  return (await api.get<T>(path, { signal })).data;
}

export async function updateUser(userId: number, edit: UserEdit) {
  await api.patch(`/admin/users/${userId}`, edit);
}

export async function saveSettings(settings: Pick<Settings, "registration_enabled" | "announcement">) {
  return (await api.put<Settings>("/admin/settings", settings)).data;
}

export async function setContentEnabled(key: string, enabled: boolean) {
  await api.put(`/admin/content/${encodeURIComponent(key)}`, { enabled });
}
