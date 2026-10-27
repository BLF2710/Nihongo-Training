import type { Queryable } from "../db/transaction";

/** A fixed window after one more use: how many uses it has counted and when it ends. */
export type WindowHit = { count: number; resetAt: number };

/** Counts uses per key in fixed windows. */
export interface RateLimitStore {
  /** Counts one use of `id`; a window that has ended starts again at 1. */
  hit(id: string, windowMs: number): Promise<WindowHit>;
  /** Forgets every counted use (tests). */
  reset(): Promise<void>;
}

const SWEEP_EVERY_MS = 60_000;

/** For a single API process: windows live in this process's memory. */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, WindowHit>();
  private lastSweep = Date.now();
  constructor(private readonly now: () => number = Date.now) {}

  async hit(id: string, windowMs: number): Promise<WindowHit> {
    const now = this.now();
    this.sweep(now);
    const window = this.windows.get(id);
    if (!window || window.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.windows.set(id, fresh);
      return { ...fresh };
    }
    window.count += 1;
    return { ...window };
  }

  async reset() { this.windows.clear(); }

  private sweep(now: number) {
    if (now - this.lastSweep < SWEEP_EVERY_MS) return;
    this.lastSweep = now;
    for (const [id, window] of this.windows) if (window.resetAt <= now) this.windows.delete(id);
  }
}

/**
 * For several API processes: windows live in PostgreSQL (rate_limit_windows), counted with one atomic statement
 * on the database's clock, so every process sees the same count.
 */
export class PostgresRateLimitStore implements RateLimitStore {
  private lastSweep = 0;
  constructor(private readonly db: Queryable) {}

  async hit(id: string, windowMs: number): Promise<WindowHit> {
    const result = await this.db.query(
      `INSERT INTO rate_limit_windows (id, count, reset_at) VALUES ($1, 1, NOW() + make_interval(secs => $2::float8 / 1000))
       ON CONFLICT (id) DO UPDATE SET
         count = CASE WHEN rate_limit_windows.reset_at <= NOW() THEN 1 ELSE rate_limit_windows.count + 1 END,
         reset_at = CASE WHEN rate_limit_windows.reset_at <= NOW() THEN EXCLUDED.reset_at ELSE rate_limit_windows.reset_at END
       RETURNING count, (EXTRACT(EPOCH FROM reset_at) * 1000)::float8 AS reset_ms,
                 (EXTRACT(EPOCH FROM NOW()) * 1000)::float8 AS now_ms`,
      [id, windowMs]);
    await this.sweep();
    const row = result.rows[0];
    // Return the window end on this process's clock, so the caller's "retry after" is right even if clocks differ.
    return { count: row.count, resetAt: Date.now() + (Number(row.reset_ms) - Number(row.now_ms)) };
  }

  async reset() { await this.db.query("DELETE FROM rate_limit_windows"); }

  private async sweep() {
    const now = Date.now();
    if (now - this.lastSweep < SWEEP_EVERY_MS) return;
    this.lastSweep = now;
    await this.db.query("DELETE FROM rate_limit_windows WHERE reset_at <= NOW()");
  }
}
