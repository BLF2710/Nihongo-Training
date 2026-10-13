// Stroke-order data comes from unmodified KanjiVG files at the revision the site already pins
// (see nihon-web/public/kanjivg/ATTRIBUTION.md). Nothing here authors or alters stroke geometry.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const KANJIVG_REVISION = "422b5538595676da918c288a4230cb5e22a1ee7e";
export const KANJIVG_SOURCE = `https://raw.githubusercontent.com/KanjiVG/kanjivg/${KANJIVG_REVISION}`;
const fileName = character => `${character.codePointAt(0).toString(16).padStart(5, "0")}.svg`;
export const svgDirectory = root => join(root, "nihon-web/public/kanjivg");
export const strokesFile = root => join(root, "nihon-web/src/data/kanjiStrokes.json");

/** Ordered stroke paths of a KanjiVG file, after checking it is the right character with strokes numbered 1..n. */
export function extractStrokes(svg, character) {
  if (!svg.includes(`kvg:element="${character}"`)) throw new Error(`${character}: the KanjiVG file is for a different character`);
  const strokes = [...svg.matchAll(/<path\s+id="[^"]+-s(\d+)"[^>]*?\sd="([^"]+)"/g)];
  if (!strokes.length || strokes.some((stroke, index) => Number(stroke[1]) !== index + 1)) throw new Error(`${character}: stroke numbering in the KanjiVG file is not sequential`);
  return strokes.map(stroke => stroke[2]);
}

/** The character's KanjiVG file from disk, downloading it once (unless `offline`). Null when it is not available. */
export async function loadSvg(root, character, { offline = false } = {}) {
  const path = join(svgDirectory(root), fileName(character));
  if (existsSync(path)) return { svg: readFileSync(path, "utf8"), downloaded: false };
  if (offline) return null;
  const response = await fetch(`${KANJIVG_SOURCE}/kanji/${fileName(character)}`, { signal: AbortSignal.timeout(20000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`KanjiVG answered ${response.status} for ${character}`);
  const svg = await response.text();
  extractStrokes(svg, character);               // never keep a file that fails the checks
  mkdirSync(svgDirectory(root), { recursive: true });
  writeFileSync(path, svg);
  return { svg, downloaded: true };
}

/**
 * Rebuilds kanjiStrokes.json for every kanji in the catalog. A kanji without a usable file is left out
 * (the site then shows no stroke order for it) and reported; a stroke count that disagrees with the
 * dictionary is an error.
 */
export async function buildStrokeData(root, catalogKanji, options) {
  const paths = {}, missing = [];
  for (const kanji of catalogKanji) {
    const loaded = await loadSvg(root, kanji.character, options);
    if (!loaded) { missing.push(kanji.character); continue; }
    const strokes = extractStrokes(loaded.svg, kanji.character);
    if (strokes.length !== kanji.strokeCount) throw new Error(`${kanji.character}: KanjiVG has ${strokes.length} strokes but the dictionary says ${kanji.strokeCount}`);
    paths[kanji.character] = strokes;
  }
  return { data: { revision: KANJIVG_REVISION, source: KANJIVG_SOURCE, license: "CC BY-SA 3.0", copyright: "Ulrich Apel and KanjiVG contributors", paths }, missing };
}

export function writeStrokeData(root, data) {
  mkdirSync(dirname(strokesFile(root)), { recursive: true });
  writeFileSync(strokesFile(root), `${JSON.stringify(data, null, 2)}\n`);
}
