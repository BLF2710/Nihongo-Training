import { StudyFlashcards } from "./VocabularyFlashcard";
import { KanjiCard } from "./KanjiCard";
import { kanjiStudyCards } from "../data/kanjiStudyCards";
import { KANJI } from "../data/kanji";

export default function KanjiFlashcards({ kanjiIds }: { kanjiIds: string[] }) {
  return <section aria-label="Kanji study">
    <StudyFlashcards key={kanjiIds.join(':')} cards={kanjiStudyCards(kanjiIds, "meaning")} label="Kanji flashcards"
      renderCard={card => { const kanji = KANJI.find(item => item.id === card.id); return kanji ? <KanjiCard kanji={kanji} /> : null; }} />
  </section>;
}
