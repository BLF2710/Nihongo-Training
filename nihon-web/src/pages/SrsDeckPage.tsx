import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RubyText from "../components/RubyText";
import { apiErrorMessage } from "../api/errors";
import { fetchSrsDeck, setCardSuspended } from "../api/srs";
import type { DeckCardState, DeckStatus } from "../api/srs";
import { toPlain } from "../lib/furigana";
import { describeCard } from "../lib/srsDeck";
import { formatInterval } from "../lib/srsIntervals";

const PAGE_SIZE = 50;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const card = "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";
const STATUSES: { id: DeckStatus; label: string; tone: string; help: string }[] = [
  { id: "new", label: "New", tone: "bg-indigo-50 text-indigo-900", help: "Not studied yet" },
  { id: "learning", label: "Learning", tone: "bg-amber-50 text-amber-900", help: "Comes back within three weeks" },
  { id: "mature", label: "Mature", tone: "bg-emerald-50 text-emerald-900", help: "Remembered for three weeks or more" },
  { id: "suspended", label: "Hidden", tone: "bg-gray-100 text-gray-700", help: "Left out of reviews until shown again" },
];
const STATUS_BY_ID = Object.fromEntries(STATUSES.map(status => [status.id, status])) as Record<DeckStatus, (typeof STATUSES)[number]>;

type Row = { state: DeckCardState; front: string; answer: string; reading?: string; source: string };
const toRow = (state: DeckCardState): Row => {
  const content = describeCard(state);
  return content
    ? { state, front: content.front, answer: content.answer, reading: content.reading, source: content.source }
    // A word's id is "<lesson id>:<word>"; show the word alone.
    : { state, front: state.itemType === "vocabulary" ? state.itemId.slice(state.itemId.indexOf(":") + 1) : state.itemId, answer: "No longer in the course", source: state.itemType === "kanji" ? "Kanji" : "Word" };
};
const matches = (row: Row, words: string) => !words || [toPlain(row.front), row.answer, row.reading ?? "", row.source].some(text => text.toLowerCase().includes(words));

function dueText(state: DeckCardState, now: number) {
  if (state.status === "suspended") return "Not reviewed while hidden";
  if (!state.dueAt) return "Comes up as a new card";
  const wait = new Date(state.dueAt).getTime() - now;
  return wait <= 0 ? "Due now" : `Due in ${formatInterval(wait)}`;
}

/** Every card in the learner's daily review: find one, see when it comes back, hide it or show it again. */
export default function SrsDeckPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<DeckStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  // Fixed when the deck loads, so "due in" texts don't shift while reading.
  const [loadedAt, setLoadedAt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchSrsDeck(controller.signal).then(cards => { setRows(cards.map(toRow)); setLoadedAt(Date.now()); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your deck could not be loaded.")); });
    return () => controller.abort();
  }, [attempt]);

  const words = search.trim().toLowerCase();
  const filtered = useMemo(() => (rows ?? []).filter(row => (filter === "all" || row.state.status === filter) && matches(row, words)), [rows, filter, words]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map(status => [status.id, (rows ?? []).filter(row => row.state.status === status.id).length])) as Record<DeckStatus, number>, [rows]);
  const replace = (updated: DeckCardState) => setRows(current => current && current.map(row => row.state.itemType === updated.itemType && row.state.itemId === updated.itemId ? { ...row, state: updated } : row));

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2"><h1 className="text-3xl font-black">Your deck</h1>
      <Link to="/srs" className={`text-sm font-semibold text-emerald-700 hover:underline ${focus}`}>← Daily review</Link></div>
    <p className="mt-1 text-gray-600">Every word and kanji in your daily review. Hide a card you don't want to review; it stays here with its progress, and you can show it again any time.</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} <button className="ml-2 font-bold underline" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
    {!rows && !error && <p role="status" className="mt-6 text-gray-500">Loading your deck…</p>}
    {rows && !rows.length && <section className={`${card} mt-6 text-gray-600`}>Your deck is empty. Finish a <Link to="/lessons" className="font-semibold text-emerald-700 underline">lesson</Link> to add its words and kanji, or add a kanji from its page.</section>}
    {rows && rows.length > 0 && <>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1 text-sm font-semibold">Find a card
          <input type="search" value={search} onChange={event => { setSearch(event.target.value); setShown(PAGE_SIZE); }} placeholder="Word, reading or meaning"
            className={`mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-normal ${focus}`} /></label>
      </div>
      <div role="group" aria-label="Show cards" className="mt-3 flex flex-wrap gap-2">
        {([{ id: "all", label: "All", count: rows.length }, ...STATUSES.map(status => ({ id: status.id, label: status.label, count: counts[status.id] }))] as { id: DeckStatus | "all"; label: string; count: number }[]).map(item =>
          <button key={item.id} aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setShown(PAGE_SIZE); }}
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${focus} ${filter === item.id ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white text-gray-700"}`}>{item.label} · {item.count}</button>)}
      </div>
      <p role="status" className="mt-3 text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "card" : "cards"}</p>
      <ul className="mt-2 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white">{filtered.slice(0, shown).map(row =>
        <DeckRow key={`${row.state.itemType}:${row.state.itemId}`} row={row} now={loadedAt} onChanged={replace} />)}</ul>
      {filtered.length > shown && <button className={`mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 ${focus}`} onClick={() => setShown(value => value + PAGE_SIZE)}>Show more ({filtered.length - shown} left)</button>}
    </>}
  </main></div>;
}

function DeckRow({ row, now, onChanged }: { row: Row; now: number; onChanged: (state: DeckCardState) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { state } = row;
  const isSuspended = state.status === "suspended";
  const status = STATUS_BY_ID[state.status];
  const toggle = async () => {
    setSaving(true); setError("");
    try {
      await setCardSuspended(state, !isSuspended);
      // A card shown again goes back to new or learning; the next load shows exactly which.
      onChanged({ ...state, status: isSuspended ? (state.repetitions === 0 && !state.dueAt ? "new" : "learning") : "suspended" });
    } catch (failure) { setError(apiErrorMessage(failure, "The card could not be changed.")); }
    finally { setSaving(false); }
  };
  const name = toPlain(row.front);
  return <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
    <span lang="ja" className={`w-20 shrink-0 text-2xl font-bold ${isSuspended ? "text-gray-400" : ""}`}><RubyText text={row.front} /></span>
    <span className="min-w-0 flex-1">
      <span className={`block font-semibold ${isSuspended ? "text-gray-500" : ""}`}>{row.answer}{row.reading && <span className="ml-2 font-mono text-sm font-normal text-indigo-700">{row.reading}</span>}</span>
      <span className="block text-xs text-gray-500">{row.source} · {dueText(state, now)}</span>
      {error && <span role="alert" className="block text-xs text-red-700">{error}</span>}
    </span>
    <span title={status.help} className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}>{status.label}</span>
    <button type="button" disabled={saving} onClick={() => void toggle()} aria-label={`${isSuspended ? "Show again" : "Hide"} ${name}`}
      className={`shrink-0 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 ${focus}`}>{isSuspended ? "Show again" : "Hide"}</button>
  </li>;
}
