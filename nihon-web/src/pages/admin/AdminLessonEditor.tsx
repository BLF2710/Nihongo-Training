import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { EditableLesson } from '../../api/lessonEdits';
import { N5_LESSONS } from '../../data/japaneseN5Lessons';
import type { LessonSummary } from '../../data/japaneseN5Lessons';
import { loadOriginalLessonBody } from '../../data/lessonBodies';
import { originalLessonSummary } from '../../data/lessonEdits';
import { button, card, input } from './adminData';
import LessonPreview from './LessonPreview';
import { JsonField, QuestionList, Section, TextList, TupleTable } from './lessonEditorFields';
import { LessonEditPanel } from './LessonEditPanel';
import { useLessonEditWorkflow } from './useLessonEditWorkflow';

async function loadOriginal(summary: LessonSummary): Promise<EditableLesson> {
  const original = originalLessonSummary(summary);
  const body = await loadOriginalLessonBody(summary);
  return {
    title: original.title ?? summary.title, titleJp: original.titleJp, vocabulary: original.vocabulary ?? [], examples: original.examples ?? [],
    dialogue: original.dialogue ?? [], grammar: original.grammar, reading: original.reading, ...body,
  };
}

/** Edits one Japanese lesson: a draft only administrators see, published to learners when ready, or restored to the original. */
export default function AdminLessonEditor({ lessonId }: { lessonId: string }) {
  // Back to the list with the same level filter.
  const level = useSearchParams()[0].get('level');
  const backToList = level ? `/admin/content/lessons?level=${encodeURIComponent(level)}` : '/admin/content/lessons';
  const summary = N5_LESSONS.find(lesson => lesson.id === lessonId);
  const load = useCallback(() => summary ? loadOriginal(summary) : Promise.reject(new Error('Lesson not found.')), [summary]);
  const workflow = useLessonEditWorkflow<EditableLesson>(lessonId, summary ? load : null);
  const [showPreview, setShowPreview] = useState(false);
  const { form, original, error, change, setJsonValidity, formVersion } = workflow;

  if (!summary) return <section className={card}><p role="alert">Lesson not found.</p><Link to={backToList} className={button + ' mt-3'}>All lessons</Link></section>;
  if (error && !form) return <section className={card}><p role="alert" className="text-red-700">{error}</p></section>;
  if (!form || !original) return <section className={card}><p role="status">Loading lesson…</p></section>;

  return <div className="grid gap-5">
    <LessonEditPanel workflow={workflow} heading={`${summary.level ?? 'N5'} Unit ${summary.unitNumber ?? 1} · ${original.title}`} backTo={backToList}
      showPreview={showPreview} onTogglePreview={() => setShowPreview(!showPreview)}
      note={<>Furigana: write <code>{'<ruby>漢字<rt>かんじ</rt></ruby>'}</code>. New kanji and new lessons still come from the course files and the importer.</>} />
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
          <JsonField label="Grammar points" value={form.grammar} onChange={value => change('grammar', value)} onValidity={isValid => setJsonValidity('grammar', isValid)} />
          <JsonField label="Reading passage" value={form.reading} onChange={value => change('reading', value)} onValidity={isValid => setJsonValidity('reading', isValid)} />
        </div>
      </Section>
    </section>
  </div>;
}
