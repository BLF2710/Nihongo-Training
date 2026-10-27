import { Router } from "express";
import { addFlashcard, getFlashcards, getProgress, removeFlashcard, startPractice, submitAnswer } from "../controllers/kanji.controller";
import { authenticate, requireValidUserId } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.use(requireValidUserId);
router.get("/progress", getProgress);
router.post("/practice", startPractice);
router.post("/answer", submitAnswer);
// The learner's own list of kanji to study as flashcards.
router.get("/flashcards", getFlashcards);
router.put("/flashcards/:kanjiId", addFlashcard);
router.delete("/flashcards/:kanjiId", removeFlashcard);
export default router;
