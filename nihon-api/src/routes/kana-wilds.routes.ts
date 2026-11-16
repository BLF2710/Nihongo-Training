import { Router } from "express";
import { catchKana, chooseStarter, getCollection, recordChallengerWin } from "../controllers/kana-wilds.controller";
import { authenticate } from "../middleware/auth.middleware";

// Kana Wilds: the learner's collection of hiragana, and the challengers beaten. Battles themselves are reported through /activity/practice.
const router = Router();
router.use(authenticate);
router.get("/collection", getCollection);
router.post("/starter", chooseStarter);
router.post("/catches", catchKana);
router.post("/challengers/:challengerId/wins", recordChallengerWin);
export default router;
