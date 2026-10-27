import { useEffect, useState } from "react";
import { addKanjiFlashcard, fetchKanjiFlashcards, removeKanjiFlashcard } from "../api/kanji";
import { apiErrorMessage } from "../api/errors";

export type KanjiFlashcardList = {
  /** Kanji ids in the learner's list; null while loading. */
  kanjiIds: string[] | null;
  error: string;
  isSaving: boolean;
  add: (kanjiId: string) => Promise<void>;
  remove: (kanjiId: string) => Promise<void>;
};

/** The learner's own kanji flashcard list, saved on their account. */
export function useKanjiFlashcards(): KanjiFlashcardList {
  const [kanjiIds, setKanjiIds] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetchKanjiFlashcards(controller.signal).then(setKanjiIds)
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your flashcard list could not be loaded.")); });
    return () => controller.abort();
  }, []);
  const save = (change: (kanjiId: string) => Promise<string[]>, fallback: string) => async (kanjiId: string) => {
    setIsSaving(true); setError("");
    try { setKanjiIds(await change(kanjiId)); } catch (failure) { setError(apiErrorMessage(failure, fallback)); } finally { setIsSaving(false); }
  };
  return {
    kanjiIds, error, isSaving,
    add: save(addKanjiFlashcard, "The kanji could not be added to your flashcards."),
    remove: save(removeKanjiFlashcard, "The kanji could not be removed from your flashcards."),
  };
}
