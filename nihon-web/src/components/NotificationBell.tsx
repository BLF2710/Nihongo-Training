import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PersonAvatar from "./PersonAvatar";
import type { InboxSummary } from "../api/communication";
import { apiErrorMessage } from "../api/errors";
import { answerFriendRequest, fetchFriends } from "../api/friends";
import type { FriendRequest } from "../api/friends";
import { fetchNotifications, markNotificationsRead } from "../api/notifications";
import type { AppNotification } from "../api/notifications";
import { refreshInbox } from "../lib/inbox";
import { describeNotification, timeAgo } from "../lib/notifications";
import { useRealtime } from "../lib/realtime";

const SHOWN_REQUESTS = 5;
const SHOWN_RECENT = 6;

/**
 * The header bell: a red count of new notifications and unread conversations, and a panel with friend requests to
 * answer, unread messages and the latest notifications. Opening the panel marks the notifications as read.
 */
export default function NotificationBell({ inbox }: { inbox: InboxSummary | null }) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[] | null>(null);
  const [recent, setRecent] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const friendRequests = inbox?.friendRequests ?? 0, direct = inbox?.direct ?? 0, support = inbox?.support ?? 0;
  const count = (inbox?.notifications ?? 0) + direct;

  // Loads what the panel shows, then marks the notifications as seen (they stay highlighted until the panel closes).
  const load = useCallback(() => Promise.all([fetchFriends().catch(() => null), fetchNotifications({ limit: SHOWN_RECENT })])
    .then(([lists, page]) => {
      if (lists) setRequests(lists.incoming);
      setRecent(current => page.notifications.map(item => ({ ...item, read: item.read && !current?.some(seen => seen.id === item.id && !seen.read) })));
      setError("");
      if (page.unread > 0) return markNotificationsRead().then(() => refreshInbox());
    })
    .catch(failure => setError(apiErrorMessage(failure, "Could not load notifications."))), []);
  useEffect(() => { if (open) void load(); }, [open, load]);
  useRealtime(event => { if (event.type === "friends" || event.type === "notifications" || event.type === "resync") void load(); }, open);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const toggle = () => { if (open) { setOpen(false); setRecent(null); } else setOpen(true); };
  const close = () => { setOpen(false); setRecent(null); };

  const answer = async (request: FriendRequest, accept: boolean) => {
    setBusy(request.id);
    try { await answerFriendRequest(request.id, accept); refreshInbox(); await load(); }
    catch (failure) { setError(apiErrorMessage(failure, "That didn't work. Please try again.")); }
    finally { setBusy(null); }
  };
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const pending = friendRequests > 0 && requests?.length ? requests : [];

  return <div ref={root} className="relative">
    <button ref={button} type="button" onClick={toggle} aria-expanded={open} aria-haspopup="dialog"
      aria-label={`Notifications${count ? `, ${count} new` : ""}`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 cursor-pointer ${open ? "bg-gray-100" : ""}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      {count > 0 && <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full border-2 border-white bg-red-600 px-1 text-center text-[11px] font-bold leading-4 text-white">{count > 9 ? "9+" : count}</span>}
    </button>
    {open && <div role="dialog" aria-label="Notifications" className="fixed inset-x-2 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
      <div className="flex items-center justify-between gap-3"><h2 className="font-black text-gray-900">Notifications</h2><Link to="/notifications" onClick={close} className="text-sm font-bold text-emerald-700 hover:underline">See all</Link></div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}

      {pending.length > 0 && <section aria-label="Friend requests" className="mt-3 rounded-xl bg-gray-50 p-3">
        <h3 className="text-sm font-bold text-gray-700">{plural(friendRequests, "friend request", "friend requests")} waiting</h3>
        <ul className="mt-2 space-y-2">{pending.slice(0, SHOWN_REQUESTS).map(request => <li key={request.id} className="flex items-center gap-3">
          <PersonAvatar name={request.displayName} username={request.username} avatar={request.avatar} />
          <Link to={`/u/${encodeURIComponent(request.username)}`} onClick={close} className="min-w-0 flex-1 hover:underline"><span className="block truncate text-sm font-bold text-gray-900">{request.displayName}</span><span className="block truncate text-xs text-gray-600">@{request.username}</span></Link>
          <button type="button" disabled={busy !== null} onClick={() => void answer(request, true)} aria-label={`Accept friend request from ${request.username}`} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Accept</button>
          <button type="button" disabled={busy !== null} onClick={() => void answer(request, false)} aria-label={`Decline friend request from ${request.username}`} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Decline</button>
        </li>)}</ul>
        {friendRequests > SHOWN_REQUESTS && <Link to="/friends" onClick={close} className="mt-2 inline-block text-sm font-bold text-emerald-700 hover:underline">See all on Friends →</Link>}
      </section>}

      {(direct > 0 || support > 0) && <ul className="mt-3 space-y-1">
        {direct > 0 && <li><Link to="/messages" onClick={close} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-gray-50"><span aria-hidden="true">💬</span><span className="flex-1 font-semibold">{plural(direct, "conversation with unread messages", "conversations with unread messages")}</span><span aria-hidden="true">→</span></Link></li>}
        {support > 0 && <li><Link to="/support" onClick={close} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-gray-50"><span aria-hidden="true">🛟</span><span className="flex-1 font-semibold">{plural(support, "unread reply from support", "unread replies from support")}</span><span aria-hidden="true">→</span></Link></li>}
      </ul>}

      <section aria-label="Recent notifications" className="mt-3 border-t border-gray-100 pt-3">
        {!recent && !error && <p role="status" className="text-sm text-gray-600">Loading…</p>}
        {recent?.length === 0 && pending.length === 0 && direct === 0 && <p className="text-sm text-gray-600">You're all caught up.</p>}
        {recent && recent.length > 0 && <ul className="space-y-1">{recent.map(item => {
          const { icon, text, href } = describeNotification(item);
          return <li key={item.id}><Link to={href} onClick={close} className={`flex gap-3 rounded-xl px-2 py-2 text-sm hover:bg-gray-50 ${item.read ? "text-gray-700" : "bg-emerald-50/60 font-semibold text-gray-900"}`}>
            <span aria-hidden="true">{icon}</span><span className="min-w-0 flex-1"><span className="block break-words">{text}</span><span className="block text-xs font-normal text-gray-500">{timeAgo(item.createdAt)}</span></span>
            {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600"><span className="sr-only">New</span></span>}
          </Link></li>;
        })}</ul>}
      </section>
    </div>}
  </div>;
}
