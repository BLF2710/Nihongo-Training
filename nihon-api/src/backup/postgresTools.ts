import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";
import type { ClientConfig } from "pg";

export type Connection = { host: string; port: number; user: string; password: string; database: string };

export class BackupToolError extends Error {}

/** Connected to for creating and dropping databases (every PostgreSQL server has it). */
export const MAINTENANCE_DATABASE = "postgres";

/** Where backups go: BACKUP_DIR, or backups/ at the repository root (ignored by git). */
export const backupDirectory = (env: NodeJS.ProcessEnv) => path.resolve(env.BACKUP_DIR ?? path.join(__dirname, "../../../backups"));

/** The database settings from the API's environment (nihon-api/.env). */
export function connectionFromEnv(env: NodeJS.ProcessEnv): Connection {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = env;
  if (!DB_HOST || !DB_USER || !DB_NAME) throw new BackupToolError("DB_HOST, DB_USER and DB_NAME must be set (nihon-api/.env).");
  return { host: DB_HOST, port: Number(DB_PORT ?? 5432), user: DB_USER, password: DB_PASSWORD ?? "", database: DB_NAME };
}

export const clientConfig = (connection: Connection, database = connection.database): ClientConfig =>
  ({ host: connection.host, port: connection.port, user: connection.user, password: connection.password, database });

/** pg_dump / pg_restore from PG_BIN, or from PATH. */
export function postgresTool(name: "pg_dump" | "pg_restore", env: NodeJS.ProcessEnv): string {
  const executable = process.platform === "win32" ? `${name}.exe` : name;
  if (env.PG_BIN) {
    const candidate = path.join(env.PG_BIN, executable);
    if (!existsSync(candidate)) throw new BackupToolError(`${candidate} was not found. Set PG_BIN to PostgreSQL's bin folder.`);
    return candidate;
  }
  return executable;
}

/**
 * Runs a PostgreSQL tool. The password goes through the PGPASSWORD environment variable of that one process, never
 * on the command line (where other users of the machine could see it).
 */
export function runTool(tool: string, args: string[], connection: Connection): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(tool, [`--host=${connection.host}`, `--port=${connection.port}`, `--username=${connection.user}`, "--no-password", ...args],
      { env: { ...process.env, PGPASSWORD: connection.password }, stdio: ["ignore", "inherit", "pipe"] });
    let errors = "";
    child.stderr.on("data", chunk => { errors += String(chunk); });
    child.on("error", error => reject(new BackupToolError(`${tool} could not be started (${error.message}). Set PG_BIN to PostgreSQL's bin folder.`)));
    child.on("close", code => code === 0 ? resolve() : reject(new BackupToolError(`${path.basename(tool)} failed (exit ${code}): ${errors.trim().slice(0, 800)}`)));
  });
}

/** Exact row counts of every table in the public schema, as seen by this client's transaction. */
export async function countRows(client: Client): Promise<Record<string, number>> {
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  const counts: Record<string, number> = {};
  for (const { tablename } of tables.rows as { tablename: string }[]) {
    const result = await client.query(`SELECT COUNT(*)::bigint AS n FROM public."${tablename.replace(/"/g, '""')}"`);
    counts[tablename] = Number(result.rows[0].n);
  }
  return counts;
}
