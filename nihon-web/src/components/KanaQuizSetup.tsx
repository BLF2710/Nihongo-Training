import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import { fetchKanaCharacters } from "../api/quiz";
import { useActivity, useActivityState } from "../context/ActivityContext";
import type { KanaApiCharacter } from "../data/hiraganaLearning";
import { HIRAGANA_SECTIONS } from "../data/hiraganaLearning";
import { KATAKANA_SECTIONS } from "../data/katakanaLearning";

export default function KanaQuizSetup({ children }: { children: (characters: KanaApiCharacter[], onChoose: () => void) => ReactNode }) {
  const [params] = useSearchParams();
  const script = params.get("type") === "katakana" ? "katakana" : "hiragana";
  return <Selection key={script} script={script}>{children}</Selection>;
}

function Selection({ script, children }: { script: "hiragana" | "katakana"; children: (characters: KanaApiCharacter[], onChoose: () => void) => ReactNode }) {
  const activity = useActivity();
  const [characters, setCharacters] = useState<KanaApiCharacter[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [session, setSession] = useActivityState<KanaApiCharacter[] | null>("characters", null);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchKanaCharacters(script, controller.signal)
      .then(characters => { setCharacters(characters); setError(false); setLoaded(true); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [script, retry]);
  if (session && !choosing) return children(session, () => setChoosing(true));
  const title = script === "katakana" ? "Katakana" : "Hiragana";
  const group = (item: KanaApiCharacter) => [...item.kana].length === 1 ? "Single" : /[ゃゅょャュョ]$/.test(item.kana) && /^[きしちにひみりぎじびぴキシチニヒミリギジビピ]/.test(item.kana) ? "Double" : "Extended";
  const chosen = characters.filter(item => selected.includes(item.id));
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <h1 className="mt-6 text-3xl font-black">{title} Speed Quiz</h1>
    <p className="mt-2 text-gray-600">Choose characters to practice, then start the game.</p>
    <nav aria-label="Quiz script" className="my-5 flex gap-3">{["hiragana", "katakana"].map(type => <Link key={type} to={{ search: `?type=${type}` }} aria-current={type === script ? "page" : undefined} className={`rounded-xl border px-4 py-2 font-bold ${type === script ? "bg-emerald-600 text-white" : "bg-white"}`}>{type === "hiragana" ? "Hiragana" : "Katakana"}</Link>)}</nav>
    {error ? <p role="alert">Could not load characters. <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p> : !loaded ? <p role="status">Loading characters…</p> : <>
      <div className="mb-5 flex flex-wrap items-center gap-3"><button className="rounded-xl border bg-white px-4 py-2 font-bold" onClick={() => setSelected(characters.map(item => item.id))}>Select all</button><button className="rounded-xl border bg-white px-4 py-2" onClick={() => setSelected([])}>Clear selection</button><span role="status">{chosen.length} selected</span></div>
      <div className="space-y-4">{(script === "katakana" ? ["Single", "Double", "Extended"] : ["Single", "Double"]).map(name => {
        const items = characters.filter(item => group(item) === name);
        // Use the learning catalog's sound families, not arbitrary grid wrapping.
        const columns = script === "hiragana"
          ? HIRAGANA_SECTIONS.flatMap(section => section.rows.map(row => ({
            key: `${section.key}-${row.startId}`, label: row.label,
            items: items.filter(item => item.id >= row.startId && item.id <= row.endId).sort((a, b) => a.id - b.id),
          }))).filter(column => column.items.length)
          : KATAKANA_SECTIONS.flatMap(section => section.rows.flatMap(row => {
            const kana = row.kana.split(' ');
            // Extended teaching rows sometimes combine several sound families.
            const families = section.key === "extended" ? [...new Set(kana.map(value => value[0]))].map(initial => kana.filter(value => value[0] === initial)) : [kana];
            return families.map(family => ({ key: `${section.key}-${row.label}-${family[0]}`, label: section.key === "extended" ? family[0] : row.label,
              items: family.flatMap(value => items.filter(item => item.kana === value)),
            }));
          })).filter(column => column.items.length);
        return <section key={name} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{name} characters</h2><button disabled={!items.length} className="rounded-lg border px-3 py-2 text-sm font-bold text-emerald-700 disabled:opacity-40" onClick={() => setSelected(value => [...new Set([...value, ...items.map(item => item.id)])])}>Add all {name.toLowerCase()}</button></div>
          <p className="mt-2 text-sm text-gray-500">{name === "Single" ? "Basic characters, dakuten and handakuten." : name === "Double" ? "Yōon / contracted sounds." : "Additional combinations used in foreign words."}</p>
          <details className="mt-4"><summary className="cursor-pointer font-semibold text-emerald-800">Choose individually ({items.filter(item => selected.includes(item.id)).length} / {items.length})</summary>
            <p className="mt-3 text-xs text-gray-500">Scroll sideways to see all groups. Click a top character to select its whole column; click again to clear it.</p>
            <div role="region" aria-label={`${name} character columns`} tabIndex={0} className="mt-4 flex max-w-full items-start gap-2 overflow-x-auto overscroll-x-contain pb-3 focus-visible:outline-2 focus-visible:outline-emerald-600">{columns.map(column => <div key={column.key} role="group" aria-label={`${column.label} sound group`} className="w-20 shrink-0 rounded-xl bg-gray-50 p-1 sm:w-24">
              <button type="button" aria-label={`Select ${column.items[0].kana} column`} aria-pressed={column.items.every(item => selected.includes(item.id))} onClick={() => setSelected(value => column.items.every(item => value.includes(item.id)) ? value.filter(id => !column.items.some(item => item.id === id)) : [...new Set([...value, ...column.items.map(item => item.id)])])} className={`mb-2 w-full rounded-lg border px-1 py-2 text-center font-bold focus-visible:outline-2 focus-visible:outline-emerald-600 ${column.items.every(item => selected.includes(item.id)) ? "border-emerald-600 bg-emerald-600 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><span lang="ja" className="block text-xl">{column.items[0].kana}</span><span className="block text-xs">{column.items[0].romaji}</span></button>
              <div className="flex flex-col gap-2">{column.items.map(item => <button key={item.id} aria-pressed={selected.includes(item.id)} aria-label={`${item.kana} ${item.romaji}`} onClick={() => setSelected(value => value.includes(item.id) ? value.filter(id => id !== item.id) : [...value, item.id])} className={`w-full rounded-xl border px-1 py-3 focus-visible:outline-2 focus-visible:outline-emerald-600 ${selected.includes(item.id) ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}><span lang="ja" className="block text-2xl sm:text-3xl">{item.kana}</span><span className="mt-1 block text-sm text-gray-500">{item.romaji}</span></button>)}</div>
            </div>)}</div>
          </details>
          {!items.length && <p className="mt-3 text-sm text-gray-500">These characters are not available in the quiz catalog yet.</p>}
        </section>;
      })}</div>
      <div className="sticky bottom-0 mt-5 flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"><span>{chosen.length} characters selected</span><button disabled={!chosen.length} onClick={async () => { if (await activity.begin(true)) { setSession(chosen); setChoosing(false); } }} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-40">Start Quiz →</button></div>
    </>}
  </main></div>;
}
