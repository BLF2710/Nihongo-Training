import { Router } from "express";
import { checkEnglishReviewAnswer, checkReviewAnswer, getEnglishReviewQuestions, getLevelReviewQuestions, getReviewQuestions } from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/units/:unitId/questions", getReviewQuestions);
router.get("/levels/:level/questions", getLevelReviewQuestions);
router.post("/units/:unitId/check", checkReviewAnswer);
// The English review: a unit (english-a2-unit-1) or a whole level (english-a2), from the lessons completed there.
router.get("/english/:scope/questions", getEnglishReviewQuestions);
router.post("/english/check", checkEnglishReviewAnswer);
export default router;
