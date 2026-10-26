import api from "./axios";

export type FriendshipState = "self" | "friends" | "outgoing" | "incoming" | "none";
export type Person = { username: string; displayName: string };
export type Friend = Person & { since: string; progress: { level: number; currentStreak: number; activeToday: boolean } | null };
export type FriendRequest = Person & { id: number; sentAt: string };
export type FriendLists = { friends: Friend[]; incoming: FriendRequest[]; outgoing: FriendRequest[] };
export type ProfileVisibility = "private" | "friends" | "public";
export type PublicProfile = Person & {
  joinedAt: string; visibility: ProfileVisibility; visible: boolean; canRequest: boolean;
  friendship: { state: FriendshipState; requestId?: number };
  profile?: {
    bio: string; learningLanguage: string | null; nativeLanguage: string | null; learningGoal: string | null;
    xp: number; level: number; rank: string; currentStreak: number; longestStreak: number; activeToday: boolean;
    lessonsCompleted: number; unitsPassed: number; latestUnit: { level: string; number: number; title: string } | null;
    achievements: { id: string; title: string; description: string; earnedAt: string }[]; friends: number;
  };
};
/** What each visibility setting means, as shown in settings and on your own profile. */
export const VISIBILITY_TEXT: Record<ProfileVisibility, string> = {
  private: "Only you can see your progress. Other learners see your name and can send you a friend request.",
  friends: "Your friends can see your progress, bio and achievements.",
  public: "Any signed-in learner can see your progress, bio and achievements.",
};

type Change = { state: FriendshipState; requestId?: number; person?: Person };

export type LeaderboardEntry = Person & { self: boolean; weeklyXp: number; weeklyLessons: number; currentStreak: number; activeToday: boolean };
export type Leaderboard = { period: { from: string; to: string }; entries: LeaderboardEntry[]; hidden: number };
export const fetchLeaderboard = async (signal?: AbortSignal) => (await api.get<Leaderboard>("/friends/leaderboard", { signal })).data;
export const fetchFriends = async (signal?: AbortSignal) => (await api.get<FriendLists>("/friends", { signal })).data;
export const sendFriendRequest = async (username: string) => (await api.post<Change>("/friends/requests", { username })).data;
export const answerFriendRequest = async (id: number, accept: boolean) => (await api.put<Change>(`/friends/requests/${id}`, { accept })).data;
export const cancelFriendRequest = async (id: number) => (await api.delete<Change>(`/friends/requests/${id}`)).data;
export const removeFriend = async (username: string) => (await api.delete<Change>(`/friends/${encodeURIComponent(username)}`)).data;
export const fetchPublicProfile = async (username: string, signal?: AbortSignal) =>
  (await api.get<PublicProfile>(`/people/${encodeURIComponent(username)}`, { signal })).data;
