import RubyText from "./RubyText";
import { useState } from "react";
import QuizChoices from "./QuizChoices";
import { apiErrorMessage } from "../api/errors";
import { checkReviewAnswer } from "../api/review";
import type { ReviewAnswer, ReviewGrade, ReviewQuestion } from "../api/review";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const tile = "rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
type InputProps<Q> = { question: Q; disabled: boolean; onSubmit: (answer: ReviewAnswer) => void };

function MultipleChoiceInput({ question, disabled, onSubmit }: InputProps<Extract<ReviewQuestion, { type: "multiple_choice" }>>) {
  const [selected, setSelected] = useState<string | null>(null);
  return <>
    <h2 className="mb-5 text-xl font-bold leading-relaxed text-gray-900"><RubyText text={question.prompt} /></h2>
    <QuizChoices choices={question.options} selected={selected} disabled={disabled} onChoose={choice => { setSelected(choice); onSubmit(question.options.indexOf(choice)); }} />
  </>;
}

// Pick a word on the left, then its partner on the right. Picking a paired word again frees it.
function WordMatchInput({ question, disabled, onSubmit }: InputProps<Extract<ReviewQuestion, { type: "word_match" }>>) {
  const [active, setActive] = useState<number | null>(null);
  const [chosen, setChosen] = useState<(string | null)[]>(() => question.left.map(() => null));
  const pickLeft = (index: number) => { setChosen(previous => previous.map((right, i) => i === index ? null : right)); setActive(index); };
  const pickRight = (right: string) => {
    if (active === null) return;
    setChosen(previous => previous.map((current, i) => i === active ? right : current));
    setActive(null);
  };
  const complete = chosen.every(right => right !== null);
  return <>
    <h2 className="mb-2 text-xl font-bold text-gray-900"><RubyText text={question.prompt} /></h2>
    <p className="mb-5 text-sm text-gray-500">Select a word on the left, then its match on the right.</p>
    <div className="grid grid-cols-2 gap-4">
      <div role="group" aria-label="Words" className="space-y-3">{question.left.map((left, index) =>
        <button key={left} disabled={disabled} aria-pressed={active === index} onClick={() => pickLeft(index)} className={`${tile} w-full ${active === index ? "border-indigo-500 bg-indigo-50" : chosen[index] ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white"}`}>
          <span lang="ja" className="block text-lg"><RubyText text={left} /></span>
          <span className="block text-sm font-normal text-gray-600">{chosen[index] ? `→ ${chosen[index]}` : "Not matched yet"}</span>
        </button>)}
      </div>
      <div role="group" aria-label="Matches" className="space-y-3">{question.right.map(right =>
        <button key={right} disabled={disabled || active === null || chosen.includes(right)} onClick={() => pickRight(right)} className={`${tile} w-full border-gray-200 bg-white`}><RubyText text={right} /></button>)}
      </div>
    </div>
    <button className={`${button} mt-5`} disabled={disabled || !complete} onClick={() => onSubmit(chosen as string[])}>Check matches</button>
  </>;
}

// Tap letters to build the word; tap a placed letter to take it back.
function WordScrambleInput({ question, disabled, onSubmit }: InputProps<Extract<ReviewQuestion, { type: "word_scramble" }>>) {
  const [placed, setPlaced] = useState<number[]>([]);
  return <>
    <h2 className="mb-2 text-xl font-bold text-gray-900">Unscramble the word</h2>
    <p className="mb-5 text-gray-600">Meaning: <span className="font-semibold">{question.hint}</span></p>
    <div role="group" aria-label="Your word" lang="ja" className="flex min-h-14 flex-wrap gap-2 rounded-xl border-2 border-dashed border-gray-200 p-3">{placed.map((letterIndex, position) =>
      <button key={letterIndex} disabled={disabled} aria-label={`Remove ${question.letters[letterIndex]}`} onClick={() => setPlaced(previous => previous.filter((_, i) => i !== position))} className={`${tile} border-emerald-400 bg-emerald-50 text-xl`}>{question.letters[letterIndex]}</button>)}
    </div>
    <div role="group" aria-label="Letters" lang="ja" className="mt-4 flex flex-wrap gap-2">{question.letters.map((letter, letterIndex) =>
      <button key={letterIndex} disabled={disabled || placed.includes(letterIndex)} onClick={() => setPlaced(previous => [...previous, letterIndex])} className={`${tile} border-gray-200 bg-white text-xl`}>{letter}</button>)}
    </div>
    <button className={`${button} mt-5`} disabled={disabled || placed.length !== question.letters.length} onClick={() => onSubmit(placed.map(index => question.letters[index]).join(""))}>Check word</button>
  </>;
}

/** One assessment or question-bank question. The answer is graded by the server, which then reveals the solution. */
export default function ReviewQuestionCard({ unitId, question, isLast, onDone }: { unitId: string; question: ReviewQuestion; isLast: boolean; onDone: (correct: boolean) => void }) {
  const [grade, setGrade] = useState<ReviewGrade | null>(null);
  const [pending, setPending] = useState<ReviewAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (answer: ReviewAnswer) => {
    setPending(answer); setBusy(true); setError("");
    try { setGrade(await checkReviewAnswer(unitId, question.id, answer)); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not check the answer. Please try again.")); }
    finally { setBusy(false); }
  };
  const locked = busy || grade !== null || (pending !== null && !error);

  return <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    {question.type === "multiple_choice" && <MultipleChoiceInput question={question} disabled={locked} onSubmit={submit} />}
    {question.type === "word_match" && <WordMatchInput question={question} disabled={locked} onSubmit={submit} />}
    {question.type === "word_scramble" && <WordScrambleInput question={question} disabled={locked} onSubmit={submit} />}
    {busy && <p role="status" className="mt-5 text-sm text-gray-500">Checking…</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error} {pending !== null && <button className="ml-2 font-bold underline" onClick={() => void submit(pending)}>Retry</button>}</p>}
    {grade && <div className="mt-6">
      <p role="status" className={`text-lg font-bold ${grade.correct ? "text-emerald-700" : "text-red-700"}`}>{grade.correct ? "Correct!" : "Not quite."}</p>
      {!grade.correct && <p className="mt-1 text-gray-700">Correct answer: <span lang="ja" className="font-semibold">{grade.solution}</span></p>}
      {grade.explanation && <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{grade.explanation}</p>}
      <button className={`${button} mt-5`} onClick={() => onDone(grade.correct)}>{isLast ? "See results →" : "Next →"}</button>
    </div>}
  </section>;
}
