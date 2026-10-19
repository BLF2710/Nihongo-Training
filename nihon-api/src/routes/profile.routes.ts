import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { changePassword, deactivateAccount, getMyProfile, updateMyProfile, updateTimeZone } from "../controllers/profile.controller";

const router = Router();
router.use(authenticate);
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.put("/me/password", changePassword);
router.put("/me/time-zone", updateTimeZone);
router.post("/me/deactivate", deactivateAccount);
export default router;
