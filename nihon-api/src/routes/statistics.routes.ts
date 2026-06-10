import { Router } from "express";

import { getStatistics }
from "../controllers/statistics.controller";

import { authenticate }
from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getStatistics
);

export default router;