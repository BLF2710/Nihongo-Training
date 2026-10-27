import api from "./axios";

export type AuditEntry = {
  id: number; action: string; at: string; actor: string | null; targetUser: string | null; targetRef: string | null; details: Record<string, unknown>;
};
export type AuditLogPage = { entries: AuditEntry[]; hasMore: boolean; actions: string[] };
export type AuditFilter = { action?: string; actor?: string; target?: string; before?: number };
export const fetchAuditLog = async (filter: AuditFilter, signal?: AbortSignal) =>
  (await api.get<AuditLogPage>("/admin/audit-log", { signal, params: filter })).data;

export type ReportResolution = "dismissed" | "warned" | "suspended";
export type ReportSummary = {
  learner: { id: number; username: string; displayName: string; status: string };
  openReports: number; reporters: number; recentReporters: number; isRepeated: boolean;
  firstAt: string; lastAt: string; kinds: ("profile" | "message")[]; ticketIds: number[]; earlierResolved: number;
};
export type ReportQueue = { learners: ReportSummary[]; repeatReporters: number; windowDays: number };
export const fetchReportQueue = async (signal?: AbortSignal) => (await api.get<ReportQueue>("/admin/reports", { signal })).data;
export const resolveReports = async (userId: number, resolution: ReportResolution, warning?: string) =>
  (await api.post(`/admin/reports/${userId}/resolve`, { resolution, ...(warning ? { warning } : {}) })).data;
