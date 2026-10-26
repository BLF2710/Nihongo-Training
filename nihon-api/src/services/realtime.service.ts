import type { Response } from "express";

/**
 * Live updates for signed-in learners over server-sent events. Each open tab keeps one stream; services call
 * `publish` after their change is committed. Events only say what changed ("your friend list changed",
 * "you have a new message"), and the page then reloads that data through the normal API, so an event that is
 * missed (no tab open, reconnecting) loses nothing.
 *
 * The registry lives in this process. Running several API processes would need a shared channel such as
 * PostgreSQL LISTEN/NOTIFY or Redis pub/sub in front of `publish` (see note.txt).
 */
export type RealtimeEvent =
  | { type: "friends"; reason: "request" | "accepted" | "updated"; person?: { username: string; displayName: string } }
  | { type: "inbox" }
  | { type: "notifications" };

const HEARTBEAT_MS = 25_000;
const MAX_STREAMS_PER_USER = 10;
const streams = new Map<number, Set<Response>>();

const write = (res: Response, text: string) => { try { res.write(text); } catch { /* the stream closed; cleanup follows */ } };

/** Turns the response into an event stream for this learner until the connection closes. */
export function openStream(userId: number, res: Response, onClose: (listener: () => void) => void) {
  const own = streams.get(userId) ?? new Set<Response>();
  // A learner with many tabs keeps the newest streams; the oldest is ended and its tab reconnects later if still open.
  if (own.size >= MAX_STREAMS_PER_USER) { const oldest = own.values().next().value; if (oldest) { own.delete(oldest); oldest.end(); } }
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

/** Ends every open stream of a learner (their sessions were revoked); tabs that reconnect must sign in again. */
export function closeStreams(userId: number) {
  for (const res of streams.get(userId) ?? []) { try { res.end(); } catch { /* already closed */ } }
  streams.delete(userId);
}

export function publish(userId: number, event: RealtimeEvent) {
  for (const res of streams.get(userId) ?? []) write(res, `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

/** Open streams for a learner (tests and diagnostics). */
export const streamCount = (userId: number) => streams.get(userId)?.size ?? 0;
