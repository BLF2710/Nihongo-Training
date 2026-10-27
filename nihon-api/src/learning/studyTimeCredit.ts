// How much active study time one report from the browser may add. Pure: the caller supplies the times.

/** The browser reports about once a minute; a little more is allowed for a late or final report. */
export const MAX_SECONDS_PER_REPORT = 75;
/** Slack for clock and network delays between two reports. */
const GRACE_SECONDS = 5;

/**
 * Seconds to credit: never more than the report asks for, than one report may carry, or than the time that has
 * actually passed since the last credit, so parallel tabs or replayed requests can't add up to more than real time.
 */
export function creditableSeconds(requested: number, lastCreditedAt: Date | undefined, now: Date): number {
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  const elapsed = lastCreditedAt ? Math.max(0, (now.getTime() - lastCreditedAt.getTime()) / 1000) + GRACE_SECONDS : MAX_SECONDS_PER_REPORT;
  return Math.floor(Math.min(requested, MAX_SECONDS_PER_REPORT, elapsed));
}
