import { UNIT_ASSESSMENTS } from "../data/unit-assessments";
import type { UnitAssessment } from "../data/unit-assessments";
import { saveAssessmentAttempt } from "../repositories/assessment.repository";
import { HttpError } from "../utils/http-error";
import { getUserUnits } from "./unit.service";

/** The unit and its assessment, once the user is allowed to take it. */
async function getUnlockedAssessment(userId: number, unitId: unknown) {
  const unit = (await getUserUnits(userId)).find(item => item.id === unitId);
  if (!unit) throw new HttpError(404, "Unit not found.");
  if (unit.isPlaceholder) throw new HttpError(403, `Unit ${unit.number} Assessment is coming soon.`);
  if (!unit.assessmentUnlocked) throw new HttpError(403, `Complete all Unit ${unit.number} lessons to unlock the assessment.`, { reasons: unit.reasons });
  const assessment = UNIT_ASSESSMENTS.find(item => item.id === unit.assessmentId)!;
  return { unit, assessment };
}

function isCompleteAnswerSheet(assessment: UnitAssessment, answers: unknown): answers is number[] {
  return Array.isArray(answers) && answers.length === assessment.questions.length &&
    answers.every((answer, index) => Number.isInteger(answer) && answer >= 0 && answer < assessment.questions[index].options.length);
}

export function gradeAssessment(assessment: UnitAssessment, answers: number[]) {
  const total = assessment.questions.length;
  const correct = assessment.questions.filter((question, index) => answers[index] === question.correctIndex).length;
  const accuracy = Math.round(correct / total * 10000) / 100;
  const passed = correct * 100 >= total * assessment.passPercent;
  return { correct, total, accuracy, passed };
}

/** Assessment questions for the client; answer keys never leave the server. */
export async function getAssessment(userId: number, unitId: unknown) {
  const { unit, assessment } = await getUnlockedAssessment(userId, unitId);
  return {
    unitId: unit.id, unitNumber: unit.number, title: `Unit ${unit.number} Assessment`, assessmentId: assessment.id,
    passPercent: assessment.passPercent, assessmentPassed: unit.assessmentPassed,
    questions: assessment.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
  };
}

export async function submitAssessment(userId: number, unitId: unknown, submission: { assessmentId?: unknown; answers?: unknown } | undefined) {
  const { unit, assessment } = await getUnlockedAssessment(userId, unitId);
  const answers = submission?.answers;
  if (submission?.assessmentId !== assessment.id || !isCompleteAnswerSheet(assessment, answers)) {
    throw new HttpError(400, "Submit one valid answer for every assessment question.");
  }
  const { correct, total, accuracy, passed } = gradeAssessment(assessment, answers);
  const saved = await saveAssessmentAttempt(userId, assessment.id, accuracy, passed);
  return {
    correct, wrong: total - correct, total, accuracy, passed, passPercent: assessment.passPercent,
    assessmentPassed: saved.passed, unitCompleted: unit.allLessonsCompleted && saved.passed,
    bestScore: saved.bestScore,
  };
}
