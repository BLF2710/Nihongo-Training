import api from "./axios";
import type { CharacterStat } from "../lib/kanaReview";

export type ModeStats = {
  totalCorrect: number;
  totalWrong: number;
  totalAnswers: number;
  accuracy: number;
  characters: CharacterStat[];
};

export type GameTypeStats = {
  gameType: string;
  gamesPlayed: number;
  highScore: number;
  avgAccuracy: number;
  totalPoints: number;
};

export type RecentGame = {
  gameType: string;
  score: number;
  accuracy: number;
  difficulty: string;
  timeTakenSeconds: number;
  playedAt: string;
};

export type EnglishStats = {
  totalGames: number;
  totalPoints: number;
  avgAccuracy: number;
  bestScore: number;
  byGameType: GameTypeStats[];
  recentGames: RecentGame[];
};

export type StatisticsResponse = {
  totalCorrect: number;
  totalWrong: number;
  totalAnswers: number;
  accuracy: number;
  hiragana?: ModeStats;
  katakana?: ModeStats;
  english?: EnglishStats | null;
};

export async function fetchStatistics() {
  return (await api.get<StatisticsResponse>("/statistics")).data;
}
