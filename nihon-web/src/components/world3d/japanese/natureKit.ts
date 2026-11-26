// The wild's own pieces, built in code (our own low-poly designs): grey rocks, large, middling, small and flat, the
// bigger ones capped with moss; a cluster of them with grass growing between; a low mound of moss with stones poking
// through; and a small flowering bush. Each is one mesh of coloured faces, sized to the ground it's given.
import * as THREE from "three";
import type { ShrinePropKind } from "../../../lib/world/islandProps.ts";
import { merged, paintedByHeight, roughened } from "./nature.ts";
import type { Palette, PropBuilder, PropGround } from "./shapes.ts";

const COLOUR = {
  stone: "#8f8a82", stoneLight: "#a7a29a", stoneDark: "#7a756e", moss: "#6e9c45", mossLight: "#86b252", grass: "#5f9a3e",
  leaves: "#3f7d39", leavesLight: "#5b9a45", blossom: "#f3a7c1", blossomWhite: "#fbf1f3",
} as const;
/** A share of a part's height above which it's painted as moss; above 1, a part has none. */
const MOSS_LINE = { cap: 0.66, high: 0.74, none: 2 } as const;
/** How rough a rock's faces are, as a share of its size. */
const ROUGHNESS = 0.2;

type Where = { x: number; z: number };

/** A rough boulder of `radius` resting on the ground at `at`, stretched by `stretch`, moss on top above `mossLine`. */
function boulder(radius: number, at: Where, options: { stretch: THREE.Vector3; mossLine: number; stone: string; seed: number }): THREE.BufferGeometry {
  const { stretch, mossLine, stone, seed } = options;
  const shape = roughened(new THREE.DodecahedronGeometry(radius, 0), ROUGHNESS, seed).scale(stretch.x, stretch.y, stretch.z)
    .rotateY(seed * 0.7).translate(at.x, radius * stretch.y * 0.62, at.z);
  return paintedByHeight(shape, { low: stone, high: COLOUR.moss, line: mossLine });
}

/** A sprig of three grass blades leaning apart. */
function sprig(at: Where, height: number): THREE.BufferGeometry[] {
  return [-0.5, 0, 0.5].map(lean => paintedByHeight(new THREE.ConeGeometry(0.02, height, 3).toNonIndexed().translate(0, height / 2, 0)
    .rotateZ(lean * 0.5).rotateY(lean * 2).translate(at.x, 0, at.z), { low: COLOUR.grass, high: COLOUR.grass, line: MOSS_LINE.none }));
}

const sizeOf = ({ width, depth }: PropGround) => Math.min(width, depth);
const stretched = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const built = (palette: Palette, parts: readonly THREE.BufferGeometry[]) => new THREE.Group().add(merged(palette, parts));

/** A great boulder capped with moss, a smaller one at its foot and a pebble or two. */
const rockLarge: PropBuilder = (palette, ground) => {
  const size = sizeOf(ground);
  return built(palette, [
    boulder(size * 0.36, { x: -size * 0.06, z: -size * 0.04 }, { stretch: stretched(1.15, 0.95, 1), mossLine: MOSS_LINE.cap, stone: COLOUR.stone, seed: 1 }),
    boulder(size * 0.2, { x: size * 0.26, z: size * 0.2 }, { stretch: stretched(1.1, 0.8, 1), mossLine: MOSS_LINE.high, stone: COLOUR.stoneLight, seed: 2 }),
    boulder(size * 0.06, { x: -size * 0.3, z: size * 0.3 }, { stretch: stretched(1, 0.7, 1), mossLine: MOSS_LINE.none, stone: COLOUR.stoneDark, seed: 3 }),
    ...sprig({ x: size * 0.1, z: size * 0.34 }, 0.16),
  ]);
};

/** A rock standing a little taller than it's wide, moss over its top, with a tuft of grass by it. */
const rockMedium: PropBuilder = (palette, ground) => {
  const size = sizeOf(ground);
  return built(palette, [
    boulder(size * 0.28, { x: 0, z: 0 }, { stretch: stretched(1, 1.15, 0.9), mossLine: MOSS_LINE.cap, stone: COLOUR.stone, seed: 4 }),
    boulder(size * 0.05, { x: size * 0.28, z: size * 0.22 }, { stretch: stretched(1, 0.7, 1), mossLine: MOSS_LINE.none, stone: COLOUR.stoneDark, seed: 5 }),
    ...sprig({ x: -size * 0.24, z: size * 0.2 }, 0.14),
  ]);
};

/** A bare low rock. */
const rockSmall: PropBuilder = (palette, ground) => built(palette, [
  boulder(sizeOf(ground) * 0.2, { x: 0, z: 0 }, { stretch: stretched(1.2, 0.75, 1), mossLine: MOSS_LINE.none, stone: COLOUR.stone, seed: 6 }),
]);

/** A wide flat slab of pale stone, lying nearly level, to step or sit on. */
const rockFlat: PropBuilder = (palette, ground) => {
  const size = sizeOf(ground);
  const slab = roughened(new THREE.CylinderGeometry(size * 0.36, size * 0.4, size * 0.13, 7), ROUGHNESS * 0.4, 7).scale(1.2, 1, 0.9).translate(0, size * 0.065, 0);
  return built(palette, [paintedByHeight(slab, { low: COLOUR.stoneLight, high: COLOUR.stoneLight, line: MOSS_LINE.none })]);
};

/** Rocks heaped together, two of them mossy, with grass growing between. */
const rockCluster: PropBuilder = (palette, ground) => {
  const size = sizeOf(ground);
  const rocks = [
    { radius: 0.24, at: { x: -0.08, z: -0.1 }, mossLine: MOSS_LINE.cap, stone: COLOUR.stone },
    { radius: 0.2, at: { x: 0.22, z: -0.02 }, mossLine: MOSS_LINE.high, stone: COLOUR.stoneLight },
    { radius: 0.14, at: { x: -0.28, z: 0.16 }, mossLine: MOSS_LINE.none, stone: COLOUR.stoneDark },
    { radius: 0.1, at: { x: 0.12, z: 0.26 }, mossLine: MOSS_LINE.none, stone: COLOUR.stone },
  ];
  return built(palette, [
    ...rocks.map(({ radius, at, mossLine, stone }, index) =>
      boulder(size * radius, { x: size * at.x, z: size * at.z }, { stretch: stretched(1.1, 0.9 + index * 0.05, 1), mossLine, stone, seed: 8 + index })),
    ...sprig({ x: size * 0.02, z: size * 0.18 }, 0.18), ...sprig({ x: -size * 0.34, z: -size * 0.1 }, 0.14), ...sprig({ x: size * 0.36, z: size * 0.2 }, 0.12),
  ]);
};

/** A low lumpy mound of moss across its ground, a couple of stones poking through and grass sprouting from it. */
const mossMound: PropBuilder = (palette, { width, depth }) => {
  const lumps = [{ x: 0, z: 0, radius: 0.34 }, { x: 0.28, z: 0.08, radius: 0.26 }, { x: -0.3, z: 0.06, radius: 0.24 }, { x: 0.06, z: 0.24, radius: 0.2 }];
  const moss = lumps.map(({ x, z, radius }, index) => paintedByHeight(
    roughened(new THREE.IcosahedronGeometry(radius, 1), 0.12, 20 + index).scale(width * 0.8, 0.75, depth * 0.85).translate(x * width, radius * 0.25, z * depth),
    { low: COLOUR.moss, high: COLOUR.mossLight, line: 0.5 }));
  return built(palette, [
    ...moss,
    boulder(0.1, { x: 0.18 * width, z: -0.12 * depth }, { stretch: stretched(1.1, 1.2, 1), mossLine: MOSS_LINE.none, stone: COLOUR.stone, seed: 30 }),
    boulder(0.07, { x: -0.22 * width, z: 0.2 * depth }, { stretch: stretched(1, 1, 1), mossLine: MOSS_LINE.none, stone: COLOUR.stoneLight, seed: 31 }),
    ...sprig({ x: -0.08 * width, z: -0.18 * depth }, 0.2), ...sprig({ x: 0.36 * width, z: 0.16 * depth }, 0.16),
  ]);
};

/** A small round bush dotted with pink and white blossom. */
const bushSmall: PropBuilder = palette => {
  const leaves = [{ x: 0, z: 0, radius: 0.2 }, { x: 0.12, z: 0.08, radius: 0.13 }];
  const parts = leaves.flatMap(({ x, z, radius }, index) => [
    paintedByHeight(new THREE.IcosahedronGeometry(radius, 1).scale(1, 0.85, 1).translate(x, radius * 0.75, z),
      { low: COLOUR.leaves, high: COLOUR.leavesLight, line: 0.55 }),
    ...Array.from({ length: 6 }, (_, flower) => {
      const angle = flower * 2.4 + index;
      const colour = flower % 3 === 0 ? COLOUR.blossomWhite : COLOUR.blossom;
      return paintedByHeight(new THREE.IcosahedronGeometry(0.03, 0).translate(x + Math.cos(angle) * radius * 0.8, radius * (1 + 0.25 * Math.sin(flower)), z + Math.sin(angle) * radius * 0.8),
        { low: colour, high: colour, line: MOSS_LINE.none });
    }),
  ]);
  return built(palette, parts);
};

export const NATURE_KIT_BUILDERS: ReadonlyMap<ShrinePropKind, PropBuilder> = new Map<ShrinePropKind, PropBuilder>([
  ["rock-large", rockLarge], ["rock-medium", rockMedium], ["rock-small", rockSmall], ["rock-flat", rockFlat],
  ["rock-cluster", rockCluster], ["moss-mound", mossMound], ["bush-small", bushSmall],
]);
