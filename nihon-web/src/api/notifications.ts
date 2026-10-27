import api from "./axios";

export type NotificationKind = "friend_request" | "friend_accepted" | "support_reply" | "achievement" | "nudge" | "cheer" | "challenge";
export type AppNotification = {
  id: number; kind: NotificationKind; createdAt: string; read: boolean;
  actor: { username: string; displayName: string } | null;
  data: {
    conversationId?: number; subject?: string; achievementId?: string; title?: string;
    /** Cheers: what the cheer was for, e.g. "completing 3 lessons". */
    reason?: string;
    /** Challenges. */
    event?: "invited" | "accepted" | "declined" | "finished"; metric?: "xp" | "lessons"; days?: number;
    outcome?: "won" | "lost" | "tied"; myScore?: number; theirScore?: number;
  };
};
export type NotificationPage = { notifications: AppNotification[]; hasMore: boolean; unread: number };

export const fetchNotifications = async (options: { before?: number; limit?: number } = {}, signal?: AbortSignal) =>
  (await api.get<NotificationPage>("/notifications", { signal, params: options })).data;
/** Marks the given notifications, or all of them, as read. */
export const markNotificationsRead = async (ids?: number[]) => (await api.post<{ unread: number }>("/notifications/read", ids ? { ids } : {})).data;
