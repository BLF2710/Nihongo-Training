import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { reportStudyTime } from "../api/activity";
import { hasSession } from "../lib/authStorage";
import { announceDailyGoal } from "../lib/dailyGoal";
import { createStudyClock, isLearningPath, REPORT_EVERY_MS } from "../lib/studyTime";
import type { StudyClock } from "../lib/studyTime";

const TICK_MS = 1000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "touchstart"] as const;

/** Counts active time on learning pages and reports it about once a minute (and when the page is left). Renders nothing. */
export default function StudyTimeTracker() {
  const { pathname } = useLocation();
  const clock = useRef<StudyClock | null>(null);
  const isLearning = useRef(isLearningPath(pathname));
  const sinceReport = useRef(0);

  // Time on the previous page is settled before the new page's rule applies.
  useEffect(() => {
    clock.current?.tick(Date.now(), isLearning.current && document.visibilityState === "visible");
    isLearning.current = isLearningPath(pathname);
  }, [pathname]);

  useEffect(() => {
    const studyClock = createStudyClock(Date.now());
    clock.current = studyClock;
    const tick = () => studyClock.tick(Date.now(), hasSession() && isLearning.current && document.visibilityState === "visible");
    const flush = () => {
      tick();
      sinceReport.current = 0;
      const seconds = studyClock.takeSeconds();
      if (seconds > 0) void reportStudyTime(seconds).then(progress => { if (progress) announceDailyGoal(progress); });
    };
    const noteActivity = () => studyClock.noteActivity(Date.now());
    const timer = window.setInterval(() => {
      tick();
      sinceReport.current += TICK_MS;
      if (sinceReport.current >= REPORT_EVERY_MS) flush();
    }, TICK_MS);
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); else noteActivity(); };
    ACTIVITY_EVENTS.forEach(name => window.addEventListener(name, noteActivity, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach(name => window.removeEventListener(name, noteActivity, { capture: true }));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  return null;
}
