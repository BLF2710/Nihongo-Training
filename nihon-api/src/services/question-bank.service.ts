import { UNITS } from "../data/units";
import {
  deleteQuestion, insertQuestion, listQuestions, updateQuestion,
} from "../repositories/question-bank.repository";
import type { BankQuestionInput } from "../repositories/question-bank.repository";
import { HttpError } from "../utils/http-error";
import { isQuestionType, questionType } from "./question-types";

const reviewUnits = () => UNITS.filter(unit => !unit.isPlaceholder);

function parseQuestion(input: Record<string, unknown>): BankQuestionInput {
  const { unitId, type, content, enabled } = input;
  if (!reviewUnits().some(unit => unit.id === unitId)) throw new HttpError(400, "Choose an existing unit.");
  if (!isQuestionType(type)) throw new HttpError(400, "Choose a supported question type.");
  const parsed = content && typeof content === "object" ? questionType(type).parse(content as Record<string, unknown>) : null;
  if (!parsed) throw new HttpError(400, "The question is incomplete or invalid. Check every field and try again.");
  return { unitId: unitId as string, type, content: parsed, enabled: enabled !== false };
}

const parseId = (rawId: unknown) => {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, "Question not found.");
  return id;
};

/** The whole bank plus the units it can be attached to, for the administrator's question dashboard. */
export async function getQuestionBank() {
  return { units: reviewUnits().map(({ id, number, title }) => ({ id, number, title })), questions: await listQuestions() };
}

export async function addQuestion(adminId: number, input: Record<string, unknown>) {
  return insertQuestion(parseQuestion(input), adminId);
}

export async function editQuestion(rawId: unknown, input: Record<string, unknown>) {
  const updated = await updateQuestion(parseId(rawId), parseQuestion(input));
  if (!updated) throw new HttpError(404, "Question not found.");
  return updated;
}

export async function removeQuestion(rawId: unknown) {
  if (!(await deleteQuestion(parseId(rawId)))) throw new HttpError(404, "Question not found.");
}
