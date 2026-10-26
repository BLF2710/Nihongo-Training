import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PersonAvatar from "./PersonAvatar";
import { apiErrorMessage } from "../api/errors";
import { fetchLeaderboard } from "../api/friends";
import type { Leaderboard, LeaderboardEntry } from "../api/friends";
import { useRealtime } from "../lib/realtime";

type Metric = "weeklyXp" | "currentStreak" | "weeklyLessons";
const METRICS: { key: Metric; label: string; unit: (n: number) => string }[] = [
  { key: "weeklyXp", label: "XP this week", unit: n => `${n} XP` },
  { key: "currentStreak", label: "Streak", unit: n => `${n} ${n === 1 ? "day" : "days"}` },
  { key: "weeklyLessons", label: "Lessons this week", unit: n => `${n} ${n === 1 ? "lesson" : "lessons"}` },
];
const MEDALS = ["🥇", "🥈", "🥉"];

/** You and your friends, ranked by XP or lessons in the last 7 days, or by current streak. Ties share a place. */
export default function FriendsLeaderboard() {
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState("");
  const [metric, setMetric] = useState<Metric>("weeklyXp");
  const load = useCallback((signal?: AbortSignal) => fetchLeaderboard(signal)
    .then(data => { setBoard(data); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load the leaderboard.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useRealtime(event => { if (event.type === "friends" || event.type === "resync") void load(); });

  const current = METRICS.find(item => item.key === metric)!;
  const sorted = [...(board?.entries ?? [])].sort((a, b) => b[metric] - a[metric] || Number(b.self) - Number(a.self) || a.displayName.localeCompare(b.displayName));
  const place = (entry: LeaderboardEntry) => sorted.filter(other => other[metric] > entry[metric]).length + 1;
  const friendsShown = sorted.filter(entry => !entry.self).length;

  return <section aria-labelledby="leaderboard-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 id="leaderboard-heading" className="text-lg font-bold">Leaderboard</h2><p className="text-sm text-gray-600">You and your friends over the last 7 days.</p></div>
      <div role="group" aria-label="Rank by" className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">{METRICS.map(item =>
        <button key={item.key} type="button" aria-pressed={metric === item.key} onClick={() => setMetric(item.key)} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${metric === item.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{item.label}</button>)}</div>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error} <button className="font-bold underline" onClick={() => void load()}>Try again</button></p>}
    {!board && !error && <p role="status" className="mt-3 text-sm text-gray-600">Loading leaderboard…</p>}
    {board && <>
      <ol className="mt-4 space-y-2" aria-label={`Ranked by ${current.label.toLowerCase()}`}>{sorted.map(entry => {
        const rank = place(entry);
        return <li key={entry.username} className={`flex items-center gap-3 rounded-xl p-2 ${entry.self ? "bg-emerald-50 ring-1 ring-emerald-200" : ""}`}>
          <span className="w-8 text-center font-black text-gray-700" aria-label={`Place ${rank}`}>{entry[metric] > 0 && MEDALS[rank - 1] ? <span aria-hidden="true">{MEDALS[rank - 1]}</span> : rank}</span>
          <PersonAvatar name={entry.displayName} username={entry.username} />
          <Link to={`/u/${encodeURIComponent(entry.username)}`} className="min-w-0 flex-1 hover:underline"><span className="block truncate font-bold text-gray-900">{entry.displayName}{entry.self && <span className="font-normal text-gray-600"> (you)</span>}</span><span className="block truncate text-sm text-gray-600">@{entry.username}{entry.activeToday && " · studied today"}</span></Link>
          <span className="whitespace-nowrap font-black tabular-nums text-gray-900">{current.unit(entry[metric])}</span>
        </li>;
      })}</ol>
      {friendsShown === 0 && <p className="mt-3 text-sm text-gray-600">{board.hidden ? "Your friends keep their progress private." : "Add friends to see how you compare."}</p>}
      {friendsShown > 0 && board.hidden > 0 && <p className="mt-3 text-sm text-gray-600">{board.hidden} {board.hidden === 1 ? "friend keeps" : "friends keep"} their progress private and {board.hidden === 1 ? "isn't" : "aren't"} shown.</p>}
      {sorted.find(entry => entry.self) && friendsShown > 0 && <p className="mt-1 text-xs text-gray-500">Friends with a private profile never appear here. Choose who sees your progress in <Link to="/profile?tab=settings" className="font-semibold text-emerald-700 hover:underline">settings</Link>.</p>}
    </>}
  </section>;
}
