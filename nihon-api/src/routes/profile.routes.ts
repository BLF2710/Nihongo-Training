import express, { Router } from "express";
import type { ErrorRequestHandler } from "express";
import { rateLimit } from "../middleware/rate-limit.middleware";
import type { RateLimitRule } from "../middleware/rate-limit.middleware";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "../services/avatar.service";
import { getUserId } from "../utils/request-user";
import { authenticate } from "../middleware/auth.middleware";
import { getSocialSettings, updateSocialSettings } from "../controllers/social.controller";
import { changePassword, deactivateAccount, getMyProfile, removeMyAvatar, updateMyProfile, updateTimeZone, uploadMyAvatar } from "../controllers/profile.controller";

const HOUR = 60 * 60 * 1000;
const AVATAR_UPLOADS: RateLimitRule = { name: "avatar-upload", windowMs: HOUR, max: 20, key: req => String(getUserId(req)), message: "You've changed your picture a lot. Please try again later." };

const router = Router();
router.use(authenticate);
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.put("/me/password", changePassword);
router.put("/me/time-zone", updateTimeZone);
router.put("/me/avatar", rateLimit(AVATAR_UPLOADS), express.raw({ type: ACCEPTED_IMAGE_TYPES, limit: MAX_UPLOAD_BYTES }), uploadMyAvatar);
router.delete("/me/avatar", removeMyAvatar);
router.get("/me/social", getSocialSettings);
router.put("/me/social", updateSocialSettings);
router.post("/me/deactivate", deactivateAccount);
// An upload over the size limit is refused before it reaches the controller.
const handleUploadError: ErrorRequestHandler = (error, _req, res, next) => {
  if ((error as { type?: string }).type === "entity.too.large") return res.status(413).json({ message: "The picture is too large (3 MB at most)." });
  return next(error);
};
router.use(handleUploadError);
export default router;
