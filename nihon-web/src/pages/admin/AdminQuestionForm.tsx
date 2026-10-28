import { unitLabel } from "../../lib/courseLevel";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { saveQuestion } from "../../api/admin";
import type { BankQuestion, BankQuestionType, MultipleChoiceContent, QuestionBank, QuestionContent, WordMatchContent, WordScrambleContent } from "../../api/admin";
import { adminError, button, card, input, useAdminData } from "./adminData";
import { QUESTION_KINDS, QUESTION_TYPES } from "./questionBank";

const MAX_OPTIONS = 6, MIN_OPTIONS = 2, MAX_PAIRS = 8, MIN_PAIRS = 2;

/** Add a question from a ready-made template, or edit an existing one when the URL carries ?id=. */
export default function AdminQuestionForm() {
  const [params] = useSearchParams();
  const editId = Number(params.get("id")) || null;
  const result = useAdminData<QuestionBank>("/admin/questions");
  if (result.error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{result.error} <button className={button} onClick={result.reload}>Retry</button></p>;
  if (!result.data) return <p role="status">Loading the question bank…</p>;
  const existing = editId ? result.data.questions.find(question => question.id === editId) : undefined;
  if (editId && !existing) return <><p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">That question no longer exists.</p><Link to="/admin/content/questions" className={button}>Back to question bank</Link></>;
  return <QuestionEditor key={editId ?? "new"} units={result.data.units} existing={existing} />;
}

function QuestionEditor({ units, existing }: { units: QuestionBank["units"]; existing?: BankQuestion }) {
  const navigate = useNavigate();
  const [unitId, setUnitId] = useState(existing?.unitId ?? units[0]?.id ?? "");
  const [type, setType] = useState<BankQuestionType>(existing?.type ?? "multiple_choice");
  const [content, setContent] = useState<QuestionContent>(existing?.content ?? QUESTION_KINDS.multiple_choice.blank);
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const chooseType = (next: BankQuestionType) => { setType(next); setContent(QUESTION_KINDS[next].blank); setError(""); };

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try { await saveQuestion({ unitId, type, content, enabled }, existing?.id); navigate("/admin/content/questions"); }
    catch (failure) { setError(adminError(failure)); setBusy(false); }
  }

  return <form onSubmit={save} className={`${card} max-w-3xl`}><h2 className="mb-5 text-xl font-black">Add or edit question</h2><fieldset disabled={busy} className="space-y-6">
    <legend className="mb-2 text-xl font-bold">{existing ? `Edit question ${existing.id}` : "New question"}</legend>
    <div role="group" aria-label="Question type" className="grid gap-3 sm:grid-cols-3">{QUESTION_TYPES.map(kind =>
      <button key={kind} type="button" aria-pressed={type === kind} onClick={() => chooseType(kind)} className={`rounded-2xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-emerald-600 ${type === kind ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"}`}>
        <span className="block font-bold">{QUESTION_KINDS[kind].label}</span><span className="mt-1 block text-sm text-gray-500">{QUESTION_KINDS[kind].description}</span>
      </button>)}
    </div>
    <div className="flex flex-wrap items-end gap-4">
      <label className="min-w-48 flex-1 text-sm font-bold">Unit<select className={input} value={unitId} onChange={event => setUnitId(event.target.value)}>{units.map(unit => <option key={unit.id} value={unit.id}>{unitLabel(unit)}: {unit.title}</option>)}</select></label>
      <button type="button" className={button} onClick={() => setContent(QUESTION_KINDS[type].example)}>Fill with an example</button>
    </div>
    {"options" in content && <MultipleChoiceFields content={content} onChange={setContent} />}
    {"pairs" in content && <WordMatchFields content={content} onChange={setContent} />}
    {"answer" in content && <WordScrambleFields content={content} onChange={setContent} />}
    <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-emerald-600" checked={enabled} onChange={event => setEnabled(event.target.checked)} /><span><strong>Use in reviews</strong><span className="mt-1 block text-sm text-gray-500">Untick to keep the question in the bank without showing it to learners.</span></span></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    <div className="flex gap-3"><button className={`${button} border-emerald-500 text-emerald-800`}>{busy ? "Saving…" : existing ? "Save changes" : "Add question"}</button><Link to="/admin/content/questions" className={button}>Cancel</Link></div>
  </fieldset></form>;
}

const replaceAt = <T,>(items: T[], index: number, value: T) => items.map((item, i) => i === index ? value : item);

function MultipleChoiceFields({ content, onChange }: { content: MultipleChoiceContent; onChange: (content: MultipleChoiceContent) => void }) {
  const removeOption = (index: number) => onChange({ ...content, options: content.options.filter((_, i) => i !== index), correctIndex: content.correctIndex > index ? content.correctIndex - 1 : content.correctIndex === index ? 0 : content.correctIndex });
  return <>
    <label className="block text-sm font-bold">Prompt<textarea required rows={2} maxLength={300} className={input} value={content.prompt} onChange={event => onChange({ ...content, prompt: event.target.value })} /></label>
    <fieldset><legend className="text-sm font-bold">Options — select the correct one</legend>
      <div className="mt-2 space-y-2">{content.options.map((option, index) => <div key={index} className="flex items-center gap-3">
        <input type="radio" name="correct-option" aria-label={`Option ${index + 1} is correct`} className="h-5 w-5 accent-emerald-600" checked={content.correctIndex === index} onChange={() => onChange({ ...content, correctIndex: index })} />
        <input required maxLength={120} aria-label={`Option ${index + 1}`} className={`${input} mt-0`} value={option} onChange={event => onChange({ ...content, options: replaceAt(content.options, index, event.target.value) })} />
        <button type="button" className={button} disabled={content.options.length <= MIN_OPTIONS} aria-label={`Remove option ${index + 1}`} onClick={() => removeOption(index)}>✕</button>
      </div>)}</div>
      <button type="button" className={`${button} mt-3`} disabled={content.options.length >= MAX_OPTIONS} onClick={() => onChange({ ...content, options: [...content.options, ""] })}>+ Add option</button>
    </fieldset>
    <label className="block text-sm font-bold">Explanation shown after answering (optional)<textarea rows={2} maxLength={300} className={input} value={content.explanation ?? ""} onChange={event => onChange({ ...content, explanation: event.target.value })} /></label>
  </>;
}

function WordMatchFields({ content, onChange }: { content: WordMatchContent; onChange: (content: WordMatchContent) => void }) {
  return <>
    <label className="block text-sm font-bold">Instruction (optional)<input maxLength={200} className={input} value={content.prompt ?? ""} placeholder="Match each word with its meaning." onChange={event => onChange({ ...content, prompt: event.target.value })} /></label>
    <fieldset><legend className="text-sm font-bold">Pairs</legend>
      <div className="mt-2 space-y-2">{content.pairs.map((pair, index) => <div key={index} className="flex items-center gap-3">
        <input required maxLength={60} aria-label={`Pair ${index + 1} word`} placeholder="Word" className={`${input} mt-0`} value={pair.left} onChange={event => onChange({ ...content, pairs: replaceAt(content.pairs, index, { ...pair, left: event.target.value }) })} />
        <input required maxLength={60} aria-label={`Pair ${index + 1} match`} placeholder="Match" className={`${input} mt-0`} value={pair.right} onChange={event => onChange({ ...content, pairs: replaceAt(content.pairs, index, { ...pair, right: event.target.value }) })} />
        <button type="button" className={button} disabled={content.pairs.length <= MIN_PAIRS} aria-label={`Remove pair ${index + 1}`} onClick={() => onChange({ ...content, pairs: content.pairs.filter((_, i) => i !== index) })}>✕</button>
      </div>)}</div>
      <button type="button" className={`${button} mt-3`} disabled={content.pairs.length >= MAX_PAIRS} onClick={() => onChange({ ...content, pairs: [...content.pairs, { left: "", right: "" }] })}>+ Add pair</button>
    </fieldset>
  </>;
}

function WordScrambleFields({ content, onChange }: { content: WordScrambleContent; onChange: (content: WordScrambleContent) => void }) {
  return <>
    <label className="block text-sm font-bold">Word to unscramble<input required minLength={2} maxLength={20} pattern="\S+" className={input} value={content.answer} onChange={event => onChange({ ...content, answer: event.target.value })} /><span className="mt-1 block text-xs font-normal text-gray-500">One word of 2–20 characters, no spaces. Its letters are shuffled for the learner.</span></label>
    <label className="block text-sm font-bold">Hint (usually the meaning)<input required maxLength={200} className={input} value={content.hint} onChange={event => onChange({ ...content, hint: event.target.value })} /></label>
  </>;
}
