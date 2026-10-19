import type { MessageRow } from "../repositories/conversation.repository";
import { HttpError } from "../utils/http-error";

export const MAX_MESSAGE_LENGTH = 2000;

/** A message body as typed: trimmed, not empty, within the limit. */
export function cleanBody(value: unknown, max = MAX_MESSAGE_LENGTH): string {
  const body = typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
  if (!body) throw new HttpError(400, "Write a message first.");
  if (body.length > max) throw new HttpError(400, `Messages can be up to ${max} characters.`);
  return body;
}

export function cleanSubject(value: unknown): string {
  const subject = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (subject.length < 3 || subject.length > 120) throw new HttpError(400, "Give your request a subject of 3 to 120 characters.");
  return subject;
}

/** A positive whole-number id from the address, or a 404. */
export function idParam(value: unknown, what = "Conversation"): number {
  const id = typeof value === "string" && /^\d{1,9}$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, `${what} not found.`);
  return id;
}

export const preview = (body: string | null) => body ? (body.length > 120 ? `${body.slice(0, 117)}…` : body) : "";

// How each kind of sender is named. Learners see the team as one voice; administrators see who replied.
export function toMessage(row: MessageRow, viewerId: number, view: "learner" | "staff" = "learner") {
  const sender = row.sender_role === "assistant" ? "Study assistant"
    : row.sender_role === "admin" ? (view === "staff" ? `${row.sender_name ?? "Administrator"} (support)` : "LingoHub support")
    : row.sender_name ?? "Former learner";
  return { id: row.id, body: row.body, senderRole: row.sender_role, sender, mine: row.sender_id === viewerId, sentAt: row.created_at };
}

/** Throws 429 when an account has sent `limit` or more messages in the window. */
export function enforceRate(recent: number, limit: number, wait: string) {
  if (recent >= limit) throw new HttpError(429, `You are sending messages very quickly. Please wait ${wait} and try again.`);
}
