import { Router } from "express";
import { getToday, recordPractice, recordStudyTime } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
// A finished listening, speaking, reading, mock-exam, Particle Drop, Island Errands or Kana Wilds session (graded in the browser).
router.post("/practice", recordPractice);
// Active study time on learning pages, reported about once a minute, for the daily goal.
router.post("/study-time", recordStudyTime);
router.get("/today", getToday);
export default router;
