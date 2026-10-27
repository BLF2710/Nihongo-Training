import { connectionOptions, pool } from "../config/db";
import { config } from "../config/env";
import { MemoryNonceStore, PostgresNonceStore } from "./nonce-store";
import type { NonceStore } from "./nonce-store";
import { MemoryRateLimitStore, PostgresRateLimitStore } from "./rate-limit-store";
import type { RateLimitStore } from "./rate-limit-store";
import { MemoryRealtimeBus, PostgresRealtimeBus } from "./realtime-bus";
import type { RealtimeBus } from "./realtime-bus";

/** State that every API process must agree on. SHARED_STATE chooses this process's memory or PostgreSQL. */
export type SharedState = { rateLimits: RateLimitStore; nonces: NonceStore; realtime: RealtimeBus };

function createSharedState(): SharedState {
  if (config().sharedState === "memory") return { rateLimits: new MemoryRateLimitStore(), nonces: new MemoryNonceStore(), realtime: new MemoryRealtimeBus() };
  return { rateLimits: new PostgresRateLimitStore(pool), nonces: new PostgresNonceStore(pool), realtime: new PostgresRealtimeBus(pool, connectionOptions) };
}

let current: SharedState | null = null;

/** This process's shared state, created on first use from the configuration. */
export const sharedState = (): SharedState => (current ??= createSharedState());

/** Replaces the shared state, e.g. with in-memory stores in tests. */
export function useSharedState(state: SharedState) {
  current = state;
}
