import api from "./axios";
import type { ReportSummary } from "./moderation";

// Learner-to-learner messages, Help & support, and the study assistant all share this message shape.
export type ChatMessage = { id: number; body: string; senderRole: "learner" | "admin" | "assistant"; sender: string; mine: boolean; sentAt: string };
export type InboxSummary = { direct: number; support: number; total: number; friendRequests?: number; notifications?: number };

export type DirectConversationSummary = { id: number; with: { username: string; name: string }; unread: number; lastMessageAt: string; lastMessage: { body: string; mine: boolean } | null };
export type DirectConversation = { id: number; with: { username: string; name: string }; blockedByMe: boolean; canReply: boolean; messages: ChatMessage[] };

export type SupportSummary = { id: number; subject: string; status: "open" | "closed"; unread: number; lastMessageAt: string; lastMessage: { body: string; fromSupport: boolean } | null };
export type SupportConversation = { id: number; subject: string; status: "open" | "closed"; messages: ChatMessage[] };

export type AssistantState = {
  provider: { id: string; label: string; ai: boolean };
  conversationId: number | null;
  messages: ChatMessage[];
  conversations: { id: number; title: string; lastMessageAt: string }[];
};

export const fetchInbox = async (signal?: AbortSignal) => (await api.get<InboxSummary>("/inbox", { signal })).data;

export const fetchDirectConversations = async (signal?: AbortSignal) =>
  (await api.get<{ conversations: DirectConversationSummary[] }>("/messages/conversations", { signal })).data.conversations;
export const startDirectConversation = async (username: string) =>
  (await api.post<{ id: number; with: { username: string; name: string } }>("/messages/conversations", { username })).data;
export const fetchDirectConversation = async (id: number, signal?: AbortSignal) =>
  (await api.get<DirectConversation>(`/messages/conversations/${id}`, { signal })).data;
export const sendDirectMessage = async (id: number, body: string) =>
  (await api.post<ChatMessage>(`/messages/conversations/${id}/messages`, { body })).data;
export const setDirectBlock = async (id: number, blocked: boolean) =>
  (await api.put<{ blockedByMe: boolean }>(`/messages/conversations/${id}/block`, { blocked })).data;
export const reportDirectMessage = async (id: number, messageId: number, reason: string) =>
  (await api.post<{ supportConversationId: number }>(`/messages/conversations/${id}/messages/${messageId}/report`, { reason })).data;

export const fetchSupportRequests = async (signal?: AbortSignal) =>
  (await api.get<{ conversations: SupportSummary[] }>("/support", { signal })).data.conversations;
export const startSupportRequest = async (subject: string, body: string) =>
  (await api.post<{ id: number }>("/support", { subject, body })).data;
export const fetchSupportRequest = async (id: number, signal?: AbortSignal) =>
  (await api.get<SupportConversation>(`/support/${id}`, { signal })).data;
export const replyToSupport = async (id: number, body: string) =>
  (await api.post<ChatMessage>(`/support/${id}/messages`, { body })).data;

export const fetchAssistant = async (conversationId?: number, signal?: AbortSignal) =>
  (await api.get<AssistantState>("/assistant", { signal, params: conversationId ? { conversation: conversationId } : {} })).data;
export const startAssistantChat = async () => (await api.post<{ conversationId: number }>("/assistant/conversations")).data;
export const askAssistant = async (body: string, conversationId: number | null, level: string) =>
  (await api.post<{ conversationId: number; messages: ChatMessage[] }>("/assistant/messages", { body, conversationId, level })).data;

// Support inbox for administrators.
export type StaffSupportSummary = Omit<SupportSummary, "unread"> & { unread: boolean; learner: { id: number; username: string; name: string } | null };
export type StaffSupportConversation = SupportConversation & {
  createdAt: string; learner: { id: number; username: string; name: string; status: string } | null;
  /** For a report: every open report about the same learner. */
  reports: ReportSummary | null;
};
export const fetchSupportInbox = async (status: "open" | "closed" | "all", signal?: AbortSignal) =>
  (await api.get<{ unreadOpen: number; conversations: StaffSupportSummary[] }>("/admin/support", { signal, params: { status } })).data;
export const fetchStaffSupport = async (id: number, signal?: AbortSignal) =>
  (await api.get<StaffSupportConversation>(`/admin/support/${id}`, { signal })).data;
export const replyAsSupport = async (id: number, body: string) =>
  (await api.post<ChatMessage>(`/admin/support/${id}/messages`, { body })).data;
export const setSupportStatus = async (id: number, status: "open" | "closed") =>
  (await api.patch<{ id: number; status: string }>(`/admin/support/${id}`, { status })).data;
