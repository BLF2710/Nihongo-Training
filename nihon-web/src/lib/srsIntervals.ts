const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** A wait until the next review, short enough for a button: "10 min", "5 h", "3 d", "2 mo", "1.5 y". */
export function formatInterval(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} min`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} h`;
  if (ms < MONTH) return `${Math.round(ms / DAY)} d`;
  if (ms < YEAR) return `${Math.round(ms / MONTH)} mo`;
  return `${Math.round(ms / YEAR * 10) / 10} y`;
}
