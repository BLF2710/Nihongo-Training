import api from "./axios";
import type { N5Lesson } from "../data/japaneseN5Lessons";

/** The part of a lesson that can be edited in the admin area. */
export type EditableLesson = Pick<N5Lesson, "title" | "titleJp" | "objectives" | "vocabulary" | "concept" | "examples" | "dialogue" | "grammar" | "reading" | "practice" | "challenge">;
export type PublishedLessonEdits = { revision: number; lessons: Record<string, EditableLesson> };
export type LessonEdit = {
  lessonId: string;
  draft: EditableLesson | null; draftUpdatedAt: string | null; draftBy: string | null;
  published: EditableLesson | null; publishedAt: string | null; publishedBy: string | null;
};
export type LessonEditStatus = { lessonId: string; hasDraft: boolean; draftUpdatedAt: string | null; draftBy: string | null; isPublished: boolean; publishedAt: string | null; publishedBy: string | null };

export const fetchPublishedLessonEdits = async (signal?: AbortSignal) => (await api.get<PublishedLessonEdits>("/site/lesson-edits", { signal })).data;

const lessonPath = (lessonId: string) => `/admin/lessons/${encodeURIComponent(lessonId)}`;
export const fetchLessonEditExport = async () => (await api.get<{ exportedAt: string; lessons: Record<string, EditableLesson> }>("/admin/lessons/export")).data;
export const fetchLessonEditList = async (signal?: AbortSignal) => (await api.get<{ edits: LessonEditStatus[] }>("/admin/lessons/edits", { signal })).data.edits;
export const fetchLessonEdit = async (lessonId: string, signal?: AbortSignal) => (await api.get<LessonEdit>(`${lessonPath(lessonId)}/edit`, { signal })).data;
export const saveLessonDraft = async (lessonId: string, content: EditableLesson) => (await api.put<LessonEdit>(`${lessonPath(lessonId)}/draft`, { content })).data;
export const discardLessonDraft = async (lessonId: string) => (await api.delete<LessonEdit>(`${lessonPath(lessonId)}/draft`)).data;
export const publishLessonDraft = async (lessonId: string) => (await api.post<LessonEdit>(`${lessonPath(lessonId)}/publish`)).data;
export const revertLesson = async (lessonId: string) => (await api.delete<LessonEdit>(`${lessonPath(lessonId)}/published`)).data;
