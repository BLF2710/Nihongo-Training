import { updateTimeZone } from "../api/profile";
import { getUserEmail, hasSession, isAdmin } from "./authStorage";

// Daily streaks follow the learner's own calendar day, so the server needs this browser's time zone.
// It is sent once per account and browser, and again whenever it changes (travel, a new device).
const browserTimeZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { return null; } };
const cacheKey = () => `time_zone:${getUserEmail() ?? ""}`;

/** Sends the browser's time zone when the server's copy (if known) or the last one sent differs. */
export function syncTimeZone(serverTimeZone?: string | null) {
  if (!hasSession() || isAdmin()) return;
  const zone = browserTimeZone();
  if (!zone) return;
  let sent: string | null = null;
  try { sent = localStorage.getItem(cacheKey()); } catch { /* storage unavailable: compare with the server only */ }
  if (serverTimeZone === zone || (serverTimeZone === undefined && sent === zone)) return;
  updateTimeZone(zone).then(() => { try { localStorage.setItem(cacheKey(), zone); } catch { /* fine */ } }).catch(() => { /* retried on the next page */ });
}
