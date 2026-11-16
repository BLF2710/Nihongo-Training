import { Router } from "express";
import { getTravellerLook, saveTravellerLook } from "../controllers/traveller.controller";
import { authenticate } from "../middleware/auth.middleware";

// The learner's traveller: what the character they walk the islands with looks like.
const router = Router();
router.use(authenticate);
router.get("/look", getTravellerLook);
router.put("/look", saveTravellerLook);
export default router;
