import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Question } from '../../data/japaneseN5Lessons';
import { button, input } from './adminData';

const small = button.replace('px-4 py-2', 'px-2 py-1');

function move<T>(items: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return [...items];
  const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
  return next;
}
const replace = <T,>(items: readonly T[], index: number, item: T) => items.map((current, at) => at === index ? item : current);

/** Move up, move down and remove for one row of a list. */
function RowControls<T>({ items, index, onChange, label }: { items: readonly T[]; index: number; onChange: (items: T[]) => void; label: string }) {
  return <div className="flex shrink-0 gap-1">
    <button type="button" className={small} disabled={index === 0} onClick={() => onChange(move(items, index, index - 1))} aria-label={`Move ${label} up`}>↑</button>
    <button type="button" className={small} disabled={index === items.length - 1} onClick={() => onChange(move(items, index, index + 1))} aria-label={`Move ${label} down`}>↓</button>
    <button type="button" className={small + ' text-red-700'} onClick={() => onChange(items.filter((_, at) => at !== index))} aria-label={`Remove ${label}`}>✕</button>
  </div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset className="rounded-2xl border border-gray-200 p-4"><legend className="px-1 font-black">{title}</legend>{children}</fieldset>;
}

/** A list of single lines (objectives, concept examples). */
export function TextList({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return <div className="grid gap-2">
    {items.map((item, index) => <div key={index} className="flex items-center gap-2">
      <input className={input + ' mt-0'} aria-label={`${label} ${index + 1}`} value={item} onChange={event => onChange(replace(items, index, event.target.value))} />
      <RowControls items={items} index={index} onChange={onChange} label={`${label} ${index + 1}`} />
    </div>)}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...items, ''])}>+ Add {label.toLowerCase()}</button>
  </div>;
}

/** Rows with a fixed number of columns (vocabulary, examples, dialogue). */
export function TupleTable<T extends string[]>({ label, columns, rows, onChange }: { label: string; columns: string[]; rows: T[]; onChange: (rows: T[]) => void }) {
  const blank = () => columns.map(() => '') as T;
  return <div className="grid gap-2">
    {rows.map((row, index) => <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-2">
      {columns.map((column, at) => <input key={column} className={input + ' mt-0 min-w-[8rem] flex-1'} aria-label={`${label} ${index + 1}: ${column}`} placeholder={column}
        value={row[at] ?? ''} onChange={event => onChange(replace(rows, index, replace(row, at, event.target.value) as T))} />)}
      <RowControls items={rows} index={index} onChange={onChange} label={`${label} ${index + 1}`} />
    </div>)}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...rows, blank()])}>+ Add {label.toLowerCase()}</button>
  </div>;
}

/** Multiple-choice questions: prompt, options, the correct option and an explanation. */
export function QuestionList({ label, questions, onChange }: { label: string; questions: Question[]; onChange: (questions: Question[]) => void }) {
  const update = (index: number, change: Partial<Question>) => onChange(replace(questions, index, { ...questions[index], ...change }));
  return <div className="grid gap-3">
    {questions.map((question, index) => {
      const name = `${label} ${index + 1}`;
      return <div key={index} className="grid gap-2 rounded-xl bg-gray-50 p-3" role="group" aria-label={name}>
        <div className="flex items-center justify-between gap-2"><p className="font-bold">{name}</p><RowControls items={questions} index={index} onChange={onChange} label={name} /></div>
        <label className="text-sm font-semibold">Prompt<textarea className={input} rows={2} value={question.prompt} onChange={event => update(index, { prompt: event.target.value })} /></label>
        <p className="text-sm font-semibold">Options (choose the correct one)</p>
        {question.options.map((option, at) => <div key={at} className="flex items-center gap-2">
          <input type="radio" name={`${name}-correct`} aria-label={`${name}: option ${at + 1} is correct`} checked={option !== '' && option === question.correct} onChange={() => update(index, { correct: option })} />
          <input className={input + ' mt-0'} aria-label={`${name}: option ${at + 1}`} value={option}
            onChange={event => update(index, { options: replace(question.options, at, event.target.value), ...(question.correct === option ? { correct: event.target.value } : {}) })} />
          <button type="button" className={small + ' text-red-700'} onClick={() => update(index, { options: question.options.filter((_, other) => other !== at) })} aria-label={`Remove ${name} option ${at + 1}`}>✕</button>
        </div>)}
        <button type="button" className={small + ' justify-self-start'} onClick={() => update(index, { options: [...question.options, ''] })}>+ Add option</button>
        <label className="text-sm font-semibold">Explanation<textarea className={input} rows={2} value={question.explanation} onChange={event => update(index, { explanation: event.target.value })} /></label>
      </div>;
    })}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...questions, { prompt: '', options: ['', ''], correct: '', explanation: '' }])}>+ Add {label.toLowerCase()} question</button>
  </div>;
}

/** Nested content (grammar points, reading passage) edited as JSON; checked as it is typed. */
export function JsonField<T>({ label, value, onChange, onValidity }: { label: string; value: T | undefined; onChange: (value: T | undefined) => void; onValidity: (isValid: boolean) => void }) {
  const [text, setText] = useState(() => value === undefined ? '' : JSON.stringify(value, null, 2));
  const [problem, setProblem] = useState('');
  const edit = (next: string) => {
    setText(next);
    if (!next.trim()) { setProblem(''); onValidity(true); onChange(undefined); return; }
    try { onChange(JSON.parse(next) as T); setProblem(''); onValidity(true); }
    catch (failure) { setProblem(failure instanceof Error ? failure.message : 'Not valid JSON.'); onValidity(false); }
  };
  return <label className="grid text-sm font-semibold">{label}
    <textarea className={input + ' font-mono text-xs'} rows={8} value={text} spellCheck={false} onChange={event => edit(event.target.value)} aria-invalid={problem !== ''} />
    {problem && <span role="alert" className="mt-1 font-normal text-red-700">Not valid JSON: {problem}</span>}
  </label>;
}
