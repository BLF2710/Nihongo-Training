import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getStatistics(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as any).user.userId;

    // 1. Hiragana statistics
    const hiraSummary = await pool.query(
      `
      SELECT
        COALESCE(SUM(correct_count), 0) AS total_correct,
        COALESCE(SUM(wrong_count), 0) AS total_wrong
      FROM user_progress
      WHERE user_id = $1
      `,
      [userId]
    );

    const hiraCorrect = Number(hiraSummary.rows[0].total_correct);
    const hiraWrong = Number(hiraSummary.rows[0].total_wrong);
    const hiraTotal = hiraCorrect + hiraWrong;
    const hiraAccuracy = hiraTotal === 0 ? 0 : Number(((hiraCorrect / hiraTotal) * 100).toFixed(1));

    // 2. Katakana statistics
    const kataSummary = await pool.query(
      `
      SELECT
        COALESCE(SUM(correct_count), 0) AS total_correct,
        COALESCE(SUM(wrong_count), 0) AS total_wrong
      FROM user_katakana_progress
      WHERE user_id = $1
      `,
      [userId]
    );

    const kataCorrect = Number(kataSummary.rows[0].total_correct);
    const kataWrong = Number(kataSummary.rows[0].total_wrong);
    const kataTotal = kataCorrect + kataWrong;
    const kataAccuracy = kataTotal === 0 ? 0 : Number(((kataCorrect / kataTotal) * 100).toFixed(1));

    // 3. Combined overall statistics
    const totalCorrect = hiraCorrect + kataCorrect;
    const totalWrong = hiraWrong + kataWrong;
    const totalAnswers = totalCorrect + totalWrong;
    const overallAccuracy = totalAnswers === 0 ? 0 : Number(((totalCorrect / totalAnswers) * 100).toFixed(1));

    // 4. Hiragana character-level progress
    const hiraDetails = await pool.query(
      `
      SELECT
        h.id,
        h.kana,
        h.romaji,
        COALESCE(up.correct_count, 0) AS correct_count,
        COALESCE(up.wrong_count, 0) AS wrong_count
      FROM hiraganas h
      LEFT JOIN user_progress up
        ON h.id = up.hiragana_id AND up.user_id = $1
      ORDER BY h.id ASC
      `,
      [userId]
    );

    const hiraganaList = hiraDetails.rows.map((row) => {
      const c = Number(row.correct_count);
      const w = Number(row.wrong_count);
      const t = c + w;
      const acc = t === 0 ? 0 : Number(((c / t) * 100).toFixed(0));
      return {
        id: row.id,
        kana: row.kana,
        romaji: row.romaji,
        correctCount: c,
        wrongCount: w,
        total: t,
        accuracy: acc,
        status: t === 0 ? "untested" : acc >= 80 && c >= 3 ? "mastered" : "learning"
      };
    });

    // 5. Katakana character-level progress
    const kataDetails = await pool.query(
      `
      SELECT
        k.id,
        k.kana,
        k.romaji,
        COALESCE(ukp.correct_count, 0) AS correct_count,
        COALESCE(ukp.wrong_count, 0) AS wrong_count
      FROM katakanas k
      LEFT JOIN user_katakana_progress ukp
        ON k.id = ukp.katakana_id AND ukp.user_id = $1
      ORDER BY k.id ASC
      `,
      [userId]
    );

    const katakanaList = kataDetails.rows.map((row) => {
      const c = Number(row.correct_count);
      const w = Number(row.wrong_count);
      const t = c + w;
      const acc = t === 0 ? 0 : Number(((c / t) * 100).toFixed(0));
      return {
        id: row.id,
        kana: row.kana,
        romaji: row.romaji,
        correctCount: c,
        wrongCount: w,
        total: t,
        accuracy: acc,
        status: t === 0 ? "untested" : acc >= 80 && c >= 3 ? "mastered" : "learning"
      };
    });

    // 6. English game statistics
    let englishStats = null;
    try {
      // Check if the table exists first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'user_game_scores'
        )
      `);

      if (tableCheck.rows[0].exists) {
        // Overall English game summary
        const engSummary = await pool.query(
          `SELECT
            COUNT(*) AS total_games,
            COALESCE(SUM(score), 0) AS total_points,
            COALESCE(AVG(accuracy), 0) AS avg_accuracy,
            COALESCE(MAX(score), 0) AS best_score
          FROM user_game_scores
          WHERE user_id = $1`,
          [userId]
        );

        // Per game-type breakdown
        const engByType = await pool.query(
          `SELECT
            game_type,
            COUNT(*) AS games_played,
            COALESCE(MAX(score), 0) AS high_score,
            COALESCE(AVG(accuracy), 0) AS avg_accuracy,
            COALESCE(SUM(score), 0) AS total_points
          FROM user_game_scores
          WHERE user_id = $1
          GROUP BY game_type
          ORDER BY game_type`,
          [userId]
        );

        // Recent game history (last 10)
        const recentGames = await pool.query(
          `SELECT
            game_type,
            score,
            accuracy,
            difficulty,
            time_taken_seconds,
            played_at
          FROM user_game_scores
          WHERE user_id = $1
          ORDER BY played_at DESC
          LIMIT 10`,
          [userId]
        );

        const summary = engSummary.rows[0];
        englishStats = {
          totalGames: Number(summary.total_games),
          totalPoints: Number(summary.total_points),
          avgAccuracy: Number(Number(summary.avg_accuracy).toFixed(1)),
          bestScore: Number(summary.best_score),
          byGameType: engByType.rows.map((r) => ({
            gameType: r.game_type,
            gamesPlayed: Number(r.games_played),
            highScore: Number(r.high_score),
            avgAccuracy: Number(Number(r.avg_accuracy).toFixed(1)),
            totalPoints: Number(r.total_points)
          })),
          recentGames: recentGames.rows.map((r) => ({
            gameType: r.game_type,
            score: Number(r.score),
            accuracy: Number(r.accuracy),
            difficulty: r.difficulty,
            timeTakenSeconds: Number(r.time_taken_seconds),
            playedAt: r.played_at
          }))
        };
      }
    } catch (engError) {
      // Table might not exist yet, that's fine
      console.log("English stats table not available yet:", engError);
    }

    return res.json({
      totalCorrect,
      totalWrong,
      totalAnswers,
      accuracy: overallAccuracy,
      hiragana: {
        totalCorrect: hiraCorrect,
        totalWrong: hiraWrong,
        totalAnswers: hiraTotal,
        accuracy: hiraAccuracy,
        characters: hiraganaList
      },
      katakana: {
        totalCorrect: kataCorrect,
        totalWrong: kataWrong,
        totalAnswers: kataTotal,
        accuracy: kataAccuracy,
        characters: katakanaList
      },
      english: englishStats
    });
  } catch (error) {
    console.error("Error in getStatistics:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
}