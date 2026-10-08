import { Router } from "express";
import type { ErrorRequestHandler } from "express";
import {
  getAccess, getOverview, getSettings, listContent, listUsers, updateContent, updateSettings, updateUser,
} from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/admin.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
// Any signed-in account may ask whether it has administrator access.
router.get("/access", getAccess);
router.use(requireAdmin);
router.get("/overview", getOverview);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/content", listContent);
router.put("/content/:key", updateContent);

const handleUnexpectedError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "The administrator request could not be completed." });
};
router.use(handleUnexpectedError);
export default router;
