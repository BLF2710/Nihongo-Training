import * as assistant from "../services/assistant.service";
import * as direct from "../services/direct-message.service";
import * as support from "../services/support.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

const failed = (label: string, message: string) => ({ label, message });

// ---- Inbox

export const getInbox = action(async (req, res) => res.json(await direct.getInboxSummary(getUserId(req))),
  failed("getInbox", "Could not load your messages."));

// ---- Direct messages between learners

export const listDirect = action(async (req, res) => res.json({ conversations: await direct.listDirectConversations(getUserId(req)) }),
  failed("listDirect", "Could not load your conversations."));
export const startDirect = action(async (req, res) => res.status(201).json(await direct.startDirectConversation(getUserId(req), req.body?.username)),
  failed("startDirect", "Could not start the conversation."));
export const getDirect = action(async (req, res) => res.json(await direct.getDirectConversation(getUserId(req), req.params.id)),
  failed("getDirect", "Could not load the conversation."));
export const sendDirect = action(async (req, res) => res.status(201).json(await direct.sendDirectMessage(getUserId(req), req.params.id, req.body?.body)),
  failed("sendDirect", "Could not send the message. Please try again."));
export const blockDirect = action(async (req, res) => res.json(await direct.setDirectBlock(getUserId(req), req.params.id, req.body?.blocked)),
  failed("blockDirect", "Could not change the block setting."));
export const reportDirect = action(async (req, res) => res.status(201).json(await direct.reportDirectMessage(getUserId(req), req.params.id, req.params.messageId, req.body?.reason)),
  failed("reportDirect", "Could not send the report. Please try again."));

// ---- Help & support (learner side)

export const listSupport = action(async (req, res) => res.json({ conversations: await support.listMySupportRequests(getUserId(req)) }),
  failed("listSupport", "Could not load your support requests."));
export const startSupport = action(async (req, res) => res.status(201).json(await support.startSupportRequest(getUserId(req), req.body?.subject, req.body?.body)),
  failed("startSupport", "Could not send your request. Please try again."));
export const getSupport = action(async (req, res) => res.json(await support.getMySupportRequest(getUserId(req), req.params.id)),
  failed("getSupport", "Could not load the support request."));
export const replySupport = action(async (req, res) => res.status(201).json(await support.replyToMySupportRequest(getUserId(req), req.params.id, req.body?.body)),
  failed("replySupport", "Could not send the message. Please try again."));

// ---- Support inbox (administrators)

export const adminListSupport = action(async (req, res) => res.json(await support.listSupportInbox(req.query.status)),
  failed("adminListSupport", "Could not load the support inbox."));
export const adminGetSupport = action(async (req, res) => res.json(await support.getSupportConversation(getUserId(req), req.params.id)),
  failed("adminGetSupport", "Could not load the support request."));
export const adminReplySupport = action(async (req, res) => res.status(201).json(await support.replyAsSupport(getUserId(req), req.params.id, req.body?.body)),
  failed("adminReplySupport", "Could not send the reply. Please try again."));
export const adminSetSupportStatus = action(async (req, res) => res.json(await support.setSupportStatus(req.params.id, req.body?.status)),
  failed("adminSetSupportStatus", "Could not change the request status."));

// ---- Study assistant

export const getAssistant = action(async (req, res) => res.json(await assistant.getAssistant(getUserId(req), typeof req.query.conversation === "string" ? req.query.conversation : undefined)),
  failed("getAssistant", "Could not load the study assistant."));
export const startAssistantChat = action(async (req, res) => res.status(201).json(await assistant.startAssistantConversation(getUserId(req))),
  failed("startAssistantChat", "Could not start a new chat."));
export const askAssistant = action(async (req, res) => res.status(201).json(await assistant.askAssistant(getUserId(req), {
  body: req.body?.body, conversationId: req.body?.conversationId, level: req.body?.level,
})), failed("askAssistant", "The study assistant could not answer. Please try again."));
