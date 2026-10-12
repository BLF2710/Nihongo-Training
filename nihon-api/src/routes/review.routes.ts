import { Router } from "express";
import { checkReviewAnswer, getReviewQuestions } from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/units/:unitId/questions", getReviewQuestions);
router.post("/units/:unitId/check", checkReviewAnswer);
export default router;
