#!/usr/bin/env node
// Imports generated course content (blueprints, lessons, unit assessments) into the site's data files.
//
//   node scripts/import-course.mjs <file-or-folder>... [--dry-run] [--offline]
//   node scripts/import-course.mjs                      (no files: shows what is registered and what is missing)
//
// Nothing is written unless every file passes. A unit goes live on the site only once all six lessons and its
// assessment are imported. Kanji facts come from kanjiapi.dev and stroke order from KanjiVG (prepared copies are used when present);
// --offline imports lessons without touching the kanji catalog (re-run later without it to add the kanji).
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { kanjiIn, kindOf, publishableUnitIds, readBlueprint, toReading, toStoredLesson, validateAssessment, validateLesson } from "./course-import/rules.mjs";
import { buildStrokeData, writeStrokeData } from "./course-import/strokes.mjs";

const args = process.argv.slice(2);
const flag = name => args.includes(name);
const option = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const root = resolve(option("--root") ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
const inputs = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--root");
const dryRun = flag("--dry-run"), offline = flag("--offline");

const FILES = {
  units: join(root, "shared/course/units.json"),
  lessons: join(root, "shared/course/lessons.json"),
  assessments: join(root, "nihon-api/src/data/imported-assessments.json"),   // answer keys stay on the server side
  kanji: join(root, "shared/kanji.json"),
  facts: join(root, "shared/course/kanji-facts.json"),   // prepared ahead by scripts/fetch-kanji-assets.mjs
};
const readJson = (path, fallback) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
const writeJson = (path, data) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`); };

let units = readJson(FILES.units, []);
let lessons = readJson(FILES.lessons, []);
let assessments = readJson(FILES.assessments, []);
const catalog = readJson(FILES.kanji, null);
const problems = [], notes = [];
const fail = (file, messages) => messages.forEach(message => problems.push(`${file}: ${message}`));
const warn = (file, messages) => messages.forEach(message => notes.push(`${file}: ${message}`));

// ---- Collect input files
const listFiles = path => statSync(path).isDirectory() ? readdirSync(path).sort().flatMap(name => listFiles(join(path, name))) : path.endsWith(".json") ? [path] : [];
const documents = [];
for (const input of inputs) {
  if (!existsSync(input)) { fail(input, ["file or folder not found"]); continue; }
  for (const file of listFiles(input)) {
    try { const data = JSON.parse(readFileSync(file, "utf8")); documents.push({ file, data, kind: kindOf(data) }); }
    catch (error) { fail(file, [`not valid JSON (${error.message})`]); }
  }
}
for (const document of documents.filter(item => item.kind === "unknown")) fail(document.file, ["not a blueprint, lesson, or assessment"]);

// ---- Blueprints register units and their fixed lesson ids
for (const { file, data } of documents.filter(item => item.kind === "blueprint")) {
  const result = readBlueprint(data);
  fail(file, result.errors);
  for (const unit of result.units) {
    const existing = units.find(item => item.id === unit.id);
    if (existing && existing.lessonIds.join() !== unit.lessonIds.join() && lessons.some(lesson => lesson.unitId === unit.id)) fail(file, [`${unit.id}: lesson ids cannot change after lessons have been imported`]);
    units = [...units.filter(item => item.id !== unit.id), unit];
  }
}
units.sort((a, b) => a.sequence - b.sequence);
// Falls back to the id prefix so an unknown lesson id is reported against its unit rather than as an unknown unit.
const unitOf = lessonId => units.find(unit => unit.lessonIds.includes(lessonId)) ?? units.find(unit => String(lessonId).startsWith(`${unit.id}-`));

// ---- Lessons, in course order so a review lesson is checked against the lessons before it
const kanjiByLesson = new Map();      // lesson id -> { introduced: [char], forms: [{ written, reading }] }
const lessonDocuments = documents.filter(item => item.kind === "lesson")
  .sort((a, b) => (unitOf(a.data.id)?.sequence ?? 0) - (unitOf(b.data.id)?.sequence ?? 0) || (a.data.lesson_number ?? 0) - (b.data.lesson_number ?? 0));
for (const { file, data } of lessonDocuments) {
  const unit = unitOf(data.id);
  const position = unit ? unit.lessonIds.indexOf(data.id) : -1;
  const earlierLessons = unit ? lessons.filter(lesson => unit.lessonIds.indexOf(lesson.id) >= 0 && unit.lessonIds.indexOf(lesson.id) < position) : [];
  const kanjiTaughtElsewhere = new Set([
    ...(catalog?.lessonIntroductions ?? []).filter(item => item.lessonId !== data.id).flatMap(item => item.introducedKanji.map(id => catalog.kanji.find(kanji => kanji.id === id)?.character)),
    ...[...kanjiByLesson].filter(([lessonId]) => lessonId !== data.id).flatMap(([, value]) => value.introduced),
  ]);
  const result = validateLesson(data, { unit, earlierLessons, kanjiTaughtElsewhere });
  fail(file, result.errors); warn(file, result.warnings);
  if (result.errors.length) continue;
  lessons = [...lessons.filter(lesson => lesson.id !== data.id), toStoredLesson(data, unit)];
  kanjiByLesson.set(data.id, {
    introduced: (data.introduced_kanji ?? []).map(kanji => kanji.char),
    forms: (data.kanji_form ?? []).map(form => ({ written: form.word_japanese, reading: form.word_reading })),
  });
}
const lessonOrder = lesson => (unitOf(lesson.id)?.sequence ?? 0) * 100 + lesson.lessonNumber;
lessons.sort((a, b) => lessonOrder(a) - lessonOrder(b));

// ---- Assessments
for (const { file, data } of documents.filter(item => item.kind === "assessment")) {
  const result = validateAssessment(data, units.find(unit => unit.assessmentId === data.id));
  fail(file, result.errors); warn(file, result.warnings);
  if (!result.errors.length) assessments = [...assessments.filter(item => item.id !== data.id), { id: data.id, passPercent: data.passPercent, questions: data.questions }];
}

// ---- Kanji catalog: facts come from the dictionary source, never from the generated lesson
const hex = character => character.codePointAt(0).toString(16);
const fetched = new Map();
const preparedFacts = readJson(FILES.facts, {});
async function kanjiFacts(character) {
  if (preparedFacts[character]) return preparedFacts[character];
  const path = `kanji/${encodeURIComponent(character)}`;
  const entry = await dictionary(path);
  return { meanings: entry.meanings, onyomi: entry.on_readings, kunyomi: entry.kun_readings, strokeCount: entry.stroke_count, source: `https://kanjiapi.dev/v1/${path}` };
}
async function dictionary(path) {
  if (!fetched.has(path)) {
    const response = await fetch(`https://kanjiapi.dev/v1/${path}`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`kanjiapi.dev answered ${response.status} for ${decodeURIComponent(path)}`);
    fetched.set(path, await response.json());
  }
  return fetched.get(path);
}
let kanjiChanged = false;
if (kanjiByLesson.size && offline) notes.push("Kanji catalog left unchanged (--offline). Re-run without --offline to add this content's kanji.");
if (kanjiByLesson.size && !offline && !problems.length) {
  if (!catalog) problems.push(`${FILES.kanji}: kanji catalog not found`);
  else try {
    for (const [lessonId, { introduced, forms }] of kanjiByLesson) {
      for (const character of introduced) {
        if (catalog.kanji.some(kanji => kanji.character === character)) continue;
        const facts = await kanjiFacts(character);
        catalog.kanji.push({ id: `kanji-${hex(character)}`, character, meanings: facts.meanings, onyomi: facts.onyomi, kunyomi: facts.kunyomi, jlptLevel: null, strokeCount: facts.strokeCount, source: facts.source });
        kanjiChanged = true;
      }
      const introducedIds = introduced.map(character => `kanji-${hex(character)}`);
      if (introducedIds.length) { catalog.lessonIntroductions = [...catalog.lessonIntroductions.filter(item => item.lessonId !== lessonId), { lessonId, introducedKanji: introducedIds }]; kanjiChanged = true; }
      for (const { written, reading } of forms) {
        if (catalog.vocabularyForms.some(form => form.written === written && form.reading === reading && form.vocabularyIds.some(id => id.startsWith(`${lessonId}:`)))) continue;
        const characters = kanjiIn(written);
        const untaught = characters.filter(character => !catalog.kanji.some(kanji => kanji.character === character));
        if (untaught.length) { notes.push(`${lessonId}: kanji spelling ${written} skipped — ${untaught.join(" ")} not introduced yet`); continue; }
        const vocabularyIds = lessons.flatMap(lesson => lesson.vocabulary.filter(item => toReading(item[0]) === reading).map(item => `${lesson.id}:${item[0]}`));
        if (!vocabularyIds.length) { notes.push(`${lessonId}: kanji spelling ${written} skipped — no taught vocabulary item is written "${reading}"`); continue; }
        let source = null;
        for (const character of characters) {
          const path = `words/${encodeURIComponent(character)}`;
          if ((await dictionary(path)).some(word => word.variants.some(variant => variant.written === written && variant.pronounced === reading))) { source = `https://kanjiapi.dev/v1/${path}`; break; }
        }
        if (!source) { notes.push(`${lessonId}: kanji spelling ${written} (${reading}) skipped — the dictionary source has no entry with this exact spelling and reading`); continue; }
        const existing = catalog.vocabularyForms.find(form => form.written === written && form.reading === reading);
        if (existing) existing.vocabularyIds = [...new Set([...existing.vocabularyIds, ...vocabularyIds])];
        else {
          const base = `form-${characters.map(hex).join("-")}`;
          let id = base;
          for (let suffix = 2; catalog.vocabularyForms.some(form => form.id === id); suffix++) id = `${base}-${suffix}`;
          catalog.vocabularyForms.push({ id, written, reading, vocabularyIds, kanjiIds: characters.map(character => `kanji-${hex(character)}`), source });
        }
        kanjiChanged = true;
      }
    }
  } catch (error) { problems.push(`Kanji catalog: ${error.message}. Check the connection, or import with --offline and add kanji later.`); }
}

// ---- Stroke order for the catalog's kanji, from unmodified KanjiVG files
let strokeData = null;
if (kanjiChanged && !problems.length) {
  try {
    const built = await buildStrokeData(root, catalog.kanji, { offline });
    strokeData = built.data;
    if (built.missing.length) notes.push(`No stroke-order file for ${built.missing.join(" ")}; ${built.missing.length === 1 ? "it" : "they"} will show without stroke order.`);
  } catch (error) { problems.push(`Stroke order: ${error.message}`); }
}

// ---- Publish complete units, report, and write
const published = publishableUnitIds(units, new Set(lessons.map(lesson => lesson.id)), new Set(assessments.map(item => item.id)));
units = units.map(unit => ({ ...unit, published: published.includes(unit.id) }));

const counts = kind => documents.filter(item => item.kind === kind).length;
if (documents.length) console.log(`Read ${counts("blueprint")} blueprint(s), ${counts("lesson")} lesson(s), ${counts("assessment")} assessment(s).`);
console.log(units.length ? "Units:" : "No units are registered yet. Import a blueprint first.");
for (const unit of units) {
  const have = unit.lessonIds.filter(id => lessons.some(lesson => lesson.id === id)).length;
  const hasAssessment = assessments.some(item => item.id === unit.assessmentId);
  console.log(`  ${unit.published ? "LIVE   " : "pending"}  ${unit.id}  lessons ${have}/6, assessment ${hasAssessment ? "yes" : "no"}`);
}
if (notes.length) console.log(`\nNotes (${notes.length}):\n${notes.map(note => `  - ${note}`).join("\n")}`);
if (problems.length) {
  console.error(`\nNot imported — ${problems.length} problem(s):\n${problems.map(problem => `  x ${problem}`).join("\n")}`);
  process.exit(1);
}
if (!documents.length) process.exit(0);
if (dryRun) { console.log("\nDry run: everything passed, nothing was written."); process.exit(0); }
writeJson(FILES.units, units);
writeJson(FILES.lessons, lessons);
writeJson(FILES.assessments, assessments);
if (kanjiChanged) writeJson(FILES.kanji, catalog);
if (strokeData) writeStrokeData(root, strokeData);
console.log(`\nImported. ${published.length} imported unit(s) live on the site.`);
