import { KANJI, KANJI_FORMS } from "./kanji";
import { JAPANESE_STUDY_UNITS } from "./japaneseStudyUnits";
import type { StudyCard } from "../components/VocabularyFlashcard";

// Join the existing vocabulary, never maintain another word/meaning catalog.
const vocabulary = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.flatMap(lesson => lesson.vocabulary));
export function kanjiExamples(kanjiId: string) {
  return KANJI_FORMS.filter(form => form.kanjiIds.includes(kanjiId)).flatMap(form => {
    const word = vocabulary.find(item => form.vocabularyIds.includes(item.id));
    return word ? [{ id: form.id, written: form.written, reading: form.reading, meaning: word.meaning,
      href: `/vocabulary?unit=${encodeURIComponent(word.unitId)}&lesson=${encodeURIComponent(word.lessonId)}` }] : [];
  });
}
export function kanjiStudyCards(ids: string[], kind: "meaning" | "reading" | "vocabulary"): StudyCard[] {
  if (kind === "meaning") return KANJI.filter(item => ids.includes(item.id)).map(item => ({
    id: item.id, front: item.character, back: item.meanings.join(" · "), label: "Kanji → Meaning",
    audioText: item.character,
  }));
  return KANJI_FORMS.filter(form => form.kanjiIds.some(id => ids.includes(id))).flatMap(form => {
    const word = vocabulary.find(item => form.vocabularyIds.includes(item.id));
    if (!word) return [];
    return [{ id: form.id, front: kind === "reading" ? form.written : word.meaning,
      frontLang: kind === "reading" ? "ja" : "en", back: kind === "reading" ? form.reading : `${form.written} · ${form.reading}`,
      label: kind === "reading" ? "Word → Reading" : "Meaning → Vocabulary", audioText: form.reading }];
  });
}
