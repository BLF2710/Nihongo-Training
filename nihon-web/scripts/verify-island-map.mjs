// The island map's rules: fog clearing with progress, never blocking without it, layouts and the camera, and the next step.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { backdropCamera, BRIDGED_ISLANDS, cameraTransform, climbProgress, courseProgress, islandState, ISLANDS, LANDSCAPE_LAYOUT, layoutFor, nextCourseStep, PORTRAIT_LAYOUT } from "../src/lib/islandMap.ts";

import { parseMapTimeSetting, timeOfDayAt, timeOfDayFor } from "../src/lib/timeOfDay.ts";
import { islandGrowth, sessionsOf, spreadStage, GAME_KINDS } from "../src/lib/islandGrowth.ts";
const progress = (completedLessons, completedUnits = 0) => ({ completedLessons, completedUnits });
const openIds = p => ISLANDS.filter(island => islandState(island.id, p).status === "open").map(island => island.id);

const OUTLYING = ["fuji", "harbour", "teahouse", "belltower", "onsen"];

test("a new learner sees Home, Lessons, Kana and the outlying places; the other islands are in fog", () => {
  assert.deepEqual(openIds(progress(0)), ["home", "lessons", "kana", ...OUTLYING]);
});

test("each finished lesson clears more fog: practice, then review, then games", () => {
  assert.deepEqual(openIds(progress(1)), ["home", "lessons", "practice", "kana", ...OUTLYING]);
  assert.deepEqual(openIds(progress(2)), ["home", "lessons", "practice", "review", "kana", ...OUTLYING]);
  assert.deepEqual(openIds(progress(3)), ["home", "lessons", "practice", "games", "review", "kana", ...OUTLYING]);
});

test("kanji clears when Unit 1 is complete", () => {
  assert.equal(islandState("kanji", progress(5, 0)).status, "fogged");
  assert.equal(islandState("kanji", progress(5, 1)).status, "open");
});

test("fog explains how many lessons are left", () => {
  assert.deepEqual(islandState("games", progress(0)), { status: "fogged", hint: "Finish 3 more lessons to clear the fog." });
  assert.deepEqual(islandState("games", progress(2)), { status: "fogged", hint: "Finish 1 more lesson to clear the fog." });
  assert.deepEqual(islandState("practice", progress(0)), { status: "fogged", hint: "Finish your first lesson to clear the fog." });
});

test("without progress nothing is fogged, so an error never blocks an island", () => {
  assert.equal(openIds(null).length, ISLANDS.length);
});

test("progress counts every level and ignores placeholder units", () => {
  const units = [{ completedLessons: 5, completed: true }, { completedLessons: 2, completed: false }, { completedLessons: 9, completed: true, isPlaceholder: true }];
  assert.deepEqual(courseProgress(units), { completedLessons: 7, completedUnits: 1 });
});

test("every island has a placement in both layouts, and every link is an app path", () => {
  for (const layout of [LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT]) for (const island of ISLANDS) {
    const place = layout.placements[island.id];
    // The ring stays on the stage; outlying places may sit partly past its edge (wide screens show them whole).
    const margin = OUTLYING.includes(island.id) ? 0.1 : 0;
    assert.ok(place.x > -margin && place.x < 1 + margin && place.y > 0 && place.y < 1, island.id);
  }
  for (const island of ISLANDS) for (const destination of island.destinations) assert.match(destination.href, /^\/([a-z]|$)/);
  assert.equal(new Set(ISLANDS.map(island => island.mark)).size, ISLANDS.length);
});

test("tall screens get the portrait layout", () => {
  assert.equal(layoutFor(390, 700), PORTRAIT_LAYOUT);
  assert.equal(layoutFor(1366, 650), LANDSCAPE_LAYOUT);
});

test("the camera brings the chosen island to the target point", () => {
  assert.equal(cameraTransform({ x: 0.5, y: 0.5, scale: 1 }, { x: 0.5, y: 0.5 }, 1), "translate(0.00%, 0.00%) scale(1)");
  assert.equal(cameraTransform({ x: 0.25, y: 0.5, scale: 1 }, { x: 0.35, y: 0.5 }, 2), "translate(-15.00%, -50.00%) scale(2)");
});

const unit = (overrides) => ({ id: "u1", number: 1, completedLessons: 0, completed: false, allowed: true, assessmentUnlocked: false, assessmentPassed: false, lessons: [], ...overrides });
const lesson = (slug, overrides = {}) => ({ slug, title: slug, isPlaceholder: false, allowed: true, completed: false, ...overrides });

test("the next step is the next open lesson", () => {
  const step = nextCourseStep([unit({ lessons: [lesson("a", { completed: true }), lesson("b")] })]);
  assert.deepEqual(step, { title: "b", detail: "Unit 1 · next lesson", href: "/lessons/japanese/b" });
});

test("the next step is the assessment once a unit's lessons are done", () => {
  assert.equal(nextCourseStep([unit({ assessmentUnlocked: true, lessons: [lesson("a", { completed: true })] })]).href, "/quizzes/u1");
});

test("with everything complete or locked, the next step is the unit list", () => {
  assert.equal(nextCourseStep([unit({ completed: true })]).href, "/lessons");
  assert.equal(nextCourseStep([unit({ allowed: false })]).href, "/lessons");
});

test("a coastline is the same for the same seed and differs between seeds", async () => {
  const { coastlinePath } = await import("../src/lib/islandCoastline.ts");
  const options = { radiusX: 118, radiusY: 54, seed: 3 };
  assert.equal(coastlinePath(options), coastlinePath(options));
  assert.notEqual(coastlinePath(options), coastlinePath({ ...options, seed: 4 }));
  assert.match(coastlinePath(options), /^M.* Z$/);
});

test("a coastline wobbles but keeps room for a landmark in the middle", async () => {
  const { coastlinePoints } = await import("../src/lib/islandCoastline.ts");
  for (let seed = 1; seed <= 50; seed++) for (const point of coastlinePoints({ radiusX: 100, radiusY: 50, seed })) {
    const radius = Math.hypot(point.x / 100, point.y / 50);
    assert.ok(radius > 0.6 && radius < 1.4, `seed ${seed}: ${radius}`);
  }
});

test("islets sit just off the coast", async () => {
  const { isletPlacements } = await import("../src/lib/islandCoastline.ts");
  for (const islet of isletPlacements({ radiusX: 100, radiusY: 50, seed: 9 }, 3)) assert.ok(Math.hypot(islet.x / 100, islet.y / 50) > 1.2);
});

test("bridges run from Home's shore to each island's shore, never through either island", async () => {
  const { bridgeSpan } = await import("../src/lib/islandMap.ts");
  for (const layout of [LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT]) for (const island of BRIDGED_ISLANDS) {
    const { start, end } = bridgeSpan(layout, island.id);
    const home = { x: layout.placements.home.x * layout.aspect * 100, y: layout.placements.home.y * 100 };
    const target = { x: layout.placements[island.id].x * layout.aspect * 100, y: layout.placements[island.id].y * 100 };
    const centres = Math.hypot(target.x - home.x, target.y - home.y), span = Math.hypot(end.x - start.x, end.y - start.y);
    assert.ok(span > 0 && span < centres * 0.8, `${island.id}: span ${span.toFixed(1)} of ${centres.toFixed(1)}`);
  }
});

test("the boat's lane keeps clear of every island, its landmark and its label", async () => {
  const { drawingScale } = await import("../src/lib/islandMap.ts");
  const BOAT_RADIUS = 3.5, LABEL = { halfWidth: 8, height: 6 };
  for (const layout of [LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT]) {
    const route = layout.scenery.boatRoute;
    if (!route) continue;
    // Each waypoint, and the midpoint of each leg, checked against generous footprints (the widest possible coast).
    const samples = route.flatMap((point, index) => index ? [{ x: (point.x + route[index - 1].x) / 2, y: (point.y + route[index - 1].y) / 2 }, point] : [point]);
    for (const island of ISLANDS) {
      const place = layout.placements[island.id], k = drawingScale(layout, place);
      const centre = { x: place.x * layout.aspect * 100, y: place.y * 100 };
      for (const point of samples) {
        const inCoast = Math.hypot((point.x - centre.x) / (160 * k + BOAT_RADIUS), (point.y - centre.y) / (75 * k + BOAT_RADIUS)) < 1;
        const inLandmark = Math.abs(point.x - centre.x) < 60 * k + BOAT_RADIUS && point.y > centre.y - 150 * k - BOAT_RADIUS && point.y < centre.y;
        const inLabel = Math.abs(point.x - centre.x) < LABEL.halfWidth + BOAT_RADIUS && point.y > centre.y + 60 * k - BOAT_RADIUS && point.y < centre.y + 60 * k + LABEL.height + BOAT_RADIUS;
        assert.ok(!inCoast && !inLandmark && !inLabel, `${island.id} at ${point.x},${point.y}`);
      }
    }
  }
});

test("Home's islet sits between its Kanji and Kana bridges", async () => {
  const { bridgeDirections, homeIsletDirection } = await import("../src/lib/islandMap.ts");
  const angle = point => Math.atan2(point.y, point.x);
  for (const layout of [LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT]) {
    const ids = BRIDGED_ISLANDS.map(island => island.id);
    const directions = bridgeDirections(layout, "home");
    const [kanji, kana] = [directions[ids.indexOf("kanji")], directions[ids.indexOf("kana")]].map(angle);
    const islet = angle(homeIsletDirection(layout));
    assert.ok(islet > Math.min(kanji, kana) && islet < Math.max(kanji, kana));
  }
});

test("the climb up Fuji counts each level's completed units and reaches a level when all are done", () => {
  const levelOf = id => /^japanese-(n\d)/.exec(id)?.[1].toUpperCase() ?? null;
  const units = [
    { id: "japanese-n5-unit-1", completedLessons: 4, completed: true }, { id: "japanese-n5-unit-2", completedLessons: 4, completed: true },
    { id: "japanese-n4-unit-1", completedLessons: 2, completed: false }, { id: "japanese-n3-unit-1", completedLessons: 0, completed: false, isPlaceholder: true },
  ];
  assert.deepEqual(climbProgress(units, ["N5", "N4", "N3"], levelOf), [
    { level: "N5", completedUnits: 2, totalUnits: 2, isReached: true },
    { level: "N4", completedUnits: 0, totalUnits: 1, isReached: false },
    { level: "N3", completedUnits: 0, totalUnits: 0, isReached: false },
  ]);
});

test("only the six ring islands have bridges; the outlying places have none", async () => {
  const { bridgeDirections } = await import("../src/lib/islandMap.ts");
  assert.equal(BRIDGED_ISLANDS.length, 6);
  for (const id of OUTLYING) assert.deepEqual(bridgeDirections(LANDSCAPE_LAYOUT, id), []);
  assert.equal(bridgeDirections(LANDSCAPE_LAYOUT, "home").length, 6);
});

test("the map's mood follows the clock: dawn 5–8, day 8–16, dusk 16–18, night otherwise", () => {
  const moods = [0, 4, 5, 7, 8, 15, 16, 17, 18, 23].map(timeOfDayAt);
  assert.deepEqual(moods, ["night", "night", "dawn", "dawn", "day", "day", "dusk", "dusk", "night", "night"]);
});

test("a mood chosen on the Time island holds whatever the hour; following the clock does not", () => {
  assert.deepEqual([6, 12, 22].map(hour => timeOfDayFor("dusk", hour)), ["dusk", "dusk", "dusk"]);
  assert.deepEqual([6, 12, 22].map(hour => timeOfDayFor("clock", hour)), ["dawn", "day", "night"]);
});

test("a stored time setting that is missing or unknown means following the clock", () => {
  assert.deepEqual([null, "", "noon", "night"].map(parseMapTimeSetting), ["clock", "clock", "clock", "night"]);
});

test("the sky's camera brings the chosen island to the same spot as the islands' camera", () => {
  const stage = { width: 1200, height: 750 }, stageOffset = { x: 83, y: 9 }, place = { x: 0.06, y: 0.8, scale: 0.75 }, target = { x: 0.33, y: 0.5 };
  const sky = backdropCamera({ placement: place, target, zoom: 1.7, stage, stageOffset });
  const onScreen = share => ({ x: stageOffset.x + share.x * stage.width, y: stageOffset.y + share.y * stage.height });
  const island = onScreen(place);
  const moved = { x: sky.x + island.x * sky.zoom, y: sky.y + island.y * sky.zoom };
  assert.deepEqual([moved.x, moved.y].map(Math.round), [onScreen(target).x, onScreen(target).y].map(Math.round));
});

const facts = (overrides = {}) => ({
  completedLessons: 0, levelsCompleted: 0, listeningSessions: 0, speakingSessions: 0, readingSessions: 0, gamesPlayed: 0, cardsLearned: 0, matureCards: 0,
  kanjiMastered: 0, kanaMastered: 0, ...overrides,
});

test("an island grows a step each time its measure reaches the next threshold", () => {
  const stages = [0, 4, 5, 19, 20, 50, 400].map(completedLessons => islandGrowth("lessons", facts({ completedLessons })).stage);
  assert.deepEqual(stages, [0, 0, 1, 1, 2, 3, 3]);
});

test("growth says what the next step needs, and nothing once fully grown", () => {
  assert.deepEqual(islandGrowth("kanji", facts({ kanjiMastered: 12 })).tracks, [{ measure: "kanjiMastered", stage: 1, maxStage: 3, value: 12, nextAt: 50 }]);
  assert.equal(islandGrowth("kanji", facts({ kanjiMastered: 150 })).tracks[0].nextAt, null);
});

test("Home's torii grows with each JLPT level completed, up to N1", () => {
  assert.deepEqual([0, 1, 3, 5].map(levelsCompleted => islandGrowth("home", facts({ levelsCompleted })).stage), [0, 1, 3, 5]);
});

test("an island whose measure is unknown, or that does not grow, has no growth", () => {
  assert.equal(islandGrowth("review", facts({ matureCards: null })), null);
  assert.equal(islandGrowth("harbour", facts()), null);
});

test("Games grows from the particle game only", () => {
  const practice = [{ kind: "listening", sessions: 4 }, { kind: "particles", sessions: 9 }, { kind: "mock-exam", sessions: 2 }];
  assert.equal(sessionsOf(practice, GAME_KINDS), 9);
});

test("Practice grows a corner for each skill, so each skill's sessions count on their own", () => {
  const growth = islandGrowth("practice", facts({ listeningSessions: 12, speakingSessions: 0, readingSessions: 3 }));
  assert.deepEqual(growth.tracks.map(track => track.stage), [2, 0, 1]);
});

test("an island with several tracks grows by their steps added up", () => {
  const growth = islandGrowth("review", facts({ cardsLearned: 120, matureCards: 10 }));
  assert.deepEqual([growth.stage, growth.maxStage], [3, 6]);
});

test("a previewed total step is shared among the tracks in turn, never past a track's last step", () => {
  assert.deepEqual([spreadStage(4, [3, 3, 3]), spreadStage(5, [3, 1]), spreadStage(9, [2, 2])], [[2, 1, 1], [3, 1], [2, 2]]);
});
