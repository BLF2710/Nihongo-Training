// The name a guest gives at the end of their first lesson, carried to the sign-up or sign-in page in the router's
// state (never the address, so it stays out of history and logs).

export const MAX_NAME_LENGTH = 40;

/** The name as the learner meant it: NFC, trimmed, inner spaces collapsed, at most MAX_NAME_LENGTH characters
 *  (counted as code points, so kanji and emoji count once). Null when nothing is left. */
export function cleanLearnerName(raw: string): string | null {
  const name = raw.normalize("NFC").trim().replace(/\s+/gu, " ");
  if (!name) return null;
  return Array.from(name).slice(0, MAX_NAME_LENGTH).join("").trim();
}

export type GuestNameState = { guestName: string };

/** The guest's name from a page's router state, cleaned; null when there is none. */
export function guestNameFrom(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("guestName" in state)) return null;
  return typeof state.guestName === "string" ? cleanLearnerName(state.guestName) : null;
}
