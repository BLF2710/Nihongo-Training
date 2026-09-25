import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import UnitAssessmentCard from "../components/UnitAssessmentCard";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";

export default function QuizzesPage() {
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(setUnits).catch(() => { if (!controller.signal.aborted) setError("Could not load assessments. Please refresh to try again."); });
    return () => controller.abort();
  }, []);
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <Link to="/lessons" className="text-sm font-semibold text-gray-600">← Lessons</Link>
    <h1 className="mt-6 text-3xl font-black text-gray-900">Quizzes</h1>
    <p className="mt-2 mb-8 text-gray-600">Check what you have learned across each Japanese unit.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!units && !error && <p role="status">Loading assessments…</p>}
    <div className="space-y-5">{units?.map(unit => <UnitAssessmentCard key={unit.id} unit={unit} />)}</div>
  </main></div>;
}
