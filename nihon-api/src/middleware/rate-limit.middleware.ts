import type { NextFunction, Request, Response } from "express";
import { sharedState } from "../shared-state";

// Fixed-window limits for sensitive endpoints (sign-in, registration, password reset). The counts live in the
// shared state: this process's memory, or PostgreSQL when several API processes run (SHARED_STATE).

export type RateLimitRule = {
  name: string;
  windowMs: number;
  max: number;
  /** What one allowance belongs to, e.g. the client address, or the address plus the account being signed in to. */
  key: (req: Request) => string | null;
  message: string;
};

/** Counts one use; resolves to the seconds to wait when the rule's limit is exceeded, otherwise null. */
export async function consume(rule: RateLimitRule, key: string): Promise<number | null> {
  const hit = await sharedState().rateLimits.hit(`${rule.name}:${key}`, rule.windowMs);
  return hit.count > rule.max ? Math.max(1, Math.ceil((hit.resetAt - Date.now()) / 1000)) : null;
}

/** Rejects a request with 429 when any of the rules is over its limit. */
export function rateLimit(...rules: RateLimitRule[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      const key = rule.key(req);
      if (key === null) continue;
      const waitSeconds = await consume(rule, key);
      if (waitSeconds !== null) {
        res.setHeader("Retry-After", String(waitSeconds));
        return res.status(429).json({ message: rule.message, retryAfterSeconds: waitSeconds });
      }
    }
    next();
  };
}

/** For tests: forget every counted use. */
export async function resetRateLimits() {
  await sharedState().rateLimits.reset();
}

export const clientAddress = (req: Request) => req.ip ?? req.socket.remoteAddress ?? "unknown";
/** A lower-cased value from the request body (an email or a username), or null when absent. */
export const bodyField = (field: string) => (req: Request) => {
  const value = (req.body as Record<string, unknown> | undefined)?.[field];
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase().slice(0, 254) : null;
};
