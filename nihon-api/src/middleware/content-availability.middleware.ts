import { Request, Response, NextFunction } from "express";
import { isAnyContentDisabled } from "../repositories/site.repository";

/** Managed-content keys guarding an API path (relative to /api); empty when the path is not managed. */
export function contentKeysForPath(path: string): string[] {
  const keys: string[] = [];
  const lesson = path.match(/^\/lessons\/([^/]+)\/(access|complete)$/);
  const assessment = path.match(/^\/units\/([^/]+)\/assessment$/);
  if (lesson) keys.push(`lesson:${decodeURIComponent(lesson[1]!)}`);
  if (assessment) keys.push(`assessment:${decodeURIComponent(assessment[1]!)}`);
  if (path === "/quiz/random" || path === "/quiz/answer") keys.push("kana-practice");
  if (path === "/kanji/practice" || path === "/kanji/answer") keys.push("kanji-practice");
  if (path.startsWith("/english/")) keys.push("english-games");
  return keys;
}

export async function enforceContentAvailability(req: Request, res: Response, next: NextFunction) {
  const keys = contentKeysForPath(req.path);
  if (!keys.length) return next();
  try {
    if (await isAnyContentDisabled(keys)) return res.status(403).json({ message: "This activity is temporarily unavailable." });
    next();
  } catch (error) {
    console.error(error);
    res.status(503).json({ message: "Activity availability could not be checked." });
  }
}
