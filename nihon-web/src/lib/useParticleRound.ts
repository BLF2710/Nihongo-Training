import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "../api/errors";
import { fetchUnits } from "../api/units";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { allParticleQuestions, buildParticleRound } from "./particleDrop";
import type { ParticleQuestion, ParticleSource } from "./particleDrop";

export const ROUND_SIZE = 10;
/** Fewer sentences than this can't make a fair round. */
export const MIN_QUESTIONS = 5;

const SOURCES: ParticleSource[] = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.map(lesson => ({
  id: lesson.id, title: lesson.title, examples: lesson.grammar.flatMap(point => point.examples),
})));

export type ParticleRoundState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; available: number; round: ParticleQuestion[] };

/** Sentences from the learner's finished lessons only, so nothing appears before it was taught. */
export function useParticleRound(): ParticleRoundState & { newRound: () => void; retry: () => void } {
  const [state, setState] = useState<ParticleRoundState>({ status: "loading" });
  const [sources, setSources] = useState<ParticleSource[]>([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(units => {
      const completed = new Set(units.flatMap(unit => unit.lessons.filter(lesson => lesson.completed).map(lesson => lesson.id)));
      const finished = SOURCES.filter(source => completed.has(source.id));
      setSources(finished);
      setState({ status: "ready", available: allParticleQuestions(finished, Math.random).length, round: buildParticleRound(finished, ROUND_SIZE, Math.random) });
    }).catch(failure => { if (!controller.signal.aborted) setState({ status: "error", message: apiErrorMessage(failure, "Your lessons could not be loaded.") }); });
    return () => controller.abort();
  }, [attempt]);
  const newRound = useCallback(() => setState(current => current.status === "ready" ? { ...current, round: buildParticleRound(sources, ROUND_SIZE, Math.random) } : current), [sources]);
  return { ...state, newRound, retry: () => { setState({ status: "loading" }); setAttempt(value => value + 1); } };
}
