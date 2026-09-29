import { Link } from "react-router-dom";
import { introducedKanji, KANJI, KANJI_SOURCE, vocabularyKanjiForm } from "../data/kanji";
import type { VocabularyItem } from "../data/japaneseUnit1Reference";

export function KanjiAttribution() {
  return <p className="mt-6 text-xs leading-5 text-gray-500">
    Kanji and word spellings: <a href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project" className="underline">KANJIDIC2 / JMdict</a> via <a href="https://kanjiapi.dev" className="underline">kanjiapi.dev</a>.
    {" "}{KANJI_SOURCE.copyright}. <a href={KANJI_SOURCE.licenseUrl} className="underline">CC BY-SA 4.0 · source licence</a>.
  </p>;
}

export function VocabularyKanji({ item }: { item: VocabularyItem }) {
  const form = vocabularyKanjiForm(item);
  if (!form) return null;
  return <div className="mt-3 rounded-xl bg-emerald-50 p-3">
    <p className="text-xs font-semibold text-emerald-800">Kanji spelling</p>
    <p lang="ja" className="mt-1 text-2xl font-bold">{form.written}</p>
    <p lang="ja" className="text-sm text-gray-600">{form.reading}</p>
    <div className="mt-2 flex flex-wrap gap-2">{KANJI.filter(k => form.kanjiIds.includes(k.id)).map(k =>
      <Link key={k.id} to={`/learn/kanji/${k.id}`} aria-label={`Learn Kanji ${k.character}`} className="rounded-lg border border-emerald-200 bg-white px-3 py-1 text-xl hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-600">{k.character}</Link>)}</div>
  </div>;
}

export function LessonKanji({ lessonId }: { lessonId: string }) {
  const characters = introducedKanji(lessonId);
  if (!characters.length) return null;
  return <section aria-label="Kanji introduced in this lesson" className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
    <h2 className="text-xl font-bold text-gray-900">Kanji introduced in this lesson</h2>
    <p className="mt-2 text-sm text-gray-600">Recognize these characters in familiar words. Open a card for readings and course vocabulary. Browsing does not mark a Kanji as mastered.</p>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{characters.map(k =>
      <Link key={k.id} to={`/learn/kanji/${k.id}`} className="rounded-2xl border border-emerald-200 p-4 text-center hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
        <span lang="ja" className="block text-4xl">{k.character}</span><span className="mt-2 block font-semibold">{k.meanings[0]}</span><span lang="ja" className="mt-1 block text-sm text-gray-500">{k.onyomi[0]}</span>
      </Link>)}</div>
    <KanjiAttribution />
  </section>;
}
