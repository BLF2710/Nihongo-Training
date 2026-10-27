import { useEffect, useState } from "react";
import { apiErrorMessage } from "../api/errors";
import { fetchSocialSettings, saveSocialSettings } from "../api/social";
import type { SocialSettings } from "../api/social";

const CHOICES: { name: keyof SocialSettings; label: string; help: string }[] = [
  { name: "shareActivity", label: "Share my activity with friends", help: "Friends see lessons you complete, units you pass and achievements you earn in their feed, and can cheer you on. A private profile shares nothing." },
  { name: "showStudyingNow", label: "Show friends when I'm studying", help: "A green dot next to your name on your friends' list while you're on a learning page." },
  { name: "suggestMe", label: "Friend suggestions", help: "See learners you might know, and be suggested to them: friends of your friends, and learners on your course level who also turned this on. There is never a public list of learners." },
];

/** The opt-in friend features, saved as soon as a box is changed. */
export default function FriendPrivacySettings() {
  const [settings, setSettings] = useState<SocialSettings | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<keyof SocialSettings | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchSocialSettings(controller.signal).then(setSettings)
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Could not load these settings.")); });
    return () => controller.abort();
  }, []);
  // The box changes at once and goes back if saving fails.
  const change = async (name: keyof SocialSettings, value: boolean) => {
    const before = settings;
    setSettings(current => current && { ...current, [name]: value }); setSaving(name); setError("");
    try { setSettings(await saveSocialSettings({ [name]: value })); }
    catch (failure) { setSettings(before); setError(apiErrorMessage(failure, "Could not save this setting.")); }
    finally { setSaving(null); }
  };
  return <section aria-labelledby="friend-privacy-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
    <h2 id="friend-privacy-heading" className="font-black">Friends and activity</h2>
    {!settings && !error && <p role="status" className="mt-2 text-sm text-gray-600">Loading…</p>}
    {settings && <div className="mt-3 grid gap-4">{CHOICES.map(choice => <label key={choice.name} className="flex gap-3">
      <input type="checkbox" className="mt-1 h-4 w-4" checked={settings[choice.name]} disabled={saving !== null}
        onChange={event => void change(choice.name, event.target.checked)} />
      <span><span className="block font-semibold">{choice.label}</span><span className="block text-sm text-gray-600">{choice.help}</span></span>
    </label>)}</div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>;
}
