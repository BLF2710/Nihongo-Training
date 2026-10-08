import { useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchProfile } from "../api/profile";
import type { Profile } from "../api/profile";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { activityProgress, parseSession, sessionSnapshot, subscribeSession } from "../lib/activitySession";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600";
const studyTools = [
  { title: "Vocabulary", mark: "言", href: "/vocabulary", description: "Revisit course words by unit and lesson, listen, or study with flashcards." },
  { title: "Grammar", mark: "文", href: "/grammar", description: "Simple patterns, clear explanations, and examples from your lessons." },
  { title: "Hiragana", mark: "あ", href: "/learn/hiragana", description: "Learn the sounds, follow stroke order, and try writing each character." },
  { title: "Katakana", mark: "ア", href: "/learn/katakana", description: "Explore basic characters, contracted sounds, and extended combinations." },
  { title: "Kanji", mark: "漢", href: "/learn/kanji", description: "Study meanings and readings through course vocabulary. Flip cards for stroke order." },
];
const practiceTools = [
  { title: "Hiragana Speed Quiz", href: "/practice?type=hiragana", description: "Choose sound groups or individual characters, then type their romaji." },
  { title: "Katakana Speed Quiz", href: "/practice?type=katakana", description: "Pick Single, Double, or Extended characters for your own practice set." },
  { title: "Hiragana Review", href: "/review/hiragana", description: "A focused session that prioritizes characters you are still learning." },
  { title: "Katakana Review", href: "/review/katakana", description: "Review 5, 10, 15, or 20 characters using your existing quiz progress." },
  { title: "Kanji practice", href: "/learn/kanji/practice", description: "Mixed meaning, reading, and vocabulary questions build Kanji progress." },
  { title: "Unit assessments", href: "/quizzes", description: "Finish a unit’s lessons, then score at least 80% to complete the unit." },
];

export default function JapaneseDashboard() {
  const snapshot = useSyncExternalStore(subscribeSession, sessionSnapshot, () => null);
  const saved = parseSession(snapshot);
  const active = saved?.status === "active" ? saved : null;
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courseError, setCourseError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setCourseError(false); }).catch(() => { if (!controller.signal.aborted) setCourseError(true); });
    fetchProfile(controller.signal).then(data => { setProfile(data); setProfileError(false); }).catch(() => { if (!controller.signal.aborted) setProfileError(true); });
    return () => controller.abort();
  }, [retry]);
  const course = units?.filter(unit => !unit.isPlaceholder) ?? [];
  const nextUnit = course.find(unit => unit.allowed && !unit.completed);
  const nextLesson = nextUnit?.lessons.find(lesson => !lesson.isPlaceholder && lesson.allowed && !lesson.completed);
  const assessmentReady = nextUnit?.assessmentUnlocked && !nextUnit.assessmentPassed;
  const nextHref = assessmentReady ? `/quizzes/${nextUnit.id}` : nextLesson ? `/lessons/japanese/${nextLesson.slug}` : "/lessons";
  const completed = course.reduce((sum, unit) => sum + unit.completedLessons, 0);
  const total = course.reduce((sum, unit) => sum + unit.totalLessons, 0);
  const allComplete = course.length > 0 && course.every(unit => unit.completed);
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">🇯🇵 Japanese · N5 foundations</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your Japanese learning hub</h1><p className="mt-2 text-gray-600">{profile ? `Welcome, ${profile.display_name || profile.username}. ` : ""}A little learning, a little practice, every day.</p></div>
        <Link to="/profile" className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold ${focus}`}>Profile & settings →</Link>
      </header>
      {(courseError || profileError) && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{courseError ? "Course progress could not be refreshed. " : ""}{profileError ? "Account progress could not be refreshed. " : ""}Your study tools are still available. <button onClick={() => setRetry(value => value + 1)} className={`ml-2 font-bold underline ${focus}`}>Retry</button></div>}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="next-heading" className="rounded-3xl bg-emerald-900 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Your next step</p>
          <h2 id="next-heading" className="mt-3 text-2xl font-black sm:text-3xl">{active ? active.title : courseError ? "Explore your course" : !units ? "Let’s keep learning" : assessmentReady ? `Ready for Unit ${nextUnit.number} assessment` : nextLesson ? nextLesson.title : allComplete ? "Your current course is complete!" : "Choose your learning path"}</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-emerald-100">{active ? activityProgress(active) : courseError ? "Open Lessons to check your available units." : !units ? "Loading your saved course progress…" : assessmentReady ? "All lessons are complete. Put them together in the unit assessment." : nextLesson ? `Unit ${nextUnit?.number} · ${nextUnit?.title}. Continue with your next available lesson.` : allComplete ? "Revisit a lesson, strengthen your character recognition, or retake an assessment." : "Browse your units to see available lessons and the requirements for your next step."}</p>
          {active && <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-emerald-100"><span className="font-bold">{active.kind === "lesson" ? "Lesson in progress" : active.kind === "speed" ? "Speed Quiz in progress" : active.kind === "assessment" ? "Assessment in progress" : "Practice in progress"}</span><p className="mt-1">Your place and answers are saved in this browser. Pick up where you left off.</p></div>}
          <div className="mt-6 flex flex-wrap gap-3"><Link to={active?.href ?? (courseError ? "/lessons" : nextHref)} className={`rounded-xl bg-white px-5 py-3 font-bold text-emerald-900 ${focus}`}>{active ? "Resume session" : !courseError && assessmentReady ? "Start assessment" : !courseError && nextLesson ? "Continue learning" : "Browse lessons"} →</Link>{!active && <Link to="/lessons" className={`rounded-xl border border-emerald-600 px-5 py-3 font-semibold text-white ${focus}`}>Choose a unit</Link>}</div>
        </section>
        <section aria-label="Account progress" className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between"><h2 className="font-bold">Your progress</h2><span className="text-xs text-gray-500">Across your account</span></div>
          {profile ? <><div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-3xl font-black">Level {profile.level}</p><p className="mt-1 text-sm font-semibold text-emerald-700">{profile.rank}</p></div><p className="text-sm font-bold text-gray-600">{profile.xp.toLocaleString()} XP</p></div>
            <progress aria-label="XP progress to next level" max={100} value={profile.xpProgress.progressPercent} className="mt-4 h-2 w-full accent-emerald-600" />
            <p className="mt-1 text-xs text-gray-500">{profile.xpProgress.nextLevelXp === null ? "Highest configured level reached" : `${profile.xp} / ${profile.xpProgress.nextLevelXp} total XP toward the next level`}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4"><div><p className="text-xl font-black">{profile.current_streak} days</p><p className="text-xs text-gray-500">Current streak</p></div><Link to="/profile" className={focus}><p className="text-xl font-black">{profile.achievements_count}</p><p className="text-xs text-gray-500">Achievements →</p></Link></div></> : <p role="status" className="mt-5 text-sm text-gray-500">{profileError ? "Account progress unavailable." : "Loading your XP, streak, and achievements…"}</p>}
        </section>
      </div>
      <section aria-labelledby="course-heading" className="mt-9">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 id="course-heading" className="text-2xl font-black">Your course</h2><p className="mt-1 text-sm text-gray-500">{units ? `${completed} / ${total} lessons completed · ${course.filter(unit => unit.completed).length} / ${course.length} units complete` : "Practical Japanese, one unit at a time."}</p></div><Link to="/quizzes" className={`text-sm font-bold text-emerald-700 ${focus}`}>View assessments →</Link></div>
        <div className="grid gap-4 md:grid-cols-3">{course.map(unit => <article key={unit.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Unit {unit.number} · {unit.completed ? "Complete ✓" : unit.allowed ? "Available" : "Locked"}</p><h3 className="mt-2 text-lg font-bold">{unit.title}</h3><p className="mt-3 text-sm text-gray-500">{unit.completedLessons} / {unit.totalLessons} lessons</p><progress aria-label={`Unit ${unit.number} lesson progress`} max={unit.totalLessons || 1} value={unit.completedLessons} className="mt-2 h-2 w-full accent-emerald-600" /><div className="mt-auto pt-4">{unit.allowed ? <Link to={`/lessons?unit=${unit.id}`} className={`font-bold text-emerald-700 ${focus}`}>{unit.completed ? "Revisit unit" : "Open unit"} →</Link> : <p className="text-sm text-gray-500">🔒 {unit.reasons.join(" + ")}</p>}</div></article>)}</div>
        {!units && !courseError && <p role="status" className="text-sm text-gray-500">Loading units…</p>}
      </section>
      <section aria-labelledby="study-heading" className="mt-10"><h2 id="study-heading" className="text-2xl font-black">Study & explore</h2><p className="mt-1 text-sm text-gray-500">Reference tools you can browse any time. Studying here does not change quiz accuracy.</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{studyTools.map(tool => <Link key={tool.href} to={tool.href} className={`group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-sm ${focus}`}><span aria-hidden="true" className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl font-bold text-emerald-800">{tool.mark}</span><h3 className="mt-3 font-bold">{tool.title} <span className="text-emerald-600">→</span></h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p></Link>)}</div></section>
      <section aria-labelledby="practice-heading" className="mt-10"><h2 id="practice-heading" className="text-2xl font-black">Put it into practice</h2><p className="mt-1 text-sm text-gray-500">Choose your own character set, review weaker sounds, or check what you’ve learned.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{practiceTools.map(tool => <Link key={tool.href} to={tool.href} className={`rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 ${focus}`}><h3 className="font-bold">{tool.title} <span className="text-indigo-600">→</span></h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p></Link>)}</div></section>
      <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-6"><div><h2 className="text-xl font-bold">See where you’re improving</h2><p className="mt-2 max-w-xl text-sm text-gray-600">Japanese statistics show your Hiragana and Katakana game accuracy and character mastery. Kanji progress lives in the Kanji section.</p></div><div className="flex flex-wrap gap-3"><Link to="/statistics/japanese" className={`rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white ${focus}`}>Japanese statistics →</Link><Link to="/learn/kanji" className={`rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-800 ${focus}`}>Kanji progress →</Link></div></section>
    </main>
  </div>;
}
