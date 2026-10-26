import type { NextFunction, Request, Response } from "express";

// Fixed-window limits for sensitive endpoints (sign-in, registration, password reset), kept in this process.
// Several API processes would need a shared store (Redis) instead; see note.txt.

export type RateLimitRule = {
  name: string;
  windowMs: number;
  max: number;
  /** What one allowance belongs to, e.g. the client address, or the address plus the account being signed in to. */
  key: (req: Request) => string | null;
  message: string;
};

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();
const SWEEP_EVERY_MS = 60_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, window] of windows) if (window.resetAt <= now) windows.delete(key);
}

/** Counts one use; returns the seconds to wait when the rule's limit is exceeded, otherwise null. */
export function consume(rule: RateLimitRule, key: string, now = Date.now()): number | null {
  sweep(now);
  const id = `${rule.name}:${key}`;
  const window = windows.get(id);
  if (!window || window.resetAt <= now) { windows.set(id, { count: 1, resetAt: now + rule.windowMs }); return null; }
  window.count += 1;
  return window.count > rule.max ? Math.ceil((window.resetAt - now) / 1000) : null;
}

/** Rejects a request with 429 when any of the rules is over its limit. */
export function rateLimit(...rules: RateLimitRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      const key = rule.key(req);
      if (key === null) continue;
      const waitSeconds = consume(rule, key);
      if (waitSeconds !== null) {
        res.setHeader("Retry-After", String(waitSeconds));
        return res.status(429).json({ message: rule.message, retryAfterSeconds: waitSeconds });
      }
    }
    next();
  };
}

/** For tests: forget every counted use. */
export function resetRateLimits() {
  windows.clear();
}

export const clientAddress = (req: Request) => req.ip ?? req.socket.remoteAddress ?? "unknown";
/** A lower-cased value from the request body (an email or a username), or null when absent. */
export const bodyField = (field: string) => (req: Request) => {
  const value = (req.body as Record<string, unknown> | undefined)?.[field];
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase().slice(0, 254) : null;
};
