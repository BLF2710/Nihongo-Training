import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import type { Assessment, AssessmentResult } from "../api/units";

const buttonClass = "rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-emerald-600";

export default function UnitAssessmentPage() {
  const { unitId } = useParams();
  return <AssessmentSession key={unitId} unitId={unitId ?? ""} />;
}

function AssessmentSession({ unitId }: { unitId: string }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    api.get<Assessment>(`/units/${encodeURIComponent(unitId)}/assessment`, { signal: controller.signal }).then(({ data }) => setAssessment(data)).catch((error: unknown) => {
      if (!controller.signal.aborted) setError((isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || "Could not load this assessment. Please refresh to try again.");
    });
    return () => controller.abort();
  }, [unitId]);

  async function submit() {
    if (!assessment || submitting.current || assessment.questions.some(question => answers[question.id] === undefined)) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const { data } = await api.post<AssessmentResult>(`/units/${encodeURIComponent(unitId)}/assessment`, {
        assessmentId: assessment.assessmentId, answers: assessment.questions.map(question => answers[question.id]),
      });
      setResult(data);
    } catch (error: unknown) {
      setError((isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || "Could not save your result. Please try submitting again.");
    } finally { submitting.current = false; setBusy(false); }
  }

  const question = assessment?.questions[index];
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link to="/quizzes" className="text-sm font-semibold text-gray-600">← Quizzes</Link>
    <h1 className="mt-6 mb-6 text-3xl font-black text-gray-900">{assessment?.title ?? "Unit Assessment"}</h1>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!assessment && !error && <p role="status">Checking assessment access…</p>}
    {assessment && result ? <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className={`text-2xl font-bold ${result.passed ? "text-emerald-700" : "text-gray-900"}`}>{result.passed ? `✓ Unit ${assessment.unitNumber} Assessment Passed` : "Assessment Not Passed"}</h2>
      <dl className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Score", `${result.correct} / ${result.total}`], ["Accuracy", `${result.accuracy}%`], ["Correct", result.correct], ["Wrong", result.wrong]].map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">{label}</dt><dd className="mt-1 text-2xl font-bold">{value}</dd></div>)}</dl>
      {!result.passed && <p className="text-gray-600">You need {result.passPercent}% to pass.</p>}
      {result.unitCompleted && <p className="mt-4 font-bold text-emerald-700">✓ Unit {assessment.unitNumber} Complete{!result.passed && " — your earlier pass is still valid."}</p>}
      <div className="mt-6 flex flex-wrap gap-3"><button className={buttonClass} onClick={() => { setAnswers({}); setIndex(0); setResult(null); setError(""); }}>{result.passed ? "Retake Assessment" : "Try Again"}</button><Link className={buttonClass} to={`/lessons?unit=${encodeURIComponent(unitId)}`}>Back to Lessons</Link></div>
    </section> : assessment && question && <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-emerald-700">Question {index + 1} / {assessment.questions.length}</p>
      <progress aria-label="Assessment progress" value={Object.keys(answers).length} max={assessment.questions.length} className="mt-3 w-full accent-emerald-600" />
      <fieldset disabled={busy} className="mt-6"><legend className="mb-5 text-xl font-bold leading-relaxed text-gray-900">{question.prompt}</legend>
        <div className="space-y-3">{question.options.map((option, optionIndex) => <label key={`${question.id}:${optionIndex}`} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 font-semibold ${answers[question.id] === optionIndex ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}>
          <input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))} className="mt-1 accent-emerald-600" />{option}
        </label>)}</div>
      </fieldset>
      <p className="mt-5 text-sm text-gray-500">Choose one answer. Your score is shown after you submit all questions.</p>
      <div className="mt-6 flex justify-between gap-3"><button disabled={busy || index === 0} className={buttonClass} onClick={() => setIndex(value => value - 1)}>← Previous</button>
        {index < assessment.questions.length - 1 ? <button disabled={busy || answers[question.id] === undefined} className={buttonClass} onClick={() => setIndex(value => value + 1)}>Next →</button> : <button disabled={busy || Object.keys(answers).length !== assessment.questions.length} className={buttonClass} onClick={() => void submit()}>{busy ? "Saving…" : "Submit Assessment"}</button>}
      </div>
    </section>}
  </main></div>;
}
