// The islands' rocks and the summit behind Fuji, built in code: a rock is a pair of rough boulders with moss (or, in
// snow, snow) on their tops; the summit is a great rough cone of grey rock, white with snow from halfway up. Each is one mesh of coloured
// parts, its roughness following from where it stands, so it's the same every visit.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Rect } from "../../../lib/errands/townMap.ts";
import { steadyNoise } from "../../../lib/world/islandModels.ts";
import type { Palette } from "./shapes.ts";

export type NatureBuilder = (palette: Palette, at: Rect) => THREE.Object3D;

const ROCK = { stone: "#8d877c", light: "#a59f93", moss: "#6f9a48", snow: "#f2f5f8" } as const;
const MOUNTAIN = { rock: "#7d8592", snow: "#fbfcfe", snowLine: 0.45, height: 0.55, roughness: 0.08 } as const;
/** How far up a boulder (as a share of its height) the moss starts. */
const MOSS_LINE = 0.62;

/** Pushes each corner of a shape in or out a little, steadily from `seed`, so it looks rough-hewn. */
export function roughened(geometry: THREE.BufferGeometry, amount: number, seed: number): THREE.BufferGeometry {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const positions = flat.getAttribute("position");
  const corner = new THREE.Vector3();
  for (let index = 0; index < positions.count; index += 1) {
    corner.fromBufferAttribute(positions, index);
    // Corners in the same place move together, so the faces stay joined.
    const push = 1 + steadyNoise(corner.x * 9.1 + seed, corner.y * 7.3 + corner.z * 5.7) * amount;
    positions.setXYZ(index, corner.x * push, corner.y * push, corner.z * push);
  }
  flat.computeVertexNormals();
  return flat;
}

/** Paints a part by height: `low` below `line` (a share of its height), `high` above. */
export function paintedByHeight(geometry: THREE.BufferGeometry, colours: { low: string; high: string; line: number }): THREE.BufferGeometry {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
  const low = new THREE.Color(colours.low), high = new THREE.Color(colours.high);
  const positions = geometry.getAttribute("position");
  const painted = new Float32Array(positions.count * 3);
  // A face takes the colour of its middle, so the line between the colours follows the faces.
  for (let face = 0; face < positions.count; face += 3) {
    const middle = (positions.getY(face) + positions.getY(face + 1) + positions.getY(face + 2)) / 3;
    const colour = (middle - box.min.y) / Math.max(box.max.y - box.min.y, 1e-6) > colours.line ? high : low;
    for (let corner = 0; corner < 3; corner += 1) colour.toArray(painted, (face + corner) * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(painted, 3));
  return geometry;
}

/** `parts` (each carrying its own colours) as one mesh; the parts are let go. */
export function merged(palette: Palette, parts: readonly THREE.BufferGeometry[]): THREE.Mesh {
  const mesh = new THREE.Mesh(mergeGeometries(parts.map(part => {
    part.deleteAttribute("uv");
    return part;
  })), palette.coloured());
  for (const part of parts) part.dispose();
  return mesh;
}

/** A big boulder and a small one leaning on it, `cap` (moss, or snow) lying on top. */
const rockCappedWith = (cap: string): NatureBuilder => (palette, { x, y }) => {
  const seed = steadyNoise(x, y) * 100;
  const turn = (steadyNoise(y, x) + 1) * Math.PI;
  const boulder = (radius: number, at: { x: number; z: number }, salt: number) => paintedByHeight(
    roughened(new THREE.IcosahedronGeometry(radius, 1), 0.22, seed + salt).scale(1.1, 0.75, 1).rotateY(turn).translate(at.x, radius * 0.5, at.z),
    { low: salt > 0 ? ROCK.light : ROCK.stone, high: cap, line: MOSS_LINE });
  return merged(palette, [boulder(0.36, { x: -0.06, z: -0.04 }, 0), boulder(0.2, { x: 0.25, z: 0.2 }, 1)]);
};

/** The summit: a great rough cone of rock as wide as its ground, snow-covered from its snow line up. */
const mountain: NatureBuilder = (palette, { width }) => {
  const height = width * MOUNTAIN.height;
  const cone = new THREE.ConeGeometry(width / 2, height, 14, 6).translate(0, height / 2, 0);
  const rough = roughened(cone, MOUNTAIN.roughness, 3);
  return merged(palette, [paintedByHeight(rough, { low: MOUNTAIN.rock, high: MOUNTAIN.snow, line: MOUNTAIN.snowLine })]);
};

export const NATURE_BUILDERS = { rock: rockCappedWith(ROCK.moss), snowyRock: rockCappedWith(ROCK.snow), mountain } as const;
