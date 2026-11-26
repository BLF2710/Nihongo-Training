import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ALL_UNITS } from "../../components/englishStudy/EnglishStudyFrame";
import { ENGLISH_LESSONS, ENGLISH_UNITS } from "../../data/englishCourse";
import { useEnglishCourseLevel } from "../../lib/courseLevel";
import { unitsOfLevel } from "../../lib/englishStudy";

/** The level the learner chose, its units, and the unit picked in the address (`?unit=`), or all of them. */
export function useEnglishStudyScope() {
  const level = useEnglishCourseLevel();
  const [params, setParams] = useSearchParams();
  const units = useMemo(() => unitsOfLevel(ENGLISH_UNITS, level), [level]);
  const requested = params.get("unit");
  const unitId = units.some(unit => unit.id === requested) ? requested ?? ALL_UNITS : ALL_UNITS;
  // Kept between renders, so pages can build on the list (and draw random questions from it) only when it changes.
  const lessons = useMemo(() => {
    const isInScope = (lessonUnitId: string) => unitId === ALL_UNITS ? units.some(unit => unit.id === lessonUnitId) : lessonUnitId === unitId;
    return ENGLISH_LESSONS.filter(lesson => isInScope(lesson.unitId));
  }, [unitId, units]);
  const chooseUnit = (id: string) => setParams(id === ALL_UNITS ? {} : { unit: id });
  return { level, units, unitId, lessons, chooseUnit };
}
