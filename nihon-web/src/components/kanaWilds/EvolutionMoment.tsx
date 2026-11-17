import { useEffect } from "react";
import type { Evolution } from "../../lib/kanaWilds/evolution";
import { secondaryButton } from "./styles";

type Props = { moment: readonly Evolution[]; onShown: () => void; onDismiss: () => void; className?: string };

/** The evolution moment: "か evolved into が!", once for each evolution, until the player dismisses it. */
export function EvolutionMoment({ moment, onShown, onDismiss, className = "" }: Props) {
  useEffect(() => { if (moment.length) onShown(); }, [moment, onShown]);
  if (!moment.length) return null;
  return <div role="status" className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950 ${className}`}>
    <ul className="flex flex-wrap gap-x-3 font-bold" aria-label="New evolutions">
      {moment.map(({ from, to }) => <li key={to.kana}><span lang="ja">{from}</span> evolved into <span lang="ja" className="text-lg">{to.kana}</span> ({to.romaji})!</li>)}
    </ul>
    <button type="button" className={`${secondaryButton} ml-auto px-3 py-1 text-sm`} onClick={onDismiss}>Nice!</button>
  </div>;
}
