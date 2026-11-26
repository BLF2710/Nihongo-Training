import api from "./axios";
import type { N5Lesson } from "../data/japaneseN5Lessons";
import type { EditableEnglishLesson } from "../data/englishLessonEdits";

/** The part of a lesson that can be edited in the admin area. */
export type EditableLesson = Pick<N5Lesson, "title" | "titleJp" | "objectives" | "vocabulary" | "concept" | "examples" | "dialogue" | "grammar" | "reading" | "practice" | "challenge">;
/** `englishLessons` is missing from copies cached before English lessons could be edited. */
export type PublishedLessonEdits = { revision: number; lessons: Record<string, EditableLesson>; englishLessons?: Record<string, EditableEnglishLesson> };
/** A lesson's draft and published edit: `Content` is EditableLesson for Japanese lessons, EditableEnglishLesson for English ones. */
export type LessonEdit<Content = EditableLesson> = {
  lessonId: string;
  draft: Content | null; draftUpdatedAt: string | null; draftBy: string | null;
  published: Content | null; publishedAt: string | null; publishedBy: string | null;
};
export type LessonEditStatus = { lessonId: string; hasDraft: boolean; draftUpdatedAt: string | null; draftBy: string | null; isPublished: boolean; publishedAt: string | null; publishedBy: string | null };

export const fetchPublishedLessonEdits = async (signal?: AbortSignal) => (await api.get<PublishedLessonEdits>("/site/lesson-edits", { signal })).data;

const lessonPath = (lessonId: string) => `/admin/lessons/${encodeURIComponent(lessonId)}`;
export const fetchLessonEditExport = async () => (await api.get<{ exportedAt: string; lessons: Record<string, EditableLesson>; englishLessons: Record<string, EditableEnglishLesson> }>("/admin/lessons/export")).data;
export const fetchLessonEditList = async (signal?: AbortSignal) => (await api.get<{ edits: LessonEditStatus[] }>("/admin/lessons/edits", { signal })).data.edits;
// Generic over the content, since the lesson id decides it: the server checks English lessons by the English rules.
export const fetchLessonEdit = async <Content = EditableLesson>(lessonId: string, signal?: AbortSignal) => (await api.get<LessonEdit<Content>>(`${lessonPath(lessonId)}/edit`, { signal })).data;
export const saveLessonDraft = async <Content = EditableLesson>(lessonId: string, content: Content) => (await api.put<LessonEdit<Content>>(`${lessonPath(lessonId)}/draft`, { content })).data;
export const discardLessonDraft = async <Content = EditableLesson>(lessonId: string) => (await api.delete<LessonEdit<Content>>(`${lessonPath(lessonId)}/draft`)).data;
export const publishLessonDraft = async <Content = EditableLesson>(lessonId: string) => (await api.post<LessonEdit<Content>>(`${lessonPath(lessonId)}/publish`)).data;
export const revertLesson = async <Content = EditableLesson>(lessonId: string) => (await api.delete<LessonEdit<Content>>(`${lessonPath(lessonId)}/published`)).data;
