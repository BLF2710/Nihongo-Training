import { Router } from "express";
import { enrollSrsItems, getSrsQueue, getSrsSummary, reviewSrsCard } from "../controllers/srs.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/summary", getSrsSummary);
router.get("/queue", getSrsQueue);
// Words from completed lessons and Kanji join the learner's deck; cards already there are untouched.
router.post("/cards", enrollSrsItems);
router.post("/reviews", reviewSrsCard);
export default router;
