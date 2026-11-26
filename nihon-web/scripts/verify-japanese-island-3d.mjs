// The Japanese islands in real 3D: a 2.5D island read as a 3D one, the buildings, trees and people built in code for
// it, and how those people move. Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import { ISLANDS_IN_3D, ISLAND_SCENES, islandSceneOf } from "../src/data/world/islandScenes.ts";
import { TRAVELLER_MODEL, buildingModel, castModel, japaneseIsland3D, treeModel, villageSquare3D, wildRoute3D } from "../src/lib/world/japaneseIsland3D.ts";
import { canBuild } from "../src/components/world3d/japanese/japaneseModelMaker.ts";
import { BUILDING_BUILDERS } from "../src/components/world3d/japanese/buildings.ts";
import { BuiltPerson, chunRig, travellerRig } from "../src/components/world3d/japanese/people.ts";
import { Palette } from "../src/components/world3d/japanese/shapes.ts";
import { DEFAULT_TRAVELLER_LOOK } from "../src/lib/travellerLook.ts";
import { parseTownMap, tilesOf } from "../src/lib/errands/townMap.ts";
import { WATER_GAP, farShoreAround } from "../src/lib/world/farShore.ts";
import { TREE_BUILDERS } from "../src/components/world3d/japanese/trees.ts";
import { FallingPetals } from "../src/components/world3d/fallingPetals.ts";
import { PROP_BUILDERS } from "../src/components/world3d/japanese/props.ts";
import { tamaRig } from "../src/components/world3d/japanese/people.ts";
import { groundBlockedBy, propModel } from "../src/lib/world/islandProps.ts";
import { blockedTiles, tileKey } from "../src/lib/errands/townMap.ts";
import { pondsOf } from "../src/lib/world/ponds.ts";
import { bridgeSpans } from "../src/lib/world/bridges.ts";
import { deckHeightAt } from "../src/components/world3d/bridges.ts";
import { MOUNTAIN_MODEL, ROCK_MODEL } from "../src/lib/world/japaneseIsland3D.ts";
import { kuramaRig, ponRig, senseiRig, zenRig } from "../src/components/world3d/japanese/castRigs.ts";
import { hakaseRig, hatoRig, konRig, momoRig, tsuruRig } from "../src/components/world3d/japanese/villageCastRigs.ts";
import { JAPANESE_BUILDING_BUILDERS } from "../src/components/world3d/japanese/buildingBuilders.ts";
import { mergedByMaterial } from "../src/components/world3d/mergeStatic.ts";
import { TallGrass } from "../src/components/world3d/tallGrass.ts";
import { HOME_BUILDING_ID, VILLAGE_DOORS, VILLAGE_PROPS, VILLAGE_SQUARE, villageArrivalFrom } from "../src/data/village/villageSquare.ts";
import { withHomeSign } from "../src/lib/village/homeSign.ts";
import { WILD_ROUTES } from "../src/data/world/routes.ts";

const FROM_HOME_ARRIVALS = WILD_ROUTES.filter(route => route.between[0] === "home").map(route => villageArrivalFrom(route.id));

const kana = islandSceneOf("kana");
const kana3D = japaneseIsland3D(kana);
const isTree = ({ model }) => model.startsWith("tree:");

test("each building stands as a model of its look on its own ground, with its roof and sign", () => {
  const [hiragana] = kana.layout.buildings;
  const placed = kana3D.models.find(({ at }) => at.x === hiragana.x && at.y === hiragana.y);
  assert.deepEqual(placed, { model: buildingModel(hiragana.look), at: { x: hiragana.x, y: hiragana.y, width: hiragana.width, height: hiragana.height }, scale: 1, roof: hiragana.roof, sign: hiragana.sign });
});

test("the trees cover every tree tile, each of that tile's kind", () => {
  const covered = kana3D.models.filter(isTree).flatMap(({ model, at }) => tilesOf(at).map(key => `${key} ${model}`)).sort();
  const sakura = kana.layout.map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => terrain === "sakura" ? [`${x},${y} ${treeModel("sakura")}`] : [])).sort();
  assert.deepEqual(covered, sakura);
});

test("a block of two by two tree tiles grows one great tree", () => {
  const scene = { ...kana, layout: { ...kana.layout, map: parseTownMap(["SS.", "SS.", "..."]), buildings: [], villagers: [] } };
  assert.deepEqual(japaneseIsland3D(scene).models.filter(isTree).map(({ at }) => at), [{ x: 0, y: 0, width: 2, height: 2 }]);
});

test("the Kana island has its great cherry tree at the head of the petal square", () => {
  assert.ok(kana3D.models.some(({ model, at }) => model === treeModel("sakura") && at.width === 2 && at.x === 14 && at.y === 4));
});

test("cherry petals fall on a sakura island", () => {
  assert.equal(kana3D.weather, "petals");
});

test("trees take no ground of their own (their tiles are already blocked)", () => {
  assert.ok(kana3D.models.filter(isTree).every(({ isWalkable }) => isWalkable));
});

test("the island's challenger stands where they wait, as themselves", () => {
  const [chun] = kana.layout.villagers;
  assert.deepEqual(kana3D.people, [{ id: chun.id, model: castModel(chun.id), tile: chun.tile, facing: "down" }]);
});

test("the traveller is the learner's own, and the doors are the island's", () => {
  assert.deepEqual([kana3D.traveller, kana3D.doors], [TRAVELLER_MODEL, kana.doors]);
});

test("every model and person on the islands walked in 3D (and their far shores) can be built", () => {
  const scenes = ISLAND_SCENES.filter(scene => ISLANDS_IN_3D.has(scene.island)).map(japaneseIsland3D);
  const models = scenes.flatMap(scene => [...scene.models.map(({ model }) => model), ...scene.backdrop.map(({ model }) => model), ...scene.people.map(({ model }) => model), scene.traveller]);
  assert.deepEqual([...new Set(models)].filter(model => !canBuild(model)), []);
});

test("every building fits on its ground, roof and all", () => {
  const palette = new Palette();
  const buildings = ISLAND_SCENES.filter(scene => ISLANDS_IN_3D.has(scene.island)).flatMap(scene => scene.layout.buildings);
  const overhanging = buildings.flatMap(({ id, look, width, height: depth, roof, sign }) => {
    const build = BUILDING_BUILDERS.get(look);
    if (!build) return [`${id}: no builder`];
    const model = build(palette, { width, depth, roof, sign });
    model.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    return size.x <= width + 0.01 && size.z <= depth + 0.01 ? [] : [`${id}: ${size.x.toFixed(2)} × ${size.z.toFixed(2)}`];
  });
  assert.deepEqual(overhanging, []);
});

test("the traveller stands about a tile and a half tall, like the English island's people", () => {
  const { root } = travellerRig(new Palette(), DEFAULT_TRAVELLER_LOOK);
  const height = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y;
  assert.ok(height > 1.3 && height < 1.8, `${height}`);
});

/** A person after `seconds` of a motion, in small steps as frames would come. */
function after(person, motion, seconds) {
  person.play(motion);
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) person.update(1 / 60);
  return person;
}

test("walking swings the legs opposite ways", () => {
  const rig = chunRig(new Palette());
  after(new BuiltPerson(rig), "walk", 0.4);
  assert.ok(Math.sign(rig.leftLeg.rotation.x) === -Math.sign(rig.rightLeg.rotation.x) && rig.leftLeg.rotation.x !== 0);
});

test("stopping lets the legs come to rest", () => {
  const rig = travellerRig(new Palette(), DEFAULT_TRAVELLER_LOOK);
  after(after(new BuiltPerson(rig), "walk", 1), "idle", 1.5);
  assert.ok(Math.abs(rig.leftLeg.rotation.x) < 0.01, `${rig.leftLeg.rotation.x}`);
});

const shore = kana3D.shore;

test("the bridge off the island is carried on over the water to the far shore, and a path goes on from it", () => {
  const westBridgeRows = kana.layout.map.terrain.flatMap((row, y) => row[0] === "bridge" ? [y] : []);
  assert.deepEqual([shore.decks.map(({ x, y, width }) => [x, y, width]), shore.paths.map(({ y, width }) => [y, width > 0])],
    [westBridgeRows.map(y => [-WATER_GAP, y, WATER_GAP]), westBridgeRows.map(y => [y, true])]);
});

test("no hill rises on the near side of the island, between it and the camera", () => {
  assert.deepEqual(shore.hills.filter(({ y }) => y > kana.layout.map.height), []);
});

test("no hill stands on the path leaving the island", () => {
  const onPath = shore.hills.filter(hill => shore.paths.some(path => Math.abs(hill.y - path.y) < hill.radius && hill.x - hill.radius < path.x + path.width && hill.x + hill.radius > path.x));
  assert.deepEqual(onPath, []);
});

test("an island with no bridge at its edge has no deck to the far shore", () => {
  assert.deepEqual(farShoreAround(parseTownMap(["~~~", "~.~", "~~~"])).decks, []);
});

test("the far shore's trees keep off the paths", () => {
  const onPath = kana3D.backdrop.filter(isTree).filter(({ at }) => shore.paths.some(path => tilesOf(path).includes(`${at.x},${at.y}`)));
  assert.deepEqual(onPath, []);
});

test("a pagoda stands on the far shore of a sakura island", () => {
  assert.ok(kana3D.backdrop.some(({ model }) => model === buildingModel("pagoda")));
});

test("a great cherry tree stands taller than a small one", () => {
  const heightOf = at => new THREE.Box3().setFromObject(TREE_BUILDERS.get("sakura")(new Palette(), at)).getSize(new THREE.Vector3()).y;
  assert.ok(heightOf({ x: 0, y: 0, width: 2, height: 2 }) > 1.5 * heightOf({ x: 0, y: 0, width: 1, height: 1 }));
});

test("falling petals stay in the air round what the camera looks at, wherever it goes", () => {
  let seed = 1;
  const petals = new FallingPetals(() => (seed = (seed * 16807) % 2147483647) / 2147483647);
  const focus = new THREE.Vector3(100, 0, -50);
  for (let frame = 0; frame < 120; frame += 1) petals.update(1 / 30, focus);
  const point = new THREE.Vector3(), matrix = new THREE.Matrix4();
  const strays = Array.from({ length: petals.mesh.count }, (_, index) => point.setFromMatrixPosition((petals.mesh.getMatrixAt(index, matrix), matrix)).clone())
    .filter(({ x, y, z }) => Math.abs(x - focus.x) > 13 || Math.abs(z - focus.z) > 10 || y < 0 || y > 6);
  assert.deepEqual(strays, []);
});

const { shallowsMask, nearnessToLand } = await import("../src/lib/world/shallows.ts");
const pond = parseTownMap(["~~~~~~~~~~~~~~~", "~~~~~~~~~~~~~~~", "~~~~~.....~~~~~", "~~~~~.....~~~~~", "~~~~~~~~~~~~~~~", "~~~~~~~~~~~~~~~"]);
const pondMask = shallowsMask(pond);

test("the water is nearest land over the land itself, and less near the further out it lies", () => {
  const nearness = [3, 1.6, 0.4].map(y => nearnessToLand(pondMask, { x: 7.5, y }));
  assert.ok(nearness[0] > nearness[1] && nearness[1] > nearness[2], nearness.join(" > "));
});

test("open water far from any land is not near land at all", () => {
  assert.equal(nearnessToLand(pondMask, { x: -6, y: -6 }), 0);
});

test("a bridge is water to the waves beneath it, not land", () => {
  const bridged = shallowsMask(parseTownMap(["~~~~~~~~~", "~~~~b~~~~", "~~~~~~~~~"]));
  assert.ok(nearnessToLand(bridged, { x: 4.5, y: 1.5 }) < 0.05);
});

test("a river one tile wide is clear of foam in its middle, yet turquoise as shallow water", () => {
  const river = shallowsMask(parseTownMap(Array(8).fill("..........").map((row, y) => y === 4 ? "~~~~~~~~~~" : row)));
  const middle = { x: 5.5, y: 4.5 };
  assert.ok(nearnessToLand(river, middle, "edge") < 0.22 && nearnessToLand(river, middle, "shallows") > 0.3,
    `${nearnessToLand(river, middle, "edge")} / ${nearnessToLand(river, middle, "shallows")}`);
});

const practice = islandSceneOf("practice");
const practice3D = japaneseIsland3D(practice);

test("the Practice island is walked in 3D", () => {
  assert.ok(ISLANDS_IN_3D.has("practice"));
});

test("each shrine piece stands as its model on its own ground, turned the way it faces", () => {
  const [torii] = practice.props;
  assert.deepEqual(practice3D.models.find(({ model }) => model === propModel("torii")), { model: propModel("torii"), at: torii.at, scale: 1, isWalkable: true, facing: torii.facing });
});

test("a gate is walked through between its pillars, which stand on the end tiles of its ground", () => {
  assert.deepEqual(groundBlockedBy({ kind: "torii", at: { x: 25, y: 5, width: 1, height: 4 } }), [{ x: 25, y: 5, width: 1, height: 1 }, { x: 25, y: 8, width: 1, height: 1 }]);
});

test("a string of lanterns blocks nothing itself, hanging from the island's lanterns", () => {
  assert.deepEqual(groundBlockedBy({ kind: "lantern-string", at: { x: 12, y: 6, width: 7, height: 1 } }), []);
});

test("any other piece blocks all its ground", () => {
  const at = { x: 13, y: 8, width: 2, height: 1 };
  assert.deepEqual(groundBlockedBy({ kind: "temizuya", at }), [at]);
});

test("the shrine pieces block their ground for walking", () => {
  const blocked = blockedTiles(practice.layout.map, practice.layout.obstacles ?? []);
  assert.ok(practice.props.flatMap(groundBlockedBy).every(({ x, y }) => blocked.has(tileKey(x, y))));
});

test("no piece on any island stands on a door or where the traveller arrives", () => {
  const covered = ISLAND_SCENES.flatMap(scene => {
    const blocked = new Set((scene.layout.obstacles ?? []).flatMap(tilesOf));
    const kept = [...scene.doors.map(({ tile }) => tile), ...scene.arrivals.map(({ tile }) => tile)].map(({ x, y }) => `${Math.floor(x)},${Math.floor(y)}`);
    return kept.filter(key => blocked.has(key)).map(key => `${scene.island} ${key}`);
  });
  assert.deepEqual(covered, []);
});

test("no two pieces on an island stand on the same ground, nor on a building or a tree", () => {
  const clashes = ISLAND_SCENES.flatMap(scene => {
    const taken = new Map(scene.layout.buildings.flatMap(({ x, y, width, height, id }) => tilesOf({ x, y, width, height }).map(key => [key, id])));
    return scene.props.flatMap(({ kind, at }) => tilesOf(at).flatMap(key => {
      const [x, y] = key.split(",").map(Number);
      const terrain = scene.layout.map.terrain[y][x];
      const clash = taken.get(key) ?? (["tree", "sakura", "bamboo", "maple", "pine", "water"].includes(terrain) ? terrain : null);
      taken.set(key, kind);
      return clash && kind !== "lantern-string" ? [`${scene.island} ${kind} at ${key} on ${clash}`] : [];
    }));
  });
  assert.deepEqual(clashes, []);
});

test("a great festival drum stands twice as tall as a small one", () => {
  const heightOn = ground => new THREE.Box3().setFromObject(PROP_BUILDERS.get("taiko")(new Palette(), ground)).getSize(new THREE.Vector3()).y;
  assert.ok(Math.abs(heightOn({ width: 2, depth: 2 }) - 2 * heightOn({ width: 1, depth: 1 })) < 1e-6);
});

test("every shrine piece fits on its ground", () => {
  const grounds = {
    torii: { width: 4, depth: 1 }, gate: { width: 4, depth: 1 }, temizuya: { width: 2, depth: 1 }, "bell-tower": { width: 3, depth: 3 },
    watchtower: { width: 3, depth: 3 }, "tea-bench": { width: 2, depth: 2 }, yatai: { width: 2, depth: 2 }, rickshaw: { width: 1, depth: 2 }, "lantern-string": { width: 7, depth: 1 },
    "rock-large": { width: 2, depth: 2 }, "moss-mound": { width: 2, depth: 1 },
  };
  const overhanging = [...PROP_BUILDERS].flatMap(([kind, build]) => {
    const ground = grounds[kind] ?? { width: 1, depth: 1 };
    const size = new THREE.Box3().setFromObject(build(new Palette(), ground)).getSize(new THREE.Vector3());
    return size.x <= ground.width + 0.01 && size.z <= ground.depth + 0.01 ? [] : [`${kind}: ${size.x.toFixed(2)} × ${size.z.toFixed(2)}`];
  });
  assert.deepEqual(overhanging, []);
});

test("a torii over a road stands tall enough to walk under", () => {
  const height = new THREE.Box3().setFromObject(PROP_BUILDERS.get("torii")(new Palette(), { width: 4, depth: 1 })).getSize(new THREE.Vector3()).y;
  assert.ok(height > 1.9, `${height}`);
});

test("Tama stands about a tile tall", () => {
  const height = new THREE.Box3().setFromObject(tamaRig(new Palette()).root).getSize(new THREE.Vector3()).y;
  assert.ok(height > 0.9 && height < 1.4, `${height}`);
});

test("bamboo leaves drift down in a bamboo grove, and a bell tower stands on its far shore", () => {
  assert.deepEqual([practice3D.weather, practice3D.backdrop.some(({ model }) => model === propModel("bell-tower"))], ["leaves", true]);
});

test("trees on the island's near edge grow smaller, so they don't hide the island", () => {
  const scaleOfRow = row => practice3D.models.filter(isTree).filter(({ at }) => at.y === row).map(({ scale }) => scale);
  assert.ok(Math.max(...scaleOfRow(practice.layout.map.height - 2)) < Math.min(...scaleOfRow(1)));
});

test("a pond is the water cut off from the sea, and the sea is no pond", () => {
  const map = parseTownMap(["~~~~~~", "~....~", "~.g~.~", "~....~", "~~~~~~"]);
  assert.deepEqual(pondsOf(map).map(pond => pond.map(({ x, y }) => `${x},${y}`).sort()), [["2,2", "3,2"]]);
});

test("every island in 3D has its lanterns stand as lantern pieces on tiles blocked for walking", () => {
  const unblocked = ISLAND_SCENES.flatMap(scene => {
    const blocked = blockedTiles(scene.layout.map, scene.layout.obstacles ?? []);
    const lanterns = japaneseIsland3D(scene).models.filter(({ model }) => model.includes("lantern") && !model.includes("string"));
    const missing = lanterns.length < (scene.layout.lanterns ?? []).length ? [`${scene.island}: lanterns missing`] : [];
    return [...missing, ...lanterns.filter(({ at }) => !blocked.has(tileKey(at.x, at.y))).map(({ at }) => `${scene.island} ${at.x},${at.y}`)];
  });
  assert.deepEqual(unblocked, []);
});

test("each island's theme brings its own weather", () => {
  const weathers = Object.fromEntries(ISLAND_SCENES.map(scene => [scene.island, japaneseIsland3D(scene).weather ?? null]));
  assert.deepEqual(weathers, { kana: "petals", practice: "leaves", games: null, lessons: "maple", review: null, fuji: "snow" });
});

test("Fuji floats on a sea of clouds, with no far shore and the summit behind it", () => {
  const fuji3D = japaneseIsland3D(islandSceneOf("fuji"));
  assert.deepEqual([fuji3D.sea, fuji3D.shore ?? null, fuji3D.backdrop.map(({ model }) => model)], ["clouds", null, [MOUNTAIN_MODEL]]);
});

test("a rock stands on every rock tile", () => {
  const scene = { ...kana, layout: { ...kana.layout, map: parseTownMap(["k..", "..k", "..."]), buildings: [], villagers: [], lanterns: [] }, props: [] };
  const rocks = japaneseIsland3D(scene).models.filter(({ model }) => model === ROCK_MODEL).map(({ at }) => `${at.x},${at.y}`);
  assert.deepEqual(rocks, ["0,0", "2,1"]);
});

test("each challenger stands about a tile or a tile and a half tall", () => {
  const heights = { pon: ponRig, sensei: senseiRig, zen: zenRig, kurama: kuramaRig };
  const outOfRange = Object.entries(heights).flatMap(([name, rig]) => {
    const height = new THREE.Box3().setFromObject(rig(new Palette()).root).getSize(new THREE.Vector3()).y;
    return height > 0.9 && height < 1.7 ? [] : [`${name}: ${height.toFixed(2)}`];
  });
  assert.deepEqual(outOfRange, []);
});

test("a bridge off the island is one span with the deck carrying it on, arching over the open water", () => {
  const spans = bridgeSpans(kana.layout.map, farShoreAround(kana.layout.map).decks);
  assert.deepEqual(spans.map(({ runsAlong, arch }) => ({ runsAlong, arch })), [{ runsAlong: "x", arch: { from: -WATER_GAP, to: 0 } }]);
});

test("a bridge reaches as far onto the far shore as onto the island, so its two ends match", () => {
  const [{ at, arch }] = bridgeSpans(kana.layout.map, farShoreAround(kana.layout.map).decks);
  assert.deepEqual([arch.from - at.x, at.x + at.width - arch.to], [3, 3]);
});

test("a north-running bridge reaches onto the far shore northwards", () => {
  const [{ at }] = bridgeSpans(islandSceneOf("games").layout.map, farShoreAround(islandSceneOf("games").layout.map).decks);
  assert.deepEqual(at, { x: 14, y: -WATER_GAP - 2, width: 2, height: WATER_GAP + 4 });
});

test("a bridge lies flat where it's walked on the island and rises over the water", () => {
  const [span] = bridgeSpans(kana.layout.map, farShoreAround(kana.layout.map).decks);
  assert.deepEqual([deckHeightAt(span, 1.5), deckHeightAt(span, -WATER_GAP), deckHeightAt(span, -WATER_GAP / 2) > 0.5], [0, 0, true]);
});

test("a bridge with nothing carrying it on stays flat", () => {
  const [span] = bridgeSpans(parseTownMap(["~~~", "~b~", "~b~"]), []);
  assert.deepEqual(span.arch, null);
});

// ---- the village square (Home) in 3D

const VILLAGE_SCENE = { layout: VILLAGE_SQUARE, doors: VILLAGE_DOORS, props: VILLAGE_PROPS, theme: "sakura", surroundings: "water" };
const village3D = villageSquare3D(VILLAGE_SCENE);
const isVillageLantern = ({ model }) => model === propModel("paper-lantern") || model === propModel("paper-lantern-unlit");

test("every model and person in the village square, and on its far shore, can be built", () => {
  const lanterns = village3D.lanterns.flatMap(({ lit, unlit }) => [lit, unlit]);
  const models = [...village3D.models, ...village3D.backdrop, ...village3D.people, ...lanterns].map(({ model }) => model);
  assert.deepEqual([...new Set(models)].filter(model => !canBuild(model)), []);
});

test("every villager in the square stands as themselves", () => {
  assert.deepEqual(village3D.people.map(({ id, model }) => [id, model]), VILLAGE_SQUARE.villagers.map(({ id }) => [id, castModel(id)]));
});

test("every building in the village fits on its ground, roof and all, even signed with the longest name", () => {
  const palette = new Palette();
  const signed = withHomeSign(VILLAGE_SQUARE, HOME_BUILDING_ID, "あいうえおかきくけこさしす");
  const overhanging = signed.buildings.flatMap(({ id, look, width, height: depth, roof, sign }) => {
    const build = JAPANESE_BUILDING_BUILDERS.get(look);
    if (!build) return [`${id}: no builder`];
    const size = new THREE.Box3().setFromObject(build(palette, { width, depth, roof, sign })).getSize(new THREE.Vector3());
    return size.x <= width + 0.01 && size.z <= depth + 0.01 ? [] : [`${id}: ${size.x.toFixed(2)} × ${size.z.toFixed(2)}`];
  });
  assert.deepEqual(overhanging, []);
});

test("the ryokan stands taller than a townhouse, and a townhouse taller than a teahouse", () => {
  const heightOf = (look, width, depth) => new THREE.Box3().setFromObject(JAPANESE_BUILDING_BUILDERS.get(look)(new Palette(), { width, depth, roof: "indigo" })).getSize(new THREE.Vector3()).y;
  const [ryokan, machiya, teahouse] = [heightOf("onsen", 8, 4), heightOf("home", 5, 3), heightOf("teahouse", 5, 3)];
  assert.ok(ryokan > machiya && machiya > teahouse, `${ryokan} ${machiya} ${teahouse}`);
});

test("each of the square's lanterns can be lit or left dark where it stands, so lighting one doesn't rebuild the square", () => {
  const tiles = village3D.lanterns.map(({ lit, unlit }) => [lit.model, unlit.model, lit.at.x === unlit.at.x && lit.at.y === unlit.at.y]);
  assert.deepEqual(tiles, VILLAGE_SQUARE.lanterns.map(() => [propModel("paper-lantern"), propModel("paper-lantern-unlit"), true]));
});

test("the square's lanterns stand only as switched lanterns, not also among its fixed models", () => {
  assert.deepEqual(village3D.models.filter(isVillageLantern), []);
});

test("no piece in the village stands on a door or where the traveller arrives, nor on a building, a tree or water", () => {
  const blocked = new Set(VILLAGE_SQUARE.obstacles.flatMap(tilesOf));
  const kept = [...VILLAGE_DOORS.map(({ tile }) => tile), ...FROM_HOME_ARRIVALS].map(({ x, y }) => `${Math.floor(x)},${Math.floor(y)}`);
  const buildings = new Set(VILLAGE_SQUARE.buildings.flatMap(tilesOf));
  const onSolid = VILLAGE_SQUARE.obstacles.flatMap(tilesOf).filter(key => {
    const [x, y] = key.split(",").map(Number);
    return buildings.has(key) || ["tree", "sakura", "water"].includes(VILLAGE_SQUARE.map.terrain[y][x]);
  });
  assert.deepEqual([kept.filter(key => blocked.has(key)), onSolid], [[], []]);
});

test("each village building stands two rows back from any road behind it, so it doesn't hide whoever walks there", () => {
  const isRoad = (x, y) => ["path", "bridge"].includes(VILLAGE_SQUARE.map.terrain[y]?.[x]);
  const hiding = VILLAGE_SQUARE.buildings.filter(({ x, y, width }) => Array.from({ length: width }, (_, column) => x + column).some(column => isRoad(column, y - 1) || isRoad(column, y - 2)));
  assert.deepEqual(hiding.map(({ id }) => id), []);
});

test("every road out of the village leaves over a bridge carried on over the water", () => {
  const spans = bridgeSpans(VILLAGE_SQUARE.map, farShoreAround(VILLAGE_SQUARE.map).decks);
  assert.deepEqual([spans.length, spans.every(({ arch }) => arch !== null)], [5, true]);
});

test("the rest of the cast stands about a tile or a tile and a half tall", () => {
  const rigs = { kon: konRig, hakase: hakaseRig, tsuru: tsuruRig, hato: hatoRig, momo: momoRig };
  const outOfRange = Object.entries(rigs).flatMap(([name, rig]) => {
    const height = new THREE.Box3().setFromObject(rig(new Palette()).root).getSize(new THREE.Vector3()).y;
    return height > 0.9 && height < 1.7 ? [] : [`${name}: ${height.toFixed(2)}`];
  });
  assert.deepEqual(outOfRange, []);
});

test("the birds of the cast flap their wings out to the sides as they walk", () => {
  assert.deepEqual([hakaseRig, tsuruRig, hatoRig].map(rig => rig(new Palette()).armSwing), ["outward", "outward", "outward"]);
});

// ---- drawn quickly: a model that never moves is merged into one mesh for each of its materials

test("a merged model is one mesh for each material it's drawn in, and stands exactly where its parts did", () => {
  const plan = { width: 8, depth: 4, roof: "indigo", sign: "温泉" };
  const parts = JAPANESE_BUILDING_BUILDERS.get("onsen")(new Palette(), plan);
  const materials = new Set();
  parts.traverse(part => { if (part.isMesh) materials.add(part.material); });
  const before = new THREE.Box3().setFromObject(parts);
  const merged = mergedByMaterial(parts);
  const meshes = merged.children.filter(child => child.isMesh);
  const after = new THREE.Box3().setFromObject(merged);
  assert.deepEqual([meshes.length, after.min.distanceTo(before.min) < 1e-6, after.max.distanceTo(before.max) < 1e-6], [materials.size, true, true]);
});

test("a part baked through a mirror still faces outwards", () => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
  mesh.scale.x = -1;
  const [merged] = mergedByMaterial(new THREE.Group().add(mesh)).children;
  const [a, b, c] = [0, 1, 2].map(index => new THREE.Vector3().fromBufferAttribute(merged.geometry.attributes.position, index));
  assert.ok(new THREE.Triangle(a, b, c).getNormal(new THREE.Vector3()).z > 0);
});

test("an instanced mesh is kept whole when its model is merged, every copy where it stood", () => {
  const instanced = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 2);
  instanced.setMatrixAt(1, new THREE.Matrix4().makeTranslation(5, 0, 0));
  const [kept] = mergedByMaterial(new THREE.Group().add(instanced)).children;
  assert.deepEqual([kept === instanced, kept.count], [true, 2]);
});

// ---- the wild paths in 3D

const WALKED_ROUTES = WILD_ROUTES.filter(({ travel }) => travel === "foot");
/** Open land, where a piece can stand by the way without taking any of the path or the grass. */
const OPEN_LAND = new Set(["grass", "flowers", "petals", "leaves"]);

test("every model on the walked paths in 3D, and on their far shores, can be built", () => {
  const models = WALKED_ROUTES.flatMap(route => { const path = wildRoute3D(route); return [...path.models, ...path.backdrop]; }).map(({ model }) => model);
  assert.deepEqual([...new Set(models)].filter(model => !canBuild(model)), []);
});

test("each walked path's pieces stand as models along it, drawn under the look of the island it leads to", () => {
  const unplaced = WALKED_ROUTES.flatMap(route => (route.props ?? []).filter(prop =>
    !wildRoute3D(route).models.some(({ model, at }) => model === propModel(prop.kind) && at.x === prop.at.x && at.y === prop.at.y)).map(({ kind }) => `${route.id}: ${kind}`));
  assert.deepEqual(unplaced, []);
});

test("the pieces along a path stand only on open land, off the path, the grass, the water and the lanterns", () => {
  const misplaced = WALKED_ROUTES.flatMap(route => {
    const lanterns = new Set(route.layout.lanterns.map(({ x, y }) => `${x},${y}`));
    return (route.props ?? []).flatMap(prop => tilesOf(prop.at).filter(key => {
      const [x, y] = key.split(",").map(Number);
      return !OPEN_LAND.has(route.layout.map.terrain[y]?.[x]) || lanterns.has(key);
    }).map(key => `${route.id}: ${prop.kind} at ${key}`));
  });
  assert.deepEqual(misplaced, []);
});

test("no two pieces along a path share ground, and each blocks its ground for walking", () => {
  const problems = WALKED_ROUTES.flatMap(route => {
    const tiles = (route.props ?? []).flatMap(({ at }) => tilesOf(at));
    const blocked = new Set((route.layout.obstacles ?? []).flatMap(tilesOf));
    return [...(tiles.length === new Set(tiles).size ? [] : [`${route.id}: overlapping`]), ...tiles.filter(key => !blocked.has(key)).map(key => `${route.id}: ${key} open`)];
  });
  assert.deepEqual(problems, []);
});

test("each walked path leads to its island with pieces of its own along the way", () => {
  assert.deepEqual(WALKED_ROUTES.filter(({ props }) => (props ?? []).length < 5).map(({ id }) => id), []);
});

test("a tuft of tall grass stands on every tall-grass tile, and on nothing else", () => {
  const map = parseTownMap(["w.w", "...", ".ww"]);
  const grass = new TallGrass(map);
  const matrix = new THREE.Matrix4(), place = new THREE.Vector3();
  const tiles = new Set(Array.from({ length: grass.mesh.count }, (_, index) => {
    grass.mesh.getMatrixAt(index, matrix);
    place.setFromMatrixPosition(matrix);
    return `${Math.floor(place.x)},${Math.floor(place.z)}`;
  }));
  assert.deepEqual([...tiles].sort(), ["0,0", "1,2", "2,0", "2,2"]);
});
