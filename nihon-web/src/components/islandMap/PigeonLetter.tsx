import { forwardRef, useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import { Link } from "react-router-dom";
import type { PigeonFlight, PigeonTour } from "../../lib/pigeonFlight";
import { useResendVerification } from "../../lib/useResendVerification";

export const LETTER_PANEL_ID = "pigeon-letter-panel";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--vermilion)]";
const ink = { stroke: "var(--ink)", strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
// Each piece of mail is separated by a rule, with no space above the first or below the last.
const MAIL_ITEM = "py-3 first:pt-0 last:pb-0";
const leg = { stroke: "var(--pigeon-leg)", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/** A sealed envelope held in the beak. */
function Letter() {
  return <g transform="rotate(-8 37 12)">
    <rect x="32" y="9" width="9" height="6" rx="0.6" fill="var(--letter)" {...ink} strokeWidth="0.8" />
    <path d="M32,9 L36.5,12.4 L41,9" fill="none" {...ink} strokeWidth="0.7" />
    <circle cx="36.5" cy="12.4" r="1.1" fill="var(--vermilion)" />
  </g>;
}

/** A grey pigeon facing right, with a letter in its beak when it has one. It stands on its legs when perched; in flight
 *  they tuck back under its tail and its wings flap. */
function PigeonArt({ hasLetter }: { hasLetter: boolean }) {
  const wing = "M13,13 Q12,2 22,-2 Q21,6 21,13 Z";
  return <svg viewBox="-2 -5 44 32" className="block w-full overflow-visible" aria-hidden="true">
    <g className="island-pigeon-flying">
      <g className="scenery-wing" opacity="0.7"><path d={wing} transform="translate(-3,1)" fill="var(--pigeon-wing)" {...ink} /></g>
      <path d="M13,20 L7,22.5 l-1.5,-0.8 M7,22.5 l-1.2,1.2 M17,20.5 L11,23.5 l-1.5,-0.8 M11,23.5 l-1.2,1.2" {...leg} />
    </g>
    <g className="island-pigeon-perched">
      <path d="M14,20 L13.4,27 M11.4,27.4 L15.6,27.4" {...leg} />
      <path d="M18.6,20 L19.2,27 M17.2,27.4 L21.4,27.4" {...leg} />
    </g>
    <path d="M7,15 L0,13 L1,19 Z" fill="var(--slate)" {...ink} />
    <ellipse cx="16" cy="16" rx="10" ry="5.6" fill="var(--pigeon)" {...ink} />
    <path d="M22,12 Q25,15 28,13 L28,9 Q25,9 22,12 Z" fill="var(--pigeon-neck)" />
    <circle cx="27" cy="9.5" r="4.2" fill="var(--pigeon)" {...ink} />
    <circle cx="28.4" cy="8.6" r="0.8" fill="var(--ink)" />
    <path d="M31,9.6 L33.6,10.6 L31,11.4 Z" fill="var(--straw)" {...ink} strokeWidth="0.6" />
    {hasLetter && <Letter />}
    <g className="island-pigeon-perched">
      <path d="M10,14 Q17,9.5 24,13 Q18,19 10,16.5 Z" fill="var(--pigeon-wing)" {...ink} />
      <path d="M13,14.5 l5,0.6 M14,16.2 l5,0.4" stroke="var(--slate)" strokeWidth="1" strokeLinecap="round" />
    </g>
    <g className="island-pigeon-flying">
      <g className="scenery-wing"><path d={wing} fill="var(--pigeon-wing)" {...ink} /><path d="M17,4 l3,-1 M16,8 l4,-1" stroke="var(--slate)" strokeWidth="1" strokeLinecap="round" /></g>
    </g>
  </svg>;
}

type PigeonProps = { tour: PigeonTour; width: number; hasMail: boolean; isExpanded: boolean; onOpen: () => void };

const facing = (isFacingRight: boolean) => isFacingRight ? "scaleX(1)" : "scaleX(-1)";

/** Along the route: resting at each perch, then easing out of it and into the next landing. */
function routeKeyframes(flights: readonly PigeonFlight[]): Keyframe[] {
  return [{ offset: 0, offsetDistance: "0%" }, ...flights.flatMap(flight => [
    { offset: flight.start, offsetDistance: `${flight.fromDistance * 100}%`, easing: "ease-in-out" },
    { offset: flight.end, offsetDistance: `${flight.toDistance * 100}%` },
  ]), { offset: 1, offsetDistance: "100%" }];
}

/** Shown only in the air (the flapping wings and tucked legs), or with `isPerched` only at rest; each change is instant. */
function phaseKeyframes(flights: readonly PigeonFlight[], isPerched: boolean): Keyframe[] {
  const [resting, flying] = isPerched ? [1, 0] : [0, 1];
  return [{ offset: 0, opacity: resting }, ...flights.flatMap(flight => [
    { offset: flight.start, opacity: resting }, { offset: flight.start, opacity: flying },
    { offset: flight.end, opacity: flying }, { offset: flight.end, opacity: resting },
  ]), { offset: 1, opacity: resting }];
}

/** Which way it faces: it turns to each new heading as it takes off, and arrives home facing the last one. */
function facingKeyframes(flights: readonly PigeonFlight[]): Keyframe[] {
  const last = flights[flights.length - 1].isFacingRight;
  return [{ offset: 0, transform: facing(last) }, ...flights.flatMap((flight, index) => [
    { offset: flight.start, transform: facing(index === 0 ? last : flights[index - 1].isFacingRight) },
    { offset: flight.start, transform: facing(flight.isFacingRight) },
  ]), { offset: 1, transform: facing(last) }];
}

/** Runs the tour on the pigeon's parts, keeping its place in the cycle when the route or its mail changes. With reduced
 *  motion it stays perched at Home. Returns pause and resume, for holding it still while pointed at or focused. */
function usePigeonTour(rootRef: RefObject<HTMLDivElement | null>, tour: PigeonTour, hasMail: boolean) {
  const animations = useRef<Animation[]>([]);
  const elapsed = useRef(0);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timing = { duration: tour.durationSeconds * 1000, iterations: Infinity };
    const parts: [Element | null, Keyframe[]][] = [
      [root, routeKeyframes(tour.flights)],
      [root.querySelector(".island-pigeon-turn"), facingKeyframes(tour.flights)],
      ...[...root.querySelectorAll(".island-pigeon-flying")].map((part): [Element, Keyframe[]] => [part, phaseKeyframes(tour.flights, false)]),
      ...[...root.querySelectorAll(".island-pigeon-perched")].map((part): [Element, Keyframe[]] => [part, phaseKeyframes(tour.flights, true)]),
    ];
    const running = parts.flatMap(([part, keyframes]) => part ? [part.animate(keyframes, timing)] : []);
    running.forEach(animation => { animation.currentTime = elapsed.current % timing.duration; });
    animations.current = running;
    return () => {
      elapsed.current = Number(running[0]?.currentTime ?? 0);
      running.forEach(animation => animation.cancel());
    };
  }, [rootRef, tour, hasMail]);
  return {
    pause: () => animations.current.forEach(animation => animation.pause()),
    resume: () => animations.current.forEach(animation => animation.play()),
  };
}

/** The carrier pigeon touring the open islands, landing on each in turn. With mail it carries a letter under a "!" bubble
 *  and opens the mail when clicked, stopping while pointed at or focused; without mail it is only scenery. */
export const CarrierPigeon = forwardRef<HTMLButtonElement, PigeonProps>(function CarrierPigeon({ tour, width, hasMail, isExpanded, onOpen }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pause, resume } = usePigeonTour(rootRef, tour, hasMail);
  const style: CSSProperties = { offsetPath: `path("${tour.path}")` };
  const bird = <span className="island-pigeon-turn block" style={{ width }}><PigeonArt hasLetter={hasMail} /></span>;
  return <div ref={rootRef} style={style} aria-hidden={hasMail ? undefined : true} className="island-pigeon pointer-events-none">
    {hasMail ? <button ref={ref} type="button" onClick={onOpen} onPointerEnter={pause} onPointerLeave={resume} onFocus={pause} onBlur={resume}
      aria-expanded={isExpanded} aria-controls={LETTER_PANEL_ID} aria-label="A carrier pigeon with mail for you"
      className={`pointer-events-auto relative block cursor-pointer rounded-full ${focus}`}>
      <span aria-hidden="true" className="island-mail-bubble">!</span>
      {bird}
    </button> : bird}
  </div>;
});

type LetterProps = { email: string | null; unreadMessages: number; onLater: () => void; onClose: () => void };

/** The pigeon's mail: a reminder to confirm the email (a fresh link, or later), and any unread messages. */
export function LetterPanel({ email, unreadMessages, onLater, onClose }: LetterProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  return <section id={LETTER_PANEL_ID} aria-labelledby="pigeon-letter-title" className="island-panel absolute z-20 flex flex-col overflow-hidden border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-xl max-sm:inset-x-2 max-sm:bottom-2 max-sm:max-h-[50%] max-sm:rounded-2xl sm:right-4 sm:top-16 sm:w-[22rem] sm:rounded-2xl">
    <header className="flex items-start gap-3 border-b border-[var(--ink)]/20 px-5 py-4">
      <span aria-hidden="true" lang="ja" className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--vermilion)] text-2xl font-bold text-white">便</span>
      <div className="min-w-0 flex-1">
        <h2 id="pigeon-letter-title" className="text-xl font-black">Mail for you</h2>
        <p className="text-sm opacity-75">Carried in from the harbour post box.</p>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close the mail" className={`grid size-9 shrink-0 place-items-center rounded-lg text-xl hover:bg-[var(--ink)]/10 ${focus}`}>×</button>
    </header>
    <div className="min-h-0 flex-1 divide-y divide-[var(--ink)]/15 overflow-y-auto px-5 py-4 text-sm">
      {email && <ConfirmEmailLetter email={email} onLater={onLater} />}
      {unreadMessages > 0 && <p className={MAIL_ITEM}>
        <Link to="/messages" className={`font-bold text-[var(--vermilion)] underline ${focus}`}>{unreadMessages === 1 ? "1 unread message" : `${unreadMessages} unread messages`}</Link> from your friends.
      </p>}
    </div>
  </section>;
}

function ConfirmEmailLetter({ email, onLater }: { email: string; onLater: () => void }) {
  const { busy, notice, resend } = useResendVerification();
  return <div className={MAIL_ITEM}>
    <p><b>Confirm your email</b> so you can reset your password if you ever forget it. We sent a link to <span className="font-semibold [overflow-wrap:anywhere]">{email}</span>.</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy} onClick={() => void resend()} className={`rounded-lg bg-[var(--vermilion)] px-3 py-1.5 font-bold text-white hover:brightness-110 disabled:opacity-50 ${focus}`}>{busy ? "Sending…" : "Send a new link"}</button>
      <button type="button" onClick={onLater} className={`font-semibold underline ${focus}`}>Remind me later</button>
    </div>
    {notice && <p role={notice.tone === "error" ? "alert" : "status"} className="mt-2 font-semibold">{notice.text}</p>}
  </div>;
}
