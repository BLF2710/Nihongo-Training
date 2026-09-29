import { randomUUID } from "crypto";
import { Router, Request } from "express";
import { pool } from "../config/db";
import { authenticate } from "../middleware/auth.middleware";
import { catalog, makeKanjiQuestion, shuffled, PracticeKind } from "../services/kanji.service";
import { characterProgress } from "../services/character-progress";

const router = Router();
router.use(authenticate);
const userId = (req: Request) => Number((req as Request & { user: { userId: number } }).user.userId);
router.use((req, res, next) => {
  if (!Number.isSafeInteger(userId(req)) || userId(req) <= 0) return res.status(401).json({ message: "Invalid user." });
  next();
});

router.get("/progress", async (req, res) => {
  try {
    const result = await pool.query("SELECT kanji_id, correct_count, wrong_count, last_practiced_at FROM user_kanji_progress WHERE user_id=$1", [userId(req)]);
    const progress = catalog.kanji.map(kanji => {
      const saved = result.rows.find(row => row.kanji_id === kanji.id);
      return { kanjiId: kanji.id, ...characterProgress(Number(saved?.correct_count ?? 0), Number(saved?.wrong_count ?? 0)), lastPracticedAt: saved?.last_practiced_at ?? null };
    });
    res.json({ progress });
  } catch (error) { console.error("Kanji progress", error); res.status(500).json({ message: "Could not load Kanji progress." }); }
});

router.post("/practice", async (req, res) => {
  const size: unknown = req.body?.size;
  const selected: unknown = req.body?.kanjiId;
  if (typeof size !== "number" || ![3, 5, 10].includes(size) || (selected !== undefined && typeof selected !== "string")) {
    return res.status(400).json({ message: "Choose 3, 5, or 10 questions and a valid Kanji." });
  }
  const available = selected !== undefined ? catalog.kanji.filter(k => k.id === selected) : shuffled(catalog.kanji);
  if (!available.length) return res.status(404).json({ message: "Kanji not found." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Old question tokens are expendable; durable totals remain in the progress table.
    await client.query("DELETE FROM kanji_practice_questions WHERE user_id=$1 AND created_at < NOW() - INTERVAL '7 days'", [userId(req)]);
    const kinds: PracticeKind[] = ["meaning", "reading", "vocabulary"];
    const questions = [];
    for (let i = 0; i < size; i++) {
      const { correctIndex, ...question } = makeKanjiQuestion(available[i % available.length].id, kinds[i % kinds.length]);
      const id = randomUUID();
      await client.query(`INSERT INTO kanji_practice_questions (id,user_id,kanji_id,kind,options,correct_index,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,NOW() + INTERVAL '1 hour')`,
      [id, userId(req), question.kanjiId, question.kind, JSON.stringify(question.options), correctIndex]);
      questions.push({ id, ...question });
    }
    await client.query("COMMIT");
    res.json({ questions });
  } catch (error) {
    await client.query("ROLLBACK"); console.error("Kanji practice", error);
    res.status(500).json({ message: "Could not start practice." });
  } finally { client.release(); }
});

router.post("/answer", async (req, res) => {
  const { questionId, answerIndex } = req.body ?? {};
  if (typeof questionId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(questionId) || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
    return res.status(400).json({ message: "Choose one of the four answers." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT *, expires_at < NOW() AS expired FROM kanji_practice_questions WHERE id=$1 AND user_id=$2 FOR UPDATE", [questionId, userId(req)]);
    const question = result.rows[0];
    if (!question) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Question not found." }); }
    if (question.answer_index !== null && question.answer_index !== answerIndex) {
      await client.query("ROLLBACK"); return res.status(409).json({ message: "This question already has a saved answer." });
    }
    if (question.answer_index === null && question.expired) {
      await client.query("ROLLBACK"); return res.status(410).json({ message: "Practice expired. Start a new session." });
    }
    const correct = answerIndex === question.correct_index;
    if (question.answer_index === null) {
      await client.query(`INSERT INTO user_kanji_progress (user_id,kanji_id,correct_count,wrong_count)
        VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,kanji_id) DO UPDATE SET
        correct_count=user_kanji_progress.correct_count+EXCLUDED.correct_count,
        wrong_count=user_kanji_progress.wrong_count+EXCLUDED.wrong_count,
        last_practiced_at=NOW(), updated_at=NOW()`, [userId(req), question.kanji_id, correct ? 1 : 0, correct ? 0 : 1]);
      await client.query("UPDATE kanji_practice_questions SET answer_index=$1, answered_at=NOW() WHERE id=$2", [answerIndex, questionId]);
    }
    const progress = await client.query("SELECT * FROM user_kanji_progress WHERE user_id=$1 AND kanji_id=$2", [userId(req), question.kanji_id]);
    await client.query("COMMIT");
    const saved = progress.rows[0];
    res.json({ correct, correctAnswer: question.options[question.correct_index], progress: {
      kanjiId: question.kanji_id, ...characterProgress(saved.correct_count, saved.wrong_count), lastPracticedAt: saved.last_practiced_at,
    } });
  } catch (error) {
    await client.query("ROLLBACK"); console.error("Kanji answer", error);
    res.status(500).json({ message: "Could not save the answer. You can safely retry." });
  } finally { client.release(); }
});
export default router;
