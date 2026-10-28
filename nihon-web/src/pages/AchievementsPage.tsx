import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SectionTabs from "../components/SectionTabs";
import { apiErrorMessage } from "../api/errors";
import { fetchGamification } from "../api/gamification";
import type { Achievement, AchievementCategory, Gamification, TodayActivity } from "../api/gamification";
import { timeAgo } from "../lib/notifications";
import {
  ACHIEVEMENT_CATEGORIES, achievementPercent, describeCap, isCapReached, isEarned, nextAchievements, SHOWN_SOURCES, XP_SOURCES,
} from "../lib/gamification";

const SECTIONS = [
  { key: "achievements", path: "/achievements", label: "Achievements", icon: "🏆" },
  { key: "xp", path: "/achievements/xp", label: "Earning XP", icon: "⚡" },
] as const;
const CLOSEST_COUNT = 3;

function useGamification() {
  const [data, setData] = useState<Gamification | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchGamification(controller.signal).then(result => { setData(result); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your level and achievements could not be loaded.")); });
    return () => controller.abort();
  }, [attempt]);
  return { data, error, retry: () => setAttempt(value => value + 1) };
}

function Meter({ percent, label, tone = "emerald" }: { percent: number; label: string; tone?: "emerald" | "amber" | "white" }) {
  const fill = tone === "white" ? "bg-white" : tone === "amber" ? "bg-amber-500" : "bg-emerald-600";
  const track = tone === "white" ? "bg-white/25" : "bg-gray-100";
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={`h-2.5 overflow-hidden rounded-full ${track}`}>
    <div className={`h-full rounded-full ${fill} transition-[width]`} style={{ width: `${percent}%` }} />
  </div>;
}

/** Level, rank, streak and today's XP: the learner's standing at a glance. */
function LevelHero({ data }: { data: Gamification }) {
  const { level } = data;
  const toNext = level.nextLevelXp - data.xp;
  return <section aria-labelledby="level-heading" className="overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-indigo-600 to-emerald-600 p-6 text-white shadow-lg sm:p-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-white/40 bg-white/10 shadow-inner">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Level</span>
        <span className="text-5xl font-black leading-none">{level.level}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h1 id="level-heading" className="text-3xl font-black">{data.rank} learner</h1>
        <p className="mt-1 text-indigo-100">{data.xp.toLocaleString()} XP in total · {toNext.toLocaleString()} XP to level {level.level + 1}</p>
        <div className="mt-4"><Meter tone="white" percent={level.progressPercent} label={`Progress to level ${level.level + 1}`} /></div>
        <p className="mt-1.5 flex justify-between text-xs text-indigo-100"><span>{level.currentLevelXp.toLocaleString()} XP</span><span>{level.nextLevelXp.toLocaleString()} XP</span></p>
      </div>
    </div>
    <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center">
      {[["Today", `+${data.today.xp} XP`], ["Streak", `${data.streak.current} ${data.streak.current === 1 ? "day" : "days"}`], ["Best streak", `${data.streak.longest} ${data.streak.longest === 1 ? "day" : "days"}`]].map(([label, value]) =>
        <div key={label}><dt className="text-xs font-bold uppercase tracking-wider text-indigo-100">{label}</dt><dd className="mt-1 text-xl font-black">{value}</dd></div>)}
    </dl>
  </section>;
}

/** Every rank in order, with the learner's place and the XP still needed for the next one. */
function RankLadder({ data }: { data: Gamification }) {
  return <section aria-labelledby="ranks-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="ranks-heading" className="text-lg font-black">Ranks</h2>
      <p className="text-sm text-gray-600">{data.nextRank ? <><b className="text-gray-900">{(data.nextRank.xp - data.xp).toLocaleString()} XP</b> to {data.nextRank.name}</> : "You've reached the top rank."}</p></div>
    <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{data.ranks.map(rank => {
      const isCurrent = rank.name === data.rank, isReached = data.xp >= rank.xp;
      return <li key={rank.name} aria-current={isCurrent ? "step" : undefined}
        className={`rounded-xl border px-3 py-2 text-center ${isCurrent ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : isReached ? "border-gray-200 bg-gray-50" : "border-dashed border-gray-200 text-gray-400"}`}>
        <p className={`text-sm font-black ${isCurrent ? "text-emerald-800" : isReached ? "text-gray-800" : ""}`}><span aria-hidden="true">{isReached ? "✓ " : "🔒 "}</span>{rank.name}</p>
        <p className="text-xs">{rank.xp.toLocaleString()} XP</p>
      </li>;
    })}</ol>
  </section>;
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const earned = isEarned(achievement);
  return <li className={`flex gap-4 rounded-2xl border p-4 ${earned ? "border-amber-200 bg-amber-50/70" : "border-gray-200 bg-white"}`}>
    <span aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${earned ? "bg-white shadow-sm" : "bg-gray-100 grayscale"}`}>{achievement.icon}</span>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2"><h3 className={`font-bold ${earned ? "text-gray-900" : "text-gray-700"}`}>{achievement.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${earned ? "bg-amber-200 text-amber-900" : "bg-gray-100 text-gray-600"}`}>+{achievement.xpReward} XP</span></div>
      <p className="text-sm text-gray-600">{achievement.description}</p>
      {earned
        ? <p className="mt-2 text-xs font-semibold text-amber-800"><span aria-hidden="true">🏆 </span>Earned {timeAgo(achievement.earnedAt ?? "")}</p>
        : <div className="mt-2"><Meter percent={achievementPercent(achievement)} label={`${achievement.title} progress`} tone="amber" />
          <p className="mt-1 text-xs text-gray-500">{achievement.progress.toLocaleString()} / {achievement.goal.toLocaleString()}</p></div>}
    </div>
  </li>;
}

type Filter = AchievementCategory | "all";

function AchievementsSection({ data }: { data: Gamification }) {
  const [filter, setFilter] = useState<Filter>("all");
  const earnedCount = data.achievements.filter(isEarned).length;
  const closest = nextAchievements(data.achievements, CLOSEST_COUNT);
  const shown = data.achievements.filter(item => filter === "all" || item.category === filter);
  const filters: { id: Filter; label: string; icon?: string }[] = [{ id: "all", label: "All" }, ...ACHIEVEMENT_CATEGORIES];
  return <>
    {closest.length > 0 && <section aria-labelledby="closest-heading" className="mb-6">
      <h2 id="closest-heading" className="mb-3 text-lg font-black">Almost there</h2>
      <ul className="grid gap-3 md:grid-cols-3">{closest.map(item => <AchievementCard key={item.id} achievement={item} />)}</ul>
    </section>}
    <section aria-labelledby="all-heading">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 id="all-heading" className="text-lg font-black">All achievements</h2>
        <p className="text-sm text-gray-600"><b className="text-gray-900">{earnedCount}</b> of {data.achievements.length} earned</p></div>
      <div className="mb-4"><Meter percent={Math.floor(earnedCount / Math.max(1, data.achievements.length) * 100)} label="Achievements earned" tone="amber" /></div>
      <div role="group" aria-label="Show achievements in" className="mb-4 flex gap-2 overflow-x-auto pb-1">{filters.map(item =>
        <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-emerald-600 ${filter === item.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
          {item.icon && <span aria-hidden="true">{item.icon} </span>}{item.label}</button>)}</div>
      <ul className="grid gap-3 md:grid-cols-2">{shown.map(item => <AchievementCard key={item.id} achievement={item} />)}</ul>
    </section>
  </>;
}

function ActivityRow({ activity }: { activity: TodayActivity }) {
  const info = XP_SOURCES[activity.source];
  const capped = isCapReached(activity);
  const body = <>
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-800">{info.icon}</span>
    <span className="min-w-0 flex-1">
      <span className="flex items-baseline justify-between gap-2"><span className="font-bold text-gray-900">{info.label}</span><span className="shrink-0 text-sm font-black text-emerald-700">+{activity.amount} XP</span></span>
      <span className="block text-sm text-gray-600">{info.how}</span>
      {activity.dailyCap !== null && <span className="mt-2 block"><Meter percent={Math.min(100, Math.floor(activity.earned / activity.dailyCap * 100))} label={`${info.label}: XP today`} /></span>}
      <span className={`mt-1 block text-xs ${capped ? "font-semibold text-amber-800" : "text-gray-500"}`}>{capped ? "Today's limit reached — more tomorrow" : describeCap(activity)}</span>
    </span>
  </>;
  const className = "flex gap-3 rounded-2xl border border-gray-200 bg-white p-4";
  return <li>{info.href ? <Link to={info.href} className={`${className} hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600`}>{body}</Link> : <div className={className}>{body}</div>}</li>;
}

function EarningSection({ data }: { data: Gamification }) {
  const activities = SHOWN_SOURCES.map(source => data.today.activities.find(item => item.source === source)).filter((item): item is TodayActivity => item !== undefined);
  return <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
    <section aria-labelledby="ways-heading">
      <h2 id="ways-heading" className="text-lg font-black">Ways to earn XP</h2>
      <p className="mb-3 text-sm text-gray-600">Repeated activities have a daily limit, so XP follows real study. Achievements add their own XP on top.</p>
      <ul className="grid gap-3 md:grid-cols-2">{activities.map(item => <ActivityRow key={item.source} activity={item} />)}</ul>
    </section>
    <section aria-labelledby="recent-heading" className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 id="recent-heading" className="text-lg font-black">Recent XP</h2>
      {data.recent.length ? <ul className="mt-3 divide-y divide-gray-100">{data.recent.map((event, index) => <li key={`${event.createdAt}-${index}`} className="flex items-center gap-3 py-2 text-sm">
        <span aria-hidden="true" className="w-6 text-center">{XP_SOURCES[event.source]?.icon ?? "⚡"}</span>
        <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-gray-800">{XP_SOURCES[event.source]?.label ?? event.source}</span><span className="text-xs text-gray-500">{timeAgo(event.createdAt)}</span></span>
        <span className="font-black text-emerald-700">+{event.amount}</span>
      </li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No XP yet. Finish a lesson to earn your first.</p>}
    </section>
  </div>;
}

/** Level, rank, achievements with progress, and how XP is earned. */
export default function AchievementsPage() {
  const { section } = useParams();
  const { data, error, retry } = useGamification();
  if (section !== undefined && section !== "xp") return <Navigate to="/achievements" replace />;
  const current = section === "xp" ? "xp" : "achievements";
  return <div className="min-h-screen bg-gray-50"><Navbar />
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {error && <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} <button className="ml-2 font-bold underline" onClick={retry}>Try again</button></p>}
      {!data && !error && <p role="status" className="text-gray-500">Loading your level and achievements…</p>}
      {data && <>
        <LevelHero data={data} />
        <div className="mt-6"><RankLadder data={data} /></div>
        <div className="mt-8"><SectionTabs label="Achievements sections" tabs={SECTIONS.map(item => ({ to: item.path, label: item.label, icon: item.icon, end: true }))} /></div>
        {current === "xp" ? <EarningSection data={data} /> : <AchievementsSection data={data} />}
      </>}
    </main>
  </div>;
}
