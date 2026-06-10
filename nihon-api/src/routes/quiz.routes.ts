import { Router } from "express";
import { getRandomKana, submitAnswer } from "../controllers/quiz.controller";
import { authenticate } from "../middleware/auth.middleware";


const router = Router();

router.get(
  "/random",
  getRandomKana
);

router.post(
  "/answer",
  authenticate,
  submitAnswer
);


export default router;