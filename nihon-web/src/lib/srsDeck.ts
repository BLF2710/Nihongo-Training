import { enrollSrsItems } from "../api/srs";
import type { SrsItem } from "../api/srs";
import type { CourseUnit } from "../api/units";
import { introducedKanji, KANJI, kanjiLevel } from "../data/kanji";
import type { VocabularyItem } from "../data/japaneseUnit1Reference";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { getUserHandle } from "./authStorage";
import { toPlain } from "./furigana";

/** What a review card shows: the prompt side, and the answer revealed after thinking. */
export type DeckCard = {
  item: SrsItem; front: string; frontLang: "ja"; reading?: string; answer: string; details: string[]; source: string; audioText: string;
};

const LESSONS = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, unitNumber: unit.number })));
const WORDS = new Map<string, { word: VocabularyItem; source: string }>(LESSONS.flatMap(lesson =>
  lesson.vocabulary.map(word => [word.id, { word, source: `Unit ${lesson.unitNumber} · ${lesson.title}` }] as const)));
const KANJI_BY_ID = new Map(KANJI.map(kanji => [kanji.id, kanji]));

/** Words and Kanji from the given completed lessons, in course order. */
export function deckItemsFor(completedLessonIds: ReadonlySet<string>): SrsItem[] {
  const lessons = LESSONS.filter(lesson => completedLessonIds.has(lesson.id));
  const words = lessons.flatMap(lesson => lesson.vocabulary.map(word => ({ itemType: "vocabulary" as const, itemId: word.id })));
  const kanji = [...new Set(lessons.flatMap(lesson => introducedKanji(lesson.id).map(item => item.id)))].map(itemId => ({ itemType: "kanji" as const, itemId }));
  return [...words, ...kanji];
}

/** The card's content, or undefined when the course no longer has the item. */
export function describeCard(item: SrsItem): DeckCard | undefined {
  if (item.itemType === "vocabulary") {
    const found = WORDS.get(item.itemId);
    if (!found) return undefined;
    const { word, source } = found;
    return { item, front: word.japanese, frontLang: "ja", reading: word.romaji, answer: word.meaning, details: word.note ? [word.note] : [], source, audioText: word.audioText ?? toPlain(word.japanese) };
  }
  const kanji = KANJI_BY_ID.get(item.itemId);
  if (!kanji) return undefined;
  const readings = [kanji.onyomi.length ? `On: ${kanji.onyomi.join("、")}` : "", kanji.kunyomi.length ? `Kun: ${kanji.kunyomi.join("、")}` : ""].filter(Boolean);
  const level = kanjiLevel(kanji.id);
  return { item, front: kanji.character, frontLang: "ja", answer: kanji.meanings.join(", "), details: readings, source: level ? `Kanji · ${level}` : "Kanji", audioText: kanji.character };
}

const completedLessonIds = (units: CourseUnit[]) => new Set(units.flatMap(unit => unit.lessons.filter(lesson => lesson.completed).map(lesson => lesson.id)));
const syncedKey = () => `srs-deck:${getUserHandle() ?? ""}`;

/**
 * Adds the words and Kanji of every completed lesson to the review deck. Sent again only when the set of
 * completed lessons changes (remembered in this browser; the server ignores cards it already has).
 */
export async function syncDeck(units: CourseUnit[]): Promise<number> {
  const completed = completedLessonIds(units);
  const fingerprint = [...completed].sort().join(",");
  let synced: string | null = null;
  try { synced = localStorage.getItem(syncedKey()); } catch { /* treated as never synced */ }
  if (!completed.size || synced === fingerprint) return 0;
  const added = await enrollSrsItems(deckItemsFor(completed));
  try { localStorage.setItem(syncedKey(), fingerprint); } catch { /* the next visit sends the deck again */ }
  return added;
}
