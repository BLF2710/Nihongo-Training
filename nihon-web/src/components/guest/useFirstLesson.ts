import { useState } from "react";
import { FIRST_LESSON_KANA } from "../../data/guest/firstLesson";
import type { LessonKana } from "../../data/guest/firstLesson";
import { matchRounds, nextStep } from "../../lib/guest/firstLesson";
import type { LessonStep, MatchRound } from "../../lib/guest/firstLesson";

export type MatchFeedback = { status: "waiting" } | { status: "correct" } | { status: "incorrect"; picked: LessonKana };

const WAITING: MatchFeedback = { status: "waiting" };

/** Where the guest is in the first lesson: the step, the listening round, and how their last pick went. */
export function useFirstLesson(random: () => number) {
  const [step, setStep] = useState<LessonStep>("meet");
  const [rounds] = useState<readonly MatchRound<LessonKana>[]>(() => matchRounds(FIRST_LESSON_KANA, random));
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<MatchFeedback>(WAITING);

  const advance = () => setStep(current => nextStep(current));
  const pick = (choice: LessonKana) => {
    if (feedback.status === "correct") return;
    setFeedback(choice.kana === rounds[roundIndex].answer.kana ? { status: "correct" } : { status: "incorrect", picked: choice });
  };
  const isLastRound = roundIndex === rounds.length - 1;
  const nextRound = () => {
    setFeedback(WAITING);
    if (isLastRound) advance();
    else setRoundIndex(index => index + 1);
  };

  return { step, advance, round: rounds[roundIndex], roundNumber: roundIndex + 1, roundCount: rounds.length, feedback, pick, nextRound, isLastRound };
}
