export type ActivityKind = "lesson" | "assessment" | "speed" | "review" | "kanji";
export type Activity = { key: string; href: string; title: string; kind: ActivityKind };
export type SavedActivity = Activity & { version: 1; id: string; status: "active" | "completed"; updatedAt: string; data: Record<string, unknown> };
const event = "learning-session-change";
export function sessionStorageKey() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { userId?: number };
    if (Number.isSafeInteger(payload.userId) && Number(payload.userId) > 0) return `learning-session-v1:${payload.userId}`;
  } catch { /* Invalid tokens never share a real user's saved session. */ }
  return null;
}
export function sessionSnapshot() { const key = sessionStorageKey(); return key ? localStorage.getItem(key) : null; }
export function parseSession(raw: string | null): SavedActivity | null {
  try { const value = JSON.parse(raw ?? "null") as SavedActivity | null;
    if (value?.version !== 1 || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.href !== "string" || !value.data || typeof value.data !== "object" || Array.isArray(value.data) || !["active", "completed"].includes(value.status)) return null;
    const url = new URL(value.href, "https://session.local");
    const route = activityForRoute(url.pathname, url.search);
    return url.origin === "https://session.local" && route?.key === value.key && route.kind === value.kind ? value : null;
  } catch { return null; }
}
export const readSession = () => parseSession(sessionSnapshot());
export function writeSession(value: SavedActivity) {
  const key = sessionStorageKey();
  if (!key) return false;
  try { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event(event)); return true; }
  catch { window.alert("Your browser could not save this session. Free some browser storage before continuing; progress may not survive closing this page."); return false; }
}
export function subscribeSession(callback: () => void) {
  window.addEventListener(event, callback); window.addEventListener("storage", callback);
  return () => { window.removeEventListener(event, callback); window.removeEventListener("storage", callback); };
}
export function activityForRoute(path: string, search: string): Activity | null {
  const params = new URLSearchParams(search);
  const script = params.get("type") === "katakana" ? "katakana" : "hiragana";
  if (path === "/practice") return { key: `speed:${script}`, href: `/practice?type=${script}`, title: `${script === "hiragana" ? "Hiragana" : "Katakana"} Speed Quiz`, kind: "speed" };
  if (/^\/review\/(hiragana|katakana)$/.test(path)) return { key: path, href: path, title: `${path.endsWith('hiragana') ? 'Hiragana' : 'Katakana'} Review`, kind: "review" };
  if (path === "/learn/kanji/practice") { const id = params.get('kanji'); const href = path + (id ? `?kanji=${encodeURIComponent(id)}` : ''); return { key: href, href, title: "Kanji practice", kind: "kanji" }; }
  if (/^\/quizzes\/[^/]+$/.test(path)) return { key: path, href: path, title: "Unit assessment", kind: "assessment" };
  if (/^\/lessons\/japanese\/[^/]+$/.test(path)) return { key: path, href: path, title: "Japanese lesson", kind: "lesson" };
  return null;
}
export function activityProgress(session: SavedActivity) {
  const d = session.data;
  if (session.kind === "lesson") return `Lesson step ${Number(d.step ?? 0) + 1} / 7`;
  if (session.kind === "speed") return `${Number(d.correctCount ?? 0)} correct · ${Number(d.wrongCount ?? 0)} wrong · ${Number(d.streak ?? 0)} streak`;
  const questions = Array.isArray(d.questions) ? d.questions : (d.assessment as { questions?: unknown[] } | undefined)?.questions;
  const answers = Array.isArray(d.answers) ? d.answers.length : d.answers && typeof d.answers === "object" ? Object.keys(d.answers).length : 0;
  return questions?.length ? `Question ${Number(d.index ?? 0) + 1} / ${questions.length} · ${answers} answered` : "Session ready to continue";
}
