import api from "./axios";

export type SpeakingLevel = "N3" | "N2" | "N1";
export type SpeakingTaskKind = "production" | "interaction" | "read_aloud";
export type Band = 1 | 2 | 3 | 4;
export type SpeakingTask = {
  id: string; level: SpeakingLevel; kind: SpeakingTaskKind; title: string; canDo: string; instructions: string;
  prompt?: { ruby: string; plain: string }; passage?: { ruby: string; plain: string }; speaker?: string;
  minSeconds: number; maxSeconds: number; available: boolean;
  best: { score: number; band: Band; met: boolean; attempts: number } | null;
};
export type SpeakingTestOverview = {
  level: SpeakingLevel; jfLevel: string; open: boolean; lockedReason: string | null;
  delivery: "azure" | "browser"; contentGrading: boolean; dailyLimit: number; usedToday: number; tasks: SpeakingTask[];
};
export type SpeakingCriterion = { id: string; name: string; japanese: string; source: "ai" | "azure" | "browser"; weight: number; band: Band | null; bandLabel: string | null; comment: string; rawScore: number | null };
export type SpeakingCorrection = { excerpt: string; corrected: string; category: string; explanation: string; start: number; end: number };
export type SpeakingResult = {
  status: "graded"; id: number; taskId: string; level: SpeakingLevel; jfLevel: string; kind: SpeakingTaskKind; createdAt: string;
  score: number; band: Band; bandLabel: string; met: boolean; delivery: "azure" | "browser";
  criteria: SpeakingCriterion[]; notAssessed: string[]; transcript: string; words: { word: string; accuracy: number; errorType: string }[];
  corrections: SpeakingCorrection[]; summary: string; strengths: string[]; nextSteps: string[]; estimatedLevel: string | null;
  measurements: { durationSeconds: number; reachedMinimum: boolean; characters: number; charactersPerSecond: number; sentences: number };
};
export type SubmitOutcome = SpeakingResult | { status: "no_answer"; message: string };
/** The recording (Azure grading) or the browser's transcript (when the server has no pronunciation service). */
export type SpokenAnswer = { audio: string } | { transcript: string; durationSeconds: number };

/** Grading an answer can take up to a minute (speech service, then the AI). */
const GRADING_TIMEOUT_MS = 120_000;

export const fetchSpeakingTest = async (level: SpeakingLevel, signal?: AbortSignal) =>
  (await api.get<SpeakingTestOverview>("/speaking-tests", { params: { level }, signal })).data;
export const submitSpokenAnswer = async (taskId: string, answer: SpokenAnswer) =>
  (await api.post<SubmitOutcome>(`/speaking-tests/tasks/${encodeURIComponent(taskId)}/attempts`, answer, { timeout: GRADING_TIMEOUT_MS })).data;
export const fetchSpeakingAttempts = async (taskId: string, signal?: AbortSignal) =>
  (await api.get<{ attempts: SpeakingResult[] }>(`/speaking-tests/tasks/${encodeURIComponent(taskId)}/attempts`, { signal })).data.attempts;
export const reportSpeakingGrade = async (attemptId: number, note: string) =>
  (await api.post<{ supportConversationId: number }>(`/speaking-tests/attempts/${attemptId}/report`, { note })).data;
