import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Friend } from "../../api/friends";
import type { Profile } from "../../api/profile";
import type { ClimbStation } from "../../lib/islandMap";
import { TIMES_OF_DAY } from "../../lib/timeOfDay";
import type { MapTimeSetting, TimeOfDay } from "../../lib/timeOfDay";

// What the outlying places show in their panel, above their destinations.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";
const MAX_QUESTION_LENGTH = 1000;
const FRIENDS_SHOWN = 4;

/** Mt Fuji: the JLPT levels as stations, the summit (N1) at the top, with the learner's chosen level marked. */
export function FujiClimb({ stations, currentLevel }: { stations: readonly ClimbStation[] | null; currentLevel: string }) {
  if (!stations) return <p className="mb-4 text-sm opacity-75">Your climb could not be loaded. Your levels are still open below.</p>;
  return <ol className="mb-4 flex flex-col-reverse gap-2" aria-label="Your climb, from N5 at the foot to N1 at the summit">
    {stations.map(station => {
      const isHere = station.level === currentLevel;
      const percent = station.totalUnits ? Math.round((station.completedUnits / station.totalUnits) * 100) : 0;
      return <li key={station.level} className={`rounded-xl border px-3 py-2 ${isHere ? "border-[var(--vermilion)] bg-white/70 dark:bg-black/10" : "border-[var(--ink)]/15"}`}>
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden="true">{station.isReached ? "🚩" : "⛰"}</span>
          <span className="font-black">{station.level}</span>
          {isHere && <span className="rounded-full bg-[var(--vermilion)] px-2 text-xs font-bold text-white">You are here</span>}
          <span className="ml-auto opacity-75">{station.totalUnits ? `${station.completedUnits} of ${station.totalUnits} units` : "Coming soon"}</span>
        </div>
        {station.totalUnits > 0 && <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/10" role="progressbar" aria-label={`${station.level} units completed`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div className="h-full rounded-full bg-[var(--vermilion)]" style={{ width: `${percent}%` }} />
        </div>}
      </li>;
    })}
  </ol>;
}

/** The harbour: which friends studied today (their boats are moored at the pier). */
export function HarbourFriends({ friends }: { friends: readonly Friend[] | null }) {
  if (!friends) return null;
  if (!friends.length) return <p className="mb-4 text-sm opacity-75">No friends yet. Add some and their boats will moor here on days they study.</p>;
  const studiedToday = friends.filter(friend => friend.progress?.activeToday);
  const names = studiedToday.slice(0, FRIENDS_SHOWN).map(friend => friend.displayName || friend.username);
  const others = studiedToday.length - names.length;
  return <p className="mb-4 rounded-xl bg-[var(--ink)]/5 px-3 py-2 text-sm">
    <span aria-hidden="true">⛵ </span>
    {studiedToday.length ? `${names.join(", ")}${others > 0 ? ` and ${others} more` : ""} studied today.` : "None of your friends have studied yet today."}
  </p>;
}

/** The tea house: ask sensei a question, answered on the study assistant's page. */
export function AskSensei() {
  const navigate = useNavigate();
  const inputId = useId();
  const [question, setQuestion] = useState("");
  const ask = (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    navigate(text ? `/assistant?q=${encodeURIComponent(text)}` : "/assistant");
  };
  return <form onSubmit={ask} className="mb-4">
    <label htmlFor={inputId} className="text-sm font-bold">Ask sensei</label>
    <div className="mt-1 flex gap-2">
      <input id={inputId} value={question} onChange={event => setQuestion(event.target.value)} maxLength={MAX_QUESTION_LENGTH} placeholder="What is the difference between は and が?"
        className={`min-w-0 flex-1 rounded-xl border border-[var(--ink)]/30 bg-white/80 px-3 py-2 text-sm text-gray-900 ${focus}`} />
      <button type="submit" className={`rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--paper)] hover:opacity-90 ${focus}`}>Ask</button>
    </div>
  </form>;
}

const TIME_LABELS: Record<TimeOfDay, { label: string; icon: string }> = {
  dawn: { label: "Dawn", icon: "🌅" }, day: { label: "Day", icon: "☀️" }, dusk: { label: "Dusk", icon: "🌇" }, night: { label: "Night", icon: "🌙" },
};

/** The bell tower: follow the learner's clock, or keep the map at one time of day. */
export function TimeChooser({ setting, clockTimeOfDay, onChoose }: { setting: MapTimeSetting; clockTimeOfDay: TimeOfDay; onChoose: (setting: MapTimeSetting) => void }) {
  const option = (value: MapTimeSetting, icon: string, label: string) => <label key={value}
    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--vermilion)] ${setting === value ? "border-[var(--vermilion)] bg-[var(--vermilion)]/10 font-bold" : "border-[var(--ink)]/15 hover:border-[var(--vermilion)]"}`}>
    <input type="radio" name="map-time" value={value} checked={setting === value} onChange={() => onChoose(value)} className="sr-only" />
    <span aria-hidden="true">{icon}</span>{label}
  </label>;
  return <fieldset className="mb-2">
    <legend className="mb-2 text-sm font-bold">Time on the map</legend>
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">{option("clock", "🔔", `Follow my clock (now ${TIME_LABELS[clockTimeOfDay].label.toLowerCase()})`)}</div>
      {TIMES_OF_DAY.map(mood => option(mood, TIME_LABELS[mood].icon, TIME_LABELS[mood].label))}
    </div>
    <p className="mt-2 text-xs opacity-70">Only the map changes; the site keeps its own light or dark theme.</p>
  </fieldset>;
}

const RECENT_BADGES_SHOWN = 3;

/** The onsen: how many badges the learner has and the latest ones (a stone by the spring for each). */
export function OnsenBadges({ profile }: { profile: Pick<Profile, "achievements_count" | "achievements"> | null }) {
  if (!profile) return null;
  if (!profile.achievements_count) return <p className="mb-4 text-sm opacity-75">No badges yet. Your first one sets a stone by the spring.</p>;
  const recent = [...profile.achievements].sort((a, b) => (b.earned_at ?? "").localeCompare(a.earned_at ?? "")).slice(0, RECENT_BADGES_SHOWN);
  return <div className="mb-4 rounded-xl bg-[var(--ink)]/5 px-3 py-2 text-sm">
    <p className="font-bold">{profile.achievements_count === 1 ? "1 badge earned" : `${profile.achievements_count} badges earned`}</p>
    {recent.length > 0 && <ul className="mt-1 space-y-0.5" aria-label="Latest badges">
      {recent.map(badge => <li key={badge.id}><span aria-hidden="true">{badge.icon ?? "🏅"} </span>{badge.title}</li>)}
    </ul>}
  </div>;
}
