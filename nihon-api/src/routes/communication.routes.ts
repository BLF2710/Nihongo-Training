import { Router } from "express";
import {
  askAssistant, blockDirect, getAssistant, getDirect, getInbox, getSupport, listDirect, listSupport, replySupport, reportDirect,
  sendDirect, startAssistantChat, startDirect, startSupport,
} from "../controllers/communication.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted at /api. Direct messages (/messages) and the study assistant (/assistant) can be switched off
// by an administrator like any other activity; Help & support (/support) always stays open.
const router = Router();
router.use(["/inbox", "/messages", "/support", "/assistant"], authenticate);

router.get("/inbox", getInbox);

router.get("/messages/conversations", listDirect);
router.post("/messages/conversations", startDirect);
router.get("/messages/conversations/:id", getDirect);
router.post("/messages/conversations/:id/messages", sendDirect);
router.put("/messages/conversations/:id/block", blockDirect);
router.post("/messages/conversations/:id/messages/:messageId/report", reportDirect);

router.get("/support", listSupport);
router.post("/support", startSupport);
router.get("/support/:id", getSupport);
router.post("/support/:id/messages", replySupport);

router.get("/assistant", getAssistant);
router.post("/assistant/conversations", startAssistantChat);
router.post("/assistant/messages", askAssistant);

export default router;
