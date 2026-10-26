import jwt from "jsonwebtoken";

// Sign-in tokens. Each carries the account's token version (`tv`); raising the version in the database makes
// every older token invalid ("log out everywhere", password change or reset).

const TOKEN_LIFETIME = "7d";

export type SessionClaims = { userId: number; tokenVersion: number };

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set.");
  return value;
}

export function issueSessionToken(account: { id: number; tokenVersion: number }): string {
  return jwt.sign({ userId: account.id, tv: account.tokenVersion }, secret(), { expiresIn: TOKEN_LIFETIME });
}

/** Checks the signature and expiry. Tokens issued before versions existed count as version 0. */
export function readSessionToken(token: string): SessionClaims & jwt.JwtPayload {
  const payload = jwt.verify(token, secret());
  if (typeof payload === "string" || !Number.isSafeInteger(payload.userId) || payload.userId < 1) throw new Error("Invalid token");
  const tokenVersion = payload.tv === undefined ? 0 : Number(payload.tv);
  if (!Number.isSafeInteger(tokenVersion) || tokenVersion < 0) throw new Error("Invalid token");
  return { ...payload, userId: payload.userId, tokenVersion };
}
