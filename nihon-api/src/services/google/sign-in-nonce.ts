import { randomBytes } from "node:crypto";

// One-time numbers for "Sign in with Google". The page asks for one, Google puts it inside the ID token, and the
// server accepts each one once within ten minutes, so a captured token can't be replayed. Kept in this process,
// like the rate limits (several processes would need a shared store).

const NONCE_LIFETIME_MS = 10 * 60 * 1000;
const MAX_OUTSTANDING = 10_000;
const issued = new Map<string, number>();

function forgetExpired(now: number) {
  for (const [nonce, expiresAt] of issued) if (expiresAt <= now) issued.delete(nonce);
}

export function issueNonce(now = Date.now()): string {
  if (issued.size >= MAX_OUTSTANDING) forgetExpired(now);
  const nonce = randomBytes(24).toString("base64url");
  issued.set(nonce, now + NONCE_LIFETIME_MS);
  return nonce;
}

/** True once for a nonce this server issued and that hasn't expired; it can't be used again. */
export function consumeNonce(nonce: string | null, now = Date.now()): boolean {
  if (!nonce) return false;
  const expiresAt = issued.get(nonce);
  issued.delete(nonce);
  return expiresAt !== undefined && expiresAt > now;
}
