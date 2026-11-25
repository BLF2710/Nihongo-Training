// Banks of cloud round an island high on the mountain: soft white heaps scattered over the sea of clouds below its
// edge, so it looks like cloud rather than a white floor. One mesh, standing still.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { TownMap } from "../../lib/errands/townMap.ts";
import { steadyNoise } from "../../lib/world/islandModels.ts";
import { WATER_LEVEL } from "./water.ts";

const BANKS = 70;
const PUFFS_PER_BANK = 4;
/** How far from the island's edge the banks lie (in tiles). */
const REACH = { nearest: 1.5, furthest: 26 } as const;
const COLOUR = "#ffffff";

const steady = (index: number, salt: number) => (steadyNoise(index * 1.93 + salt, salt * 2.71 - index) + 1) / 2;

/** A point `distance` out from the island's edge, `around` (0 to 1) the way round it. */
function aroundIsland(map: TownMap, around: number, distance: number): THREE.Vector3 {
  const angle = around * Math.PI * 2;
  const direction = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
  // Out from the middle to the edge of the island's rectangle, then on past it.
  const toEdge = Math.min(map.width / 2 / Math.max(Math.abs(direction.x), 1e-6), map.height / 2 / Math.max(Math.abs(direction.y), 1e-6));
  const reach = toEdge + distance;
  return new THREE.Vector3(map.width / 2 + direction.x * reach, WATER_LEVEL, map.height / 2 + direction.y * reach);
}

export function cloudBanks(map: TownMap): THREE.Mesh {
  const puffs = Array.from({ length: BANKS }, (_, bank) => {
    const centre = aroundIsland(map, steady(bank, 1), REACH.nearest + steady(bank, 2) ** 1.5 * (REACH.furthest - REACH.nearest));
    const size = 0.8 + steady(bank, 3) * 1.4;
    return Array.from({ length: PUFFS_PER_BANK }, (_, puff) => new THREE.IcosahedronGeometry(size * (0.5 + steady(bank * 7 + puff, 4) * 0.5), 1)
      .scale(1, 0.45, 1)
      .translate(centre.x + (steady(bank * 7 + puff, 5) - 0.5) * size * 2, centre.y + steady(bank * 7 + puff, 6) * 0.2, centre.z + (steady(bank * 7 + puff, 7) - 0.5) * size));
  }).flat();
  const mesh = new THREE.Mesh(mergeGeometries(puffs), new THREE.MeshStandardMaterial({ color: COLOUR, roughness: 1, flatShading: true }));
  for (const puff of puffs) puff.dispose();
  mesh.receiveShadow = true;
  return mesh;
}
