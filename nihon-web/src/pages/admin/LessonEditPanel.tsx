import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { button, card } from './adminData';
import type { LessonEditWorkflow } from './useLessonEditWorkflow';

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

type PanelProps<Content> = {
  workflow: LessonEditWorkflow<Content>; heading: string; backTo: string; showPreview: boolean; onTogglePreview: () => void; note: ReactNode;
};

/** The lesson's heading, its edit state, and the save / publish / discard / restore buttons. */
export function LessonEditPanel<Content>({ workflow, heading, backTo, showPreview, onTogglePreview, note }: PanelProps<Content>) {
  const { edit, isDirty, busy, hasJsonProblem, message, error, problems } = workflow;
  if (!edit) return null;
  return <section className={card}>
    <Link to={backTo} className="text-sm font-semibold text-emerald-700 hover:underline">← All lessons</Link>
    <h2 className="mt-1 text-xl font-black">{heading}</h2>
    <p className="text-sm text-gray-600" role="status">
      {edit.published ? `Published by @${edit.publishedBy ?? 'unknown'} on ${when(edit.publishedAt)}` : 'Learners see the original from the course files'}
      {edit.draft && ` · Draft saved by @${edit.draftBy ?? 'unknown'} on ${when(edit.draftUpdatedAt)}`}
      {isDirty && ' · Unsaved changes'}
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button className={button} disabled={busy || !isDirty || hasJsonProblem} onClick={() => void workflow.save()}>Save draft</button>
      <button className={button + ' border-emerald-600 text-emerald-800'} disabled={busy || hasJsonProblem || (!isDirty && !edit.draft)} onClick={() => void workflow.publish()}>Publish</button>
      {edit.draft && <button className={button} disabled={busy} onClick={() => void workflow.discard()}>Discard draft</button>}
      {edit.published && <button className={button + ' text-red-700'} disabled={busy} onClick={() => void workflow.restore()}>Restore original</button>}
      <button className={button} disabled={busy} onClick={workflow.startFromOriginal}>Start from the original</button>
      <button className={button} aria-pressed={showPreview} onClick={onTogglePreview}>{showPreview ? 'Hide preview' : 'Preview'}</button>
    </div>
    {message && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {error && <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"><p className="font-bold">{error}</p>{problems.length > 0 && <ul className="mt-1 list-disc pl-5">{problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}</div>}
    <p className="mt-3 text-xs text-gray-500">{note}</p>
  </section>;
}
