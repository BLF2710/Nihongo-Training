/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchProfile } from "../api/profile";
import type { Profile } from "../api/profile";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { saveUserHandle, saveUserName } from "../lib/authStorage";
import { avatarUrl } from "../lib/avatar";
import { saveUserAvatar } from "../lib/userAvatar";

const profileButton = "inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-600";
const LATEST_ACHIEVEMENTS = 4;
const VISIBILITY_SUMMARY: Record<Profile["profile_visibility"], string> = {
  private: "Progress visible to: only you", friends: "Progress visible to: your friends", public: "Progress visible to: all learners",
};

export default function ProfilePage() {
  const [params] = useSearchParams();
  // Settings moved to their own page; old links (?tab=settings) still arrive there.
  if (params.get("tab") === "settings") return <Navigate to="/settings/profile" replace />;
  return <ProfileView />;
}

function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null); const [message, setMessage] = useState("");
  const load = async () => { try { const data = await fetchProfile(); setProfile(data); saveUserName(data.display_name || data.username); saveUserHandle(data.username); saveUserAvatar(data.avatar); } catch { setMessage("Could not load your account."); } };
  useEffect(() => { void load(); }, []);
  if (!profile) return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-5xl mx-auto p-8"><p>{message || "Loading profile…"}</p></main></div>;
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-5xl mx-auto px-4 sm:px-6 py-10"><><section className="relative rounded-3xl border bg-white p-6">
      <div className="flex items-start gap-5 pr-12 sm:pr-32">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-3xl font-black text-white">{profile.avatar ? <img src={avatarUrl(profile.avatar)} alt="" className="h-full w-full object-cover" /> : profile.display_name.charAt(0)}</div>
        <div className="min-w-0 flex-1"><h1 className="break-words text-3xl font-black">{profile.display_name}</h1><p className="text-gray-500">@{profile.username}</p><p className="mt-2 text-sm text-gray-600">{profile.bio || <>No bio yet. <Link to="/settings/profile" className="font-semibold text-emerald-700 hover:underline">Add one</Link></>}</p></div>
        <Link to="/settings/profile" className={profileButton + " absolute right-4 top-4 sm:right-6 sm:top-6"}><span aria-hidden="true">⚙️</span><span className="sr-only sm:not-sr-only sm:ml-1">Settings</span></Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-sm">
        <Link to={`/u/${encodeURIComponent(profile.username)}`} className={profileButton}>See your public profile →</Link>
        <Link to="/friends" className={profileButton}>Friends →</Link>
        <Link to="/settings/privacy" className="text-gray-600 hover:underline">{VISIBILITY_SUMMARY[profile.profile_visibility]}</Link>
      </div>
    </section><section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[`Level ${profile.level}`, `${profile.xp} XP`], ["Rank", profile.rank], ["Streak", `${profile.current_streak} ${profile.current_streak === 1 ? "day" : "days"}${profile.longest_streak ? ` · best ${profile.longest_streak}` : ""}`], ["Lessons", `${profile.lessons_completed} completed`]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-gray-400">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</section><ProgressCards profile={profile} /></></main></div>;
}

/** Level progress and the latest achievements, each leading to the Achievements page. */
function ProgressCards({ profile }: { profile: Profile }) {
  const { xpProgress } = profile;
  const latest = profile.achievements.slice(0, LATEST_ACHIEVEMENTS);
  return <div className="mt-6 grid gap-4 lg:grid-cols-2">
    <section aria-labelledby="profile-level-heading" className="rounded-2xl border bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-emerald-600 text-white"><span className="text-[9px] font-bold uppercase tracking-wider">Level</span><span className="text-xl font-black leading-none">{profile.level}</span></span>
        <div className="min-w-0"><h2 id="profile-level-heading" className="font-black">{profile.rank} learner</h2><p className="text-sm text-gray-600">{(xpProgress.nextLevelXp - profile.xp).toLocaleString()} XP to level {profile.level + 1}</p></div>
      </div>
      <div role="progressbar" aria-label={`Progress to level ${profile.level + 1}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={xpProgress.progressPercent} className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-indigo-500" style={{ width: `${xpProgress.progressPercent}%` }} /></div>
      <p className="mt-1.5 flex justify-between text-xs text-gray-500"><span>{profile.xp.toLocaleString()} XP</span><span>{xpProgress.nextLevelXp.toLocaleString()} XP</span></p>
      <Link to="/achievements/xp" className="mt-4 inline-block text-sm font-bold text-emerald-700 hover:underline">Ways to earn XP →</Link>
    </section>
    <section aria-labelledby="profile-achievements-heading" className="rounded-2xl border bg-white p-6">
      <div className="flex items-baseline justify-between gap-2"><h2 id="profile-achievements-heading" className="font-black">Achievements ({profile.achievements_count})</h2><Link to="/achievements" className="text-sm font-bold text-emerald-700 hover:underline">See all →</Link></div>
      {latest.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{latest.map(item => <li key={item.id} className="flex items-center gap-3 rounded-xl bg-amber-50 p-3"><span aria-hidden="true" className="text-2xl">{item.icon ?? "🏆"}</span><span className="min-w-0"><span className="block truncate font-bold">{item.title}</span><span className="block text-xs text-gray-600">{item.description}</span></span></li>)}</ul>
        : <p className="mt-3 text-sm text-gray-500">Complete lessons and challenges to earn achievements.</p>}
    </section>
  </div>;
}
