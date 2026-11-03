// What the learner has done in the village: where they stand, what they carry, which errands are done and how their
// replies went. Changed only through effects, so the dialogue content decides what happens.
import type { CharacterId } from "../cast.ts";
import type { Direction, Vector } from "./movement.ts";

export type ItemId = string;
export type FlagId = string;
export type QuestId = string;

export type Condition =
  | { kind: "flag"; flag: FlagId }
  | { kind: "no-flag"; flag: FlagId }
  | { kind: "item"; item: ItemId }
  | { kind: "no-item"; item: ItemId }
  | { kind: "finished"; quest: QuestId };

export type Effect =
  | { kind: "give"; item: ItemId }
  | { kind: "take"; item: ItemId }
  | { kind: "set"; flag: FlagId }
  | { kind: "finish"; quest: QuestId };

/** A reply the learner gave; only the first try at each question counts toward the score. */
export type Attempt = { quest: QuestId; isCorrectFirstTime: boolean };

export type ErrandsState = {
  position: Vector; facing: Direction;
  inventory: readonly ItemId[]; flags: readonly FlagId[]; finished: readonly QuestId[];
  attempts: Readonly<Record<string, Attempt>>;
};

export type Objective = { text: string; doneWhen: readonly Condition[] };
export type Quest = { id: QuestId; title: string; giver: CharacterId; startsWhen: readonly Condition[]; objectives: readonly Objective[] };
export type QuestScore = { answered: number; correct: number };

export const newErrandsState = (position: Vector): ErrandsState =>
  ({ position, facing: "down", inventory: [], flags: [], finished: [], attempts: {} });

export function meets(state: ErrandsState, condition: Condition): boolean {
  switch (condition.kind) {
    case "flag": return state.flags.includes(condition.flag);
    case "no-flag": return !state.flags.includes(condition.flag);
    case "item": return state.inventory.includes(condition.item);
    case "no-item": return !state.inventory.includes(condition.item);
    case "finished": return state.finished.includes(condition.quest);
  }
}

export const meetsAll = (state: ErrandsState, conditions: readonly Condition[]) => conditions.every(condition => meets(state, condition));

const adding = <T>(list: readonly T[], value: T) => list.includes(value) ? list : [...list, value];

export function applyEffect(state: ErrandsState, effect: Effect): ErrandsState {
  switch (effect.kind) {
    case "give": return { ...state, inventory: adding(state.inventory, effect.item) };
    case "take": return { ...state, inventory: state.inventory.filter(item => item !== effect.item) };
    case "set": return { ...state, flags: adding(state.flags, effect.flag) };
    case "finish": return { ...state, finished: adding(state.finished, effect.quest) };
  }
}

export const applyEffects = (state: ErrandsState, effects: readonly Effect[] = []) => effects.reduce(applyEffect, state);

/** Notes a reply to the question `key`; a question already tried keeps its first result. */
export function recordAttempt(state: ErrandsState, key: string, quest: QuestId, isCorrect: boolean): ErrandsState {
  if (state.attempts[key]) return state;
  return { ...state, attempts: { ...state.attempts, [key]: { quest, isCorrectFirstTime: isCorrect } } };
}

/** How many of an errand's questions were answered, and how many right the first time. */
export function questScore(state: ErrandsState, quest: QuestId): QuestScore {
  const attempts = Object.values(state.attempts).filter(attempt => attempt.quest === quest);
  return { answered: attempts.length, correct: attempts.filter(attempt => attempt.isCorrectFirstTime).length };
}

/** The errand under way and its next unfinished step, or null when every errand open to the learner is done. */
export function currentObjective(state: ErrandsState, quests: readonly Quest[]): { quest: Quest; objective: Objective } | null {
  for (const quest of quests) {
    if (state.finished.includes(quest.id) || !meetsAll(state, quest.startsWhen)) continue;
    const objective = quest.objectives.find(step => !meetsAll(state, step.doneWhen));
    if (objective) return { quest, objective };
  }
  return null;
}

/** Errands finished by applying `effects`: the ones to report as finished practice. */
export const newlyFinished = (before: ErrandsState, after: ErrandsState) => after.finished.filter(quest => !before.finished.includes(quest));
