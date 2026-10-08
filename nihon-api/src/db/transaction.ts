import type { Pool, PoolClient } from "pg";
import { pool } from "../config/db";

/** Anything that can run a query: the shared pool or a transaction's client. */
export type Queryable = Pool | PoolClient;

/** Runs `work` in one transaction: commits its result, rolls back and rethrows on any error. */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
