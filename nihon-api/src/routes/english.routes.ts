import { Router } from "express";
import {
  getWordMatchGame,
  getWordScrambleGame,
  submitGameScore
} from "../controllers/english.controller";
import { optionalAuthenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/games/match", getWordMatchGame);
router.get("/games/scramble", getWordScrambleGame);
router.post("/games/score", optionalAuthenticate, submitGameScore);

export default router;
