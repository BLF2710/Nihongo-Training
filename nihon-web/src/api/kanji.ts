import api from "./axios";
export type KanjiProgress = {
  kanjiId: string; correctCount: number; wrongCount: number; total: number; accuracy: number;
  status: "untested" | "learning" | "mastered"; lastPracticedAt: string | null;
};
export type KanjiQuestion = {
  id: string; kanjiId: string; character: string; kind: "meaning" | "reading" | "vocabulary";
  display: string; prompt: string; options: string[];
};
export type KanjiAnswer = { correct: boolean; correctAnswer: string; progress: KanjiProgress };
export async function fetchKanjiProgress(signal?: AbortSignal) {
  return (await api.get<{ progress: KanjiProgress[] }>("/kanji/progress", { signal })).data.progress;
}
export async function startKanjiPractice(size: number, kanjiId?: string) {
  return (await api.post<{ questions: KanjiQuestion[] }>("/kanji/practice", { size, kanjiId })).data.questions;
}
export async function answerKanji(questionId: string, answerIndex: number) {
  return (await api.post<KanjiAnswer>("/kanji/answer", { questionId, answerIndex })).data;
}
