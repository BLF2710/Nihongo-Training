import { Router } from "express";
import type { ErrorRequestHandler } from "express";
import {
  createQuestion, deleteQuestion, getAccess, getOverview, getSettings, listContent, listQuestions, listUsers,
  updateContent, updateLessonAccess, updateQuestion, updateSettings, updateUser,
} from "../controllers/admin.controller";
import { adminGetSupport, adminListSupport, adminReplySupport, adminSetSupportStatus } from "../controllers/communication.controller";
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
router.put("/users/:id/lesson-access", updateLessonAccess);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/content", listContent);
router.put("/content/:key", updateContent);
router.get("/questions", listQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);
router.get("/support", adminListSupport);
router.get("/support/:id", adminGetSupport);
router.post("/support/:id/messages", adminReplySupport);
router.patch("/support/:id", adminSetSupportStatus);

const handleUnexpectedError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "The administrator request could not be completed." });
};
router.use(handleUnexpectedError);
export default router;
