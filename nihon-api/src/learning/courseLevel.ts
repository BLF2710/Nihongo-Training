// Unit and lesson ids carry their course and level: `japanese-n5-unit-4-…`, `english-a2-unit-1-…`.
const COURSE_LEVEL_IN_ID = /^(?:japanese-(n[1-5])|english-(a2|b1|b2|c1))-/;

/** The level an id belongs to ("N5", "A2"), or "" when it names none. */
export function courseLevelOf(id: string): string {
  const match = COURSE_LEVEL_IN_ID.exec(id);
  return (match?.[1] ?? match?.[2] ?? "").toUpperCase();
}
