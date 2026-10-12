import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteQuestion, saveQuestion } from "../../api/admin";
import type { BankQuestion, QuestionBank } from "../../api/admin";
import { adminError, button, card, input, useAdminData } from "./adminData";
import { QUESTION_KINDS, QUESTION_TYPES, summarize } from "./questionBank";

/** The question bank at a glance: totals per unit and type, and every question with its controls. */
export default function AdminQuestions() {
  const result = useAdminData<QuestionBank>("/admin/questions");
  const [unitId, setUnitId] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const units = result.data?.units ?? [];
  const questions = result.data?.questions ?? [];
  const shown = questions.filter(question => (unitId === "all" || question.unitId === unitId) && (type === "all" || question.type === type) && summarize(question).toLowerCase().includes(search.toLowerCase()));
  const unitNumber = (id: string) => units.find(unit => unit.id === id)?.number ?? "?";

  async function run(question: BankQuestion, work: () => Promise<unknown>, done: string) {
    if (busy) return;
    setBusy(question.id); setError(""); setMessage("");
    try { await work(); setMessage(done); result.reload(); }
    catch (failure) { setError(adminError(failure)); }
    finally { setBusy(0); }
  }
  const toggle = (question: BankQuestion) => run(question, () => saveQuestion({ ...question, enabled: !question.enabled }, question.id), `Question ${question.enabled ? "hidden from" : "added back to"} reviews.`);
  const remove = (question: BankQuestion) => {
    if (!window.confirm(`Delete this question permanently?\n\n${summarize(question)}`)) return;
    void run(question, () => deleteQuestion(question.id), "Question deleted.");
  };

  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-2xl text-gray-600">Unit reviews draw from these questions together with each unit's assessment. Hidden questions stay in the bank but are not shown to learners.</p>
      <Link to="/admin/questions/new" className={`${button} border-emerald-500 text-emerald-800`}>+ Add question</Link>
    </div>
    {result.data && <div className="mb-6 grid gap-4 sm:grid-cols-3">{units.map(unit => {
      const inUnit = questions.filter(question => question.unitId === unit.id);
      return <section key={unit.id} className={card} aria-label={`Unit ${unit.number} questions`}>
        <p className="text-sm font-semibold text-gray-500">Unit {unit.number}</p>
        <p className="mt-2 text-3xl font-black">{inUnit.length}</p>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">{QUESTION_TYPES.map(kind => <li key={kind}>{QUESTION_KINDS[kind].label}: {inUnit.filter(question => question.type === kind).length}</li>)}</ul>
        <p className="mt-2 text-xs text-gray-500">{inUnit.filter(question => !question.enabled).length} hidden</p>
      </section>;
    })}</div>}
    <div className="mb-5 flex flex-wrap items-end gap-4">
      <label className="min-w-48 flex-1 text-sm font-bold">Search questions<input className={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Find by prompt, word, or hint" /></label>
      <label className="text-sm font-bold">Unit<select className={input} value={unitId} onChange={event => setUnitId(event.target.value)}><option value="all">All units</option>{units.map(unit => <option key={unit.id} value={unit.id}>Unit {unit.number}</option>)}</select></label>
      <label className="text-sm font-bold">Type<select className={input} value={type} onChange={event => setType(event.target.value)}><option value="all">All types</option>{QUESTION_TYPES.map(kind => <option key={kind} value={kind}>{QUESTION_KINDS[kind].label}</option>)}</select></label>
      <button className={button} disabled={result.loading || !!busy} onClick={result.reload}>Refresh</button>
    </div>
    {(error || result.error) && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error || result.error}</p>}
    {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}
    {result.loading && <p role="status" className="mb-4">Loading questions…</p>}
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white"><table className="w-full text-left text-sm">
      <caption className="sr-only">Question bank</caption>
      <thead className="bg-gray-50 text-gray-500"><tr>{["Unit", "Type", "Question", "Status", "Actions"].map(label => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead>
      <tbody>{shown.map(question => <tr key={question.id} className="border-t border-gray-100 align-top">
        <td className="whitespace-nowrap px-5 py-4">Unit {unitNumber(question.unitId)}</td>
        <td className="whitespace-nowrap px-5 py-4">{QUESTION_KINDS[question.type].label}</td>
        <td className="max-w-md px-5 py-4" lang="ja">{summarize(question)}</td>
        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${question.enabled ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{question.enabled ? "In reviews" : "Hidden"}</span></td>
        <td className="px-5 py-4"><div className="flex flex-wrap gap-2">
          <Link className={button} to={`/admin/questions/new?id=${question.id}`} aria-label={`Edit question ${question.id}`}>Edit</Link>
          <button className={button} disabled={!!busy || result.loading} aria-label={`${question.enabled ? "Hide" : "Show"} question ${question.id}`} onClick={() => void toggle(question)}>{busy === question.id ? "Saving…" : question.enabled ? "Hide" : "Show"}</button>
          <button className={`${button} text-red-700`} disabled={!!busy || result.loading} aria-label={`Delete question ${question.id}`} onClick={() => remove(question)}>Delete</button>
        </div></td>
      </tr>)}</tbody>
    </table>{result.data && !shown.length && <p className="p-6 text-gray-500">No questions match these filters.</p>}</div>
    <p className="mt-4 text-sm text-gray-500">{shown.length} of {questions.length} questions shown</p>
  </>;
}
