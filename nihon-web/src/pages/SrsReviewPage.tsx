import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RubyText from "../components/RubyText";
import { apiErrorMessage } from "../api/errors";
import { fetchSrsQueue, fetchSrsSummary, reviewSrsCard, setCardSuspended } from "../api/srs";
import type { SrsGrade, SrsQueueCard } from "../api/srs";
import { fetchUnits } from "../api/units";
import { describeCard, syncDeck } from "../lib/srsDeck";
import type { DeckCard } from "../lib/srsDeck";
import { formatInterval } from "../lib/srsIntervals";
import { speakJapanese, supportsJapaneseSpeech } from "../services/japaneseSpeech";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;
const button = `rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 ${focus}`;
const card = "rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8";
const GRADES: { grade: SrsGrade; label: string; hint: string; tone: string }[] = [
  { grade: "again", label: "Again", hint: "Forgot it", tone: "border-red-200 bg-red-50 text-red-900 hover:bg-red-100" },
  { grade: "hard", label: "Hard", hint: "Remembered with effort", tone: "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100" },
  { grade: "good", label: "Good", hint: "Remembered", tone: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
  { grade: "easy", label: "Easy", hint: "Knew it at once", tone: "border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100" },
];

type QueuedCard = { queued: SrsQueueCard; content: DeckCard };
/** `ahead`: reviewing cards due within the next day, after today's are done. */
type Session = { cards: QueuedCard[]; position: number; reviewed: number; forgotten: number; ahead: boolean };

const describeAll = (cards: SrsQueueCard[]) => cards.flatMap(queued => { const content = describeCard(queued); return content ? [{ queued, content }] : []; });

/** Loads today's cards after adding the words and Kanji of newly completed lessons to the deck. */
async function loadSession(signal: AbortSignal): Promise<Session> {
  await syncDeck(await fetchUnits(signal));
  const { cards } = await fetchSrsQueue(signal);
  return { cards: describeAll(cards), position: 0, reviewed: 0, forgotten: 0, ahead: false };
}

async function loadAheadSession(): Promise<Session> {
  const { cards } = await fetchSrsQueue(undefined, { ahead: true });
  return { cards: describeAll(cards), position: 0, reviewed: 0, forgotten: 0, ahead: true };
}

export default function SrsReviewPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadSession(controller.signal).then(data => { setSession(data); setLoadError(""); })
      .catch(error => { if (!controller.signal.aborted) setLoadError(apiErrorMessage(error, "Your reviews could not be loaded.")); });
    return () => controller.abort();
  }, [retry]);

  const current = session?.cards[session.position];
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2"><h1 className="text-3xl font-black">Daily review</h1>
      <Link to="/srs/deck" className={`text-sm font-semibold text-emerald-700 hover:underline ${focus}`}>Your deck →</Link></div>
    <p className="mt-1 text-gray-600">Words and kanji from your completed lessons come back just before you would forget them.</p>
    {loadError && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{loadError} <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!session && !loadError && <p role="status" className="mt-6 text-gray-500">Loading your reviews…</p>}
    {session && !current && <Finished session={session} onReviewAhead={next => setSession(next)} />}
    {session && current && <Review key={`${current.queued.itemType}:${current.queued.itemId}:${session.position}`} session={session} current={current} onGraded={setSession} />}
  </main></div>;
}

/** Studied cards due within the next day, offered once today's are done. */
function useCardsDueSoon(): number | null {
  const [dueSoon, setDueSoon] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    // Only an offer: without the count the button simply isn't shown.
    fetchSrsSummary(controller.signal).then(summary => setDueSoon(summary.dueSoon)).catch(() => setDueSoon(null));
    return () => controller.abort();
  }, []);
  return dueSoon;
}

function Finished({ session, onReviewAhead }: { session: Session; onReviewAhead: (next: Session) => void }) {
  const dueSoon = useCardsDueSoon();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reviewAhead = async () => {
    setLoading(true); setError("");
    try { onReviewAhead(await loadAheadSession()); } catch (failure) { setError(apiErrorMessage(failure, "Those cards could not be loaded.")); setLoading(false); }
  };
  return <section aria-labelledby="done-heading" className={`${card} mt-6`}>
    <h2 id="done-heading" className="text-2xl font-black">{session.reviewed ? "All done for today 🎉" : "Nothing to review right now"}</h2>
    <p className="mt-2 text-gray-600">{session.reviewed
      ? `You reviewed ${session.reviewed} ${session.reviewed === 1 ? "card" : "cards"}${session.forgotten ? `, and ${session.forgotten} will come back soon` : ""}. Come back tomorrow for the next ones.`
      : "Finish a lesson to add its words and kanji, or come back when your next cards are due."}</p>
    {dueSoon !== null && dueSoon > 0 && <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
      <p className="text-sm text-indigo-950"><b>{dueSoon} {dueSoon === 1 ? "card is" : "cards are"} due in the next day.</b> Reviewing early is fine before a trip or a busy day; it counts like a normal review.</p>
      <button className={`${primary} mt-3`} disabled={loading} onClick={() => void reviewAhead()}>{loading ? "Loading…" : `Review ahead (${dueSoon})`}</button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>}
    <div className="mt-5 flex flex-wrap gap-3"><Link to="/" className={primary}>Back to the dashboard</Link><Link to="/mistakes" className={button}>Mistake notebook →</Link><Link to="/lessons" className={button}>Lessons →</Link></div>
  </section>;
}

function Review({ session, current, onGraded }: { session: Session; current: QueuedCard; onGraded: (next: Session) => void }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [speech, setSpeech] = useState("");
  const { queued, content } = current;
  const remaining = session.cards.length - session.position;

  const grade = useCallback(async (choice: SrsGrade) => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const { intervals } = await reviewSrsCard(queued, choice, { ahead: session.ahead });
      // A forgotten card is seen again at the end of this session.
      const again = choice === "again" ? [{ ...current, queued: { ...queued, isNew: false, repetitions: 0, intervals } }] : [];
      onGraded({ ...session, cards: [...session.cards, ...again], position: session.position + 1, reviewed: session.reviewed + 1, forgotten: session.forgotten + again.length });
    } catch (failure) {
      setError(apiErrorMessage(failure, "The review could not be saved. Please try again."));
      setSaving(false);
    }
  }, [current, onGraded, queued, saving, session]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      if (!isRevealed && (event.key === " " || event.key === "Enter")) { event.preventDefault(); setIsRevealed(true); return; }
      const choice = isRevealed ? GRADES[Number(event.key) - 1] : undefined;
      if (choice) { event.preventDefault(); void grade(choice.grade); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grade, isRevealed]);

  // Suspending leaves the card out of reviews from now on; it can be restored from the deck page.
  const suspend = async () => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      await setCardSuspended(queued, true);
      onGraded({ ...session, cards: session.cards.filter((item, index) => index <= session.position || item.queued.itemId !== queued.itemId || item.queued.itemType !== queued.itemType), position: session.position + 1 });
    } catch (failure) {
      setError(apiErrorMessage(failure, "The card could not be suspended. Please try again."));
      setSaving(false);
    }
  };

  const listen = () => {
    const started = speakJapanese(content.audioText, () => setSpeech(""), () => setSpeech("Japanese speech could not be played on this device."));
    setSpeech(started ? "Playing pronunciation…" : "Speech is not available in this browser.");
  };

  return <section aria-label="Review card" className="mt-6">
    <p className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-gray-600"><span>{remaining} {remaining === 1 ? "card" : "cards"} left · {session.reviewed} reviewed</span>
      <span>{queued.isNew ? <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-indigo-900">New</span> : queued.lapses ? `Forgotten ${queued.lapses}×` : "Review"}</span></p>
    <div className={`${card} mt-3 text-center`}>
      <p className="text-xs font-bold text-emerald-700">{content.source}</p>
      <p lang={content.frontLang} className="mt-6 text-5xl font-bold leading-relaxed wrap-anywhere sm:text-6xl"><RubyText text={content.front} /></p>
      {isRevealed ? <div aria-live="polite" className="mt-6 border-t border-gray-100 pt-6">
        {content.reading && <p className="font-mono text-lg text-indigo-700">{content.reading}</p>}
        <p className="mt-2 text-2xl font-semibold">{content.answer}</p>
        {content.details.map(detail => <p key={detail} lang="ja" className="mt-1 text-gray-600">{detail}</p>)}
        {supportsJapaneseSpeech() && <button type="button" onClick={listen} className={`${button} mt-4 text-sm`}>🔊 Listen</button>}
        {speech && <p role="status" className="mt-2 text-sm text-gray-500">{speech}</p>}
      </div> : <button type="button" onClick={() => setIsRevealed(true)} className={`${primary} mt-8`}>Show answer <span className="font-normal opacity-80">(Space)</span></button>}
    </div>
    {isRevealed && <div className="mt-4">
      <p id="grade-heading" className="text-center text-sm font-semibold text-gray-600">How well did you remember it?</p>
      <div role="group" aria-labelledby="grade-heading" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{GRADES.map((choice, index) =>
        <button key={choice.grade} type="button" disabled={saving} onClick={() => void grade(choice.grade)} className={`rounded-2xl border px-3 py-3 text-center disabled:opacity-50 ${choice.tone} ${focus}`}>
          <span className="block font-black">{choice.label}</span>
          <span className="block text-xs">{choice.hint}</span>
          <span className="mt-1 block text-xs font-semibold">in {formatInterval(queued.intervals[choice.grade])} · key {index + 1}</span>
        </button>)}</div>
    </div>}
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <p className="mt-6 text-center text-sm text-gray-500">Don't want this card any more? <button type="button" disabled={saving} onClick={() => void suspend()} className={`font-semibold text-gray-700 underline hover:text-gray-900 disabled:opacity-50 ${focus}`}>Suspend it</button></p>
  </section>;
}
