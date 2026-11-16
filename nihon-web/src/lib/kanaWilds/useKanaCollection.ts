import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/errors";
import { chooseStarterKana, fetchKanaCollection, saveCaughtKana, saveChallengerWin } from "../../api/kanaWilds";
import type { CollectionChange, KanaCollection } from "../../api/kanaWilds";
import type { Starter } from "./gojuon";

const collectionAfter = ({ starter, kanaIds, answers, beatenChallengers }: CollectionChange): KanaCollection =>
  ({ starter, kanaIds, answers, beatenChallengers });

export type CollectionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; collection: KanaCollection };

/** The learner's collection from the API, with the changes a player can make: choose a starter, add a catch, beat a
 *  challenger. */
export function useKanaCollection() {
  const [state, setState] = useState<CollectionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchKanaCollection(controller.signal)
      .then(collection => setState({ status: "ready", collection }))
      .catch(failure => { if (!controller.signal.aborted) setState({ status: "error", message: apiErrorMessage(failure, "Your kana collection could not be loaded.") }); });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => { setState({ status: "loading" }); setAttempt(value => value + 1); }, []);

  const chooseStarter = useCallback(async (starter: Starter) => {
    setActionError(null);
    try { setState({ status: "ready", collection: await chooseStarterKana(starter) }); }
    catch (failure) { setActionError(apiErrorMessage(failure, "Your starter kana could not be saved. Try again.")); }
  }, []);

  /** Saves a catch; resolves to whether it was saved, so the result screen can say so. */
  const addCatch = useCallback(async (kanaId: number) => {
    setActionError(null);
    try {
      setState({ status: "ready", collection: collectionAfter(await saveCaughtKana(kanaId)) });
      return true;
    } catch (failure) {
      setActionError(apiErrorMessage(failure, "The catch could not be saved. Catch it again in your next battle."));
      return false;
    }
  }, []);

  /** Saves a challenge won; resolves to whether it was saved (a win not saved doesn't open the next path). */
  const addChallengerWin = useCallback(async (challengerId: string) => {
    setActionError(null);
    try {
      setState({ status: "ready", collection: collectionAfter(await saveChallengerWin(challengerId)) });
      return true;
    } catch (failure) {
      setActionError(apiErrorMessage(failure, "Your win could not be saved. Challenge them again to open the next path."));
      return false;
    }
  }, []);

  /** Loads the collection again without a loading screen, for the answer counts a battle changed. */
  const refresh = useCallback(async () => {
    try { setState({ status: "ready", collection: await fetchKanaCollection() }); }
    catch {
      // Deliberately quiet: the levels shown are one battle out of date at worst, and the next load corrects them.
    }
  }, []);

  return { state, retry, chooseStarter, addCatch, addChallengerWin, refresh, actionError };
}
