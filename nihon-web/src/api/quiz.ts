import api from "./axios";
import type { KanaApiCharacter } from "../data/hiraganaLearning";
import type { KanaScript } from "../lib/kanaReview";

export type KanaAnswerResult = { correct: boolean; correctAnswer: string; type?: KanaScript };

export async function fetchKanaCharacters(script: KanaScript, signal?: AbortSignal) {
  return (await api.get<{ characters: KanaApiCharacter[] }>("/quiz/characters", { params: { type: script }, signal })).data.characters;
}

/** Sending the same submissionId again replays the saved result instead of counting twice. */
export async function submitKanaAnswer(answer: { type: KanaScript; kanaId: number; answer: string; submissionId: string }) {
  return (await api.post<KanaAnswerResult>("/quiz/answer", answer)).data;
}
