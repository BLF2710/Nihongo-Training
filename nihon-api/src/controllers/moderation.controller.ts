import { getAuditLog } from "../services/audit-log.service";
import * as lessonEdits from "../services/lesson-edit.service";
import { getReportQueue, resolveReports } from "../services/moderation.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const listAuditLog = action(async (req, res) => res.json(await getAuditLog(req.query)),
  { label: "Admin audit log", message: "Could not load the audit log." });

export const listReports = action(async (_req, res) => res.json(await getReportQueue()),
  { label: "Admin reports", message: "Could not load reports." });
export const resolveLearnerReports = action(async (req, res) => res.json(await resolveReports(getUserId(req), req.params.userId, req.body ?? {})),
  { label: "Admin resolve reports", message: "Could not resolve the reports." });

export const listLessonEdits = action(async (_req, res) => res.json(await lessonEdits.getLessonEditList()),
  { label: "Admin lesson edits", message: "Could not load lesson edits." });
export const getLessonEdit = action(async (req, res) => res.json(await lessonEdits.getLessonEdit(req.params.lessonId)),
  { label: "Admin lesson edit", message: "Could not load this lesson." });
export const saveLessonDraft = action(async (req, res) => res.json(await lessonEdits.saveLessonDraft(getUserId(req), req.params.lessonId, req.body?.content)),
  { label: "Admin lesson draft", message: "Could not save the draft." });
export const discardLessonDraft = action(async (req, res) => res.json(await lessonEdits.discardLessonDraft(getUserId(req), req.params.lessonId)),
  { label: "Admin lesson draft discard", message: "Could not discard the draft." });
export const publishLesson = action(async (req, res) => res.json(await lessonEdits.publishLessonDraft(getUserId(req), req.params.lessonId)),
  { label: "Admin lesson publish", message: "Could not publish the lesson." });
export const revertLesson = action(async (req, res) => res.json(await lessonEdits.revertLesson(getUserId(req), req.params.lessonId)),
  { label: "Admin lesson revert", message: "Could not restore the original lesson." });

export const exportLessonEdits = action(async (_req, res) => res.json(await lessonEdits.exportPublishedLessonEdits()),
  { label: "Admin lesson export", message: "Could not export the lesson edits." });

export const getPublishedLessonEdits = action(async (_req, res) => {
  res.set("Cache-Control", "no-cache");
  return res.json(await lessonEdits.getPublishedLessonEdits());
}, { label: "Published lesson edits", message: "Could not load lesson updates." });
