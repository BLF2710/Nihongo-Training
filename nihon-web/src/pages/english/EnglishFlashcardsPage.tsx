import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../../api/errors";
import { fetchSrsQueue, reviewSrsCard, setCardSuspended } from "../../api/srs";
import type { SrsGrade, SrsQueueCard } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import { SpeakButton } from "../../components/englishLesson/SpeakButton";
import { EmptyNotice, EnglishStudyFrame, focusRing } from "../../components/englishStudy/EnglishStudyFrame";
import { SRS_GRADES } from "../../components/srs/srsGrades";
import { useActivityTitle } from "../../context/ActivityContext";
import { ENGLISH_LESSONS } from "../../data/englishCourse";
import { syncEnglishDeck } from "../../lib/englishDeck";
import { studyWordsOf } from "../../lib/englishStudy";
import type { StudyWord } from "../../lib/englishStudy";
import { useEnglishCourseLevel } from "../../lib/courseLevel";
import { formatInterval } from "../../lib/srsIntervals";

// The English flashcards (/english/flashcards): the words of completed English lessons come back just before they
// would be forgotten. The deck is the learner's English deck on the server; Japanese cards are never shown here.
const primary = `rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focusRing}`;
const WORDS_BY_ID = new Map(studyWordsOf(ENGLISH_LESSONS).map(word => [word.id, word]));

type QueuedWord = { queued: SrsQueueCard; word: StudyWord };
type Session = { cards: QueuedWord[]; position: number; reviewed: number; forgotten: number };

async function loadSession(signal: AbortSignal): Promise<Session> {
  await syncEnglishDeck(await fetchUnits(signal));
  const { cards } = await fetchSrsQueue(signal, { course: "english" });
  const known = cards.flatMap(queued => { const word = WORDS_BY_ID.get(queued.itemId); return word ? [{ queued, word }] : []; });
  return { cards: known, position: 0, reviewed: 0, forgotten: 0 };
}

export default function EnglishFlashcardsPage() {
  useActivityTitle("English flashcards");
  const level = useEnglishCourseLevel();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadSession(controller.signal).then(next => { setSession(next); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your flashcards could not be loaded.")); });
    return () => controller.abort();
  }, [retry]);
  const current = session?.cards[session.position];
  return <EnglishStudyFrame title="Flashcards" titleVi="Thẻ ghi nhớ" level={level} intro="Words from your completed lessons come back just before you would forget them.">
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} <button type="button" className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!session && !error && <p role="status" className="text-gray-500">Loading your flashcards…</p>}
    {session && !current && <Finished session={session} />}
    {session && current && <Review key={`${current.queued.itemId}:${session.position}`} session={session} current={current} onDone={setSession} />}
  </EnglishStudyFrame>;
}

function Finished({ session }: { session: Session }) {
  return <EmptyNotice>
    <span className="block text-xl font-black text-gray-900">{session.reviewed ? "All done for today 🎉" : "Nothing to review right now"}</span>
    <span className="mt-1 block">{session.reviewed
      ? `You reviewed ${session.reviewed} ${session.reviewed === 1 ? "card" : "cards"}${session.forgotten ? `, and ${session.forgotten} will come back soon` : ""}. Come back tomorrow for the next ones.`
      : "Finish a lesson to add its words, or come back when your next cards are due."}</span>
    <span className="mt-3 flex flex-wrap gap-3"><Link to="/lessons" className={primary}>Lessons →</Link>
      <Link to="/english/vocabulary" className={`rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-semibold ${focusRing}`}>All vocabulary</Link></span>
  </EmptyNotice>;
}

function Review({ session, current, onDone }: { session: Session; current: QueuedWord; onDone: (next: Session) => void }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { queued, word } = current;
  const remaining = session.cards.length - session.position;

  const grade = useCallback(async (choice: SrsGrade) => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const { intervals } = await reviewSrsCard(queued, choice);
      // A forgotten card is seen again at the end of this session.
      const again = choice === "again" ? [{ ...current, queued: { ...queued, isNew: false, repetitions: 0, intervals } }] : [];
      onDone({ ...session, cards: [...session.cards, ...again], position: session.position + 1, reviewed: session.reviewed + 1, forgotten: session.forgotten + again.length });
    } catch (failure) {
      setError(apiErrorMessage(failure, "The review could not be saved. Please try again."));
      setSaving(false);
    }
  }, [current, onDone, queued, saving, session]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      if (!isRevealed && (event.key === " " || event.key === "Enter")) { event.preventDefault(); setIsRevealed(true); return; }
      const choice = isRevealed ? SRS_GRADES[Number(event.key) - 1] : undefined;
      if (choice) { event.preventDefault(); void grade(choice.grade); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grade, isRevealed]);

  // Hiding leaves the card out of reviews from now on.
  const hide = async () => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      await setCardSuspended(queued, true);
      onDone({ ...session, cards: session.cards.filter((item, index) => index <= session.position || item.queued.itemId !== queued.itemId), position: session.position + 1 });
    } catch (failure) {
      setError(apiErrorMessage(failure, "The card could not be hidden. Please try again."));
      setSaving(false);
    }
  };

  const status = queued.isNew ? "New" : queued.lapses ? `Forgotten ${queued.lapses}×` : "Review";
  return <section aria-label="Flashcard" className="mx-auto max-w-3xl">
    <p className="flex justify-between text-sm font-semibold text-gray-600"><span>{remaining} {remaining === 1 ? "card" : "cards"} left · {session.reviewed} reviewed</span><span>{status}</span></p>
    <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-xs font-bold text-emerald-700">{word.level} Unit {word.unitNumber} · {word.lessonTitle}</p>
      <p className="mt-3 flex items-center justify-center gap-3"><span lang="en-GB" className="text-4xl font-black wrap-anywhere sm:text-5xl">{word.word}</span><SpeakButton text={word.word} label={`Hear “${word.word}”`} /></p>
      <p className="mt-1 text-sm"><span className="font-mono text-indigo-700">{word.ipa}</span> <span className="italic text-gray-500">· {word.partOfSpeech}</span></p>
      {isRevealed ? <div aria-live="polite" className="mt-4 border-t border-gray-100 pt-4">
        <p lang="vi" className="text-2xl font-bold text-emerald-800">{word.vietnamese}</p>
        <p lang="en-GB" className="mt-1 text-gray-700">{word.definition}</p>
        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm"><span lang="en-GB" className="font-semibold italic">“{word.example.english}”</span> <span lang="vi" className="block text-gray-600">{word.example.vietnamese}</span></p>
      </div> : <><p className="mt-4 text-sm text-gray-600">What does it mean? Say it to yourself, then turn the card.</p>
        <button type="button" onClick={() => setIsRevealed(true)} className={`${primary} mt-3`}>Show answer <span className="font-normal opacity-80">(Space)</span></button></>}
    </div>
    {isRevealed && <div role="group" aria-label="How well did you remember it?" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{SRS_GRADES.map((choice, index) =>
      <button key={choice.grade} type="button" disabled={saving} onClick={() => void grade(choice.grade)} className={`rounded-2xl border px-3 py-2 text-center disabled:opacity-50 ${choice.tone} ${focusRing}`}>
        <span className="block font-black">{choice.label}</span>
        <span className="block text-xs">in {formatInterval(queued.intervals[choice.grade])} · key {index + 1}</span>
      </button>)}</div>}
    {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <p className="mt-3 text-center text-sm text-gray-600">Don't want this card? <button type="button" disabled={saving} onClick={() => void hide()} className={`font-semibold underline disabled:opacity-50 ${focusRing}`}>Hide it</button></p>
  </section>;
}
