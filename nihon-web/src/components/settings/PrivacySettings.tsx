import { useState } from "react";
import { Link } from "react-router-dom";
import { VISIBILITY_TEXT } from "../../api/friends";
import type { ProfileVisibility } from "../../api/friends";
import type { Profile, ProfileUpdate } from "../../api/profile";
import { apiErrorMessage } from "../../api/errors";
import type { SaveStatus } from "../../lib/settingsDraft";
import FriendPrivacySettings from "../FriendPrivacySettings";
import { SaveMessage, SettingsCard } from "./SettingsParts";

const VISIBILITY_LABEL: Record<ProfileVisibility, string> = { private: "Only me", friends: "Friends", public: "All learners" };
type Props = { profile: Profile; onSave: (change: Partial<ProfileUpdate>) => Promise<void> };

/** Who sees your progress and who can reach you. Every choice is saved as soon as it changes. */
export default function PrivacySettings({ profile, onSave }: Props) {
  const [pending, setPending] = useState<Partial<Pick<Profile, "profile_visibility" | "friend_requests">>>({});
  const [status, setStatus] = useState<SaveStatus>(null);
  const visibility = pending.profile_visibility ?? profile.profile_visibility;
  const friendRequests = pending.friend_requests ?? profile.friend_requests ?? "everyone";
  const change = async (shown: typeof pending, update: Partial<ProfileUpdate>) => {
    setPending(shown); setStatus(null);
    try { await onSave(update); setStatus({ tone: "ok", text: "Saved." }); }
    catch (failure) { setStatus({ tone: "error", text: apiErrorMessage(failure, "Could not save this setting.") }); }
    finally { setPending({}); }
  };
  return <div className="grid gap-5">
    <SettingsCard id="visibility-settings" title="Your progress" description="Your name and username are always visible to learners who look you up. Your email address is never shown.">
      <fieldset className="grid gap-2" aria-label="Who can see your progress">
        <legend className="sr-only">Who can see your progress</legend>
        {(["private", "friends", "public"] as const).map(value => <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${visibility === value ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}>
          <input type="radio" name="visibility" className="mt-1" checked={visibility === value} disabled={Object.keys(pending).length > 0}
            onChange={() => void change({ profile_visibility: value }, { profileVisibility: value })} />
          <span><span className="block font-semibold">{VISIBILITY_LABEL[value]}</span><span className="block text-sm text-gray-600">{VISIBILITY_TEXT[value]}</span></span>
        </label>)}
      </fieldset>
    </SettingsCard>
    <SettingsCard id="requests-settings" title="Friend requests">
      <label className="flex gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={friendRequests === "everyone"} disabled={Object.keys(pending).length > 0}
          onChange={event => { const value = event.target.checked ? "everyone" : "nobody"; void change({ friend_requests: value }, { friendRequests: value }); }} />
        <span><span className="block font-semibold">Allow friend requests</span><span className="block text-sm text-gray-600">When off, nobody can send you a request; requests you already have stay until you answer them.</span></span>
      </label>
    </SettingsCard>
    <SaveMessage status={status} />
    <FriendPrivacySettings />
    <p className="text-sm text-gray-600">What we collect and who can see it: <Link to="/privacy" className="font-semibold text-emerald-700 hover:underline">privacy policy</Link>.</p>
  </div>;
}
