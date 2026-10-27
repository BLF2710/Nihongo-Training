import { Router } from "express";
import { getAvatar } from "../controllers/avatar.controller";

// Profile pictures by their random address; no sign-in, so <img> tags can load them.
const router = Router();
router.get("/:file", getAvatar);
export default router;
