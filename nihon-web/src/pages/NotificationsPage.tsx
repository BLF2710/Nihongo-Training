import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiErrorMessage } from "../api/errors";
import { fetchNotifications, markNotificationsRead } from "../api/notifications";
import type { AppNotification } from "../api/notifications";
import { refreshInbox } from "../lib/inbox";
import { describeNotification, timeAgo } from "../lib/notifications";
import { useRealtime } from "../lib/realtime";

const PAGE = 20;

/** The full notification history, newest first. Visiting the page marks everything as read. */
export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  // Ids that were unread when they arrived on this page, so they stay highlighted after being marked read.
  const [fresh, setFresh] = useState<ReadonlySet<number>>(new Set());

  const load = useCallback((signal?: AbortSignal) => fetchNotifications({ limit: PAGE }, signal)
    .then(page => {
      const unread = page.notifications.filter(item => !item.read).map(item => item.id);
      if (unread.length) setFresh(current => new Set([...current, ...unread]));
      // Keep older pages already loaded below the newest page.
      setItems(current => {
        const newest = page.notifications, oldestId = newest.at(-1)?.id ?? Infinity;
        return [...newest, ...(current ?? []).filter(item => item.id < oldestId)];
      });
      setHasMore(current => current || page.hasMore);
      setError("");
      if (page.unread > 0) return markNotificationsRead().then(() => refreshInbox());
    })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your notifications.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useRealtime(event => { if (event.type === "notifications" || event.type === "resync") void load(); });

  const loadOlder = async () => {
    const oldest = items?.at(-1)?.id;
    if (!oldest) return;
    setLoadingMore(true);
    try {
      const page = await fetchNotifications({ before: oldest, limit: PAGE });
      setItems(current => [...(current ?? []), ...page.notifications.filter(item => !current?.some(seen => seen.id === item.id))]);
      setHasMore(page.hasMore);
    } catch (failure) { setError(apiErrorMessage(failure, "Could not load older notifications.")); }
    finally { setLoadingMore(false); }
  };

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <h1 className="text-3xl font-black">Notifications</h1>
    <p className="mt-1 text-gray-600">Friend requests, replies from support and achievements from the last 6 months.</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button className="font-bold underline" onClick={() => void load()}>Try again</button></p>}
    {!items && !error && <p role="status" className="mt-6">Loading notifications…</p>}
    {items?.length === 0 && <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center"><p className="text-3xl" aria-hidden="true">🔔</p><p className="mt-2 font-bold">No notifications yet</p><p className="mt-1 text-gray-600">You'll see friend requests, replies from support and new achievements here.</p></section>}
    {items && items.length > 0 && <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">{items.map(item => {
      const { icon, text, href } = describeNotification(item), isNew = fresh.has(item.id);
      return <li key={item.id}><Link to={href} className={`flex gap-4 p-4 hover:bg-gray-50 ${isNew ? "bg-emerald-50/60" : ""}`}>
        <span aria-hidden="true" className="text-xl">{icon}</span>
        <span className="min-w-0 flex-1"><span className={`block break-words ${isNew ? "font-semibold text-gray-900" : "text-gray-700"}`}>{text}</span><span className="mt-0.5 block text-sm text-gray-500"><time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString()}>{timeAgo(item.createdAt)}</time></span></span>
        {isNew && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600"><span className="sr-only">New</span></span>}
      </Link></li>;
    })}</ul>}
    {hasMore && <button className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500 disabled:opacity-50" disabled={loadingMore} onClick={() => void loadOlder()}>{loadingMore ? "Loading…" : "Load older notifications"}</button>}
    <p className="mt-6 text-sm text-gray-600">Friend requests can be answered on the <Link to="/friends" className="font-bold text-emerald-700 hover:underline">Friends</Link> page.</p>
  </main></div>;
}
