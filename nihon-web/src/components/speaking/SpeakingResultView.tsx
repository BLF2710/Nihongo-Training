import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../../api/errors";
import { reportSpeakingGrade } from "../../api/speakingTest";
import type { Band, SpeakingCorrection, SpeakingResult } from "../../api/speakingTest";

const BAND_STYLE: Record<Band, string> = {
  4: "bg-emerald-100 text-emerald-900 border-emerald-300",
  3: "bg-emerald-50 text-emerald-800 border-emerald-200",
  2: "bg-amber-50 text-amber-900 border-amber-200",
  1: "bg-rose-50 text-rose-900 border-rose-200",
};
const BAND_LABELS: Record<Band, string> = { 1: "がんばろう", 2: "もうすこし", 3: "できました", 4: "すばらしい" };
/** Words Azure scored this low (or marked as an error) are listed for practice. */
const WEAK_WORD_SCORE = 60;

export function BandChip({ band }: { band: Band }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-bold ${BAND_STYLE[band]}`}>
    <span aria-hidden="true">{"●".repeat(band)}{"○".repeat(4 - band)}</span> <span lang="ja">{BAND_LABELS[band]}</span><span className="sr-only">, band {band} of 4</span>
  </span>;
}

/** The transcript with each correction's excerpt marked and numbered (positions come from the server). */
function MarkedTranscript({ transcript, corrections }: { transcript: string; corrections: SpeakingCorrection[] }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  corrections.forEach((correction, index) => {
    if (correction.start < cursor) return;
    parts.push(transcript.slice(cursor, correction.start));
    parts.push(<mark key={index} className="rounded bg-amber-100 px-0.5 text-gray-900 underline decoration-amber-500 decoration-2 underline-offset-4">{transcript.slice(correction.start, correction.end)}<sup className="ml-0.5 text-xs font-bold text-amber-800">{index + 1}</sup></mark>);
    cursor = correction.end;
  });
  parts.push(transcript.slice(cursor));
  return <p lang="ja" className="mt-2 text-lg leading-9 text-gray-900">{parts}</p>;
}

function ReportGrade({ attemptId }: { attemptId: number }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [state, setState] = useState<{ sentId?: number; error?: string; busy?: boolean }>({});
  const send = async () => {
    setState({ busy: true });
    try { setState({ sentId: (await reportSpeakingGrade(attemptId, note)).supportConversationId }); }
    catch (failure) { setState({ error: apiErrorMessage(failure, "Your report couldn't be sent. Please try again.") }); }
  };
  if (state.sentId) return <p role="status" className="text-sm text-gray-700">Report sent to Help & support. <Link to={`/support/${state.sentId}`} className="font-bold text-emerald-700 hover:underline">Open the request →</Link></p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-gray-600 underline hover:text-gray-900">Report this grade</button>;
  return <div className="w-full rounded-xl border border-gray-200 p-3">
    <label htmlFor="report-note" className="text-sm font-semibold">What do you think is wrong with this grade? (optional)</label>
    <textarea id="report-note" value={note} onChange={event => setNote(event.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
    {state.error && <p role="alert" className="mt-1 text-sm text-red-700">{state.error}</p>}
    <div className="mt-2 flex gap-2"><button type="button" disabled={state.busy} onClick={() => void send()} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{state.busy ? "Sending…" : "Send to Help & support"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-700">Cancel</button></div>
  </div>;
}

/** A graded spoken answer: score, band per criterion, transcript with corrections, and what to practise next. */
export default function SpeakingResultView({ result, onRetry }: { result: SpeakingResult; onRetry?: () => void }) {
  const weakWords = result.words.filter(word => word.word && (word.errorType !== "None" || word.accuracy < WEAK_WORD_SCORE));
  const notAssessed = result.criteria.filter(criterion => criterion.band === null);
  return <section aria-labelledby={`result-${result.id}`} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-emerald-200"><span className="text-2xl font-black tabular-nums">{result.score}</span><span className="text-xs text-gray-600">/ 100</span></div>
      <div className="min-w-0">
        <h2 id={`result-${result.id}`} className="text-xl font-black"><span lang="ja">{result.bandLabel}</span> <span className="text-base font-semibold text-gray-600">· band {result.band} of 4</span></h2>
        <p className={`font-semibold ${result.met ? "text-emerald-700" : "text-gray-700"}`}>{result.met ? `✓ Meets the ${result.jfLevel} target (${result.level})` : `Not yet at the ${result.jfLevel} target (${result.level}) — 63 or more meets it`}</p>
        <p className="text-sm text-gray-600">{new Date(result.createdAt).toLocaleString()}{result.measurements.durationSeconds ? ` · ${result.measurements.durationSeconds} s` : ""}</p>
      </div>
    </div>
    {result.summary && <p className="mt-4 text-gray-800">{result.summary}</p>}
    {notAssessed.length > 0 && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">Not assessed: {notAssessed.map(criterion => criterion.name.toLowerCase()).join(" and ")}. The score uses the other criteria only (their weights are scaled to 100 %).</p>}

    {/* Phones: one card per criterion. Wider screens: a table. */}
    <ul aria-label="Grade for each criterion" className="mt-5 space-y-3 sm:hidden">{result.criteria.map(criterion => <li key={criterion.id} className="rounded-xl border border-gray-100 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><span><span className="font-bold">{criterion.name}</span> <span lang="ja" className="text-gray-600">{criterion.japanese}</span></span><span className="text-sm tabular-nums text-gray-600">{criterion.weight} %</span></div>
      <div className="mt-2 flex flex-wrap items-center gap-2">{criterion.band ? <BandChip band={criterion.band} /> : <span className="text-gray-500">Not assessed</span>}{criterion.rawScore !== null && <span className="text-xs tabular-nums text-gray-600">{criterion.rawScore}/100</span>}</div>
      <p className="mt-2 text-sm text-gray-700">{criterion.comment}</p>
    </li>)}</ul>
    <div className="mt-5 hidden sm:block"><table className="w-full text-left text-sm"><caption className="sr-only">Grade for each criterion</caption>
      <thead className="text-gray-600"><tr><th className="py-2 font-semibold">Criterion</th><th className="py-2 text-right font-semibold">Weight</th><th className="py-2 pl-4 font-semibold">Band</th><th className="py-2 pl-4 font-semibold">Comment</th></tr></thead>
      <tbody>{result.criteria.map(criterion => <tr key={criterion.id} className="border-t border-gray-100 align-top">
        <td className="py-3 pr-2"><span className="font-bold">{criterion.name}</span> <span lang="ja" className="text-gray-600">{criterion.japanese}</span><span className="block text-xs text-gray-500">{criterion.source === "ai" ? "AI" : criterion.source === "azure" ? "Pronunciation assessment" : "Speech recognition"}</span></td>
        <td className="py-3 text-right tabular-nums">{criterion.weight} %</td>
        <td className="py-3 pl-4">{criterion.band ? <BandChip band={criterion.band} /> : <span className="text-gray-500">Not assessed</span>}{criterion.rawScore !== null && <span className="mt-1 block text-xs text-gray-600 tabular-nums">{criterion.rawScore}/100</span>}</td>
        <td className="py-3 pl-4 text-gray-700">{criterion.comment}</td>
      </tr>)}</tbody></table></div>

    <section aria-label="Transcript" className="mt-5">
      <h3 className="font-bold">What we heard</h3>
      {result.transcript ? <MarkedTranscript transcript={result.transcript} corrections={result.corrections} /> : <p className="mt-2 text-gray-600">No transcript.</p>}
      <p className="mt-1 text-xs text-gray-600">Written by speech recognition, which chooses kanji, kana and punctuation and can mishear words.</p>
    </section>
    {result.corrections.length > 0 && <section aria-label="Corrections" className="mt-4"><h3 className="font-bold">Corrections</h3><ol className="mt-2 space-y-2">{result.corrections.map((correction, index) =>
      <li key={index} className="rounded-xl bg-amber-50 p-3 text-sm"><span className="font-bold text-amber-900">{index + 1}.</span> <span lang="ja" className="line-through decoration-rose-500">{correction.excerpt}</span> → <span lang="ja" className="font-bold">{correction.corrected}</span> <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs text-gray-700">{correction.category}</span><span className="mt-1 block text-gray-700">{correction.explanation}</span></li>)}</ol></section>}
    {weakWords.length > 0 && <section aria-label="Words to practise" className="mt-4"><h3 className="font-bold">Words to practise saying</h3><ul className="mt-2 flex flex-wrap gap-2">{weakWords.map((word, index) =>
      <li key={index} className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-sm"><span lang="ja" className="font-bold">{word.word}</span> <span className="tabular-nums text-gray-700">{Math.round(word.accuracy)}/100</span>{word.errorType !== "None" && <span className="text-gray-700"> · {word.errorType.toLowerCase()}</span>}</li>)}</ul></section>}

    {(result.strengths.length > 0 || result.nextSteps.length > 0) && <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {result.strengths.length > 0 && <section aria-label="Strengths"><h3 className="font-bold">What went well</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">{result.strengths.map(item => <li key={item}>{item}</li>)}</ul></section>}
      {result.nextSteps.length > 0 && <section aria-label="Next steps"><h3 className="font-bold">Practise next</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">{result.nextSteps.map(item => <li key={item}>{item}</li>)}</ul></section>}
    </div>}
    {result.estimatedLevel && <p className="mt-4 text-sm text-gray-600">Estimated level from this answer: <b>{result.estimatedLevel}</b> (indicative only).</p>}
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {onRetry && <button type="button" onClick={onRetry} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Try this task again</button>}
      <ReportGrade attemptId={result.id} />
    </div>
    <p className="mt-4 text-xs text-gray-500">Grades are feedback, not certification. <Link to="/support" className="underline">Questions? Help & support</Link></p>
  </section>;
}
