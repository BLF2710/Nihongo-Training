import { Request, Response } from "express";
import { pool } from "../config/db";
import { awardXP } from "../services/xp.service";

export function isRomajiMatch(expected: string, given: string): boolean {
  const normExpected = expected.trim().toLowerCase();
  const normGiven = given.trim().toLowerCase();

  if (normExpected === normGiven) return true;

  const aliases: Record<string, string[]> = {
    shi: ["si", "shi"],
    si: ["si", "shi"],
    chi: ["ti", "chi"],
    ti: ["ti", "chi"],
    tsu: ["tu", "tsu"],
    tu: ["tu", "tsu"],
    fu: ["hu", "fu"],
    hu: ["hu", "fu"],
    ji: ["zi", "ji"],
    zi: ["zi", "ji"],
    sha: ["sya", "sha"],
    shu: ["syu", "shu"],
    sho: ["syo", "sho"],
    cha: ["tya", "cha"],
    chu: ["tyu", "chu"],
    cho: ["tyo", "cho"],
    ja: ["zya", "ja", "jya"],
    ju: ["zyu", "ju", "jyu"],
    jo: ["zyo", "jo", "jyo"]
  };

  const valid = aliases[normExpected];
  if (valid && valid.includes(normGiven)) {
    return true;
  }

  return false;
}

export async function getRandomKana(
  req: Request,
  res: Response
) {
  try {
    const type = req.query.type === "katakana" ? "katakana" : "hiragana";
    const tableName = type === "katakana" ? "katakanas" : "hiraganas";

    const result = await pool.query(`
      SELECT *
      FROM ${tableName}
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No kana found" });
    }

    const kana = result.rows[0];

    return res.json({
      id: kana.id,
      kana: kana.kana,
      romaji: kana.romaji,
      type
    });
  } catch (error) {
    console.error("Error in getRandomKana:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function submitAnswer(
  req: Request,
  res: Response
) {
  try {
    const {
      hiraganaId,
      katakanaId,
      kanaId,
      type: rawType,
      answer
    } = req.body;

    const type = (rawType === "katakana" || katakanaId !== undefined) ? "katakana" : "hiragana";
    const id = kanaId || (type === "katakana" ? katakanaId : hiraganaId);

    if (!id || answer === undefined) {
      return res.status(400).json({
        message: "id and answer are required"
      });
    }

    const tableName = type === "katakana" ? "katakanas" : "hiraganas";
    const progressTable = type === "katakana" ? "user_katakana_progress" : "user_progress";
    const foreignKey = type === "katakana" ? "katakana_id" : "hiragana_id";

    const result = await pool.query(
      `
      SELECT *
      FROM ${tableName}
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Kana not found"
      });
    }

    const kana = result.rows[0];
    const correct = isRomajiMatch(kana.romaji, String(answer));

    const userId = (req as any).user?.userId;

    if (userId) {
      const progressResult = await pool.query(
        `
        SELECT *
        FROM ${progressTable}
        WHERE user_id = $1
        AND ${foreignKey} = $2
        `,
        [userId, id]
      );

      if (progressResult.rows.length === 0) {
        await pool.query(
          `
          INSERT INTO ${progressTable}
          (
            user_id,
            ${foreignKey},
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
            id,
            correct ? 1 : 0,
            correct ? 0 : 1
          ]
        );
      } else {
        await pool.query(
          `
          UPDATE ${progressTable}
          SET
            correct_count =
              correct_count + $1,
            wrong_count =
              wrong_count + $2
          WHERE user_id = $3
          AND ${foreignKey} = $4
          `,
          [
            correct ? 1 : 0,
            correct ? 0 : 1,
            userId,
            id
          ]
        );
      }

      // XP is based on durable progress, not on frontend state. Each ten correct
      // answers earns one unique event, even though these quizzes have no end screen.
      if (correct) {
        const totalResult = await pool.query(`SELECT COALESCE(SUM(correct_count), 0) AS total_correct FROM ${progressTable} WHERE user_id = $1`, [userId]);
        const milestone = Math.floor(Number(totalResult.rows[0].total_correct) / 10);
        if (milestone > 0) await awardXP(Number(userId), 10, "quiz", `${type}:correct-${milestone * 10}`);
      }
    }

    return res.json({
      correct,
      correctAnswer: kana.romaji,
      type
    });
  } catch (error) {
    console.error("Error in submitAnswer:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
}

export async function getKanaCharacters(req: Request, res: Response) {
  try {
    const type = req.query.type === "katakana" ? "katakana" : "hiragana";
    const tableName = type === "katakana" ? "katakanas" : "hiraganas";
    const result = await pool.query(`SELECT id, kana, romaji FROM ${tableName} ORDER BY id ASC`);
    return res.json({ type, characters: result.rows });
  } catch (error) {
    console.error("Error in getKanaCharacters:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
