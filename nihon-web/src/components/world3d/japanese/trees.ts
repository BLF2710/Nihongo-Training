// The islands' trees, built in code: one on each tree tile of the ground (a great one on a block of two by two). A
// cherry tree is a gnarled trunk splitting into branches under a soft crown of round pink clumps, lighter where the
// sun falls on them, with fallen petals round its foot; a garden tree is the same in green, and a maple in red,
// orange and gold, its leaves fallen round it. A garden pine is a twisting trunk holding out flat pads of dark
// needles. A clump of bamboo is a few tall jointed canes, leaning a little apart, with sprays of slim leaves near
// their tops. Each is different (its lean, branches and clumps follow from
// its tile, so it's the same tree every visit), and each is one mesh of coloured parts, so a grove draws quickly.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Rect, Terrain } from "../../../lib/errands/townMap.ts";
import { steadyNoise } from "../../../lib/world/islandModels.ts";
import { paintedByHeight } from "./nature.ts";
import type { Palette } from "./shapes.ts";

export type TreeBuilder = (palette: Palette, at: Rect) => THREE.Object3D;

const BARK = "#5e3b2b";
const BARK_DARK = "#4a2d21";
/** A crown's colours: darker underneath, its body, and lighter on top where the sun is. */
type Crown = { shade: string; body: string; light: string };
const BLOSSOM: readonly Crown[] = [{ shade: "#e07f9f", body: "#f3a9c0", light: "#fdd7e3" }];
const LEAVES: readonly Crown[] = [{ shade: "#3f7a35", body: "#5c9c45", light: "#86c25a" }];
const MAPLE: readonly Crown[] = [
  { shade: "#9e2a1f", body: "#cf4228", light: "#ef7a45" },
  { shade: "#b3541c", body: "#e07b2a", light: "#f6a849" },
  { shade: "#b88a1e", body: "#e0b23a", light: "#f5d36a" },
];
const PETALS = ["#f6bccd"] as const;
const MAPLE_LEAVES = ["#d2492f", "#e57b2f", "#efb23c"] as const;

/** A cherry tree one tile across, in tiles: how tall its trunk stands before it splits, how far its branches reach
 *  out and up, how big its crown's clumps are, and how many there are on each branch. A great tree is all of this
 *  times its size. */
const TREE = {
  trunkHeight: 0.62, trunkRadius: 0.11, branchReach: 0.42, branchRise: 0.5, branchRadius: 0.055,
  clumpRadius: 0.26, clumpsPerBranch: 5, branches: 4, fallenPetals: 10, petalSpread: 0.85,
} as const;
/** A great tree has more branches and clumps for its size, so its crown stays full. */
const GREAT_TREE_BRANCHES = 6;
const GREAT_TREE_CLUMPS_PER_BRANCH = 9;

/** Steady random numbers in [0, 1) for one tree, the same every time for the same tile. */
function steadyRandom(at: Rect): () => number {
  let seed = Math.floor((steadyNoise(at.x, at.y) + 1) * 2 ** 30) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** Paints every vertex of a part one colour, or (given `light`) from `colour` at its bottom to `light` at its top. */
function painted(geometry: THREE.BufferGeometry, colour: string, light?: string): THREE.BufferGeometry {
  const bottom = new THREE.Color(colour), top = new THREE.Color(light ?? colour), mixed = new THREE.Color();
  const positions = geometry.getAttribute("position");
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
  const colours = new Float32Array(positions.count * 3);
  for (let index = 0; index < positions.count; index += 1) {
    const height = (positions.getY(index) - min.y) / Math.max(max.y - min.y, 1e-6);
    mixed.copy(bottom).lerp(top, height).toArray(colours, index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return geometry;
}

/** A tapering limb of bark from `from` to `to`, with a knot at its top so joints don't show. */
function limb(from: THREE.Vector3, to: THREE.Vector3, radius: { from: number; to: number }): THREE.BufferGeometry[] {
  const direction = to.clone().sub(from);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius.to, radius.from, length, 7, 1);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
  geometry.translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
  const knot = new THREE.SphereGeometry(radius.to, 5, 3).translate(to.x, to.y, to.z);
  return [painted(geometry, BARK_DARK, BARK), painted(knot, BARK)];
}

/** One of `choices` (the only one without drawing a random number, so a one-colour tree comes out as it always has). */
const pickOf = <T,>(choices: readonly T[], random: () => number): T =>
  choices.length === 1 ? choices[0] : choices[Math.floor(random() * choices.length) % choices.length];

/** How finely a clump is rounded: coarse enough that hundreds of trees draw quickly (the crown has many clumps, so it
 *  still looks soft), fine enough not to look faceted from the camera. */
const CLUMP_SEGMENTS = { around: 8, down: 5 } as const;

/** A round clump of the crown, in one of its colourings: darker underneath, lighter on top where the sun is. */
function clump(at: THREE.Vector3, radius: number, crowns: readonly Crown[], random: () => number): THREE.BufferGeometry {
  const crown = pickOf(crowns, random);
  const isBright = random() > 0.5;
  const geometry = new THREE.SphereGeometry(radius, CLUMP_SEGMENTS.around, CLUMP_SEGMENTS.down).translate(at.x, at.y, at.z);
  return painted(geometry, crown.shade, isBright ? crown.light : crown.body);
}

/** Petals or leaves fallen round the tree's foot, lying flat just above the ground. */
function fallen(count: number, spread: number, colours: readonly string[], random: () => number): THREE.BufferGeometry[] {
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2, distance = spread * Math.sqrt(random());
    const petal = new THREE.CircleGeometry(0.035, 5).rotateX(-Math.PI / 2).rotateY(random() * Math.PI);
    return painted(petal.translate(Math.cos(angle) * distance, 0.004, Math.sin(angle) * distance), pickOf(colours, random));
  });
}

/** How a broad-leaved tree grows: how many branches and clumps on each, and its crown's colourings. */
type Growth = { branches: number; clumpsPerBranch: number; crowns: readonly Crown[] };

/** The trunk, rising with a lean and a bend, its branches spreading round from its top, and the clumps on them. */
function broadleafParts(size: number, random: () => number, { branches: branchCount, clumpsPerBranch, crowns }: Growth): THREE.BufferGeometry[] {
  const lean = new THREE.Vector3((random() - 0.5) * 0.25, 0, (random() - 0.5) * 0.25).multiplyScalar(size);
  const bend = new THREE.Vector3(0, TREE.trunkHeight * 0.5 * size, 0).add(lean.clone().multiplyScalar(0.6));
  const top = new THREE.Vector3(0, TREE.trunkHeight * size, 0).add(lean);
  const trunkRadius = TREE.trunkRadius * size;
  const parts = [
    ...limb(new THREE.Vector3(), bend, { from: trunkRadius * 1.35, to: trunkRadius }),
    ...limb(bend, top, { from: trunkRadius, to: trunkRadius * 0.8 }),
  ];
  const turn = random() * Math.PI * 2;
  for (let branch = 0; branch < branchCount; branch += 1) {
    const angle = turn + (branch / branchCount) * Math.PI * 2 + (random() - 0.5) * 0.6;
    const reach = TREE.branchReach * size * (0.75 + random() * 0.5);
    const end = top.clone().add(new THREE.Vector3(Math.cos(angle) * reach, TREE.branchRise * size * (0.7 + random() * 0.6), Math.sin(angle) * reach));
    parts.push(...limb(top, end, { from: trunkRadius * 0.7, to: TREE.branchRadius * size }));
    for (let index = 0; index < clumpsPerBranch; index += 1) {
      const offset = new THREE.Vector3(random() - 0.5, (random() - 0.3) * 0.8, random() - 0.5).multiplyScalar(TREE.clumpRadius * size * 2.2);
      parts.push(clump(end.clone().add(offset), TREE.clumpRadius * size * (0.7 + random() * 0.6), crowns, random));
    }
  }
  // A crown over the middle, so the tree is round from above rather than a ring of clumps.
  parts.push(clump(top.clone().add(new THREE.Vector3(0, TREE.branchRise * size * 1.15, 0)), TREE.clumpRadius * size * 1.5, crowns, random));
  return parts;
}

/** The parts of a tree as one mesh, coloured as each part is painted. */
function mergedTree(palette: Palette, parts: readonly THREE.BufferGeometry[]): THREE.Mesh {
  const geometry = mergeGeometries(parts.map(part => part.index ? part.toNonIndexed() : part));
  for (const part of parts) part.dispose();
  return new THREE.Mesh(geometry, palette.coloured());
}

/** A broad-leaved tree with `crowns` for its colourings, as big as its ground (one tile, or a great tree on two by
 *  two), and what has fallen round it, if anything. */
function broadleaf(crowns: readonly Crown[], fallenColours: readonly string[]): TreeBuilder {
  return (palette, at) => {
    const size = Math.min(at.width, at.height);
    const random = steadyRandom(at);
    const isGreat = size > 1;
    const growth = { crowns, branches: isGreat ? GREAT_TREE_BRANCHES : TREE.branches, clumpsPerBranch: isGreat ? GREAT_TREE_CLUMPS_PER_BRANCH : TREE.clumpsPerBranch };
    const fallenCount = fallenColours.length > 0 ? TREE.fallenPetals * size * size : 0;
    return mergedTree(palette, [...broadleafParts(size, random, growth), ...fallen(fallenCount, TREE.petalSpread * size, fallenColours, random)]);
  };
}

const PINE = { bark: "#6b4a35", needles: { shade: "#2c5232", light: "#5f8f4b" }, height: 1.5, pads: 5, padRadius: 0.34 } as const;
/** Snow lying on a pad of needles: its colour, and how far up the pad (a share of its height) it starts. */
const SNOW = { colour: "#f4f7fa", line: 0.45 } as const;

/** How a pine's pads of needles are coloured: green going lighter towards the top, or green under a cap of snow. */
type NeedlePainter = (needles: THREE.BufferGeometry) => THREE.BufferGeometry;
const greenNeedles: NeedlePainter = needles => painted(needles, PINE.needles.shade, PINE.needles.light);
const snowyNeedles: NeedlePainter = needles => paintedByHeight(needles.toNonIndexed(), { low: PINE.needles.shade, high: SNOW.colour, line: SNOW.line });

/** A garden pine: a trunk twisting up in three turns, holding out flat pads of needles on short branches, one on top. */
const pineWith = (paintNeedles: NeedlePainter): TreeBuilder => (palette, at) => {
  const size = Math.min(at.width, at.height);
  const random = steadyRandom(at);
  const parts: THREE.BufferGeometry[] = [];
  const bends = [new THREE.Vector3()];
  for (let turn = 1; turn <= 3; turn += 1) {
    const side = turn % 2 === 0 ? -1 : 1;
    bends.push(new THREE.Vector3(side * (0.1 + random() * 0.12) * size, (PINE.height * turn / 3) * size, (random() - 0.5) * 0.15 * size));
  }
  for (let index = 1; index < bends.length; index += 1) {
    const radius = 0.09 * size * (1 - index * 0.2);
    parts.push(...limb(bends[index - 1], bends[index], { from: radius * 1.2, to: radius }).map(part => painted(part, PINE.bark)));
  }
  const pads = PINE.pads + (size > 1 ? 3 : 0);
  for (let pad = 0; pad < pads; pad += 1) {
    const isTop = pad === pads - 1;
    const share = isTop ? 1 : 0.35 + (pad / pads) * 0.6;
    const from = bends[Math.min(3, Math.max(1, Math.round(share * 3)))].clone().setY(PINE.height * share * size);
    const angle = random() * Math.PI * 2, reach = isTop ? 0 : (0.25 + random() * 0.25) * size;
    const to = from.clone().add(new THREE.Vector3(Math.cos(angle) * reach, 0.08 * size, Math.sin(angle) * reach));
    if (!isTop) parts.push(...limb(from, to, { from: 0.04 * size, to: 0.025 * size }).map(part => painted(part, PINE.bark)));
    const radius = PINE.padRadius * size * (isTop ? 1.1 : 0.75 + random() * 0.4);
    const needles = new THREE.SphereGeometry(radius, 9, 5).scale(1, 0.38, 1).translate(to.x, to.y + 0.05 * size, to.z);
    parts.push(paintNeedles(needles));
  }
  return mergedTree(palette, parts);
};
const pine = pineWith(greenNeedles);

const CANE = { base: "#5c8f37", top: "#93c25a", joint: "#456f28" } as const;
const BAMBOO_LEAF = { shade: "#5a9636", light: "#86c04f" } as const;
/** A clump of bamboo on one tile, in tiles: how many canes (more on a bigger block, for its ground), how tall and
 *  thick, how far apart its joints are, how far it leans, and how many sprays of leaves each cane holds. */
const BAMBOO = {
  canesPerTile: 4, shortest: 1.9, tallest: 2.7, caneRadius: 0.045, jointEvery: 0.38, lean: 0.12,
  spraysPerCane: 7, leavesPerSpray: 5, leafLength: 0.34, leafWidth: 0.08,
} as const;

/** Round edges of a cane and its joints: few, as there are many canes in a grove. */
const CANE_SIDES = 6;

/** A cane from the ground to `top`, a little thinner at the top, ringed by a joint every so often. */
function cane(top: THREE.Vector3, radius: number): THREE.BufferGeometry[] {
  const length = top.length();
  const upright = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().normalize());
  const stem = new THREE.CylinderGeometry(radius * 0.75, radius, length, CANE_SIDES, 1).translate(0, length / 2, 0).applyQuaternion(upright);
  const parts = [painted(stem, CANE.base, CANE.top)];
  for (let along = BAMBOO.jointEvery; along < length - 0.1; along += BAMBOO.jointEvery) {
    const joint = new THREE.CylinderGeometry(radius * 1.15, radius * 1.15, 0.03, CANE_SIDES, 1, true)
      .translate(0, along, 0).applyQuaternion(upright);
    parts.push(painted(joint, CANE.joint));
  }
  return parts;
}

/** A spray of slim leaves off a cane at `at`, fanning out `towards` a side and drooping. */
function leafSpray(at: THREE.Vector3, towards: number, random: () => number): THREE.BufferGeometry[] {
  return Array.from({ length: BAMBOO.leavesPerSpray }, (_, leaf) => {
    const blade = new THREE.SphereGeometry(1, 4, 2).scale(BAMBOO.leafLength / 2, 0.006, BAMBOO.leafWidth / 2);
    const fan = (leaf - (BAMBOO.leavesPerSpray - 1) / 2) * 0.35;
    blade.translate(BAMBOO.leafLength / 2, 0, 0).rotateZ(-0.5 - random() * 0.4).rotateY(towards + fan);
    return painted(blade.translate(at.x, at.y, at.z), random() > 0.5 ? BAMBOO_LEAF.light : BAMBOO_LEAF.shade);
  });
}

/** A clump of bamboo filling its ground: canes rising from all over it, each leaning a little its own way. */
const bamboo: TreeBuilder = (palette, at) => {
  const random = steadyRandom(at);
  const parts: THREE.BufferGeometry[] = [];
  const canes = BAMBOO.canesPerTile * at.width * at.height;
  for (let index = 0; index < canes; index += 1) {
    const foot = new THREE.Vector3((random() - 0.5) * at.width * 0.8, 0, (random() - 0.5) * at.height * 0.8);
    const height = BAMBOO.shortest + random() * (BAMBOO.tallest - BAMBOO.shortest);
    // Canes lean out from the clump's middle, as bamboo does, so the clump fans open towards the top.
    const lean = foot.clone().setY(0).multiplyScalar(BAMBOO.lean * 2).add(new THREE.Vector3((random() - 0.5) * BAMBOO.lean, 0, (random() - 0.5) * BAMBOO.lean));
    const top = new THREE.Vector3(lean.x * height, height, lean.z * height);
    const radius = BAMBOO.caneRadius * (0.8 + random() * 0.4);
    parts.push(...cane(top, radius).map(part => part.translate(foot.x, 0, foot.z)));
    for (let spray = 0; spray < BAMBOO.spraysPerCane; spray += 1) {
      const share = 0.5 + (spray / BAMBOO.spraysPerCane) * 0.5;
      const sprayAt = top.clone().multiplyScalar(share).add(foot);
      parts.push(...leafSpray(sprayAt, random() * Math.PI * 2, random));
    }
  }
  return mergedTree(palette, parts);
};

export const TREE_BUILDERS: ReadonlyMap<Terrain, TreeBuilder> = new Map<Terrain, TreeBuilder>([
  ["sakura", broadleaf(BLOSSOM, PETALS)], ["tree", broadleaf(LEAVES, [])], ["maple", broadleaf(MAPLE, MAPLE_LEAVES)], ["pine", pine], ["bamboo", bamboo],
]);

/** Trees as they stand in snow, where a look is snowy: pines with snow lying on their pads. (Bamboo stays green.) */
export const SNOWY_TREE_BUILDERS: ReadonlyMap<Terrain, TreeBuilder> = new Map<Terrain, TreeBuilder>([["pine", pineWith(snowyNeedles)]]);
