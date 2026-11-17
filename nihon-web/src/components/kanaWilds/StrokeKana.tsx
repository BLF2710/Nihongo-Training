import { useId } from "react";
import { strokePathsOf } from "../../lib/kanaWilds/strokeSamples";
import { STROKE_BOX } from "../../lib/kanaWilds/tracing";
import { strokesPerCharacter } from "./strokeDrawing";
/** Drawn a little bolder than KanjiVG's own width, to read well at a small size. */
const INK_WIDTH = 6;

/** How the strokes are inked: printed (even lines), or with a brush (Kurama's attacks). */
export type InkLook = "print" | "brush";

/** A brush stroke: thick, with ragged edges where the bristles drag, the whole kana leaning as a quick hand writes. */
const BRUSH = { width: 11, roughness: 0.06, ragged: 5, lean: "skewX(-9) rotate(-4 50 50)" } as const;

function BrushFilter({ id }: { id: string }) {
  return <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency={BRUSH.roughness} numOctaves={2} seed={3} />
    <feDisplacementMap in="SourceGraphic" scale={BRUSH.ragged} />
  </filter>;
}

type StrokeKanaProps = { kana: string; shown: number; look?: InkLook; className?: string };

/** A kana drawn from its KanjiVG strokes, showing only the first `shown` (in stroke order). */
export function StrokeKana({ kana, shown, look = "print", className = "" }: StrokeKanaProps) {
  const filterId = useId();
  const isBrush = look === "brush";
  return <svg viewBox={`0 0 ${STROKE_BOX} ${STROKE_BOX}`} className={className} aria-hidden="true">
    {isBrush && <BrushFilter id={filterId} />}
    <g filter={isBrush ? `url(#${filterId})` : undefined} transform={isBrush ? BRUSH.lean : undefined}>
      {strokePathsOf(kana).slice(0, shown).map((path, index) =>
        <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth={isBrush ? BRUSH.width : INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" />)}
    </g>
  </svg>;
}

/** Characters drawn one after another, sharing `drawn` strokes between them in order (for word attacks). */
export function StrokeWord({ characters, drawn, look, className }: { characters: readonly string[]; drawn: number; look?: InkLook; className?: string }) {
  const shownPerCharacter = strokesPerCharacter(characters, drawn);
  return <>{characters.map((character, index) =>
    <StrokeKana key={index} kana={character} shown={shownPerCharacter[index] ?? 0} look={look} className={className} />)}</>;
}
