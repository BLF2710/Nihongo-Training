import { UNIT_ASSESSMENTS } from "../data/unit-assessments";
import { findEnabledQuestion, listEnabledQuestions } from "../repositories/question-bank.repository";
import { HttpError } from "../utils/http-error";
import { shuffled } from "../utils/random";
import { questionType } from "./question-types";
import type { Graded, PresentedQuestion } from "./question-types";
import { getUserUnits } from "./unit.service";

const ASSESSMENT_QUESTIONS_PER_REVIEW = 5;
const BANK_QUESTIONS_PER_REVIEW = 20;

/** A review opens together with its unit's lessons. */
async function requireReachedUnit(userId: number, unitId: unknown) {
  const unit = (await getUserUnits(userId)).find(item => item.id === unitId);
  if (!unit || unit.isPlaceholder) throw new HttpError(404, "Unit not found.");
  if (!unit.allowed) throw new HttpError(403, `Unit ${unit.number} review is locked.`, { reasons: unit.reasons });
  return unit;
}

const assessmentOf = (assessmentId: string | undefined) => UNIT_ASSESSMENTS.find(item => item.id === assessmentId);

/** A fresh, shuffled mix of the unit's assessment questions and its question bank, without answers. */
export async function getReviewQuestions(userId: number, unitId: unknown): Promise<(PresentedQuestion & { id: string })[]> {
  const unit = await requireReachedUnit(userId, unitId);
  const fromAssessment = shuffled(assessmentOf(unit.assessmentId)?.questions ?? []).slice(0, ASSESSMENT_QUESTIONS_PER_REVIEW)
    .map(({ id, prompt, options }) => ({ id: `assessment:${id}`, type: "multiple_choice" as const, prompt, options }));
  const fromBank = shuffled(await listEnabledQuestions(unit.id)).slice(0, BANK_QUESTIONS_PER_REVIEW)
    .map(question => ({ id: `bank:${question.id}`, ...questionType(question.type).present(question.content) }));
  return shuffled([...fromAssessment, ...fromBank]);
}

/** Grades one answer on the server, so answer keys never have to be sent ahead of time. */
export async function checkReviewAnswer(userId: number, unitId: unknown, questionId: unknown, answer: unknown): Promise<Graded> {
  const unit = await requireReachedUnit(userId, unitId);
  const [source, key] = typeof questionId === "string" ? [questionId.slice(0, questionId.indexOf(":")), questionId.slice(questionId.indexOf(":") + 1)] : [];
  let graded: Graded | null | undefined;
  if (source === "assessment") {
    const question = assessmentOf(unit.assessmentId)?.questions.find(item => item.id === key);
    graded = question && questionType("multiple_choice").grade(question, answer);
  } else if (source === "bank" && /^\d{1,9}$/.test(key ?? "")) {
    const question = await findEnabledQuestion(Number(key), unit.id);
    graded = question && questionType(question.type).grade(question.content, answer);
  }
  if (graded === undefined) throw new HttpError(404, "Question not found.");
  if (graded === null) throw new HttpError(400, "Invalid answer.");
  return graded;
}
