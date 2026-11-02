import { useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = { label: string; flipLabel: string; front: ReactNode; back: ReactNode };

/**
 * A study card that turns over in place. The whole front is clickable through a stretched button (so the front can
 * still hold a heading); the back holds the details and a button to turn it over again. Focus follows the visible side.
 */
export function FlipCard({ label, flipLabel, front, back }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const flip = (showBack: boolean) => {
    setIsFlipped(showBack);
    requestAnimationFrame(() => (showBack ? backButton : frontButton).current?.focus({ preventScroll: true }));
  };
  // A fixed height (whatever the page leaves through --card-chrome) keeps the page from scrolling; a long back scrolls inside the card with Flip back pinned to its bottom.
  const face = "col-start-1 row-start-1 flex min-h-0 flex-col overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm [backface-visibility:hidden] sm:p-7";
  return <article aria-label={label} className="[perspective:1200px]">
    <div className="grid h-[max(18rem,min(28rem,calc(100dvh-var(--card-chrome,19rem))))] transition-transform duration-500 motion-reduce:transition-none [transform-style:preserve-3d]" style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
      <div inert={isFlipped} aria-hidden={isFlipped} className={`${face} relative items-center text-center hover:border-emerald-300 has-focus-visible:outline-2 has-focus-visible:outline-emerald-600`}>
        {front}
        <button ref={frontButton} type="button" onClick={() => flip(true)} aria-label={flipLabel} className="text-sm font-semibold text-gray-500 outline-none before:absolute before:inset-0 before:rounded-3xl">Tap to flip ↻</button>
      </div>
      <div inert={!isFlipped} aria-hidden={!isFlipped} className={`${face} [transform:rotateY(180deg)]`}>
        {back}
        <div className="sticky -bottom-4 mt-auto flex justify-center bg-gradient-to-t from-white from-60% to-transparent pt-4 pb-0 sm:-bottom-7"><button ref={backButton} type="button" onClick={() => flip(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-sm font-bold text-emerald-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-emerald-600">↻ Flip back</button></div>
      </div>
    </div>
  </article>;
}
