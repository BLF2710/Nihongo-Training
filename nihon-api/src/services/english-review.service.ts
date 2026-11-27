import englishLessons from "../../../shared/course/english/lessons.json";
import { pool } from "../config/db";
import { parseEnglishLessonContent } from "../content/englishLessonContent";
import { drawReviewRound, findReviewQuestion, gradeReviewAnswer, isEnglishReviewScope, isLessonInScope, lessonIdOf } from "../learning/englishReview";
import type { GradedReviewAnswer, PresentedReviewQuestion, ReviewLesson } from "../learning/englishReview";
import { listPublishedEdits } from "../repositories/lesson-edit.repository";
import { isLessonCompleted, listCompletedLessonIds } from "../repositories/lesson-progress.repository";
import { recordAnswerOutcomes } from "../repositories/mistake.repository";
import { HttpError } from "../utils/http-error";
import { mistakeKeys } from "./mistake.service";
import { recordLearningActivity } from "./streak.service";

// The English review, graded here: questions come from the learner's completed English lessons (as the course files
// have them, with any published edit applied, as the site shows them). Each answer is checked on the server, goes to
// the mistake notebook as a review mistake, and counts toward the day's streak.

// The importer validated these lessons when it wrote them (scripts/english-course), so they are read as such.
const FILE_LESSONS = englishLessons as unknown as readonly ReviewLesson[];

/** The course's English lessons, each with its published edit (if valid) in place of the file's content. */
async function currentLessons(): Promise<readonly ReviewLesson[]> {
  const { lessons: edits } = await listPublishedEdits();
  const editOf = new Map(edits.map(row => [row.lesson_id, row.published]));
  return FILE_LESSONS.map(lesson => {
    if (!editOf.has(lesson.id)) return lesson;
    const parsed = parseEnglishLessonContent(editOf.get(lesson.id));
    return parsed.ok ? { ...lesson, ...parsed.content } : lesson;
  });
}

/** A round of the review for a unit or a level, from the lessons the learner has completed there, without answers. */
export async function getEnglishReviewRound(userId: number, scope: unknown): Promise<PresentedReviewQuestion[]> {
  if (!isEnglishReviewScope(scope)) throw new HttpError(404, "Give a unit or level of the English course, such as english-a2.");
  const [lessons, completed] = await Promise.all([currentLessons(), listCompletedLessonIds(userId)]);
  const done = new Set(completed);
  return drawReviewRound(lessons.filter(lesson => done.has(lesson.id) && isLessonInScope(lesson, scope)), Math.random);
}

/** Grades one answer, notes it in the mistake notebook (a wrong one, or a right one toward clearing it) and counts
 *  the day toward the streak. Only a completed lesson's questions can be checked. */
export async function checkEnglishReviewAnswer(userId: number, questionId: unknown, answer: unknown): Promise<GradedReviewAnswer> {
  const lessonId = lessonIdOf(questionId);
  if (lessonId === null || typeof questionId !== "string") throw new HttpError(404, "Question not found.");
  if (typeof answer !== "string") throw new HttpError(400, "Invalid answer.");
  const lesson = (await currentLessons()).find(item => item.id === lessonId);
  if (!lesson || !(await isLessonCompleted(userId, lessonId))) throw new HttpError(404, "Question not found.");
  const question = findReviewQuestion(lesson, questionId, Math.random);
  if (!question) throw new HttpError(404, "Question not found.");
  const graded = gradeReviewAnswer(question, answer);
  await recordAnswerOutcomes(pool, userId, [{
    source: "review", itemKey: mistakeKeys.englishReview(questionId), correct: graded.correct,
    payload: { label: `${lesson.level} Unit ${lesson.unitNumber} review`, prompt: question.prompt, options: question.options, answer: question.correct, given: answer, explanation: question.explanation },
  }]);
  await recordLearningActivity(userId);
  return graded;
}
