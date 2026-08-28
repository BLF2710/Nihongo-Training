import { Router } from "express";
import { getRandomKana, submitAnswer } from "../controllers/quiz.controller";
import { optionalAuthenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/random",
  getRandomKana
);

router.post(
  "/answer",
  optionalAuthenticate,
  submitAnswer
);

export default router;