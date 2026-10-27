import { withTransaction } from "../db/transaction";
import { parseLessonContent } from "../content/lessonContent";
import { LESSONS } from "../data/lessons";
import { clearDraft, findLessonEdit, listLessonEdits, listPublishedEdits, publish, saveDraft, unpublish } from "../repositories/lesson-edit.repository";
import type { LessonEditRow } from "../repositories/lesson-edit.repository";
import { pool } from "../config/db";
import { HttpError } from "../utils/http-error";
import { recordAdminAction } from "./audit-log.service";

function requireLesson(rawId: unknown): string {
  const lesson = typeof rawId === "string" ? LESSONS.find(item => item.id === rawId) : undefined;
  if (!lesson) throw new HttpError(404, "Lesson not found.");
  return lesson.id;
}

function parseOrFail(content: unknown) {
  const result = parseLessonContent(content);
  if (!result.ok) throw new HttpError(400, "The lesson has problems to fix before it can be saved.", { errors: result.errors });
  return result.content;
}

const toEdit = (row: LessonEditRow) => ({
  lessonId: row.lesson_id,
  draft: row.draft, draftUpdatedAt: row.draft_updated_at, draftBy: row.draft_by,
  published: row.published, publishedAt: row.published_at, publishedBy: row.published_by,
});
const toStatus = (row: LessonEditRow) => ({
  lessonId: row.lesson_id, hasDraft: row.draft !== null, draftUpdatedAt: row.draft_updated_at, draftBy: row.draft_by,
  isPublished: row.published !== null, publishedAt: row.published_at, publishedBy: row.published_by,
});

/** Lessons with a draft or a published edit. */
export async function getLessonEditList() {
  return { edits: (await listLessonEdits()).map(toStatus) };
}

export async function getLessonEdit(rawId: unknown) {
  const lessonId = requireLesson(rawId);
  const row = await findLessonEdit(pool, lessonId);
  return row ? toEdit(row) : { lessonId, draft: null, draftUpdatedAt: null, draftBy: null, published: null, publishedAt: null, publishedBy: null };
}

/** Saves work in progress. Learners don't see a draft; it is checked the same way as a published lesson. */
export async function saveLessonDraft(adminId: number, rawId: unknown, content: unknown) {
  const lessonId = requireLesson(rawId);
  await saveDraft(lessonId, parseOrFail(content), adminId);
  return getLessonEdit(lessonId);
}

export async function discardLessonDraft(adminId: number, rawId: unknown) {
  const lessonId = requireLesson(rawId);
  await withTransaction(async client => {
    const row = await findLessonEdit(client, lessonId, true);
    if (!row?.draft) throw new HttpError(404, "This lesson has no draft.");
    await clearDraft(client, lessonId);
    await recordAdminAction(client, { actorId: adminId, action: "lesson.draft_discarded", targetRef: lessonId });
  });
  return getLessonEdit(lessonId);
}

/** Publishes the draft: learners see it the next time they open the site. */
export async function publishLessonDraft(adminId: number, rawId: unknown) {
  const lessonId = requireLesson(rawId);
  await withTransaction(async client => {
    const row = await findLessonEdit(client, lessonId, true);
    if (!row?.draft) throw new HttpError(404, "Save a draft before publishing.");
    const content = parseOrFail(row.draft);
    await publish(client, lessonId, content, adminId);
    await recordAdminAction(client, { actorId: adminId, action: "lesson.published", targetRef: lessonId, details: { title: content.title, replaced: row.published !== null } });
  });
  return getLessonEdit(lessonId);
}

/** Removes the published edit, so learners see the lesson as it is in the course files again. */
export async function revertLesson(adminId: number, rawId: unknown) {
  const lessonId = requireLesson(rawId);
  await withTransaction(async client => {
    const row = await findLessonEdit(client, lessonId, true);
    if (!row?.published) throw new HttpError(404, "This lesson has no published edit.");
    await unpublish(client, lessonId);
    await recordAdminAction(client, { actorId: adminId, action: "lesson.reverted", targetRef: lessonId });
  });
  return getLessonEdit(lessonId);
}

/** Every published edit, to write into the course files with scripts/course-import/apply-lesson-edits.mjs. */
export async function exportPublishedLessonEdits() {
  return { exportedAt: new Date().toISOString(), lessons: (await getPublishedLessonEdits()).lessons };
}

/** What the site applies over the built-in lessons when it starts. */
export async function getPublishedLessonEdits() {
  const { revision, lessons } = await listPublishedEdits();
  return { revision, lessons: Object.fromEntries(lessons.filter(row => LESSONS.some(lesson => lesson.id === row.lesson_id)).map(row => [row.lesson_id, row.published])) };
}
