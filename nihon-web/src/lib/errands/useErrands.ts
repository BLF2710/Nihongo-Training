import { useEffect, useMemo, useRef, useState } from "react";
import type { CharacterId } from "../cast.ts";
import { afterBuild, afterLine, afterReply, openingTalk, stepOf } from "./conversation.ts";
import type { Reply, Step, StepId, StepResult, Villager } from "./conversation.ts";
import { meetsAll, newErrandsState, newlyFinished, questScore } from "./errandsState.ts";
import type { ErrandsState, QuestScore } from "./errandsState.ts";
import type { ErrandsSaveStore } from "./errandsSave.ts";
import { facingOf, nearestWithin, walk } from "./movement.ts";
import type { Vector } from "./movement.ts";
import { isBlocked } from "./townMap.ts";
import { blockedTilesWithOpenGates, isVillageComplete, openGateIds } from "./village.ts";
import type { Village } from "./village.ts";

// Saving waits until the traveller has stood still this long, instead of saving every step.
const SAVE_DELAY_MS = 800;

export type Conversation = { villager: Villager; stepId: StepId; step: Step };
type Talking = { villagerId: CharacterId; stepId: StepId } | null;

type UseErrandsOptions = {
  village: Village; store: ErrandsSaveStore;
  /** Called once for each errand as it is finished, with how its questions went. */
  onErrandFinished: (score: QuestScore) => void;
};

/** A visit to the village: the saved state, walking, conversations and finished errands. */
export function useErrands({ village, store, onErrandFinished }: UseErrandsOptions) {
  const [saved] = useState(() => store.load());
  const [state, setState] = useState<ErrandsState>(() => saved ?? newErrandsState(village.start));
  const [talking, setTalking] = useState<Talking>(null);
  const [isFinaleShown, setIsFinaleShown] = useState(false);

  const openIds = openGateIds(village, state);
  const openKey = openIds.join(",");
  const blocked = useMemo(() => blockedTilesWithOpenGates(village, openKey ? openKey.split(",") : []), [village, openKey]);

  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
    const timer = setTimeout(() => store.save(state), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state, store]);
  // Leaving mid-walk still keeps where the traveller stood.
  useEffect(() => () => store.save(latest.current), [store]);

  const villagerOf = (id: CharacterId) => village.villagers.find(villager => villager.id === id);
  const talkingTo = talking ? villagerOf(talking.villagerId) : undefined;
  const conversation: Conversation | null = talking && talkingTo ? { villager: talkingTo, stepId: talking.stepId, step: stepOf(talkingTo, talking.stepId) } : null;
  const nearby = conversation ? null : nearestWithin(state.position, village.villagers);
  const errandVillagerIds = village.villagers.filter(villager => openingTalk(villager, state).isErrand).map(villager => villager.id);

  const settle = (result: StepResult) => {
    const finished = newlyFinished(state, result.state);
    for (const quest of finished) onErrandFinished(questScore(result.state, quest));
    if (finished.length > 0 && isVillageComplete(village, result.state)) setIsFinaleShown(true);
    setState(result.state);
    setTalking(talking && result.next ? { ...talking, stepId: result.next } : null);
  };

  return {
    state, hasSave: saved !== null, conversation, nearby, errandVillagerIds, openGateIds: openIds,
    areLanternsLit: meetsAll(state, village.lanterns.litWhen),
    isFinaleShown, closeFinale: () => setIsFinaleShown(false),
    startOver() { store.clear(); setTalking(null); setState(newErrandsState(village.start)); },
    walkBy(direction: Vector, seconds: number) {
      setState(current => ({ ...current, position: walk(current.position, direction, seconds, (x, y) => isBlocked(village.map, blocked, x, y)), facing: facingOf(direction, current.facing) }));
    },
    talkTo(id: CharacterId) {
      const villager = villagerOf(id);
      if (!villager || conversation || nearestWithin(state.position, [villager]) === null) return;
      setTalking({ villagerId: id, stepId: openingTalk(villager, state).start });
    },
    next() { if (conversation?.step.kind === "say") settle(afterLine(state, conversation.step)); },
    reply(reply: Reply) { if (conversation) settle(afterReply(state, conversation.villager, conversation.stepId, reply)); },
    build(tiles: readonly string[]) { if (conversation) settle(afterBuild(state, conversation.villager, conversation.stepId, tiles)); },
    leave() { setTalking(null); },
  };
}
