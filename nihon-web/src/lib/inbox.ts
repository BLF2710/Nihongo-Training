import { useEffect, useState } from "react";
import { fetchInbox } from "../api/communication";
import type { InboxSummary } from "../api/communication";
import { hasSession, isAdmin } from "./authStorage";

// Unread counts for the navigation badge. Pages that read or send messages call `refreshInbox()`
// so the badge updates at once instead of waiting for the next poll.
const REFRESH_EVENT = "inbox:refresh";
const POLL_MS = 60_000;
export const refreshInbox = () => window.dispatchEvent(new Event(REFRESH_EVENT));

export function useInboxSummary(): InboxSummary | null {
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  useEffect(() => {
    if (!hasSession() || isAdmin()) return;
    let controller = new AbortController();
    const load = () => {
      controller.abort(); controller = new AbortController();
      fetchInbox(controller.signal).then(setSummary).catch(() => { /* The badge simply stays as it was. */ });
    };
    load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") load(); }, POLL_MS);
    window.addEventListener(REFRESH_EVENT, load);
    window.addEventListener("focus", load);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener(REFRESH_EVENT, load); window.removeEventListener("focus", load); };
  }, []);
  return summary;
}
