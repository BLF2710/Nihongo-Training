import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { Client } from "pg";
import { clientConfig, connectionFromEnv, MAINTENANCE_DATABASE, postgresTool, runTool } from "../backup/postgresTools";

dotenv.config({ quiet: true });

// npm run db:restore -- <backup file> <new database name>
// Restores into a NEW database and never touches the live one. To recover, point DB_NAME at the restored database
// and restart the API; the old database stays as it was until you remove it yourself.
const DATABASE_NAME = /^[a-z_][a-z0-9_]{0,62}$/;

async function restore(file: string | undefined, target: string | undefined) {
  if (!file || !target) throw new Error("Usage: npm run db:restore -- <backup file> <new database name>");
  if (!existsSync(file)) throw new Error(`${file} was not found.`);
  if (!DATABASE_NAME.test(target)) throw new Error("Use a database name of lowercase letters, digits and underscores.");
  const connection = connectionFromEnv(process.env);
  if (target === connection.database) throw new Error(`${target} is the live database (DB_NAME). Restore into a new name instead.`);
  const admin = new Client(clientConfig(connection, MAINTENANCE_DATABASE));
  await admin.connect();
  try {
    if ((await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [target])).rowCount) throw new Error(`A database called ${target} already exists. Choose a new name.`);
    await admin.query(`CREATE DATABASE "${target}"`);
  } finally { await admin.end(); }
  await runTool(postgresTool("pg_restore", process.env), ["--no-owner", "--exit-on-error", `--dbname=${target}`, path.resolve(file)], connection);
  console.log(`Restored into ${target}. To use it: set DB_NAME=${target} in nihon-api/.env and restart the API.`);
}

restore(process.argv[2], process.argv[3]).catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
