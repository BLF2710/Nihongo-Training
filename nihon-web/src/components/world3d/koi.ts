// Koi swimming round an island's ponds: a few in each, red, orange and white, gliding in slow loops in the top of the
// water, their tails swishing.
import * as THREE from "three";
import type { Vector } from "../../lib/errands/movement.ts";
import { WATER_LEVEL } from "./water.ts";

const KOI_PER_TILE = 0.5;
const MOST_KOI_IN_A_POND = 6;
const COLOURS = ["#f06a2a", "#f7f1e6", "#d8342b", "#f5a03a"] as const;
/** How far a koi's loop reaches across its pond (as a share of the pond's size), how fast it swims round (radians a
 *  second) and how fast its tail swishes. */
const LOOP_SHARE = 0.32;
const SWIM_PER_SECOND = 0.35;
const SWISH_PER_SECOND = 7;
/** How far over the water's level they swim: the water hides anything under it, so they swim in its very top. */
const SWIM_DEPTH = 0.012;

type Koi = { fish: THREE.Group; tail: THREE.Object3D; centre: Vector; reach: Vector; angle: number; speed: number };

/** A koi facing east: a long body and a fanned tail. */
function koiShape(colour: string): { fish: THREE.Group; tail: THREE.Object3D } {
  const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6, flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 4).scale(2.2, 0.4, 1), material);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4).rotateZ(Math.PI / 2).scale(1, 0.3, 1), material);
  tail.position.x = -0.17;
  return { fish: new THREE.Group().add(body, tail), tail };
}

export class SwimmingKoi {
  readonly group = new THREE.Group();
  private readonly koi: Koi[];
  private time = 0;

  /** `ponds` are each pond's water tiles; `random` scatters the koi (Math.random in the browser). */
  constructor(ponds: readonly (readonly Vector[])[], random: () => number) {
    this.koi = ponds.flatMap(tiles => {
      const xs = tiles.map(({ x }) => x), ys = tiles.map(({ y }) => y);
      const left = Math.min(...xs), right = Math.max(...xs) + 1, top = Math.min(...ys), bottom = Math.max(...ys) + 1;
      const centre = { x: (left + right) / 2, y: (top + bottom) / 2 };
      const count = Math.min(MOST_KOI_IN_A_POND, Math.max(1, Math.round(tiles.length * KOI_PER_TILE)));
      return Array.from({ length: count }, (_, index): Koi => {
        const { fish, tail } = koiShape(COLOURS[index % COLOURS.length]);
        const size = 0.6 + random() * 0.4;
        return {
          fish, tail, centre, angle: random() * Math.PI * 2, speed: SWIM_PER_SECOND * (0.7 + random() * 0.6) * (random() > 0.5 ? 1 : -1),
          reach: { x: (right - left) * LOOP_SHARE * size, y: (bottom - top) * LOOP_SHARE * size },
        };
      });
    });
    for (const { fish } of this.koi) this.group.add(fish);
    this.update(0);
  }

  /** Lets the koi swim on for `seconds`. */
  update(seconds: number): void {
    this.time += seconds;
    for (const koi of this.koi) {
      koi.angle += koi.speed * seconds;
      const x = koi.centre.x + Math.cos(koi.angle) * koi.reach.x, z = koi.centre.y + Math.sin(koi.angle) * koi.reach.y;
      // A koi faces east unturned; turning it by an angle points it east and that far north, so it faces the way it swims.
      const heading = Math.atan2(-Math.cos(koi.angle) * koi.reach.y * Math.sign(koi.speed), -Math.sin(koi.angle) * koi.reach.x * Math.sign(koi.speed));
      koi.fish.position.set(x, WATER_LEVEL + SWIM_DEPTH, z);
      koi.fish.rotation.y = heading;
      koi.tail.rotation.y = Math.sin(this.time * SWISH_PER_SECOND + koi.angle) * 0.4;
    }
  }
}
