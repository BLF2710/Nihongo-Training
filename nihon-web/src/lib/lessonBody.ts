import { useEffect, useState } from "react";
import { loadLessonBody } from "../data/lessonBodies";
import type { LessonBody, LessonSummary } from "../data/japaneseN5Lessons";

export type LessonBodyState = { status: "loading" } | { status: "ready"; body: LessonBody } | { status: "failed" };

/** Loads the practice, challenge, concept and objectives of a lesson (a separate download for imported units). */
export function useLessonBody(lesson: LessonSummary | undefined): LessonBodyState {
  const [loaded, setLoaded] = useState<{ lessonId: string; state: LessonBodyState } | null>(null);
  useEffect(() => {
    if (!lesson) return;
    let isCurrent = true;
    const settle = (state: LessonBodyState) => { if (isCurrent) setLoaded({ lessonId: lesson.id, state }); };
    loadLessonBody(lesson).then(body => settle({ status: "ready", body }))
      .catch((failure: unknown) => { console.error(failure); settle({ status: "failed" }); });
    return () => { isCurrent = false; };
  }, [lesson]);
  return loaded && loaded.lessonId === lesson?.id ? loaded.state : { status: "loading" };
}
