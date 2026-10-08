import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import BackButton from "./BackButton";
import { ActivityContext } from "../context/ActivityContext";
import { activityForRoute, parseSession, readSession, sessionSnapshot, sessionStorageKey, subscribeSession, writeSession } from "../lib/activitySession";

export default function ActivitySessionBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const activity = useMemo(() => activityForRoute(location.pathname, location.search), [location.pathname, location.search]);
  return <SessionScope key={`${sessionStorageKey()}:${activity?.key ?? "browse"}`} activity={activity}>{children}</SessionScope>;
}
function SessionScope({ children, activity }: { children: ReactNode; activity: ReturnType<typeof activityForRoute> }) {
  const raw = useSyncExternalStore(subscribeSession, sessionSnapshot, () => null);
  const current = parseSession(raw);
  const ownId = useRef(current && current.key === activity?.key ? current.id : null);
  const [owner, setOwner] = useState(current && current.key === activity?.key ? current.id : null);
  useEffect(() => subscribeSession(() => {
    const saved = readSession();
    if (saved?.id === ownId.current) setOwner(saved?.id ?? null);
  }), []);
  const [approvedSession, setApprovedSession] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ReturnType<typeof readSession>>(null);
  const pending = useRef<((accepted: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (confirmation) dialog.current?.showModal(); }, [confirmation]);
  useEffect(() => () => { pending.current?.(false); }, []);
  const decide = (accepted: boolean) => {
    dialog.current?.close();
    setConfirmation(null);
    pending.current?.(accepted);
    pending.current = null;
  };
  const createSession = useCallback(() => {
    if (!activity) return false;
    const next = { ...activity, version: 1 as const, id: crypto.randomUUID(), status: "active" as const, updatedAt: new Date().toISOString(), data: {} };
    const previousOwner = ownId.current;
    ownId.current = next.id;
    if (!writeSession(next)) { ownId.current = previousOwner; return false; }
    return true;
  }, [activity]);
  const begin = useCallback(async (restart = false, confirmedId?: string) => {
    if (!activity) return false;
    const previous = readSession();
    if (!restart && previous?.key === activity.key && previous.status === "active") { ownId.current = previous.id; return true; }
    if (previous?.status === "active" && previous.id !== confirmedId && previous.id !== approvedSession) {
      if (pending.current) return false;
      setConfirmation(previous);
      const accepted = await new Promise<boolean>(resolve => { pending.current = resolve; });
      if (!accepted || readSession()?.id !== previous.id) return false;
    }
    return createSession();
  }, [activity, approvedSession, createSession]);
  const update = useCallback((change: Partial<NonNullable<ReturnType<typeof readSession>>>) => {
    const saved = readSession();
    if (!saved || saved.id !== ownId.current || saved.key !== activity?.key) return;
    if (change.title === saved.title && Object.keys(change).length === 1) return;
    writeSession({ ...saved, ...change, data: change.data ? { ...saved.data, ...change.data } : saved.data, updatedAt: new Date().toISOString() });
  }, [activity?.key]);
  const autoStart = activity?.kind === "lesson" || activity?.kind === "assessment";
  useEffect(() => { if (autoStart && !readSession()) createSession(); }, [autoStart, createSession]);
  useEffect(() => { if (autoStart && readSession()?.status === "completed" && readSession()?.key !== activity?.key) createSession(); }, [autoStart, activity?.key, createSession]);
  const control = useMemo(() => ({ activity, get initial() { const saved = readSession(); return saved?.key === activity?.key ? saved : null; }, begin, patch: (data: Record<string, unknown>) => update({ data }), complete: () => update({ status: "completed" }), title: (title: string) => update({ title }) }), [activity, begin, update]);
  if (activity && owner && current?.id !== owner) return <main className="mx-auto max-w-xl p-8"><BackButton className="mb-5 block text-sm font-semibold text-gray-600" /><h1 className="text-2xl font-bold">Your session changed in another tab</h1><p className="my-4">This older session is paused so it cannot replace your newer work.</p><button className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white" onClick={() => window.location.assign(current?.href ?? "/")}>Open current session</button></main>;
  if (sessionStorageKey() && activity && current?.key !== activity.key && (autoStart || (current?.status === "active" && current.id !== approvedSession))) return <main className="mx-auto max-w-xl p-8"><section aria-label="Replace unfinished session" className="rounded-3xl border bg-white p-6 shadow-xl"><h1 className="text-2xl font-bold">Continue or start something new?</h1><p className="my-4">{current?.status === "active" ? `You have an unfinished ${current.title} session.` : "Preparing your saved session…"}</p><p className="mb-5 text-sm text-gray-600">Starting a new session discards its session answers. Already saved XP and learning statistics will remain.</p>{current && <Link to={current.href} className="mr-4 font-bold text-emerald-700">Resume existing session</Link>}<button className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white" onClick={() => autoStart ? void begin(false, current?.id) : setApprovedSession(current?.id ?? null)}>Start new session</button><BackButton className="mt-4 block" /></section></main>;
  return <ActivityContext.Provider value={control}>{children}
    <dialog ref={dialog} aria-labelledby="session-confirmation-title" onCancel={event => { event.preventDefault(); decide(false); }} className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40">
      <h1 id="session-confirmation-title" className="text-2xl font-bold">Continue or start something new?</h1>
      <p className="my-4">You have an unfinished {confirmation?.title} session.</p>
      <p className="mb-5 text-sm text-gray-600">Starting a new session discards its session answers. Already saved XP and learning statistics will remain.</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link to={confirmation?.href ?? "/"} onClick={event => { if (confirmation?.key === activity?.key) event.preventDefault(); decide(false); }} className="font-bold text-emerald-700">Resume existing session</Link>
        <button onClick={() => decide(true)} className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white">Start new session</button>
        <button autoFocus onClick={() => decide(false)} className="font-semibold text-gray-600">Cancel</button>
      </div>
    </dialog>
  </ActivityContext.Provider>;
}
