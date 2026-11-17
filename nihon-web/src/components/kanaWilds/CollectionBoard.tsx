import { HIRAGANA_ROWS } from "../../lib/kanaWilds/gojuon";
import type { Vowel, WildKana } from "../../lib/kanaWilds/gojuon";
import { EVOLVE_AT_LEVEL } from "../../lib/kanaWilds/evolution";
import type { EvolutionKinds, PendingEvolution } from "../../lib/kanaWilds/evolution";
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

/** Evolution (docs/KANA-BATTLE.md section 9): the kinds open (Sensei, Zen beaten), the kana evolved, and those still
 *  to. */
export type Evolutions = { kinds: EvolutionKinds; evolved: readonly WildKana[]; pending: readonly PendingEvolution[] };
/** How many evolutions still to come are named. */
const SHOWN_PENDING = 3;

type Props = { ownedIds: ReadonlySet<number>; kanaLevels: KanaLevels; evolutions: Evolutions };

/** The evolved kana (each with its level), and the next ones to come; or how evolution opens. */
function EvolutionLine({ kanaLevels, evolutions: { kinds, evolved, pending } }: Pick<Props, "kanaLevels" | "evolutions">) {
  if (!kinds.size) return <p className="mt-1 truncate text-xs text-gray-600" title={`Beat Sensei on the Lessons island, and each kana evolves (か → が) once it reaches level ${EVOLVE_AT_LEVEL}.`}>
    Evolution: beat Sensei on the Lessons island.</p>;
  return <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-700" aria-label="Evolved kana">
    <span className="font-bold">Evolved:</span>
    {evolved.length ? evolved.map(kana => <span key={kana.id} lang="ja" className={`rounded px-1 text-sm leading-4 font-bold ${LEVEL_CLASS[levelOf(kanaLevels, kana.kana)]}`}
      title={`${kana.romaji}, level ${levelOf(kanaLevels, kana.kana)}`}>{kana.kana}</span>) : <span>none yet</span>}
    {pending.slice(0, SHOWN_PENDING).map(({ from, to, level }) => <span key={from} className="text-gray-500"><span lang="ja">{from} → {to.join(" ")}</span> at level {EVOLVE_AT_LEVEL} (now {level})</span>)}
    {!kinds.has("small-kana") && <span className="text-gray-500" title={`Beat Zen on the Review island, and き, し, ち… take small kana (き → きゃ) once they reach level ${EVOLVE_AT_LEVEL}.`}>
      Small kana (<span lang="ja">き → きゃ</span>): beat Zen on the Review island.</span>}
  </div>;
}

/** The learner's kana collection: caught kana are filled in with their mastery level, the rest are blank slots still in
 *  the wild. */
export function CollectionBoard({ ownedIds, kanaLevels, evolutions }: Props) {
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
    <EvolutionLine kanaLevels={kanaLevels} evolutions={evolutions} />
  </figure>;
}
