import { fetchPublishedLessonEdits } from "../api/lessonEdits";
import type { PublishedLessonEdits } from "../api/lessonEdits";
import { applyPublishedLessonEdits } from "../data/lessonEdits";

const CACHE_KEY = "published-lesson-edits-v1";
// The site waits this long for lesson updates before it starts with the last copy it saw (or none).
const WAIT_MS = 2500;

// Only the outer shape is checked: each lesson's content was validated by the server when it was published.
function isPublishedLessonEdits(value: unknown): value is PublishedLessonEdits {
  if (typeof value !== "object" || value === null) return false;
  const { revision, lessons } = value as Record<string, unknown>;
  return typeof revision === "number" && typeof lessons === "object" && lessons !== null && !Array.isArray(lessons);
}

function readCache(): PublishedLessonEdits | null {
  try { const cached: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null"); return isPublishedLessonEdits(cached) ? cached : null; }
  catch { return null; }
}

// Nothing is stored while nothing is published, so most visitors' browsers keep no copy at all.
function writeCache(edits: PublishedLessonEdits) {
  try {
    if (Object.keys(edits.lessons).length) localStorage.setItem(CACHE_KEY, JSON.stringify(edits));
    else localStorage.removeItem(CACHE_KEY);
  }
  catch { /* storage full or blocked: the edits still apply to this visit */ }
}

/** Loads the lesson content published from the admin area and applies it. Never fails: the course files are the fallback. */
export async function loadStartupLessonEdits() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), WAIT_MS);
  try {
    const edits: unknown = await fetchPublishedLessonEdits(controller.signal);
    if (!isPublishedLessonEdits(edits)) throw new TypeError("Unexpected lesson updates response.");
    writeCache(edits);
    applyPublishedLessonEdits(edits);
  } catch (failure) {
    console.warn("Lesson updates could not be loaded; using the last copy.", failure);
    const cached = readCache();
    if (cached) applyPublishedLessonEdits(cached);
  } finally { window.clearTimeout(timer); }
}
