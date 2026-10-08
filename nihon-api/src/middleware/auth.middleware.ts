import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findUserStatus } from "../repositories/user.repository";
import { getUserId, setRequestUser } from "../utils/request-user";

function verifyBearerToken(header: string): jwt.JwtPayload {
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new Error("Invalid token");
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  if (typeof payload === "string" || !Number.isSafeInteger(payload.userId) || payload.userId < 1) throw new Error("Invalid token");
  return payload;
}

// Optional routes treat a missing or invalid token as a guest; a valid token of an inactive account is always refused.
async function identify(req: Request, res: Response, next: NextFunction, optional: boolean) {
  const header = req.headers.authorization;
  if (!header) return optional ? next() : res.status(401).json({ message: "No token" });
  let decoded: jwt.JwtPayload;
  try {
    decoded = verifyBearerToken(header);
  } catch {
    return optional ? next() : res.status(401).json({ message: "Invalid token" });
  }
  try {
    if (await findUserStatus(decoded.userId) !== "active") return res.status(403).json({ message: "This account is inactive" });
    setRequestUser(req, decoded);
    next();
  } catch (error) {
    console.error("Account status check failed", error);
    res.status(503).json({ message: "Account access could not be checked. Try again later." });
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
