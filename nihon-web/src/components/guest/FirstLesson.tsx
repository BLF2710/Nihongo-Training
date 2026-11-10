import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard } from "../Clipboard";
import { GuideNote } from "../cast/GuideNote";
import { FIRST_LESSON_KANA, FIRST_LESSON_LINES, FIRST_LESSON_WORD } from "../../data/guest/firstLesson";
import type { LessonKana } from "../../data/guest/firstLesson";
import { LESSON_STEPS } from "../../lib/guest/firstLesson";
import type { LessonStep } from "../../lib/guest/firstLesson";
import { cleanLearnerName, MAX_NAME_LENGTH } from "../../lib/guest/guestName";
import type { GuestNameState } from "../../lib/guest/guestName";
import { speakJapanese, supportsJapaneseSpeech } from "../../services/japaneseSpeech";
import { useFirstLesson } from "./useFirstLesson";
import type { MatchFeedback } from "./useFirstLesson";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";
const primary = `rounded-xl bg-[var(--vermilion)] px-5 py-3 font-bold text-white hover:brightness-110 ${focus}`;
const secondary = `rounded-xl border-2 border-[var(--ink)]/20 px-5 py-3 font-bold hover:border-[var(--vermilion)] ${focus}`;
const STEP_NAMES: Record<LessonStep, string> = { meet: "Meet", match: "Listen", read: "Read", name: "Your name" };

/** The guest's first lesson, about a minute long and with no account: meet あ い う, match them by sound, read あい,
 *  then give a name and go on to sign up or sign in. */
export function FirstLesson({ onLeave, random = Math.random }: { onLeave: () => void; random?: () => number }) {
  const lesson = useFirstLesson(random);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Each new step is announced by moving focus to its heading.
  useEffect(() => { headingRef.current?.focus(); }, [lesson.step]);

  return <section aria-labelledby="first-lesson-title" className="guest-lesson absolute inset-2 z-30 flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100%-2rem)] sm:w-[34rem] sm:-translate-x-1/2 sm:-translate-y-1/2">
    <header className="flex items-center gap-3 border-b border-[var(--ink)]/20 px-5 py-3">
      <span aria-hidden="true" lang="ja" className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--vermilion)] text-xl font-bold text-white">あ</span>
      <div className="min-w-0 flex-1">
        <p id="first-lesson-title" className="font-black">Your first lesson</p>
        <StepTrail current={lesson.step} />
      </div>
      <button type="button" onClick={onLeave} className={`rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-[var(--ink)]/10 ${focus}`}>Leave</button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      {lesson.step === "meet" && <MeetStep headingRef={headingRef} onDone={lesson.advance} />}
      {lesson.step === "match" && <MatchStep headingRef={headingRef} answer={lesson.round.answer} choices={lesson.round.choices} feedback={lesson.feedback}
        roundNumber={lesson.roundNumber} roundCount={lesson.roundCount} isLastRound={lesson.isLastRound} onPick={lesson.pick} onNext={lesson.nextRound} />}
      {lesson.step === "read" && <ReadStep headingRef={headingRef} onDone={lesson.advance} />}
      {lesson.step === "name" && <NameStep headingRef={headingRef} />}
    </div>
  </section>;
}

function StepTrail({ current }: { current: LessonStep }) {
  const currentIndex = LESSON_STEPS.indexOf(current);
  return <ol className="mt-1 flex gap-1.5" aria-label={`Step ${currentIndex + 1} of ${LESSON_STEPS.length}: ${STEP_NAMES[current]}`}>
    {LESSON_STEPS.map((step, index) => <li key={step} aria-hidden="true" className={`h-1.5 w-8 rounded-full ${index <= currentIndex ? "bg-[var(--vermilion)]" : "bg-[var(--ink)]/15"}`} />)}
  </ol>;
}

type HeadingRef = { headingRef: RefObject<HTMLHeadingElement | null> };

function StepHeading({ headingRef, children }: HeadingRef & { children: ReactNode }) {
  return <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-black outline-none">{children}</h2>;
}

/** What the guide says, in Japanese with the English beneath. */
function Said({ japanese, english }: { japanese: string; english: string }) {
  return <><p lang="ja" className="text-lg font-bold">{japanese}</p><p className="text-sm">{english}</p></>;
}

function SpeechNotice() {
  if (supportsJapaneseSpeech()) return null;
  return <p role="note" className="mt-3 rounded-lg bg-[var(--ink)]/5 px-3 py-2 text-sm">This browser can't play Japanese audio, so go by the romaji under each character.</p>;
}

function MeetStep({ headingRef, onDone }: HeadingRef & { onDone: () => void }) {
  const [heard, setHeard] = useState<LessonKana | null>(null);
  const hear = (item: LessonKana) => { setHeard(item); speakJapanese(item.kana); };
  return <>
    <StepHeading headingRef={headingRef}>Meet あ, い and う</StepHeading>
    <GuideNote character="chun" mood="happy" className="mt-3"><Said {...FIRST_LESSON_LINES.meet} /></GuideNote>
    <ul className="mt-4 grid grid-cols-3 gap-3">
      {FIRST_LESSON_KANA.map(item => <li key={item.kana}>
        <button type="button" onClick={() => hear(item)} aria-pressed={heard?.kana === item.kana} aria-label={`Hear ${item.kana}, ${item.romaji}`}
          className={`flex w-full flex-col items-center rounded-2xl border-2 bg-white/70 py-3 dark:bg-black/10 ${heard?.kana === item.kana ? "border-[var(--vermilion)]" : "border-[var(--ink)]/15"} ${focus}`}>
          <span lang="ja" className="text-5xl font-bold leading-tight">{item.kana}</span>
          <span className="text-sm font-bold opacity-75"><span aria-hidden="true">🔊 </span>{item.romaji}</span>
        </button>
      </li>)}
    </ul>
    <p aria-live="polite" className="mt-3 min-h-12 text-sm">{heard && <><span lang="ja" className="font-bold">{heard.kana}</span> · {heard.memoryAid}</>}</p>
    <SpeechNotice />
    <div className="mt-4 flex justify-end"><button type="button" onClick={onDone} className={primary}>Test my ears →</button></div>
  </>;
}

type MatchStepProps = HeadingRef & {
  answer: LessonKana; choices: readonly LessonKana[]; feedback: MatchFeedback; roundNumber: number; roundCount: number; isLastRound: boolean;
  onPick: (choice: LessonKana) => void; onNext: () => void;
};

function MatchStep({ headingRef, answer, choices, feedback, roundNumber, roundCount, isLastRound, onPick, onNext }: MatchStepProps) {
  const isCorrect = feedback.status === "correct";
  return <>
    <StepHeading headingRef={headingRef}>Which one says “{answer.romaji}”?</StepHeading>
    <p className="mt-1 text-sm opacity-75">Sound {roundNumber} of {roundCount}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => speakJapanese(answer.kana)} className={secondary}><span aria-hidden="true">🔊 </span>Play the sound</button>
      <p lang="ja" className="font-bold">{FIRST_LESSON_LINES.match.japanese} <span lang="en" className="font-normal">{FIRST_LESSON_LINES.match.english}</span></p>
    </div>
    <ul className="mt-4 grid grid-cols-3 gap-3" aria-label="Choices">
      {choices.map(choice => {
        const isPicked = feedback.status === "incorrect" && feedback.picked.kana === choice.kana;
        const isAnswer = isCorrect && choice.kana === answer.kana;
        return <li key={choice.kana}>
          <button type="button" onClick={() => onPick(choice)} disabled={isCorrect && !isAnswer}
            className={`w-full rounded-2xl border-2 py-4 text-5xl font-bold disabled:opacity-40 ${isAnswer ? "border-emerald-600 bg-emerald-50 text-emerald-900" : isPicked ? "border-rose-500" : "border-[var(--ink)]/15 bg-white/70 dark:bg-black/10"} ${focus}`}>
            <span lang="ja">{choice.kana}</span>
          </button>
        </li>;
      })}
    </ul>
    <div aria-live="polite" className="mt-4 min-h-16">
      {feedback.status === "correct" && <GuideNote character="chun" mood="happy"><p><span lang="ja" className="font-bold">せいかい！</span> Right, that's <span lang="ja">{answer.kana}</span>.</p></GuideNote>}
      {feedback.status === "incorrect" && <GuideNote character="chun" mood="worried"><p>Not quite: <span lang="ja">{feedback.picked.kana}</span> says “{feedback.picked.romaji}”. Try another.</p></GuideNote>}
    </div>
    <SpeechNotice />
    {isCorrect && <div className="mt-4 flex justify-end"><button type="button" onClick={onNext} className={primary}>{isLastRound ? "Now read a word →" : "Next sound →"}</button></div>}
  </>;
}

function ReadStep({ headingRef, onDone }: HeadingRef & { onDone: () => void }) {
  const word = FIRST_LESSON_WORD;
  return <>
    <StepHeading headingRef={headingRef}>Read this word</StepHeading>
    <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--ink)]/15 bg-white/70 py-5 dark:bg-black/10">
      <p lang="ja" className="text-6xl font-black tracking-widest">{word.text}</p>
      <p className="text-lg font-bold">{word.romaji} · “{word.meaning}”</p>
      <button type="button" onClick={() => speakJapanese(word.text)} className={secondary}><span aria-hidden="true">🔊 </span>Hear it</button>
    </div>
    <GuideNote character="hakase" mood="happy" className="mt-4">
      <Said japanese={FIRST_LESSON_LINES.read.japanese} english={`${FIRST_LESSON_LINES.read.english} あ + い makes ${word.text}, “${word.romaji}”: ${word.meaning}.`} />
    </GuideNote>
    <div className="mt-4 flex justify-end"><button type="button" onClick={onDone} className={primary}>Keep going →</button></div>
  </>;
}

/** The last step: the guest writes their name on a clipboard, then goes on to create an account or sign in with it. */
function NameStep({ headingRef }: HeadingRef) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hasTriedEmpty, setHasTriedEmpty] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const go = (path: "/register" | "/login") => {
    const guestName = cleanLearnerName(name);
    if (path === "/register" && !guestName) { setHasTriedEmpty(true); return; }
    const state: GuestNameState | null = guestName ? { guestName } : null;
    navigate(path, { state });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); go("/register"); };
  const showError = hasTriedEmpty && !cleanLearnerName(name);
  return <Clipboard className="mt-2">
    <StepHeading headingRef={headingRef}><span lang="ja">{FIRST_LESSON_LINES.name.japanese}</span> <span className="block text-lg">{FIRST_LESSON_LINES.name.english}</span></StepHeading>
    <p className="mt-2 text-sm text-gray-600">Tell us what to call you and we'll keep your place on the island.</p>
    <form onSubmit={submit} noValidate className="mt-4 space-y-4">
      <div>
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-700">Your name</label>
        <input id={inputId} value={name} onChange={event => setName(event.target.value)} maxLength={MAX_NAME_LENGTH} autoComplete="given-name"
          aria-invalid={showError} aria-describedby={showError ? errorId : undefined}
          className="mt-1.5 w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-xl font-bold text-gray-900 focus:border-emerald-600 focus:outline-none" />
        {showError && <p id={errorId} role="alert" className="mt-1 text-sm font-semibold text-red-700">Write your name to continue.</p>}
      </div>
      <button type="submit" className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Create my account →</button>
      <button type="button" onClick={() => go("/login")} className="w-full rounded-xl px-5 py-2 text-sm font-bold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600">I already have an account: sign in</button>
    </form>
  </Clipboard>;
}
