import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UnitSelector from "../components/UnitSelector";
import UnitAssessmentCard from "../components/UnitAssessmentCard";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";

export default function LessonsPage() {
  const navigate = useNavigate(); const [units, setUnits] = useState<CourseUnit[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(setUnits).catch(() => { if (!controller.signal.aborted) setError("Could not load lessons. Please refresh to try again."); });
    return () => controller.abort();
  }, []);
  const unit = units.find(item => item.id === selectedId) ?? units[0];
  const lessons = unit?.lessons ?? [];
  return <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar /><main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex-1"><button onClick={() => navigate("/")} className="text-sm font-semibold text-gray-600 hover:text-gray-900">← Dashboard</button><div className="mt-6 mb-8"><span className="inline-flex bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">🇯🇵 Japanese • N5 Beginner</span><h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">Lessons</h1><p className="mt-2 text-gray-600">Build practical Japanese step by step.</p></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!unit && !error && <p role="status">Loading units…</p>}
    {unit && <section className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <UnitSelector units={units} selectedId={unit.id} onChange={setSelectedId} />
      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-700">Unit {unit.number}</p>
      <h2 className="mt-1 text-3xl font-black text-gray-900">{unit.title}</h2>
      <p className="mt-2 text-gray-600">{unit.description}</p>
      {unit.isPlaceholder ? <p className="mt-4 font-bold text-emerald-700">Coming Soon · In development</p> : <>
      <p className="mt-5 text-sm font-bold text-gray-500">Unit Progress</p>
      <p className="mt-4 font-semibold text-gray-700">{unit.completedLessons} / {unit.totalLessons} lessons completed</p>
      <progress aria-label={`Unit ${unit.number} lesson progress`} value={unit.completedLessons} max={unit.totalLessons || 1} className="mt-2 h-2 w-full accent-emerald-600" />
      {unit.completed ? <p className="mt-3 font-bold text-emerald-700">✓ Unit {unit.number} Complete</p> : <p className="mt-3 text-sm text-gray-600">{unit.allLessonsCompleted ? "All lessons complete. Pass the unit assessment to complete this unit." : "Complete every lesson, then pass the unit assessment."}</p>}
      </>}
      {!unit.allowed && <p className="mt-2 text-sm text-gray-600">🔒 {unit.reasons.join(" + ")}</p>}
    </section>}
    <div className="space-y-4">{lessons.map((lesson, index) => <button key={lesson.id} disabled={lesson.isPlaceholder || !lesson.allowed} onClick={() => !lesson.isPlaceholder && lesson.allowed && navigate(`/lessons/japanese/${lesson.slug}`)} className={`w-full text-left bg-white rounded-3xl border shadow-sm transition p-6 sm:p-8 ${lesson.allowed ? "border-emerald-200 hover:shadow-md hover:border-emerald-400 cursor-pointer" : "border-gray-200 opacity-75 cursor-not-allowed"}`}><div className="flex flex-col sm:flex-row sm:items-center gap-5"><div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold">{index + 1}</div><div className="flex-1"><p className="text-xs font-bold tracking-wider uppercase text-emerald-700">Unit {unit?.number} • Lesson {index + 1}{!lesson.isPlaceholder && " • 5–10 min"}</p><h2 className="mt-1 text-2xl font-black text-gray-900">{lesson.title}</h2><p className="mt-1 text-sm text-gray-600">{lesson.isPlaceholder ? lesson.description : lesson.allowed ? "Ready to continue your Japanese foundations." : `🔒 Requires: ${lesson.reasons.join(" • ")}`}</p></div><span className="text-emerald-700 font-bold">{lesson.isPlaceholder ? "Coming Soon" : lesson.allowed ? "Start lesson →" : "Locked"}</span></div></button>)}</div>{unit && <div className="mt-10"><UnitAssessmentCard unit={unit} /></div>}</main></div>;
}
