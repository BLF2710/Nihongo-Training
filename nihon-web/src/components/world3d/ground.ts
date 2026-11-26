// The ground of an island drawn in 3D: each tile of land a block standing out of the water (its top coloured by what
// it is: grass, path, gravel), its bridges (see bridges.ts) and piers, and any far shore across the water (its land,
// paths and hills; the bridges carry on over the water to it). Tiles are world units: x east, z south, y up, the land's top at y = 0.
import * as THREE from "three";
import type { Rect, Terrain, TownMap } from "../../lib/errands/townMap.ts";
import { bridgeSpans } from "../../lib/world/bridges.ts";
import { steadyNoise } from "../../lib/world/islandModels.ts";
import type { FarShore, Hill } from "../../lib/world/islandModels.ts";
import { buildBridges } from "./bridges.ts";
import { groundDetails } from "./groundDetails.ts";

/** Terrain with no land: water, a goldfish pool, and the sea of clouds below the summit. */
const WATERY: ReadonlySet<Terrain> = new Set(["water", "sea", "waves", "goldfish", "cloud"]);
const PLANKED: ReadonlySet<Terrain> = new Set(["bridge", "pier"]);
/** How deep the land's blocks reach (under the water). */
const LAND_DEPTH = 0.5;
/** The coloured top of each tile of land, over the earth of its block. */
const TOP_DEPTH = 0.06;
const DECK_DEPTH = 0.08;
const RAIL_HEIGHT = 0.22;
const RAIL_WIDTH = 0.08;
/** A path lies this little above the land it crosses, so the two don't flicker into each other. */
const PATH_LIFT = 0.006;
/** How much lighter or darker each tile is than its terrain's colour, so the grass isn't one flat sheet. */
const SHADE_VARIATION = 0.015;

type LandColours = Partial<Readonly<Record<Terrain, string>>>;
/** Stepping stones lie on grass (the stones themselves are `groundDetails`); fallen maple leaves on grass going gold. */
const LAND_COLOURS: LandColours = {
  grass: "#86bf5e", flowers: "#86bf5e", tallgrass: "#7cb457", path: "#dccaa0", gravel: "#e2d9c5", stones: "#86bf5e",
  petals: "#ecc9cd", leaves: "#a8b65c", raked: "#e6dfcf", snow: "#f4f7fa", steps: "#b9b3a7", rock: "#8f8a80",
};
const DEFAULT_LAND_COLOUR = "#86bf5e";
const EARTH_COLOUR = "#8a6b4a";
const WOOD_COLOUR = "#a57a4f";
const HILL_COLOUR = "#79ad55";
/** A hill's sides are this many faces round and up, for the low-poly look. */
const HILL_SEGMENTS = { round: 12, up: 5 } as const;

const landTiles = (map: TownMap) => map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => WATERY.has(terrain) || PLANKED.has(terrain) ? [] : [{ x, y, terrain }]));
const pierTiles = (map: TownMap) => map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => terrain === "pier" ? [{ x, y }] : []));

/** One block per tile of land: earth below, its terrain's colour on top (as `colours` has it, or as usual). */
function land(map: TownMap, colours: LandColours): THREE.Group {
  const tiles = landTiles(map);
  const earth = new THREE.InstancedMesh(new THREE.BoxGeometry(1, LAND_DEPTH, 1), new THREE.MeshLambertMaterial({ color: EARTH_COLOUR }), tiles.length);
  const tops = new THREE.InstancedMesh(new THREE.BoxGeometry(1, TOP_DEPTH, 1), new THREE.MeshLambertMaterial(), tiles.length);
  const place = new THREE.Matrix4(), colour = new THREE.Color();
  tiles.forEach(({ x, y, terrain }, index) => {
    earth.setMatrixAt(index, place.makeTranslation(x + 0.5, -TOP_DEPTH - LAND_DEPTH / 2, y + 0.5));
    tops.setMatrixAt(index, place.makeTranslation(x + 0.5, -TOP_DEPTH / 2, y + 0.5));
    colour.set(colours[terrain] ?? LAND_COLOURS[terrain] ?? DEFAULT_LAND_COLOUR).offsetHSL(0, 0, steadyNoise(x, y) * SHADE_VARIATION);
    tops.setColorAt(index, colour);
  });
  earth.receiveShadow = true;
  tops.receiveShadow = true;
  return new THREE.Group().add(earth, tops);
}

/** A rail at `at`, `width` east to west and `depth` north to south. */
function rail(wood: THREE.Material, at: { x: number; z: number }, { width, depth }: { width: number; depth: number }): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, RAIL_HEIGHT, depth), wood);
  mesh.position.set(at.x, RAIL_HEIGHT / 2, at.z);
  mesh.castShadow = true;
  return mesh;
}

/** The piers' plank decks over the water, with a rail along each side that has water beside it. */
function piers(map: TownMap): THREE.Group {
  const wood = new THREE.MeshLambertMaterial({ color: WOOD_COLOUR });
  const group = new THREE.Group();
  const isWaterAt = (x: number, y: number) => WATERY.has(map.terrain[y]?.[x] ?? "grass");
  for (const { x, y } of pierTiles(map)) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1, DECK_DEPTH, 1), wood);
    deck.position.set(x + 0.5, -DECK_DEPTH / 2, y + 0.5);
    deck.receiveShadow = true;
    group.add(deck);
    for (const side of [-1, 1]) {
      if (isWaterAt(x + side, y)) group.add(rail(wood, { x: x + 0.5 + side * (0.5 - RAIL_WIDTH / 2), z: y + 0.5 }, { width: RAIL_WIDTH, depth: 1 }));
      if (isWaterAt(x, y + side)) group.add(rail(wood, { x: x + 0.5, z: y + 0.5 + side * (0.5 - RAIL_WIDTH / 2) }, { width: 1, depth: RAIL_WIDTH }));
    }
  }
  return group;
}

/** A block of land `rect` wide, grass on earth, its top `lift` above the island's (so paths lie on top). */
function slab(rect: Rect, colour: string, lift = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(rect.width, LAND_DEPTH, rect.height), new THREE.MeshLambertMaterial({ color: colour }));
  mesh.position.set(rect.x + rect.width / 2, lift - LAND_DEPTH / 2, rect.y + rect.height / 2);
  mesh.receiveShadow = true;
  return mesh;
}

/** A low-poly hill: a dome of grass. */
function hill({ x, y, radius, height }: Hill): THREE.Mesh {
  const dome = new THREE.SphereGeometry(1, HILL_SEGMENTS.round, HILL_SEGMENTS.up, 0, Math.PI * 2, 0, Math.PI / 2);
  const mesh = new THREE.Mesh(dome, new THREE.MeshStandardMaterial({ color: HILL_COLOUR, roughness: 1, flatShading: true }));
  mesh.scale.set(radius, height, radius);
  mesh.position.set(x, 0, y);
  mesh.receiveShadow = true;
  return mesh;
}

/** The far shore: its land, the paths carrying the island's bridges on, and its hills. */
function farShore({ land: strips, paths, hills }: FarShore): THREE.Group {
  const pathColour = LAND_COLOURS.path ?? DEFAULT_LAND_COLOUR;
  return new THREE.Group().add(
    ...strips.map(strip => slab(strip, DEFAULT_LAND_COLOUR)),
    ...paths.map(path => slab(path, pathColour, PATH_LIFT)),
    ...hills.map(hill),
  );
}

/** The island's whole ground: land (its terrain coloured as `landColours` has it, where it does), bridges carried on
 *  over the water to the far shore, piers, the details lying on it, and the far shore, if it has one (the water is
 *  `LivelyWater`). */
export function buildGround(map: TownMap, { shore, landColours = {} }: { shore?: FarShore; landColours?: LandColours }): THREE.Group {
  const bridges = buildBridges(bridgeSpans(map, shore?.decks ?? []));
  const ground = new THREE.Group().add(land(map, landColours), bridges, piers(map), groundDetails(map));
  if (shore) ground.add(farShore(shore));
  return ground;
}
