import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import UnitAssessmentCard from "../components/UnitAssessmentCard";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import LevelSwitch from "../components/LevelSwitch";
import { inLevel, useCourseLevel } from "../lib/courseLevel";

export default function QuizzesPage() {
  const level = useCourseLevel();
  const [allUnits, setUnits] = useState<CourseUnit[] | null>(null);
  const units = allUnits?.filter(inLevel(level)) ?? null;
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(setUnits).catch(() => { if (!controller.signal.aborted) setError("Could not load assessments. Please refresh to try again."); });
    return () => controller.abort();
  }, []);
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

    <div className="mt-6"><LevelSwitch level={level} /></div>
    <h1 className="mt-3 text-3xl font-black text-gray-900">Quizzes</h1>
    <p className="mt-2 mb-8 text-gray-600">Check what you have learned across each Japanese unit.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!units && !error && <p role="status">Loading assessments…</p>}
    {units && !units.length && <p className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">{level} has no unit assessments yet.</p>}
    <div className="space-y-5">{units?.map(unit => <UnitAssessmentCard key={unit.id} unit={unit} />)}</div>
  </main></div>;
}
