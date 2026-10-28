import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { Client } from "pg";
import { backupsOf, compareRowCounts, manifestNameFor } from "../backup/backupFiles";
import type { BackupManifest } from "../backup/backupFiles";
import { backupDirectory, clientConfig, connectionFromEnv, countRows, MAINTENANCE_DATABASE, postgresTool, runTool } from "../backup/postgresTools";

dotenv.config({ quiet: true });

// npm run db:verify-backup [file] — restores a backup (default: the newest) into a temporary database, checks that
// every table has the row count recorded when the backup was made, then drops the temporary database.
// The live database is only read from, never changed.

async function verify(fileArgument: string | undefined) {
  const connection = connectionFromEnv(process.env);
  const directory = backupDirectory(process.env);
  const latest = existsSync(directory) ? backupsOf(connection.database, readdirSync(directory))[0] : undefined;
  const file = fileArgument ? path.resolve(fileArgument) : latest && path.join(directory, latest);
  if (!file || !existsSync(file)) throw new Error("No backup to check. Make one first: npm run db:backup");
  const manifestFile = path.join(path.dirname(file), manifestNameFor(path.basename(file)));
  if (!existsSync(manifestFile)) throw new Error(`${manifestFile} is missing: it holds the row counts to compare with.`);
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8")) as BackupManifest;

  const scratch = `${connection.database}_restore_check`;
  const admin = new Client(clientConfig(connection, MAINTENANCE_DATABASE));
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${scratch}"`);
    await admin.query(`CREATE DATABASE "${scratch}"`);
    console.log(`Restoring ${path.basename(file)} into a temporary database (${scratch})…`);
    await runTool(postgresTool("pg_restore", process.env), ["--no-owner", "--exit-on-error", `--dbname=${scratch}`, file], connection);
    const restored = new Client(clientConfig(connection, scratch));
    await restored.connect();
    const actual = await countRows(restored).finally(() => restored.end());
    const differences = compareRowCounts(manifest.tables, actual);
    if (differences.length) throw new Error(`The restore does not match the backup:\n  ${differences.join("\n  ")}`);
    const rows = Object.values(actual).reduce((sum, count) => sum + count, 0);
    console.log(`Restore works: ${Object.keys(actual).length} tables and ${rows} rows match the backup from ${manifest.createdAt}.`);
  } finally {
    await admin.query(`DROP DATABASE IF EXISTS "${scratch}"`).catch(() => undefined);
    await admin.end();
  }
}

verify(process.argv[2]).catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
