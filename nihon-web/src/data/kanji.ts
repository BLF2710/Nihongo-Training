import catalog from "../../../shared/kanji.json";
import type { VocabularyItem } from "./japaneseUnit1Reference";
export const KANJI = catalog.kanji;
export const KANJI_SOURCE = catalog.source;
export type Kanji = typeof KANJI[number];
export const KANJI_FORMS = catalog.vocabularyForms;
export function vocabularyKanjiForm(item: VocabularyItem) {
  return KANJI_FORMS.find(form => item.kanjiFormId ? form.id === item.kanjiFormId : form.vocabularyIds.includes(item.id));
}
export function introducedKanji(lessonId: string) {
  const ids = catalog.lessonIntroductions.find(item => item.lessonId === lessonId)?.introducedKanji ?? [];
  return KANJI.filter(item => ids.includes(item.id));
}
export function introducingLessons(kanjiId: string) {
  return catalog.lessonIntroductions.filter(item => item.introducedKanji.includes(kanjiId)).map(item => item.lessonId);
}
