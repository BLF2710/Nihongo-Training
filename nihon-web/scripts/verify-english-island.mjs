// The English island in real 3D: where its models stand and the ground they take up, how its people turn and how far
// back the camera stands, and that the island can be walked. Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraDistance, centreOf, facingAngle, groundTakenBy, personPosition, tileSize, tilesOfPeople, turnTowards } from "../src/lib/world/islandModels.ts";
import { hasModel, place } from "../src/data/world/islandModelArt.ts";
import { ENGLISH_ISLAND } from "../src/data/world/englishIsland.ts";
import { blockedTilesWithOpenGates } from "../src/lib/errands/village.ts";
import { isBlocked, terrainAt, tilesOf } from "../src/lib/errands/townMap.ts";

const at = { x: 4, y: 6, width: 2, height: 3 };

test("a model stands in the middle of its ground", () => {
  assert.deepEqual(centreOf({ model: "home_A", at, scale: 3 }), { x: 5, y: 7.5 });
});

test("a person stands in the middle of their tile", () => {
  assert.deepEqual(personPosition({ id: "knight", model: "knight", tile: { x: 3, y: 4 }, facing: "down" }), { x: 3.5, y: 4.5 });
});

test("walkable models take up no ground", () => {
  const models = [{ model: "castle", at, scale: 3 }, { model: "flag_blue", at: { x: 1, y: 1, width: 1, height: 1 }, scale: 3, isWalkable: true }];
  assert.deepEqual(groundTakenBy(models), [at]);
});

test("each person takes up their own tile", () => {
  assert.deepEqual(tilesOfPeople([{ id: "mage", model: "mage", tile: { x: 2, y: 9 }, facing: "left" }]), [{ x: 2, y: 9, width: 1, height: 1 }]);
});

test("a placed model's ground is its footprint at the common scale, at least a tile", () => {
  const placed = place("well", { x: 0, y: 0 });
  assert.ok(placed.at.width >= 1 && placed.at.height >= 1 && placed.scale === 3);
});

test("scaling a placement shrinks its ground with it", () => {
  assert.ok(place("castle", { x: 0, y: 0 }, { scale: 0.5 }).at.width < place("castle", { x: 0, y: 0 }).at.width);
});

test("a model facing the viewer isn't turned, and one facing right turns a quarter", () => {
  assert.deepEqual([facingAngle("down"), facingAngle("right")], [0, Math.PI / 2]);
});

test("turning goes the short way round", () => {
  const turned = turnTowards(Math.PI * 0.9, -Math.PI * 0.9, 1);
  assert.ok(Math.abs(turned - Math.PI * 1.1) < 1e-9);
});

test("turning part of the way stops partway", () => {
  assert.equal(turnTowards(0, 1, 0.5), 0.5);
});

test("tiles are sized as the 2.5D scenes size them", () => {
  assert.deepEqual([tileSize({ width: 1366, height: 768 }), tileSize({ width: 390, height: 844 }), tileSize({ width: 3000, height: 2000 })], [64, 34, 64]);
});

test("the camera stands back far enough to show the screen's height in tiles", () => {
  const viewport = { width: 1366, height: 768 };
  const shown = 2 * cameraDistance(viewport, 30) * Math.tan(Math.PI / 12);
  assert.ok(Math.abs(shown - 768 / 64) < 1e-9);
});

const { layout, scene } = ENGLISH_ISLAND;

/** Every tile the traveller can walk to from `start`. */
function reachableFrom(start) {
  const blocked = blockedTilesWithOpenGates(layout, []);
  const seen = new Set([`${start.x},${start.y}`]), queue = [start];
  while (queue.length) {
    const { x, y } = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: x + dx, y: y + dy }, key = `${next.x},${next.y}`;
      if (seen.has(key) || isBlocked(layout.map, blocked, next.x, next.y)) continue;
      seen.add(key); queue.push(next);
    }
  }
  return seen;
}

test("every model and person on the English island has been prepared", () => {
  const names = [...scene.models, ...scene.backdrop].map(({ model }) => model).concat(scene.people.map(({ model }) => model), scene.traveller);
  assert.deepEqual(names.filter(name => !hasModel(name)), []);
});

test("no two models or people on the English island stand on the same ground", () => {
  const owners = new Map();
  const things = [...scene.models.map(({ model, at }) => ({ name: model, at })), ...scene.people.map(({ id, tile }) => ({ name: id, at: { ...tile, width: 1, height: 1 } }))];
  const clashes = things.flatMap(({ name, at }) => tilesOf(at).flatMap(key => {
    const owner = owners.get(key);
    owners.set(key, name);
    return owner ? [`${owner}/${name} at ${key}`] : [];
  }));
  assert.deepEqual(clashes, []);
});

test("nothing on the English island stands in the water or on a bridge", () => {
  const wet = scene.models.flatMap(({ model, at }) => tilesOf(at).filter(key => {
    const [x, y] = key.split(",").map(Number);
    return ["water", "bridge", "pier"].includes(terrainAt(layout.map, x, y));
  }).map(key => `${model} at ${key}`));
  assert.deepEqual(wet, []);
});

test("every door on the English island can be walked to from where the traveller starts", () => {
  const reachable = reachableFrom(layout.start);
  assert.deepEqual(ENGLISH_ISLAND.doors.filter(({ tile }) => !reachable.has(`${tile.x},${tile.y}`)).map(door => door.id), []);
});
