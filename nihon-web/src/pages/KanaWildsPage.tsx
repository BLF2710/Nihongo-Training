import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { GuideNote } from "../components/cast/GuideNote";
import { IslandBoard } from "../components/theme/IslandBoard";
import { BattleArena } from "../components/kanaWilds/BattleArena";
import { BattleResult } from "../components/kanaWilds/BattleResult";
import type { CatchSave } from "../components/kanaWilds/BattleResult";
import { CollectionBoard } from "../components/kanaWilds/CollectionBoard";
import { StarterChoice } from "../components/kanaWilds/StarterChoice";
import { primaryButton, sheet } from "../components/kanaWilds/styles";
import { recordPractice } from "../api/activity";
import type { BattleState } from "../lib/kanaWilds/battle";
import { COURSE_BATTLE_WORDS } from "../lib/kanaWilds/courseWords";
import { pickEncounter } from "../lib/kanaWilds/encounters";
import type { Encounter } from "../lib/kanaWilds/encounters";
import { STARTERS, VOWEL_IDS, kanaById } from "../lib/kanaWilds/gojuon";
import { latestCatches } from "../lib/kanaWilds/hand";
import { wordsUsingKana } from "../lib/kanaWilds/missedWords";
import { useMissedWords } from "../lib/kanaWilds/useMissedWords";
import { useKanaCollection } from "../lib/kanaWilds/useKanaCollection";
import { playableWords } from "../lib/kanaWilds/words";

/** The API records a battle as practice only from this many readings, so a battle run from at once isn't sent. */
const MIN_RECORDED_READINGS = 3;
/** Battles are graded in the browser; the course level they count toward (the basic kana are N5). */
const BATTLE_SCOPE = "N5";
const random = Math.random;

type Screen =
  | { kind: "hub" }
  | { kind: "battle"; encounter: Encounter; round: number }
  | { kind: "result"; encounter: Encounter; state: BattleState; catchSave: CatchSave };

/** Kana Wilds: battle wild hiragana with words spelled from your own kana, and catch them by tracing. */
export default function KanaWildsPage() {
  const { state, retry, chooseStarter, addCatch, actionError } = useKanaCollection();
  const [screen, setScreen] = useState<Screen>({ kind: "hub" });
  const [round, setRound] = useState(0);
  const ownedIds = useMemo(() => new Set(state.status === "ready" ? state.collection.kanaIds : []), [state]);
  const ownedCharacters = useMemo(() => new Set([...ownedIds].flatMap(id => kanaById(id)?.kana ?? [])), [ownedIds]);
  const words = useMemo(() => playableWords(COURSE_BATTLE_WORDS, ownedCharacters), [ownedCharacters]);
  const { missed, noteWordReading } = useMissedWords();
  const starter = state.status === "ready" ? state.collection.starter : null;
  const practice = useMemo(() => {
    const starterSet = new Set([...VOWEL_IDS, ...STARTERS.filter(item => item.key === starter).map(item => item.kanaId)]);
    const latest = new Set(latestCatches([...ownedIds], starterSet).flatMap(id => kanaById(id)?.kana ?? []));
    return { newWords: wordsUsingKana(words, latest), missedWords: new Set(missed), noteReading: noteWordReading };
  }, [ownedIds, starter, words, missed, noteWordReading]);

  const battle = (encounter: Encounter) => { setRound(value => value + 1); setScreen({ kind: "battle", encounter, round: round + 1 }); };
  const explore = () => battle(pickEncounter(ownedIds, random));
  const finish = async (encounter: Encounter, ended: BattleState) => {
    if (ended.readings.answered >= MIN_RECORDED_READINGS) recordPractice("battle", BATTLE_SCOPE, ended.readings.answered, ended.readings.correct);
    if (ended.outcome !== "caught") { setScreen({ kind: "result", encounter, state: ended, catchSave: "not-caught" }); return; }
    setScreen({ kind: "result", encounter, state: ended, catchSave: "saving" });
    const isSaved = await addCatch(ended.enemy.id);
    setScreen({ kind: "result", encounter, state: ended, catchSave: isSaved ? "saved" : "failed" });
  };

  const isInBattle = screen.kind === "battle";
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar island={isInBattle ? undefined : "kana"} /><main className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-6 sm:py-3">
    <h1 className="text-xl font-black sm:text-2xl">Kana Wilds</h1>
    {state.status === "loading" && <p role="status" className="mt-4 text-gray-500">Loading your kana…</p>}
    {state.status === "error" && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{state.message} <button type="button" className="ml-2 font-bold underline" onClick={retry}>Try again</button></p>}
    {actionError && <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{actionError}</p>}
    {state.status === "ready" && <IslandBoard island="kana" className="mt-3">
      {!state.collection.starter && <StarterChoice words={COURSE_BATTLE_WORDS} onChoose={chooseStarter} />}
      {state.collection.starter && screen.kind === "hub" && <section className={`${sheet} grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-center`} aria-labelledby="hub-heading">
        <h2 id="hub-heading" className="sr-only">Your kana</h2>
        <div>
          <GuideNote character="chun" mood="happy"><p>Spell words with your kana to attack. Read a wild kana to block it, then trace it to catch it!</p></GuideNote>
          <p className="mt-2 text-sm text-gray-600">Your kana spell <b>{words.length}</b> course words. Each catch opens more.</p>
          <button type="button" className={`${primaryButton} mt-2`} onClick={explore}>Explore the tall grass →</button>
        </div>
        <CollectionBoard ownedIds={ownedIds} />
      </section>}
      {state.collection.starter && screen.kind === "battle" && <BattleArena key={screen.round} encounter={screen.encounter} words={words} pool={COURSE_BATTLE_WORDS} practice={practice} random={random}
        onEnd={ended => void finish(screen.encounter, ended)} />}
      {state.collection.starter && screen.kind === "result" && <BattleResult state={screen.state} catchSave={screen.catchSave}
        onRematch={() => battle({ kana: screen.encounter.kana, isCatchable: !ownedIds.has(screen.encounter.kana.id) })} onExplore={explore} onHome={() => setScreen({ kind: "hub" })} />}
    </IslandBoard>}
  </main></div>;
}
