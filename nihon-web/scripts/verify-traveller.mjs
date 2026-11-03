// The learner's traveller: how it gets between islands on the map.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { bridgeSpan, LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT } from "../src/lib/islandMap.ts";
import { journey, standingPoint, walkLength, walkSteps } from "../src/lib/traveller.ts";

test("staying on the same island is no journey", () => {
  assert.deepEqual(journey(LANDSCAPE_LAYOUT, "kanji", "kanji"), { kind: "stay" });
});

test("an outlying place has no bridge, so it is reached by ferry", () => {
  assert.equal(journey(LANDSCAPE_LAYOUT, "home", "fuji").kind, "ferry");
  assert.equal(journey(LANDSCAPE_LAYOUT, "onsen", "lessons").kind, "ferry");
});

test("from Home it crosses one bridge, from its standing spot to the island's", () => {
  const route = journey(LANDSCAPE_LAYOUT, "home", "kanji");
  const { start, end } = bridgeSpan(LANDSCAPE_LAYOUT, "kanji");
  assert.deepEqual(route, { kind: "walk", points: [standingPoint(LANDSCAPE_LAYOUT, "home"), start, end, standingPoint(LANDSCAPE_LAYOUT, "kanji")] });
});

test("between two ring islands it walks back over one bridge to Home and out over the other", () => {
  const route = journey(PORTRAIT_LAYOUT, "lessons", "games");
  assert.equal(route.kind, "walk");
  assert.deepEqual(route.points.slice(1, 3), [bridgeSpan(PORTRAIT_LAYOUT, "lessons").end, bridgeSpan(PORTRAIT_LAYOUT, "lessons").start]);
  assert.equal(route.points.length, 6);
});

test("a walk's steps end at rising shares of its length, the last at 1, facing the way each heads", () => {
  const points = [{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 0, y: 8 }];
  assert.equal(walkLength(points), 10);
  assert.deepEqual(walkSteps(points), [{ end: 0.5, isFacingRight: true }, { end: 1, isFacingRight: false }]);
});
