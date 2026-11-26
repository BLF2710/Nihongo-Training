import { PARTS_OF_SPEECH } from '../../../../shared/course/english/schema.ts';
import type { Bilingual, DialogueLine, EnglishWord } from '../../../../shared/course/english/schema.ts';
import { input } from './adminData';
import { RowControls } from './lessonEditorFields';
import { replace, small } from './lessonEditorLists';

// Fields for the English course's lessons, where every word, example and line is written in English and Vietnamese.

const field = input + ' mt-0 min-w-[8rem] flex-1';
const BLANK_BILINGUAL: Bilingual = { english: '', vietnamese: '' };
const BLANK_WORD: EnglishWord = { word: '', ipa: '', partOfSpeech: PARTS_OF_SPEECH[0], vietnamese: '', definition: '', example: BLANK_BILINGUAL };
const isPartOfSpeech = (value: string): value is EnglishWord['partOfSpeech'] => PARTS_OF_SPEECH.some(part => part === value);

type ListProps<T> = { label: string; items: readonly T[]; onChange: (items: T[]) => void };

/** One text box; `label` is read out and shown as its placeholder. */
function TextBox({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <input className={field} aria-label={label} placeholder={label.split(': ').at(-1)} value={value} onChange={event => onChange(event.target.value)} />;
}

/** The words of a lesson: the word, its IPA and part of speech, its Vietnamese meaning, a definition and an example. */
export function EnglishWordList({ label, items, onChange }: ListProps<EnglishWord>) {
  const update = (index: number, change: Partial<EnglishWord>) => onChange(replace(items, index, { ...items[index], ...change }));
  return <div className="grid gap-2">
    {items.map((word, index) => {
      const name = `${label} ${index + 1}`;
      return <div key={index} role="group" aria-label={name} className="grid gap-2 rounded-xl bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <TextBox label={`${name}: Word`} value={word.word} onChange={value => update(index, { word: value })} />
          <TextBox label={`${name}: IPA`} value={word.ipa} onChange={value => update(index, { ipa: value })} />
          <select className={field} aria-label={`${name}: Part of speech`} value={word.partOfSpeech} onChange={event => { if (isPartOfSpeech(event.target.value)) update(index, { partOfSpeech: event.target.value }); }}>
            {PARTS_OF_SPEECH.map(part => <option key={part} value={part}>{part}</option>)}
          </select>
          <TextBox label={`${name}: Vietnamese`} value={word.vietnamese} onChange={value => update(index, { vietnamese: value })} />
          <RowControls items={items} index={index} onChange={onChange} label={name} />
        </div>
        <TextBox label={`${name}: Definition`} value={word.definition} onChange={value => update(index, { definition: value })} />
        <div className="flex flex-wrap gap-2">
          <TextBox label={`${name}: Example in English`} value={word.example.english} onChange={value => update(index, { example: { ...word.example, english: value } })} />
          <TextBox label={`${name}: Example in Vietnamese`} value={word.example.vietnamese} onChange={value => update(index, { example: { ...word.example, vietnamese: value } })} />
        </div>
      </div>;
    })}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...items, BLANK_WORD])}>+ Add {label.toLowerCase()}</button>
  </div>;
}

/** Sentences in English with their Vietnamese. */
export function BilingualList({ label, items, onChange }: ListProps<Bilingual>) {
  return <div className="grid gap-2">
    {items.map((item, index) => <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-2">
      <TextBox label={`${label} ${index + 1}: English`} value={item.english} onChange={value => onChange(replace(items, index, { ...item, english: value }))} />
      <TextBox label={`${label} ${index + 1}: Vietnamese`} value={item.vietnamese} onChange={value => onChange(replace(items, index, { ...item, vietnamese: value }))} />
      <RowControls items={items} index={index} onChange={onChange} label={`${label} ${index + 1}`} />
    </div>)}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...items, BLANK_BILINGUAL])}>+ Add {label.toLowerCase()}</button>
  </div>;
}

/** A conversation, one line at a time: who says it, in English and in Vietnamese. */
export function DialogueList({ label, items, onChange }: ListProps<DialogueLine>) {
  return <div className="grid gap-2">
    {items.map((line, index) => <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-2">
      <TextBox label={`${label} ${index + 1}: Speaker`} value={line.speaker} onChange={value => onChange(replace(items, index, { ...line, speaker: value }))} />
      <TextBox label={`${label} ${index + 1}: English`} value={line.english} onChange={value => onChange(replace(items, index, { ...line, english: value }))} />
      <TextBox label={`${label} ${index + 1}: Vietnamese`} value={line.vietnamese} onChange={value => onChange(replace(items, index, { ...line, vietnamese: value }))} />
      <RowControls items={items} index={index} onChange={onChange} label={`${label} ${index + 1}`} />
    </div>)}
    <button type="button" className={small + ' justify-self-start'} onClick={() => onChange([...items, { speaker: '', ...BLANK_BILINGUAL }])}>+ Add {label.toLowerCase()}</button>
  </div>;
}
