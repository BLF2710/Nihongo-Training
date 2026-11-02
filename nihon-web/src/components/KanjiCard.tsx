import { Link } from "react-router-dom";
import { FlipCard } from "./FlipCard";
import type { Kanji } from "../data/kanji";
import { kanjiExamples } from "../data/kanjiStudyCards";
import { kanjiPlacementLabel } from "../lib/kanjiPlacement";

/** Example words on the back; a kanji page's Words tab lists them all. */
const EXAMPLES_SHOWN = 3;

/** `heading` is the kanji's heading level: h1 when the card is the page's subject, h2 inside a deck or dialog. */
type Props = { kanji: Kanji; caption?: string; masteryLabel?: string; heading?: "h1" | "h2" };

/** The kanji study card used everywhere: the kanji alone on the front; meanings, readings and example words on the back. */
export function KanjiCard({ kanji, caption, masteryLabel, heading = "h2" }: Props) {
  return <FlipCard label={`Study ${kanji.character}`} flipLabel={`${kanji.character}: flip to see its meaning and readings`}
    front={<KanjiFront kanji={kanji} caption={caption} masteryLabel={masteryLabel} heading={heading} />} back={<KanjiBack kanji={kanji} />} />;
}

function KanjiFront({ kanji, caption, masteryLabel, heading: Heading = "h2" }: Props) {
  return <>
    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{caption ?? kanjiPlacementLabel(kanji.id)}</span>
    <Heading lang="ja" className="my-auto py-4 text-[8rem] font-medium leading-none text-gray-900 sm:text-[10rem]">{kanji.character}</Heading>
    {masteryLabel && <span className="mb-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{masteryLabel}</span>}
  </>;
}

function KanjiBack({ kanji }: { kanji: Kanji }) {
  const examples = kanjiExamples(kanji.id);
  return <>
    <p className="flex items-center justify-center gap-3"><span lang="ja" className="text-5xl text-gray-900">{kanji.character}</span><span className="text-xl font-bold text-emerald-800">{kanji.meanings.join(" · ")}</span></p>
    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-xl bg-gray-50 px-3 py-2"><dt className="text-xs font-bold text-gray-500">On'yomi</dt><dd lang="ja" className="text-base wrap-anywhere">{kanji.onyomi.join(" · ") || "Not listed"}</dd></div>
      <div className="rounded-xl bg-gray-50 px-3 py-2"><dt className="text-xs font-bold text-gray-500">Kun'yomi</dt><dd lang="ja" className="text-base wrap-anywhere">{kanji.kunyomi.join(" · ") || "Not listed"}</dd></div>
    </dl>
    <p className="mt-2 text-xs text-gray-600">{kanji.strokeCount} strokes · {kanjiPlacementLabel(kanji.id)}</p>
    {examples.length > 0 && <ul aria-label="Example words" className="mt-2 space-y-1">{examples.slice(0, EXAMPLES_SHOWN).map(word => <li key={word.id}>
      <Link to={word.href} className="flex flex-wrap items-baseline gap-x-3 rounded-lg bg-emerald-50 px-3 py-1 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-600">
        <span lang="ja" className="font-bold text-gray-900">{word.written}</span><span lang="ja" className="text-sm text-gray-600">{word.reading}</span><span className="text-sm text-gray-700">{word.meaning}</span>
      </Link>
    </li>)}</ul>}
    {examples.length > EXAMPLES_SHOWN && <p className="mt-1 text-xs text-gray-500">and {examples.length - EXAMPLES_SHOWN} more words</p>}
  </>;
}
