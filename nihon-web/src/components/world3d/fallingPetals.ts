// Cherry petals drifting down through the air over a sakura island: small pink petals falling, swaying and turning,
// in a box of air that moves with the camera, so there are always some in view however far the traveller walks.
import * as THREE from "three";

const PETAL_COUNT = 260;
const PETAL_COLOUR = "#f7c3d2";
const PETAL_SIZE = { width: 0.09, height: 0.06 } as const;
/** The air the petals fall through round what the camera looks at, in tiles: across, along, and from how high. */
const AIR = { width: 26, depth: 20, height: 6 } as const;
/** How fast petals fall (tiles a second) and how far and fast they sway and turn. */
const FALL = { slowest: 0.25, fastest: 0.5 } as const;
const SWAY = { reach: 0.6, perSecond: 0.9 } as const;
const SPIN_PER_SECOND = 1.6;

type Petal = { x: number; y: number; z: number; fall: number; phase: number; spin: THREE.Euler };

/** Where in the air a petal is, wrapped back into the box round `focus`. */
const wrapped = (value: number, centre: number, size: number) => centre - size / 2 + ((((value - (centre - size / 2)) % size) + size) % size);

export class FallingPetals {
  readonly mesh: THREE.InstancedMesh;
  private readonly petals: Petal[];
  private readonly place = new THREE.Matrix4();
  private readonly turn = new THREE.Quaternion();
  private readonly scale = new THREE.Vector3(1, 1, 1);
  private readonly at = new THREE.Vector3();
  private time = 0;

  /** `random` scatters the petals (Math.random in the browser; a steady one in tests). */
  constructor(random: () => number) {
    const material = new THREE.MeshStandardMaterial({ color: PETAL_COLOUR, side: THREE.DoubleSide, roughness: 0.8 });
    this.mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(PETAL_SIZE.width, PETAL_SIZE.height), material, PETAL_COUNT);
    this.mesh.frustumCulled = false;
    this.petals = Array.from({ length: PETAL_COUNT }, () => ({
      x: random() * AIR.width, y: random() * AIR.height, z: random() * AIR.depth,
      fall: FALL.slowest + random() * (FALL.fastest - FALL.slowest), phase: random() * Math.PI * 2,
      spin: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
    }));
  }

  /** Lets the petals fall for `seconds`, in the air round `focus`. */
  update(seconds: number, focus: THREE.Vector3): void {
    this.time += seconds;
    this.petals.forEach((petal, index) => {
      petal.y -= petal.fall * seconds;
      if (petal.y < 0) petal.y += AIR.height;
      petal.spin.x += SPIN_PER_SECOND * seconds;
      petal.spin.z += SPIN_PER_SECOND * 0.6 * seconds;
      const sway = Math.sin(this.time * SWAY.perSecond + petal.phase) * SWAY.reach;
      this.at.set(wrapped(petal.x + sway, focus.x, AIR.width), petal.y, wrapped(petal.z + sway * 0.5, focus.z, AIR.depth));
      this.mesh.setMatrixAt(index, this.place.compose(this.at, this.turn.setFromEuler(petal.spin), this.scale));
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
