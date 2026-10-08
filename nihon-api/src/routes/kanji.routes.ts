import { Router } from "express";
import { getProgress, startPractice, submitAnswer } from "../controllers/kanji.controller";
import { authenticate, requireValidUserId } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.use(requireValidUserId);
router.get("/progress", getProgress);
router.post("/practice", startPractice);
router.post("/answer", submitAnswer);
export default router;
