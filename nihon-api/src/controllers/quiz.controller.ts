import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getRandomKana(
  req: Request,
  res: Response
) {
  const result = await pool.query(`
    SELECT *
    FROM hiraganas
    ORDER BY RANDOM()
    LIMIT 1
  `);

  const kana = result.rows[0];

  return res.json({
    id: kana.id,
    kana: kana.kana
  });
}

export async function submitAnswer(
  req: Request,
  res: Response
) {
  try {

    const {
      hiraganaId,
      answer
    } = req.body;

    const userId = (req as any).user.userId;
    console.log(userId);

    const result = await pool.query(
      `
      SELECT *
      FROM hiraganas
      WHERE id = $1
      `,
      [hiraganaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Kana not found"
      });
    }

    const kana = result.rows[0];
    
    //kiem tra dap an dung khong
    const correct =
  kana.romaji.toLowerCase() ===
  answer.toLowerCase();
    //cap nhat progress
const progressResult =
  await pool.query(
    `
    SELECT *
    FROM user_progress
    WHERE user_id = $1
    AND hiragana_id = $2
    `,
    [userId, hiraganaId]
  );

if (progressResult.rows.length === 0) {

  await pool.query(
    `
    INSERT INTO user_progress
    (
      user_id,
      hiragana_id,
      correct_count,
      wrong_count
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4
    )
    `,
    [
      userId,
      hiraganaId,
      correct ? 1 : 0,
      correct ? 0 : 1
    ]
  );

} else {

  await pool.query(
    `
    UPDATE user_progress
    SET
      correct_count =
        correct_count + $1,

      wrong_count =
        wrong_count + $2
    WHERE user_id = $3
    AND hiragana_id = $4
    `,
    [
      correct ? 1 : 0,
      correct ? 0 : 1,
      userId,
      hiraganaId
    ]
  );

}

return res.json({
  correct,
  correctAnswer: kana.romaji
});

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}