import { Router } from "express";
import type { ErrorRequestHandler } from "express";
import {
  createQuestion, deleteQuestion, getAccess, getAnalytics, getOverview, getSettings, listContent, listQuestions, listUsers,
  updateContent, updateLessonAccess, updateQuestion, updateSettings, updateUser,
} from "../controllers/admin.controller";
import { adminGetSupport, adminListSupport, adminReplySupport, adminSetSupportStatus } from "../controllers/communication.controller";
import {
  discardLessonDraft, exportLessonEdits, getLessonEdit, listAuditLog, listLessonEdits, listReports, publishLesson, resolveLearnerReports, revertLesson, saveLessonDraft,
} from "../controllers/moderation.controller";
import { requireAdmin } from "../middleware/admin.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
// Any signed-in account may ask whether it has administrator access.
router.get("/access", getAccess);
router.use(requireAdmin);
router.get("/overview", getOverview);
router.get("/analytics", getAnalytics);
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
router.get("/audit-log", listAuditLog);
router.get("/reports", listReports);
router.post("/reports/:userId/resolve", resolveLearnerReports);
router.get("/lessons/edits", listLessonEdits);
router.get("/lessons/export", exportLessonEdits);
router.get("/lessons/:lessonId/edit", getLessonEdit);
router.put("/lessons/:lessonId/draft", saveLessonDraft);
router.delete("/lessons/:lessonId/draft", discardLessonDraft);
router.post("/lessons/:lessonId/publish", publishLesson);
router.delete("/lessons/:lessonId/published", revertLesson);

const handleUnexpectedError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "The administrator request could not be completed." });
};
router.use(handleUnexpectedError);
export default router;
