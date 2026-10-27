import { useEffect, useState } from "react";
import { apiErrorMessage } from "../api/errors";

export type SaveStatus = { tone: "ok" | "error"; text: string } | null;

/**
 * A settings form's working copy: what was last saved, what is being edited, and whether they differ.
 * `onDirtyChange` lets the page warn before leaving a section with unsaved changes.
 */
export function useSettingsDraft<T extends object>(saved: T, save: (draft: T) => Promise<void>, onDirtyChange: (isDirty: boolean) => void) {
  const [draft, setDraft] = useState(saved);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>(null);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const set = <K extends keyof T>(key: K, value: T[K]) => { setDraft(current => ({ ...current, [key]: value })); setStatus(null); };
  const submit = async () => {
    setIsSaving(true); setStatus(null);
    try { await save(draft); setStatus({ tone: "ok", text: "Saved." }); }
    catch (failure) { setStatus({ tone: "error", text: apiErrorMessage(failure, "Could not save. Please try again.") }); }
    finally { setIsSaving(false); }
  };
  return { draft, set, isDirty, isSaving, status, submit, reset: () => { setDraft(saved); setStatus(null); } };
}
