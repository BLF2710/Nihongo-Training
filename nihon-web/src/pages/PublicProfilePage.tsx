import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PersonAvatar from "../components/PersonAvatar";
import ProfileSafetyActions from "../components/ProfileSafetyActions";
import { startDirectConversation } from "../api/communication";
import { apiErrorMessage } from "../api/errors";
import { answerFriendRequest, cancelFriendRequest, fetchPublicProfile, removeFriend, sendFriendRequest } from "../api/friends";
import { VISIBILITY_TEXT } from "../api/friends";
import type { PublicProfile } from "../api/friends";
import { friendButton, friendPrimary } from "../lib/friendStyles";
import { refreshInbox } from "../lib/inbox";
import { useRealtime } from "../lib/realtime";


// A fresh view per username, so moving from one profile to another never shows the previous learner.
export default function PublicProfilePage() {
  const { username = "" } = useParams();
  return <ProfileView key={username.toLowerCase()} username={username} />;
}

function ProfileView({ username }: { username: string }) {
  const invited = useSearchParams()[0].get("invite") === "1";
  const navigate = useNavigate();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<{ text: string; missing: boolean } | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const load = useCallback((signal?: AbortSignal) => fetchPublicProfile(username, signal)
    .then(profile => { setData(profile); setError(null); })
    .catch(failure => {
      if (signal?.aborted) return;
      const status = (failure as { response?: { status?: number } }).response?.status;
      setError({ text: apiErrorMessage(failure, "Could not load this profile."), missing: status === 404 || status === 400 });
    }), [username]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  // A request, answer or removal by the other learner shows here at once.
  useRealtime(event => { if (event.type === "friends" || event.type === "resync") void load(); });

  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true); setNotice("");
    try { await work(); setNotice(done); setConfirmRemove(false); await load(); refreshInbox(); }
    catch (failure) { setNotice(apiErrorMessage(failure, "That didn't work. Please try again.")); }
    finally { setBusy(false); }
  };

  if (isBlocked) return <Page><section role="status" className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
    <h1 className="text-2xl font-black">You blocked @{username}</h1>
    <p className="mt-2 text-gray-600">They can't find, message or add you any more. You can unblock them in Settings.</p>
    <div className="mt-5 flex justify-center gap-3"><Link to="/settings/blocked" className={friendButton}>Blocked learners</Link><Link to="/friends" className={friendPrimary}>Go to Friends</Link></div>
  </section></Page>;
  if (error) return <Page><section className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
    <h1 className="text-2xl font-black">{error.missing ? "Learner not found" : "Profile unavailable"}</h1>
    <p className="mt-2 text-gray-600">{error.missing ? "No learner has that username." : error.text}</p>
    <div className="mt-5 flex justify-center gap-3">{!error.missing && <button className={friendButton} onClick={() => void load()}>Try again</button>}<Link to="/friends" className={friendPrimary}>Go to Friends</Link></div>
  </section></Page>;
  if (!data) return <Page><p role="status">Loading profile…</p></Page>;

  const { friendship, profile } = data;
  const self = friendship.state === "self";
  const joined = new Date(data.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const actions = self ? <Link to="/settings/profile" className={friendButton}>Edit profile & privacy</Link> : <>
    {friendship.state === "none" && (data.canRequest
      ? <button className={friendPrimary} disabled={busy} onClick={() => void act(() => sendFriendRequest(data.username), `Friend request sent to @${data.username}.`)}>Add friend</button>
      : <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600">Not accepting friend requests</span>)}
    {friendship.state === "outgoing" && <><span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">Request sent</span><button className={friendButton} disabled={busy} onClick={() => void act(() => cancelFriendRequest(friendship.requestId!), "Request cancelled.")}>Cancel request</button></>}
    {friendship.state === "incoming" && <><button className={friendPrimary} disabled={busy} onClick={() => void act(() => answerFriendRequest(friendship.requestId!, true), `You and @${data.username} are now friends.`)}>Accept request</button><button className={friendButton} disabled={busy} onClick={() => void act(() => answerFriendRequest(friendship.requestId!, false), "Request declined.")}>Decline</button></>}
    {friendship.state === "friends" && (confirmRemove
      ? <><span className="text-sm">Remove @{data.username} as a friend?</span><button className={friendButton + " text-red-700"} disabled={busy} onClick={() => void act(() => removeFriend(data.username), `@${data.username} is no longer your friend.`)}>Remove</button><button className={friendButton} onClick={() => setConfirmRemove(false)}>Keep</button></>
      : <><span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">✓ Friends</span><button className={friendButton} onClick={() => setConfirmRemove(true)}>Remove friend</button></>)}
    <button className={friendButton} disabled={busy} onClick={() => void act(async () => navigate(`/messages/${(await startDirectConversation(data.username)).id}`), "")}>Message</button>
  </>;

  return <Page>
    {invited && <p role="status" className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-900">{self
      ? "This is your invite link. Share it so friends can add you."
      : friendship.state === "friends" ? `You're already friends with @${data.username}.`
      : friendship.state === "outgoing" ? `Your friend request to @${data.username} is waiting for an answer.`
      : friendship.state === "incoming" ? `@${data.username} invited you and already sent you a request. Accept it below.`
      : data.canRequest ? `@${data.username} invited you to be friends. Press Add friend to send a request.`
      : `@${data.username} isn't accepting friend requests right now.`}</p>}
    {self && !invited && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">This is how other learners see your profile. {VISIBILITY_TEXT[data.visibility]}</p>}
    <section className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <PersonAvatar name={data.displayName} username={data.username} avatar={data.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-3xl font-black">{data.displayName}</h1>
          <p className="text-gray-600">@{data.username} · Joined {joined}</p>
          {profile?.activeToday && <p className="mt-1 text-sm font-semibold text-emerald-700">Studied today</p>}
          {!!profile?.friendStreak && <p className="mt-1 text-sm font-semibold text-amber-800"><span aria-hidden="true">🤝 </span>You've both studied {profile.friendStreak} {profile.friendStreak === 1 ? "day" : "days"} in a row</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>
      {notice && <p role="status" className="mt-3 text-sm text-gray-700">{notice}</p>}
      {!self && <ProfileSafetyActions username={data.username} onBlocked={() => setIsBlocked(true)} />}
    </section>

    {!profile ? <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <p className="text-3xl" aria-hidden="true">🔒</p>
      <h2 className="mt-2 text-lg font-bold">{data.visibility === "friends" ? `Only @${data.username}'s friends can see their progress` : `@${data.username} keeps their progress private`}</h2>
      <p className="mt-1 text-gray-600">{data.visibility === "friends" && friendship.state !== "friends" ? "Once you're friends, you'll see their level, streak and achievements here." : "Their level, streak and achievements are hidden."}</p>
    </section> : <>
      {(profile.bio || profile.learningGoal || profile.learningLanguage || profile.nativeLanguage) && <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-black">About</h2>
        {profile.bio && <p className="mt-2 whitespace-pre-line break-words text-gray-700">{profile.bio}</p>}
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {profile.learningLanguage && <div><dt className="inline text-gray-500">Learning </dt><dd className="inline font-semibold">{profile.learningLanguage}</dd></div>}
          {profile.nativeLanguage && <div><dt className="inline text-gray-500">Speaks </dt><dd className="inline font-semibold">{profile.nativeLanguage}</dd></div>}
          {profile.learningGoal && <div><dt className="inline text-gray-500">Goal: </dt><dd className="inline font-semibold">{profile.learningGoal}</dd></div>}
        </dl>
      </section>}
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([
          [`Level ${profile.level}`, `${profile.xp} XP · ${profile.rank}`],
          ["Streak", `${profile.currentStreak} ${profile.currentStreak === 1 ? "day" : "days"}${profile.longestStreak ? ` · best ${profile.longestStreak}` : ""}`],
          ["Course", profile.latestUnit ? `${profile.latestUnit.level} · Unit ${profile.latestUnit.number} passed` : `${profile.lessonsCompleted} lessons done`],
          ["Friends", String(profile.friends)],
        ] as const).map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5"><dt className="text-xs font-bold uppercase text-gray-500">{label}</dt><dd className="mt-2 text-lg font-black">{value}</dd></div>)}
      </dl>
      <p className="mt-3 text-sm text-gray-600">{profile.lessonsCompleted} lessons completed · {profile.unitsPassed} unit {profile.unitsPassed === 1 ? "test" : "tests"} passed{profile.latestUnit && <> · latest: {profile.latestUnit.title}</>}</p>
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-black">Achievements ({profile.achievements.length})</h2>
        {profile.achievements.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{profile.achievements.map(item => <li key={item.id} className="rounded-xl bg-amber-50 p-3"><p className="font-bold"><span aria-hidden="true">🏆 </span>{item.title}</p><p className="text-sm text-gray-600">{item.description}</p></li>)}</ul>
          : <p className="mt-2 text-sm text-gray-600">No achievements yet.</p>}
      </section>
    </>}
  </Page>;
}

function Page({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main></div>;
}
