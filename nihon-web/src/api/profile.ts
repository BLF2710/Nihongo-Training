import api from "./axios";

export type Profile = {
  username: string; display_name: string; avatar: string | null; bio: string;
  learning_language: string; learning_goal: string | null; daily_goal: number; profile_visibility: "private" | "public";
  xp: number; level: number; rank: string; current_streak: number; lessons_completed: number;
  achievements_count: number; achievements: { id: string; title: string; description: string }[];
  xpProgress: { nextLevelXp: number | null; progressPercent: number };
};
export type ProfileUpdate = {
  displayName: string; avatar: string; bio: string; learningLanguage: string; learningGoal: string;
  dailyGoal: number; profileVisibility: Profile["profile_visibility"]; nativeLanguage: string;
};

export async function fetchProfile(signal?: AbortSignal) {
  return (await api.get<Profile>("/profile/me", { signal })).data;
}

export async function updateProfile(update: ProfileUpdate) {
  return (await api.put<Profile>("/profile/me", update)).data;
}
