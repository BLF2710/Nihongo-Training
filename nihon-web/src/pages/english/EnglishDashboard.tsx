import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProfile } from "../../api/profile";
import type { Profile } from "../../api/profile";
import { fetchSrsSummary } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import type { CourseUnit } from "../../api/units";
import Navbar from "../../components/Navbar";
import { focusRing } from "../../components/englishStudy/EnglishStudyFrame";
import { ENGLISH_COURSE_LEVELS, useEnglishCourseLevel } from "../../lib/courseLevel";
import { englishFocusUnit, englishNextStep, englishTodayPlan, englishUnitsOfLevel } from "../../lib/englishDashboard";
import type { EnglishNextStep } from "../../lib/englishDashboard";

// The English study dashboard (/dashboard for English learners): for learners who'd rather study than walk the island.
// The next step in the chosen level, today's plan, progress, and every study tool, on one screen.

const MS_PER_DAY = 86_400_000;
const LEVELS_PAGE = "/levels?next=/dashboard";
const sheet = "min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm";
const TOOLS = [
  { icon: "📖", title: "Lessons", href: "/lessons" }, { icon: "🧠", title: "Vocabulary", href: "/english/vocabulary" },
  { icon: "✍️", title: "Grammar", href: "/english/grammar" }, { icon: "🧾", title: "Grammar summary", href: "/english/grammar/summary" },
  { icon: "🗂️", title: "Flashcards", href: "/english/flashcards" }, { icon: "🔄", title: "Review", href: "/english/review" },
  { icon: "🎧", title: "Listening", href: "/english/listening" }, { icon: "🎤", title: "Speaking", href: "/english/speaking" },
  { icon: "📝", title: "Unit tests", href: "/quizzes" }, { icon: "🎓", title: "Mock exam", href: "/english/mock-exam" },
  { icon: "📒", title: "Mistake notebook", href: "/mistakes" }, { icon: "🧩", title: "English Arcade", href: "/arcade" },
] as const;

/** Good morning / afternoon / evening, with its Vietnamese. */
function greeting(hour: number) {
  return hour >= 5 && hour < 12 ? { english: "Good morning", vietnamese: "Chào buổi sáng" }
    : hour < 18 && hour >= 12 ? { english: "Good afternoon", vietnamese: "Chào buổi chiều" } : { english: "Good evening", vietnamese: "Chào buổi tối" };
}

// A phone shows one of these at a time, under the next step, so the dashboard fits the screen; wider screens show all.
const PANELS = [{ key: "today", label: "Today" }, { key: "progress", label: "Progress" }, { key: "tools", label: "Study tools" }] as const;
type Panel = (typeof PANELS)[number]["key"];

const NEXT_COPY: Record<EnglishNextStep["kind"], { action: string }> = {
  lesson: { action: "Continue learning" }, assessment: { action: "Take the unit test" },
  "level-complete": { action: "Choose a level" }, "nothing-open": { action: "Browse lessons" },
};

function nextHeading(step: EnglishNextStep, level: string): { label: string; title: string; detail: string } {
  if (step.kind === "lesson") return { label: `Your next step · ${level} Unit ${step.unit.number}`, title: step.lesson.title, detail: `${step.unit.title}. Pick up with your next lesson.` };
  if (step.kind === "assessment") return { label: `${level} Unit ${step.unit.number}`, title: `Ready for the Unit ${step.unit.number} test`, detail: "Every lesson is done. Score 80% to complete the unit." };
  if (step.kind === "level-complete") return { label: `${level} complete`, title: `You finished ${level}!`, detail: "Try the mock exam, or move on to the next level." };
  return { label: "Your next step", title: "Choose a lesson", detail: "Browse the units to see what is open." };
}

export default function EnglishDashboard() {
  const level = useEnglishCourseLevel();
  const levelInfo = ENGLISH_COURSE_LEVELS.find(item => item.id === level);
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cardsDue, setCardsDue] = useState<number | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [phonePanel, setPhonePanel] = useState<Panel>("today");
  const shownOnPhone = (panel: Panel) => panel === phonePanel ? "" : "hidden lg:block";
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(setUnits).catch(() => { if (!controller.signal.aborted) setHasFailed(true); });
    // The profile and flashcards only add figures, so a failure leaves them out.
    fetchProfile(controller.signal).then(setProfile).catch(() => { /* optional */ });
    fetchSrsSummary(controller.signal, "english").then(summary => setCardsDue(summary.dueTotal)).catch(() => { /* optional */ });
    return () => controller.abort();
  }, []);

  const course = englishUnitsOfLevel(units ?? [], level);
  const step = englishNextStep(course);
  const focus = englishFocusUnit(course);
  const now = new Date();
  const plan = englishTodayPlan(step, focus, cardsDue, Math.floor(now.getTime() / MS_PER_DAY));
  const done = course.reduce((sum, unit) => sum + unit.completedLessons, 0), total = course.reduce((sum, unit) => sum + unit.totalLessons, 0);
  const hello = greeting(now.getHours());
  const name = profile ? profile.display_name || profile.username : null;
  const heading = units ? nextHeading(step, level) : { label: "Your next step", title: "Loading your progress…", detail: "" };

  return <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">{hello.english}{name ? `, ${name}` : ""}</h1>
        <p className="text-sm text-gray-600"><span lang="vi">{hello.vietnamese}!</span> Your English study desk.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={LEVELS_PAGE} className={`rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold ${focusRing}`}>🇬🇧 {level}<span className="hidden sm:inline"> · {levelInfo?.title}</span> · Change</Link>
        <Link to="/english/island" className={`rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold ${focusRing}`}>🏰 Walk the island</Link>
      </div>
    </header>
    {hasFailed && <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Your progress could not be loaded. The study tools below still work.</p>}

    <div className="mt-3 grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr]">
      <section aria-labelledby="next-heading" className="min-w-0 rounded-2xl bg-linear-to-br from-emerald-700 to-teal-800 p-4 text-white shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">{heading.label}</p>
        <h2 id="next-heading" className="mt-1 text-xl font-black sm:mt-2 sm:text-2xl">{heading.title}</h2>
        <p className="mt-1 text-sm text-emerald-50">{heading.detail}</p>
        {total > 0 && <><progress aria-label={`${done} of ${total} ${level} lessons completed`} max={total} value={done} className="mt-3 h-2 w-full accent-white sm:mt-4" />
          <p className="mt-1 text-xs text-emerald-100">{done} of {total} {level} lessons · {course.filter(unit => unit.completed).length} of {course.length} units</p></>}
        <Link to={step.href} className={`mt-3 inline-block rounded-xl bg-white px-4 py-2 sm:mt-4 font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>{NEXT_COPY[step.kind].action} →</Link>
      </section>

      <div role="group" aria-label="Show" className="flex gap-1 rounded-xl bg-gray-100 p-1 lg:hidden">{PANELS.map(({ key, label }) =>
        <button key={key} type="button" aria-pressed={phonePanel === key} onClick={() => setPhonePanel(key)}
          className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-bold ${focusRing} ${phonePanel === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>{label}</button>)}
      </div>

      <section aria-labelledby="today-heading" className={`${sheet} ${shownOnPhone("today")}`}>
        <h2 id="today-heading" className="font-black">Today</h2>
        <ul className="mt-2 space-y-1.5">{plan.map(item => <li key={item.href}>
          <Link to={item.href} className={`flex items-center gap-3 rounded-xl border border-gray-100 p-2 hover:border-emerald-300 hover:bg-emerald-50/40 ${focusRing}`}>
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg">{item.icon}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold">{item.title}</span><span className="block truncate text-xs text-gray-500">{item.detail}</span></span>
          </Link>
        </li>)}</ul>
        {!plan.length && <p className="mt-2 text-sm text-gray-500">Open a lesson to start your plan.</p>}
      </section>

      <section aria-labelledby="progress-heading" className={`${sheet} ${shownOnPhone("progress")}`}>
        <div className="flex items-center justify-between"><h2 id="progress-heading" className="font-black">Progress</h2><Link to="/statistics/english" className={`text-sm font-semibold text-emerald-700 ${focusRing}`}>Statistics →</Link></div>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <Figure icon="🔥" label="Streak" value={profile ? `${profile.current_streak} ${profile.current_streak === 1 ? "day" : "days"}` : "…"} detail={profile?.active_today ? "Done today ✓" : "Study today to keep it"} />
          <Figure icon="⭐" label={profile?.rank ?? "Level"} value={profile ? `Level ${profile.level}` : "…"} detail={profile ? `${profile.xp} XP` : ""} />
          <Figure icon="📖" label={`${level} lessons`} value={units ? `${done} / ${total}` : "…"} detail={`${course.filter(unit => unit.completed).length} units complete`} />
          <Figure icon="🗂️" label="Flashcards" value={cardsDue === null ? "—" : `${cardsDue} due`} detail="Words from your lessons" />
        </dl>
      </section>
    </div>

    <section aria-labelledby="tools-heading" className={`mt-3 ${sheet} ${shownOnPhone("tools")}`}>
      <h2 id="tools-heading" className="sr-only font-black lg:not-sr-only">Study tools</h2>
      <ul className="grid grid-cols-3 gap-2 lg:mt-2 sm:grid-cols-4 lg:grid-cols-6">{TOOLS.map(tool => <li key={tool.href}>
        <Link to={tool.href} className={`flex h-full flex-col items-center gap-1 rounded-xl border border-gray-200 p-1.5 text-center text-xs sm:p-2 font-bold hover:border-emerald-400 hover:bg-emerald-50/40 sm:flex-row sm:gap-2 sm:text-left sm:text-sm ${focusRing}`}>
          <span aria-hidden="true" className="text-lg">{tool.icon}</span><span className="min-w-0 sm:truncate">{tool.title}</span>
        </Link>
      </li>)}</ul>
    </section>
  </main></div>;
}

function Figure({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return <div className="rounded-xl bg-gray-50 p-2.5">
    <dt className="flex items-center gap-1.5 truncate text-xs font-semibold text-gray-500"><span aria-hidden="true">{icon}</span>{label}</dt>
    <dd className="text-lg font-black">{value}</dd>
    {detail && <dd className="truncate text-xs text-gray-500">{detail}</dd>}
  </div>;
}
