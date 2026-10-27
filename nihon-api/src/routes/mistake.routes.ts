import { Router } from "express";
import { deleteMistake, getMistakes, practiseMistake, recordLessonMistakes } from "../controllers/mistake.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/", getMistakes);
// Lesson challenges are graded in the browser; reviews, assessments and mock exams add mistakes on the server.
router.post("/lessons/:lessonId", recordLessonMistakes);
router.post("/:mistakeId/practice", practiseMistake);
router.delete("/:mistakeId", deleteMistake);
export default router;
