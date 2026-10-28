import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiErrorMessage } from "../api/errors";
import { answerChallenge, cancelChallenge, CHALLENGE_METRIC_TEXT, createChallenge, fetchChallenges } from "../api/social";
import type { ChallengeDays, ChallengeMetric, FriendChallenge } from "../api/social";
import type { Person } from "../api/friends";
import { friendButton, friendPrimary } from "../lib/friendStyles";
import { useRealtime } from "../lib/realtime";
import PersonAvatar from "./PersonAvatar";

const DURATIONS: ChallengeDays[] = [3, 7];
const METRICS: ChallengeMetric[] = ["xp", "lessons"];
const unitOf = (metric: ChallengeMetric, score: number) => metric === "xp" ? `${score} XP` : `${score} ${score === 1 ? "lesson" : "lessons"}`;
const endsOn = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const OUTCOME_TEXT = { won: "🏆 You won", lost: "They won", tied: "It's a tie" } as const;

/** Starts a challenge with one friend (shown under that friend on the Friends page). */
export function ChallengeForm({ friend, onDone }: { friend: Person; onDone: (message: string) => void }) {
  const [metric, setMetric] = useState<ChallengeMetric>("xp");
  const [days, setDays] = useState<ChallengeDays>(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await createChallenge(friend.username, metric, days); onDone(`Challenge sent to @${friend.username}.`); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not send the challenge.")); setBusy(false); }
  };
  return <form onSubmit={send} className="w-full rounded-xl bg-amber-50 p-4" aria-label={`Challenge ${friend.username}`}>
    <p className="font-bold">Challenge @{friend.username}</p>
    <p className="text-sm text-gray-700">It starts when they accept. Whoever has more at the end wins.</p>
    <div className="mt-3 flex flex-wrap gap-4">
      <fieldset><legend className="text-sm font-semibold">Goal</legend><div className="mt-1 flex gap-3">{METRICS.map(value => <label key={value} className="flex items-center gap-1 text-sm">
        <input type="radio" name="challenge-metric" checked={metric === value} onChange={() => setMetric(value)} />{CHALLENGE_METRIC_TEXT[value]}</label>)}</div></fieldset>
      <fieldset><legend className="text-sm font-semibold">Length</legend><div className="mt-1 flex gap-3">{DURATIONS.map(value => <label key={value} className="flex items-center gap-1 text-sm">
        <input type="radio" name="challenge-days" checked={days === value} onChange={() => setDays(value)} />{value} days</label>)}</div></fieldset>
    </div>
    <div className="mt-3 flex gap-2"><button className={friendPrimary} disabled={busy}>{busy ? "Sending…" : "Send challenge"}</button><button type="button" className={friendButton} disabled={busy} onClick={() => onDone("")}>Cancel</button></div>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </form>;
}

function ChallengeRow({ challenge, busy, act }: { challenge: FriendChallenge; busy: boolean; act: (work: () => Promise<unknown>) => void }) {
  const { friend, metric } = challenge;
  const goal = `${CHALLENGE_METRIC_TEXT[metric]} in ${challenge.days} days`;
  const score = `You ${unitOf(metric, challenge.myScore)} · @${friend.username} ${unitOf(metric, challenge.theirScore)}`;
  return <li className="flex flex-wrap items-center gap-3 py-3">
    <PersonAvatar name={friend.displayName} username={friend.username} avatar={friend.avatar} />
    <div className="min-w-0 flex-1">
      <p className="font-bold">{goal} with {friend.displayName} <span className="font-normal text-gray-500">@{friend.username}</span></p>
      <p className="text-sm text-gray-600">
        {challenge.status === "pending" && (challenge.sentByMe ? "Waiting for them to accept" : "They challenged you")}
        {challenge.status === "active" && <>{score}{challenge.endsAt && <> · ends {endsOn(challenge.endsAt)}</>}</>}
        {challenge.status === "finished" && challenge.outcome && <><b>{OUTCOME_TEXT[challenge.outcome]}</b> · {score}</>}
      </p>
    </div>
    {challenge.status === "pending" && (challenge.sentByMe
      ? <button className={friendButton} disabled={busy} onClick={() => act(() => cancelChallenge(challenge.id))} aria-label={`Cancel challenge to ${friend.username}`}>Cancel</button>
      : <div className="flex gap-2">
        <button className={friendPrimary} disabled={busy} onClick={() => act(() => answerChallenge(challenge.id, true))} aria-label={`Accept challenge from ${friend.username}`}>Accept</button>
        <button className={friendButton} disabled={busy} onClick={() => act(() => answerChallenge(challenge.id, false))} aria-label={`Decline challenge from ${friend.username}`}>Decline</button>
      </div>)}
  </li>;
}

/** Challenges waiting for an answer, running, and finished in the last week. Hidden while there are none. */
export default function FriendChallenges() {
  const [challenges, setChallenges] = useState<FriendChallenge[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback((signal?: AbortSignal) => fetchChallenges(signal).then(list => { setChallenges(list); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your challenges.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useRealtime(event => { if (event.type === "friends" || event.type === "resync") void load(); });
  const act = (work: () => Promise<unknown>) => {
    setBusy(true); setError("");
    void work().then(() => load()).catch(failure => setError(apiErrorMessage(failure, "That didn't work. Please try again."))).finally(() => setBusy(false));
  };
  if (!error && !challenges?.length) return null;
  return <section id="challenges" aria-labelledby="challenges-heading" className="mt-6 rounded-2xl border border-amber-200 bg-white p-5">
    <h2 id="challenges-heading" className="text-lg font-bold"><span aria-hidden="true">⚔️ </span>Challenges</h2>
    {challenges && <ul className="mt-2 divide-y divide-gray-100">{challenges.map(challenge => <ChallengeRow key={challenge.id} challenge={challenge} busy={busy} act={act} />)}</ul>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </section>;
}
