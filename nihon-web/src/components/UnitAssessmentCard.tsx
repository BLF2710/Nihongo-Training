import { Link } from "react-router-dom";
import type { CourseUnit } from "../api/units";

export default function UnitAssessmentCard({ unit }: { unit: CourseUnit }) {
  const buttonClass = "mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
  return <section aria-label={`Unit ${unit.number} Assessment`} className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-6 shadow-sm sm:p-8">
    <h2 className="text-2xl font-black text-gray-900">{unit.completed ? `✓ UNIT ${unit.number} COMPLETE` : `${unit.isPlaceholder || unit.assessmentUnlocked ? "🎓" : "🔒"} UNIT ${unit.number} ASSESSMENT`}</h2>
    {unit.isPlaceholder ? <><p className="mt-3 font-bold text-emerald-800">Coming Soon</p><p className="mt-2 text-gray-600">Unit {unit.number} Assessment is not implemented yet.</p></> : unit.completed ? <>
      <p className="mt-3 text-gray-700">Unit {unit.number} Assessment passed.</p>
      <p className="mt-2 font-semibold text-emerald-800">Best score: {unit.bestCorrect} / {unit.questionCount} · Accuracy: {unit.bestScore}%</p>
      <Link className={buttonClass} to={`/quizzes/${unit.id}`}>Retake Assessment</Link>
    </> : <>
      <p className="mt-3 text-gray-700">{unit.assessmentUnlocked ? `You've completed all Unit ${unit.number} lessons. Now test your knowledge of the entire unit.` : `Complete all ${unit.totalLessons} Unit ${unit.number} lessons to unlock the final assessment.`}</p>
      <p className="mt-3 text-sm font-semibold text-emerald-800">{unit.questionCount} questions · {unit.passPercent}% required to pass</p>
      {unit.assessmentUnlocked ? <Link className={buttonClass} to={`/quizzes/${unit.id}`}>Start Unit {unit.number} Assessment →</Link> : <button disabled className="mt-5 rounded-xl bg-gray-200 px-5 py-3 font-bold text-gray-500 cursor-not-allowed">Assessment Locked</button>}
    </>}
    {!unit.allowed && <p className="mt-4 text-sm text-gray-600">🔒 {unit.reasons.join(" + ")}</p>}
  </section>;
}
