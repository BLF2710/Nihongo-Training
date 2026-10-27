import exams from "../../../shared/course/mock-exams.json";
import { withTransaction } from "../db/transaction";
import { gradeMockExam, parseMockAnswers, questionsOf } from "../learning/mockExamGrading";
import type { MockAnswers, MockExam } from "../learning/mockExamGrading";
import { recordAnswerOutcomes } from "../repositories/mistake.repository";
import type { AnswerOutcome } from "../repositories/mistake.repository";
import * as mockResultRepository from "../repositories/mock-exam-result.repository";
import { insertPracticeSession } from "../repositories/practice-session.repository";
import { recordActivity } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";
import { mistakeKeys } from "./mistake.service";
import { getUserUnits } from "./unit.service";

const EXAMS: Partial<Record<string, MockExam>> = exams;
const RESULTS_PER_HOUR = 20;
const HISTORY_LENGTH = 20;

function examFor(level: unknown): MockExam {
  const exam = typeof level === "string" && /^N[1-5]$/.test(level) ? EXAMS[level] : undefined;
  if (!exam) throw new HttpError(404, "There is no mock exam for this level.");
  return exam;
}

/** A level's mock exam opens once every unit of the level has been reached, as on the exam page. */
async function requireLevelReached(userId: number, level: string) {
  const prefix = `japanese-${level.toLowerCase()}-unit-`;
  const units = (await getUserUnits(userId)).filter(unit => unit.id.startsWith(prefix));
  if (!units.length || !units.every(unit => unit.allowed)) throw new HttpError(403, `Reach every ${level} unit to take its mock exam.`);
}

// Questions left blank aren't mistakes to practise; they're counted as wrong in the score only.
function toAnswerOutcomes(exam: MockExam, answers: MockAnswers): AnswerOutcome[] {
  return exam.sections.flatMap(section => questionsOf(section).filter(question => question.id in answers).map(question => ({
    source: "mock_exam" as const, itemKey: mistakeKeys.mockExam(exam.level, question.id), correct: answers[question.id] === question.correctIndex,
    payload: {
      label: `${exam.level} mock exam · ${section.title}`, prompt: question.prompt, options: question.options,
      answer: question.options[question.correctIndex], given: question.options[answers[question.id]], explanation: question.explanation,
    },
  })));
}

/** Grades a finished mock exam on the server, saves the result and its mistakes, and counts today toward the streak. */
export async function submitMockExam(userId: number, level: unknown, input: { answers?: unknown; timedOut?: unknown }) {
  const exam = examFor(level);
  const answers = parseMockAnswers(exam, input.answers);
  if (!answers) throw new HttpError(400, "Each answer must name a question of this exam and one of its options.");
  const answered = Object.keys(answers).length;
  if (!answered) throw new HttpError(400, "Answer at least one question.");
  await requireLevelReached(userId, exam.level);
  if (await mockResultRepository.countRecentMockResults(userId, 3600) >= RESULTS_PER_HOUR) throw new HttpError(429, "Too many mock exams in an hour. Please slow down.");
  const result = gradeMockExam(exam, answers);
  const timedOut = input.timedOut === true;
  return withTransaction(async client => {
    const saved = await mockResultRepository.insertMockResult(client, userId, exam.level, { ...result, timedOut });
    await insertPracticeSession(client, { userId, kind: "mock-exam", scope: exam.level, answered, correct: result.correct });
    await recordAnswerOutcomes(client, userId, toAnswerOutcomes(exam, answers));
    const streak = await recordActivity(client, userId);
    return { result: saved, currentStreak: streak?.currentStreak ?? 0 };
  });
}

export async function getMockHistory(userId: number, level: unknown) {
  const exam = examFor(level);
  const [results, best] = await Promise.all([mockResultRepository.listMockResults(userId, HISTORY_LENGTH, exam.level), mockResultRepository.getMockBest(userId, exam.level)]);
  return { results, ...best };
}
