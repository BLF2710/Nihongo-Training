import { Router } from "express";

import { getEnglishPracticeStatistics, getStatistics, getStatisticsOverview }
from "../controllers/statistics.controller";

import { authenticate }
from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getStatistics
);

router.get("/overview", authenticate, getStatisticsOverview);
router.get("/english-practice", authenticate, getEnglishPracticeStatistics);

export default router;