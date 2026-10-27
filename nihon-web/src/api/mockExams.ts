import api from "./axios";
import type { MockResult } from "../data/mockExams";

export type SavedMockResult = MockResult & { id: number; level: string; timedOut: boolean; createdAt: string };
export type MockHistory = { results: SavedMockResult[]; attempts: number; bestPercent: number | null; hasPassed: boolean };

/** The server grades the answers itself, saves the result and notes the wrong answers as mistakes. */
export async function submitMockExam(level: string, answers: Record<string, number>, timedOut: boolean) {
  return (await api.post<{ result: SavedMockResult }>(`/mock-exams/${encodeURIComponent(level)}/results`, { answers, timedOut })).data.result;
}

export async function fetchMockHistory(level: string, signal?: AbortSignal) {
  return (await api.get<MockHistory>(`/mock-exams/${encodeURIComponent(level)}/results`, { signal })).data;
}
