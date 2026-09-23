import { useEffect, useState } from 'react';
import dataset from '../data/kanaStrokes.json';
import './KanaStrokeOrder.css';

const paths = dataset.paths as Record<string, string[]>;
export default function KanaStrokeOrder({ character }: { character: string }) {
  const parts = [...character];
  const strokes = parts.flatMap((part, partIndex) => (paths[part] ?? []).map(d => ({ d, partIndex })));
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (count < strokes.length) setCount(count + 1);
      else setPlaying(false);
    }, count === 0 ? 80 : 1000);
    return () => window.clearTimeout(timer);
  }, [playing, count, strokes.length]);
  if (parts.some(part => !paths[part])) return <p className="mt-4 rounded-xl bg-gray-50 p-5 text-gray-600">Verified stroke-order data is not available for {character} yet.</p>;
  const control = 'rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-50 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-indigo-600';
  return <div className="mt-5">
    <svg viewBox={`0 0 ${109 * parts.length} 109`} className="mx-auto w-full max-w-md rounded-2xl bg-gray-50" role="img" aria-label={`Stroke order for ${character}, ${count} of ${strokes.length} strokes`}>
      {strokes.map((stroke, index) => <g key={`${replay}-${index}`} transform={`translate(${109 * stroke.partIndex} 0)`} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={stroke.d} stroke="#e5e7eb" />
        {index < count && <path key={`${count}-${index}`} d={stroke.d} pathLength="1" stroke={index === count - 1 ? '#4f46e5' : '#111827'} className={playing && index === count - 1 ? 'kana-stroke-reveal' : undefined} />}
      </g>)}
    </svg>
    <p className="mt-3 text-center text-sm font-semibold" aria-live="polite">Stroke {count} of {strokes.length}</p>
    {parts.length > 1 && <p className="mt-2 text-center text-sm text-gray-600">Write {parts[0]} first, then the small {parts[1]}. Each diagram uses its own verified character strokes.</p>}
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button className={control} onClick={() => { setCount(0); setReplay(replay + 1); setPlaying(true); }}>Replay</button>
      <button className={control} disabled={count === 0} onClick={() => { setPlaying(false); setCount(count - 1); }}>Previous Stroke</button>
      <button className={control} disabled={count === strokes.length} onClick={() => { setPlaying(false); setCount(count + 1); }}>Next Stroke</button>
      <button className={control} onClick={() => { setPlaying(false); setCount(0); }}>Reset</button>
    </div>
    <p className="mt-4 text-center text-xs text-gray-500">Stroke data © Ulrich Apel and contributors, <a className="underline" href="https://kanjivg.tagaini.net/">KanjiVG</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. <a className="underline" href="/kanjivg/ATTRIBUTION.md">Sources and modifications</a></p>
  </div>;
}
