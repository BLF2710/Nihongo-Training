import { useEffect, useState } from "react";
import { apiErrorMessage } from "../api/errors";
import { fetchBlockedLearners, unblockLearner } from "../api/social";
import type { BlockedLearner } from "../api/social";
import { friendButton } from "../lib/friendStyles";

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Learners you blocked (from a profile or from Messages), with Unblock. */
export default function BlockedLearners() {
  const [blocked, setBlocked] = useState<BlockedLearner[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchBlockedLearners(controller.signal).then(setBlocked)
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Could not load your blocked learners.")); });
    return () => controller.abort();
  }, []);
  const unblock = async (username: string) => {
    setBusy(username); setError("");
    try { await unblockLearner(username); setBlocked(list => list?.filter(item => item.username !== username) ?? null); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not unblock this learner.")); }
    finally { setBusy(null); }
  };
  return <section aria-labelledby="blocked-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
    <h2 id="blocked-heading" className="font-black">Blocked learners</h2>
    <p className="text-sm text-gray-600">Blocked learners can't find your profile, message you or send you friend requests. Unblocking doesn't make you friends again.</p>
    {!blocked && !error && <p role="status" className="mt-2 text-sm text-gray-600">Loading…</p>}
    {blocked && (blocked.length === 0 ? <p className="mt-3 text-sm text-gray-600">You haven't blocked anyone.</p>
      : <ul className="mt-3 divide-y divide-gray-100">{blocked.map(item => <li key={item.username} className="flex flex-wrap items-center gap-3 py-3">
        <span className="min-w-0 flex-1"><span className="block truncate font-bold">{item.displayName}</span><span className="block text-sm text-gray-500">@{item.username} · blocked {day(item.blockedAt)}</span></span>
        <button className={friendButton} disabled={busy !== null} onClick={() => void unblock(item.username)} aria-label={`Unblock ${item.username}`}>{busy === item.username ? "Unblocking…" : "Unblock"}</button>
      </li>)}</ul>)}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>;
}
