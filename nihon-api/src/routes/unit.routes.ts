import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getAssessment, listUnits, submitAssessment } from "../controllers/unit.controller";

const router = Router();
router.use(authenticate);
router.get("/", listUnits);
router.get("/:unitId/assessment", getAssessment);
router.post("/:unitId/assessment", submitAssessment);
export default router;
