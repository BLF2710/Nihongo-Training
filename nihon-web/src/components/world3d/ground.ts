// The ground of an island drawn in 3D: each tile of land a block standing out of the water (its top coloured by what
// it is: grass, path, gravel), the water a plane below, and bridges plank decks with rails. Tiles are world units:
// x east, z south, y up, the land's top at y = 0.
import * as THREE from "three";
import type { Terrain, TownMap } from "../../lib/errands/townMap";

const WATERY: ReadonlySet<Terrain> = new Set(["water", "sea", "waves"]);
const PLANKED: ReadonlySet<Terrain> = new Set(["bridge", "pier"]);
/** How far the water lies below the land, and how deep the land's blocks reach under it. */
export const WATER_LEVEL = -0.16;
const LAND_DEPTH = 0.5;
/** The coloured top of each tile of land, over the earth of its block. */
const TOP_DEPTH = 0.06;
const DECK_DEPTH = 0.08;
const RAIL_HEIGHT = 0.22;
const RAIL_WIDTH = 0.08;
const SEA_SIZE = 600;
/** How much lighter or darker each tile is than its terrain's colour, so the grass isn't one flat sheet. */
const SHADE_VARIATION = 0.015;

const LAND_COLOURS: Partial<Readonly<Record<Terrain, string>>> = {
  grass: "#86bf5e", flowers: "#86bf5e", tallgrass: "#7cb457", path: "#dccaa0", gravel: "#e2d9c5", stones: "#cfc6b4",
};
const DEFAULT_LAND_COLOUR = "#86bf5e";
const EARTH_COLOUR = "#8a6b4a";
const WOOD_COLOUR = "#a57a4f";
const WATER_COLOUR = "#5ba6d2";

/** A steady small number in [-1, 1] for a tile, so its shade is the same every time. */
function tileNoise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

const landTiles = (map: TownMap) => map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => WATERY.has(terrain) || PLANKED.has(terrain) ? [] : [{ x, y, terrain }]));
const deckTiles = (map: TownMap) => map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => PLANKED.has(terrain) ? [{ x, y }] : []));

/** One block per tile of land: earth below, its terrain's colour on top. */
function land(map: TownMap): THREE.Group {
  const tiles = landTiles(map);
  const earth = new THREE.InstancedMesh(new THREE.BoxGeometry(1, LAND_DEPTH, 1), new THREE.MeshLambertMaterial({ color: EARTH_COLOUR }), tiles.length);
  const tops = new THREE.InstancedMesh(new THREE.BoxGeometry(1, TOP_DEPTH, 1), new THREE.MeshLambertMaterial(), tiles.length);
  const place = new THREE.Matrix4(), colour = new THREE.Color();
  tiles.forEach(({ x, y, terrain }, index) => {
    earth.setMatrixAt(index, place.makeTranslation(x + 0.5, -TOP_DEPTH - LAND_DEPTH / 2, y + 0.5));
    tops.setMatrixAt(index, place.makeTranslation(x + 0.5, -TOP_DEPTH / 2, y + 0.5));
    colour.set(LAND_COLOURS[terrain] ?? DEFAULT_LAND_COLOUR).offsetHSL(0, 0, tileNoise(x, y) * SHADE_VARIATION);
    tops.setColorAt(index, colour);
  });
  earth.receiveShadow = true;
  tops.receiveShadow = true;
  return new THREE.Group().add(earth, tops);
}

/** Plank decks over the water, with a rail along each side that has water beside it. */
function decks(map: TownMap): THREE.Group {
  const wood = new THREE.MeshLambertMaterial({ color: WOOD_COLOUR });
  const group = new THREE.Group();
  const isWaterAt = (x: number, y: number) => WATERY.has(map.terrain[y]?.[x] ?? "grass");
  for (const { x, y } of deckTiles(map)) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1, DECK_DEPTH, 1), wood);
    deck.position.set(x + 0.5, -DECK_DEPTH / 2, y + 0.5);
    deck.receiveShadow = true;
    group.add(deck);
    for (const side of [-1, 1]) {
      if (!isWaterAt(x + side, y)) continue;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(RAIL_WIDTH, RAIL_HEIGHT, 1), wood);
      rail.position.set(x + 0.5 + side * (0.5 - RAIL_WIDTH / 2), RAIL_HEIGHT / 2, y + 0.5);
      rail.castShadow = true;
      group.add(rail);
    }
  }
  return group;
}

/** The water: one wide plane under the land, reaching out to the horizon. */
function water(): THREE.Mesh {
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(SEA_SIZE, SEA_SIZE).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: WATER_COLOUR, roughness: 0.35, metalness: 0 }));
  sea.position.y = WATER_LEVEL;
  sea.receiveShadow = true;
  return sea;
}

/** The island's whole ground: land, bridges and the water round it. */
export function buildGround(map: TownMap): THREE.Group {
  return new THREE.Group().add(water(), land(map), decks(map));
}
