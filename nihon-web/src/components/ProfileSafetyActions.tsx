import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import { blockLearner, reportLearner } from "../api/social";
import { friendButton, friendDanger, friendPrimary } from "../lib/friendStyles";

const MAX_REPORT_LENGTH = 500;

type Props = { username: string; onBlocked: () => void };

/** Block and Report on another learner's profile. */
export default function ProfileSafetyActions({ username, onBlocked }: Props) {
  const [mode, setMode] = useState<"idle" | "block" | "report">("idle");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reportId, setReportId] = useState<number | null>(null);

  const block = async () => {
    setBusy(true); setError("");
    try { await blockLearner(username); onBlocked(); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not block this learner.")); setBusy(false); }
  };
  const report = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try { setReportId((await reportLearner(username, reason.trim())).supportConversationId); setMode("idle"); setReason(""); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not send the report. Please try again.")); }
    finally { setBusy(false); }
  };

  return <div className="mt-4 border-t border-gray-100 pt-4">
    {mode === "idle" && <div className="flex flex-wrap gap-2">
      <button className={friendButton} onClick={() => { setMode("report"); setReportId(null); }}>Report</button>
      <button className={friendButton + " text-red-700"} onClick={() => setMode("block")}>Block</button>
    </div>}
    {mode === "block" && <div role="group" aria-labelledby="block-heading" className="rounded-xl bg-red-50 p-4">
      <p id="block-heading" className="font-bold text-red-900">Block @{username}?</p>
      <p className="mt-1 text-sm text-red-900">You'll stop being friends, open challenges end, and neither of you can find, message or add the other. You can unblock them later in Settings.</p>
      <div className="mt-3 flex gap-2"><button className={friendDanger} disabled={busy} onClick={() => void block()}>{busy ? "Blocking…" : "Block"}</button><button className={friendButton} disabled={busy} onClick={() => setMode("idle")}>Cancel</button></div>
    </div>}
    {mode === "report" && <form onSubmit={report} className="rounded-xl bg-gray-50 p-4">
      <label htmlFor="report-reason" className="font-bold">Report @{username}</label>
      <p className="text-sm text-gray-600">Tell the support team what's wrong with this profile. @{username} won't be told who reported them.</p>
      <textarea id="report-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={MAX_REPORT_LENGTH} rows={3} required
        className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm" />
      <div className="mt-2 flex gap-2"><button className={friendPrimary} disabled={busy || !reason.trim()}>{busy ? "Sending…" : "Send report"}</button><button type="button" className={friendButton} disabled={busy} onClick={() => setMode("idle")}>Cancel</button></div>
    </form>}
    {reportId !== null && <p role="status" className="mt-3 text-sm text-gray-700">Report sent. You can follow it in <Link to={`/support/${reportId}`} className="font-bold text-emerald-700 hover:underline">Help & support</Link>.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </div>;
}
