import type { ReactNode } from "react";
import type { CharacterId } from "../../lib/cast";
import { GuideNote } from "./GuideNote";

const primary = "rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";

type SessionStartProps = {
  character: CharacterId; heading: string; startLabel: string; onStart: () => void;
  /** What the island's character says about the session ahead. */
  children: ReactNode;
  /** Choices made before starting (a unit, a kind of practice), shown above the start button. */
  options?: ReactNode;
  isStarting?: boolean; className?: string;
};

/** The pause before a practice session: the island's character says what is ahead, then the learner starts. */
export function SessionStart({ character, heading, startLabel, onStart, children, options, isStarting = false, className = "" }: SessionStartProps) {
  return <section aria-labelledby="session-start-heading" className={className}>
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Ready?</p>
    <h2 id="session-start-heading" className="mt-1 text-2xl font-black">{heading}</h2>
    <GuideNote character={character} mood="happy" className="mt-4">{children}</GuideNote>
    {options && <div className="mt-5">{options}</div>}
    <button className={`${primary} mt-5`} disabled={isStarting} onClick={onStart}>{isStarting ? "Preparing…" : startLabel}</button>
  </section>;
}
