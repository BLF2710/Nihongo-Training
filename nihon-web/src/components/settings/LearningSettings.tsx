import type { Profile } from "../../api/profile";
import { useSettingsDraft } from "../../lib/settingsDraft";
import { settingsHelp, settingsInput, settingsLabel } from "../../lib/settingsStyles";
import { SettingsCard, SettingsForm } from "./SettingsParts";

const MAX_DAILY_MINUTES = 1440;
type LearningChange = { learningLanguage: string; nativeLanguage: string; learningGoal: string; dailyGoal: number };
type Props = { profile: Profile; onSave: (change: LearningChange) => Promise<void>; onDirtyChange: (isDirty: boolean) => void };

/** Languages, the learning goal and the daily study goal. */
export default function LearningSettings({ profile, onSave, onDirtyChange }: Props) {
  const form = useSettingsDraft<LearningChange>({
    learningLanguage: profile.learning_language, nativeLanguage: profile.native_language ?? "", learningGoal: profile.learning_goal ?? "", dailyGoal: Number(profile.daily_goal),
  }, onSave, onDirtyChange);
  return <SettingsCard id="learning-settings" title="Learning" description="What you're learning and how much you want to study each day.">
    <SettingsForm {...form} onSubmit={() => void form.submit()} onReset={form.reset}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={settingsLabel}>Learning language<input className={settingsInput} maxLength={80} value={form.draft.learningLanguage} onChange={event => form.set("learningLanguage", event.target.value)} /></label>
        <label className={settingsLabel}>Native language<input className={settingsInput} maxLength={80} value={form.draft.nativeLanguage} onChange={event => form.set("nativeLanguage", event.target.value)} /></label>
      </div>
      <label className={settingsLabel}>Learning goal<input className={settingsInput} maxLength={120} value={form.draft.learningGoal} placeholder="e.g. Pass the JLPT N4" onChange={event => form.set("learningGoal", event.target.value)} /></label>
      <label className={settingsLabel}>Daily goal (minutes)<input type="number" min={1} max={MAX_DAILY_MINUTES} required className={settingsInput + " max-w-32"} value={form.draft.dailyGoal} onChange={event => form.set("dailyGoal", Number(event.target.value))} />
        <span className={settingsHelp}>Minutes of active study a day, shown on your dashboard.</span></label>
    </SettingsForm>
  </SettingsCard>;
}
