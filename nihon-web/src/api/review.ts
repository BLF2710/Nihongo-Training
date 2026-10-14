import api from "./axios";

// Review questions arrive without their answers; each answer is graded by the server.
// A cumulative review mixes units, so its questions name the unit that checks them.
export type ReviewQuestion = { id: string; unitId?: string } & (
  | { type: "multiple_choice"; prompt: string; options: string[] }
  | { type: "word_match"; prompt: string; left: string[]; right: string[] }
  | { type: "word_scramble"; hint: string; letters: string[] }
);
/** Option index, the chosen right-hand item per left-hand item, or the unscrambled word. */
export type ReviewAnswer = number | string[] | string;
export type ReviewGrade = { correct: boolean; solution: string; explanation?: string };

export async function fetchReviewQuestions(unitId: string, signal?: AbortSignal) {
  return (await api.get<{ questions: ReviewQuestion[] }>(`/review/units/${encodeURIComponent(unitId)}/questions`, { signal })).data.questions;
}

export async function fetchLevelReviewQuestions(level: string, signal?: AbortSignal) {
  return (await api.get<{ questions: ReviewQuestion[] }>(`/review/levels/${encodeURIComponent(level)}/questions`, { signal })).data.questions;
}

export async function checkReviewAnswer(unitId: string, questionId: string, answer: ReviewAnswer) {
  return (await api.post<ReviewGrade>(`/review/units/${encodeURIComponent(unitId)}/check`, { questionId, answer })).data;
}
