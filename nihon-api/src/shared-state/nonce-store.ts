import type { Queryable } from "../db/transaction";

/** One-time values that expire: each can be used once, on any API process. */
export interface NonceStore {
  save(nonce: string, lifetimeMs: number): Promise<void>;
  /** True once for a saved nonce that hasn't expired; the nonce is gone afterwards either way. */
  use(nonce: string): Promise<boolean>;
}

const MAX_OUTSTANDING = 10_000;
const SWEEP_EVERY_MS = 60_000;

/** For a single API process. */
export class MemoryNonceStore implements NonceStore {
  private readonly expiries = new Map<string, number>();
  constructor(private readonly now: () => number = Date.now) {}

  async save(nonce: string, lifetimeMs: number) {
    const now = this.now();
    if (this.expiries.size >= MAX_OUTSTANDING) for (const [key, expiresAt] of this.expiries) if (expiresAt <= now) this.expiries.delete(key);
    this.expiries.set(nonce, now + lifetimeMs);
  }

  async use(nonce: string) {
    const expiresAt = this.expiries.get(nonce);
    this.expiries.delete(nonce);
    return expiresAt !== undefined && expiresAt > this.now();
  }
}

/** For several API processes: nonces live in PostgreSQL (sign_in_nonces); using one deletes it atomically. */
export class PostgresNonceStore implements NonceStore {
  private lastSweep = 0;
  constructor(private readonly db: Queryable) {}

  async save(nonce: string, lifetimeMs: number) {
    await this.db.query("INSERT INTO sign_in_nonces (nonce, expires_at) VALUES ($1, NOW() + make_interval(secs => $2::float8 / 1000))", [nonce, lifetimeMs]);
    const now = Date.now();
    if (now - this.lastSweep >= SWEEP_EVERY_MS) {
      this.lastSweep = now;
      await this.db.query("DELETE FROM sign_in_nonces WHERE expires_at <= NOW()");
    }
  }

  async use(nonce: string) {
    const result = await this.db.query("DELETE FROM sign_in_nonces WHERE nonce = $1 RETURNING expires_at > NOW() AS is_valid", [nonce]);
    return result.rows[0]?.is_valid === true;
  }
}
