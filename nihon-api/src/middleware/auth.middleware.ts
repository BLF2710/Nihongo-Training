import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { findSessionState } from "../repositories/user.repository";
import { readSessionToken } from "../services/session-token";
import type { SessionClaims } from "../services/session-token";
import { getUserId, setRequestUser } from "../utils/request-user";

// A token is refused with this code when it no longer works: revoked by its account (a newer token version),
// expired, or signed with a previous JWT_SECRET. The web app then signs the learner out and explains why.
export const SESSION_EXPIRED = { message: "Your session has ended. Please sign in again.", code: "session_expired" } as const;

function readBearerToken(header: string): ReturnType<typeof readSessionToken> {
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new Error("Invalid token");
  return readSessionToken(token);
}

type SessionCheck = "active" | "inactive" | "revoked";

async function checkSession(claims: SessionClaims): Promise<SessionCheck> {
  const state = await findSessionState(claims.userId);
  if (!state || state.status !== "active") return "inactive";
  return state.tokenVersion === claims.tokenVersion ? "active" : "revoked";
}

// Optional routes treat a missing or invalid token as a guest; a valid token of an inactive account is always refused.
async function identify(req: Request, res: Response, next: NextFunction, optional: boolean) {
  const header = req.headers.authorization;
  if (!header) return optional ? next() : res.status(401).json({ message: "No token" });
  let claims: SessionClaims & JwtPayload;
  try {
    claims = readBearerToken(header);
  } catch {
    // An expired token, or one signed with a previous JWT_SECRET, ends the session like a revoked one.
    return optional ? next() : res.status(401).json(SESSION_EXPIRED);
  }
  try {
    const session = await checkSession(claims);
    if (session === "inactive") return res.status(403).json({ message: "This account is inactive" });
    if (session === "revoked") return optional ? next() : res.status(401).json(SESSION_EXPIRED);
    setRequestUser(req, claims);
    next();
  } catch (error) {
    console.error("Account status check failed", error);
    res.status(503).json({ message: "Account access could not be checked. Try again later." });
  }
}

/**
 * True for a valid, current token of an active account. Never rejects the request: public routes use it to decide
 * how much to show, so a missing, expired, revoked or suspended token simply counts as a guest.
 */
export async function isSignedIn(req: Request): Promise<boolean> {
  const header = req.headers.authorization;
  if (!header) return false;
  try {
    return await checkSession(readBearerToken(header)) === "active";
  } catch {
    return false;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  return identify(req, res, next, false);
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  return identify(req, res, next, true);
}

/** Rejects tokens whose user ID is not a positive integer. */
export function requireValidUserId(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!Number.isSafeInteger(userId) || userId <= 0) return res.status(401).json({ message: "Invalid user." });
  next();
}
