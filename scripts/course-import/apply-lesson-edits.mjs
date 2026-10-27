#!/usr/bin/env node
// Writes lesson edits exported from the admin area (Lesson editor → Export published edits) into the course files,
// so they become the built-in version. After deploying, use "Restore original" in the editor for those lessons.
//
//   node scripts/course-import/apply-lesson-edits.mjs <export.json> [--dry-run]
//
// Lessons of Units 1–3 live in nihon-web/src/data (TypeScript) and are listed for editing by hand.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const EDITABLE_FIELDS = ["title", "titleJp", "objectives", "vocabulary", "concept", "examples", "dialogue", "grammar", "reading", "practice", "challenge"];

/** Returns the course lessons with the edits applied, and the edited lesson ids that are not in the file. */
export function applyLessonEdits(lessons, edits) {
  const missing = Object.keys(edits).filter(id => !lessons.some(lesson => lesson.id === id));
  const updated = lessons.map(lesson => {
    const edit = edits[lesson.id];
    if (!edit) return lesson;
    const next = { ...lesson };
    for (const field of EDITABLE_FIELDS) {
      if (edit[field] === undefined) delete next[field];
      else next[field] = edit[field];
    }
    return next;
  });
  return { lessons: updated, applied: Object.keys(edits).filter(id => !missing.includes(id)), missing };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [file] = process.argv.slice(2).filter(arg => !arg.startsWith("--"));
  if (!file) { console.error("Usage: node scripts/course-import/apply-lesson-edits.mjs <export.json> [--dry-run]"); process.exit(1); }
  const lessonsFile = join(dirname(fileURLToPath(import.meta.url)), "../../shared/course/lessons.json");
  const exported = JSON.parse(readFileSync(resolve(file), "utf8"));
  if (typeof exported?.lessons !== "object" || exported.lessons === null) { console.error(`${file}: not a lesson edit export`); process.exit(1); }
  const result = applyLessonEdits(JSON.parse(readFileSync(lessonsFile, "utf8")), exported.lessons);
  console.log(`Applied: ${result.applied.length ? result.applied.join(", ") : "none"}`);
  if (result.missing.length) console.log(`Edit by hand (Units 1–3 in nihon-web/src/data): ${result.missing.join(", ")}`);
  if (process.argv.includes("--dry-run")) console.log("Dry run: nothing written.");
  else if (result.applied.length) writeFileSync(lessonsFile, `${JSON.stringify(result.lessons, null, 2)}\n`);
}
