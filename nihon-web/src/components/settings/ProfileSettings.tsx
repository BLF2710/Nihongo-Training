import { Link } from "react-router-dom";
import type { Profile } from "../../api/profile";
import { useSettingsDraft } from "../../lib/settingsDraft";
import { settingsHelp, settingsInput, settingsLabel } from "../../lib/settingsStyles";
import { SettingsCard, SettingsForm } from "./SettingsParts";

const MAX_DISPLAY_NAME = 80;
const MAX_BIO = 500;

type Props = { profile: Profile; onSave: (change: { displayName: string; bio: string }) => Promise<void>; onDirtyChange: (isDirty: boolean) => void };

/** How other learners see you: display name and bio. */
export default function ProfileSettings({ profile, onSave, onDirtyChange }: Props) {
  const form = useSettingsDraft({ displayName: profile.display_name, bio: profile.bio }, onSave, onDirtyChange);
  return <SettingsCard id="profile-settings" title="Profile" description="Your display name and bio, shown on your public profile.">
    <SettingsForm {...form} onSubmit={() => void form.submit()} onReset={form.reset}>
      <label className={settingsLabel}>Display name<input className={settingsInput} required maxLength={MAX_DISPLAY_NAME} value={form.draft.displayName} onChange={event => form.set("displayName", event.target.value)} />
        <span className={settingsHelp}>Your username, @{profile.username}, can't be changed; friends add you with it.</span></label>
      <label className={settingsLabel}>Bio<textarea className={settingsInput} rows={4} maxLength={MAX_BIO} value={form.draft.bio} onChange={event => form.set("bio", event.target.value)} />
        <span className={settingsHelp}>{form.draft.bio.length} / {MAX_BIO}</span></label>
    </SettingsForm>
    <Link to={`/u/${encodeURIComponent(profile.username)}`} className="mt-4 inline-block text-sm font-bold text-emerald-700 hover:underline">See your public profile →</Link>
  </SettingsCard>;
}
