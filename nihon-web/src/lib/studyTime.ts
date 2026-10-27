// Active study time for the daily goal: time on a learning page, while the page is visible and the learner has
// done something recently. Pure bookkeeping here; StudyTimeTracker feeds it the clock and sends the reports.

/** Without a click, key press, scroll or touch for this long the learner counts as away. */
export const IDLE_LIMIT_MS = 90_000;
/** How often the counted time is sent. */
export const REPORT_EVERY_MS = 60_000;

const LEARNING_PATHS = ["/lessons", "/learn", "/review", "/srs", "/mistakes", "/quizzes", "/vocabulary", "/grammar", "/reading", "/listening", "/speaking", "/mock-exam", "/practice"];

/** True on pages where time counts as study (not the dashboard, messages, settings…). */
export const isLearningPath = (pathname: string) => LEARNING_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

export type StudyClock = {
  /** The learner did something at `at`. */
  noteActivity(at: number): void;
  /** Counts the time since the previous tick when the page was visible and the learner wasn't idle. */
  tick(at: number, isCounting: boolean): void;
  /** Whole seconds counted since the last call; the fraction is kept for the next report. */
  takeSeconds(): number;
};

export function createStudyClock(start: number): StudyClock {
  let lastActivity = start, lastTick = start, countedMs = 0;
  return {
    noteActivity(at) { lastActivity = at; },
    tick(at, isCounting) {
      // Only the stretch up to the idle limit counts, even when a tick arrives late (a sleeping laptop).
      const activeUntil = Math.min(at, lastActivity + IDLE_LIMIT_MS);
      if (isCounting && activeUntil > lastTick) countedMs += activeUntil - lastTick;
      lastTick = at;
    },
    takeSeconds() {
      const seconds = Math.floor(countedMs / 1000);
      countedMs -= seconds * 1000;
      return seconds;
    },
  };
}
