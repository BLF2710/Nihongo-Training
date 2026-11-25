// A Japanese island's 2.5D scene, read as a 3D one: its buildings stand as models of their look (roof colour and sign
// kept), its tree tiles grow trees of their kind (a block of two by two grows one great tree), its shrine pieces stand
// where its content sets them, its villagers stand as models of themselves, and a far shore with its theme's trees
// (and landmark) lies across the water. The layout walked
// is the scene's own, so walking, doors and challenges are unchanged. Pure (no three.js, no browser).
import type { CharacterId } from "../cast.ts";
import type { BuildingLook, RoofColour } from "../errands/village.ts";
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";
import type { IslandScene } from "./islandScenes.ts";
import { steadyNoise } from "./islandModels.ts";
import type { Island3D, IslandPerson, ModelPlacement, Weather } from "./islandModels.ts";
import type { SceneTheme } from "./sceneTheme.ts";
import { FLAT_DEPTH, WATER_GAP, farShoreAround, flatShoreTiles } from "./farShore.ts";
import { isWalkedThrough, propModel } from "./islandProps.ts";
import type { IslandProp } from "./islandProps.ts";

/** The learner's own traveller, made from the look they chose in the wardrobe. */
export const TRAVELLER_MODEL = "traveller";
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

export const buildingModel = (look: BuildingLook): string => `building:${look}`;
export const treeModel = (terrain: Terrain): string => `tree:${terrain}`;
export const castModel = (character: CharacterId): string => `cast:${character}`;

/** Each theme's trees on the far shore, what falls through its air, and the landmark (`model`, its `roof` colour if
 *  it has one) on the flat land facing the island's far side. */
type ThemeLook = { tree: Terrain; weather?: Weather; landmark?: { model: string; roof?: RoofColour; size: number } };
const THEME_LOOKS: Partial<Readonly<Record<SceneTheme, ThemeLook>>> = {
  sakura: { tree: "sakura", weather: "petals", landmark: { model: buildingModel("pagoda"), roof: "vermilion", size: 3 } },
  bamboo: { tree: "bamboo", weather: "leaves", landmark: { model: propModel("bell-tower"), size: 3 } },
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

const isInside = (tile: { x: number; y: number }, rect: Rect) => tile.x >= rect.x && tile.x < rect.x + rect.width && tile.y >= rect.y && tile.y < rect.y + rect.height;

/** The far shore's landmark (on the flat land facing the island's far side, in the middle) and its trees, kept off
 *  the paths and the landmark's ground. */
function shoreScenery(map: TownMap, look: ThemeLook, paths: readonly Rect[]): ModelPlacement[] {
  const landmark = look.landmark && {
    model: look.landmark.model, scale: BUILT_SCALE, roof: look.landmark.roof,
    at: { x: Math.floor(map.width / 2 - look.landmark.size / 2), y: -WATER_GAP - FLAT_DEPTH, width: look.landmark.size, height: look.landmark.size },
  };
  const isFree = (tile: { x: number; y: number }) => !paths.some(path => isInside(tile, path)) && !(landmark && isInside(tile, landmark.at));
  const trees = flatShoreTiles(map)
    .filter(tile => steadyNoise(tile.x * 3.1, tile.y * 1.7) > SHORE_TREE_THRESHOLD && isFree(tile))
    .map(tile => treeAt(look.tree, { ...tile, width: 1, height: 1 }));
  return landmark ? [landmark, ...trees] : trees;
}

/** A shrine piece stands as its model, turned the way it faces. A gate's ground is walked through. */
const propAt = ({ kind, at, facing }: IslandProp): ModelPlacement => ({
  model: propModel(kind), at, scale: BUILT_SCALE, isWalkable: isWalkedThrough({ kind, at }), facing,
});

export function japaneseIsland3D(scene: IslandScene): Island3D {
  const { map, buildings, villagers } = scene.layout;
  const standing = buildings.map(({ look, roof, sign, x, y, width, height }): ModelPlacement => ({
    model: buildingModel(look), at: { x, y, width, height }, scale: BUILT_SCALE, roof, sign,
  }));
  const people = villagers.map(({ id, tile }): IslandPerson => ({ id, model: castModel(id), tile, facing: "down" }));
  const shore = farShoreAround(map);
  const look = THEME_LOOKS[scene.theme];
  return {
    map, models: [...standing, ...treesOf(map), ...scene.props.map(propAt)], people, traveller: TRAVELLER_MODEL, doors: scene.doors,
    shore, backdrop: look ? shoreScenery(map, look, shore.paths) : [], weather: look?.weather,
  };
}
