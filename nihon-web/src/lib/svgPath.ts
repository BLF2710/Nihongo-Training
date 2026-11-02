// Smooth SVG paths through points (Catmull-Rom curves turned into cubic Béziers).

export type Point = { x: number; y: number };

const round = (value: number) => Math.round(value * 10) / 10;

function curveSegment(p0: Point, p1: Point, p2: Point, p3: Point) {
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  return `C${round(c1.x)},${round(c1.y)} ${round(c2.x)},${round(c2.y)} ${round(p2.x)},${round(p2.y)}`;
}

/** A closed loop through every point. */
export function smoothClosedPath(points: readonly Point[]): string {
  const at = (index: number) => points[(index + points.length) % points.length];
  const segments = points.map((_, index) => curveSegment(at(index - 1), at(index), at(index + 1), at(index + 2)));
  return `M${round(points[0].x)},${round(points[0].y)} ${segments.join(" ")} Z`;
}

/** A line from the first point to the last, through the others. */
export function smoothOpenPath(points: readonly Point[]): string {
  const at = (index: number) => points[Math.min(Math.max(index, 0), points.length - 1)];
  const segments = points.slice(0, -1).map((_, index) => curveSegment(at(index - 1), at(index), at(index + 1), at(index + 2)));
  return `M${round(points[0].x)},${round(points[0].y)} ${segments.join(" ")}`;
}
