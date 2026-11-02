import { useEffect, useRef } from "react";
import type { IslandGrowth, GrowthMeasure } from "../../lib/islandGrowth";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Island, IslandState, NextStep } from "../../lib/islandMap";

export const ISLAND_PANEL_ID = "island-panel";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";

export type HomeStats = { streak: number; level: number; levelPercent: number; reviewsDue: number | null };

type Props = {
  island: Island;
  state: IslandState;
  nextStep: NextStep | null;
  /** Short notes shown beside a destination, by its href (for example "12 due"). */
  notes: Readonly<Record<string, string>>;
  onClose: () => void;
  /** How far the island has grown with the learner's progress, when it grows. */
  growth?: IslandGrowth | null;
  /** TEMPORARY, development builds only: the growth step being previewed (null shows the real one) and how to change it. */
  growthPreview?: { stage: number | null; onPreview: (stage: number | null) => void };
  /** What only this place shows (Home's stats, Fuji's climb…), above its destinations. */
  children?: ReactNode;
};

export function IslandPanel({ island, state, nextStep, notes, onClose, growth = null, growthPreview, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, [island.id]);
  const isFogged = state.status === "fogged";
  return <section id={ISLAND_PANEL_ID} aria-labelledby="island-panel-title" className="island-panel absolute z-20 flex flex-col overflow-hidden border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-xl max-sm:inset-x-2 max-sm:bottom-2 max-sm:max-h-[50%] max-sm:rounded-2xl sm:bottom-4 sm:right-4 sm:top-16 sm:w-[22rem] sm:rounded-2xl">
    <header className="flex items-start gap-3 border-b border-[var(--ink)]/20 px-5 py-4">
      <span aria-hidden="true" lang="ja" className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--vermilion)] text-2xl font-bold text-white">{island.mark}</span>
      <div className="min-w-0 flex-1">
        <h2 id="island-panel-title" className="text-xl font-black">{island.name}</h2>
        <p className="text-sm opacity-75">{island.tagline}</p>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label={`Close ${island.name}`} className={`grid size-9 shrink-0 place-items-center rounded-lg text-xl hover:bg-[var(--ink)]/10 ${focus}`}>×</button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      {isFogged && <FogNotice hint={state.hint} nextStep={nextStep} />}
      {growth && <GrowthNote growth={growth} preview={growthPreview} />}
      {children}
      {isFogged && <p className="mb-2 text-xs font-bold uppercase tracking-widest opacity-60">You can still visit</p>}
      {island.destinations.length > 0 && <ul className="space-y-2" aria-label={`${island.name} destinations`}>
        {island.destinations.map(destination => <li key={destination.href}>
          <Link to={destination.href} className={`flex items-center gap-3 rounded-xl border border-[var(--ink)]/15 bg-white/60 px-4 py-3 hover:border-[var(--vermilion)] dark:bg-black/10 ${focus}`}>
            <span className="min-w-0 flex-1"><span className="block font-bold">{destination.label}</span><span className="block text-sm opacity-75">{destination.description}</span></span>
            {notes[destination.href] && <span className="shrink-0 rounded-full bg-[var(--vermilion)] px-2 py-0.5 text-xs font-bold text-white">{notes[destination.href]}</span>}
            <span aria-hidden="true">→</span>
          </Link>
        </li>)}
      </ul>}
    </div>
  </section>;
}

// What each island grows with, as the learner reads it ("Grows with kanji mastered").
const MEASURE_LABELS: Record<GrowthMeasure, string> = {
  completedLessons: "lessons completed", levelsCompleted: "JLPT levels completed", practiceSessions: "listening, speaking and reading sessions",
  gamesPlayed: "Particle Drop games", matureCards: "mature review cards", kanjiMastered: "kanji mastered", kanaMastered: "kana mastered",
};

// Anything else that grows the island, beyond its measure.
const MEASURE_HINTS: Partial<Record<GrowthMeasure, string>> = { levelsCompleted: "Every unit you complete also adds a lantern or azalea." };

/** How far an island has grown, with dots for its steps and what the next one needs. */
function GrowthNote({ growth, preview }: { growth: IslandGrowth; preview?: Props["growthPreview"] }) {
  const label = MEASURE_LABELS[growth.measure];
  return <div className="mb-4 rounded-xl bg-[var(--ink)]/5 px-3 py-2 text-sm">
    <div className="flex items-center gap-3">
    <span className="flex shrink-0 gap-1" role="img" aria-label={`Grown ${growth.stage} of ${growth.maxStage} steps`}>
      {Array.from({ length: growth.maxStage }, (_, step) => <span key={step} className={`size-2.5 rounded-full border border-[var(--ink)]/40 ${step < growth.stage ? "bg-[var(--leaf)]" : ""}`} />)}
    </span>
    <span>
      {growth.nextAt === null ? `Fully grown: ${growth.value} ${label}.` : `Grows with ${label}: ${growth.value} so far, next step at ${growth.nextAt}.`}
      {MEASURE_HINTS[growth.measure] && <span className="block text-xs opacity-70">{MEASURE_HINTS[growth.measure]}</span>}
    </span>
    </div>
    {preview && <GrowthPreview maxStage={growth.maxStage} {...preview} />}
  </div>;
}

/** TEMPORARY, development builds only: show the island at any growth step without earning it. Remove once settled. */
function GrowthPreview({ maxStage, stage, onPreview }: { maxStage: number; stage: number | null; onPreview: (stage: number | null) => void }) {
  const option = (label: string, value: number | null) => <button key={label} type="button" aria-pressed={stage === value} onClick={() => onPreview(value)}
    className={`min-w-7 rounded-md px-1.5 py-0.5 text-xs font-bold ${stage === value ? "bg-[var(--ink)] text-[var(--paper)]" : "hover:bg-[var(--ink)]/10"} ${focus}`}>{label}</button>;
  return <div role="group" aria-label="Preview growth steps (development only)" className="mt-2 flex flex-wrap items-center gap-1 border-t border-dashed border-[var(--ink)]/25 pt-2">
    <span className="mr-1 text-xs opacity-70">Preview:</span>
    {option("Real", null)}
    {Array.from({ length: maxStage + 1 }, (_, step) => option(String(step), step))}
  </div>;
}

function FogNotice({ hint, nextStep }: { hint: string; nextStep: NextStep | null }) {
  return <div className="mb-4 rounded-xl border border-dashed border-[var(--ink)]/40 p-4">
    <p className="font-bold"><span aria-hidden="true">🌫 </span>This island is in fog</p>
    <p className="mt-1 text-sm">{hint}</p>
    {nextStep && <NextStepLink step={nextStep} />}
  </div>;
}

/** Home: the learner's stats (when available) and next step. */
export function HomeSummary({ stats, nextStep }: { stats: HomeStats | null; nextStep: NextStep | null }) {
  return <div className="mb-4">
    {stats && <><dl className="grid grid-cols-3 gap-2 text-center">
      <Stat label="Day streak" value={`🔥 ${stats.streak}`} />
      <Stat label="Level" value={String(stats.level)} />
      <Stat label="Reviews due" value={stats.reviewsDue === null ? "–" : String(stats.reviewsDue)} />
    </dl>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ink)]/10" role="progressbar" aria-label="Progress to the next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.levelPercent}>
      <div className="h-full rounded-full bg-[var(--vermilion)]" style={{ width: `${stats.levelPercent}%` }} />
    </div></>}
    {nextStep && <NextStepLink step={nextStep} />}
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[var(--ink)]/5 px-2 py-2"><dt className="text-xs opacity-70">{label}</dt><dd className="text-lg font-black">{value}</dd></div>;
}

function NextStepLink({ step }: { step: NextStep }) {
  return <Link to={step.href} className={`mt-3 flex items-center gap-3 rounded-xl bg-[var(--ink)] px-4 py-3 text-[var(--paper)] hover:opacity-90 ${focus}`}>
    <span className="min-w-0 flex-1"><span className="block text-xs uppercase tracking-widest opacity-70">Continue</span><span className="block truncate font-bold">{step.title}</span><span className="block text-xs opacity-80">{step.detail}</span></span>
    <span aria-hidden="true">→</span>
  </Link>;
}
