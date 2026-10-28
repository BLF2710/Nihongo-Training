import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { Client } from "pg";
import { backupFileName, backupsToPrune, manifestNameFor } from "../backup/backupFiles";
import type { BackupManifest } from "../backup/backupFiles";
import { backupDirectory, clientConfig, connectionFromEnv, countRows, postgresTool, runTool } from "../backup/postgresTools";

dotenv.config({ quiet: true });

// npm run db:backup — a compressed copy of the whole database in BACKUP_DIR (default: backups/ at the repository
// root, ignored by git), with the row count of every table. Only the newest BACKUP_KEEP backups are kept.
const DEFAULT_KEEP = 14;

async function backup() {
  const connection = connectionFromEnv(process.env);
  const keep = Number(process.env.BACKUP_KEEP ?? DEFAULT_KEEP);
  const directory = backupDirectory(process.env);
  mkdirSync(directory, { recursive: true });
  const name = backupFileName(connection.database, new Date());
  const file = path.join(directory, name);

  // The counts and the dump come from one snapshot, so a restore can be checked against them exactly.
  const client = new Client(clientConfig(connection));
  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const snapshot: string = (await client.query("SELECT pg_export_snapshot() AS id")).rows[0].id;
    const tables = await countRows(client);
    await runTool(postgresTool("pg_dump", process.env),
      ["--format=custom", "--compress=9", "--no-owner", `--snapshot=${snapshot}`, `--file=${file}`, `--dbname=${connection.database}`], connection);
    await client.query("COMMIT");
    const manifest: BackupManifest = { database: connection.database, createdAt: new Date().toISOString(), tables };
    writeFileSync(path.join(directory, manifestNameFor(name)), `${JSON.stringify(manifest, null, 2)}\n`);
    const rows = Object.values(tables).reduce((sum, count) => sum + count, 0);
    console.log(`Backed up ${connection.database}: ${Object.keys(tables).length} tables, ${rows} rows, ${Math.ceil(statSync(file).size / 1024)} KB`);
    console.log(`  ${file}`);
  } catch (error) {
    if (existsSync(file)) unlinkSync(file);
    throw error;
  } finally { await client.end(); }

  for (const old of backupsToPrune(connection.database, readdirSync(directory), keep)) {
    unlinkSync(path.join(directory, old));
    const manifest = path.join(directory, manifestNameFor(old));
    if (existsSync(manifest)) unlinkSync(manifest);
    console.log(`Removed old backup ${old} (keeping the newest ${keep}).`);
  }
}

backup().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
