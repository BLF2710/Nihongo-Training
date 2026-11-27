// The English island, its castle courtyard and its market square in real 3D: where its models stand and the ground they take up, how its people turn and how far
// back the camera stands, and that the island can be walked. Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraDistance, centreOf, drawnTowards, facingAngle, groundTakenBy, personPosition, tileSize, tilesOfPeople, turnTowards } from "../src/lib/world/islandModels.ts";
import { hasModel, place } from "../src/data/world/islandModelArt.ts";
import { ENGLISH_ISLAND } from "../src/data/world/englishIsland.ts";
import { ENGLISH_COURTYARD } from "../src/data/world/englishCourtyard.ts";
import { ENGLISH_MARKET_SQUARE } from "../src/data/world/englishMarketSquare.ts";
import { blockedTilesWithOpenGates } from "../src/lib/errands/village.ts";
import { isBlocked, terrainAt, tilesOf } from "../src/lib/errands/townMap.ts";
import { fitsAt } from "../src/lib/errands/movement.ts";

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

const PLACES = [["English island", ENGLISH_ISLAND], ["castle courtyard", ENGLISH_COURTYARD], ["market square", ENGLISH_MARKET_SQUARE]];

/** Every tile the traveller can walk to from `start` in a place. */
function reachableFrom({ layout }, { x: startX, y: startY }) {
  const blocked = blockedTilesWithOpenGates(layout, []);
  const start = { x: Math.floor(startX), y: Math.floor(startY) };
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

for (const [name, place] of PLACES) {
  const { layout, scene } = place;
  const lanterns = (scene.lanterns ?? []).flatMap(({ lit, unlit }) => [lit, unlit]);

  test(`every model and person in the ${name} has been prepared`, () => {
    const names = [...scene.models, ...scene.backdrop, ...lanterns].map(({ model }) => model).concat(scene.people.map(({ model }) => model), scene.traveller);
    assert.deepEqual(names.filter(model => !hasModel(model)), []);
  });

  test(`no two models or people in the ${name} stand on the same ground`, () => {
    const owners = new Map();
    const things = [...scene.models.map(({ model, at }) => ({ name: model, at })), ...(scene.lanterns ?? []).map(({ lit }) => ({ name: "banner", at: lit.at })),
      ...scene.people.map(({ id, tile }) => ({ name: id, at: { ...tile, width: 1, height: 1 } }))];
    const clashes = things.flatMap(({ name: thing, at }) => tilesOf(at).flatMap(key => {
      const owner = owners.get(key);
      owners.set(key, thing);
      return owner ? [`${owner}/${thing} at ${key}`] : [];
    }));
    assert.deepEqual(clashes, []);
  });

  test(`nothing in the ${name} stands in the water, on a bridge or off the map`, () => {
    const wet = [...scene.models, ...lanterns].flatMap(({ model, at }) => tilesOf(at).filter(key => {
      const [x, y] = key.split(",").map(Number);
      return x < 0 || y < 0 || x >= layout.map.width || y >= layout.map.height || ["water", "bridge", "pier"].includes(terrainAt(layout.map, x, y));
    }).map(key => `${model} at ${key}`));
    assert.deepEqual(wet, []);
  });

  test(`every door in the ${name} can be walked to from where the traveller starts`, () => {
    const reachable = reachableFrom(place, layout.start);
    assert.deepEqual(place.doors.filter(({ tile }) => !reachable.has(`${tile.x},${tile.y}`)).map(door => door.id), []);
  });

  test(`every townsperson in the ${name} can be walked up to and talked to`, () => {
    const reachable = reachableFrom(place, layout.start);
    const besideOf = ({ x, y }) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `${x + dx},${y + dy}`);
    assert.deepEqual(place.townsfolk.filter(({ tile }) => !besideOf(tile).some(key => reachable.has(key))).map(({ id }) => id), []);
  });

  test(`every townsperson in the ${name} is drawn there`, () => {
    assert.deepEqual(place.townsfolk.filter(({ id }) => !scene.people.some(person => person.id === id)).map(({ id }) => id), []);
  });
}

test("the castle door opens the courtyard and the shore lane leads to the market square", () => {
  const hrefs = ENGLISH_ISLAND.doors.map(({ href }) => href);
  assert.ok(hrefs.includes("/english/castle") && hrefs.includes("/english/market-square"));
});

test("the courtyard and the market square each have a way back to the island", () => {
  assert.deepEqual([ENGLISH_COURTYARD, ENGLISH_MARKET_SQUARE].map(({ doors }) => doors.some(({ href }) => href === "/english/island")), [true, true]);
});

test("choosing a level in the courtyard's great hall opens the study dashboard", () => {
  assert.equal(ENGLISH_COURTYARD.doors.find(({ id }) => id === "great-hall")?.href, "/levels?next=/dashboard");
});

test("a model turned east or west takes up its footprint turned too", () => {
  const facingSouth = place("wall_straight", { x: 0, y: 0 }), facingEast = place("wall_straight", { x: 0, y: 0 }, { facing: "right" });
  assert.deepEqual([facingEast.at.width, facingEast.at.height], [facingSouth.at.height, facingSouth.at.width]);
});

test("the traveller as drawn eases after their steps, so steps that arrive unevenly still draw evenly", () => {
  // Steps of 0.1 tile reaching the scene two at a time, every other frame, drawn over eight frames at 60 a second.
  const arrived = [0, 0.2, 0.2, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8];
  const drawn = [];
  arrived.slice(1).reduce((at, x) => { const next = drawnTowards(at, { x, y: 0 }, 1 / 60); drawn.push(next.x - at.x); return next; }, { x: 0, y: 0 });
  const [jerky, eased] = [0.2, Math.max(...drawn) - Math.min(...drawn)];
  assert.ok(eased < jerky / 2, `${eased}`);
});

test("the traveller as drawn jumps straight to a new place far away", () => {
  assert.deepEqual(drawnTowards({ x: 0, y: 0 }, { x: 10, y: 4 }, 1 / 60), { x: 10, y: 4 });
});

test("the traveller as drawn stays where they stand once caught up", () => {
  assert.deepEqual(drawnTowards({ x: 3, y: 4 }, { x: 3, y: 4 }, 1 / 60), { x: 3, y: 4 });
});

test("the English island is the English learner's home, so none of its doors leads back to the home page", () => {
  assert.deepEqual(ENGLISH_ISLAND.doors.filter(({ href }) => href === "/").map(door => door.id), []);
});

test("the courtyard can only be left through its gate: nothing south of the wall can be walked to", () => {
  const { layout } = ENGLISH_COURTYARD;
  const wallRow = 14;
  const outside = [...reachableFrom(ENGLISH_COURTYARD, layout.start)].filter(key => Number(key.split(",")[1]) >= wallRow);
  assert.deepEqual(outside, []);
});

test("the traveller can move from where they start in every place (their feet fit there, touching no one)", () => {
  const stuck = PLACES.filter(([, { layout }]) => {
    const blocked = blockedTilesWithOpenGates(layout, []);
    return !fitsAt(layout.start, (x, y) => isBlocked(layout.map, blocked, x, y));
  }).map(([name]) => name);
  assert.deepEqual(stuck, []);
});
