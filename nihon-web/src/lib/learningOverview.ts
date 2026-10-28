import { useEffect, useState } from "react";
import { apiErrorMessage } from "../api/errors";
import { fetchLearningOverview } from "../api/statistics";
import type { LearningOverview } from "../api/statistics";

export type LearningOverviewState = { overview: LearningOverview | null; error: string; retry: () => void };

/** The learner's statistics overview, loaded once and shared by the statistics tabs. */
export function useLearningOverview(): LearningOverviewState {
  const [overview, setOverview] = useState<LearningOverview | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchLearningOverview(controller.signal).then(data => { setOverview(data); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your learning statistics could not be loaded.")); });
    return () => controller.abort();
  }, [attempt]);
  return { overview, error, retry: () => setAttempt(value => value + 1) };
}
