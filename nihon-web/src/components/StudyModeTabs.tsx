import type { KeyboardEvent, ReactNode } from "react";

/** Phones show the short label so all tabs stay on one line. */
export type StudyModeLabel = { short: string; full: string };

type TabsProps<Mode extends string> = { modes: readonly Mode[]; labels: Record<Mode, StudyModeLabel>; selected: Mode; onSelect: (mode: Mode) => void };

const tabId = (mode: string) => `study-tab-${mode}`;
const panelId = (mode: string) => `study-panel-${mode}`;

/** One study mode at a time (flashcard, drawing, writing…) in the same spot; arrow keys move between tabs. */
export function StudyModeTabs<Mode extends string>({ modes, labels, selected, onSelect }: TabsProps<Mode>) {
  const move = (event: KeyboardEvent, offset: number) => {
    event.preventDefault();
    const target = modes[(modes.indexOf(selected) + offset + modes.length) % modes.length];
    onSelect(target);
    document.getElementById(tabId(target))?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => { if (event.key === "ArrowRight") move(event, 1); if (event.key === "ArrowLeft") move(event, -1); };
  return <div role="tablist" aria-label="Study mode" onKeyDown={onKeyDown} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-gray-100 p-1">
    {modes.map(mode => <button key={mode} id={tabId(mode)} type="button" role="tab" aria-selected={mode === selected} aria-controls={panelId(mode)} tabIndex={mode === selected ? 0 : -1} onClick={() => onSelect(mode)} className={`rounded-lg px-2 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-indigo-600 ${mode === selected ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}><span className="sm:hidden">{labels[mode].short}</span><span className="hidden sm:inline">{labels[mode].full}</span></button>)}
  </div>;
}

export function StudyModePanel({ mode, children }: { mode: string; children: ReactNode }) {
  return <div role="tabpanel" id={panelId(mode)} aria-labelledby={tabId(mode)} className="mt-3">{children}</div>;
}
