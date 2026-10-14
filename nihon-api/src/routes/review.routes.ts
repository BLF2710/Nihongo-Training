import { Router } from "express";
import { checkReviewAnswer, getLevelReviewQuestions, getReviewQuestions } from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/units/:unitId/questions", getReviewQuestions);
router.get("/levels/:level/questions", getLevelReviewQuestions);
router.post("/units/:unitId/check", checkReviewAnswer);
export default router;
