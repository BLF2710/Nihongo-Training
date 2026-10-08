import { gameScoresTableExists, getGameSummary, listGameSummariesByType, listRecentGames } from "../repositories/game-score.repository";
import { getAnswerTotals, listKanaWithProgress } from "../repositories/kana.repository";
import type { KanaScript } from "../utils/kana-script";
import { characterProgress } from "./character-progress";

const RECENT_GAMES_LIMIT = 10;

function summarize(correct: number, wrong: number) {
  const total = correct + wrong;
  return {
    totalCorrect: correct,
    totalWrong: wrong,
    totalAnswers: total,
    accuracy: total === 0 ? 0 : Number(((correct / total) * 100).toFixed(1))
  };
}

async function getKanaStatistics(script: KanaScript, userId: number) {
  const totals = await getAnswerTotals(script, userId);
  const characters = (await listKanaWithProgress(script, userId)).map(character => {
    const progress = characterProgress(character.correctCount, character.wrongCount);
    return { ...character, total: progress.total, accuracy: progress.accuracy, status: progress.status };
  });
  return { totals, statistics: { ...summarize(totals.correct, totals.wrong), characters } };
}

async function getEnglishStatistics(userId: number) {
  try {
    if (!(await gameScoresTableExists())) return null;
    const summary = await getGameSummary(userId);
    const byType = await listGameSummariesByType(userId);
    const recentGames = await listRecentGames(userId, RECENT_GAMES_LIMIT);
    return {
      totalGames: Number(summary.total_games),
      totalPoints: Number(summary.total_points),
      avgAccuracy: Number(Number(summary.avg_accuracy).toFixed(1)),
      bestScore: Number(summary.best_score),
      byGameType: byType.map(row => ({
        gameType: row.game_type,
        gamesPlayed: Number(row.games_played),
        highScore: Number(row.high_score),
        avgAccuracy: Number(Number(row.avg_accuracy).toFixed(1)),
        totalPoints: Number(row.total_points)
      })),
      recentGames: recentGames.map(row => ({
        gameType: row.game_type,
        score: Number(row.score),
        accuracy: Number(row.accuracy),
        difficulty: row.difficulty,
        timeTakenSeconds: Number(row.time_taken_seconds),
        playedAt: row.played_at
      }))
    };
  } catch (error) {
    // Table might not exist yet, that's fine
    console.log("English stats table not available yet:", error);
    return null;
  }
}

/** Combined Kana totals, per-script character mastery, and English game history for one user. */
export async function getStatistics(userId: number) {
  const hiragana = await getKanaStatistics("hiragana", userId);
  const katakana = await getKanaStatistics("katakana", userId);
  return {
    ...summarize(hiragana.totals.correct + katakana.totals.correct, hiragana.totals.wrong + katakana.totals.wrong),
    hiragana: hiragana.statistics,
    katakana: katakana.statistics,
    english: await getEnglishStatistics(userId)
  };
}
