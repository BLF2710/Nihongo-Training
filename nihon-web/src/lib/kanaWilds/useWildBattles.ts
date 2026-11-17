import { useCallback, useMemo, useRef, useState } from "react";
import { recordPractice } from "../../api/activity";
import type { BattleState } from "./battle";
import { EVERY_TILE_WORD } from "./courseWords";
import { evolutionsMade } from "./evolution";
import type { EvolutionKind } from "./evolution";
import { pickEncounter, pickReviewEncounter } from "./encounters";
import { isChallengerId } from "../world/challenges";
import type { Challenger, ChallengerId, ChallengeSummary } from "../world/challenges";
import type { Encounter } from "./encounters";
import { STARTERS, VOWEL_IDS, kanaById, tileKanaByCharacter } from "./gojuon";
import { latestCatches } from "./hand";
import { NO_LEVELS, kanaLevelsOf } from "./mastery";
import { wordsUsingKana } from "./missedWords";
import { useKanaCollection } from "./useKanaCollection";
import { useEvolutionMoments } from "./useEvolutionMoments";
import { useMissedWords } from "./useMissedWords";
import { playableWords } from "./words";

/** The API records a battle as practice only from this many readings, so a battle run from at once isn't sent. */
const MIN_RECORDED_READINGS = 3;
/** Battles are graded in the browser; the course level they count toward (the basic kana are N5). */
const BATTLE_SCOPE = "N5";

/** Whether the catch reached the server: the result screen says so rather than promising a kana that wasn't saved. */
export type CatchSave = "not-caught" | "saving" | "saved" | "failed";
/** The same for a challenge won. */
export type WinSave = "not-won" | "saving" | "saved" | "failed";
type Readings = { answered: number; correct: number };

function recordReadings(readings: Readings) {
  if (readings.answered >= MIN_RECORDED_READINGS) recordPractice("battle", BATTLE_SCOPE, readings.answered, readings.correct);
}

/** Who opens each kind of evolution (docs/KANA-BATTLE.md section 9). */
const EVOLUTION_OPENED_BY: Readonly<Record<EvolutionKind, ChallengerId>> = { voiced: "sensei", "small-kana": "zen" };
const EVOLUTION_KINDS: readonly EvolutionKind[] = ["voiced", "small-kana"];

export type BattleScreen =
  | { kind: "none" }
  | { kind: "battle"; encounter: Encounter; round: number }
  | { kind: "result"; encounter: Encounter; state: BattleState; catchSave: CatchSave }
  | { kind: "challenge"; challenger: Challenger; round: number }
  | { kind: "challenge-result"; challenger: Challenger; summary: ChallengeSummary; winSave: WinSave };

/**
 * Battling wild kana, wherever it happens (the Kana Wilds page, a wild path): the learner's collection, the words they
 * can play, and a battle's course from encounter to result, saving the catch and the practice on the way.
 */
export function useWildBattles(random: () => number) {
  const collection = useKanaCollection();
  const { state } = collection;
  const [screen, setScreen] = useState<BattleScreen>({ kind: "none" });
  const ownedIds = useMemo(() => new Set(state.status === "ready" ? state.collection.kanaIds : []), [state]);
  const ownedCharacters = useMemo(() => new Set([...ownedIds].flatMap(id => kanaById(id)?.kana ?? [])), [ownedIds]);
  // Only the challengers this app knows: an id the API adds later means nothing here yet.
  const beatenChallengers = useMemo(() => new Set(state.status === "ready" ? state.collection.beatenChallengers.filter(isChallengerId) : []), [state]);
  const kanaLevels = useMemo(() => state.status === "ready" ? kanaLevelsOf(state.collection.answers) : NO_LEVELS, [state]);
  // Beating Sensei or Zen opens a kind of evolution; beating Pon teaches Sharp Eyes.
  const evolutionKinds = useMemo(() => new Set(EVOLUTION_KINDS.filter(kind => beatenChallengers.has(EVOLUTION_OPENED_BY[kind]))), [beatenChallengers]);
  const hasSharpEyes = beatenChallengers.has("pon");
  const evolutions = useMemo(() => evolutionsMade(ownedCharacters, kanaLevels, evolutionKinds), [ownedCharacters, kanaLevels, evolutionKinds]);
  const evolved = useMemo(() => evolutions.map(evolution => evolution.to), [evolutions]);
  const evolutionMoment = useEvolutionMoments(state.status === "ready" ? evolutions : null);
  const tiles = useMemo(() => new Set([...ownedCharacters, ...evolved.map(kana => kana.kana)]), [ownedCharacters, evolved]);
  const tileKana = useMemo(() => [...tiles].flatMap(kana => tileKanaByCharacter(kana) ?? []), [tiles]);
  const words = useMemo(() => playableWords(EVERY_TILE_WORD, tiles), [tiles]);
  const { missed, noteWordReading } = useMissedWords();
  const starter = state.status === "ready" ? state.collection.starter : null;
  const practice = useMemo(() => {
    const starterSet = new Set([...VOWEL_IDS, ...STARTERS.filter(item => item.key === starter).map(item => item.kanaId)]);
    const latest = new Set(latestCatches([...ownedIds], starterSet).flatMap(id => kanaById(id)?.kana ?? []));
    return { newWords: wordsUsingKana(words, latest), missedWords: new Set(missed), noteReading: noteWordReading };
  }, [ownedIds, starter, words, missed, noteWordReading]);

  // Each battle gets a new round, so its screen starts afresh even against the same kana.
  const rounds = useRef(0);
  const start = useCallback((encounter: Encounter) => {
    rounds.current += 1;
    setScreen({ kind: "battle", encounter, round: rounds.current });
  }, []);
  /** A wild kana from `wildRows`: the path's rows, or for a quick battle the rows of every path open. */
  const explore = useCallback((wildRows: readonly string[]) => start(pickEncounter(ownedIds, wildRows, random)), [start, ownedIds, random]);
  /** A kana the player has caught, from `wildRows`, for review (the pine path's grass). */
  const review = useCallback((wildRows: readonly string[]) => start(pickReviewEncounter(ownedIds, wildRows, random)), [start, ownedIds, random]);
  const challenge = useCallback((challenger: Challenger) => {
    rounds.current += 1;
    setScreen({ kind: "challenge", challenger, round: rounds.current });
  }, []);
  const rematch = useCallback((encounter: Encounter) => start({ kana: encounter.kana, isCatchable: !ownedIds.has(encounter.kana.id) }), [start, ownedIds]);
  const close = useCallback(() => setScreen({ kind: "none" }), []);

  const { addCatch, addChallengerWin, refresh } = collection;
  const finish = useCallback(async (encounter: Encounter, ended: BattleState) => {
    recordReadings(ended.readings);
    // The kana read in defence were answers too, so the levels may have moved (a catch brings the new counts with it).
    if (ended.outcome !== "caught") { setScreen({ kind: "result", encounter, state: ended, catchSave: "not-caught" }); await refresh(); return; }
    setScreen({ kind: "result", encounter, state: ended, catchSave: "saving" });
    const isSaved = await addCatch(ended.enemy.id);
    setScreen({ kind: "result", encounter, state: ended, catchSave: isSaved ? "saved" : "failed" });
  }, [addCatch, refresh]);

  const finishChallenge = useCallback(async (challenger: Challenger, summary: ChallengeSummary) => {
    recordReadings(summary.readings);
    if (summary.outcome !== "won") { setScreen({ kind: "challenge-result", challenger, summary, winSave: "not-won" }); await refresh(); return; }
    setScreen({ kind: "challenge-result", challenger, summary, winSave: "saving" });
    const isSaved = await addChallengerWin(challenger.id);
    setScreen({ kind: "challenge-result", challenger, summary, winSave: isSaved ? "saved" : "failed" });
  }, [addChallengerWin, refresh]);

  return { collection, ownedIds, kanaLevels, beatenChallengers, evolutionKinds, evolved, evolutionMoment, tileKana, ownedCharacters, hasSharpEyes, words, practice, screen, explore, review, challenge, rematch, finish, finishChallenge, close };
}

export type WildBattles = ReturnType<typeof useWildBattles>;
