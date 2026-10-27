import type { FormEvent, ReactNode } from "react";
import type { SaveStatus } from "../../lib/settingsDraft";

/** One block of settings with its heading and a sentence on what it controls. */
export function SettingsCard({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return <section aria-labelledby={id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
    <h2 id={id} className="text-lg font-black">{title}</h2>
    {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    <div className="mt-4">{children}</div>
  </section>;
}

type FormProps = { children: ReactNode; isDirty: boolean; isSaving: boolean; status: SaveStatus; onSubmit: () => void; onReset: () => void };

/** A settings form with Save and Undo changes; Save is only active when something changed. */
export function SettingsForm({ children, isDirty, isSaving, status, onSubmit, onReset }: FormProps) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(); };
  return <form onSubmit={submit} className="grid gap-4">
    {children}
    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
      <button className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50" disabled={!isDirty || isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
      {isDirty && !isSaving && <button type="button" onClick={onReset} className="text-sm font-semibold text-gray-600 hover:underline">Undo changes</button>}
      <SaveMessage status={status} isDirty={isDirty} />
    </div>
  </form>;
}

export function SaveMessage({ status, isDirty = false }: { status: SaveStatus; isDirty?: boolean }) {
  if (status) return <p role={status.tone === "error" ? "alert" : "status"} className={`text-sm font-semibold ${status.tone === "error" ? "text-red-700" : "text-emerald-700"}`}>{status.text}</p>;
  return isDirty ? <p className="text-sm text-amber-700">Unsaved changes</p> : null;
}
