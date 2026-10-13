#!/usr/bin/env node
// Pulls what the site needs for the kanji a blueprint schedules, before any lesson is imported:
//   - dictionary facts (meanings, readings, stroke count) from kanjiapi.dev  -> shared/course/kanji-facts.json
//   - the stroke-order file from KanjiVG at the site's pinned revision       -> nihon-web/public/kanjivg/
// The kanji only appear on the site when the lesson that introduces them is imported; the importer then
// reads these local copies, so importing works without a connection.
//
//   node scripts/fetch-kanji-assets.mjs docs/curriculum/blueprint-n5.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractStrokes, loadSvg } from "./course-import/strokes.mjs";

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));
const blueprints = process.argv.slice(2);
if (!blueprints.length) { console.error("Usage: node scripts/fetch-kanji-assets.mjs <blueprint.json>..."); process.exit(1); }

const factsFile = join(root, "shared/course/kanji-facts.json");
const facts = existsSync(factsFile) ? JSON.parse(readFileSync(factsFile, "utf8")) : {};
const catalog = JSON.parse(readFileSync(join(root, "shared/kanji.json"), "utf8"));
const scheduled = [...new Set(blueprints.flatMap(file => JSON.parse(readFileSync(file, "utf8")).units.flatMap(unit => unit.lessons.flatMap(lesson => lesson.kanji ?? []))))];
const wanted = scheduled.filter(character => !catalog.kanji.some(kanji => kanji.character === character));

const problems = [];
let fetchedFacts = 0, downloaded = 0;
for (const character of wanted) {
  try {
    if (!facts[character]) {
      const source = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(character)}`;
      const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`kanjiapi.dev answered ${response.status}`);
      const entry = await response.json();
      if (entry.kanji !== character) throw new Error("the dictionary returned a different character");
      facts[character] = { meanings: entry.meanings, onyomi: entry.on_readings, kunyomi: entry.kun_readings, strokeCount: entry.stroke_count, source };
      fetchedFacts++;
    }
    const loaded = await loadSvg(root, character);
    if (!loaded) throw new Error("KanjiVG has no stroke-order file at the pinned revision");
    if (loaded.downloaded) downloaded++;
    const strokes = extractStrokes(loaded.svg, character).length;
    if (strokes !== facts[character].strokeCount) throw new Error(`KanjiVG has ${strokes} strokes but the dictionary says ${facts[character].strokeCount}`);
  } catch (error) { problems.push(`${character}: ${error.message}`); }
}
mkdirSync(dirname(factsFile), { recursive: true });
writeFileSync(factsFile, `${JSON.stringify(facts, null, 2)}\n`);

console.log(`${scheduled.length} kanji scheduled, ${scheduled.length - wanted.length} already on the site, ${wanted.length} prepared.`);
console.log(`Dictionary entries fetched now: ${fetchedFacts}. Stroke-order files downloaded now: ${downloaded}.`);
if (problems.length) { console.error(`\n${problems.length} problem(s):\n${problems.map(problem => `  x ${problem}`).join("\n")}`); process.exit(1); }
console.log("Every prepared kanji has dictionary facts and a stroke-order file whose stroke count matches.");
