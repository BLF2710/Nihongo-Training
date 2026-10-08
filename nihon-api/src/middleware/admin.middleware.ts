import { Request, Response, NextFunction } from "express";
import { findUserRoleAndStatus } from "../repositories/user.repository";
import { getUserId } from "../utils/request-user";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findUserRoleAndStatus(getUserId(req));
    if (user?.role !== "admin" || user?.status !== "active") return res.status(403).json({ message: "Administrator access is required." });
    next();
  } catch (error) {
    console.error("Admin authorization failed", error);
    res.status(503).json({ message: "Administrator access could not be checked. Try again later." });
  }
}
