import api from "./axios";

export type MatchPair = {
  id: number;
  word: string;
  definition: string;
  category: string;
  difficulty: string;
};

export type ScrambleQuestion = {
  id: number;
  wordLength: number;
  scrambledLetters: string[];
  originalWord: string;
  definition: string;
  hint?: string;
  category: string;
  difficulty: string;
};

export type GameScore = {
  gameType: string;
  sessionId: string | null;
  score: number;
  accuracy: number;
  difficulty: string;
  timeTakenSeconds: number;
};

export async function fetchMatchPairs(difficulty: string, count: number) {
  return (await api.get<{ pairs: MatchPair[] }>("/english/games/match", { params: { difficulty, count } })).data.pairs;
}

export async function fetchScrambleQuestions(count: number) {
  return (await api.get<{ questions: ScrambleQuestion[] }>("/english/games/scramble", { params: { count } })).data.questions;
}

export async function submitGameScore(score: GameScore) {
  await api.post("/english/games/score", score);
}
