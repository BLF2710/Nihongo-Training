import { withTransaction } from "../db/transaction";
import { createConversation, insertMessage, setConversationStatusIn } from "../repositories/conversation.repository";
import {
  countReportsSince, findOpenReportTicket, findReportSummaryForTicket, insertReport, listReportedLearners, resolveOpenReports,
} from "../repositories/learner-report.repository";
import type { ReportedLearnerRow, ReportKind, ReportResolution } from "../repositories/learner-report.repository";
import { insertNotification } from "../repositories/notification.repository";
import { suspendLearner } from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { recordAdminAction } from "./audit-log.service";
import { publish } from "./realtime.service";

const MAX_REPORTS_PER_DAY = 10;
const HOURS_PER_DAY = 24;
// A learner reported by this many different learners within the window is flagged as reported repeatedly.
export const REPEAT_REPORTERS = 3;
export const REPEAT_WINDOW_DAYS = 30;
const MAX_WARNING_LENGTH = 1000;
const RESOLUTIONS: readonly ReportResolution[] = ["dismissed", "warned", "suspended"];

// What each reporter is told when their report is closed. The other learner's outcome is not spelled out.
const REPLY_TO_REPORTER: Record<ReportResolution, string> = {
  dismissed: "Thank you for your report. We looked into it and didn't find anything that breaks the community rules. If something else happens, please report it again.",
  warned: "Thank you for your report. We looked into it and have taken action.",
  suspended: "Thank you for your report. We looked into it and have taken action.",
};
const WARNING_SUBJECT = "A message from the support team";

type NewReport = { reporterId: number; reported: { id: number; username: string }; kind: ReportKind; reason: string; subject: string; body: string };

/**
 * Files a learner's report as a support request. A second report by the same learner about the same person, while
 * the first is still open, is added to that request instead of opening another one.
 */
export async function fileReport(report: NewReport): Promise<{ supportConversationId: number; merged: boolean }> {
  if (await countReportsSince(report.reporterId, HOURS_PER_DAY) >= MAX_REPORTS_PER_DAY) throw new HttpError(429, "You've sent a lot of reports today. Please try again tomorrow.");
  return withTransaction(async client => {
    const existing = await findOpenReportTicket(client, report.reporterId, report.reported.id);
    const conversationId = existing ?? await createConversation(client, { kind: "support", subject: report.subject, createdBy: report.reporterId, memberIds: [report.reporterId] });
    await insertMessage(client, { conversationId, senderId: report.reporterId, senderRole: "learner", body: report.body });
    if (existing) await setConversationStatusIn(client, existing, "open");
    await insertReport(client, { reporterId: report.reporterId, reportedId: report.reported.id, kind: report.kind, reason: report.reason, conversationId });
    return { supportConversationId: conversationId, merged: existing !== undefined };
  });
}

function toSummary(row: ReportedLearnerRow) {
  return {
    learner: { id: row.user_id, username: row.username, displayName: row.display_name, status: row.status },
    openReports: row.open_reports, reporters: row.reporters, recentReporters: row.recent_reporters,
    isRepeated: row.recent_reporters >= REPEAT_REPORTERS, firstAt: row.first_at, lastAt: row.last_at,
    kinds: row.kinds, ticketIds: row.ticket_ids.map(Number), earlierResolved: row.earlier_resolved,
  };
}

/** Learners with open reports, those reported by several learners first. */
export async function getReportQueue() {
  const rows = await listReportedLearners(REPEAT_WINDOW_DAYS);
  return { learners: rows.map(toSummary), repeatReporters: REPEAT_REPORTERS, windowDays: REPEAT_WINDOW_DAYS };
}

/** The open reports about the learner a support request reports, or null if it isn't a report. */
export async function getTicketReports(conversationId: number) {
  const row = await findReportSummaryForTicket(conversationId, REPEAT_WINDOW_DAYS);
  return row ? toSummary(row) : null;
}

/**
 * Closes every open report about a learner at once: dismissed, warned (the learner gets the warning as a support
 * message) or suspended. Each reporter gets a reply and their request is closed.
 */
export async function resolveReports(adminId: number, rawUserId: unknown, input: { resolution?: unknown; warning?: unknown }) {
  const userId = Number(rawUserId);
  if (!Number.isSafeInteger(userId) || userId < 1) throw new HttpError(404, "Learner not found.");
  const resolution = input.resolution;
  if (typeof resolution !== "string" || !(RESOLUTIONS as readonly string[]).includes(resolution)) throw new HttpError(400, "Choose dismiss, warn or suspend.");
  const warning = typeof input.warning === "string" ? input.warning.trim() : "";
  if (resolution === "warned" && !warning) throw new HttpError(400, "Write the warning the learner will receive.");
  if (warning.length > MAX_WARNING_LENGTH) throw new HttpError(400, `Keep the warning under ${MAX_WARNING_LENGTH} characters.`);
  const outcome = resolution as ReportResolution;
  const reporters = await withTransaction(async client => {
    const resolved = await resolveOpenReports(client, userId, adminId, outcome);
    if (resolved.length === 0) throw new HttpError(404, "There are no open reports about this learner.");
    if (outcome === "suspended" && await suspendLearner(client, userId)) await recordAdminAction(client, { actorId: adminId, action: "user.suspended", targetUserId: userId, details: { reason: "reports" } });
    if (outcome === "warned") {
      const warningId = await createConversation(client, { kind: "support", subject: WARNING_SUBJECT, createdBy: userId, memberIds: [userId] });
      await insertMessage(client, { conversationId: warningId, senderId: adminId, senderRole: "admin", body: warning });
      await insertNotification(client, { userId, kind: "support_reply", data: { conversationId: warningId, subject: WARNING_SUBJECT } });
    }
    const tickets = new Map(resolved.flatMap(row => row.support_conversation_id ? [[row.support_conversation_id, row.reporter_id] as const] : []));
    for (const [conversationId, reporterId] of tickets) {
      await insertMessage(client, { conversationId, senderId: adminId, senderRole: "admin", body: REPLY_TO_REPORTER[outcome] });
      await insertNotification(client, { userId: reporterId, kind: "support_reply", data: { conversationId, subject: "Your report" } });
      await setConversationStatusIn(client, conversationId, "closed");
    }
    await recordAdminAction(client, { actorId: adminId, action: "reports.resolved", targetUserId: userId, details: { resolution: outcome, reports: resolved.length, ...(warning ? { warning } : {}) } });
    return [...new Set(tickets.values())];
  });
  for (const id of [...reporters, userId]) { publish(id, { type: "inbox" }); publish(id, { type: "notifications" }); }
  return { resolution: outcome };
}
