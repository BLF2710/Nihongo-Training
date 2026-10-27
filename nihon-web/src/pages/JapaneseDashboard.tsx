import { useEffect, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LevelWrapUp from "../components/LevelWrapUp";
import { fetchProfile } from "../api/profile";
import type { Profile } from "../api/profile";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { fetchKanjiProgress } from "../api/kanji";
import type { KanjiProgress } from "../api/kanji";
import { KANJI, kanjiLevel } from "../data/kanji";
import { activityProgress, parseSession, sessionSnapshot, subscribeSession } from "../lib/activitySession";
import { COURSE_LEVELS, inLevel, useCourseLevel } from "../lib/courseLevel";
import { useInboxSummary } from "../lib/inbox";
import { syncTimeZone } from "../lib/timeZone";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import TodayPanel from "../components/TodayPanel";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600";
// min-w-0 lets cards shrink inside grid columns, so truncated text never widens the page.
const card = "min-w-0 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";
const studyTools = [
  { title: "Vocabulary", mark: "言", href: "/vocabulary", description: "Words by unit, with audio and flashcards." },
  { title: "Grammar", mark: "文", href: "/grammar", description: "Patterns with clear examples." },
  { title: "Kana", mark: "あ", href: "/learn/hiragana", description: "Hiragana and katakana with stroke order." },
  { title: "Kanji", mark: "漢", href: "/learn/kanji", description: "Meanings, readings and flashcards." },
  { title: "Reading", mark: "読", href: "/reading", description: "Short passages with questions." },
  { title: "Grammar summary", mark: "要", href: "/grammar/summary", description: "Every pattern of your level on one page." },
];
const practiceTools = [
  { title: "Daily review", icon: "🗂️", href: "/srs", description: "Spaced repetition for your words and kanji." },
  { title: "Mistake notebook", icon: "📒", href: "/mistakes", description: "Practise the questions you got wrong." },
  { title: "Unit review", icon: "🔄", href: "/review", description: "Mixed questions per unit or level." },
  { title: "Listening", icon: "🎧", href: "/listening", description: "Words, sentences and dialogues." },
  { title: "Speaking", icon: "🎤", href: "/speaking", description: "Say it aloud and get checked." },
  { title: "Kanji practice", icon: "漢", href: "/learn/kanji/practice", description: "Meaning, reading and word questions." },
  { title: "Kana speed quiz", icon: "⚡", href: "/practice?type=hiragana", description: "Race the clock with hiragana." },
  { title: "Kana review", icon: "あ", href: "/review/hiragana", description: "Characters you still find hard." },
  { title: "Unit assessments", icon: "📝", href: "/quizzes", description: "Score 80% to complete a unit." },
  { title: "Mock exam", icon: "🎓", href: "/mock-exam", description: "A timed end-of-level exam." },
];

function greeting(now: Date) {
  const hour = now.getHours();
  return hour >= 5 && hour < 11 ? { jp: "おはようございます", en: "Good morning" } : hour >= 11 && hour < 18 ? { jp: "こんにちは", en: "Good afternoon" } : { jp: "こんばんは", en: "Good evening" };
}

/** A ring showing a share of the level complete. */
function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const share = max ? Math.min(1, value / max) : 0;
  const radius = 42, circumference = 2 * Math.PI * radius;
  return <figure className="relative h-28 w-28 shrink-0" aria-label={label}>
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/15" />
      <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-emerald-300"
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - share)} />
    </svg>
    <figcaption className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-2xl font-black">{Math.round(share * 100)}%</span><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">of level</span></figcaption>
  </figure>;
}

function StatTile({ icon, value, label, detail, href }: { icon: string; value: string; label: string; detail?: string; href?: string }) {
  const body = <><p className="flex items-center gap-2 text-sm font-semibold text-gray-500"><span aria-hidden="true">{icon}</span>{label}</p>
    <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>{detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}</>;
  return href ? <Link to={href} className={`block rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-300 ${focus}`}>{body}</Link> : <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">{body}</div>;
}

export default function JapaneseDashboard() {
  const navigate = useNavigate();
  const snapshot = useSyncExternalStore(subscribeSession, sessionSnapshot, () => null);
  const saved = parseSession(snapshot);
  const active = saved?.status === "active" ? saved : null;
  const level = useCourseLevel();
  const levelInfo = COURSE_LEVELS.find(item => item.id === level)!;
  const inbox = useInboxSummary();
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kanji, setKanji] = useState<KanjiProgress[] | null>(null);
  const [courseError, setCourseError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [question, setQuestion] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setCourseError(false); }).catch(() => { if (!controller.signal.aborted) setCourseError(true); });
    fetchProfile(controller.signal).then(data => { setProfile(data); setProfileError(false); syncTimeZone(data.time_zone ?? null); }).catch(() => { if (!controller.signal.aborted) setProfileError(true); });
    // Kanji progress only adds a statistic, so a failure just leaves that tile out.
    fetchKanjiProgress(controller.signal).then(setKanji).catch(() => { /* optional */ });
    return () => controller.abort();
  }, [retry]);

  const course = units?.filter(unit => !unit.isPlaceholder && inLevel(level)(unit)) ?? [];
  const nextUnit = course.find(unit => unit.allowed && !unit.completed);
  const nextLesson = nextUnit?.lessons.find(lesson => !lesson.isPlaceholder && lesson.allowed && !lesson.completed);
  const assessmentReady = nextUnit?.assessmentUnlocked && !nextUnit.assessmentPassed;
  const nextHref = assessmentReady ? `/quizzes/${nextUnit.id}` : nextLesson ? `/lessons/japanese/${nextLesson.slug}` : "/lessons";
  const completed = course.reduce((sum, unit) => sum + unit.completedLessons, 0);
  const total = course.reduce((sum, unit) => sum + unit.totalLessons, 0);
  const allComplete = course.length > 0 && course.every(unit => unit.completed);
  const focusUnit = nextUnit ?? [...course].reverse().find(unit => unit.allowed);
  const levelKanji = KANJI.filter(item => kanjiLevel(item.id) === level).map(item => item.id);
  const kanjiMastered = kanji?.filter(item => item.status === "mastered" && levelKanji.includes(item.kanjiId)).length ?? null;
  const now = new Date();
  const hello = greeting(now);
  const name = profile ? profile.display_name || profile.username : null;

  // A short plan for today, built from where the learner is in the course.
  const day = Math.floor(now.getTime() / 86_400_000);
  const skill = (["listening", "speaking"] as const)[day % 2];
  const plan = [
    nextLesson || assessmentReady ? { icon: assessmentReady ? "📝" : "📖", title: assessmentReady ? `Take the Unit ${nextUnit!.number} assessment` : nextLesson!.title, detail: assessmentReady ? "Score 80% to complete the unit." : `${level} Unit ${nextUnit!.number} · next lesson`, href: nextHref } : null,
    focusUnit ? { icon: "🔄", title: `Review Unit ${focusUnit.number}`, detail: "A mixed set of 12 questions.", href: `/review?unit=${focusUnit.id}` } : { icon: "あ", title: "Review kana", detail: "Practise the characters you find hardest.", href: "/review/hiragana" },
    focusUnit ? { icon: skill === "listening" ? "🎧" : "🎤", title: skill === "listening" ? "Listening practice" : "Speaking practice", detail: `Unit ${focusUnit.number}: ${skill === "listening" ? "hear and choose" : "say it aloud"}.`, href: `/${skill}?unit=${focusUnit.id}` } : null,
    { icon: "漢", title: kanjiMastered ? "Kanji practice" : "Meet your kanji", detail: kanjiMastered !== null && levelKanji.length ? `${kanjiMastered} of ${levelKanji.length} ${level} kanji mastered.` : "Meanings and readings from your lessons.", href: kanjiMastered ? "/learn/kanji/practice" : `/learn/kanji?level=${level}` },
  ].filter(item => item !== null).slice(0, 4);

  const ask = (event: FormEvent) => { event.preventDefault(); const text = question.trim(); navigate(text ? `/assistant?q=${encodeURIComponent(text)}` : "/assistant"); };

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {profile?.email && !profile.email_verified_at && <EmailVerificationBanner email={profile.email} />}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl"><span lang="ja">{hello.jp}</span>{name ? `, ${name}` : ""}</h1>
          <p className="mt-1 text-gray-600">{hello.en}. Welcome to your Japanese learning hub.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/levels?next=/" className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold ${focus}`}>🇯🇵 Japanese · {level} · Change</Link>
          <Link to="/profile" className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold ${focus}`}>Profile & settings</Link>
        </div>
      </header>
      {(courseError || profileError) && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{courseError ? "Course progress could not be refreshed. " : ""}{profileError ? "Account progress could not be refreshed. " : ""}Your study tools are still available. <button onClick={() => setRetry(value => value + 1)} className={`ml-2 font-bold underline ${focus}`}>Retry</button></div>}

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <section aria-labelledby="next-heading" className="relative min-w-0 overflow-hidden rounded-3xl bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-700 p-6 text-white shadow-lg sm:p-8">
          <span aria-hidden="true" lang="ja" className="pointer-events-none absolute -bottom-10 -right-4 select-none text-[11rem] font-black leading-none text-white/5">学</span>
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">{active ? "Pick up where you left off" : nextUnit ? `Your next step · ${level} Unit ${nextUnit.number}` : "Your next step"}</p>
              <h2 id="next-heading" className="mt-3 text-2xl font-black sm:text-3xl">{active ? active.title : courseError ? "Explore your course" : !units ? "Let’s keep learning" : assessmentReady ? `Ready for Unit ${nextUnit.number} assessment` : nextLesson ? nextLesson.title : allComplete ? "Your current course is complete!" : course.length ? "Choose your learning path" : `${level} lessons are coming soon`}</h2>
              <p className="mt-3 max-w-lg leading-relaxed text-emerald-50/90">{active ? activityProgress(active) : courseError ? "Open Lessons to check your available units." : !units ? "Loading your saved course progress…" : assessmentReady ? "All lessons are complete. Put them together in the unit assessment." : nextLesson ? `${nextUnit?.title}. Continue with your next lesson.` : allComplete ? `You finished ${level}. Try the wrap-up tools, or move on to the next level.` : course.length ? "Browse your units to see what is open and what comes next." : "Choose another level to keep studying."}</p>
              {active && <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-emerald-50">{active.kind === "lesson" ? "Lesson in progress" : active.kind === "speed" ? "Speed Quiz in progress" : active.kind === "assessment" ? "Assessment in progress" : "Practice in progress"} · your place is saved in this browser.</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={active?.href ?? (courseError ? "/lessons" : allComplete ? "/levels?next=/" : nextHref)} className={`rounded-xl bg-white px-5 py-3 font-bold text-emerald-900 shadow-sm hover:bg-emerald-50 ${focus}`}>{active ? "Resume session" : !courseError && assessmentReady ? "Start assessment" : !courseError && nextLesson ? "Continue learning" : allComplete ? "Choose a level" : "Browse lessons"} →</Link>
                {!active && <Link to="/lessons" className={`rounded-xl border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10 ${focus}`}>All units</Link>}
              </div>
            </div>
            {units && total > 0 && <ProgressRing value={completed} max={total} label={`${completed} of ${total} ${level} lessons completed`} />}
          </div>
        </section>

        <section aria-labelledby="progress-heading" className={card}>
          <div className="flex items-center justify-between"><h2 id="progress-heading" className="font-black">Your progress</h2><Link to="/statistics/japanese" className={`text-sm font-semibold text-emerald-700 ${focus}`}>Statistics →</Link></div>
          {profile ? <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile icon="🔥" value={`${profile.current_streak} ${profile.current_streak === 1 ? "day" : "days"}`} label="Streak"
              detail={`${profile.active_today ? "Done for today ✓" : profile.current_streak > 0 ? "Learn today to keep it" : "Learn today to start one"}${profile.longest_streak ? ` · best ${profile.longest_streak}` : ""}`} />
            <StatTile icon="⭐" value={`Level ${profile.level}`} label={profile.rank} detail={profile.xpProgress.nextLevelXp === null ? "Highest level reached" : `${profile.xp} / ${profile.xpProgress.nextLevelXp} XP`} href="/profile" />
            <StatTile icon="📖" value={units ? `${completed} / ${total}` : "…"} label={`${level} lessons`} detail={units ? `${course.filter(unit => unit.completed).length} of ${course.length} units complete` : undefined} href="/lessons" />
            <StatTile icon="漢" value={kanjiMastered === null ? "—" : `${kanjiMastered} / ${levelKanji.length}`} label={`${level} kanji mastered`} detail="3 correct answers and 80% accuracy" href={`/learn/kanji?level=${level}`} />
          </div> : <p role="status" className="mt-4 text-sm text-gray-500">{profileError ? "Account progress unavailable." : "Loading your XP, streak, and achievements…"}</p>}
          {profile && <><progress aria-label="XP progress to next level" max={100} value={profile.xpProgress.progressPercent} className="mt-4 h-2 w-full accent-emerald-600" />
            <p className="mt-1 text-xs text-gray-500">{profile.achievements_count} achievements · <Link to="/profile" className="font-semibold text-emerald-700 hover:underline">see them</Link></p></>}
        </section>
      </div>

      <TodayPanel units={units} />

      <section aria-labelledby="path-heading" className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><h2 id="path-heading" className="text-2xl font-black">Your path</h2><p className="mt-1 text-sm text-gray-500">{level} · {levelInfo.title}{units && course.length ? ` · ${course.filter(unit => unit.completed).length} of ${course.length} units complete` : ""}</p></div>
          <Link to="/quizzes" className={`text-sm font-bold text-emerald-700 ${focus}`}>View assessments →</Link>
        </div>
        {!units && !courseError && <p role="status" className="text-sm text-gray-500">Loading units…</p>}
        {units && !course.length && <p className={`${card} text-gray-600`}>{level} has no units yet. <Link to="/levels?next=/" className="font-semibold text-emerald-700 underline">Choose another level</Link>.</p>}
        <ol className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3">{course.map(unit => {
          const current = unit.id === nextUnit?.id;
          return <li key={unit.id} className="w-56 shrink-0 snap-start">
            <article className={`flex h-full flex-col rounded-2xl border bg-white p-4 ${current ? "border-emerald-500 shadow-md ring-2 ring-emerald-100" : "border-gray-200"} ${unit.allowed ? "" : "opacity-70"}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${unit.completed ? "bg-emerald-600 text-white" : current ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500" : unit.allowed ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{unit.completed ? "✓" : unit.allowed ? unit.number : "🔒"}</span>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Unit {unit.number} · {unit.completed ? "Complete" : current ? "In progress" : unit.allowed ? "Open" : "Locked"}</p>
              </div>
              <h3 className="mt-3 font-bold leading-snug">{unit.title}</h3>
              <progress aria-label={`Unit ${unit.number} lesson progress`} max={unit.totalLessons || 1} value={unit.completedLessons} className="mt-3 h-1.5 w-full accent-emerald-600" />
              <p className="mt-1 text-xs text-gray-500">{unit.completedLessons} / {unit.totalLessons} lessons</p>
              <div className="mt-auto pt-3">{unit.allowed ? <Link to={`/lessons?unit=${unit.id}`} className={`text-sm font-bold text-emerald-700 ${focus}`}>{unit.completed ? "Revisit unit" : "Open unit"} →</Link> : <p className="text-xs text-gray-500">{unit.reasons.join(" + ")}</p>}</div>
            </article>
          </li>;
        })}</ol>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="today-heading" className={card}>
          <h2 id="today-heading" className="text-xl font-black">Suggested for today</h2>
          <p className="mt-1 text-sm text-gray-500">A balanced session: something new, something to review, and a skill.</p>
          <ul className="mt-4 space-y-2">{plan.map(item => <li key={item.href}>
            <Link to={item.href} className={`flex items-center gap-4 rounded-2xl border border-gray-100 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/40 ${focus}`}>
              <span aria-hidden="true" lang="ja" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-800">{item.icon}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-bold">{item.title}</span><span className="block truncate text-sm text-gray-500">{item.detail}</span></span>
              <span aria-hidden="true" className="font-bold text-emerald-600">→</span>
            </Link>
          </li>)}</ul>
        </section>

        <section aria-labelledby="community-heading" className={card}>
          <h2 id="community-heading" className="text-xl font-black">Ask & connect</h2>
          <form onSubmit={ask} className="mt-4 rounded-2xl bg-indigo-50 p-4">
            <label className="block text-sm font-bold text-indigo-950">🤖 Ask the study assistant
              <span className="mt-2 flex gap-2"><input value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="e.g. What does 思う mean?"
                className="min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 font-normal text-gray-900 focus-visible:outline-2 focus-visible:outline-indigo-600" />
                <button className="rounded-xl bg-indigo-700 px-4 py-2 font-bold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Ask</button></span>
            </label>
          </form>
          <ul className="mt-3 divide-y divide-gray-100">
            <li><Link to="/messages" className={`flex items-center justify-between gap-3 py-3 ${focus}`}><span><span className="font-bold">💬 Messages</span><span className="block text-sm text-gray-500">Practise with other learners.</span></span>{(inbox?.direct ?? 0) > 0 ? <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-sm font-bold text-white">{inbox!.direct} new</span> : <span aria-hidden="true" className="text-emerald-600">→</span>}</Link></li>
            <li><Link to="/support" className={`flex items-center justify-between gap-3 py-3 ${focus}`}><span><span className="font-bold">🛟 Help & support</span><span className="block text-sm text-gray-500">Questions about your account or lessons.</span></span>{(inbox?.support ?? 0) > 0 ? <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-sm font-bold text-white">{inbox!.support} new</span> : <span aria-hidden="true" className="text-emerald-600">→</span>}</Link></li>
          </ul>
        </section>
      </div>

      {course.length > 0 && <LevelWrapUp level={level} units={course} />}

      <section aria-labelledby="study-heading" className="mt-10">
        <h2 id="study-heading" className="text-2xl font-black">Study & explore</h2>
        <p className="mt-1 text-sm text-gray-500">Reference tools you can browse any time. Studying here does not change quiz accuracy.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{studyTools.map(tool => <Link key={tool.href} to={tool.href} className={`group rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-sm ${focus}`}>
          <span aria-hidden="true" lang="ja" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-800 transition group-hover:bg-emerald-600 group-hover:text-white">{tool.mark}</span>
          <h3 className="mt-3 font-bold">{tool.title}</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">{tool.description}</p></Link>)}</div>
      </section>

      <section aria-labelledby="practice-heading" className="mt-10">
        <h2 id="practice-heading" className="text-2xl font-black">Put it into practice</h2>
        <p className="mt-1 text-sm text-gray-500">Games, reviews and checks. Practice answers build your accuracy and mastery.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{practiceTools.map(tool => <Link key={tool.href} to={tool.href} className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300 ${focus}`}>
          <span aria-hidden="true" lang="ja" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lg">{tool.icon}</span>
          <span><span className="block font-bold">{tool.title}</span><span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{tool.description}</span></span></Link>)}</div>
      </section>
    </main>
  </div>;
}
