import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchLessonEditExport } from '../../api/lessonEdits';
import type { LessonEditStatus } from '../../api/lessonEdits';
import { N5_LESSONS } from '../../data/japaneseN5Lessons';
import { originalLessonSummary } from '../../data/lessonEdits';
import { toPlain } from '../../lib/furigana';
import AdminLessonEditor from './AdminLessonEditor';
import { adminError, button, card, input, useAdminData } from './adminData';

const unitKey = (lesson: (typeof N5_LESSONS)[number]) => `${lesson.level ?? 'N5'} Unit ${lesson.unitNumber ?? 1}`;

/** Every course lesson with its edit state; choosing one opens the editor. */
export default function AdminLessons() {
  const [params] = useSearchParams();
  const lessonId = params.get('lesson');
  return lessonId ? <AdminLessonEditor key={lessonId} lessonId={lessonId} /> : <LessonList />;
}

/** Downloads every published edit as a file for scripts/course-import/apply-lesson-edits.mjs. */
async function downloadExport() {
  const data = await fetchLessonEditExport();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  link.download = `lesson-edits-${data.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function LessonList() {
  const edits = useAdminData<{ edits: LessonEditStatus[] }>('/admin/lessons/edits');
  const [search, setSearch] = useState('');
  const [exportError, setExportError] = useState('');
  const publishedCount = edits.data?.edits.filter(edit => edit.isPublished).length ?? 0;
  const status = useMemo(() => new Map((edits.data?.edits ?? []).map(edit => [edit.lessonId, edit])), [edits.data]);
  const units = useMemo(() => {
    const words = search.trim().toLowerCase();
    const matches = N5_LESSONS.filter(lesson => !words || `${lesson.id} ${toPlain(originalLessonSummary(lesson).title ?? lesson.title)} ${unitKey(lesson)}`.toLowerCase().includes(words));
    const byUnit = new Map<string, typeof matches>();
    for (const lesson of matches) byUnit.set(unitKey(lesson), [...(byUnit.get(unitKey(lesson)) ?? []), lesson]);
    return [...byUnit];
  }, [search]);
  return <section className={card} aria-labelledby="lessons-heading">
    <h2 id="lessons-heading" className="text-xl font-black">Lesson editor</h2>
    <p className="text-sm text-gray-600">Edit a lesson's text, vocabulary, conversation and questions. Changes are saved as a draft and reach learners when you publish them; Restore original brings back the course-file version.</p>
    {publishedCount > 0 && <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
      <button className={button} onClick={() => { setExportError(''); downloadExport().catch(failure => setExportError(adminError(failure))); }}>Export published edits ({publishedCount})</button>
      <p className="mt-2 text-gray-600">To make edits part of the course files: run <code>node scripts/course-import/apply-lesson-edits.mjs &lt;file&gt;</code>, deploy, then use Restore original on those lessons.</p>
      {exportError && <p role="alert" className="mt-2 text-red-700">{exportError}</p>}
    </div>}
    <label className="mt-4 block max-w-sm text-sm font-semibold">Find a lesson<input className={input} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Title, unit or id" /></label>
    {edits.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{edits.error}</p>}
    <div className="mt-4 grid gap-4">{units.map(([unit, lessons]) => <section key={unit} aria-label={unit}>
      <h3 className="font-black">{unit}</h3>
      <ul className="mt-1 divide-y divide-gray-100 rounded-xl border border-gray-200">{lessons.map(lesson => {
        const edit = status.get(lesson.id);
        return <li key={lesson.id}><Link to={`/admin/lessons?lesson=${encodeURIComponent(lesson.id)}`} className="flex flex-wrap items-center gap-2 px-3 py-2 hover:bg-gray-50">
          <span className="min-w-0 flex-1 font-semibold">{toPlain(lesson.title)}</span>
          {edit?.isPublished && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Edited</span>}
          {edit?.hasDraft && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Draft</span>}
        </Link></li>;
      })}</ul>
    </section>)}</div>
    {units.length === 0 && <p className="mt-4 text-gray-600">No lesson matches.</p>}
  </section>;
}
