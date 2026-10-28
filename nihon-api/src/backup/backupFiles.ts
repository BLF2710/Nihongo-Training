// Naming and keeping of database backup files. Pure: no file system or database.

export const BACKUP_EXTENSION = ".dump";
export const MANIFEST_EXTENSION = ".json";
const NAME_PATTERN = /^lingora-(.+)-(\d{8})-(\d{6})\.dump$/;

/** The table row counts recorded with a backup, taken from the same snapshot the backup was made from. */
export type BackupManifest = { database: string; createdAt: string; tables: Record<string, number> };

const pad = (value: number) => String(value).padStart(2, "0");

/** e.g. lingora-nihon_db-20261028-031500.dump (UTC), so names sort by age. */
export function backupFileName(database: string, at: Date): string {
  const day = `${at.getUTCFullYear()}${pad(at.getUTCMonth() + 1)}${pad(at.getUTCDate())}`;
  const time = `${pad(at.getUTCHours())}${pad(at.getUTCMinutes())}${pad(at.getUTCSeconds())}`;
  return `lingora-${database}-${day}-${time}${BACKUP_EXTENSION}`;
}

export const manifestNameFor = (backupName: string) => backupName.slice(0, -BACKUP_EXTENSION.length) + MANIFEST_EXTENSION;

/** This database's backups, newest first. Other files in the folder are ignored. */
export function backupsOf(database: string, fileNames: readonly string[]): string[] {
  return fileNames.filter(name => NAME_PATTERN.exec(name)?.[1] === database).sort().reverse();
}

/** The backups to delete so that only the newest `keep` remain. */
export function backupsToPrune(database: string, fileNames: readonly string[], keep: number): string[] {
  if (!Number.isInteger(keep) || keep < 1) throw new RangeError("Keep at least one backup.");
  return backupsOf(database, fileNames).slice(keep);
}

/** Tables whose restored row count differs from the backup's record (missing tables count as differing). */
export function compareRowCounts(expected: Record<string, number>, actual: Record<string, number>): string[] {
  return Object.keys({ ...expected, ...actual }).sort()
    .filter(table => expected[table] !== actual[table])
    .map(table => `${table}: backup had ${expected[table] ?? "no table"}, restore has ${actual[table] ?? "no table"}`);
}
