// Grading a traced kana against its KanjiVG strokes. Pure geometry: the screen samples the stroke paths and the
// pointer into points in KanjiVG's 109-unit box, and this compares them.

export type Point = { readonly x: number; readonly y: number };
export type Stroke = readonly Point[];
export type TraceResult =
  | { status: "accepted" }
  | { status: "stroke-count"; expected: number; drawn: number }
  | { status: "stroke-shape"; strokeIndex: number };

/** KanjiVG draws every character in a 109 × 109 box. */
export const STROKE_BOX = 109;
/** Points compared per stroke; both strokes are resampled to this many, evenly spaced along their length. */
export const RESAMPLE_POINTS = 24;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** `count` points evenly spaced along the stroke, from its start to its end. */
export function resample(stroke: Stroke, count = RESAMPLE_POINTS): Point[] {
  if (!stroke.length) return [];
  const lengths = stroke.slice(1).map((point, index) => distance(stroke[index], point));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total === 0) return Array.from({ length: count }, () => stroke[0]);
  const points: Point[] = [];
  let segment = 0, walked = 0;
  for (let index = 0; index < count; index++) {
    const target = (total * index) / (count - 1);
    while (segment < lengths.length - 1 && walked + lengths[segment] < target) walked += lengths[segment++];
    const from = stroke[segment], to = stroke[segment + 1], share = lengths[segment] ? (target - walked) / lengths[segment] : 0;
    const clamped = Math.min(1, Math.max(0, share));
    points.push({ x: from.x + (to.x - from.x) * clamped, y: from.y + (to.y - from.y) * clamped });
  }
  return points;
}

/** The average distance between matching points of two strokes. Drawing a stroke backwards scores badly. */
export function strokeDistance(expected: Stroke, drawn: Stroke): number {
  const a = resample(expected), b = resample(drawn);
  if (!a.length || !b.length) return Infinity;
  return a.reduce((sum, point, index) => sum + distance(point, b[index]), 0) / a.length;
}

/** Accepted when the strokes are drawn in the right number, order and direction, each within `tolerance` units. */
export function gradeTrace(expected: readonly Stroke[], drawn: readonly Stroke[], tolerance: number): TraceResult {
  if (drawn.length !== expected.length) return { status: "stroke-count", expected: expected.length, drawn: drawn.length };
  const strokeIndex = expected.findIndex((stroke, index) => strokeDistance(stroke, drawn[index]) > tolerance);
  return strokeIndex === -1 ? { status: "accepted" } : { status: "stroke-shape", strokeIndex };
}
