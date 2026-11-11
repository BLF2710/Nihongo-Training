import { strokePathsOf } from "../../lib/kanaWilds/strokeSamples";
import { STROKE_BOX } from "../../lib/kanaWilds/tracing";
import { strokesPerCharacter } from "./strokeDrawing";
/** Drawn a little bolder than KanjiVG's own width, to read well at a small size. */
const INK_WIDTH = 6;

/** A kana drawn from its KanjiVG strokes, showing only the first `shown` (in stroke order). */
export function StrokeKana({ kana, shown, className = "" }: { kana: string; shown: number; className?: string }) {
  return <svg viewBox={`0 0 ${STROKE_BOX} ${STROKE_BOX}`} className={className} aria-hidden="true">
    {strokePathsOf(kana).slice(0, shown).map((path, index) =>
      <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth={INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" />)}
  </svg>;
}

/** Characters drawn one after another, sharing `drawn` strokes between them in order (for word attacks). */
export function StrokeWord({ characters, drawn, className }: { characters: readonly string[]; drawn: number; className?: string }) {
  const shownPerCharacter = strokesPerCharacter(characters, drawn);
  return <>{characters.map((character, index) =>
    <StrokeKana key={index} kana={character} shown={shownPerCharacter[index] ?? 0} className={className} />)}</>;
}
