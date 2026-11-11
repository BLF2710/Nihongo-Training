import { Router } from "express";
import { catchKana, chooseStarter, getCollection } from "../controllers/kana-wilds.controller";
import { authenticate } from "../middleware/auth.middleware";

// Kana Wilds: the learner's collection of hiragana. Battles themselves are reported through /activity/practice.
const router = Router();
router.use(authenticate);
router.get("/collection", getCollection);
router.post("/starter", chooseStarter);
router.post("/catches", catchKana);
export default router;
