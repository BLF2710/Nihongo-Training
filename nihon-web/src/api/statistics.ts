import api from "./axios";
import type { CharacterStat } from "../lib/kanaReview";
import type { MistakeCounts } from "./mistakes";
import type { SavedMockResult } from "./mockExams";
import type { SrsSummary } from "./srs";

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

/** Everything beyond Kana, from the server: study time, lessons, tests, Kanji, reviews, mistakes and practice. */
export type LearningOverview = {
  studyTime: { days: { day: string; seconds: number }[]; goalMinutes: number; totalSeconds: number; daysGoalMet: number };
  lessons: { completed: number; weeks: { week: string; lessons: number; averageScore: number | null }[] };
  assessments: { unitId: string; level: string; number: number; title: string; bestScore: number; isPassed: boolean }[];
  kanji: { total: number; mastered: number; learning: number; untested: number };
  srs: SrsSummary & { days: { day: string; reviews: number; remembered: number }[] };
  mistakes: MistakeCounts;
  mockExams: SavedMockResult[];
  practice: { kind: string; sessions: number; answered: number; correct: number }[];
  speaking: { level: string; attempts: number; bestScore: number; tasksMet: number }[];
};

export async function fetchLearningOverview(signal?: AbortSignal) {
  return (await api.get<LearningOverview>("/statistics/overview", { signal })).data;
}
