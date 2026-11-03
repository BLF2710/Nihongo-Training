import { GuideNote } from "../components/cast/GuideNote";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import UnitAssessmentCard from "../components/UnitAssessmentCard";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import LevelSwitch from "../components/LevelSwitch";
import { inLevel, useCourseLevel } from "../lib/courseLevel";
import { IslandBoard, SHEET } from "../components/theme/IslandBoard";

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
    <IslandBoard island="fuji">
    {!units && !error && <p role="status" className="board-label">Loading assessments…</p>}
    {units && !units.length && <div className={SHEET}><GuideNote character="kurama"><p className="text-gray-600">{level} has no unit assessments yet.</p></GuideNote></div>}
    {units && units.length > 0 && <div className={SHEET}><GuideNote character="kurama" mood="happy"><p>Each unit ends with a trial in my dojo. Finish its lessons, then show me what you have learned.</p></GuideNote></div>}
    <div className="space-y-5">{units?.map(unit => <UnitAssessmentCard key={unit.id} unit={unit} />)}</div>
    </IslandBoard>
  </main></div>;
}
