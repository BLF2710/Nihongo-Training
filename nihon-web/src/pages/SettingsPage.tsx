import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AccountSecurity from "../components/AccountSecurity";
import BlockedLearners from "../components/BlockedLearners";
import LearningSettings from "../components/settings/LearningSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import ProfileSettings from "../components/settings/ProfileSettings";
import { apiErrorMessage } from "../api/errors";
import { fetchProfile, toProfileUpdate, updateProfile } from "../api/profile";
import type { Profile, ProfileUpdate } from "../api/profile";
import { saveUserHandle, saveUserName } from "../lib/authStorage";

const SECTIONS = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "learning", label: "Learning", icon: "🎯" },
  { key: "privacy", label: "Privacy & friends", icon: "🔒" },
  { key: "blocked", label: "Blocked learners", icon: "🚫" },
  { key: "account", label: "Account & security", icon: "🔑" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];
const LEAVE_WARNING = "You have unsaved changes. Leave this section without saving?";

const isSection = (value: string | undefined): value is SectionKey => SECTIONS.some(section => section.key === value);

/** Settings, one section at a time: profile, learning, privacy & friends, blocked learners, account & security. */
export default function SettingsPage() {
  const { section } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // On phones the section menu scrolls sideways; keep the current section in view.
  useEffect(() => { navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" }); }, [section]);

  const load = useCallback((signal?: AbortSignal) => fetchProfile(signal)
    .then(data => { setProfile(data); setError(""); saveUserName(data.display_name || data.username); saveUserHandle(data.username); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your settings.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Each section saves only its own fields; the rest are sent as they were loaded.
  const saveProfile = useCallback(async (change: Partial<ProfileUpdate>) => {
    if (!profile) return;
    const saved = await updateProfile({ ...toProfileUpdate(profile), ...change });
    setProfile(current => current && { ...current, ...saved });
    saveUserName(saved.display_name || saved.username);
  }, [profile]);
  const canLeave = () => !isDirty || window.confirm(LEAVE_WARNING);
  const confirmLeave = (event: MouseEvent) => { if (!canLeave()) event.preventDefault(); };

  if (!isSection(section)) return <Navigate to="/settings/profile" replace />;
  const current = SECTIONS.find(item => item.key === section);
  return <div className="min-h-screen bg-gray-50"><Navbar back={{ to: "/profile", canLeave }} />
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-black">Settings</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[14rem_1fr]">
        <nav ref={navRef} aria-label="Settings sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-2 lg:flex-col lg:gap-1">{SECTIONS.map(item => <li key={item.key} className="shrink-0">
            <NavLink to={`/settings/${item.key}`} onClick={confirmLeave} className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold ${isActive ? "bg-emerald-50 text-emerald-800" : "text-gray-600 hover:bg-white"}`}>
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </NavLink>
          </li>)}</ul>
        </nav>
        <div className="min-w-0" aria-label={current?.label} role="region">
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button className="font-bold underline" onClick={() => void load()}>Try again</button></p>}
          {!profile && !error && <p role="status">Loading settings…</p>}
          {profile && <>
            {section === "profile" && <ProfileSettings profile={profile} onSave={saveProfile} onDirtyChange={setIsDirty} />}
            {section === "learning" && <LearningSettings profile={profile} onSave={saveProfile} onDirtyChange={setIsDirty} />}
            {section === "privacy" && <PrivacySettings profile={profile} onSave={saveProfile} />}
            {section === "blocked" && <BlockedLearners />}
            {section === "account" && (profile.email
              ? <AccountSecurity email={profile.email} verified={Boolean(profile.email_verified_at)} methods={profile.sign_in} onChanged={() => void load()} />
              : <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Account details are unavailable right now.</p>)}
          </>}
        </div>
      </div>
    </main>
  </div>;
}
