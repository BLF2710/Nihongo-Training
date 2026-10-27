import { pool } from "../config/db";
import { recordAnswerOutcomes } from "../repositories/mistake.repository";
import { findEnabledQuestion, listEnabledQuestions } from "../repositories/question-bank.repository";
import { HttpError } from "../utils/http-error";
import { shuffled } from "../utils/random";
import { questionType } from "./question-types";
import type { Graded, PresentedQuestion } from "./question-types";
import { mistakeKeys } from "./mistake.service";
import { recordLearningActivity } from "./streak.service";
import { getUserUnits } from "./unit.service";

// Reviews draw only on the question bank. The unit assessments' own questions are never shown or graded here:
// a review must not reveal (or let anyone probe) the answers of the real test.
const BANK_QUESTIONS_PER_REVIEW = 25;
const BANK_QUESTIONS_PER_LEVEL_REVIEW = 40;

/** A review opens together with its unit's lessons. */
async function requireReachedUnit(userId: number, unitId: unknown) {
  const unit = (await getUserUnits(userId)).find(item => item.id === unitId);
  if (!unit || unit.isPlaceholder) throw new HttpError(404, "Unit not found.");
  if (!unit.allowed) throw new HttpError(403, `Unit ${unit.number} review is locked.`, { reasons: unit.reasons });
  return unit;
}

/** A fresh, shuffled selection from the unit's question bank, without answers. */
export async function getReviewQuestions(userId: number, unitId: unknown): Promise<(PresentedQuestion & { id: string })[]> {
  const unit = await requireReachedUnit(userId, unitId);
  return shuffled(await listEnabledQuestions(unit.id)).slice(0, BANK_QUESTIONS_PER_REVIEW)
    .map(question => ({ id: `bank:${question.id}`, ...questionType(question.type).present(question.content) }));
}

/**
 * A cumulative review for one course level: bank questions from every unit of the level the learner
 * has reached. Each question names its unit, which is where its answer is checked.
 */
export async function getLevelReviewQuestions(userId: number, level: unknown): Promise<(PresentedQuestion & { id: string; unitId: string })[]> {
  if (typeof level !== "string" || !/^N[1-5]$/.test(level)) throw new HttpError(404, "Level not found.");
  const prefix = `japanese-${level.toLowerCase()}-unit-`;
  const units = (await getUserUnits(userId)).filter(unit => unit.id.startsWith(prefix) && !unit.isPlaceholder && unit.allowed);
  if (!units.length) throw new HttpError(403, `No ${level} unit is open for review yet.`);
  const bank = (await Promise.all(units.map(unit => listEnabledQuestions(unit.id)))).flat();
  return shuffled(bank).slice(0, BANK_QUESTIONS_PER_LEVEL_REVIEW)
    .map(question => ({ id: `bank:${question.id}`, unitId: question.unitId, ...questionType(question.type).present(question.content) }));
}

/** Grades one answer on the server, so answer keys never have to be sent ahead of time. */
export async function checkReviewAnswer(userId: number, unitId: unknown, questionId: unknown, answer: unknown): Promise<Graded> {
  const unit = await requireReachedUnit(userId, unitId);
  const [source, key] = typeof questionId === "string" ? [questionId.slice(0, questionId.indexOf(":")), questionId.slice(questionId.indexOf(":") + 1)] : [];
  const question = source === "bank" && /^\d{1,9}$/.test(key ?? "") ? await findEnabledQuestion(Number(key), unit.id) : undefined;
  if (!question) throw new HttpError(404, "Question not found.");
  const type = questionType(question.type);
  const graded = type.grade(question.content, answer);
  if (graded === null) throw new HttpError(400, "Invalid answer.");
  const { explanation } = graded;
  await recordAnswerOutcomes(pool, userId, [{
    source: "review", itemKey: mistakeKeys.bank(question.id), correct: graded.correct,
    payload: { label: `Unit ${unit.number} review`, ...type.describe(question.content, answer), answer: graded.solution, ...(explanation ? { explanation } : {}) },
  }]);
  await recordLearningActivity(userId);
  return graded;
}
