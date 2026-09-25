import { Request, Response } from "express";
import { LESSONS } from "../services/lesson.service";
import { canAccessCourseLesson, getUserUnits } from "../services/unit.service";
import { awardXP } from "../services/xp.service";
import { evaluateAchievements } from "../services/achievement.service";

const currentUserId = (req: Request) => Number((req as any).user.userId);
export async function listLessons(req: Request, res: Response) {
  try {
    const userId = currentUserId(req);
    const lessons = (await getUserUnits(userId)).flatMap(unit => unit.lessons);
    return res.json({ lessons });
  } catch (error) { console.error("listLessons", error); return res.status(500).json({ message: "Server error" }); }
}
export async function getLessonAccess(req: Request, res: Response) {
  const lesson = LESSONS.find((item) => item.id === req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  const access = await canAccessCourseLesson(currentUserId(req), lesson);
  return res.status(access.allowed ? 200 : 403).json({ lesson, ...access });
}
export async function completeLesson(req: Request, res: Response) {
  try {
    const userId = currentUserId(req); const lesson = LESSONS.find((item) => item.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    const access = await canAccessCourseLesson(userId, lesson); if (!access.allowed) return res.status(403).json({ message: "Lesson is locked", reasons: access.reasons });
    const score = Number(req.body.challengeScore); if (!Number.isInteger(score) || score < 0 || score > 100) return res.status(400).json({ message: "Challenge score must be between 0 and 100" });
    await (await import("../config/db")).pool.query("INSERT INTO lesson_progress (user_id,lesson_id,challenge_score) VALUES ($1,$2,$3) ON CONFLICT (user_id,lesson_id) DO UPDATE SET challenge_score=GREATEST(lesson_progress.challenge_score, EXCLUDED.challenge_score), updated_at=NOW()", [userId, lesson.id, score]);
    const completion = await awardXP(userId, 50, "lesson_completion", lesson.id);
    const challenge = score === 100 ? await awardXP(userId, 25, "lesson_challenge", `${lesson.id}:perfect`) : null;
    const achievements = await evaluateAchievements(userId);
    return res.json({ completion, challenge, achievements });
  } catch (error) { console.error("completeLesson", error); return res.status(500).json({ message: "Server error" }); }
}
