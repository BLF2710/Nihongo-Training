import { Request, Response } from "express";
import { pool } from "../config/db";
import { UNIT_ASSESSMENTS } from "../data/unit-assessments";
import { getUserUnits } from "../services/unit.service";

const currentUserId = (req: Request) => Number((req as Request & { user: { userId: number } }).user.userId);

export async function listUnits(req: Request, res: Response) {
  try { return res.json({ units: await getUserUnits(currentUserId(req)) }); }
  catch (error) { console.error("listUnits", error); return res.status(500).json({ message: "Could not load units." }); }
}

export async function getAssessment(req: Request, res: Response) {
  try {
    const unit = (await getUserUnits(currentUserId(req))).find(item => item.id === req.params.unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (unit.isPlaceholder) return res.status(403).json({ message: `Unit ${unit.number} Assessment is coming soon.` });
    if (!unit.assessmentUnlocked) return res.status(403).json({ message: `Complete all Unit ${unit.number} lessons to unlock the assessment.`, reasons: unit.reasons });
    const assessment = UNIT_ASSESSMENTS.find(item => item.id === unit.assessmentId)!;
    return res.json({ unitId: unit.id, unitNumber: unit.number, title: `Unit ${unit.number} Assessment`, assessmentId: assessment.id, passPercent: assessment.passPercent, assessmentPassed: unit.assessmentPassed,
      questions: assessment.questions.map(({ id, prompt, options }) => ({ id, prompt, options })) });
  } catch (error) { console.error("getAssessment", error); return res.status(500).json({ message: "Could not load the assessment." }); }
}

export async function submitAssessment(req: Request, res: Response) {
  try {
    const userId = currentUserId(req);
    const unit = (await getUserUnits(userId)).find(item => item.id === req.params.unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (unit.isPlaceholder) return res.status(403).json({ message: `Unit ${unit.number} Assessment is coming soon.` });
    if (!unit.assessmentUnlocked) return res.status(403).json({ message: `Complete all Unit ${unit.number} lessons to unlock the assessment.`, reasons: unit.reasons });
    const assessment = UNIT_ASSESSMENTS.find(item => item.id === unit.assessmentId)!;
    const answers: unknown = req.body?.answers;
    if (req.body?.assessmentId !== assessment.id || !Array.isArray(answers) || answers.length !== assessment.questions.length ||
      !answers.every((answer, index) => Number.isInteger(answer) && answer >= 0 && answer < assessment.questions[index].options.length)) {
      return res.status(400).json({ message: "Submit one valid answer for every assessment question." });
    }
    const total = assessment.questions.length;
    const correct = assessment.questions.filter((question, index) => answers[index] === question.correctIndex).length;
    const accuracy = Math.round(correct / total * 10000) / 100;
    const passed = correct * 100 >= total * assessment.passPercent;
    // Atomic upsert keeps the first pass and best score across retakes/retries.
    const saved = await pool.query(`INSERT INTO user_assessment_progress (user_id, assessment_id, best_score, last_score, passed_at)
      VALUES ($1,$2,$3,$3,CASE WHEN $4 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, assessment_id) DO UPDATE SET
        best_score=GREATEST(user_assessment_progress.best_score, EXCLUDED.best_score),
        last_score=EXCLUDED.last_score,
        passed_at=COALESCE(user_assessment_progress.passed_at, EXCLUDED.passed_at), updated_at=NOW()
      RETURNING passed_at, best_score`, [userId, assessment.id, accuracy, passed]);
    return res.json({ correct, wrong: total - correct, total, accuracy, passed, passPercent: assessment.passPercent,
      assessmentPassed: saved.rows[0].passed_at !== null, unitCompleted: unit.allLessonsCompleted && saved.rows[0].passed_at !== null,
      bestScore: Number(saved.rows[0].best_score) });
  } catch (error) { console.error("submitAssessment", error); return res.status(500).json({ message: "Could not save the assessment. Please try again." }); }
}
