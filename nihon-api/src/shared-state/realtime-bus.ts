import { Client } from "pg";
import type { ClientConfig } from "pg";
import type { Queryable } from "../db/transaction";

/** What one API process tells all of them: an event for a learner's open tabs, or "close that learner's streams". */
export type BusMessage = { kind: "event"; userId: number; event: unknown } | { kind: "close"; userId: number };

/** Delivers messages to every API process (including the sender), which passes them to its own open streams. */
export interface RealtimeBus {
  send(message: BusMessage): Promise<void>;
  onMessage(handler: (message: BusMessage) => void): void;
  close(): Promise<void>;
}

/** Reads a message from the wire, or null when it isn't one. */
export function parseBusMessage(payload: string): BusMessage | null {
  let value: unknown;
  try { value = JSON.parse(payload); } catch { return null; }
  if (typeof value !== "object" || value === null) return null;
  const { kind, userId, event } = value as Record<string, unknown>;
  if (typeof userId !== "number" || !Number.isSafeInteger(userId)) return null;
  if (kind === "close") return { kind, userId };
  if (kind === "event" && typeof event === "object" && event !== null) return { kind, userId, event };
  return null;
}

/** For a single API process: messages are handed straight to this process. */
export class MemoryRealtimeBus implements RealtimeBus {
  private handlers: ((message: BusMessage) => void)[] = [];
  async send(message: BusMessage) { for (const handler of this.handlers) handler(message); }
  onMessage(handler: (message: BusMessage) => void) { this.handlers.push(handler); }
  async close() { this.handlers = []; }
}

export const REALTIME_CHANNEL = "lingohub_realtime";
const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000];

/**
 * For several API processes: messages go through PostgreSQL NOTIFY on one channel; every process LISTENs on a
 * dedicated connection and reconnects if it drops. Events are small ("something changed"), well under NOTIFY's
 * 8000-byte limit, and a missed one costs nothing: pages reload their data through the normal API.
 */
export class PostgresRealtimeBus implements RealtimeBus {
  private handlers: ((message: BusMessage) => void)[] = [];
  private listener: Client | null = null;
  /** Settles when the current connection attempt is listening (or has failed and scheduled a retry). */
  private listening: Promise<void> | null = null;
  private attempt = 0;
  private isClosed = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private readonly db: Queryable, private readonly listenerOptions: ClientConfig, private readonly channel = REALTIME_CHANNEL) {}

  async send(message: BusMessage) {
    await this.db.query("SELECT pg_notify($1, $2)", [this.channel, JSON.stringify(message)]);
  }

  onMessage(handler: (message: BusMessage) => void) {
    this.handlers.push(handler);
    if (!this.listener && !this.reconnectTimer) this.listening = this.listen();
  }

  /** Resolves once this process is listening (tests; the server does not wait). */
  async ready() {
    if (!this.listener && !this.reconnectTimer) this.listening = this.listen();
    await this.listening;
  }

  async close() {
    this.isClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const listener = this.listener;
    this.listener = null;
    await listener?.end().catch(() => undefined);
  }

  private async listen() {
    const listener = new Client(this.listenerOptions);
    this.listener = listener;
    listener.on("notification", notification => {
      const message = notification.channel === this.channel && notification.payload ? parseBusMessage(notification.payload) : null;
      if (message) for (const handler of this.handlers) handler(message);
    });
    listener.on("error", error => this.reconnect(listener, error));
    listener.on("end", () => this.reconnect(listener));
    try {
      await listener.connect();
      await listener.query(`LISTEN ${this.channel}`);
      this.attempt = 0;
    } catch (error) {
      this.reconnect(listener, error);
    }
  }

  private reconnect(listener: Client, error?: unknown) {
    if (this.isClosed || this.listener !== listener) return;
    this.listener = null;
    void listener.end().catch(() => undefined);
    const delay = RECONNECT_DELAYS_MS[Math.min(this.attempt, RECONNECT_DELAYS_MS.length - 1)];
    this.attempt += 1;
    console.error(`Live updates: lost the database listener; retrying in ${delay / 1000}s.`, error instanceof Error ? error.message : "");
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.listening = this.listen(); }, delay);
  }
}
