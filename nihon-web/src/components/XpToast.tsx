import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addReward, isMilestone, isWorthShowing, listenForRewards } from "../lib/xpRewards";
import type { RewardToast } from "../lib/xpRewards";

const XP_ONLY_MS = 2500;
const MILESTONE_MS = 7000;

/**
 * "+XP" pop-up for any activity whose API response carries a reward (see api/axios.ts). Rewards that arrive while it
 * is showing are added to it. It pauses while hovered or focused, and is announced politely to screen readers.
 */
export default function XpToast() {
  const [toast, setToast] = useState<RewardToast | null>(null);
  const [isPaused, setPaused] = useState(false);
  // Bumped by each new reward, so the pop-up's timer starts again.
  const [arrivals, setArrivals] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => listenForRewards(reward => {
    if (!isWorthShowing(reward)) return;
    setToast(current => addReward(current, reward));
    setArrivals(count => count + 1);
  }), []);

  const close = useCallback(() => { setToast(null); setPaused(false); }, []);
  useEffect(() => {
    if (!toast || isPaused) return;
    timer.current = window.setTimeout(close, isMilestone(toast) ? MILESTONE_MS : XP_ONLY_MS);
    return () => window.clearTimeout(timer.current);
  }, [toast, isPaused, arrivals, close]);

  return <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
    {toast && <div key={arrivals} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="xp-pop pointer-events-auto w-full max-w-xs overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl">
      <div className="flex items-center gap-3 bg-linear-to-r from-emerald-600 to-indigo-600 px-4 py-3 text-white">
        <span aria-hidden="true" className="text-2xl">{toast.level !== null ? "⭐" : "⚡"}</span>
        <p className="min-w-0 flex-1">
          {toast.xp > 0 && <span className="block text-xl font-black">+{toast.xp} XP</span>}
          {toast.level !== null && <span className="block text-sm font-bold">Level {toast.level}!</span>}
          {toast.rank !== null && <span className="block text-sm font-bold">New rank: {toast.rank}</span>}
        </p>
        <button type="button" onClick={close} aria-label="Dismiss" className="rounded-lg px-2 py-1 text-white/80 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white">✕</button>
      </div>
      {toast.unlocked.length > 0 && <div className="px-4 py-3">
        <ul className="space-y-1.5">{toast.unlocked.map(item => <li key={item.id} className="flex items-center gap-2 text-sm">
          <span aria-hidden="true" className="text-lg">{item.icon}</span><span><span className="font-semibold text-amber-800">Achievement unlocked:</span> {item.title}</span>
        </li>)}</ul>
        <Link to="/achievements" onClick={close} className="mt-2 inline-block text-sm font-bold text-emerald-700 hover:underline">See achievements →</Link>
      </div>}
    </div>}
  </div>;
}
