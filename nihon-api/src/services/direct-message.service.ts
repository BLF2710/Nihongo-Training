import { withTransaction } from "../db/transaction";
import {
  blockState, countRecentMessages, countUnreadConversations, createConversation, findDirectConversationId, findMemberConversation,
  findMessage, findPersonByUsername, insertMessage, listMemberConversations, listMembers, listMessages, markRead,
} from "../repositories/conversation.repository";
import { HttpError } from "../utils/http-error";
import { USERNAME_PATTERN } from "../utils/validation";
import { cleanBody, enforceRate, idParam, preview, toMessage } from "./conversation-format";
import { countFriendRequests } from "./friend.service";
import { setLearnerBlock } from "./learner-block.service";
import { countUnread as countUnreadNotifications } from "./notification.service";
import { publish } from "./realtime.service";

const DIRECT_MESSAGES_PER_MINUTE = 20;
const directKey = (a: number, b: number) => `${Math.min(a, b)}:${Math.max(a, b)}`;

async function memberConversation(userId: number, conversationId: unknown) {
  const id = idParam(conversationId);
  const conversation = await findMemberConversation(id, userId, "direct");
  if (!conversation) throw new HttpError(404, "Conversation not found.");
  const other = (await listMembers(id)).find(member => member.id !== userId);
  if (!other) throw new HttpError(404, "Conversation not found.");
  return { conversation, other };
}

/** The learner's direct conversations, newest first. */
export async function listDirectConversations(userId: number) {
  const rows = await listMemberConversations(userId, "direct");
  return rows.map(row => ({
    id: row.id, with: { username: row.other_username, name: row.other_name }, unread: row.unread, lastMessageAt: row.last_message_at,
    lastMessage: row.last_body ? { body: preview(row.last_body), mine: row.last_sender_id === userId } : null,
  }));
}

/**
 * Opens the conversation with another learner, creating it the first time. Learners are found by their
 * exact username only, so nobody can browse the list of accounts. The support team is reached through Help & support.
 */
export async function startDirectConversation(userId: number, username: unknown) {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username.trim())) throw new HttpError(400, "Enter a username (3–30 letters, numbers or underscores).");
  const person = await findPersonByUsername(username.trim());
  if (!person || person.status !== "active" || person.role !== "learner") throw new HttpError(404, "No learner has that username.");
  if (person.id === userId) throw new HttpError(400, "You can't send messages to yourself.");
  const blocks = await blockState(userId, person.id);
  if (blocks.blockedMe) throw new HttpError(403, "You can't message this learner.");
  const key = directKey(userId, person.id);
  let id = await findDirectConversationId(key);
  if (!id) {
    try {
      id = await withTransaction(client => createConversation(client, { kind: "direct", directKey: key, createdBy: userId, memberIds: [userId, person.id] }));
    } catch (error) {
      // Both learners opened the conversation at the same moment: use the one that was created.
      if ((error as { code?: string }).code !== "23505") throw error;
      id = await findDirectConversationId(key);
    }
  }
  return { id: id!, with: { username: person.username, name: person.display_name } };
}

export async function getDirectConversation(userId: number, conversationId: unknown) {
  const { conversation, other } = await memberConversation(userId, conversationId);
  const [messages, blocks] = await Promise.all([listMessages(conversation.id), blockState(userId, other.id)]);
  await markRead(conversation.id, userId);
  return {
    id: conversation.id, with: { username: other.username, name: other.display_name },
    blockedByMe: blocks.blockedByMe, canReply: !blocks.blockedByMe && !blocks.blockedMe && other.status === "active",
    messages: messages.map(row => toMessage(row, userId)),
  };
}

export async function sendDirectMessage(userId: number, conversationId: unknown, body: unknown) {
  const text = cleanBody(body);
  const { conversation, other } = await memberConversation(userId, conversationId);
  const blocks = await blockState(userId, other.id);
  if (blocks.blockedByMe) throw new HttpError(403, "Unblock this learner to send a message.");
  if (blocks.blockedMe || other.status !== "active") throw new HttpError(403, "This learner can't receive messages.");
  enforceRate(await countRecentMessages(userId, "direct", 60), DIRECT_MESSAGES_PER_MINUTE, "a minute");
  const id = await withTransaction(client => insertMessage(client, { conversationId: conversation.id, senderId: userId, senderRole: "learner", body: text }));
  publish(other.id, { type: "inbox" });
  return { id, body: text, senderRole: "learner" as const, sender: "You", mine: true, sentAt: new Date() };
}

export async function setDirectBlock(userId: number, conversationId: unknown, blocked: unknown) {
  if (typeof blocked !== "boolean") throw new HttpError(400, "Say whether to block or unblock.");
  const { other } = await memberConversation(userId, conversationId);
  await setLearnerBlock(userId, other.id, blocked);
  return { blockedByMe: blocked };
}

/** Sends a copy of a message to the support team as a new support request. */
export async function reportDirectMessage(userId: number, conversationId: unknown, messageId: unknown, reason: unknown) {
  const { conversation, other } = await memberConversation(userId, conversationId);
  const message = await findMessage(conversation.id, idParam(messageId, "Message"));
  if (!message || message.sender_id === userId) throw new HttpError(404, "Message not found.");
  const note = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
  const body = `Reported message #${message.id} from @${other.username} (conversation #${conversation.id}):\n\n“${message.body}”${note ? `\n\nReason: ${note}` : ""}`;
  const supportId = await withTransaction(async client => {
    const id = await createConversation(client, { kind: "support", subject: `Report: message from @${other.username}`, createdBy: userId, memberIds: [userId] });
    await insertMessage(client, { conversationId: id, senderId: userId, senderRole: "learner", body });
    return id;
  });
  return { supportConversationId: supportId };
}

/** Unread counts for the navigation badge. */
export async function getInboxSummary(userId: number) {
  const [counts, friendRequests, notifications] = await Promise.all([countUnreadConversations(userId), countFriendRequests(userId), countUnreadNotifications(userId)]);
  return { direct: counts.direct, support: counts.support, total: counts.direct + counts.support, friendRequests, notifications };
}
