import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LearningOverview as Overview } from "../api/statistics";

const SECONDS_PER_MINUTE = 60;
const ASSESSMENT_PASS_PERCENT = 80;
const card = "min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";
const PRACTICE_KINDS: Record<string, { label: string; icon: string }> = {
  listening: { label: "Listening", icon: "🎧" }, speaking: { label: "Speaking", icon: "🗣️" }, reading: { label: "Reading", icon: "📖" }, "mock-exam": { label: "Mock exams", icon: "📝" }, particles: { label: "Particle Drop", icon: "は" },
};
const MISTAKE_LABELS = { lesson: "Lessons", review: "Reviews", assessment: "Assessments", mock_exam: "Mock exams", kana: "Kana", kanji: "Kanji" } as const;

const minutes = (seconds: number) => Math.round(seconds / SECONDS_PER_MINUTE);
const shortDay = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString([], { weekday: "short", day: "numeric" });
const percent = (part: number, whole: number) => whole ? Math.round(part / whole * 100) : 0;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// ---- Building blocks

/** A headline number in the Kana tab's style: an icon badge, the label, the value and a detail line. */
function Tile({ icon, label, value, detail }: { icon: string; label: string; value: string; detail?: string }) {
  return <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl">{icon}</span>
    <div className="min-w-0"><p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-gray-900">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}</div>
  </div>;
}

/** A card with an icon badge and title; `summary` is one headline sentence under the title. */
function Panel({ icon, title, summary, action, children }: { icon: string; title: string; summary?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return <div className={card}>
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl">{icon}</span>
      <div className="min-w-0 flex-1"><h3 className="text-lg font-bold text-gray-900">{title}</h3>{summary && <p className="text-sm text-gray-600">{summary}</p>}</div>
    </div>
    <div className="mt-4">{children}</div>
    {action && <div className="mt-4 border-t border-gray-100 pt-3">{action}</div>}
  </div>;
}

function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="text-sm font-bold text-emerald-700 hover:underline">{children} →</Link>;
}

/** Nothing recorded yet: says so plainly and offers where to start. */
function Empty({ text, to, cta }: { text: string; to: string; cta: string }) {
  return <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
    <p className="text-sm text-gray-600">{text}</p>
    <Link to={to} className="mt-3 inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-700">{cta}</Link>
  </div>;
}

/** Passed / not yet: colour always comes with an icon and a word. */
function Status({ passed }: { passed: boolean }) {
  return passed
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800"><span aria-hidden="true">✓</span>Passed</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900"><span aria-hidden="true">↻</span>Not yet</span>;
}

/** A thin horizontal bar for a 0–100 value, with an optional marker (e.g. the pass mark). */
function Meter({ value, label, marker }: { value: number; label: string; marker?: number }) {
  return <div className="relative h-2 w-full rounded-full bg-gray-100" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    {marker !== undefined && <span aria-hidden="true" className="absolute -top-1 h-4 w-0.5 rounded bg-gray-500" style={{ left: `${marker}%` }} />}
  </div>;
}

/** One share as a ring, with the number in the middle. */
function Ring({ value, label }: { value: number; label: string }) {
  return <div role="img" aria-label={`${label}: ${value}%`} className="relative h-24 w-24 shrink-0 rounded-full"
    style={{ background: `conic-gradient(var(--color-emerald-600) ${value * 3.6}deg, var(--color-gray-100) 0deg)` }}>
    <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-white"><span className="text-xl font-extrabold text-gray-900">{value}%</span></div>
  </div>;
}

/** Bars for one measure per day or week, with the exact numbers on hover/focus and in a table. */
function BarChart({ title, rows, unit, goal }: { title: string; rows: { label: string; value: number }[]; unit: string; goal?: number }) {
  const max = Math.max(1, goal ?? 0, ...rows.map(row => row.value));
  const hasGoal = goal !== undefined && goal > 0;
  return <figure className="mt-1">
    <div className="relative flex h-40 items-end gap-0.5 border-b border-gray-200" role="img" aria-label={`${title}: ${rows.map(row => `${row.label} ${row.value} ${unit}`).join(", ")}`}>
      {hasGoal && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-gray-500" style={{ bottom: `${goal / max * 100}%` }} />}
      {rows.map(row => <div key={row.label} className="group relative flex h-full flex-1 items-end px-px" tabIndex={0} aria-label={`${row.label}: ${row.value} ${unit}`}>
        <div className={`w-full rounded-t ${hasGoal && row.value < goal ? "bg-emerald-300" : "bg-emerald-600"} group-hover:opacity-80`} style={{ height: `${row.value / max * 100}%`, minHeight: row.value ? 3 : 0 }} />
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block group-focus:block">{row.label}: {row.value} {unit}</span>
      </div>)}
    </div>
    <div aria-hidden="true" className="mt-1 flex justify-between text-[11px] text-gray-500"><span>{rows[0]?.label}</span><span>{rows.at(-1)?.label}</span></div>
    {hasGoal && <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Goal met</span>
      <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-300" />Below goal</span>
      <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="w-4 border-t border-dashed border-gray-500" />Goal ({goal} {unit})</span>
    </div>}
    <details className="mt-2 text-sm text-gray-600"><summary className="cursor-pointer font-semibold">Show as a table</summary>
      <table className="mt-2 w-full text-left"><thead><tr><th className="py-1">Date</th><th className="py-1 text-right">{unit}</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.label} className="border-t border-gray-100"><td className="py-1">{row.label}</td><td className="py-1 text-right tabular-nums">{row.value}</td></tr>)}</tbody></table></details>
  </figure>;
}

type Props = { overview: Overview };

// ---- Tabs

/** At a glance: study time, lessons, the review deck and open mistakes, with the two activity charts. */
export function OverviewStats({ overview }: Props) {
  const { studyTime, lessons, srs, mistakes } = overview;
  const thisWeek = lessons.weeks.at(-1)?.lessons ?? 0;
  return <section aria-labelledby="learning-heading">
    <h2 id="learning-heading" className="text-2xl font-black text-gray-900">Your learning</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile icon="⏱️" label="Study time, 14 days" value={`${minutes(studyTime.totalSeconds)} min`} detail={`Daily goal met on ${plural(studyTime.daysGoalMet, "day")}`} />
      <Tile icon="📚" label="Lessons completed" value={String(lessons.completed)} detail={`${thisWeek} this week`} />
      <Tile icon="🃏" label="Cards in review deck" value={String(srs.total)} detail={`${srs.mature} well learned · ${srs.dueTotal} due today`} />
      <Tile icon="📒" label="Mistakes to practise" value={String(mistakes.open)} detail={`${mistakes.resolved} cleared`} />
    </div>
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
      <Panel icon="📈" title="Minutes studied per day" summary={`Your goal is ${studyTime.goalMinutes} minutes a day.`} action={<CardLink to="/lessons">Keep studying</CardLink>}>
        <BarChart title="Minutes studied per day" unit="min" goal={studyTime.goalMinutes} rows={studyTime.days.map(day => ({ label: shortDay(day.day), value: minutes(day.seconds) }))} />
      </Panel>
      <Panel icon="🗓️" title="Lessons completed per week" summary={`${plural(thisWeek, "lesson")} so far this week.`} action={<CardLink to="/lessons">Next lesson</CardLink>}>
        <BarChart title="Lessons completed per week" unit="lessons" rows={lessons.weeks.map(week => ({ label: `Week of ${new Date(`${week.week}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}`, value: week.lessons }))} />
      </Panel>
    </div>
  </section>;
}

/** One result row: what it was, a score bar, the score and passed / not yet. */
function ResultRow({ title, detail, score, passed, marker }: { title: string; detail?: string; score: number; passed: boolean | null; marker?: number }) {
  return <li className="py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0"><p className="truncate font-semibold text-gray-900">{title}</p>{detail && <p className="text-xs text-gray-500">{detail}</p>}</div>
      <div className="flex shrink-0 items-center gap-2"><span className="font-bold tabular-nums text-gray-900">{score}%</span>{passed !== null && <Status passed={passed} />}</div>
    </div>
    <div className="mt-2"><Meter value={score} label={`${title}: ${score}%`} marker={marker} /></div>
  </li>;
}

/** Unit assessments, mock exams and speaking tests. */
export function TestStats({ overview }: Props) {
  const { assessments, mockExams, speaking } = overview;
  const passed = assessments.filter(item => item.isPassed).length;
  const bestMock = mockExams.reduce((best, result) => Math.max(best, result.percent), 0);
  return <section aria-labelledby="tests-heading">
    <h2 id="tests-heading" className="text-2xl font-black text-gray-900">Tests</h2>
    <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
      <Panel icon="🎓" title="Unit assessments" summary={assessments.length ? `${passed} of ${assessments.length} passed · pass mark ${ASSESSMENT_PASS_PERCENT}%` : undefined}>
        {assessments.length
          ? <ul className="divide-y divide-gray-100">{assessments.map(item => <ResultRow key={item.unitId} title={`${item.level} Unit ${item.number} · ${item.title}`} detail="Best score" score={item.bestScore} passed={item.isPassed} marker={ASSESSMENT_PASS_PERCENT} />)}</ul>
          : <Empty text="No assessments taken yet. Each unit ends with one." to="/lessons" cta="Go to lessons" />}
      </Panel>
      <div className="grid gap-5">
        <Panel icon="📝" title="Mock exams" summary={mockExams.length ? `${plural(mockExams.length, "attempt")} · best ${bestMock}%` : undefined}>
          {mockExams.length
            ? <ul className="divide-y divide-gray-100">{mockExams.map(result => <ResultRow key={result.id} title={`${result.level} mock exam`} detail={`${new Date(result.createdAt).toLocaleDateString()}${result.timedOut ? " · time ran out" : ""}`} score={result.percent} passed={result.passed} />)}</ul>
            : <Empty text="No mock exams yet. Try one when you finish a level." to="/mock-exam" cta="Take a mock exam" />}
        </Panel>
        <Panel icon="🎤" title="Speaking tests">
          {speaking.length
            ? <ul className="divide-y divide-gray-100">{speaking.map(item => <ResultRow key={item.level} title={`${item.level} speaking test`} detail={`${plural(item.attempts, "attempt")} · ${plural(item.tasksMet, "task")} at target`} score={item.bestScore} passed={null} />)}</ul>
            : <Empty text="No speaking tests yet (they start at N3)." to="/speaking/test" cta="See the speaking test" />}
        </Panel>
      </div>
    </div>
  </section>;
}

/** Daily review, kanji, mistakes and listening / speaking / reading practice. */
export function PracticeStats({ overview }: Props) {
  const { kanji, srs, mistakes, practice } = overview;
  const remembered = srs.days.reduce((sum, day) => sum + day.remembered, 0), reviews = srs.days.reduce((sum, day) => sum + day.reviews, 0);
  const kanjiParts = [
    { label: "Mastered", count: kanji.mastered, colour: "bg-emerald-600" },
    { label: "Learning", count: kanji.learning, colour: "bg-emerald-300" },
    { label: "Not practised yet", count: kanji.untested, colour: "bg-gray-200" },
  ];
  const mistakeMax = Math.max(1, ...Object.values(mistakes.bySource));
  return <section aria-labelledby="practice-heading">
    <h2 id="practice-heading" className="text-2xl font-black text-gray-900">Practice</h2>
    <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
      <Panel icon="🃏" title="Daily review" action={<CardLink to="/srs">Open the daily review</CardLink>}>
        <div className="flex items-center gap-5">
          <Ring value={percent(remembered, reviews)} label="Reviews remembered in 14 days" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{reviews ? `${reviews} reviews in 14 days, ${percent(remembered, reviews)}% remembered.` : "No reviews yet."}</p>
            <p className="mt-1">{srs.learned} of {srs.total} cards studied · {srs.newCards} new waiting</p>
            <p className="mt-1">{srs.dueTotal} due today</p>
          </div>
        </div>
      </Panel>
      <Panel icon="漢" title="Kanji" summary={`${kanji.mastered} of ${kanji.total} mastered`} action={<CardLink to="/learn/kanji/practice">Kanji practice</CardLink>}>
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={kanjiParts.map(part => `${part.label} ${part.count}`).join(", ")}>
          {kanjiParts.filter(part => part.count > 0).map(part => <div key={part.label} className={part.colour} style={{ width: `${percent(part.count, kanji.total || 1)}%` }} />)}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 text-sm">{kanjiParts.map(part => <li key={part.label}>
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${part.colour}`} />{part.label}</span>
          <span className="font-bold tabular-nums text-gray-900">{part.count}</span>
        </li>)}</ul>
      </Panel>
      <Panel icon="📒" title="Mistakes by where they happened" summary={`${mistakes.open} to practise · ${mistakes.resolved} cleared`} action={<CardLink to="/mistakes">Mistake notebook</CardLink>}>
        <ul className="space-y-2.5">{(Object.keys(MISTAKE_LABELS) as (keyof typeof MISTAKE_LABELS)[]).map(source => <li key={source} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="text-gray-600">{MISTAKE_LABELS[source]}</span>
          <span className="h-2 rounded-full bg-gray-100"><span className="block h-2 rounded-full bg-emerald-600" style={{ width: `${percent(mistakes.bySource[source], mistakeMax)}%` }} /></span>
          <span className="text-right font-semibold tabular-nums text-gray-900">{mistakes.bySource[source]}</span>
        </li>)}</ul>
      </Panel>
      <Panel icon="🎯" title="Practice sessions" summary="Listening, speaking and reading, with how many answers were right.">
        {practice.length
          ? <ul className="divide-y divide-gray-100">{practice.map(item => {
            const kind = PRACTICE_KINDS[item.kind] ?? { label: item.kind, icon: "•" };
            const right = percent(item.correct, item.answered);
            return <li key={item.kind} className="py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-gray-900"><span aria-hidden="true">{kind.icon} </span>{kind.label} · {plural(item.sessions, "session")}</span>
                <span className="font-bold tabular-nums text-gray-900">{item.answered ? `${right}% right` : "—"}</span>
              </div>
              <div className="mt-2"><Meter value={right} label={`${kind.label}: ${right}% right`} /></div>
            </li>;
          })}</ul>
          : <Empty text="No listening, speaking or reading sessions yet." to="/listening" cta="Try listening practice" />}
      </Panel>
    </div>
  </section>;
}
