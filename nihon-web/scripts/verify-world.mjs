// The world (docs/WORLD.md): tall grass, when it starts a battle, and the wild paths' maps (every exit reachable, and
// the grass impossible to avoid entirely). Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { isBlocked, parseTownMap, terrainAt, withTerrain } from "../src/lib/errands/townMap.ts";
import { blockedTilesWithOpenGates } from "../src/lib/errands/village.ts";
import { AFTER_BATTLE, ENCOUNTER_CHANCE, FRESH_GRASS_WALK, SAFE_GRASS_STEPS, stepOnto } from "../src/lib/world/grassEncounters.ts";
import { allWildRows, arrivalOn, exitHref, isHeldBack, nearbyExit, openRowsOf, routeHref, routeRewardedBy, rowNames } from "../src/lib/world/routes.ts";
import { fitsAt, TALK_DISTANCE } from "../src/lib/errands/movement.ts";
import { islandSceneOf, ISLAND_SCENES } from "../src/data/world/islandScenes.ts";
import { VILLAGE_DOORS, VILLAGE_SQUARE, villageArrivalFrom } from "../src/data/village/villageSquare.ts";
import { afterRound, kanaInPlay, startChallenge, teamOf } from "../src/lib/world/challenges.ts";
import { CHALLENGERS } from "../src/data/world/challengers.ts";
import { ENEMY_MAX_HP, PLAYER_MAX_HP, startBattle } from "../src/lib/kanaWilds/battle.ts";
import { BASIC_HIRAGANA, HIRAGANA_ROWS } from "../src/lib/kanaWilds/gojuon.ts";
import { isIslandId, LANDSCAPE_LAYOUT } from "../src/lib/islandMap.ts";
import { routeById, WILD_ROUTES } from "../src/data/world/routes.ts";

const NONE_BEATEN = new Set(), ALL_BEATEN = new Set(["chun", "tama", "pon", "sensei"]);

// ---- tall grass

test("tall grass is written w and can be walked through", () => {
  const map = parseTownMap(["Tw."]);
  assert.equal(terrainAt(map, 1, 0), "tallgrass");
  const blocked = blockedTilesWithOpenGates({ map, start: { x: 1, y: 0 }, buildings: [], gates: [], lanterns: [], villagers: [] }, []);
  assert.equal(isBlocked(map, blocked, 1, 0), false);
});

test("cherry trees, bamboo and the goldfish pond stand in the way; fallen petals don't", () => {
  const map = parseTownMap(["SBgp"]);
  const blocked = blockedTilesWithOpenGates({ map, start: { x: 3, y: 0 }, buildings: [], gates: [], lanterns: [], villagers: [] }, []);
  assert.deepEqual([0, 1, 2, 3].map(x => isBlocked(map, blocked, x, 0)), [true, true, true, false]);
});

test("a map can have tiles changed, leaving the original as it was", () => {
  const map = parseTownMap(["TT"]);
  assert.equal(terrainAt(withTerrain(map, [{ x: 1, y: 0 }], "path"), 1, 0), "path");
  assert.equal(terrainAt(map, 1, 0), "tree");
});

test("there is no terrain outside the map", () => {
  assert.equal(terrainAt(parseTownMap(["w"]), 3, 0), null);
});

// ---- encounters

test("a step onto tall grass starts a battle when the roll is under the chance", () => {
  assert.equal(stepOnto(FRESH_GRASS_WALK, "tallgrass", ENCOUNTER_CHANCE - 0.01).isEncounter, true);
});

test("a step onto tall grass with a roll over the chance starts nothing", () => {
  assert.equal(stepOnto(FRESH_GRASS_WALK, "tallgrass", ENCOUNTER_CHANCE).isEncounter, false);
});

test("a step anywhere but tall grass never starts a battle", () => {
  for (const terrain of ["grass", "path", "bridge", null]) assert.equal(stepOnto(FRESH_GRASS_WALK, terrain, 0).isEncounter, false, terrain);
});

test("after a battle, the next few grass steps are safe whatever the roll", () => {
  let walk = AFTER_BATTLE;
  for (let step = 0; step < SAFE_GRASS_STEPS; step++) {
    const result = stepOnto(walk, "tallgrass", 0);
    assert.equal(result.isEncounter, false, `safe step ${step + 1}`);
    walk = result.walk;
  }
  assert.equal(stepOnto(walk, "tallgrass", 0).isEncounter, true, "the grass is wild again after the safe steps");
});

test("safe steps are only used up in tall grass", () => {
  assert.deepEqual(stepOnto(AFTER_BATTLE, "path", 0).walk, AFTER_BATTLE);
});

// ---- the wild paths

const keyOf = ({ x, y }) => `${x},${y}`;
const neighbours = ({ x, y }) => [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];

/** The tiles reachable on foot from `from` (the layout's start by default), optionally treating tall grass as a wall. */
function reachable(layout, { from = layout.start, isGrassAvoided = false } = {}) {
  const blocked = blockedTilesWithOpenGates(layout, []);
  const isWall = ({ x, y }) => isBlocked(layout.map, blocked, x, y) || (isGrassAvoided && terrainAt(layout.map, x, y) === "tallgrass");
  const seen = new Set([keyOf(from)]), queue = [from];
  while (queue.length) {
    for (const next of neighbours(queue.shift())) {
      if (seen.has(keyOf(next)) || isWall(next)) continue;
      seen.add(keyOf(next)); queue.push(next);
    }
  }
  return seen;
}

/** A tile can be used (a door, an exit, a villager) when the traveller can stand on it or right next to it. */
const isWithinReach = (seen, tile) => [tile, ...neighbours(tile)].some(next => seen.has(keyOf(next)));
const isStandable = (layout, { x, y }) => !isBlocked(layout.map, blockedTilesWithOpenGates(layout, []), x, y);
const centreDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

for (const route of WILD_ROUTES) {
  test(`${route.id}: the traveller arrives at each end on open ground, out of the grass`, () => {
    for (const exit of route.exits) {
      assert.equal(isStandable(route.layout, exit.arrival), true, exit.label);
      assert.notEqual(terrainAt(route.layout.map, exit.arrival.x, exit.arrival.y), "tallgrass", "no battle the moment they arrive");
    }
  });

  test(`${route.id}: arriving at an end doesn't put the traveller in reach of leaving again`, () => {
    for (const exit of route.exits) {
      // The traveller stands at the arrival point itself (positions are in tiles; a tile's centre is at +0.5).
      assert.equal(nearbyExit(exit.arrival, route.exits), null, exit.label);
    }
  });

  test(`${route.id}: every exit can be walked to from either end`, () => {
    for (const end of route.exits) {
      const seen = reachable(route.layout, { from: end.arrival });
      for (const exit of route.exits) assert.ok(seen.has(keyOf(exit.tile)), `${exit.label}, from ${end.island}`);
    }
  });

  test(`${route.id}: crossing to the far island means going through tall grass`, () => {
    const home = route.exits.find(exit => exit.island === route.between[0]);
    const far = route.exits.find(exit => exit.island === route.between[1]);
    assert.ok(home && far, "an exit at each end");
    assert.equal(reachable(route.layout, { from: home.arrival, isGrassAvoided: true }).has(keyOf(far.tile)), false);
  });

  test(`${route.id}: its grass holds real hiragana rows, at least once every challenger is beaten`, () => {
    const rows = HIRAGANA_ROWS.map(({ row }) => row);
    const everyRow = [...route.wildRows, ...(route.rewardRows?.rows ?? [])];
    assert.ok(openRowsOf(route, ALL_BEATEN).length > 0 && everyRow.every(row => rows.includes(row)));
  });

  test(`${route.id}: its exits lead to its two islands`, () => {
    assert.deepEqual(route.exits.map(exit => exit.island).sort(), [...route.between].sort());
    assert.ok(route.between.every(isIslandId));
  });

  test(`${route.id}: it starts at Home and its far end has an island to walk onto`, () => {
    assert.equal(route.between[0], "home");
    assert.ok(islandSceneOf(route.between[1]), route.between[1]);
  });
}

test("a path is found by its id, and an unknown id finds none", () => {
  assert.equal(routeById("home-kana")?.between[1], "kana");
  assert.equal(routeById("nowhere"), null);
});

test("an exit is in reach only when standing near it", () => {
  const exits = [{ tile: { x: 1, y: 6 }, arrival: { x: 4, y: 7 }, island: "home", label: "Back to Home" }];
  assert.equal(nearbyExit({ x: 1.5, y: 6.5 }, exits)?.island, "home");
  assert.equal(nearbyExit({ x: 8, y: 6.5 }, exits), null);
});

test("leaving for Home goes to the village square, and for another island to that island, saying which path", () => {
  assert.equal(exitHref({ island: "home" }, "home-kana"), "/village?from=home-kana");
  assert.equal(exitHref({ island: "kana" }, "home-kana"), "/islands/kana?from=home-kana");
});

test("a path opens at the end the traveller comes from, and at the Home end when that's unknown", () => {
  const meadow = routeById("home-kana");
  const endAt = island => meadow.exits.find(exit => exit.island === island).arrival;
  assert.equal(routeHref("home-kana", "kana"), "/wilds/home-kana?from=kana");
  assert.deepEqual(arrivalOn(meadow, "kana"), endAt("kana"));
  assert.deepEqual(arrivalOn(meadow, "home"), endAt("home"));
  assert.deepEqual(arrivalOn(meadow, null), endAt("home"));
  assert.deepEqual(arrivalOn(meadow, "practice"), endAt("home"));
});

test("the quick battle meets the rows open on every path, in table order", () => {
  assert.deepEqual(allWildRows(WILD_ROUTES, NONE_BEATEN), ["vowels", "k", "n", "h"]);
  assert.deepEqual(allWildRows(WILD_ROUTES, ALL_BEATEN), HIRAGANA_ROWS.map(({ row }) => row), "every row once all are beaten");
});

// ---- challenger rewards: rows held back from the grass until a win (docs/KANA-BATTLE.md section 9)

const riverside = routeById("home-practice"), forest = routeById("home-games");

test("the riverside grass is quiet until Chun is beaten, then holds the さ and た rows", () => {
  assert.deepEqual(openRowsOf(riverside, NONE_BEATEN), []);
  assert.equal(isHeldBack(riverside, NONE_BEATEN), true);
  assert.deepEqual(openRowsOf(riverside, new Set(["chun"])), ["s", "t"]);
  assert.equal(isHeldBack(riverside, new Set(["chun"])), false);
});

test("the forest holds the な and は rows; the stone path is quiet until Tama is beaten, then holds the rest of the table", () => {
  assert.deepEqual(openRowsOf(forest, ALL_BEATEN), ["n", "h"]);
  const stonePath = routeById("home-lessons");
  assert.deepEqual(openRowsOf(stonePath, new Set(["chun", "pon"])), []);
  assert.deepEqual(openRowsOf(stonePath, new Set(["tama"])), ["m", "y", "r", "w", "final-n"]);
});

test("the meadow's rows are never held back", () => {
  assert.deepEqual(openRowsOf(routeById("home-kana"), NONE_BEATEN), ["vowels", "k"]);
});

test("Chun and Tama each fill one path's grass; Pon teaches Sharp Eyes and Sensei opens evolution instead", () => {
  assert.equal(routeRewardedBy(WILD_ROUTES, "chun").id, "home-practice");
  assert.equal(routeRewardedBy(WILD_ROUTES, "tama").id, "home-lessons");
  assert.deepEqual([routeRewardedBy(WILD_ROUTES, "pon"), routeRewardedBy(WILD_ROUTES, "sensei")], [undefined, undefined]);
  assert.deepEqual([CHALLENGERS.pon.reward, CHALLENGERS.sensei.reward], ["sharp-eyes", "evolution"]);
});

test("every island with a challenger has a wild path to it, its own theme, and every challenger stands on one", () => {
  assert.deepEqual(ISLAND_SCENES.map(scene => scene.island).sort(), ["games", "kana", "lessons", "practice"]);
  assert.equal(new Set(ISLAND_SCENES.map(scene => scene.theme)).size, ISLAND_SCENES.length, "each island looks its own");
  assert.equal(islandSceneOf("lessons").theme, "maple");
  for (const scene of ISLAND_SCENES) assert.ok(WILD_ROUTES.some(route => route.between[1] === scene.island), scene.island + " has a path");
});

// ---- the traveller can move off every spot they arrive at: their feet (wider than a tile's edge) touch nothing
// solid there, so they aren't stuck, or hidden, inside a wall

const feetFit = (layout, at) => {
  const blocked = blockedTilesWithOpenGates(layout, []);
  return fitsAt(at, (x, y) => isBlocked(layout.map, blocked, x, y));
};

test("coming back off each path, the traveller's feet fit where they appear in the village", () => {
  for (const route of WILD_ROUTES) assert.ok(feetFit(VILLAGE_SQUARE, villageArrivalFrom(route.id)), route.id);
});

test("arriving on an island, the traveller's feet fit by its bridge", () => {
  for (const scene of ISLAND_SCENES) assert.ok(feetFit(scene.layout, scene.layout.start), scene.island);
});

test("arriving at either end of a path, the traveller's feet fit there", () => {
  for (const route of WILD_ROUTES) for (const exit of route.exits) assert.ok(feetFit(route.layout, exit.arrival), `${route.id}: ${exit.label}`);
});

// ---- each path runs the way its island lies from Home on the island map

/** The side of a w × h map a tile is on, by its larger offset from the centre. */
const sideOf = ({ x, y }, width, height) => {
  const dx = (x + 0.5) / width - 0.5, dy = (y + 0.5) / height - 0.5;
  return Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "west" : "east") : (dy < 0 ? "north" : "south");
};
const OPPOSITE = { north: "south", south: "north", east: "west", west: "east" };

test("each path heads the way its island lies from Home on the (landscape) island map", () => {
  const { placements, aspect } = LANDSCAPE_LAYOUT;
  for (const route of WILD_ROUTES) {
    const home = placements.home, island = placements[route.between[1]];
    const dx = (island.x - home.x) * aspect, dy = island.y - home.y;
    const expected = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "west" : "east") : (dy < 0 ? "north" : "south");
    assert.equal(route.heading, expected, route.id);
  }
  assert.deepEqual(Object.fromEntries(WILD_ROUTES.map(route => [route.id, route.heading])),
    { "home-kana": "east", "home-practice": "west", "home-games": "south", "home-lessons": "north" });
});

test("a path's Home end is on the side it comes from, and its island end on the side it heads to", () => {
  for (const { id, heading, exits, layout: { map } } of WILD_ROUTES) {
    const sides = Object.fromEntries(exits.map(exit => [exit.island === "home" ? "home" : "island", sideOf(exit.tile, map.width, map.height)]));
    assert.deepEqual(sides, { home: OPPOSITE[heading], island: heading }, id);
  }
});

test("a path heading north or south is a tall map, east or west a wide one", () => {
  for (const { id, heading, layout: { map } } of WILD_ROUTES) {
    assert.equal(map.height > map.width, heading === "north" || heading === "south", id);
  }
});

test("each road out of the village leaves on the side its island lies", () => {
  const { map } = VILLAGE_SQUARE;
  for (const route of WILD_ROUTES) {
    const gate = VILLAGE_DOORS.find(door => door.id === `path-${route.id}`);
    assert.equal(sideOf(gate.tile, map.width, map.height), route.heading, route.id);
  }
});

test("each island's bridge is on the side facing Home", () => {
  for (const scene of ISLAND_SCENES) {
    const route = WILD_ROUTES.find(candidate => candidate.between[1] === scene.island);
    const bridge = scene.doors.find(door => door.id === "path-back");
    assert.equal(terrainAt(scene.layout.map, bridge.tile.x, bridge.tile.y), "bridge", scene.island);
    assert.equal(sideOf(bridge.tile, scene.layout.map.width, scene.layout.map.height), OPPOSITE[route.heading], scene.island);
  }
});

test("the Lessons island's pagoda stands at the head of the stepping stones from the bridge, and is the mock exam", () => {
  const lessons = islandSceneOf("lessons");
  const pagoda = lessons.layout.buildings.find(building => building.look === "pagoda");
  const bridge = lessons.doors.find(door => door.id === "path-back");
  assert.equal(pagoda?.id, "mock-exam");
  assert.ok(Math.abs(pagoda.x + pagoda.width / 2 - (bridge.tile.x + 1)) <= 1, "on the bridge's line");
});

test("the held-back kana are the ones the API holds back from catches (ids 11–20 for Chun, 31–46 for Tama)", () => {
  const idsOf = rows => BASIC_HIRAGANA.filter(item => rows.includes(item.row)).map(item => item.id);
  const range = (first, last) => Array.from({ length: last - first + 1 }, (_, index) => first + index);
  assert.deepEqual(idsOf(routeRewardedBy(WILD_ROUTES, "chun").rewardRows.rows), range(11, 20));
  assert.deepEqual(idsOf(routeRewardedBy(WILD_ROUTES, "tama").rewardRows.rows), range(31, 46));
});

test("rows are named by their first kana", () => {
  assert.equal(rowNames(["s", "t"]), "さ and た");
  assert.equal(rowNames(["m", "y", "r", "w", "final-n"]), "ま, や, ら, わ and ん");
  assert.equal(rowNames(["k"]), "か");
});

// ---- the islands on foot

for (const scene of ISLAND_SCENES) {
  const route = WILD_ROUTES.find(candidate => candidate.between[1] === scene.island);

  test(`${scene.island} island: the traveller arrives on open ground`, () => {
    assert.equal(isStandable(scene.layout, scene.layout.start), true);
  });

  test(`${scene.island} island: every door can be walked up to`, () => {
    const seen = reachable(scene.layout);
    for (const door of scene.doors) assert.ok(isWithinReach(seen, door.tile), door.label);
  });

  test(`${scene.island} island: its challenger can be walked up to`, () => {
    const { character } = CHALLENGERS[scene.challenger];
    const resident = scene.layout.villagers.find(villager => villager.id === character);
    assert.ok(resident, "the challenger is on the island");
    assert.ok(isWithinReach(reachable(scene.layout), resident.tile));
  });

  test(`${scene.island} island: the bridge leads back onto its path, at the island end`, () => {
    assert.ok(route, "a path reaches the island");
    const back = scene.doors.find(door => door.id === "path-back");
    assert.equal(back?.href, routeHref(route.id, scene.island));
  });

  test(`${scene.island} island: its lanterns stand on open ground`, () => {
    for (const lantern of scene.layout.lanterns) assert.equal(isStandable(scene.layout, lantern), true, keyOf(lantern));
  });

  test(`${scene.island} island: arriving doesn't put the traveller in reach of a door`, () => {
    // The traveller stands at the start point itself (positions are in tiles; a door tile's centre is at +0.5).
    for (const door of scene.doors) assert.ok(centreDistance(scene.layout.start, { x: door.tile.x + 0.5, y: door.tile.y + 0.5 }) > TALK_DISTANCE, door.label);
  });
}

test("every challenger waits on exactly one island", () => {
  const standing = ISLAND_SCENES.map(scene => scene.challenger).sort();
  assert.deepEqual(standing, Object.keys(CHALLENGERS).sort());
});

test("an island no path reaches has no scene", () => {
  assert.equal(islandSceneOf("kanji"), null);
});

// ---- the village's roads out

test("coming back off each path, the traveller appears on open ground at the end of its road, out of the gate's reach", () => {
  for (const route of WILD_ROUTES) {
    const arrival = villageArrivalFrom(route.id), gate = VILLAGE_DOORS.find(door => door.id === `path-${route.id}`);
    assert.ok(arrival && gate, route.id);
    assert.equal(isStandable(VILLAGE_SQUARE, arrival), true, route.id);
    assert.ok(centreDistance(arrival, gate.tile) > TALK_DISTANCE, route.id);
  }
  assert.equal(villageArrivalFrom("nowhere"), null);
});

test("each road out of the village runs on through the trees at the edge", () => {
  const { map } = VILLAGE_SQUARE;
  const edge = ({ x, y }) => x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1;
  for (const gate of VILLAGE_DOORS.filter(door => door.id.startsWith("path-"))) {
    const opening = neighbours(gate.tile).find(tile => edge(tile) && terrainAt(map, tile.x, tile.y) === "path");
    assert.ok(opening, gate.label);
  }
});

for (const route of WILD_ROUTES) {
  test(`${route.id}: its lanterns stand on open ground`, () => {
    for (const lantern of route.layout.lanterns) assert.equal(isStandable(route.layout, lantern), true, keyOf(lantern));
  });
}

test("each road out of the village can be walked to and opens a real path at its Home end", () => {
  const seen = reachable(VILLAGE_SQUARE);
  const gates = VILLAGE_DOORS.filter(door => door.id.startsWith("path-"));
  assert.deepEqual(gates.map(gate => gate.href).sort(), WILD_ROUTES.map(route => routeHref(route.id, "home")).sort());
  for (const gate of gates) assert.ok(isWithinReach(seen, gate.tile), gate.label);
});

// ---- challenges

const chun = CHALLENGERS.chun;
const won = (state, playerHp) => ({ ...state, playerHp, enemyHp: 0, phase: "over", outcome: "won", readings: { answered: 4, correct: 3 } });

test("a challenger's team is real hiragana, and a typo fails loudly", () => {
  assert.deepEqual(chun.team.map(kana => kana.kana), ["あ", "こ", "お"]);
  assert.deepEqual(CHALLENGERS.tama.team.map(kana => kana.kana), ["さ", "ち", "つ"]);
  assert.deepEqual(CHALLENGERS.pon.team.map(kana => kana.kana), ["ぬ", "ね", "は"]);
  assert.deepEqual(CHALLENGERS.sensei.team.map(kana => [kana.kana, kana.romaji, kana.vowel]), [["が", "ga", "a"], ["だ", "da", "a"], ["ば", "ba", "a"]]);
  assert.throws(() => teamOf("あx"), /not a basic or voiced hiragana/);
});

test("winning a round sends out the challenger's next kana, with the HP the player has left", () => {
  const challenge = startChallenge(chun);
  assert.equal(kanaInPlay(challenge).kana, "あ");
  const step = afterRound(challenge, won(startBattle(kanaInPlay(challenge), { isCatchable: false }), 21));
  assert.equal(step.kind, "next");
  assert.deepEqual([kanaInPlay(step.challenge).kana, step.challenge.playerHp, step.challenge.readings], ["こ", 21, { answered: 4, correct: 3 }]);
});

test("beating the last kana wins the challenge, with every round's readings", () => {
  let challenge = startChallenge(chun), step;
  for (const _ of chun.team) {
    step = afterRound(challenge, won(startBattle(kanaInPlay(challenge), { isCatchable: false }), PLAYER_MAX_HP));
    if (step.kind === "next") challenge = step.challenge;
  }
  assert.deepEqual(step, { kind: "over", summary: { outcome: "won", readings: { answered: 12, correct: 9 }, mistakes: [] } });
});

test("losing a round loses the challenge, and giving up leaves it", () => {
  const battle = startBattle(chun.team[0], { isCatchable: false });
  const lost = { ...battle, playerHp: 0, phase: "over", outcome: "lost" };
  assert.equal(afterRound(startChallenge(chun), lost).summary.outcome, "lost");
  const gaveUp = { ...battle, enemyHp: ENEMY_MAX_HP, phase: "over", outcome: "ran" };
  assert.equal(afterRound(startChallenge(chun), gaveUp).summary.outcome, "ran");
});

test("the kana mixed up in every round reach the end of the challenge, in order", () => {
  const mixUp = (kana, mistakenFor) => ({ kana, mistakenFor, way: "read" });
  const first = { ...won(startBattle(chun.team[0], { isCatchable: false }), 20), mistakes: [mixUp("あ", "お")] };
  const step = afterRound(startChallenge(chun), first);
  const second = { ...startBattle(chun.team[1], { isCatchable: false }), playerHp: 0, phase: "over", outcome: "lost", mistakes: [mixUp("こ", "に")] };
  assert.deepEqual(afterRound(step.challenge, second).summary.mistakes, [mixUp("あ", "お"), mixUp("こ", "に")]);
});

test("each challenger has their own signature defence", () => {
  assert.deepEqual(Object.fromEntries(Object.values(CHALLENGERS).map(({ id, defence }) => [id, defence])), { chun: "look-alikes", tama: "shout", pon: "stroke-reveal", sensei: "word-attack" });
});
