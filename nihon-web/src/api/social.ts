import api from "./axios";
import type { Person } from "./friends";

const path = (username: string) => encodeURIComponent(username);

// ---- Blocking and reporting
export type BlockedLearner = Person & { blockedAt: string };
export const blockLearner = async (username: string) => (await api.put<{ blocked: boolean }>(`/people/${path(username)}/block`)).data;
export const reportLearner = async (username: string, reason: string) =>
  (await api.post<{ supportConversationId: number }>(`/people/${path(username)}/report`, { reason })).data;
export const fetchBlockedLearners = async (signal?: AbortSignal) => (await api.get<{ blocked: BlockedLearner[] }>("/blocks", { signal })).data.blocked;
export const unblockLearner = async (username: string) => (await api.delete<{ blocked: boolean }>(`/blocks/${path(username)}`)).data;

// ---- Opt-in settings
export type SocialSettings = { suggestMe: boolean; shareActivity: boolean; showStudyingNow: boolean };
export const fetchSocialSettings = async (signal?: AbortSignal) => (await api.get<SocialSettings>("/profile/me/social", { signal })).data;
export const saveSocialSettings = async (change: Partial<SocialSettings>) => (await api.put<SocialSettings>("/profile/me/social", change)).data;

// ---- Suggestions
export type FriendSuggestion = Person & { mutualFriends: number; sameLevel: string | null };
export const fetchFriendSuggestions = async (signal?: AbortSignal) =>
  (await api.get<{ enabled: boolean; suggestions: FriendSuggestion[] }>("/friends/suggestions", { signal })).data;

// ---- Activity feed, cheers and nudges
type FeedBase = { key: string; person: Person; at: string; cheered: boolean };
export type FeedItem =
  | FeedBase & { kind: "lessons"; lessons: number }
  | FeedBase & { kind: "unit"; unit: { level: string; number: number; title: string } | null }
  | FeedBase & { kind: "achievement"; achievement: { title: string } };
export const fetchFriendActivity = async (signal?: AbortSignal) => (await api.get<{ items: FeedItem[]; days: number }>("/friends/activity", { signal })).data;
export const cheerFriend = async (username: string, item: string) => (await api.post(`/friends/${path(username)}/cheers`, { item })).data;
export const nudgeFriend = async (username: string) => (await api.post(`/friends/${path(username)}/nudge`)).data;

// ---- Challenges
export type ChallengeMetric = "xp" | "lessons";
export type ChallengeDays = 3 | 7;
export type FriendChallenge = {
  id: number; metric: ChallengeMetric; days: ChallengeDays; status: "pending" | "active" | "finished"; sentByMe: boolean; friend: Person;
  myScore: number; theirScore: number; createdAt: string; startsAt: string | null; endsAt: string | null; outcome: "won" | "lost" | "tied" | null;
};
export const CHALLENGE_METRIC_TEXT: Record<ChallengeMetric, string> = { xp: "Most XP", lessons: "Most lessons" };
export const fetchChallenges = async (signal?: AbortSignal) => (await api.get<{ challenges: FriendChallenge[] }>("/friends/challenges", { signal })).data.challenges;
export const createChallenge = async (username: string, metric: ChallengeMetric, days: ChallengeDays) =>
  (await api.post<{ id: number }>("/friends/challenges", { username, metric, days })).data;
export const answerChallenge = async (id: number, accept: boolean) => (await api.put(`/friends/challenges/${id}`, { accept })).data;
export const cancelChallenge = async (id: number) => (await api.delete(`/friends/challenges/${id}`)).data;
