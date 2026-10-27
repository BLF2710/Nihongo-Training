import { readFileSync } from "node:fs";
import { normalizePath, type Plugin } from "vite";

// Half of the course data (practice, challenge, concept, objectives) is only read by the lesson page. The web
// build keeps the rest of shared/course/lessons.json in the main bundle and moves those fields into one lazily
// loaded chunk per unit. The file itself stays whole: the API, the importer and the scripts read all of it.
export const LESSON_BODY_FIELDS = ["objectives", "concept", "practice", "challenge"] as const;

export const LESSON_BODIES_MODULE = "virtual:course-lesson-bodies";
const UNIT_BODY_PREFIX = "virtual:course-lesson-body/";
const RESOLVED_PREFIX = "\0";

type StoredLesson = { id: string; unitId: string } & Record<string, unknown>;
export type LessonBodies = Record<string, Record<string, unknown>>;
export type SplitLessons = { summaries: Record<string, unknown>[]; bodiesByUnit: Map<string, LessonBodies> };

export class CourseLessonFormatError extends Error {}

function toStoredLesson(value: unknown, index: number): StoredLesson {
  if (typeof value !== "object" || value === null) throw new CourseLessonFormatError(`lessons.json item ${index} is not an object`);
  const { id, unitId } = value as Record<string, unknown>;
  if (typeof id !== "string" || typeof unitId !== "string") throw new CourseLessonFormatError(`lessons.json item ${index} has no id or unitId`);
  return { ...value, id, unitId };
}

export function splitLessons(lessons: unknown): SplitLessons {
  if (!Array.isArray(lessons)) throw new CourseLessonFormatError("lessons.json is not a list");
  const bodiesByUnit = new Map<string, LessonBodies>();
  const summaries = lessons.map(toStoredLesson).map(lesson => {
    const summary: Record<string, unknown> = { ...lesson };
    const body: Record<string, unknown> = {};
    for (const field of LESSON_BODY_FIELDS) { body[field] = lesson[field]; delete summary[field]; }
    bodiesByUnit.set(lesson.unitId, { ...bodiesByUnit.get(lesson.unitId), [lesson.id]: body });
    return summary;
  });
  return { summaries, bodiesByUnit };
}

function bodyLoadersModule(unitIds: string[]): string {
  const entries = unitIds.map(unitId => `  ${JSON.stringify(unitId)}: () => import(${JSON.stringify(UNIT_BODY_PREFIX + unitId)}),`);
  return `export const LESSON_BODY_LOADERS = {\n${entries.join("\n")}\n};\n`;
}

export function courseLessonSplit(lessonsFile: string): Plugin {
  const lessonsId = normalizePath(lessonsFile);
  const read = () => splitLessons(JSON.parse(readFileSync(lessonsFile, "utf8")));
  return {
    name: "course-lesson-split",
    enforce: "pre",
    resolveId(source) {
      return source === LESSON_BODIES_MODULE || source.startsWith(UNIT_BODY_PREFIX) ? RESOLVED_PREFIX + source : null;
    },
    load(id) {
      if (id.split("?")[0] === lessonsId) {
        this.addWatchFile(lessonsFile);
        return JSON.stringify(read().summaries);   // still JSON, so Vite's JSON plugin handles it as before
      }
      if (!id.startsWith(RESOLVED_PREFIX)) return null;
      const source = id.slice(RESOLVED_PREFIX.length);
      if (source === LESSON_BODIES_MODULE) { this.addWatchFile(lessonsFile); return bodyLoadersModule([...read().bodiesByUnit.keys()]); }
      if (!source.startsWith(UNIT_BODY_PREFIX)) return null;
      this.addWatchFile(lessonsFile);
      const unitId = source.slice(UNIT_BODY_PREFIX.length);
      return `export default ${JSON.stringify(read().bodiesByUnit.get(unitId) ?? {})};\n`;
    },
  };
}
