import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PersonAvatar from "../components/PersonAvatar";
import { startDirectConversation } from "../api/communication";
import { apiErrorMessage } from "../api/errors";
import { answerFriendRequest, cancelFriendRequest, fetchFriends, removeFriend, sendFriendRequest } from "../api/friends";
import type { FriendLists, Person } from "../api/friends";
import { friendButton, friendPrimary } from "../lib/friendStyles";
import { refreshInbox } from "../lib/inbox";
import { useRealtime, useRealtimeStatus } from "../lib/realtime";
import { useUserHandle } from "../lib/userHandle";

// Without a live connection the lists are reloaded on this interval instead.
const FALLBACK_POLL_MS = 60_000;
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function FriendsPage() {
  const navigate = useNavigate();
  const live = useRealtimeStatus();
  const handle = useUserHandle();
  const [copied, setCopied] = useState(false);
  const copyHandle = () => { if (handle) void navigator.clipboard?.writeText(`@${handle}`).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => { /* the username stays visible to copy by hand */ }); };
  const [lists, setLists] = useState<FriendLists | null>(null);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const load = useCallback((signal?: AbortSignal) => fetchFriends(signal)
    .then(data => { setLists(data); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your friends.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => {
    if (live === "live") return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, FALLBACK_POLL_MS);
    return () => window.clearInterval(timer);
  }, [live, load]);
  useRealtime(event => { if (event.type === "friends" || event.type === "resync") void load(); });

  // Runs one change, then reloads the lists; the server also tells this learner's other tabs.
  const run = async (key: string, work: () => Promise<unknown>, done?: string) => {
    setBusy(key); setNotice(null);
    try { await work(); if (done) setNotice({ text: done, tone: "ok" }); await load(); refreshInbox(); }
    catch (failure) { setNotice({ text: apiErrorMessage(failure, "That didn't work. Please try again."), tone: "error" }); }
    finally { setBusy(null); }
  };
  const add = (event: FormEvent) => {
    event.preventDefault();
    const name = username.trim().replace(/^@/, "");
    if (!name) return;
    void run("add", async () => {
      const result = await sendFriendRequest(name);
      setUsername("");
      const who = result.person?.username ?? name;
      setNotice({ text: result.state === "friends" ? `You and @${who} are now friends.` : `Friend request sent to @${who}.`, tone: "ok" });
    });
  };
  const message = (person: Person) => void run(`message:${person.username}`, async () => navigate(`/messages/${(await startDirectConversation(person.username)).id}`));
  const profileLink = (person: Person) => <Link to={`/u/${encodeURIComponent(person.username)}`} className="min-w-0 hover:underline"><span className="block truncate font-bold text-gray-900">{person.displayName}</span><span className="block truncate text-sm text-gray-500">@{person.username}</span></Link>;

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-black">Friends</h1><p className="mt-1 text-gray-600">Add learners by their username, see how they're doing and send them a message.</p></div>
      <p className="flex items-center gap-2 text-sm text-gray-600"><span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${live === "live" ? "bg-emerald-600" : "bg-gray-400"}`} />{live === "live" ? "Live: requests appear as they arrive" : "Updates every minute"}</p>
    </div>

    <form onSubmit={add} className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <label htmlFor="friend-username" className="font-bold">Add a friend</label>
      <p className="text-sm text-gray-600">Ask your friend for their username (not their display name); usernames are unique, and there is no public list of learners.</p>
      {handle && <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">Your username: <b className="text-gray-900">@{handle}</b><button type="button" onClick={copyHandle} className="rounded-lg border border-gray-200 px-2 py-0.5 text-xs font-bold text-gray-700 hover:border-emerald-500">{copied ? "Copied" : "Copy"}</button><span role="status" className="sr-only">{copied ? "Username copied" : ""}</span></p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-gray-300 bg-white focus-within:outline-2 focus-within:outline-emerald-600"><span aria-hidden="true" className="pl-3 text-gray-500">@</span><input id="friend-username" value={username} onChange={event => setUsername(event.target.value)} maxLength={31} autoComplete="off" spellCheck={false} placeholder="username" className="w-full rounded-xl bg-transparent px-2 py-2 outline-none" /></div>
        <button className={friendPrimary} disabled={busy === "add" || !username.trim()}>{busy === "add" ? "Sending…" : "Send request"}</button>
      </div>
    </form>
    {notice && <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm ${notice.tone === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{notice.text}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button className="font-bold underline" onClick={() => void load()}>Try again</button></p>}
    {!lists && !error && <p role="status" className="mt-6">Loading friends…</p>}

    {lists && <>
      {lists.incoming.length > 0 && <section aria-labelledby="incoming-heading" className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5">
        <h2 id="incoming-heading" className="text-lg font-bold">Friend requests <span className="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">{lists.incoming.length}</span></h2>
        <ul className="mt-3 divide-y divide-gray-100">{lists.incoming.map(request => <li key={request.id} className="flex flex-wrap items-center gap-3 py-3">
          <PersonAvatar name={request.displayName} username={request.username} />{profileLink(request)}<span className="text-sm text-gray-500">{day(request.sentAt)}</span>
          <div className="ml-auto flex w-full justify-end gap-2 sm:w-auto">
            <button className={friendPrimary} disabled={!!busy} aria-label={`Accept friend request from ${request.username}`} onClick={() => void run(`req:${request.id}`, () => answerFriendRequest(request.id, true), `You and @${request.username} are now friends.`)}>Accept</button>
            <button className={friendButton} disabled={!!busy} aria-label={`Decline friend request from ${request.username}`} onClick={() => void run(`req:${request.id}`, () => answerFriendRequest(request.id, false), `Request from @${request.username} declined.`)}>Decline</button>
          </div>
        </li>)}</ul>
      </section>}

      <section aria-labelledby="friends-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 id="friends-heading" className="text-lg font-bold">Your friends ({lists.friends.length})</h2>
        {lists.friends.length === 0 ? <p className="mt-2 text-gray-600">No friends yet. Send a request above, or accept one when it arrives.</p> :
        <ul className="mt-3 divide-y divide-gray-100">{lists.friends.map(friend => <li key={friend.username} className="flex flex-wrap items-center gap-3 py-3">
          <PersonAvatar name={friend.displayName} username={friend.username} />
          <div className="min-w-0 flex-1">{profileLink(friend)}<p className="text-sm text-gray-600">{friend.progress
            ? <>Level {friend.progress.level} · {friend.progress.currentStreak > 0 ? `🔥 ${friend.progress.currentStreak}-day streak` : "No current streak"}{friend.progress.activeToday && <> · <span className="font-semibold text-emerald-700">studied today</span></>}</>
            : "Progress is private"}</p></div>
          {confirmRemove === friend.username
            ? <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto"><span className="text-sm">Remove @{friend.username}?</span><button className={friendButton + " text-red-700"} disabled={!!busy} onClick={() => void run(`remove:${friend.username}`, async () => { await removeFriend(friend.username); setConfirmRemove(null); }, `@${friend.username} is no longer your friend.`)}>Remove</button><button className={friendButton} onClick={() => setConfirmRemove(null)}>Keep</button></div>
            : <div className="flex w-full justify-end gap-2 sm:w-auto"><button className={friendButton} disabled={!!busy} onClick={() => message(friend)} aria-label={`Message ${friend.username}`}>Message</button><button className={friendButton} disabled={!!busy} onClick={() => setConfirmRemove(friend.username)} aria-label={`Remove ${friend.username}`}>Remove</button></div>}
        </li>)}</ul>}
      </section>

      {lists.outgoing.length > 0 && <section aria-labelledby="outgoing-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 id="outgoing-heading" className="text-lg font-bold">Sent requests</h2>
        <ul className="mt-3 divide-y divide-gray-100">{lists.outgoing.map(request => <li key={request.id} className="flex flex-wrap items-center gap-3 py-3">
          <PersonAvatar name={request.displayName} username={request.username} />{profileLink(request)}<span className="text-sm text-gray-500">Sent {day(request.sentAt)}</span>
          <button className={friendButton + " ml-auto"} disabled={!!busy} aria-label={`Cancel friend request to ${request.username}`} onClick={() => void run(`req:${request.id}`, () => cancelFriendRequest(request.id), `Request to @${request.username} cancelled.`)}>Cancel</button>
        </li>)}</ul>
      </section>}
      <p className="mt-6 text-sm text-gray-600">Choose who can see your progress and whether others can send you requests in <Link to="/profile?tab=settings" className="font-bold text-emerald-700 hover:underline">profile settings</Link>.</p>
    </>}
  </main></div>;
}
