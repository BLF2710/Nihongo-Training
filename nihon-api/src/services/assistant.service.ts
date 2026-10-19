import { withTransaction } from "../db/transaction";
import {
  countRecentMessages, createConversation, findMemberConversation, findPersonById, insertMessage, latestConversationId,
  listMemberConversations, listMessages, markRead, setSubject,
} from "../repositories/conversation.repository";
import { HttpError } from "../utils/http-error";
import { activeProvider } from "./assistant-providers";
import type { AssistantTurn } from "./assistant-providers";
import { cleanBody, enforceRate, idParam, preview, toMessage } from "./conversation-format";

// Limits keep one account from running up the AI bill.
const ASSISTANT_MESSAGES_PER_HOUR = 40;
const ASSISTANT_MAX_LENGTH = 1000;
const HISTORY_TURNS = 20;
const LEVELS = new Set(["N5", "N4", "N3", "N2", "N1"]);

const providerInfo = () => { const provider = activeProvider(); return { id: provider.id, label: provider.label, ai: provider.id !== "course-helper" }; };

async function ownConversation(userId: number, conversationId: unknown) {
  const conversation = await findMemberConversation(idParam(conversationId), userId, "assistant");
  if (!conversation) throw new HttpError(404, "Conversation not found.");
  return conversation;
}

/** The latest assistant chat (or the one asked for) and the learner's earlier chats. */
export async function getAssistant(userId: number, conversationId?: unknown) {
  const id = conversationId === undefined ? await latestConversationId(userId, "assistant") : (await ownConversation(userId, conversationId)).id;
  const [messages, history] = await Promise.all([id ? listMessages(id) : [], listMemberConversations(userId, "assistant")]);
  if (id) await markRead(id, userId);
  return {
    provider: providerInfo(),
    conversationId: id ?? null,
    messages: messages.map(row => toMessage(row, userId)),
    conversations: history.slice(0, 20).map(row => ({ id: row.id, title: row.subject || "Chat", lastMessageAt: row.last_message_at })),
  };
}

export async function startAssistantConversation(userId: number) {
  const id = await withTransaction(client => createConversation(client, { kind: "assistant", createdBy: userId, memberIds: [userId] }));
  return { conversationId: id };
}

/**
 * Sends the learner's message to the assistant and stores both the question and the answer.
 * Nothing is stored if the assistant cannot answer, so a retry never duplicates the question.
 */
export async function askAssistant(userId: number, input: { body: unknown; conversationId?: unknown; level?: unknown }) {
  const question = cleanBody(input.body, ASSISTANT_MAX_LENGTH);
  enforceRate(await countRecentMessages(userId, "assistant", 3600), ASSISTANT_MESSAGES_PER_HOUR, "a little while");
  const existing = input.conversationId === undefined || input.conversationId === null ? undefined : await ownConversation(userId, String(input.conversationId));
  const earlier = existing ? await listMessages(existing.id, HISTORY_TURNS) : [];
  const history: AssistantTurn[] = [
    ...earlier.map(row => ({ role: row.sender_role === "assistant" ? "assistant" as const : "user" as const, content: row.body })),
    { role: "user", content: question },
  ];
  // The conversation sent to the model must begin with the learner.
  while (history[0]?.role === "assistant") history.shift();
  const learner = await findPersonById(userId);
  const level = typeof input.level === "string" && LEVELS.has(input.level) ? input.level : "N5";
  const answer = await activeProvider().reply(history, { learnerName: learner?.display_name ?? "Learner", level });

  return withTransaction(async client => {
    const conversationId = existing?.id ?? await createConversation(client, { kind: "assistant", subject: preview(question).slice(0, 60), createdBy: userId, memberIds: [userId] });
    if (existing && !existing.subject) await setSubject(client, conversationId, preview(question).slice(0, 60));
    const questionId = await insertMessage(client, { conversationId, senderId: userId, senderRole: "learner", body: question });
    const answerId = await insertMessage(client, { conversationId, senderId: null, senderRole: "assistant", body: answer });
    const now = new Date();
    return {
      conversationId,
      messages: [
        { id: questionId, body: question, senderRole: "learner" as const, sender: "You", mine: true, sentAt: now },
        { id: answerId, body: answer, senderRole: "assistant" as const, sender: "Study assistant", mine: false, sentAt: now },
      ],
    };
  });
}
