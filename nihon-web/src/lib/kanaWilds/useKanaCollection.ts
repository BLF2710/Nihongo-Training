import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/errors";
import { chooseStarterKana, fetchKanaCollection, saveCaughtKana } from "../../api/kanaWilds";
import type { KanaCollection } from "../../api/kanaWilds";
import type { Starter } from "./gojuon";

export type CollectionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; collection: KanaCollection };

/** The learner's collection from the API, with the two changes a player can make: choose a starter, add a catch. */
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
      const { starter, kanaIds } = await saveCaughtKana(kanaId);
      setState({ status: "ready", collection: { starter, kanaIds } });
      return true;
    } catch (failure) {
      setActionError(apiErrorMessage(failure, "The catch could not be saved. Catch it again in your next battle."));
      return false;
    }
  }, []);

  return { state, retry, chooseStarter, addCatch, actionError };
}
