import { useEffect, useRef, useSyncExternalStore } from "react";
import api from "../api/axios";
import { getToken, hasSession, isAdmin } from "./authStorage";

/**
 * Live updates from the server (server-sent events), one stream per tab shared by every component that listens.
 * The stream is read with fetch so the token travels in the Authorization header, never in the address.
 * Events only say that something changed; listeners reload through the normal API. After a reconnect a
 * "resync" event tells listeners to reload, because changes made while disconnected were not sent.
 */
export type RealtimeEvent =
  | { type: "friends"; reason: "request" | "accepted" | "updated"; person?: { username: string; displayName: string } }
  | { type: "inbox" }
  | { type: "resync" };
export type RealtimeStatus = "off" | "connecting" | "live" | "retrying";

const listeners = new Set<(event: RealtimeEvent) => void>();
const statusListeners = new Set<() => void>();
let status: RealtimeStatus = "off";
let controller: AbortController | null = null;
let retryTimer: number | undefined, stopTimer: number | undefined;
let failures = 0, connectedOnce = false;

function setStatus(next: RealtimeStatus) { if (status !== next) { status = next; statusListeners.forEach(listener => listener()); } }
const emit = (event: RealtimeEvent) => listeners.forEach(listener => { try { listener(event); } catch (error) { console.error(error); } });

function scheduleRetry() {
  setStatus("retrying");
  const delay = Math.min(30_000, 1_000 * 2 ** failures++) + Math.random() * 1_000;
  retryTimer = window.setTimeout(connect, delay);
}

async function connect() {
  window.clearTimeout(retryTimer);
  const token = getToken();
  if (!hasSession() || !token || isAdmin() || !listeners.size) { setStatus("off"); return; }
  controller?.abort();
  const own = controller = new AbortController();
  setStatus("connecting");
  try {
    const response = await fetch(`${api.defaults.baseURL}/events`, { headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" }, signal: own.signal, cache: "no-store" });
    // Signed out, suspended or switched off: stay quiet until the next page that listens tries again.
    if (response.status === 401 || response.status === 403) { setStatus("off"); return; }
    if (!response.ok || !response.body) throw new Error(`Live updates answered ${response.status}`);
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      // Another account signed in or out in this tab: this stream belongs to the old one.
      if (getToken() !== token) { own.abort(); void connect(); return; }
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, end); buffer = buffer.slice(end + 2);
        const type = /^event: ?(.+)$/m.exec(block)?.[1], data = /^data: ?(.+)$/m.exec(block)?.[1];
        if (type === "ready") { failures = 0; setStatus("live"); if (connectedOnce) emit({ type: "resync" }); connectedOnce = true; }
        else if (type === "friends" || type === "inbox") { try { emit(JSON.parse(data ?? "{}") as RealtimeEvent); } catch { /* ignore a malformed event */ } }
      }
    }
    if (!own.signal.aborted) scheduleRetry();
  } catch {
    if (!own.signal.aborted) scheduleRetry();
  }
}

function listen(listener: (event: RealtimeEvent) => void) {
  listeners.add(listener);
  window.clearTimeout(stopTimer);
  if (status === "off") void connect();
  return () => {
    listeners.delete(listener);
    // Moving between pages unsubscribes and resubscribes at once; keep the stream open across that.
    if (!listeners.size) stopTimer = window.setTimeout(() => { if (!listeners.size) { controller?.abort(); controller = null; window.clearTimeout(retryTimer); setStatus("off"); } }, 5_000);
  };
}

/** Calls `handler` for every live event while the component is mounted. */
export function useRealtime(handler: (event: RealtimeEvent) => void, enabled = true) {
  const latest = useRef(handler);
  useEffect(() => { latest.current = handler; });
  useEffect(() => enabled ? listen(event => latest.current(event)) : undefined, [enabled]);
}

export function useRealtimeStatus(): RealtimeStatus {
  return useSyncExternalStore(listener => { statusListeners.add(listener); return () => statusListeners.delete(listener); }, () => status, () => "off");
}
