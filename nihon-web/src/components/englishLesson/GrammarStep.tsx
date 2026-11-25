import { useId, useState } from "react";
import type { Bilingual, GrammarPoint } from "../../../../shared/course/english/schema.ts";
import { useExplanationLanguage } from "../../lib/explanationLanguage";
import { ExplanationSwitch } from "./ExplanationSwitch";

/** A text in the chosen explanation language, marked with its language for screen readers. */
function Explained({ text, className }: { text: Bilingual; className?: string }) {
  const language = useExplanationLanguage();
  return language === "vietnamese" ? <p lang="vi" className={className}>{text.vietnamese}</p> : <p lang="en-GB" className={className}>{text.english}</p>;
}

/** The two halves of a grammar point. Side by side on a wide screen; on a phone, one at a time. */
const PARTS = [{ id: "rule", label: "Rule" }, { id: "examples", label: "Examples" }] as const;
type Part = typeof PARTS[number]["id"];

/** One grammar point: its pattern and explanation, then its examples in both languages and the mistake it fixes. */
function GrammarPointPanel({ point }: { point: GrammarPoint }) {
  const [shownPart, setShownPart] = useState<Part>("rule");
  const visibility = (part: Part) => part === shownPart ? "" : "hidden md:block";
  return <div>
    <div className="mb-2 flex gap-1 md:hidden">{PARTS.map(part => <button key={part.id} type="button" aria-pressed={part.id === shownPart} onClick={() => setShownPart(part.id)}
      className={`rounded-lg px-3 py-1 text-xs font-bold ${part.id === shownPart ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>{part.label}</button>)}</div>
    <div className="grid gap-4 md:grid-cols-2">
    <div className={visibility("rule")}>
      <p className="rounded-lg bg-indigo-50 px-3 py-2 font-mono text-sm text-indigo-900">{point.pattern}</p>
      <Explained text={point.explanation} className="mt-3 leading-7 text-gray-700" />
    </div>
    <div className={`space-y-2 ${visibility("examples")}`}>
      <ul className="space-y-2">{point.examples.map(example => <li key={example.english} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm sm:text-base">
        <span lang="en-GB" className="font-semibold">{example.english}</span> <span lang="vi" className="block text-xs text-gray-600 sm:text-sm">{example.vietnamese}</span>
      </li>)}</ul>
      {point.mistake && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
        <p><span className="font-bold text-red-700">✗ <s>{point.mistake.wrong}</s></span> <span className="ml-2 font-bold text-emerald-800">✓ {point.mistake.right}</span></p>
        <Explained text={point.mistake.why} className="mt-1 text-gray-700" />
      </div>}
    </div>
    </div>
  </div>;
}

/** The lesson's grammar, one point at a time (a tab each), explained in English or, with the switch, Vietnamese. */
export function GrammarStep({ points }: { points: readonly GrammarPoint[] }) {
  const [shownIndex, setShownIndex] = useState(0);
  const tabsId = useId();
  const shown = points[shownIndex] ?? points[0];
  return <div>
    <div className="flex flex-wrap items-center justify-end gap-3 sm:justify-between">
      <h2 className="sr-only text-xl font-black sm:not-sr-only sm:text-2xl">Grammar <span lang="vi" className="text-base font-semibold text-gray-500">· Ngữ pháp</span></h2>
      <ExplanationSwitch />
    </div>
    <div role="tablist" aria-label="Grammar points" className="mt-2 flex flex-wrap gap-2 sm:mt-3">{points.map((point, index) =>
      <button key={point.title} type="button" role="tab" id={`${tabsId}-tab-${index}`} aria-selected={index === shownIndex} aria-controls={`${tabsId}-panel`}
        onClick={() => setShownIndex(index)}
        className={`rounded-full border px-4 py-1.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-emerald-600 ${index === shownIndex ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"}`}>
        {point.title}
      </button>)}</div>
    {shown && <div key={shownIndex} role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-tab-${shownIndex}`} className="mt-3 sm:mt-4"><GrammarPointPanel point={shown} /></div>}
  </div>;
}
