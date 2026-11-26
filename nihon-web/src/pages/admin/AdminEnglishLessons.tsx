import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ENGLISH_LEVELS } from '../../../../shared/course/english/schema.ts';
import type { EnglishLesson } from '../../../../shared/course/english/schema.ts';
import type { LessonEditStatus } from '../../api/lessonEdits';
import { ENGLISH_COURSE_FILE_LESSONS, ENGLISH_UNITS } from '../../data/englishCourse';
import { editableEnglishLesson } from '../../data/englishLessonEdits';
import type { EditableEnglishLesson } from '../../data/englishLessonEdits';
import { button, card, input, useAdminData } from './adminData';
import { BilingualList, DialogueList, EnglishWordList } from './englishLessonFields';
import EnglishLessonPreview from './EnglishLessonPreview';
import { LessonCourseSwitch } from './LessonCourseSwitch';
import { JsonField, QuestionList, Section, TextList } from './lessonEditorFields';
import { LessonEditPanel } from './LessonEditPanel';
import { useLessonEditWorkflow } from './useLessonEditWorkflow';

// The English course's lessons in the lesson editor. A chunk of its own, since it carries the English course.

const LIST_PATH = '/admin/content/lessons?course=english';
const unitTitle = (lesson: EnglishLesson) => ENGLISH_UNITS.find(unit => unit.id === lesson.unitId)?.title ?? '';
const unitKey = (lesson: EnglishLesson) => `${lesson.level} Unit ${lesson.unitNumber} · ${unitTitle(lesson)}`;

/** Every English lesson with its edit state; choosing one opens the editor. */
export default function AdminEnglishLessons() {
  const lessonId = useSearchParams()[0].get('lesson');
  return lessonId ? <EnglishLessonEditor key={lessonId} lessonId={lessonId} /> : <EnglishLessonList />;
}

function EnglishLessonList() {
  const edits = useAdminData<{ edits: LessonEditStatus[] }>('/admin/lessons/edits');
  const [params, setParams] = useSearchParams();
  const level = ENGLISH_LEVELS.find(item => item === params.get('level')) ?? 'all';
  const [search, setSearch] = useState('');
  const status = useMemo(() => new Map((edits.data?.edits ?? []).map(edit => [edit.lessonId, edit])), [edits.data]);
  const units = useMemo(() => {
    const words = search.trim().toLowerCase();
    const matches = ENGLISH_COURSE_FILE_LESSONS.filter(lesson => level === 'all' || lesson.level === level)
      .filter(lesson => !words || `${lesson.id} ${lesson.title} ${lesson.titleVi} ${unitKey(lesson)}`.toLowerCase().includes(words));
    const byUnit = new Map<string, EnglishLesson[]>();
    for (const lesson of matches) byUnit.set(unitKey(lesson), [...(byUnit.get(unitKey(lesson)) ?? []), lesson]);
    return [...byUnit];
  }, [search, level]);
  const chooseLevel = (value: string) => setParams(value === 'all' ? { course: 'english' } : { course: 'english', level: value });
  return <section className={card} aria-labelledby="english-lessons-heading">
    <LessonCourseSwitch />
    <h2 id="english-lessons-heading" className="mt-3 text-xl font-black">English lesson editor</h2>
    <p className="text-sm text-gray-600">Edit an English lesson's words, grammar, examples, conversation and questions. The same rules as the course files apply: IPA between slashes, every sentence in English and Vietnamese, three or four options a question. Changes are saved as a draft and reach learners when you publish them.</p>
    <div className="mt-4 flex flex-wrap items-end gap-4">
      <label className="block min-w-48 max-w-sm flex-1 text-sm font-semibold">Find a lesson<input className={input} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Title, unit or id" /></label>
      <div role="group" aria-label="Level" className="flex rounded-xl bg-gray-100 p-1">{['all', ...ENGLISH_LEVELS].map(value =>
        <button key={value} type="button" aria-pressed={level === value} onClick={() => chooseLevel(value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${level === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{value === 'all' ? 'All' : value}</button>)}
      </div>
    </div>
    {edits.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{edits.error}</p>}
    <div className="mt-4 grid gap-4">{units.map(([unit, lessons]) => <section key={unit} aria-label={unit}>
      <h3 className="font-black">{unit}</h3>
      <ul className="mt-1 divide-y divide-gray-100 rounded-xl border border-gray-200">{lessons.map(lesson => {
        const edit = status.get(lesson.id);
        return <li key={lesson.id}><Link to={`${LIST_PATH}${level === 'all' ? '' : `&level=${level}`}&lesson=${encodeURIComponent(lesson.id)}`} className="flex flex-wrap items-center gap-2 px-3 py-2 hover:bg-gray-50">
          <span className="min-w-0 flex-1 font-semibold">{lesson.title} <span className="font-normal text-gray-500">· {lesson.titleVi}</span></span>
          {edit?.isPublished && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Edited</span>}
          {edit?.hasDraft && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Draft</span>}
        </Link></li>;
      })}</ul>
    </section>)}</div>
    {units.length === 0 && <p className="mt-4 text-gray-600">No lesson matches.</p>}
  </section>;
}

/** Edits one English lesson: a draft only administrators see, published to learners when ready, or restored. */
function EnglishLessonEditor({ lessonId }: { lessonId: string }) {
  const level = useSearchParams()[0].get('level');
  const backToList = level ? `${LIST_PATH}&level=${encodeURIComponent(level)}` : LIST_PATH;
  const lesson = ENGLISH_COURSE_FILE_LESSONS.find(item => item.id === lessonId);
  const load = useCallback(() => lesson ? Promise.resolve(editableEnglishLesson(lesson)) : Promise.reject(new Error('Lesson not found.')), [lesson]);
  const workflow = useLessonEditWorkflow<EditableEnglishLesson>(lessonId, lesson ? load : null);
  const [showPreview, setShowPreview] = useState(false);
  const { form, original, error, change, setJsonValidity, formVersion } = workflow;

  if (!lesson) return <section className={card}><p role="alert">Lesson not found.</p><Link to={backToList} className={button + ' mt-3'}>All lessons</Link></section>;
  if (error && !form) return <section className={card}><p role="alert" className="text-red-700">{error}</p></section>;
  if (!form || !original) return <section className={card}><p role="status">Loading lesson…</p></section>;

  return <div className="grid gap-5">
    <LessonEditPanel workflow={workflow} heading={`${lesson.level} Unit ${lesson.unitNumber} · ${original.title}`} backTo={backToList}
      showPreview={showPreview} onTogglePreview={() => setShowPreview(!showPreview)}
      note={<>British spelling throughout. New words for the flashcard deck and new lessons still come from docs/curriculum/english and the importer.</>} />
    {showPreview && <EnglishLessonPreview lesson={form} />}
    <section className={card + ' grid gap-4'} aria-label="Lesson content">
      <Section title="Title">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Title<input className={input} value={form.title} onChange={event => change('title', event.target.value)} /></label>
          <label className="text-sm font-semibold">Vietnamese title<input className={input} value={form.titleVi} onChange={event => change('titleVi', event.target.value)} /></label>
        </div>
      </Section>
      <Section title="Objectives"><TextList label="Objective" items={form.objectives} onChange={items => change('objectives', items)} /></Section>
      <Section title="Vocabulary"><EnglishWordList label="Word" items={form.vocabulary} onChange={items => change('vocabulary', items)} /></Section>
      <Section title="Examples"><BilingualList label="Example" items={form.examples} onChange={items => change('examples', items)} /></Section>
      <Section title="Conversation"><DialogueList label="Line" items={form.dialogue} onChange={items => change('dialogue', items)} /></Section>
      <Section title="Practice"><QuestionList label="Practice" questions={form.practice} onChange={questions => change('practice', questions)} /></Section>
      <Section title="Challenge"><QuestionList label="Challenge" questions={form.challenge} onChange={questions => change('challenge', questions)} /></Section>
      <Section title="Grammar (advanced)">
        <div key={formVersion}>
          <JsonField label="Grammar points" value={form.grammar} onChange={value => change('grammar', value ?? [])} onValidity={isValid => setJsonValidity('grammar', isValid)} />
        </div>
      </Section>
    </section>
  </div>;
}
