import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

type RequestWithUser = Request & { user?: JwtPayload };

export function setRequestUser(req: Request, user: JwtPayload) {
  (req as RequestWithUser).user = user;
}

export function getRequestUser(req: Request) {
  return (req as RequestWithUser).user;
}

/** ID of the signed-in user on routes behind `authenticate`. */
export function getUserId(req: Request): number {
  return Number(getRequestUser(req)?.userId);
}

/** ID of the signed-in user on routes behind `optionalAuthenticate`; undefined for guests. */
export function getOptionalUserId(req: Request): number | undefined {
  return getRequestUser(req)?.userId;
}
