import { Router } from "express";

import { getStatistics, getStatisticsOverview }
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

export default router;