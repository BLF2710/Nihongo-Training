// What every person on a 3D island can do, however they're made (a glTF model with its skeleton's clips, or a model
// built in code with its limbs swung): stand somewhere, face a way, idle, walk and run.
import type * as THREE from "three";
import type { Direction, Vector } from "../../lib/errands/movement.ts";
import { facingAngle, turnTowards } from "../../lib/world/islandModels.ts";

export type Motion = "idle" | "walk" | "run";

export interface IslandWalker {
  readonly root: THREE.Object3D;
  play(motion: Motion): void;
  standAt(position: Vector, facing: Direction): void;
  /** Faces the way at once (a villager placed facing it, not turning to it). */
  faceAtOnce(facing: Direction): void;
  update(seconds: number): void;
}

/** How much of the way a person turns each second. */
const TURN_PER_SECOND = 10;

/** A person's turning: towards the way they want to face, smoothly and the short way round. */
export class Turning {
  private angle = 0;
  private wanted = 0;
  private readonly root: THREE.Object3D;

  constructor(root: THREE.Object3D) {
    this.root = root;
  }

  want(facing: Direction): void {
    this.wanted = facingAngle(facing);
  }

  faceAtOnce(facing: Direction): void {
    this.want(facing);
    this.angle = this.wanted;
    this.root.rotation.y = this.angle;
  }

  update(seconds: number): void {
    this.angle = turnTowards(this.angle, this.wanted, Math.min(1, seconds * TURN_PER_SECOND));
    this.root.rotation.y = this.angle;
  }
}
