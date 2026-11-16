import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { GuideNote } from "../components/cast/GuideNote";
import { IslandBoard } from "../components/theme/IslandBoard";
import { CollectionBoard } from "../components/kanaWilds/CollectionBoard";
import { StarterChoice } from "../components/kanaWilds/StarterChoice";
import { WildBattleScreen } from "../components/kanaWilds/WildBattleScreen";
import { primaryButton, secondaryButton, sheet } from "../components/kanaWilds/styles";
import { COURSE_BATTLE_WORDS } from "../lib/kanaWilds/courseWords";
import { useWildBattles } from "../lib/kanaWilds/useWildBattles";
import { WILD_ROUTES } from "../data/world/routes";
import { allWildRows, routeHref } from "../lib/world/routes";

const random = Math.random;
const [FIRST_ROUTE] = WILD_ROUTES;
/** A quick battle meets the kana of every path's grass. */

/** Kana Wilds: your collection, and battles against wild hiragana (on a wild path, or a quick battle from here). */
export default function KanaWildsPage() {
  const battles = useWildBattles(random);
  const { collection: { state, retry, chooseStarter, actionError }, ownedIds, kanaLevels, words, screen, explore, close } = battles;
  const quickBattle = () => explore(allWildRows(WILD_ROUTES, battles.beatenChallengers));
  const isInBattle = screen.kind === "battle";
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar island={isInBattle ? undefined : "kana"} /><main className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-6 sm:py-3">
    <h1 className="text-xl font-black sm:text-2xl">Kana Wilds</h1>
    {state.status === "loading" && <p role="status" className="mt-4 text-gray-500">Loading your kana…</p>}
    {state.status === "error" && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{state.message} <button type="button" className="ml-2 font-bold underline" onClick={retry}>Try again</button></p>}
    {actionError && <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{actionError}</p>}
    {state.status === "ready" && <IslandBoard island="kana" className="mt-3">
      {!state.collection.starter && <StarterChoice words={COURSE_BATTLE_WORDS} onChoose={chooseStarter} />}
      {state.collection.starter && screen.kind === "none" && <section className={`${sheet} grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-center`} aria-labelledby="hub-heading">
        <h2 id="hub-heading" className="sr-only">Your kana</h2>
        <div>
          <GuideNote character="chun" mood="happy"><p>Spell words with your kana to attack. Read a wild kana to block it, then trace it to catch it!</p></GuideNote>
          <p className="mt-2 text-sm text-gray-600">Your kana spell <b>{words.length}</b> course words. Each catch opens more.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FIRST_ROUTE && <Link to={routeHref(FIRST_ROUTE.id, "home")} className={`${primaryButton} max-sm:px-3 max-sm:py-2 max-sm:text-sm`}>Walk the wild path →</Link>}
            <button type="button" className={`${secondaryButton} max-sm:px-3 max-sm:text-sm`} onClick={quickBattle}>Quick battle</button>
          </div>
        </div>
        <CollectionBoard ownedIds={ownedIds} kanaLevels={kanaLevels} />
      </section>}
      {state.collection.starter && <WildBattleScreen battles={battles} random={random} exploreLabel="Explore the grass" onExplore={quickBattle} onHome={close} />}
    </IslandBoard>}
  </main></div>;
}
