import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import { cheerFriend, fetchFriendActivity } from "../api/social";
import type { FeedItem } from "../api/social";
import { friendButton } from "../lib/friendStyles";
import { timeAgo } from "../lib/notifications";
import { useRealtime } from "../lib/realtime";
import PersonAvatar from "./PersonAvatar";

function whatHappened(item: FeedItem): string {
  if (item.kind === "lessons") return `completed ${item.lessons} ${item.lessons === 1 ? "lesson" : "lessons"}`;
  if (item.kind === "unit") return item.unit ? `passed ${item.unit.level} Unit ${item.unit.number}: ${item.unit.title}` : "passed a unit test";
  return `earned “${item.achievement.title}”`;
}
const ICONS: Record<FeedItem["kind"], string> = { lessons: "📘", unit: "🎓", achievement: "🏆" };

/** Friends' lessons, passed units and achievements from the last two weeks, with a Cheer button. */
export default function FriendActivityFeed() {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [days, setDays] = useState(14);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback((signal?: AbortSignal) => fetchFriendActivity(signal).then(feed => { setItems(feed.items); setDays(feed.days); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your friends' activity.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useRealtime(event => { if (event.type === "friends" || event.type === "resync") void load(); });
  const cheer = async (item: FeedItem) => {
    const key = `${item.person.username}:${item.key}`;
    setBusy(key); setError("");
    try { await cheerFriend(item.person.username, item.key); setItems(list => list?.map(entry => entry === item ? { ...entry, cheered: true } : entry) ?? null); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not send the cheer.")); }
    finally { setBusy(null); }
  };
  return <section aria-labelledby="activity-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
    <h2 id="activity-heading" className="text-lg font-bold">Friend activity</h2>
    {!items && !error && <p role="status" className="mt-2 text-sm text-gray-600">Loading…</p>}
    {items && (items.length === 0
      ? <p className="mt-2 text-sm text-gray-600">Nothing from your friends in the last {days} days. Friends with a private profile, or who turned sharing off, don't appear here.</p>
      : <ul className="mt-2 divide-y divide-gray-100">{items.map(item => <li key={`${item.person.username}:${item.key}`} className="flex flex-wrap items-center gap-3 py-3">
        <PersonAvatar name={item.person.displayName} username={item.person.username} avatar={item.person.avatar} />
        <p className="min-w-0 flex-1 text-sm"><Link to={`/u/${encodeURIComponent(item.person.username)}`} className="font-bold text-gray-900 hover:underline">{item.person.displayName}</Link> {whatHappened(item)} <span aria-hidden="true">{ICONS[item.kind]}</span>
          <span className="block text-xs text-gray-500">{timeAgo(item.at)}</span></p>
        {item.cheered ? <span className="text-sm font-semibold text-emerald-700">🎉 Cheered</span>
          : <button className={friendButton} disabled={busy !== null} onClick={() => void cheer(item)} aria-label={`Cheer ${item.person.username}: ${whatHappened(item)}`}>🎉 Cheer</button>}
      </li>)}</ul>)}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </section>;
}
