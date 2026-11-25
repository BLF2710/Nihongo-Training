// The small things lying on an island's ground, by its terrain: stepping stones set in the grass, lines raked in the
// gravel of a zen garden, clumps of flowers, fallen maple leaves, drifts of snow and the edges of stone steps. All of
// them are one mesh of coloured parts, so they draw quickly however many there are.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Terrain, TownMap } from "../../lib/errands/townMap.ts";
import { steadyNoise } from "../../lib/world/islandModels.ts";

type Tile = { x: number; y: number };
/** The parts lying on one tile: `random(n)` gives that tile's own steady numbers in [0, 1). */
type DetailMaker = (tile: Tile, random: (index: number) => number) => THREE.BufferGeometry[];

const COLOURS = {
  stone: ["#b7b0a2", "#c6bfb1", "#a9a295"], rake: "#cfc6b1", flowers: ["#f4a6c0", "#fbf3f0", "#f6d36b", "#e88aa8"],
  leafy: "#6fa94a", leaves: ["#d2492f", "#e57b2f", "#efb23c", "#b8352a"], snow: "#ffffff", stepEdge: "#8f897d",
} as const;

/** A part painted one colour all over. */
function painted(geometry: THREE.BufferGeometry, colour: string): THREE.BufferGeometry {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const rgb = new THREE.Color(colour);
  const colours = new Float32Array(flat.getAttribute("position").count * 3);
  for (let index = 0; index < colours.length; index += 3) rgb.toArray(colours, index);
  flat.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return flat;
}

const pick = <T,>(choices: readonly T[], share: number): T => choices[Math.min(choices.length - 1, Math.floor(share * choices.length))];

/** Two flat stones, a little apart, each its own shape and shade. */
const steppingStones: DetailMaker = ({ x, y }, random) => [0, 1].map(stone => {
  const radius = 0.2 + random(stone) * 0.08;
  const slab = new THREE.CylinderGeometry(radius, radius * 1.05, 0.05, 7).scale(1, 1, 0.75 + random(stone + 4) * 0.3).rotateY(random(stone + 8) * Math.PI);
  return painted(slab.translate(x + 0.3 + stone * 0.4, 0.015, y + 0.3 + stone * 0.4 + (random(stone + 12) - 0.5) * 0.15), pick(COLOURS.stone, random(stone + 16)));
});

/** Lines raked across the gravel, east to west. */
const RAKE_LINES = 4;
const rakedLines: DetailMaker = ({ x, y }) => Array.from({ length: RAKE_LINES }, (_, line) =>
  painted(new THREE.BoxGeometry(1, 0.012, 0.035).translate(x + 0.5, 0.006, y + (line + 0.5) / RAKE_LINES), COLOURS.rake));

/** A low leafy clump dotted with flowers. */
const flowerClump: DetailMaker = ({ x, y }, random) => {
  const at = { x: x + 0.3 + random(0) * 0.4, z: y + 0.3 + random(1) * 0.4 };
  const leaves = painted(new THREE.IcosahedronGeometry(0.16, 0).scale(1, 0.5, 1).translate(at.x, 0.05, at.z), COLOURS.leafy);
  const flowers = Array.from({ length: 6 }, (_, flower) => {
    const angle = random(flower + 2) * Math.PI * 2, reach = 0.05 + random(flower + 9) * 0.1;
    return painted(new THREE.IcosahedronGeometry(0.035, 0).translate(at.x + Math.cos(angle) * reach, 0.11, at.z + Math.sin(angle) * reach), pick(COLOURS.flowers, random(flower + 20)));
  });
  return [leaves, ...flowers];
};

/** Maple leaves fallen on the grass, red, orange and gold. */
const fallenLeaves: DetailMaker = ({ x, y }, random) => Array.from({ length: 9 }, (_, leaf) => {
  const disc = new THREE.CircleGeometry(0.045, 5).rotateX(-Math.PI / 2).rotateY(random(leaf) * Math.PI);
  return painted(disc.translate(x + random(leaf + 10), 0.004, y + random(leaf + 20)), pick(COLOURS.leaves, random(leaf + 30)));
});

/** A soft drift of snow. */
const snowDrift: DetailMaker = ({ x, y }, random) => {
  const drift = new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.25 + random(0) * 0.2, 1);
  return [painted(drift.translate(x + 0.5, -0.02, y + 0.5), COLOURS.snow)];
};

/** The edges of stone steps going down eastwards. */
const stepEdges: DetailMaker = ({ x, y }) => [0.17, 0.5, 0.83].map(along =>
  painted(new THREE.BoxGeometry(0.06, 0.04, 1).translate(x + along, 0.02, y + 0.5), COLOURS.stepEdge));

const DETAIL_MAKERS: ReadonlyMap<Terrain, DetailMaker> = new Map<Terrain, DetailMaker>([
  ["stones", steppingStones], ["raked", rakedLines], ["flowers", flowerClump], ["leaves", fallenLeaves], ["snow", snowDrift], ["steps", stepEdges],
]);

/** Everything lying on the island's ground, as one mesh (empty if nothing does). */
export function groundDetails(map: TownMap): THREE.Object3D {
  const parts = map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => {
    const make = DETAIL_MAKERS.get(terrain);
    return make ? make({ x, y }, index => (steadyNoise(x * 7.3 + index * 1.37, y * 3.9 - index * 0.71) + 1) / 2) : [];
  }));
  if (parts.length === 0) return new THREE.Group();
  const mesh = new THREE.Mesh(mergeGeometries(parts.map(part => {
    part.deleteAttribute("uv");
    return part;
  })), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
  for (const part of parts) part.dispose();
  mesh.receiveShadow = true;
  return mesh;
}
