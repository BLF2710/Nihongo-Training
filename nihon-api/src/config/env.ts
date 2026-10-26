// Server configuration from environment variables (nihon-api/.env), read and checked in one place.

const DEFAULT_PORT = 5000;
const DEFAULT_APP_URL = "http://localhost:5173";
// Local development addresses of the web app (Vite), allowed when CORS_ORIGINS isn't set outside production.
const DEVELOPMENT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173"];

export type MailProvider = "smtp" | "log" | "memory";

export type ServerConfig = {
  isProduction: boolean;
  port: number;
  /** Web app addresses allowed to call the API from a browser. */
  corsOrigins: string[];
  /** Base address of the web app, used in links sent by email. */
  appUrl: string;
  /** Number of proxies in front of the API (for the client address used by rate limits); 0 when none. */
  trustProxyHops: number;
  mail: { provider: MailProvider; from: string; smtpUrl: string | null };
  /** OAuth client id for "Sign in with Google" (public, shown to browsers); null switches it off. */
  googleClientId: string | null;
};

function parsePort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`PORT must be a whole number from 1 to 65535 (got "${value}").`);
  return port;
}

function parseOrigins(value: string | undefined, isProduction: boolean): string[] {
  const origins = (value ?? "").split(",").map(origin => origin.trim().replace(/\/+$/, "")).filter(Boolean);
  for (const origin of origins) if (!/^https?:\/\/[^/\s]+$/.test(origin)) throw new Error(`CORS_ORIGINS entries must look like https://example.com (got "${origin}").`);
  if (origins.length) return origins;
  if (isProduction) throw new Error("Set CORS_ORIGINS to the web app's address in production.");
  return DEVELOPMENT_ORIGINS;
}

function parseMail(env: NodeJS.ProcessEnv, isProduction: boolean): ServerConfig["mail"] {
  const requested = env.MAIL_PROVIDER?.trim();
  const smtpUrl = env.SMTP_URL?.trim() || null;
  const provider: MailProvider = requested === "smtp" || requested === "log" || requested === "memory" ? requested : smtpUrl ? "smtp" : "log";
  if (requested && provider !== requested) throw new Error(`MAIL_PROVIDER must be smtp, log or memory (got "${requested}").`);
  if (provider === "smtp" && !smtpUrl) throw new Error("MAIL_PROVIDER=smtp needs SMTP_URL, e.g. smtps://user:password@smtp.example.com:465.");
  if (provider !== "smtp" && isProduction) throw new Error("Production needs real email: set SMTP_URL (password reset and verification links are sent by email).");
  return { provider, smtpUrl, from: env.MAIL_FROM?.trim() || "LingoHub <no-reply@localhost>" };
}

function parseGoogleClientId(value: string | undefined): string | null {
  const clientId = value?.trim();
  if (!clientId) return null;
  if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw new Error("GOOGLE_CLIENT_ID must be a Google OAuth client id ending in .apps.googleusercontent.com.");
  return clientId;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const isProduction = env.NODE_ENV === "production";
  const appUrl = (env.APP_URL?.trim() || DEFAULT_APP_URL).replace(/\/+$/, "");
  if (!/^https?:\/\//.test(appUrl)) throw new Error(`APP_URL must be the web app's address, e.g. https://example.com (got "${appUrl}").`);
  const trustProxyHops = Number(env.TRUST_PROXY ?? 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) throw new Error("TRUST_PROXY must be the number of proxies in front of the API (0 when none).");
  return {
    isProduction,
    port: parsePort(env.PORT),
    corsOrigins: parseOrigins(env.CORS_ORIGINS, isProduction),
    appUrl,
    trustProxyHops,
    mail: parseMail(env, isProduction),
    googleClientId: parseGoogleClientId(env.GOOGLE_CLIENT_ID),
  };
}

let cached: ServerConfig | null = null;
/** The configuration of this process, read once. */
export const config = (): ServerConfig => (cached ??= loadConfig());
