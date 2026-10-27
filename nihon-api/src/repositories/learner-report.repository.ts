import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type ReportKind = "profile" | "message";
export type ReportResolution = "dismissed" | "warned" | "suspended";
export type ReportedLearnerRow = {
  user_id: number; username: string; display_name: string; status: string; open_reports: number; reporters: number;
  recent_reporters: number; first_at: Date; last_at: Date; kinds: ReportKind[]; ticket_ids: number[]; earlier_resolved: number;
};

export async function insertReport(db: Queryable, report: { reporterId: number; reportedId: number; kind: ReportKind; reason: string; conversationId: number }) {
  await db.query("INSERT INTO learner_reports (reporter_id, reported_id, kind, reason, support_conversation_id) VALUES ($1, $2, $3, $4, $5)",
    [report.reporterId, report.reportedId, report.kind, report.reason, report.conversationId]);
}

/** The support request of this reporter's open report about that learner, if its request still exists. */
export async function findOpenReportTicket(db: Queryable, reporterId: number, reportedId: number): Promise<number | undefined> {
  const result = await db.query(
    `SELECT r.support_conversation_id FROM learner_reports r JOIN conversations c ON c.id = r.support_conversation_id
      WHERE r.reporter_id = $1 AND r.reported_id = $2 AND r.resolved_at IS NULL ORDER BY r.id DESC LIMIT 1`, [reporterId, reportedId]);
  return result.rows[0]?.support_conversation_id;
}

export async function countReportsSince(reporterId: number, hours: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM learner_reports WHERE reporter_id = $1 AND created_at > NOW() - make_interval(hours => $2)", [reporterId, hours]);
  return result.rows[0].count;
}

// Open reports grouped by the learner reported. `recent_reporters` counts different reporters within `$1` days.
const REPORTED_LEARNERS_SQL = `
  SELECT u.id AS user_id, u.username, COALESCE(p.display_name, u.username) AS display_name, u.status,
         COUNT(*)::int AS open_reports, COUNT(DISTINCT r.reporter_id)::int AS reporters,
         COUNT(DISTINCT r.reporter_id) FILTER (WHERE r.created_at > NOW() - make_interval(days => $1))::int AS recent_reporters,
         MIN(r.created_at) AS first_at, MAX(r.created_at) AS last_at,
         ARRAY_AGG(DISTINCT r.kind) AS kinds, ARRAY_REMOVE(ARRAY_AGG(DISTINCT r.support_conversation_id), NULL) AS ticket_ids,
         (SELECT COUNT(*)::int FROM learner_reports old WHERE old.reported_id = u.id AND old.resolved_at IS NOT NULL) AS earlier_resolved
    FROM learner_reports r JOIN users u ON u.id = r.reported_id LEFT JOIN user_profiles p ON p.user_id = u.id
   WHERE r.resolved_at IS NULL`;

/** Learners with open reports, most different reporters first. */
export async function listReportedLearners(windowDays: number): Promise<ReportedLearnerRow[]> {
  const result = await pool.query(`${REPORTED_LEARNERS_SQL} GROUP BY u.id, u.username, p.display_name, u.status
    ORDER BY recent_reporters DESC, last_at DESC`, [windowDays]);
  return result.rows;
}

/** The open reports about the learner a support request is about, if that request is a report. */
export async function findReportSummaryForTicket(conversationId: number, windowDays: number): Promise<ReportedLearnerRow | undefined> {
  const result = await pool.query(`${REPORTED_LEARNERS_SQL}
      AND r.reported_id = (SELECT reported_id FROM learner_reports WHERE support_conversation_id = $2 LIMIT 1)
    GROUP BY u.id, u.username, p.display_name, u.status`, [windowDays, conversationId]);
  return result.rows[0];
}

/** Resolves every open report about a learner; returns the support requests to answer and close, with their reporters. */
export async function resolveOpenReports(db: Queryable, reportedId: number, adminId: number, resolution: ReportResolution) {
  const result = await db.query(
    `UPDATE learner_reports SET resolved_at = NOW(), resolved_by = $2, resolution = $3
      WHERE reported_id = $1 AND resolved_at IS NULL RETURNING reporter_id, support_conversation_id`, [reportedId, adminId, resolution]);
  return result.rows as { reporter_id: number; support_conversation_id: number | null }[];
}
