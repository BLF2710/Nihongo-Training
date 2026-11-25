#!/usr/bin/env node
// Imports the English course (docs/curriculum/english/<level>/blueprint.ts and unit-<n>.ts) into the site's data:
//
//   node --experimental-strip-types scripts/import-english-course.ts [--dry-run]    (npm run course:import-english)
//
// The whole course is rebuilt from its sources every time. Nothing is written unless every source passes
// (scripts/english-course/validate.ts); a unit goes live once its source is in.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ENGLISH_LEVELS } from "../shared/course/english/schema.ts";
import { buildEnglishCourse } from "./english-course/build.ts";
import type { LevelBlueprint, UnitSource } from "./english-course/source.ts";

class EnglishSourceError extends Error {
  constructor(file: string, problem: string) { super(`${file}: ${problem}`); this.name = "EnglishSourceError"; }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "docs/curriculum/english");
const OUTPUT = {
  units: join(root, "shared/course/english/units.json"),
  lessons: join(root, "shared/course/english/lessons.json"),
  assessments: join(root, "nihon-api/src/data/imported-english-assessments.json"),   // answer keys stay on the server
};
const UNIT_FILE = /^unit-\d+\.ts$/;

/** The export `name` of a source module; the sources are typed, so only its presence is checked here. */
async function exportOf<T>(file: string, name: string): Promise<T> {
  const module: Record<string, unknown> = await import(pathToFileURL(file).href);
  if (!(name in module)) throw new EnglishSourceError(file, `has no export "${name}"`);
  return module[name] as T;   // the module is TypeScript written against source.ts; buildEnglishCourse validates it
}

async function readSources(): Promise<{ blueprints: LevelBlueprint[]; units: UnitSource[] }> {
  const levels = ENGLISH_LEVELS.map(level => ({ level, folder: join(sourceRoot, level.toLowerCase()) })).filter(({ folder }) => existsSync(folder));
  const blueprints = await Promise.all(levels.map(({ folder }) => exportOf<LevelBlueprint>(join(folder, "blueprint.ts"), "blueprint")));
  const unitFiles = levels.flatMap(({ folder }) => readdirSync(folder).filter(name => UNIT_FILE.test(name)).map(name => join(folder, name)));
  const units = await Promise.all(unitFiles.map(file => exportOf<UnitSource>(file, "unit")));
  return { blueprints, units };
}

const writeJson = (path: string, data: unknown) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`); };

const { blueprints, units } = await readSources();
const { course, errors } = buildEnglishCourse(blueprints, units);
if (errors.length) {
  console.error(`Nothing imported. ${errors.length} problem(s):\n${errors.map(error => `  - ${error}`).join("\n")}`);
  process.exit(1);
}
const live = course.units.filter(unit => unit.published);
console.log(`English course: ${course.units.length} units planned, ${live.length} live (${live.map(unit => unit.id).join(", ") || "none"}), ${course.lessons.length} lessons.`);
if (process.argv.includes("--dry-run")) process.exit(0);
writeJson(OUTPUT.units, course.units);
writeJson(OUTPUT.lessons, course.lessons);
writeJson(OUTPUT.assessments, course.assessments);
console.log("Written: shared/course/english/units.json, lessons.json and nihon-api/src/data/imported-english-assessments.json.");
