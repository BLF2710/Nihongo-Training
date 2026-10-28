import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import { sendFriendRequest } from "../api/friends";
import { fetchFriendSuggestions } from "../api/social";
import type { FriendSuggestion } from "../api/social";
import { friendPrimary } from "../lib/friendStyles";
import PersonAvatar from "./PersonAvatar";

function why(suggestion: FriendSuggestion): string {
  const reasons = [
    suggestion.mutualFriends > 0 ? `${suggestion.mutualFriends} mutual ${suggestion.mutualFriends === 1 ? "friend" : "friends"}` : "",
    suggestion.sameLevel ? `also studying ${suggestion.sameLevel}` : "",
  ];
  return reasons.filter(Boolean).join(" · ");
}

/** Learners you might know, for learners who turned suggestions on in Settings. */
export default function FriendSuggestions({ onRequested }: { onRequested: (message: string) => void }) {
  const [data, setData] = useState<{ enabled: boolean; suggestions: FriendSuggestion[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback((signal?: AbortSignal) => fetchFriendSuggestions(signal).then(result => { setData(result); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load suggestions.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  const add = async (suggestion: FriendSuggestion) => {
    setBusy(suggestion.username); setError("");
    try {
      await sendFriendRequest(suggestion.username);
      setData(current => current && { ...current, suggestions: current.suggestions.filter(item => item.username !== suggestion.username) });
      onRequested(`Friend request sent to @${suggestion.username}.`);
    } catch (failure) { setError(apiErrorMessage(failure, "Could not send the friend request.")); }
    finally { setBusy(null); }
  };
  if (!data && !error) return null;
  return <section aria-labelledby="suggestions-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
    <h2 id="suggestions-heading" className="text-lg font-bold">People you might know</h2>
    {data && !data.enabled && <p className="mt-2 text-sm text-gray-600">Turn on <b>Friend suggestions</b> in <Link to="/settings/privacy" className="font-bold text-emerald-700 hover:underline">settings</Link> to see friends of your friends and learners on your level who did the same.</p>}
    {data?.enabled && (data.suggestions.length === 0
      ? <p className="mt-2 text-sm text-gray-600">No suggestions right now. They come from friends of your friends and learners on your course level who also turned suggestions on.</p>
      : <ul className="mt-2 divide-y divide-gray-100">{data.suggestions.map(suggestion => <li key={suggestion.username} className="flex flex-wrap items-center gap-3 py-3">
        <PersonAvatar name={suggestion.displayName} username={suggestion.username} avatar={suggestion.avatar} />
        <Link to={`/u/${encodeURIComponent(suggestion.username)}`} className="min-w-0 flex-1 hover:underline"><span className="block truncate font-bold text-gray-900">{suggestion.displayName}</span><span className="block truncate text-sm text-gray-500">@{suggestion.username} · {why(suggestion)}</span></Link>
        <button className={friendPrimary} disabled={busy !== null} onClick={() => void add(suggestion)} aria-label={`Add ${suggestion.username} as a friend`}>{busy === suggestion.username ? "Sending…" : "Add friend"}</button>
      </li>)}</ul>)}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </section>;
}
