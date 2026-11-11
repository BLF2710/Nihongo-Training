import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { sampleStrokes, strokePathsOf } from "../../lib/kanaWilds/strokeSamples";
import { STROKE_BOX, gradeTrace } from "../../lib/kanaWilds/tracing";
import type { Point, TraceResult } from "../../lib/kanaWilds/tracing";
import type { WildKana } from "../../lib/kanaWilds/gojuon";
import { shuffle } from "../../lib/random";
import { choiceButton, primaryButton, secondaryButton } from "./styles";

/** Canvas pixels per KanjiVG unit, for a sharp line. */
const CANVAS_SCALE = 4;
const INK_WIDTH = 4 * CANVAS_SCALE;
const INK_COLOUR = "#047857";
/** The strokes the kana has shown, drawn under the learner's ink: clearly visible, but grey so the green ink stands out. */
const GUIDE_STROKE = { colour: "#94a3b8", width: 5 } as const;
const HINT_STROKE = { colour: "#f59e0b", width: 5 } as const;

type Props = {
  enemy: WildKana; shownStrokes: number; tolerance: number; chance: number; triesLeft: number; random: () => number;
  onAttempt: (isAccepted: boolean) => void; onCancel: () => void;
};

function describeMiss(result: TraceResult): string {
  if (result.status === "stroke-count") return `It has ${result.expected} strokes; you drew ${result.drawn}.`;
  if (result.status === "stroke-shape") return `Stroke ${result.strokeIndex + 1} went astray. Check its order and direction.`;
  return "";
}

/** Catching: trace the exhausted kana stroke by stroke, in the right order and direction. */
/**
 * Catching: trace the wild kana stroke by stroke. Only the strokes it has shown are drawn as a guide; the rest come
 * from memory. A good trace then catches it at the catch chance, which rises as it weakens.
 */
export function CatchPanel({ enemy, shownStrokes, tolerance, chance, triesLeft, random, onAttempt, onCancel }: Props) {
  const paths = strokePathsOf(enemy.kana);
  const expected = useMemo(() => sampleStrokes(paths), [paths]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Point[][]>([]);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isHintShown, setIsHintShown] = useState(false);
  // The hint shows the first stroke still hidden, or the first stroke once all are shown.
  const hintIndex = shownStrokes < paths.length ? shownStrokes : 0;
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  const toBox = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * STROKE_BOX, y: ((event.clientY - rect.top) / rect.height) * STROKE_BOX };
  };
  const ink = () => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return null;
    Object.assign(context, { lineWidth: INK_WIDTH, lineCap: "round", lineJoin: "round", strokeStyle: INK_COLOUR });
    return context;
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    strokesRef.current = [...strokesRef.current, [toBox(event)]];
    setStrokeCount(strokesRef.current.length);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = strokesRef.current.at(-1);
    if (!event.isPrimary || !stroke || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const from = stroke[stroke.length - 1], to = toBox(event);
    stroke.push(to);
    const context = ink();
    context?.beginPath(); context?.moveTo(from.x * CANVAS_SCALE, from.y * CANVAS_SCALE); context?.lineTo(to.x * CANVAS_SCALE, to.y * CANVAS_SCALE); context?.stroke();
  };
  const stop = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    setStrokeCount(0);
  };
  const [miss, setMiss] = useState("");
  const submit = () => {
    const result = gradeTrace(expected, strokesRef.current, tolerance);
    setMiss(describeMiss(result));
    clear();
    onAttempt(result.status === "accepted");
  };

  if (isKeyboardMode) return <StrokeCountQuestion strokeCount={paths.length} random={random} onAnswer={onAttempt} onBack={() => setIsKeyboardMode(false)} />;

  return <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
    <div className="relative mx-auto aspect-square w-[min(13rem,28dvh)] overflow-hidden rounded-2xl border-2 border-emerald-700 bg-white">
      <svg aria-hidden="true" viewBox={`0 0 ${STROKE_BOX} ${STROKE_BOX}`} className="pointer-events-none absolute inset-0 h-full w-full">
        {paths.map((path, index) => {
          const isHint = isHintShown && index === hintIndex;
          if (index >= shownStrokes && !isHint) return null;
          const look = isHint ? HINT_STROKE : GUIDE_STROKE;
          return <path key={index} d={path} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={look.width} stroke={look.colour} />;
        })}
      </svg>
      <canvas ref={canvasRef} width={STROKE_BOX * CANVAS_SCALE} height={STROKE_BOX * CANVAS_SCALE} onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerCancel={stop}
        className="relative block h-full w-full cursor-crosshair touch-none" aria-label="Tracing area: trace the kana stroke by stroke" />
    </div>
    <div>
      <p className="font-bold">Trace the kana to catch it <span className="ml-1 rounded-md bg-emerald-100 px-1.5 text-sm text-emerald-900">Catch chance {Math.round(chance * 100)}%</span></p>
      <p className="mt-1 text-sm text-gray-600">Draw each stroke in order, in its direction{shownStrokes < paths.length ? `; ${paths.length - shownStrokes} still hidden, so draw them from memory` : ""}. {triesLeft} {triesLeft === 1 ? "try" : "tries"} left before it flees.</p>
      <p role="status" className="text-sm text-amber-800 empty:hidden">{miss}</p>
      <p className="text-xs text-gray-500">Strokes drawn: {strokeCount} / {paths.length}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={`${primaryButton} px-4 text-sm`} disabled={strokeCount === 0} onClick={submit}>Throw!</button>
        <button type="button" className={`${secondaryButton} px-3 text-sm`} onClick={clear}>Clear</button>
        <button type="button" className={`${secondaryButton} px-3 text-sm`} aria-pressed={isHintShown} onClick={() => setIsHintShown(value => !value)}>{shownStrokes < paths.length ? "Show a hidden stroke" : "Show first stroke"}</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 text-sm">
        <button type="button" className="font-semibold text-emerald-800 underline" onClick={() => setIsKeyboardMode(true)}>Can't draw? Answer instead</button>
        <button type="button" className="font-semibold text-gray-600 underline" onClick={onCancel}>Back to the battle</button>
      </div>
    </div>
  </div>;
}

/** The catch without drawing, for keyboard and screen-reader players: how many strokes does the kana have? */
function StrokeCountQuestion({ strokeCount, random, onAnswer, onBack }: { strokeCount: number; random: () => number; onAnswer: (isRight: boolean) => void; onBack: () => void }) {
  const choices = useMemo(() => shuffle([...new Set([strokeCount, strokeCount + 1, Math.max(1, strokeCount - 1), strokeCount + 2])], random), [strokeCount, random]);
  return <div role="group" aria-labelledby="stroke-count-prompt">
    <p id="stroke-count-prompt" className="font-bold">How many strokes does the kana have?</p>
    <div className="mt-3 grid grid-cols-4 gap-2">{choices.map(choice =>
      <button key={choice} type="button" className={`${choiceButton} text-lg`} onClick={() => onAnswer(choice === strokeCount)}>{choice}</button>)}</div>
    <button type="button" className="mt-3 text-sm font-semibold text-emerald-800 underline" onClick={onBack}>Trace it instead</button>
  </div>;
}
