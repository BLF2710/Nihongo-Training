import { Router } from "express";
import { recordPractice } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
// A finished listening, speaking, reading or mock-exam session (graded in the browser).
router.post("/practice", recordPractice);
export default router;
