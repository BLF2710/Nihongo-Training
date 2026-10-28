import { readdirSync } from "node:fs";
import path from "node:path";
import { config } from "../config/env";
import { findDatabaseFacts, findLatestMigration } from "../repositories/site.repository";
import { describeMailSetup } from "./mail/mailer";
import { countOpenStreams } from "./realtime.service";

// Next to the compiled code; from the working directory where __dirname does not exist (the API test harness).
const MIGRATIONS_DIRECTORY = typeof __dirname === "string" ? path.resolve(__dirname, "../../migrations") : path.resolve("migrations");

function availableMigrations(): number {
  try { return readdirSync(MIGRATIONS_DIRECTORY).filter(name => name.endsWith(".sql")).length; }
  catch { return 0; }
}

/**
 * What the status page shows: the API, the database, live updates and which outside services are set up. Only
 * whether something is configured (and the mail server's host) is reported, never a key or password.
 */
export async function getSystemStatus(env: NodeJS.ProcessEnv = process.env) {
  const settings = config();
  const started = Date.now();
  const [facts, latestMigration] = await Promise.all([findDatabaseFacts(), findLatestMigration()]);
  const latencyMs = Date.now() - started;
  const migrationFiles = availableMigrations();
  return {
    checkedAt: new Date().toISOString(),
    api: { environment: settings.isProduction ? "production" : "development", nodeVersion: process.version, uptimeSeconds: Math.floor(process.uptime()) },
    database: { latencyMs, sizeBytes: facts.sizeBytes, appliedMigrations: facts.appliedMigrations, migrationFiles, latestMigration },
    realtime: { sharedState: settings.sharedState, ...countOpenStreams() },
    integrations: {
      email: { configured: settings.mail.provider === "smtp", detail: describeMailSetup(settings.mail) },
      google: { configured: Boolean(settings.googleClientId) },
      azureSpeech: { configured: Boolean(env.AZURE_SPEECH_KEY?.trim() && env.AZURE_SPEECH_ENDPOINT?.trim()) },
      anthropic: { configured: Boolean(env.ANTHROPIC_API_KEY?.trim()) },
    },
  };
}
