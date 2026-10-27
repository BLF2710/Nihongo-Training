import type { Response } from "express";
import { sharedState } from "../shared-state";
import type { BusMessage } from "../shared-state/realtime-bus";

/**
 * Live updates for signed-in learners over server-sent events. Each open tab keeps one stream; services call
 * `publish` after their change is committed. Events only say what changed ("your friend list changed",
 * "you have a new message"), and the page then reloads that data through the normal API, so an event that is
 * missed (no tab open, reconnecting) loses nothing.
 *
 * A learner's tabs may be connected to different API processes, so events and "close" requests go through the
 * shared realtime bus (SHARED_STATE): every process receives them and delivers to the streams it holds.
 */
export type RealtimeEvent =
  | { type: "friends"; reason: "request" | "accepted" | "updated"; person?: { username: string; displayName: string } }
  | { type: "inbox" }
  | { type: "notifications" };

const HEARTBEAT_MS = 25_000;
const MAX_STREAMS_PER_USER = 10;
const streams = new Map<number, Set<Response>>();

const write = (res: Response, text: string) => { try { res.write(text); } catch { /* the stream closed; cleanup follows */ } };

function deliverHere(message: BusMessage) {
  const own = streams.get(message.userId);
  if (!own) return;
  if (message.kind === "close") {
    for (const res of own) { try { res.end(); } catch { /* already closed */ } }
    streams.delete(message.userId);
    return;
  }
  const { type } = message.event as { type: string };
  for (const res of own) write(res, `event: ${type}\ndata: ${JSON.stringify(message.event)}\n\n`);
}

let isSubscribed = false;
/** Starts receiving bus messages; needed only once this process holds streams. */
function subscribe() {
  if (isSubscribed) return;
  isSubscribed = true;
  sharedState().realtime.onMessage(deliverHere);
}

function send(message: BusMessage) {
  subscribe();
  // A lost live update is harmless (pages reload their data), so a failure is logged, not thrown.
  sharedState().realtime.send(message).catch(error => console.error("Live update not sent:", error));
}

/** Turns the response into an event stream for this learner until the connection closes. */
export function openStream(userId: number, res: Response, onClose: (listener: () => void) => void) {
  subscribe();
  const own = streams.get(userId) ?? new Set<Response>();
  // A learner with many tabs keeps the newest streams; the oldest is ended and its tab reconnects later if still open.
  if (own.size >= MAX_STREAMS_PER_USER) { const oldest = own.values().next().value; if (oldest) { own.delete(oldest); oldest.end(); } }
  // X-Accel-Buffering tells nginx not to hold the stream back; other proxies need buffering turned off for /api/events.
  res.status(200).set({ "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.flushHeaders();
  own.add(res); streams.set(userId, own);
  write(res, "retry: 5000\nevent: ready\ndata: {}\n\n");
  const heartbeat = setInterval(() => write(res, ": keep-alive\n\n"), HEARTBEAT_MS);
  onClose(() => {
    clearInterval(heartbeat);
    own.delete(res);
    if (!own.size && streams.get(userId) === own) streams.delete(userId);
  });
}

/** Ends every open stream of a learner, on every API process (their sessions were revoked). */
export function closeStreams(userId: number) {
  send({ kind: "close", userId });
}

export function publish(userId: number, event: RealtimeEvent) {
  send({ kind: "event", userId, event });
}

/** Open streams for a learner on this process (tests and diagnostics). */
export const streamCount = (userId: number) => streams.get(userId)?.size ?? 0;
