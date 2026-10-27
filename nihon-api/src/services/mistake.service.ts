import { createHash } from "node:crypto";
import { pool } from "../config/db";
import { LESSONS } from "../data/lessons";
import { listAssessmentProgress } from "../repositories/assessment.repository";
import { isLessonCompleted } from "../repositories/lesson-progress.repository";
import * as mistakeRepository from "../repositories/mistake.repository";
import type { AnswerOutcome, Mistake, MistakePayload } from "../repositories/mistake.repository";
import { HttpError } from "../utils/http-error";

const MAX_LESSON_ANSWERS = 30;
const MAX_TEXT_LENGTH = 300;
const MAX_OPTIONS = 6;

/** Notebook keys: one entry per question, wherever it was answered, so the same question is never listed twice. */
export const mistakeKeys = {
  bank: (questionId: number) => `bank:${questionId}`,
  assessment: (assessmentId: string, questionId: string) => `assessment:${assessmentId}:${questionId}`,
  mockExam: (level: string, questionId: string) => `mock:${level}:${questionId}`,
  lesson: (lessonId: string, prompt: string) => `lesson:${lessonId}:${createHash("sha256").update(prompt).digest("hex").slice(0, 16)}`,
};

const assessmentOf = (mistake: Mistake) => mistake.source === "assessment" ? mistake.itemKey.split(":")[1] : undefined;

/**
 * An assessment's answers stay secret until the learner has passed it, so its mistakes show the question and the
 * learner's answer only, and can't be practised (practising would reveal which option is right).
 */
function presentMistake(mistake: Mistake, passedAssessments: Set<string>) {
  const assessmentId = assessmentOf(mistake);
  const isLocked = assessmentId !== undefined && !passedAssessments.has(assessmentId);
  const { answer, explanation, ...question } = mistake.payload;
  return {
    id: mistake.id, source: mistake.source, wrongCount: mistake.wrongCount, correctStreak: mistake.correctStreak,
    lastWrongAt: mistake.lastWrongAt, resolvedAt: mistake.resolvedAt, isLocked,
    ...(isLocked ? question : { ...question, answer, ...(explanation ? { explanation } : {}) }),
  };
}

async function passedAssessmentIds(userId: number) {
  return new Set((await listAssessmentProgress(userId)).filter(row => row.passed_at !== null).map(row => row.assessment_id));
}

export async function getNotebook(userId: number, status: unknown) {
  const resolved = status === "resolved";
  const [mistakes, counts, passed] = await Promise.all([mistakeRepository.listMistakes(userId, resolved), mistakeRepository.countMistakes(userId), passedAssessmentIds(userId)]);
  return { mistakes: mistakes.map(mistake => presentMistake(mistake, passed)), counts, correctInARowToResolve: mistakeRepository.CORRECT_IN_A_ROW_TO_RESOLVE };
}

const toMistakeId = (value: unknown) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, "Mistake not found.");
  return id;
};

/** One practice answer from the notebook (graded in the browser: the notebook already shows the right answer). */
export async function practiseMistake(userId: number, mistakeId: unknown, correct: unknown) {
  const id = toMistakeId(mistakeId);
  if (typeof correct !== "boolean") throw new HttpError(400, "Say whether the answer was right.");
  const mistake = await mistakeRepository.findMistake(userId, id);
  if (!mistake) throw new HttpError(404, "Mistake not found.");
  if (mistake.resolvedAt) throw new HttpError(409, "This mistake is already cleared.");
  const assessmentId = assessmentOf(mistake);
  if (assessmentId !== undefined && !(await passedAssessmentIds(userId)).has(assessmentId)) {
    throw new HttpError(409, "Practise this question after you pass its assessment.");
  }
  const updated = await mistakeRepository.recordPracticeAnswer(userId, id, correct);
  if (!updated) throw new HttpError(404, "Mistake not found.");
  return { id, correctStreak: updated.correctStreak, wrongCount: updated.wrongCount, isResolved: updated.resolvedAt !== null };
}

export async function removeMistake(userId: number, mistakeId: unknown) {
  if (!(await mistakeRepository.deleteMistake(userId, toMistakeId(mistakeId)))) throw new HttpError(404, "Mistake not found.");
  return { deleted: true };
}

const text = (value: unknown) => typeof value === "string" && value.trim() && value.trim().length <= MAX_TEXT_LENGTH ? value.trim() : null;

function toLessonOutcome(lesson: { id: string; title: string }, value: unknown): AnswerOutcome {
  const invalid = new HttpError(400, "Each answer needs a prompt, options, the right answer, the learner's answer and whether it was right.");
  if (typeof value !== "object" || value === null) throw invalid;
  const input = value as Record<string, unknown>;
  const prompt = text(input.prompt), answer = text(input.answer), given = text(input.given);
  const options = Array.isArray(input.options) ? input.options.map(text) : [];
  const explanation = input.explanation === undefined ? undefined : text(input.explanation);
  if (!prompt || !answer || !given || typeof input.correct !== "boolean" || explanation === null) throw invalid;
  if (options.length < 2 || options.length > MAX_OPTIONS || options.some(option => !option) || !options.includes(answer) || !options.includes(given)) throw invalid;
  const payload: MistakePayload = { label: lesson.title, prompt, options: options.filter(option => option !== null), answer, given, ...(explanation ? { explanation } : {}) };
  return { source: "lesson", itemKey: mistakeKeys.lesson(lesson.id, prompt), correct: input.correct, payload };
}

/** A finished lesson's challenge answers (the lesson is graded in the browser). */
export async function recordLessonAnswers(userId: number, lessonId: unknown, answers: unknown) {
  const lesson = LESSONS.find(item => item.id === lessonId);
  if (!lesson) throw new HttpError(404, "Lesson not found.");
  if (!Array.isArray(answers) || !answers.length || answers.length > MAX_LESSON_ANSWERS) throw new HttpError(400, `Send between 1 and ${MAX_LESSON_ANSWERS} answers.`);
  const outcomes = answers.map(answer => toLessonOutcome(lesson, answer));
  if (!(await isLessonCompleted(userId, lesson.id))) throw new HttpError(403, "Finish the lesson first.");
  await mistakeRepository.recordAnswerOutcomes(pool, userId, outcomes);
  return { recorded: outcomes.length, mistakes: outcomes.filter(outcome => !outcome.correct).length };
}
