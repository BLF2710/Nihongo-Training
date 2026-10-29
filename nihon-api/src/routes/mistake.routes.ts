import { Router } from "express";
import { deleteMistake, getMistakes, getWeakCharacters, practiseMistake, recordLessonMistakes } from "../controllers/mistake.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/", getMistakes);
// Kana and Kanji the learner still misses often (from their answer counts), to practise.
router.get("/weak-characters", getWeakCharacters);
// Lesson challenges are graded in the browser; reviews, assessments and mock exams add mistakes on the server.
router.post("/lessons/:lessonId", recordLessonMistakes);
router.post("/:mistakeId/practice", practiseMistake);
router.delete("/:mistakeId", deleteMistake);
export default router;
