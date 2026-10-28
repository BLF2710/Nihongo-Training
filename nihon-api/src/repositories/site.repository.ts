import { pool } from "../config/db";

// ---- System settings (single row)

/** Registration stays open unless an administrator explicitly closed it. */
export async function isRegistrationClosed(): Promise<boolean> {
  const result = await pool.query("SELECT registration_enabled FROM system_settings WHERE id=TRUE");
  return result.rows[0]?.registration_enabled === false;
}

export async function getPublicSettings() {
  const result = await pool.query("SELECT registration_enabled,announcement,announcement_audience FROM system_settings WHERE id=TRUE");
  return result.rows[0];
}

export async function getSettings() {
  const result = await pool.query("SELECT registration_enabled,announcement,announcement_audience,updated_at FROM system_settings WHERE id=TRUE");
  return result.rows[0];
}

export async function updateSettings(registrationEnabled: boolean, announcement: string, audience: "everyone" | "learners", updatedBy: number) {
  const result = await pool.query(
    "UPDATE system_settings SET registration_enabled=$1,announcement=$2,announcement_audience=$4,updated_at=NOW(),updated_by=$3 WHERE id=TRUE RETURNING registration_enabled,announcement,announcement_audience,updated_at",
    [registrationEnabled, announcement, updatedBy, audience]
  );
  return result.rows[0];
}

// ---- Content availability

export async function listContentAvailability(): Promise<{ content_key: string; enabled: boolean }[]> {
  const result = await pool.query("SELECT content_key,enabled FROM content_availability");
  return result.rows;
}

export async function listDisabledContentKeys(): Promise<string[]> {
  const result = await pool.query<{ content_key: string }>("SELECT content_key FROM content_availability WHERE enabled=FALSE");
  return result.rows.map(row => row.content_key);
}

export async function isAnyContentDisabled(keys: string[]): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM content_availability WHERE content_key=ANY($1::text[]) AND enabled=FALSE", [keys]);
  return Boolean(result.rowCount);
}

export async function setContentAvailability(key: string, enabled: boolean, updatedBy: number) {
  await pool.query(
    "INSERT INTO content_availability(content_key,enabled,updated_by) VALUES($1,$2,$3) ON CONFLICT(content_key) DO UPDATE SET enabled=EXCLUDED.enabled,updated_by=EXCLUDED.updated_by,updated_at=NOW()",
    [key, enabled, updatedBy]
  );
}

// ---- Deployment

export async function findLatestMigration() {
  const result = await pool.query("SELECT name, applied_at FROM schema_migrations ORDER BY name DESC LIMIT 1");
  return result.rows[0] ?? null;
}

/** How many migrations have been applied, and the database's size on disk. */
export async function findDatabaseFacts(): Promise<{ appliedMigrations: number; sizeBytes: number }> {
  const result = await pool.query("SELECT (SELECT COUNT(*) FROM schema_migrations)::int AS applied, pg_database_size(current_database())::bigint AS size");
  return { appliedMigrations: result.rows[0].applied, sizeBytes: Number(result.rows[0].size) };
}
