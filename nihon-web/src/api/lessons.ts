import api from "./axios";

type XpAward = { level: number; oldLevel: number; rank: string; oldRank: string };
export type LessonCompletion = { completion?: XpAward; achievements?: string[] };

export async function checkLessonAccess(lessonId: string) {
  await api.get(`/lessons/${lessonId}/access`);
}

export async function completeLesson(lessonId: string, challengeScore: number) {
  return (await api.post<LessonCompletion>(`/lessons/${lessonId}/complete`, { challengeScore })).data;
}

/** The most significant thing a completion unlocked, or null when nothing changed. */
export function completionCelebration({ completion, achievements }: LessonCompletion): string | null {
  if (completion && completion.level > completion.oldLevel) return `LEVEL UP! Level ${completion.oldLevel} → Level ${completion.level}`;
  if (completion && completion.rank !== completion.oldRank) return `RANK UP! ${completion.oldRank} → ${completion.rank}`;
  if (achievements?.length) return "Achievement unlocked!";
  return null;
}
