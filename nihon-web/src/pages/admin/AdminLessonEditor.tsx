import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discardLessonDraft, fetchLessonEdit, publishLessonDraft, revertLesson, saveLessonDraft } from '../../api/lessonEdits';
import type { EditableLesson, LessonEdit } from '../../api/lessonEdits';
import { N5_LESSONS } from '../../data/japaneseN5Lessons';
import type { LessonSummary } from '../../data/japaneseN5Lessons';
import { loadOriginalLessonBody } from '../../data/lessonBodies';
import { originalLessonSummary } from '../../data/lessonEdits';
import { adminError, button, card, input } from './adminData';
import LessonPreview from './LessonPreview';
import { JsonField, QuestionList, Section, TextList, TupleTable } from './lessonEditorFields';

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

async function loadOriginal(summary: LessonSummary): Promise<EditableLesson> {
  const original = originalLessonSummary(summary);
  const body = await loadOriginalLessonBody(summary);
  return {
    title: original.title ?? summary.title, titleJp: original.titleJp, vocabulary: original.vocabulary ?? [], examples: original.examples ?? [],
    dialogue: original.dialogue ?? [], grammar: original.grammar, reading: original.reading, ...body,
  };
}

/** The list of problems the server found, when it rejected the content. */
function problemsOf(failure: unknown): string[] {
  const errors = (failure as { response?: { data?: { errors?: unknown } } }).response?.data?.errors;
  return Array.isArray(errors) ? errors.filter((item): item is string => typeof item === 'string') : [];
}

/** Edits one lesson: a draft only administrators see, published to learners when ready, or restored to the original. */
export default function AdminLessonEditor({ lessonId }: { lessonId: string }) {
  const summary = N5_LESSONS.find(lesson => lesson.id === lessonId);
  const [original, setOriginal] = useState<EditableLesson | null>(null);
  const [edit, setEdit] = useState<LessonEdit | null>(null);
  const [form, setForm] = useState<EditableLesson | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [invalidJson, setInvalidJson] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  // Remounts the JSON fields when the form is replaced (load, discard), so they show the new content.
  const [formVersion, setFormVersion] = useState(0);

  const showForm = useCallback((content: EditableLesson) => { setForm(structuredClone(content)); setIsDirty(false); setInvalidJson({}); setFormVersion(value => value + 1); }, []);
  useEffect(() => {
    if (!summary) return;
    const controller = new AbortController();
    Promise.all([loadOriginal(summary), fetchLessonEdit(lessonId, controller.signal)])
      .then(([base, saved]) => { setOriginal(base); setEdit(saved); showForm(saved.draft ?? saved.published ?? base); })
      .catch(failure => { if (!controller.signal.aborted) setError(adminError(failure)); });
    return () => controller.abort();
  }, [lessonId, summary, showForm]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  if (!summary) return <section className={card}><p role="alert">Lesson not found.</p><Link to="/admin/lessons" className={button + ' mt-3'}>All lessons</Link></section>;
  if (error && !form) return <section className={card}><p role="alert" className="text-red-700">{error}</p></section>;
  if (!form || !edit || !original) return <section className={card}><p role="status">Loading lesson…</p></section>;

  const change = <K extends keyof EditableLesson>(field: K, value: EditableLesson[K]) => { setForm({ ...form, [field]: value }); setIsDirty(true); };
  const run = async (work: () => Promise<LessonEdit>, done: string, afterwards?: (saved: LessonEdit) => void) => {
    setBusy(true); setMessage(''); setError(''); setProblems([]);
    try { const saved = await work(); setEdit(saved); afterwards?.(saved); setMessage(done); return true; }
    catch (failure) { setProblems(problemsOf(failure)); setError(adminError(failure)); return false; }
    finally { setBusy(false); }
  };
  const save = () => run(() => saveLessonDraft(lessonId, form), 'Draft saved. Learners don\'t see it until you publish.', () => setIsDirty(false));
  const publish = async () => {
    if (!window.confirm('Publish this lesson? Learners see it the next time they open the site.')) return;
    if ((isDirty || !edit.draft) && !await save()) return;
    await run(() => publishLessonDraft(lessonId), 'Published. Learners see the new version the next time they open the site.');
  };
  const discard = () => run(() => discardLessonDraft(lessonId), 'Draft discarded.', saved => showForm(saved.published ?? original));
  const restore = async () => {
    if (!window.confirm('Remove the published edit? Learners see the lesson as it is in the course files again.')) return;
    await run(() => revertLesson(lessonId), 'The original lesson is back for learners.', saved => { if (!saved.draft) showForm(original); });
  };
  const hasJsonProblem = Object.values(invalidJson).some(Boolean);

  return <div className="grid gap-5">
    <section className={card}>
      <Link to="/admin/lessons" className="text-sm font-semibold text-emerald-700 hover:underline">← All lessons</Link>
      <h2 className="mt-1 text-xl font-black">{summary.level ?? 'N5'} Unit {summary.unitNumber ?? 1} · {original.title}</h2>
      <p className="text-sm text-gray-600" role="status">
        {edit.published ? `Published by @${edit.publishedBy ?? 'unknown'} on ${when(edit.publishedAt)}` : 'Learners see the original from the course files'}
        {edit.draft && ` · Draft saved by @${edit.draftBy ?? 'unknown'} on ${when(edit.draftUpdatedAt)}`}
        {isDirty && ' · Unsaved changes'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={button} disabled={busy || !isDirty || hasJsonProblem} onClick={() => void save()}>Save draft</button>
        <button className={button + ' border-emerald-600 text-emerald-800'} disabled={busy || hasJsonProblem || (!isDirty && !edit.draft)} onClick={() => void publish()}>Publish</button>
        {edit.draft && <button className={button} disabled={busy} onClick={() => void discard()}>Discard draft</button>}
        {edit.published && <button className={button + ' text-red-700'} disabled={busy} onClick={() => void restore()}>Restore original</button>}
        <button className={button} disabled={busy} onClick={() => { showForm(original); setIsDirty(true); }}>Start from the original</button>
        <button className={button} aria-pressed={showPreview} onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Hide preview' : 'Preview'}</button>
      </div>
      {message && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {error && <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"><p className="font-bold">{error}</p>{problems.length > 0 && <ul className="mt-1 list-disc pl-5">{problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}</div>}
      <p className="mt-3 text-xs text-gray-500">Furigana: write <code>{'<ruby>漢字<rt>かんじ</rt></ruby>'}</code>. New kanji and new lessons still come from the course files and the importer.</p>
    </section>
    {showPreview && <LessonPreview lesson={form} />}
    <section className={card + ' grid gap-4'} aria-label="Lesson content">
      <Section title="Title">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Title<input className={input} value={form.title} onChange={event => change('title', event.target.value)} /></label>
          <label className="text-sm font-semibold">Japanese title<input className={input} value={form.titleJp ?? ''} onChange={event => change('titleJp', event.target.value || undefined)} /></label>
        </div>
      </Section>
      <Section title="Objectives"><TextList label="Objective" items={form.objectives} onChange={items => change('objectives', items)} /></Section>
      <Section title="Vocabulary"><TupleTable label="Word" columns={['Word', 'Romaji', 'Meaning']} rows={form.vocabulary} onChange={rows => change('vocabulary', rows)} /></Section>
      <Section title="Concept">
        <div className="grid gap-3">
          <label className="text-sm font-semibold">Heading<input className={input} value={form.concept.title} onChange={event => change('concept', { ...form.concept, title: event.target.value })} /></label>
          <label className="text-sm font-semibold">Explanation<textarea className={input} rows={5} value={form.concept.text} onChange={event => change('concept', { ...form.concept, text: event.target.value })} /></label>
          <TextList label="Concept example" items={form.concept.examples} onChange={items => change('concept', { ...form.concept, examples: items })} />
        </div>
      </Section>
      <Section title="Examples"><TupleTable label="Example" columns={['Japanese', 'Translation']} rows={form.examples} onChange={rows => change('examples', rows)} /></Section>
      <Section title="Conversation"><TupleTable label="Exchange" columns={['Speaker A', 'Line A', 'Speaker B', 'Line B']} rows={form.dialogue} onChange={rows => change('dialogue', rows)} /></Section>
      <Section title="Practice"><QuestionList label="Practice" questions={form.practice} onChange={questions => change('practice', questions)} /></Section>
      <Section title="Challenge"><QuestionList label="Challenge" questions={form.challenge} onChange={questions => change('challenge', questions)} /></Section>
      <Section title="Grammar and reading (advanced)">
        <div className="grid gap-3" key={formVersion}>
          <JsonField label="Grammar points" value={form.grammar} onChange={value => change('grammar', value)} onValidity={isValid => setInvalidJson(current => ({ ...current, grammar: !isValid }))} />
          <JsonField label="Reading passage" value={form.reading} onChange={value => change('reading', value)} onValidity={isValid => setInvalidJson(current => ({ ...current, reading: !isValid }))} />
        </div>
      </Section>
    </section>
  </div>;
}
