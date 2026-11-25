// A garden's pieces, built in code (our own designs, low-poly like the buildings): a snow-viewing lantern, low and
// wide-roofed on splayed legs, and a round azalea bush in flower. Each is built facing south on the ground it's given.
import * as THREE from "three";
import type { ShrinePropKind } from "../../../lib/world/islandProps.ts";
import { glowing, placed } from "./shapes.ts";
import type { PropBuilder } from "./shapes.ts";

const COLOUR = { stone: "#a9a59c", stoneDark: "#8f8b82", light: "#ffd98a", leaves: "#4f8c3c", leavesLight: "#6aa84d", flowers: "#ef7fa5" } as const;

/** A snow-viewing lantern: a broad six-sided roof with a jewel on top over a lit firebox, standing on three legs
 *  splayed out. */
const yukimiLantern: PropBuilder = palette => {
  const stone = palette.of(COLOUR.stone), dark = palette.of(COLOUR.stoneDark);
  const group = new THREE.Group().add(
    placed(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 6), dark, { y: 0.42 }),
    placed(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 6), glowing(COLOUR.light, 0.7), { y: 0.55 }),
    placed(new THREE.CylinderGeometry(0.05, 0.44, 0.14, 6), stone, { y: 0.71 }),
    placed(new THREE.DodecahedronGeometry(0.06), stone, { y: 0.82 }),
  );
  for (let leg = 0; leg < 3; leg += 1) {
    const angle = (leg / 3) * Math.PI * 2 + Math.PI / 6;
    const foot = placed(new THREE.CylinderGeometry(0.035, 0.05, 0.46, 5), dark, { x: Math.cos(angle) * 0.17, y: 0.2, z: Math.sin(angle) * 0.17 });
    // Each leg leans in at the top, so the three splay out at their feet.
    foot.rotation.set(-Math.sin(angle) * 0.4, 0, Math.cos(angle) * 0.4);
    group.add(foot);
  }
  return group;
};

/** A round azalea bush in flower: a few heaps of leaves, dotted pink. */
const bush: PropBuilder = palette => {
  const heaps = [{ x: 0, z: 0, radius: 0.3 }, { x: 0.2, z: 0.12, radius: 0.22 }, { x: -0.2, z: 0.1, radius: 0.2 }];
  const group = new THREE.Group();
  heaps.forEach(({ x, z, radius }, index) => {
    const heap = placed(new THREE.IcosahedronGeometry(radius, 1), palette.of(index === 0 ? COLOUR.leaves : COLOUR.leavesLight), { x, y: radius * 0.7, z });
    heap.scale.set(1, 0.8, 1);
    group.add(heap);
    for (let flower = 0; flower < 5; flower += 1) {
      const angle = flower * 2.4 + index;
      group.add(placed(new THREE.IcosahedronGeometry(0.04, 0), palette.of(COLOUR.flowers),
        { x: x + Math.cos(angle) * radius * 0.75, y: radius * (0.9 + 0.3 * Math.sin(flower)), z: z + Math.sin(angle) * radius * 0.75 }));
    }
  });
  return group;
};

export const GARDEN_PROP_BUILDERS: ReadonlyMap<ShrinePropKind, PropBuilder> = new Map<ShrinePropKind, PropBuilder>([
  ["yukimi-lantern", yukimiLantern], ["bush", bush],
]);
