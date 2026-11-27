import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/errors";
import { fetchUnits } from "../../api/units";

/** The ids of the lessons the learner has completed (null while loading), for the tools that practise them. */
export function useCompletedLessonIds() {
  const [completed, setCompleted] = useState<ReadonlySet<string> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(units => setCompleted(new Set(units.flatMap(unit => unit.lessons.filter(lesson => lesson.completed).map(lesson => lesson.id)))))
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your progress could not be loaded.")); });
    return () => controller.abort();
  }, []);
  return { completed, error };
}
