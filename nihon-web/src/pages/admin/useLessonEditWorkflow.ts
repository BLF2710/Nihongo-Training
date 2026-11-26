import { useCallback, useEffect, useState } from 'react';
import { discardLessonDraft, fetchLessonEdit, publishLessonDraft, revertLesson, saveLessonDraft } from '../../api/lessonEdits';
import type { LessonEdit } from '../../api/lessonEdits';
import { adminError } from './adminData';

// The draft → publish → restore workflow every lesson editor shares, whatever the course. `Content` is the editable
// part of a lesson (EditableLesson for Japanese, EditableEnglishLesson for English).

/** The list of problems the server found, when it rejected the content. */
function problemsOf(failure: unknown): string[] {
  const errors = (failure as { response?: { data?: { errors?: unknown } } }).response?.data?.errors;
  return Array.isArray(errors) ? errors.filter((item): item is string => typeof item === 'string') : [];
}

export type LessonEditWorkflow<Content> = ReturnType<typeof useLessonEditWorkflow<Content>>;

/** Loads a lesson's original and its saved edit, and keeps the form being edited. `loadOriginal` must be stable
 *  (useCallback), or the lesson is loaded again on every render. */
export function useLessonEditWorkflow<Content>(lessonId: string, loadOriginal: (() => Promise<Content>) | null) {
  const [original, setOriginal] = useState<Content | null>(null);
  const [edit, setEdit] = useState<LessonEdit<Content> | null>(null);
  const [form, setForm] = useState<Content | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [invalidJson, setInvalidJson] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  // Remounts the JSON fields when the form is replaced (load, discard), so they show the new content.
  const [formVersion, setFormVersion] = useState(0);

  const showForm = useCallback((content: Content) => { setForm(structuredClone(content)); setIsDirty(false); setInvalidJson({}); setFormVersion(value => value + 1); }, []);
  useEffect(() => {
    if (!loadOriginal) return;
    const controller = new AbortController();
    Promise.all([loadOriginal(), fetchLessonEdit<Content>(lessonId, controller.signal)])
      .then(([base, saved]) => { setOriginal(base); setEdit(saved); showForm(saved.draft ?? saved.published ?? base); })
      .catch(failure => { if (!controller.signal.aborted) setError(adminError(failure)); });
    return () => controller.abort();
  }, [lessonId, loadOriginal, showForm]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const change = <K extends keyof Content>(field: K, value: Content[K]) => { setForm(current => current && { ...current, [field]: value }); setIsDirty(true); };
  const setJsonValidity = (field: string, isValid: boolean) => setInvalidJson(current => ({ ...current, [field]: !isValid }));
  const run = async (work: () => Promise<LessonEdit<Content>>, done: string, afterwards?: (saved: LessonEdit<Content>) => void) => {
    setBusy(true); setMessage(''); setError(''); setProblems([]);
    try { const saved = await work(); setEdit(saved); afterwards?.(saved); setMessage(done); return true; }
    catch (failure) { setProblems(problemsOf(failure)); setError(adminError(failure)); return false; }
    finally { setBusy(false); }
  };
  const save = () => form ? run(() => saveLessonDraft(lessonId, form), 'Draft saved. Learners don\'t see it until you publish.', () => setIsDirty(false)) : Promise.resolve(false);
  const publish = async () => {
    if (!window.confirm('Publish this lesson? Learners see it the next time they open the site.')) return;
    if ((isDirty || !edit?.draft) && !await save()) return;
    await run(() => publishLessonDraft<Content>(lessonId), 'Published. Learners see the new version the next time they open the site.');
  };
  const discard = () => run(() => discardLessonDraft<Content>(lessonId), 'Draft discarded.', saved => { const base = saved.published ?? original; if (base) showForm(base); });
  const restore = async () => {
    if (!window.confirm('Remove the published edit? Learners see the lesson as it is in the course files again.')) return;
    await run(() => revertLesson<Content>(lessonId), 'The original lesson is back for learners.', saved => { if (!saved.draft && original) showForm(original); });
  };
  const startFromOriginal = () => { if (original) { showForm(original); setIsDirty(true); } };

  return {
    original, edit, form, isDirty, busy, message, error, problems, formVersion,
    hasJsonProblem: Object.values(invalidJson).some(Boolean),
    change, setJsonValidity, save, publish, discard, restore, startFromOriginal,
  };
}
