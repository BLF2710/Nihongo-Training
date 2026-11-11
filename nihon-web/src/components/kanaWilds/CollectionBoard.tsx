import { HIRAGANA_ROWS } from "../../lib/kanaWilds/gojuon";
import type { Vowel, WildKana } from "../../lib/kanaWilds/gojuon";
import { VOWEL_CIRCLE } from "../../lib/kanaWilds/vowelCircle";

// The gojūon table laid out as it is usually printed: one column per row (あ, か, さ…), one line per vowel.
const slotOf = (kana: WildKana): Vowel => kana.vowel ?? "a";

/** The learner's kana collection: caught kana are filled in, the rest are blank slots still in the wild. */
export function CollectionBoard({ ownedIds }: { ownedIds: ReadonlySet<number> }) {
  const caught = HIRAGANA_ROWS.reduce((total, { kana }) => total + kana.filter(item => ownedIds.has(item.id)).length, 0);
  const total = HIRAGANA_ROWS.reduce((sum, { kana }) => sum + kana.length, 0);
  return <figure>
    <figcaption className="flex items-baseline justify-between text-sm font-bold text-gray-700"><span>Your collection</span><span>{caught} / {total}</span></figcaption>
    <table className="mt-2 w-full table-fixed border-separate border-spacing-0.5 text-center" lang="ja">
      <caption className="sr-only">Hiragana you have caught</caption>
      <tbody>{VOWEL_CIRCLE.map(vowel => <tr key={vowel}>
        {HIRAGANA_ROWS.map(({ row, kana }) => {
          const item = kana.find(candidate => slotOf(candidate) === vowel);
          if (!item) return <td key={row} />;
          const isOwned = ownedIds.has(item.id);
          return <td key={row} className={`rounded-md py-0.5 text-base font-bold sm:py-1 sm:text-lg ${isOwned ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-300"}`}>
            <span aria-hidden="true">{isOwned ? item.kana : "・"}</span>
            <span className="sr-only">{isOwned ? `${item.kana} caught` : `${item.romaji} not caught yet`}</span>
          </td>;
        })}
      </tr>)}</tbody>
    </table>
  </figure>;
}
