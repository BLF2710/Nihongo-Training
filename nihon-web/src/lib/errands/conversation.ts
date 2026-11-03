// Talking to the villagers: each person has conversations made of steps (a line said, a reply to choose, or a sentence
// to build from word tiles). Which conversation starts depends on the errand state.
import type { CharacterId } from "../cast.ts";
import { applyEffects, meetsAll, recordAttempt } from "./errandsState.ts";
import type { Condition, Effect, ErrandsState, QuestId } from "./errandsState.ts";
import type { Vector } from "./movement.ts";

export type Speaker = CharacterId | "traveller";
/** Japanese may carry furigana as <ruby>漢字<rt>かんじ</rt></ruby> (see lib/furigana). */
export type Line = { speaker: Speaker; japanese: string; english: string };
export type StepId = string;
export type Reply = { japanese: string; english: string; isCorrect: boolean; next: StepId };

export type Step =
  | { kind: "say"; line: Line; hint?: string; effects?: readonly Effect[]; next: StepId | null }
  | { kind: "choose"; quest: QuestId; task: string; replies: readonly Reply[] }
  | { kind: "build"; quest: QuestId; task: string; answer: readonly string[]; spare: readonly string[]; next: StepId; wrongNext: StepId };

/** A conversation: it starts at `start` when every condition holds. `isErrand` marks one that moves an errand on. */
export type Talk = { when: readonly Condition[]; start: StepId; isErrand?: boolean };
export type Villager = { id: CharacterId; tile: Vector; talks: readonly Talk[]; steps: Readonly<Record<StepId, Step>> };

export type StepResult = { state: ErrandsState; next: StepId | null };

export class DialogueError extends Error {
  constructor(message: string) { super(message); this.name = "DialogueError"; }
}

/** The conversation a villager starts now: their first talk whose conditions hold. */
export function openingTalk(villager: Villager, state: ErrandsState): Talk {
  const talk = villager.talks.find(candidate => meetsAll(state, candidate.when));
  if (!talk) throw new DialogueError(`${villager.id} has nothing to say in this state.`);
  return talk;
}

export function stepOf(villager: Villager, id: StepId): Step {
  const step = villager.steps[id];
  if (!step) throw new DialogueError(`${villager.id} has no step "${id}".`);
  return step;
}

const attemptKey = (villager: Villager, stepId: StepId) => `${villager.id}:${stepId}`;

/** Moving on from a line: its effects happen (an item handed over, an errand finished). */
export function afterLine(state: ErrandsState, step: Extract<Step, { kind: "say" }>): StepResult {
  return { state: applyEffects(state, step.effects), next: step.next };
}

export function afterReply(state: ErrandsState, villager: Villager, stepId: StepId, reply: Reply): StepResult {
  const step = stepOf(villager, stepId);
  if (step.kind !== "choose") throw new DialogueError(`Step "${stepId}" is not a choice.`);
  return { state: recordAttempt(state, attemptKey(villager, stepId), step.quest, reply.isCorrect), next: reply.next };
}

const sameText = (a: string, b: string) => a.normalize("NFC") === b.normalize("NFC");

/** Whether the tiles, in the order placed, make the expected sentence. */
export const isBuiltCorrectly = (step: Extract<Step, { kind: "build" }>, tiles: readonly string[]) =>
  tiles.length === step.answer.length && tiles.every((tile, index) => sameText(tile, step.answer[index]));

export function afterBuild(state: ErrandsState, villager: Villager, stepId: StepId, tiles: readonly string[]): StepResult & { isCorrect: boolean } {
  const step = stepOf(villager, stepId);
  if (step.kind !== "build") throw new DialogueError(`Step "${stepId}" is not a sentence to build.`);
  const isCorrect = isBuiltCorrectly(step, tiles);
  return { state: recordAttempt(state, attemptKey(villager, stepId), step.quest, isCorrect), next: isCorrect ? step.next : step.wrongNext, isCorrect };
}

/** Every step id a villager's talks or steps point to that doesn't exist, as "villager:step" (none in valid content). */
export function missingSteps(villager: Villager): string[] {
  const pointedTo = [
    ...villager.talks.map(talk => talk.start),
    ...Object.values(villager.steps).flatMap(step => step.kind === "say" ? (step.next ? [step.next] : [])
      : step.kind === "choose" ? step.replies.map(reply => reply.next) : [step.next, step.wrongNext]),
  ];
  return pointedTo.filter(id => !villager.steps[id]).map(id => `${villager.id}:${id}`);
}
