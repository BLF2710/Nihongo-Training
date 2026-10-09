import { Link, Navigate, useLocation } from "react-router-dom";
import PracticePage from "./PracticePage";
import { ActivityContext } from "../context/ActivityContext";
import type { ActivityControl } from "../context/ActivityContext";
import { hasSession } from "../lib/authStorage";

// A guest's quiz lives only in component state: nothing is written to storage, so it ends when they leave the page.
const guestSession: ActivityControl = {
  activity: null,
  initial: null,
  begin: async () => true,
  patch: () => undefined,
  complete: () => undefined,
  title: () => undefined,
};

/** The Kana Speed Quiz for visitors without an account. Signed-in users get the regular, saved quiz. */
export default function GuestPracticePage() {
  const { search } = useLocation();
  if (hasSession()) return <Navigate to={`/practice${search}`} replace />;
  return <ActivityContext.Provider value={guestSession}>
    <p role="note" className="border-b border-indigo-100 bg-indigo-50 px-4 py-3 text-center text-sm text-indigo-900">
      Guest session — your score is shown while you play, is not saved, and resets when you leave. <Link to="/register" className="font-bold underline">Create an account</Link> to keep your progress.
    </p>
    <PracticePage />
  </ActivityContext.Provider>;
}
