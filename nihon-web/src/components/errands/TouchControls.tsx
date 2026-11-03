import type { PointerEvent } from "react";
import type { Direction } from "../../lib/errands/movement";

const PAD: readonly { direction: Direction; label: string; symbol: string; place: string }[] = [
  { direction: "up", label: "Walk up", symbol: "▲", place: "col-start-2 row-start-1" },
  { direction: "left", label: "Walk left", symbol: "◀", place: "col-start-1 row-start-2" },
  { direction: "right", label: "Walk right", symbol: "▶", place: "col-start-3 row-start-2" },
  { direction: "down", label: "Walk down", symbol: "▼", place: "col-start-2 row-start-3" },
];
const padButton = "flex size-12 touch-none select-none items-center justify-center rounded-full border-2 border-white/80 bg-black/35 text-lg text-white active:bg-black/55";

type TouchControlsProps = { onPress: (direction: Direction) => void; onRelease: (direction: Direction) => void; onTalk: () => void; canTalk: boolean };

/** A direction pad and a talk button for touch screens, over the bottom corners of the village. */
export function TouchControls({ onPress, onRelease, onTalk, canTalk }: TouchControlsProps) {
  const hold = (direction: Direction) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); onPress(direction); },
    onPointerUp: () => onRelease(direction),
    onPointerCancel: () => onRelease(direction),
    onLostPointerCapture: () => onRelease(direction),
  });
  return <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[800] hidden items-end justify-between pointer-coarse:flex">
    <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1" role="group" aria-label="Walk">
      {PAD.map(({ direction, label, symbol, place }) => <button key={direction} type="button" aria-label={label} className={`${padButton} ${place}`} {...hold(direction)}>{symbol}</button>)}
    </div>
    <button type="button" onClick={onTalk} disabled={!canTalk} className="pointer-events-auto size-16 rounded-full border-2 border-white/80 bg-emerald-600 font-black text-white shadow-lg disabled:bg-black/35">Talk</button>
  </div>;
}
