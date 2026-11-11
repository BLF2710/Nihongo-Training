import dataset from "../../data/kanaStrokes.json";
import type { Stroke } from "./tracing";

// KanjiVG's stroke paths for each kana, turned into points for the tracing grader. Sampling needs the browser's SVG
// geometry (getPointAtLength), so it lives here, apart from the pure rules.

const PATHS: Readonly<Record<string, readonly string[]>> = dataset.paths;
const SAMPLES_PER_STROKE = 32;
const SVG_NS = "http://www.w3.org/2000/svg";

export const strokePathsOf = (kana: string): readonly string[] => PATHS[kana] ?? [];

export function sampleStrokes(paths: readonly string[]): Stroke[] {
  const element = document.createElementNS(SVG_NS, "path");
  return paths.map(path => {
    element.setAttribute("d", path);
    const length = element.getTotalLength();
    return Array.from({ length: SAMPLES_PER_STROKE }, (_, index) => {
      const point = element.getPointAtLength((length * index) / (SAMPLES_PER_STROKE - 1));
      return { x: point.x, y: point.y };
    });
  });
}
