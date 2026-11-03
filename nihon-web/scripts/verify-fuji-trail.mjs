// The mock exam's climb up Fuji: stations per section, how far the climber gets, and points along the trail.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { climbedShare, examSky, FUJI_TRAIL, pointAlong, resultShare, roundedPath, trailStations } from "../src/lib/fujiTrail.ts";

test("each section's station sits where its questions end, lit once it is complete", () => {
  const stations = trailStations([{ title: "Vocabulary", total: 10, isComplete: true }, { title: "Grammar", total: 20, isComplete: false }, { title: "Reading", total: 10, isComplete: false }]);
  assert.deepEqual(stations, [{ title: "Vocabulary", share: 0.25, isLit: true }, { title: "Grammar", share: 0.75, isLit: false }, { title: "Reading", share: 1, isLit: false }]);
});

test("the climber goes up with the questions answered, from the foot to the summit", () => {
  assert.equal(climbedShare(0, 40), 0);
  assert.equal(climbedShare(10, 40), 0.25);
  assert.equal(climbedShare(40, 40), 1);
  assert.equal(climbedShare(3, 0), 0);
});

test("only reaching the target puts the climber on the summit", () => {
  assert.equal(resultShare(72, true), 1);
  assert.equal(resultShare(99, false), 0.94);
  assert.equal(resultShare(40, false), 0.4);
});

test("points along the trail start at the foot, end at the summit, and fall on its stretches", () => {
  assert.deepEqual(pointAlong(FUJI_TRAIL, 0), FUJI_TRAIL[0]);
  assert.deepEqual(pointAlong(FUJI_TRAIL, 1), FUJI_TRAIL.at(-1));
  assert.deepEqual(pointAlong([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 0.75), { x: 10, y: 5 });
});

test("a rounded trail keeps its ends and curves through each turn instead of touching the corner", () => {
  const corners = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
  const path = roundedPath(corners);
  assert.deepEqual([path[0], path.at(-1)], [corners[0], corners[2]]);
  assert.ok(!path.some(point => point.x === 10 && point.y === 0));
});

test("the exam's sky goes from dawn through day and dusk to night, the moon out for the last stretch", () => {
  assert.deepEqual([0, 0.3, 0.7, 0.9, 1].map(elapsed => examSky(elapsed).timeOfDay), ["dawn", "day", "dusk", "night", "night"]);
  assert.equal(examSky(0.5).body, "sun");
  assert.equal(examSky(0.95).body, "moon");
  assert.ok(examSky(0.4).position.y < examSky(0).position.y, "the sun climbs from the horizon");
});
