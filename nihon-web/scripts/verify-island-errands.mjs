// Island Errands: the town map, walking and collisions, conversations, errands and saves, and the Festival Village
// content (every step exists, every villager can be reached, and the errands can be finished in order).
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { afterBuild, afterLine, afterReply, missingSteps, openingTalk, stepOf } from "../src/lib/errands/conversation.ts";
import { currentObjective, newErrandsState, newlyFinished, questScore } from "../src/lib/errands/errandsState.ts";
import { readSavedState } from "../src/lib/errands/errandsSave.ts";
import { FEET_HALF_WIDTH, RUN_SPEED, WALK_SPEED, facingOf, heldDirection, nearestWithin, walk } from "../src/lib/errands/movement.ts";
import { isBlocked, parseTownMap, rowRuns, TownMapError } from "../src/lib/errands/townMap.ts";
import { isGateOpen, isVillageComplete, villageBlockedTiles } from "../src/lib/errands/village.ts";
import { MATSURI_VILLAGE as village } from "../src/data/errands/matsuriVillage.ts";

const open = () => false;
const wallAt = column => (x) => x === column;

test("a map row of a different width is refused", () => {
  assert.throws(() => parseTownMap(["...", ".."]), TownMapError);
});

test("an unknown map character is refused", () => {
  assert.throws(() => parseTownMap(["..?"]), TownMapError);
});

test("water, trees and fences block, and so does everything off the map", () => {
  const map = parseTownMap([".~T", "f=b"]);
  const blocked = villageBlockedTiles({ ...village, map, buildings: [], gates: [], villagers: [] }, newErrandsState({ x: 0, y: 0 }));
  assert.deepEqual([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [-1, 0], [3, 0]].map(([x, y]) => isBlocked(map, blocked, x, y)), [false, true, true, true, false, false, true, true]);
});

test("walking diagonally at full speed covers the same distance as walking straight", () => {
  const { x, y } = heldDirection(new Set(["up", "right"]));
  assert.ok(Math.abs(Math.hypot(x, y) - 1) < 1e-9);
});

test("opposite keys cancel out", () => {
  assert.deepEqual(heldDirection(new Set(["left", "right"])), { x: 0, y: 0 });
});

test("walking into a wall stops the feet right at its edge", () => {
  let position = { x: 2.5, y: 0.5 };
  for (let frame = 0; frame < 60; frame++) position = walk(position, { x: 1, y: 0 }, 0.016, wallAt(4));
  assert.ok(Math.abs(position.x - (4 - FEET_HALF_WIDTH)) < 1e-9, String(position.x));
});

test("walking left into a wall stops right at its edge too", () => {
  const position = walk({ x: 1.4, y: 0.5 }, { x: -1, y: 0 }, 0.05, wallAt(0));
  assert.ok(Math.abs(position.x - (1 + FEET_HALF_WIDTH)) < 1e-9, String(position.x));
});

test("walking diagonally into a wall slides along it", () => {
  const position = walk({ x: 4 - FEET_HALF_WIDTH, y: 0.5 }, heldDirection(new Set(["right", "down"])), 0.05, wallAt(4));
  assert.equal(position.x, 4 - FEET_HALF_WIDTH);
  assert.ok(position.y > 0.5);
});

test("slow frames cover the same ground as fast ones", () => {
  let fast = { x: 1, y: 1 };
  for (let frame = 0; frame < 10; frame++) fast = walk(fast, { x: 1, y: 0 }, 0.02, open);
  const slow = walk({ x: 1, y: 1 }, { x: 1, y: 0 }, 0.2, open);
  assert.ok(Math.abs(slow.x - fast.x) < 1e-9, `${slow.x} vs ${fast.x}`);
});

test("a very long frame (a tab coming back) walks no further than a quarter second", () => {
  assert.deepEqual(walk({ x: 1, y: 1 }, { x: 1, y: 0 }, 5, open), walk({ x: 1, y: 1 }, { x: 1, y: 0 }, 0.25, open));
});

test("a slow frame never jumps through a thin wall", () => {
  assert.ok(walk({ x: 3.5, y: 0.5 }, { x: 1, y: 0 }, 0.25, wallAt(4)).x <= 4 - FEET_HALF_WIDTH + 1e-9);
});

test("standing still keeps the way the traveller faces", () => {
  assert.equal(facingOf({ x: 0, y: 0 }, "left"), "left");
  assert.equal(facingOf({ x: 0, y: -1 }, "left"), "up");
});

test("only someone within talking distance can be talked to, and the nearest wins", () => {
  const people = [{ id: "far", tile: { x: 10, y: 10 } }, { id: "near", tile: { x: 2, y: 1 } }, { id: "nearer", tile: { x: 1, y: 2 } }];
  assert.equal(nearestWithin({ x: 1.5, y: 1.8 }, people)?.id, "nearer");
  assert.equal(nearestWithin({ x: 6, y: 6 }, people), null);
});

test("a first wrong reply counts as wrong even when the next try is right", () => {
  const pon = village.villagers.find(villager => villager.id === "pon");
  let state = newErrandsState(village.start);
  const step = stepOf(pon, "hand-over");
  state = afterReply(state, pon, "hand-over", step.replies.find(reply => !reply.isCorrect)).state;
  state = afterReply(state, pon, "hand-over", step.replies.find(reply => reply.isCorrect)).state;
  assert.deepEqual(questScore(state, "pon-bread"), { answered: 1, correct: 0 });
});

test("a sentence is built only from the tiles in the right order", () => {
  const sensei = village.villagers.find(villager => villager.id === "sensei");
  const state = newErrandsState(village.start);
  assert.equal(afterBuild(state, sensei, "order", ["ひとつ", "おちゃ", "を", "おねがいします"]).next, "again");
  assert.equal(afterBuild(state, sensei, "order", ["おちゃ", "を", "ひとつ", "おねがいします"]).next, "served");
});

test("a saved state is read back, and anything else is ignored", () => {
  const state = { ...newErrandsState({ x: 3, y: 4 }), inventory: ["bread"], attempts: { "pon:hand-over": { quest: "pon-bread", isCorrectFirstTime: true } } };
  assert.deepEqual(readSavedState(JSON.parse(JSON.stringify(state))), state);
  assert.equal(readSavedState({ ...state, facing: "sideways" }), null);
  assert.equal(readSavedState({ ...state, attempts: { x: { quest: 1 } } }), null);
  assert.equal(readSavedState("nonsense"), null);
});

test("every conversation step the village points to exists", () => {
  assert.deepEqual(village.villagers.flatMap(missingSteps), []);
});

test("every villager always has something to say", () => {
  for (const villager of village.villagers) assert.deepEqual(villager.talks.at(-1).when, [], villager.id);
});

test("every item handed over is described", () => {
  const given = village.villagers.flatMap(villager => Object.values(villager.steps)).flatMap(step => step.effects ?? []).filter(effect => effect.kind === "give");
  for (const { item } of given) assert.ok(village.items[item], item);
});

// The tiles reachable on foot from where the traveller starts, in a given state.
function reachable(state) {
  const blocked = villageBlockedTiles(village, state);
  const start = [Math.floor(village.start.x), Math.floor(village.start.y)];
  const seen = new Set([start.join()]), queue = [start];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [x + dx, y + dy];
      if (!seen.has(next.join()) && !isBlocked(village.map, blocked, ...next)) { seen.add(next.join()); queue.push(next); }
    }
  }
  return seen;
}
const canReach = (seen, id) => {
  const { tile: { x, y } } = village.villagers.find(villager => villager.id === id);
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
};

// Plays a conversation to its end, giving the right reply or sentence at every question.
function talkTo(state, id) {
  const villager = village.villagers.find(candidate => candidate.id === id);
  let stepId = openingTalk(villager, state).start;
  while (stepId) {
    const step = stepOf(villager, stepId);
    const result = step.kind === "say" ? afterLine(state, step)
      : step.kind === "choose" ? afterReply(state, villager, stepId, step.replies.find(reply => reply.isCorrect))
      : afterBuild(state, villager, stepId, step.answer);
    state = result.state; stepId = result.next;
  }
  return state;
}

test("the gates keep each errand's area closed until the errand before it is done", () => {
  const state = newErrandsState(village.start);
  const seen = reachable(state);
  assert.deepEqual(["pon", "tama"].map(id => canReach(seen, id)), [true, true]);
  assert.deepEqual(["hato", "kon", "hakase", "zen", "sensei"].map(id => canReach(seen, id)), [false, false, false, false, false]);
});

test("the village can be finished in order, each errand opening the way to the next", () => {
  let state = newErrandsState(village.start);
  const route = [["pon", "tama", "pon"], ["hato", "kon", "hakase"], ["zen", "sensei", "zen"]];
  route.forEach((visits, index) => {
    const quest = village.quests[index];
    assert.equal(currentObjective(state, village.quests)?.quest.id, quest.id);
    for (const id of visits) {
      assert.ok(canReach(reachable(state), id), `${id} can be reached during ${quest.id}`);
      const before = state;
      state = talkTo(state, id);
      assert.notDeepEqual(state, before, `talking to ${id} moves ${quest.id} on`);
    }
    assert.deepEqual(newlyFinished({ ...state, finished: state.finished.filter(id => id !== quest.id) }, state), [quest.id]);
    assert.ok(questScore(state, quest.id).answered >= 2, `${quest.id} asks at least two replies, enough to report`);
  });
  assert.ok(isVillageComplete(village, state));
  assert.equal(currentObjective(state, village.quests), null);
  assert.ok(village.gates.every(gate => isGateOpen(gate, state)));
  assert.deepEqual(state.inventory, ["ticket", "key"]);
});

test("finds each row's unbroken runs of a terrain", () => {
  const map = parseTownMap(["TT.T", "....", "TTTT"]);
  assert.deepEqual(rowRuns(map, "tree"), [
    { x: 0, y: 0, width: 2, height: 1 }, { x: 3, y: 0, width: 1, height: 1 }, { x: 0, y: 2, width: 4, height: 1 },
  ]);
});

test("running covers more ground than walking in the same time", () => {
  const walked = walk({ x: 1, y: 1 }, { x: 1, y: 0 }, 0.2, open);
  const ran = walk({ x: 1, y: 1 }, { x: 1, y: 0 }, 0.2, open, RUN_SPEED);
  assert.ok(Math.abs(walked.x - 1 - WALK_SPEED * 0.2) < 1e-9 && Math.abs(ran.x - 1 - RUN_SPEED * 0.2) < 1e-9, JSON.stringify({ walked, ran }));
});
