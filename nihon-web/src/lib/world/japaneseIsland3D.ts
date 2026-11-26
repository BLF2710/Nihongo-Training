// A Japanese island's 2.5D scene, read as a 3D one: its buildings stand as models of their look (roof colour and sign
// kept), its tree tiles grow trees of their kind (a block of two by two grows one great tree) and its rock tiles
// rocks, its lanterns and pieces stand where its content sets them, its villagers stand as models of themselves, and
// beyond it lies what surrounds it: across the water a far shore with its theme's trees and landmark, or a sea of
// clouds with the summit rising behind. The layout walked is the scene's own, so walking, doors and challenges are
// unchanged. Pure (no three.js, no browser).
import type { CharacterId } from "../cast.ts";
import type { BuildingLook, RoofColour } from "../errands/village.ts";
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";
import type { Vector } from "../errands/movement.ts";
import type { IslandScene } from "./islandScenes.ts";
import { steadyNoise } from "./islandModels.ts";
import type { Island3D, IslandPerson, ModelPlacement, Weather } from "./islandModels.ts";
import type { SceneTheme, Surroundings } from "./sceneTheme.ts";
import { FLAT_DEPTH, WATER_GAP, farShoreAround, flatShoreTiles, mainlandBeside } from "./farShore.ts";
import type { Mainland } from "./farShore.ts";
import { isWalkedThrough, propModel } from "./islandProps.ts";
import type { IslandProp, ShrinePropKind } from "./islandProps.ts";
import { pondsOf } from "./ponds.ts";
import { exitHref } from "./routes.ts";
import type { Heading, Mountainside, Travel, WildRoute } from "./routes.ts";
import { isBeyond } from "./wintrySide.ts";

/** The learner's own traveller, made from the look they chose in the wardrobe. */
export const TRAVELLER_MODEL = "traveller";
/** A boulder, on each rock tile. */
export const ROCK_MODEL = "scenery:rock";
/** The snowy summit rising behind Fuji. */
export const MOUNTAIN_MODEL = "scenery:mountain";
/** Models made for the islands are drawn in tiles already, so they stand at one tile to a unit. */
const BUILT_SCALE = 1;
const TREE_TERRAINS: ReadonlySet<Terrain> = new Set<Terrain>(["tree", "sakura", "bamboo", "maple", "pine"]);
/** Trees on the island's near edge (its last rows of land, between the camera and the island) grow this much
 *  smaller, so they don't hide the ground behind them. */
const NEAR_EDGE_ROWS = 3;
const NEAR_TREE_SCALE = 0.6;
/** How big a block of tree tiles grows one great tree. */
const GREAT_TREE_TILES = 2;
/** How thickly trees stand on the far shore: a tile grows one where its steady noise is over this. */
const SHORE_TREE_THRESHOLD = 0.55;
/** Where the summit stands behind an island above the clouds: how far north of it, and how wide (in tiles). */
const MOUNTAIN = { distance: 34, size: 44 } as const;

export const buildingModel = (look: BuildingLook): string => `building:${look}`;
export const treeModel = (terrain: Terrain): string => `tree:${terrain}`;
export const castModel = (character: CharacterId): string => `cast:${character}`;
/** A tree or rock as it stands in snow, under a snowy look. */
export const snowy = (model: string): string => `${model}:snowy`;
/** The trees and rocks that stand differently in snow (bamboo, say, stays green). */
const SNOWED_ON: ReadonlySet<string> = new Set([treeModel("pine"), ROCK_MODEL]);
const inSnow = (model: string): string => SNOWED_ON.has(model) ? snowy(model) : model;
const asItIs = (model: string): string => model;

/** Each theme's look in 3D: the trees on its far shore, what falls through its air, the landmark (`model`, its `roof`
 *  colour if it has one) on the flat land facing the island's far side, the kind of lantern its lanterns are, any
 *  terrain it colours its own way (snow on the summit), and how its trees and rocks are `dressed` (snowy, or as they
 *  are). */
type ThemeLook = {
  tree?: Terrain; weather?: Weather; landmark?: { model: string; roof?: RoofColour; size: number }; lantern: ShrinePropKind;
  landColours?: Partial<Readonly<Record<Terrain, string>>>; dressed?: (model: string) => string;
};
/** Snow lying on grassland. */
const LYING_SNOW = "#eef2f5";
/** Land under snow: the grass, the ground under the trees, the stony ground and the rocks' ground white, or nearly. */
const SNOWY_LAND: Partial<Readonly<Record<Terrain, string>>> = {
  grass: LYING_SNOW, snow: "#fbfcfd", stones: "#eef2f5", rock: "#dfe5ea", flowers: "#eef2f5", pine: "#e8edf1", bamboo: "#e8edf1", tree: "#e8edf1",
};
const THEME_LOOKS: Readonly<Record<SceneTheme, ThemeLook>> = {
  sakura: { tree: "sakura", weather: "petals", landmark: { model: buildingModel("pagoda"), roof: "vermilion", size: 3 }, lantern: "stone-lantern" },
  bamboo: { tree: "bamboo", weather: "leaves", landmark: { model: propModel("bell-tower"), size: 3 }, lantern: "stone-lantern" },
  festival: { tree: "tree", landmark: { model: propModel("watchtower"), size: 3 }, lantern: "paper-lantern" },
  maple: { tree: "maple", weather: "maple", landmark: { model: propModel("torii"), size: 4 }, lantern: "stone-lantern" },
  zen: { tree: "pine", landmark: { model: buildingModel("pagoda"), roof: "wood", size: 3 }, lantern: "yukimi-lantern" },
  // The ferry's sea, on the way up to Fuji: its shores already deep in snow.
  mountain: { tree: "pine", weather: "snow", lantern: "stone-lantern", landColours: SNOWY_LAND, dressed: inSnow },
  // High on the mountain the ground is snow, deeper in its drifts.
  summit: { weather: "snow", lantern: "stone-lantern", landColours: { grass: "#eef2f5", snow: "#fbfcfd", stones: "#eef2f5" } },
};

const treeAt = (terrain: Terrain, at: Rect, scale = BUILT_SCALE): ModelPlacement => ({ model: treeModel(terrain), at, scale, isWalkable: true });
const keyOf = (x: number, y: number) => `${x},${y}`;

/** A tree on each tree tile, but one great tree on each block of two by two of the same kind (taken top-left first).
 *  Trees take no ground of their own: their tiles already can't be walked. */
function treesOf(map: TownMap): ModelPlacement[] {
  const terrainAt = (x: number, y: number) => map.terrain[y]?.[x];
  const taken = new Set<string>();
  const trees: ModelPlacement[] = [];
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (!TREE_TERRAINS.has(terrain) || taken.has(keyOf(x, y))) return;
    const block = [0, 1].flatMap(dy => [0, 1].map(dx => ({ x: x + dx, y: y + dy })));
    const isGreat = block.every(tile => terrainAt(tile.x, tile.y) === terrain && !taken.has(keyOf(tile.x, tile.y)));
    const size = isGreat ? GREAT_TREE_TILES : 1;
    for (const tile of isGreat ? block : [{ x, y }]) taken.add(keyOf(tile.x, tile.y));
    const isNearEdge = y + size > map.height - NEAR_EDGE_ROWS;
    trees.push(treeAt(terrain, { x, y, width: size, height: size }, isNearEdge ? NEAR_TREE_SCALE : BUILT_SCALE));
  }));
  return trees;
}

/** A boulder on each rock tile (whose ground already can't be walked). */
const rocksOf = (map: TownMap): ModelPlacement[] => map.terrain.flatMap((row, y) => row.flatMap((terrain, x) =>
  terrain === "rock" ? [{ model: ROCK_MODEL, at: { x, y, width: 1, height: 1 }, scale: BUILT_SCALE, isWalkable: true }] : []));

const isInside = (tile: { x: number; y: number }, rect: Rect) => tile.x >= rect.x && tile.x < rect.x + rect.width && tile.y >= rect.y && tile.y < rect.y + rect.height;

/** Whether a tile of the far shore grows a tree (where its steady noise says so). */
const growsTree = (tile: { x: number; y: number }) => steadyNoise(tile.x * 3.1, tile.y * 1.7) > SHORE_TREE_THRESHOLD;

/** The far shore's landmark (on the flat land facing the island's far side, in the middle) and its trees, kept off
 *  the paths and the landmark's ground. */
function shoreScenery(map: TownMap, look: ThemeLook, paths: readonly Rect[]): ModelPlacement[] {
  const landmark = look.landmark && {
    model: look.landmark.model, scale: BUILT_SCALE, roof: look.landmark.roof,
    at: { x: Math.floor(map.width / 2 - look.landmark.size / 2), y: -WATER_GAP - FLAT_DEPTH, width: look.landmark.size, height: look.landmark.size },
  };
  const isFree = (tile: { x: number; y: number }) => !paths.some(path => isInside(tile, path)) && !(landmark && isInside(tile, landmark.at));
  const tree = look.tree;
  const trees = tree ? flatShoreTiles(map)
    .filter(tile => growsTree(tile) && isFree(tile))
    .map(tile => treeAt(tree, { ...tile, width: 1, height: 1 })) : [];
  return landmark ? [landmark, ...trees] : trees;
}

/** The trees of the mainland's groves, each grove growing the trees of its own coast (pines by a pine coast, bamboo by
 *  a bamboo one), kept off the paths. */
function groveTrees({ shore, groves }: Mainland): ModelPlacement[] {
  const isFree = (tile: { x: number; y: number }) => !shore.paths.some(path => isInside(tile, path));
  return groves.flatMap(({ coast, tiles }) => {
    const tree = coast.find(terrain => TREE_TERRAINS.has(terrain));
    return tree ? tiles.filter(tile => growsTree(tile) && isFree(tile)).map(tile => treeAt(tree, { ...tile, width: 1, height: 1 })) : [];
  });
}

/** On the wintry side of an island, the far shore's trees are pines under snow. */
const WINTRY_TREE = snowy(treeModel("pine"));

/** The summit, far behind an island above the clouds. */
const summitBehind = (map: TownMap): ModelPlacement => ({
  model: MOUNTAIN_MODEL, scale: BUILT_SCALE,
  at: { x: map.width / 2 - MOUNTAIN.size / 2, y: -MOUNTAIN.distance - MOUNTAIN.size, width: MOUNTAIN.size, height: MOUNTAIN.size },
});

/** A piece stands as its model, turned the way it faces. A gate's ground is walked through. */
const propAt = ({ kind, at, facing }: IslandProp): ModelPlacement => ({
  model: propModel(kind), at, scale: BUILT_SCALE, isWalkable: isWalkedThrough({ kind, at }), facing,
});

/** The island's lanterns, each a lantern of its theme's kind on its tile. */
const lanternsOf = (lanterns: readonly Vector[], kind: ShrinePropKind): IslandProp[] =>
  lanterns.map(({ x, y }) => ({ kind, at: { x, y, width: 1, height: 1 } }));

/** What a Japanese scene is drawn from: an island's or the village square's ground, buildings, people, doors and
 *  pieces, and its look. */
export type JapaneseScene = Pick<IslandScene, "layout" | "doors" | "props" | "theme" | "surroundings" | "wintrySide">;

/** An island in 3D, its lanterns of its theme's kind. */
export const japaneseIsland3D = (scene: IslandScene): Island3D =>
  japaneseScene3D(scene, lanternsOf(scene.layout.lanterns, THEME_LOOKS[scene.theme].lantern));

/** The village square in 3D: its lanterns are paper lanterns on posts, lit as the page says (see `SwitchedLantern`). */
export const villageSquare3D = (scene: JapaneseScene): Island3D => ({
  ...japaneseScene3D(scene, []),
  lanterns: scene.layout.lanterns.map(({ x, y }) => {
    const at = { x, y, width: 1, height: 1 };
    return { lit: propAt({ kind: "paper-lantern", at }), unlit: propAt({ kind: "paper-lantern-unlit", at }) };
  }),
});

/** How wide a mountain rising from the side of a path is, in tiles. */
const MOUNTAINSIDE_SIZE = 26;

/** Where a mountain rising from a side of a path stands: just beyond that edge, its foot `inset` tiles in, centred
 *  along the side. */
function mountainsideAt(map: TownMap, { side, inset }: Mountainside): ModelPlacement {
  const size = MOUNTAINSIDE_SIZE;
  const across = { x: map.width / 2 - size / 2, y: map.height / 2 - size / 2 };
  const corners: Readonly<Record<Heading, Vector>> = {
    west: { x: inset + 1 - size, y: across.y }, east: { x: map.width - inset - 1, y: across.y },
    north: { x: across.x, y: inset + 1 - size }, south: { x: across.x, y: map.height - inset - 1 },
  };
  return { model: MOUNTAIN_MODEL, scale: BUILT_SCALE, at: { ...corners[side], width: size, height: size } };
}

/** What lies round a path: water with land across it for a walked one, and the open sea for the ferry. */
const SURROUNDINGS_BY_TRAVEL: Readonly<Record<Travel, Surroundings>> = { foot: "water", boat: "open-sea" };

/** What leaving a wild path through an exit says. */
const GO = "Go";

/** A wild path in 3D: drawn as an island is, under the look of the island it leads to, its exits doors; the ferry is
 *  rowed in a boat, and a mountain rises from the side of a path that has one. */
export function wildRoute3D(route: WildRoute): Island3D {
  const doors = route.exits.map(exit => ({ id: exit.island, tile: exit.tile, href: exitHref(exit, route.id), label: exit.label, action: GO }));
  const scene: JapaneseScene = { layout: route.layout, doors, props: route.props ?? [], theme: route.theme, surroundings: SURROUNDINGS_BY_TRAVEL[route.travel] };
  const path = japaneseScene3D(scene, lanternsOf(route.layout.lanterns, THEME_LOOKS[route.theme].lantern));
  const mountain = route.mountainside ? [mountainsideAt(route.layout.map, route.mountainside)] : [];
  return { ...path, backdrop: [...mountain, ...path.backdrop], isAboard: route.travel === "boat" };
}

/** A scene in 3D, with its `lanterns` standing as the pieces given. */
function japaneseScene3D(scene: JapaneseScene, lanterns: readonly IslandProp[]): Island3D {
  const { map, buildings, villagers } = scene.layout;
  const look = THEME_LOOKS[scene.theme];
  const standing = buildings.map(({ look: buildingLook, roof, sign, x, y, width, height }): ModelPlacement => ({
    model: buildingModel(buildingLook), at: { x, y, width, height }, scale: BUILT_SCALE, roof, sign,
  }));
  const pieces = [...scene.props, ...lanterns].map(propAt);
  const people = villagers.map(({ id, tile }): IslandPerson => ({ id, model: castModel(id), tile, facing: "down" }));
  const dressed = (placement: ModelPlacement): ModelPlacement => ({ ...placement, model: (look.dressed ?? asItIs)(placement.model) });
  const island = {
    map, models: [...standing, ...[...treesOf(map), ...rocksOf(map)].map(dressed), ...pieces], people, traveller: TRAVELLER_MODEL, doors: scene.doors,
    weather: look.weather, ponds: pondsOf(map), landColours: look.landColours,
  };
  if (scene.surroundings === "clouds") return { ...island, sea: "clouds", backdrop: [summitBehind(map)] };
  // Out at sea the land lies only behind the piers at either end, the sea open to the horizon between.
  if (scene.surroundings === "open-sea") {
    const mainland = mainlandBeside(map);
    return { ...island, sea: "water", shore: mainland.shore, backdrop: groveTrees(mainland).map(dressed) };
  }
  const shore = farShoreAround(map);
  const scenery = shoreScenery(map, look, shore.paths);
  const side = scene.wintrySide;
  if (!side) return { ...island, sea: "water", shore, backdrop: scenery.map(dressed) };
  const shoreTree = look.tree && treeModel(look.tree);
  const wintered = (placement: ModelPlacement): ModelPlacement =>
    placement.model === shoreTree && isBeyond(map, side, placement.at) ? { ...placement, model: WINTRY_TREE } : placement;
  return { ...island, sea: "water", shore, backdrop: scenery.map(wintered).map(dressed), wintry: { side, snow: LYING_SNOW } };
}
