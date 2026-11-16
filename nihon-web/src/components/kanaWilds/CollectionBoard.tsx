import { HIRAGANA_ROWS } from "../../lib/kanaWilds/gojuon";
import type { Vowel, WildKana } from "../../lib/kanaWilds/gojuon";
import { MASTERY_STEPS, levelOf } from "../../lib/kanaWilds/mastery";
import type { KanaLevels, MasteryLevel } from "../../lib/kanaWilds/mastery";
import { VOWEL_CIRCLE } from "../../lib/kanaWilds/vowelCircle";

// The gojūon table laid out as it is usually printed: one column per row (あ, か, さ…), one line per vowel.
const slotOf = (kana: WildKana): Vowel => kana.vowel ?? "a";
const MAX_LEVEL = MASTERY_STEPS[MASTERY_STEPS.length - 1].level;
/** Deeper green for a higher level, so the strong kana stand out at a glance (the number says it too). */
const LEVEL_CLASS: Readonly<Record<MasteryLevel, string>> = {
  1: "bg-emerald-50 text-emerald-900", 2: "bg-emerald-100 text-emerald-900", 3: "bg-emerald-200 text-emerald-950",
  4: "bg-emerald-300 text-emerald-950", 5: "bg-emerald-400 text-emerald-950",
};

type Props = { ownedIds: ReadonlySet<number>; kanaLevels: KanaLevels };

/** The learner's kana collection: caught kana are filled in with their mastery level, the rest are blank slots still in
 *  the wild. */
export function CollectionBoard({ ownedIds, kanaLevels }: Props) {
  const caught = HIRAGANA_ROWS.reduce((total, { kana }) => total + kana.filter(item => ownedIds.has(item.id)).length, 0);
  const total = HIRAGANA_ROWS.reduce((sum, { kana }) => sum + kana.length, 0);
  return <figure>
    <figcaption className="flex items-baseline justify-between gap-2 text-sm font-bold text-gray-700"><span className="whitespace-nowrap">Your collection</span>
      <span className="whitespace-nowrap text-xs font-semibold text-gray-500" title="Each kana's level comes from your right and wrong answers for it, anywhere on the site">small number = level</span><span className="whitespace-nowrap">{caught} / {total}</span></figcaption>
    <table className="mt-2 w-full table-fixed border-separate border-spacing-0.5 text-center" lang="ja">
      <caption className="sr-only">Hiragana you have caught</caption>
      <tbody>{VOWEL_CIRCLE.map(vowel => <tr key={vowel}>
        {HIRAGANA_ROWS.map(({ row, kana }) => {
          const item = kana.find(candidate => slotOf(candidate) === vowel);
          if (!item) return <td key={row} />;
          const isOwned = ownedIds.has(item.id);
          const level = levelOf(kanaLevels, item.kana);
          return <td key={row} className={`relative rounded-md py-0.5 text-base font-bold sm:py-1 sm:text-lg ${isOwned ? LEVEL_CLASS[level] : "bg-gray-100 text-gray-300"}`}>
            <span aria-hidden="true">{isOwned ? item.kana : "・"}</span>
            {isOwned && <span aria-hidden="true" className="absolute right-0.5 top-0 text-[0.6rem] leading-tight font-black text-emerald-800 sm:text-[0.65rem]">{level}</span>}
            <span className="sr-only">{isOwned ? `${item.kana} caught, level ${level} of ${MAX_LEVEL}` : `${item.romaji} not caught yet`}</span>
          </td>;
        })}
      </tr>)}</tbody>
    </table>
  </figure>;
}
