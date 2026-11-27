import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/errors";
import { fetchEnglishReviewRound } from "../../api/review";
import type { EnglishReviewQuestion } from "../../api/review";

type RoundState = { key: string; questions: EnglishReviewQuestion[] | null; error: string };

/** A round of the English review for `scope`, drawn by the server (null while loading). A new `roundNumber` draws again. */
export function useEnglishReviewRound(scope: string, roundNumber: number) {
  const key = `${scope}:${roundNumber}`;
  const [state, setState] = useState<RoundState>({ key, questions: null, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    fetchEnglishReviewRound(scope, controller.signal).then(questions => setState({ key, questions, error: "" }))
      .catch(failure => { if (!controller.signal.aborted) setState({ key, questions: null, error: apiErrorMessage(failure, "The review could not be loaded.") }); });
    return () => controller.abort();
  }, [key, scope]);
  // What was loaded for another scope or round is not this round's.
  return state.key === key ? state : { key, questions: null, error: "" };
}
