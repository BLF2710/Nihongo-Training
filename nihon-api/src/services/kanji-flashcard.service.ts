import * as flashcardRepository from "../repositories/kanji-flashcard.repository";
import { HttpError } from "../utils/http-error";
import { catalog } from "./kanji.service";

/** Room for every kanji in the course, with space for the catalog to grow. */
export const MAX_FLASHCARDS = 500;
const KANJI_IDS = new Set(catalog.kanji.map(kanji => kanji.id));

function requireKanjiId(kanjiId: unknown): string {
  if (typeof kanjiId !== "string" || !KANJI_IDS.has(kanjiId)) throw new HttpError(404, "Kanji not found.");
  return kanjiId;
}

export async function getFlashcards(userId: number) {
  // Kanji removed from the catalog since they were added are left out.
  return { kanjiIds: (await flashcardRepository.listFlashcardKanji(userId)).filter(id => KANJI_IDS.has(id)) };
}

export async function addFlashcard(userId: number, kanjiId: unknown) {
  const id = requireKanjiId(kanjiId);
  if (await flashcardRepository.countFlashcardKanji(userId) >= MAX_FLASHCARDS) throw new HttpError(409, `Your flashcard list is full (${MAX_FLASHCARDS} kanji).`);
  await flashcardRepository.addFlashcardKanji(userId, id);
  return getFlashcards(userId);
}

export async function removeFlashcard(userId: number, kanjiId: unknown) {
  await flashcardRepository.removeFlashcardKanji(userId, requireKanjiId(kanjiId));
  return getFlashcards(userId);
}
