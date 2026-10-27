import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { apiErrorMessage } from "../../api/errors";
import { removeAvatar, uploadAvatar } from "../../api/profile";
import { shrinkForUpload, UnreadableImageError } from "../../lib/avatar";
import type { SaveStatus } from "../../lib/settingsDraft";
import PersonAvatar from "../PersonAvatar";
import { SaveMessage } from "./SettingsParts";

type Props = { name: string; username: string; avatar: string | null; onChange: (avatar: string | null) => void };

/** Upload, replace or remove the profile picture. Saved straight away; separate from the form's Save. */
export default function AvatarPicker({ name, username, avatar, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<SaveStatus>(null);
  const run = async (work: () => Promise<string | null>, done: string) => {
    setBusy(true); setStatus(null);
    try { onChange(await work()); setStatus({ tone: "ok", text: done }); }
    catch (failure) { setStatus({ tone: "error", text: failure instanceof UnreadableImageError ? failure.message : apiErrorMessage(failure, "Could not save the picture.") }); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void run(async () => (await uploadAvatar(await shrinkForUpload(file))).avatar, "Picture saved.");
  };
  return <div className="flex flex-wrap items-center gap-4">
    <PersonAvatar name={name} username={username} avatar={avatar} size="lg" />
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <label className={`cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500 focus-within:outline-2 focus-within:outline-emerald-600 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? "Saving…" : avatar ? "Change picture" : "Upload picture"}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={busy} onChange={choose} />
        </label>
        {avatar && <button type="button" className="rounded-xl px-3 py-2 text-sm font-bold text-red-700 hover:underline disabled:opacity-50" disabled={busy}
          onClick={() => void run(async () => (await removeAvatar()).avatar, "Picture removed.")}>Remove</button>}
      </div>
      <p className="text-xs text-gray-500">JPEG, PNG, WebP or GIF. Cropped to a square and stored small; location and camera details are removed.</p>
      <SaveMessage status={status} />
    </div>
  </div>;
}
