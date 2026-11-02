import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import KanaStrokeOrder from "../components/KanaStrokeOrder";
import KanaWritingCanvas from "../components/KanaWritingCanvas";
import { FlipCard } from "../components/FlipCard";
import { StudyModePanel, StudyModeTabs, type StudyModeLabel } from "../components/StudyModeTabs";
import { fetchKanaCharacters } from "../api/quiz";
import { enrichHiragana, HIRAGANA_SECTIONS, type KanaLearningCharacter } from "../data/hiraganaLearning";
import { buildKatakanaCatalog, KATAKANA_SECTIONS } from "../data/katakanaLearning";
import { speakJapanese, supportsJapaneseSpeech } from "../services/japaneseSpeech";

export default function HiraganaLearningPage({ script = "hiragana" }: { script?: "hiragana" | "katakana" }) {
  const title = script === "katakana" ? "Katakana" : "Hiragana";
  const { characterId } = useParams(); const navigate = useNavigate();
  const [characters, setCharacters] = useState<KanaLearningCharacter[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { fetchKanaCharacters(script).then(loaded => setCharacters(script === "katakana" ? buildKatakanaCatalog(loaded) : loaded.map(enrichHiragana))).catch(() => setError(`Could not load ${title} characters. Please check that the API is running.`)).finally(() => setLoading(false)); }, [script, title]);
  const selected = useMemo(() => characters.find((item) => item.id === Number(characterId)), [characters, characterId]);
  // Back leaves the character pages for the grid; stepping between characters replaces history so it never walks back through them.
  return <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar back={characterId ? { to: `/learn/${script}` } : undefined} />{characterId ? <CharacterDetail characters={characters} character={selected} loading={loading} onStep={(id) => navigate(`/learn/${script}/${id}`, { replace: true })} /> : <CharacterGrid title={title} characters={characters} loading={loading} error={error} onOpen={(id) => navigate(`/learn/${script}/${id}`)} />}</div>;
}

function CharacterGrid({ title, characters, loading, error, onOpen }: { title: string; characters: KanaLearningCharacter[]; loading: boolean; error: string; onOpen: (id: number) => void }) {
  return <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1"><div className="mb-8"><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{title === "Katakana" ? "ア" : "あ"} Japanese Kana</span><h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">{title}</h1><p className="mt-2 text-gray-600">Learn {title} characters step by step.</p><nav aria-label="Kana script" className="mt-5 flex gap-3">{["Hiragana", "Katakana"].map(name => <Link key={name} to={`/learn/${name.toLowerCase()}`} aria-current={name === title ? "page" : undefined} className={`rounded-xl px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-indigo-600 ${name === title ? "bg-emerald-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}>{name}</Link>)}</nav></div>{loading && <div className="rounded-2xl border bg-white p-8 text-gray-500">Loading characters…</div>}{error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</div>}{!loading && !error && <div className="space-y-8">{(title === "Katakana" ? KATAKANA_SECTIONS : HIRAGANA_SECTIONS).map((section) => <section key={section.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><div className="border-b border-gray-100 pb-5"><h2 className="text-2xl font-bold text-gray-900">{section.title}</h2><p className="mt-1 text-sm text-gray-500">{section.description}</p></div><div className="mt-6 space-y-6">{section.rows.map((row) => { const rowCharacters = characters.filter((item) => "kana" in row ? item.category === section.key && item.row === row.label : item.id >= row.startId && item.id <= row.endId); return <div key={`${section.key}-${row.label}-${"startId" in row ? row.startId : row.kana}`} className="mx-auto max-w-2xl"><div className="mb-3 text-center text-xs font-black uppercase tracking-wider text-gray-400">{row.label}</div><div className="flex flex-wrap justify-center gap-3">{rowCharacters.map((character) => <button key={character.id} onClick={() => onOpen(character.id)} className="group w-24 sm:w-28 min-h-28 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-center shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md"><span className="block text-4xl font-bold text-gray-900 group-hover:text-emerald-800">{character.kana}</span><span className="mt-2 block font-mono text-sm font-semibold text-gray-500">{character.romaji}</span></button>)}</div></div>; })}</div></section>)}</div>}</main>;
}

// The flashcard and the drawing panels share one spot, so the page stays on a single screen; the chosen mode carries over to the next character.
type StudyMode = "card" | "draw" | "write";
const STUDY_MODES: readonly StudyMode[] = ["card", "draw", "write"];
const STUDY_MODE_LABELS: Record<StudyMode, StudyModeLabel> = { card: { short: "Card", full: "🃏 Flashcard" }, draw: { short: "Draw", full: "✏ How to Draw" }, write: { short: "Write", full: "✍ Write It!" } };

function CharacterDetail({ characters, character, loading, onStep }: { characters: KanaLearningCharacter[]; character?: KanaLearningCharacter; loading: boolean; onStep: (id: number) => void }) {
  const [mode, setMode] = useState<StudyMode>("card");
  if (loading) return <main className="max-w-xl w-full mx-auto p-8">Loading character…</main>;
  if (!character) return <main className="max-w-xl w-full mx-auto p-8"><div className="mt-6 rounded-2xl border bg-white p-8">Character not found.</div></main>;
  const index = characters.findIndex((item) => item.id === character.id);
  // --widget-chrome is the room the square drawing widgets leave for the navbar, tabs, their controls and the step row.
  return <main className="max-w-xl w-full mx-auto px-4 py-4 flex-1 [--widget-chrome:31rem]">
    <StudyModeTabs modes={STUDY_MODES} labels={STUDY_MODE_LABELS} selected={mode} onSelect={setMode} />
    <StudyModePanel mode={mode}>
      {mode === "card" && <Flashcard key={character.id} character={character} position={index + 1} total={characters.length} />}
      {mode === "draw" && <section aria-label={`How to draw ${character.kana}`} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"><KanaStrokeOrder key={character.id} character={character.kana} /></section>}
      {mode === "write" && <section aria-label={`Write ${character.kana}`} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"><p className="mb-3 text-sm text-gray-500">Use a mouse, finger, or stylus. This canvas does not claim to grade handwriting.</p><KanaWritingCanvas key={character.id} character={character.kana} /></section>}
    </StudyModePanel>
    <StepControls character={character} previous={characters[index - 1]} next={characters[index + 1]} onStep={onStep} />
  </main>;
}

function Flashcard({ character, position, total }: { character: KanaLearningCharacter; position: number; total: number }) {
  return <FlipCard label={`Flashcard for ${character.kana}`} flipLabel={`${character.kana}: flip to see how to read and remember it`}
    front={<><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{position} of {total} • {character.category === "yoon" ? "Yōon" : character.category}</span><span lang="ja" className="my-auto py-4 text-[8rem] font-black leading-none text-gray-900 sm:text-[10rem]">{character.kana}</span></>}
    back={<><p className="flex items-baseline justify-center gap-4"><span lang="ja" className="text-6xl font-black text-gray-900">{character.kana}</span><span className="font-mono text-4xl font-bold text-emerald-700">{character.romaji}</span></p><CardBack character={character} /></>} />;
}

function CardBack({ character }: { character: KanaLearningCharacter }) {
  const { exampleWord } = character;
  return <div className="mt-4 flex-1 space-y-3">
    {character.mnemonic && <div className="rounded-2xl bg-amber-50 p-4"><h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">Remember it</h2><p className="mt-1 leading-7 text-gray-800">{character.mnemonic}</p></div>}
    <div className="rounded-2xl bg-emerald-50 p-4"><h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Example word</h2>{exampleWord.japanese && <p className="mt-2"><span lang="ja" className="text-3xl font-bold text-gray-900">{exampleWord.japanese}</span> <span className="ml-2 font-mono text-sm font-semibold text-emerald-800">{exampleWord.romaji}</span></p>}<p className="mt-1 text-gray-700">{exampleWord.meaning}</p>{exampleWord.note && <p className="mt-2 text-xs leading-5 text-gray-500">{exampleWord.note}</p>}</div>
  </div>;
}

function StepControls({ character, previous, next, onStep }: { character: KanaLearningCharacter; previous?: KanaLearningCharacter; next?: KanaLearningCharacter; onStep: (id: number) => void }) {
  const [speechStatus, setSpeechStatus] = useState("");
  const listen = () => { setSpeechStatus(""); const started = speakJapanese(character.audioText ?? character.kana, () => setSpeechStatus("Pronunciation finished."), () => setSpeechStatus("Japanese speech could not be played on this device.")); setSpeechStatus(started ? "Playing Japanese pronunciation…" : "Japanese speech is not available in this browser."); };
  const control = "rounded-xl px-3 py-3 text-sm font-bold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-indigo-600";
  return <nav aria-label="Characters" className="mt-3">
    <div className="grid grid-cols-3 gap-2">
      <button type="button" disabled={!previous} onClick={() => previous && onStep(previous.id)} className={`${control} border border-gray-200 bg-white text-gray-700 enabled:hover:bg-gray-50`}>← Previous</button>
      <button type="button" onClick={listen} disabled={!supportsJapaneseSpeech()} className={`${control} border border-emerald-200 bg-emerald-50 text-emerald-800 enabled:hover:bg-emerald-100 disabled:cursor-not-allowed`}><span aria-hidden="true">🔊</span> Listen</button>
      <button type="button" disabled={!next} onClick={() => next && onStep(next.id)} className={`${control} bg-indigo-600 text-white enabled:hover:bg-indigo-700`}>Next →</button>
    </div>
    {speechStatus && <p className="mt-2 text-center text-sm text-gray-500" aria-live="polite">{speechStatus}</p>}
  </nav>;
}
