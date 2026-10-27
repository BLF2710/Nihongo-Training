import api from "./axios";

export type MistakeSource = "lesson" | "review" | "assessment" | "mock_exam";
/**
 * A question the learner got wrong. An assessment's mistakes are locked (no right answer, no practice) until the
 * learner passes that assessment, so the notebook can't be used to learn the test's answers.
 */
export type Mistake = {
  id: number; source: MistakeSource; label: string; prompt: string; options?: string[]; given?: string;
  wrongCount: number; correctStreak: number; lastWrongAt: string; resolvedAt: string | null;
} & ({ isLocked: true } | { isLocked: false; answer: string; explanation?: string });
export type MistakeCounts = { open: number; resolved: number; bySource: Record<MistakeSource, number> };
export type Notebook = { mistakes: Mistake[]; counts: MistakeCounts; correctInARowToResolve: number };
/** One challenge question from a finished lesson. */
export type LessonAnswer = { prompt: string; options: string[]; answer: string; given: string; correct: boolean; explanation?: string };

export async function fetchMistakes(status: "open" | "resolved", signal?: AbortSignal) {
  return (await api.get<Notebook>("/mistakes", { params: { status }, signal })).data;
}

export async function practiseMistake(id: number, correct: boolean) {
  return (await api.post<{ correctStreak: number; wrongCount: number; isResolved: boolean }>(`/mistakes/${id}/practice`, { correct })).data;
}

export async function deleteMistake(id: number) {
  await api.delete(`/mistakes/${id}`);
}

export async function recordLessonAnswers(lessonId: string, answers: LessonAnswer[]) {
  await api.post(`/mistakes/lessons/${encodeURIComponent(lessonId)}`, { answers });
}

type ChallengeQuestion = { prompt: string; options: string[]; correct: string; explanation?: string };

/**
 * Sends a finished lesson's challenge answers to the mistake notebook (wrong ones are noted, right ones count
 * toward clearing earlier mistakes). Failure is not shown: the lesson itself is already saved.
 */
export function recordLessonChallenge(lessonId: string, questions: ChallengeQuestion[], answers: Record<number, string>) {
  const answered = questions.flatMap((question, index) => {
    const given = answers[index];
    if (given === undefined) return [];
    const { prompt, options, correct, explanation } = question;
    return [{ prompt, options, answer: correct, given, correct: given === correct, ...(explanation ? { explanation } : {}) }];
  });
  if (answered.length) void recordLessonAnswers(lessonId, answered).catch(() => { /* see above */ });
}
