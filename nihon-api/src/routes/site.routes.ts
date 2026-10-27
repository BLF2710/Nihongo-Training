import { Router } from "express";
import { getPublishedLessonEdits } from "../controllers/moderation.controller";
import { getSite } from "../controllers/site.controller";

const router = Router();
router.get("/", getSite);
// Lesson content published from the admin area, applied by the site over the built-in lessons (no sign-in needed).
router.get("/lesson-edits", getPublishedLessonEdits);
export default router;
