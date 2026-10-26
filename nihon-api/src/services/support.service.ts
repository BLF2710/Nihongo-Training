import { withTransaction } from "../db/transaction";
import {
  countRecentMessages, countUnreadSupportForStaff, createConversation, findConversation, findMemberConversation, findPersonById,
  insertMessage, listMemberConversations, listMessages, listSupportConversations, markRead, markStaffRead, setConversationStatus,
} from "../repositories/conversation.repository";
import { insertNotification } from "../repositories/notification.repository";
import { HttpError } from "../utils/http-error";
import { cleanBody, cleanSubject, enforceRate, idParam, preview, toMessage } from "./conversation-format";
import { publish } from "./realtime.service";

const SUPPORT_MESSAGES_PER_MINUTE = 10;

// ---- Learners

export async function listMySupportRequests(userId: number) {
  const rows = await listMemberConversations(userId, "support");
  return rows.map(row => ({
    id: row.id, subject: row.subject, status: row.status, unread: row.unread, lastMessageAt: row.last_message_at,
    lastMessage: row.last_body ? { body: preview(row.last_body), fromSupport: row.last_sender_role === "admin" } : null,
  }));
}

export async function startSupportRequest(userId: number, subject: unknown, body: unknown) {
  const title = cleanSubject(subject);
  const text = cleanBody(body);
  enforceRate(await countRecentMessages(userId, "support", 60), SUPPORT_MESSAGES_PER_MINUTE, "a minute");
  const id = await withTransaction(async client => {
    const conversationId = await createConversation(client, { kind: "support", subject: title, createdBy: userId, memberIds: [userId] });
    await insertMessage(client, { conversationId, senderId: userId, senderRole: "learner", body: text });
    return conversationId;
  });
  return { id };
}

async function mySupport(userId: number, conversationId: unknown) {
  const conversation = await findMemberConversation(idParam(conversationId), userId, "support");
  if (!conversation) throw new HttpError(404, "Support request not found.");
  return conversation;
}

export async function getMySupportRequest(userId: number, conversationId: unknown) {
  const conversation = await mySupport(userId, conversationId);
  const messages = await listMessages(conversation.id);
  await markRead(conversation.id, userId);
  return { id: conversation.id, subject: conversation.subject, status: conversation.status, messages: messages.map(row => toMessage(row, userId)) };
}

/** A learner's reply; replying to a closed request opens it again. */
export async function replyToMySupportRequest(userId: number, conversationId: unknown, body: unknown) {
  const text = cleanBody(body);
  const conversation = await mySupport(userId, conversationId);
  enforceRate(await countRecentMessages(userId, "support", 60), SUPPORT_MESSAGES_PER_MINUTE, "a minute");
  const id = await withTransaction(client => insertMessage(client, { conversationId: conversation.id, senderId: userId, senderRole: "learner", body: text }));
  if (conversation.status === "closed") await setConversationStatus(conversation.id, "open");
  return { id, body: text, senderRole: "learner" as const, sender: "You", mine: true, sentAt: new Date() };
}

// ---- Support team (administrators)

const statusFilter = (value: unknown) => value === "closed" || value === "all" ? value : "open";

export async function listSupportInbox(status: unknown) {
  const [rows, unread] = await Promise.all([listSupportConversations(statusFilter(status)), countUnreadSupportForStaff()]);
  return {
    unreadOpen: unread,
    conversations: rows.map(row => ({
      id: row.id, subject: row.subject, status: row.status, unread: row.unread, lastMessageAt: row.last_message_at,
      learner: row.learner_id ? { id: row.learner_id, username: row.learner_username, name: row.learner_name } : null,
      lastMessage: row.last_body ? { body: preview(row.last_body), fromSupport: row.last_sender_role === "admin" } : null,
    })),
  };
}

async function supportConversation(conversationId: unknown) {
  const conversation = await findConversation(idParam(conversationId), "support");
  if (!conversation) throw new HttpError(404, "Support request not found.");
  return conversation;
}

export async function getSupportConversation(adminId: number, conversationId: unknown) {
  const conversation = await supportConversation(conversationId);
  const [messages, learner] = await Promise.all([listMessages(conversation.id), conversation.created_by ? findPersonById(conversation.created_by) : undefined]);
  await markStaffRead(conversation.id);
  return {
    id: conversation.id, subject: conversation.subject, status: conversation.status, createdAt: conversation.created_at,
    learner: learner ? { id: learner.id, username: learner.username, name: learner.display_name, status: learner.status } : null,
    messages: messages.map(row => toMessage(row, adminId, "staff")),
  };
}

export async function replyAsSupport(adminId: number, conversationId: unknown, body: unknown) {
  const text = cleanBody(body);
  const conversation = await supportConversation(conversationId);
  const learnerId = conversation.created_by;
  const id = await withTransaction(async client => {
    const messageId = await insertMessage(client, { conversationId: conversation.id, senderId: adminId, senderRole: "admin", body: text });
    // The team replies as one voice, so the notification names no administrator.
    if (learnerId) await insertNotification(client, { userId: learnerId, kind: "support_reply", data: { conversationId: conversation.id, subject: conversation.subject } });
    return messageId;
  });
  await markStaffRead(conversation.id);
  if (learnerId) { publish(learnerId, { type: "inbox" }); publish(learnerId, { type: "notifications" }); }
  return { id, body: text, senderRole: "admin" as const, sender: "You (support)", mine: true, sentAt: new Date() };
}

export async function setSupportStatus(conversationId: unknown, status: unknown) {
  if (status !== "open" && status !== "closed") throw new HttpError(400, "Status must be open or closed.");
  const conversation = await supportConversation(conversationId);
  await setConversationStatus(conversation.id, status);
  return { id: conversation.id, status };
}
