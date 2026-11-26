import { enrollSrsItems } from "../api/srs";
import type { CourseUnit } from "../api/units";
import { ENGLISH_LESSONS } from "../data/englishCourse";
import { getUserHandle } from "./authStorage";
import { englishDeckItemIds } from "./englishStudy";

const syncedKey = () => `srs-deck-english:${getUserHandle() ?? ""}`;

const completedEnglishLessonIds = (units: readonly CourseUnit[]) =>
  new Set(units.flatMap(unit => unit.lessons.filter(lesson => lesson.completed && lesson.id.startsWith("english-")).map(lesson => lesson.id)));

/**
 * Adds the words of every completed English lesson to the English flashcard deck. Sent again only when the set of
 * completed lessons changes (remembered in this browser; the server ignores cards it already has).
 */
export async function syncEnglishDeck(units: readonly CourseUnit[]): Promise<number> {
  const completed = completedEnglishLessonIds(units);
  const fingerprint = [...completed].sort().join(",");
  let synced: string | null = null;
  try { synced = localStorage.getItem(syncedKey()); } catch { /* treated as never synced */ }
  if (!completed.size || synced === fingerprint) return 0;
  const items = englishDeckItemIds(ENGLISH_LESSONS, completed).map(itemId => ({ itemType: "vocabulary" as const, itemId }));
  const added = await enrollSrsItems(items);
  try { localStorage.setItem(syncedKey(), fingerprint); } catch { /* the next visit sends the deck again */ }
  return added;
}
