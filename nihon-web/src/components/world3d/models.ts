// Loading an island's glTF models and standing them on their ground, and its people: animated models that idle, walk
// and run (clips shared by every KayKit person's skeleton) and turn to face where they're going.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { ANIMATIONS_URL, PERSON_TILES_PER_UNIT, modelUrl } from "../../data/world/islandModelArt";
import { centreOf, facingAngle, turnTowards } from "../../lib/world/islandModels";
import type { ModelPlacement } from "../../lib/world/islandModels";
import type { Direction, Vector } from "../../lib/errands/movement";

export type Motion = "idle" | "walk" | "run";
const MOTIONS: readonly Motion[] = ["idle", "walk", "run"];
/** How long one motion blends into the next, in seconds, and how much of the way a person turns each second. */
const BLEND_SECONDS = 0.2;
const TURN_PER_SECOND = 10;

export class ModelLoadError extends Error {
  constructor(url: string, cause: unknown) { super(`Could not load the model at ${url}.`, { cause }); this.name = "ModelLoadError"; }
}

/** Loads each model file once, however many times it stands on the island. */
export class ModelLibrary {
  private readonly loader = new GLTFLoader();
  private readonly loaded = new Map<string, Promise<GLTF>>();

  load(url: string): Promise<GLTF> {
    const known = this.loaded.get(url);
    if (known) return known;
    const loading = this.loader.loadAsync(url).catch((error: unknown) => { throw new ModelLoadError(url, error); });
    this.loaded.set(url, loading);
    return loading;
  }
}

function castsShadows(object: THREE.Object3D): void {
  object.traverse(part => {
    if (part instanceof THREE.Mesh) { part.castShadow = true; part.receiveShadow = true; }
  });
}

/** A copy of a model standing centred on its ground, at its scale (mirrored if asked). */
export async function standModel(library: ModelLibrary, placement: ModelPlacement): Promise<THREE.Object3D> {
  const model = (await library.load(modelUrl(placement.model))).scene.clone();
  model.scale.set(placement.isMirrored ? -placement.scale : placement.scale, placement.scale, placement.scale);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const centre = centreOf(placement);
  model.position.set(centre.x - (box.min.x + box.max.x) / 2, -box.min.y, centre.y - (box.min.z + box.max.z) / 2);
  castsShadows(model);
  return model;
}

/** The idle, walk and run clips every person's skeleton shares. */
export async function loadMotions(library: ModelLibrary): Promise<ReadonlyMap<Motion, THREE.AnimationClip>> {
  const { animations } = await library.load(ANIMATIONS_URL);
  return new Map(MOTIONS.flatMap(motion => {
    const clip = animations.find(candidate => candidate.name === motion);
    return clip ? [[motion, clip] as const] : [];
  }));
}

/** A person on the island: their model, playing one motion at a time and turning smoothly to face a way. */
export class Person {
  readonly root: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<Motion, THREE.AnimationAction>();
  private motion: Motion | null = null;
  private facing = 0;
  private wantedFacing = 0;

  constructor(gltf: GLTF, motions: ReadonlyMap<Motion, THREE.AnimationClip>) {
    // A skinned model has to be cloned with its skeleton, so each copy moves on its own.
    this.root = cloneSkinned(gltf.scene);
    this.root.scale.setScalar(PERSON_TILES_PER_UNIT);
    castsShadows(this.root);
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const [motion, clip] of motions) this.actions.set(motion, this.mixer.clipAction(clip));
    this.play("idle");
  }

  play(motion: Motion): void {
    if (motion === this.motion) return;
    const next = this.actions.get(motion);
    if (!next) return;
    const previous = this.motion ? this.actions.get(this.motion) : undefined;
    next.reset().play();
    if (previous) next.crossFadeFrom(previous, BLEND_SECONDS, false);
    this.motion = motion;
  }

  standAt(position: Vector, facing: Direction): void {
    this.root.position.set(position.x, 0, position.y);
    this.wantedFacing = facingAngle(facing);
  }

  /** Faces the way at once (a villager placed facing it, not turning to it). */
  faceAtOnce(facing: Direction): void {
    this.wantedFacing = facingAngle(facing);
    this.facing = this.wantedFacing;
    this.root.rotation.y = this.facing;
  }

  update(seconds: number): void {
    this.facing = turnTowards(this.facing, this.wantedFacing, Math.min(1, seconds * TURN_PER_SECOND));
    this.root.rotation.y = this.facing;
    this.mixer.update(seconds);
  }
}
