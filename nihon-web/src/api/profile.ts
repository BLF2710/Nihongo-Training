import api from "./axios";

export type Profile = {
  username: string; display_name: string; email?: string; email_verified_at?: string | null; avatar: string | null; bio: string;
  learning_language: string; native_language?: string | null; learning_goal: string | null; daily_goal: number;
  profile_visibility: "private" | "friends" | "public"; friend_requests?: "everyone" | "nobody";
  xp: number; level: number; rank: string; lessons_completed: number;
  /** Days in a row with learning work, counting today or yesterday; 0 once a day is missed. */
  current_streak: number; longest_streak?: number; active_today?: boolean; time_zone?: string;
  achievements_count: number; achievements: { id: string; title: string; description: string }[];
  xpProgress: { nextLevelXp: number | null; progressPercent: number };
};
export type ProfileUpdate = {
  displayName: string; avatar: string; bio: string; learningLanguage: string; learningGoal: string;
  dailyGoal: number; profileVisibility: Profile["profile_visibility"]; nativeLanguage: string; friendRequests: "everyone" | "nobody";
};

export async function fetchProfile(signal?: AbortSignal) {
  return (await api.get<Profile>("/profile/me", { signal })).data;
}

export async function updateProfile(update: ProfileUpdate) {
  return (await api.put<Profile>("/profile/me", update)).data;
}

/** Saves the browser's IANA time zone, which decides when a learner's day starts for streaks. */
export async function updateTimeZone(timeZone: string) {
  await api.put("/profile/me/time-zone", { timeZone });
}
