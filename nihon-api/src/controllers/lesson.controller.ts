import { evaluateAchievements } from "../services/achievement.service";
import * as lessonCompletionService from "../services/lesson-completion.service";
import { findLesson } from "../services/lesson.service";
import { canAccessCourseLesson, getUserUnits } from "../services/unit.service";
import { action } from "../utils/action";
import { HttpError } from "../utils/http-error";
import { getUserId } from "../utils/request-user";

function requireLesson(lessonId: unknown) {
  const lesson = findLesson(lessonId);
  if (!lesson) throw new HttpError(404, "Lesson not found");
  return lesson;
}

export const listLessons = action(async (req, res) => {
  const lessons = (await getUserUnits(getUserId(req))).flatMap(unit => unit.lessons);
  return res.json({ lessons });
}, { label: "listLessons", message: "Server error" });

export const getLessonAccess = action(async (req, res) => {
  const lesson = requireLesson(req.params.lessonId);
  const access = await canAccessCourseLesson(getUserId(req), lesson);
  return res.status(access.allowed ? 200 : 403).json({ lesson, ...access });
});

export const completeLesson = action(async (req, res) => {
  const userId = getUserId(req);
  const lesson = requireLesson(req.params.lessonId);
  const { completion, challenge } = await lessonCompletionService.completeLesson(userId, lesson, req.body);
  const achievements = await evaluateAchievements(userId);
  return res.json({ completion, challenge, achievements });
}, { label: "completeLesson", message: "Server error" });
