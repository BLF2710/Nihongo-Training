import api from "./axios";

export type Profile = {
  username: string; display_name: string; email?: string; email_verified_at?: string | null; bio: string;
  /** The uploaded picture's address on the API (see lib/avatar.ts), or null. */
  avatar: string | null;
  learning_language: string; native_language?: string | null; learning_goal: string | null; daily_goal: number;
  profile_visibility: "private" | "friends" | "public"; friend_requests?: "everyone" | "nobody";
  xp: number; level: number; rank: string; lessons_completed: number;
  /** Days in a row with learning work, counting today or yesterday; 0 once a day is missed. */
  current_streak: number; longest_streak?: number; active_today?: boolean; time_zone?: string;
  achievements_count: number; achievements: { id: string; title: string; description: string; icon?: string; earned_at?: string }[];
  xpProgress: { currentLevelXp: number; nextLevelXp: number; progressXp: number; progressPercent: number };
  /** How this account can sign in. */
  sign_in?: { password: boolean; google: { email: string } | null };
};
export type ProfileUpdate = {
  displayName: string; bio: string; learningLanguage: string; learningGoal: string;
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

/** The full update the API expects, from a loaded profile; a settings section overrides only its own fields. */
export function toProfileUpdate(profile: Profile): ProfileUpdate {
  return {
    displayName: profile.display_name, bio: profile.bio, learningLanguage: profile.learning_language,
    learningGoal: profile.learning_goal || "", dailyGoal: Number(profile.daily_goal), profileVisibility: profile.profile_visibility,
    nativeLanguage: profile.native_language || "", friendRequests: profile.friend_requests ?? "everyone",
  };
}

/** Uploads a new profile picture (the server re-encodes it); returns its address. */
export async function uploadAvatar(image: Blob) {
  return (await api.put<{ avatar: string }>("/profile/me/avatar", image, { headers: { "Content-Type": image.type || "image/webp" } })).data;
}

export async function removeAvatar() {
  return (await api.delete<{ avatar: null }>("/profile/me/avatar")).data;
}
