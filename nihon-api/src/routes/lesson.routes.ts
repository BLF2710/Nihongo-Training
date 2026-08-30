import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { completeLesson, getLessonAccess, listLessons } from "../controllers/lesson.controller";
const router = Router();
router.use(authenticate);
router.get("/", listLessons);
router.get("/:lessonId/access", getLessonAccess);
router.post("/:lessonId/complete", completeLesson);
export default router;
