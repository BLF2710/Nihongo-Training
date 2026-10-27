import { Router } from "express";
import { getMockExamHistory, submitMockExam } from "../controllers/mock-exam.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/:level/results", getMockExamHistory);
router.post("/:level/results", submitMockExam);
export default router;
