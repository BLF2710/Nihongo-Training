import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getStatistics(
  req: Request,
  res: Response
) {
  try {

    const userId =
      (req as any).user.userId;

    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(correct_count), 0) AS total_correct,
        COALESCE(SUM(wrong_count), 0) AS total_wrong
      FROM user_progress
      WHERE user_id = $1
      `,
      [userId]
    );

    const totalCorrect =
      Number(result.rows[0].total_correct);

    const totalWrong =
      Number(result.rows[0].total_wrong);

    const totalAnswers =
      totalCorrect + totalWrong;

    const accuracy =
      totalAnswers === 0
        ? 0
        : Number(
            (
              (totalCorrect /
                totalAnswers) *
              100
            ).toFixed(2)
          );

    return res.json({
      totalCorrect,
      totalWrong,
      accuracy
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });

  }
}