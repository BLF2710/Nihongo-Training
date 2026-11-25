// Making what stands on a 3D island: the renderer asks a `ModelMaker` for each model and person, and doesn't know how
// they're made. `GltfModelMaker` makes them from the prepared glTF models (the English island's KayKit packs): models
// stood centred on their ground, and people playing clips shared by every KayKit person's skeleton.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { ANIMATIONS_URL, PERSON_TILES_PER_UNIT, modelUrl } from "../../data/world/islandModelArt.ts";
import { centreOf, facingAngle } from "../../lib/world/islandModels.ts";
import type { ModelPlacement } from "../../lib/world/islandModels.ts";
import type { Direction, Vector } from "../../lib/errands/movement.ts";
import { Turning } from "./walkers.ts";
import type { IslandWalker, Motion } from "./walkers.ts";

export interface ModelMaker {
  standModel(placement: ModelPlacement): Promise<THREE.Object3D>;
  makePerson(model: string): Promise<IslandWalker>;
}

const MOTIONS: readonly Motion[] = ["idle", "walk", "run"];
/** How long one motion blends into the next, in seconds. */
const BLEND_SECONDS = 0.2;

export class ModelLoadError extends Error {
  constructor(url: string, cause: unknown) { super(`Could not load the model at ${url}.`, { cause }); this.name = "ModelLoadError"; }
}

/** Every mesh of a model casts a shadow and has shadows cast on it. */
export function castsShadows(object: THREE.Object3D): void {
  object.traverse(part => {
    if (part instanceof THREE.Mesh) { part.castShadow = true; part.receiveShadow = true; }
  });
}

/** Stands a model (drawn facing south, at the scale it should stand) centred on its ground, its base on the land,
 *  turned the way its placement faces. */
export function standOnGround(model: THREE.Object3D, placement: ModelPlacement): THREE.Object3D {
  model.rotation.y = facingAngle(placement.facing ?? "down");
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const centre = centreOf(placement);
  model.position.set(centre.x - (box.min.x + box.max.x) / 2, -box.min.y, centre.y - (box.min.z + box.max.z) / 2);
  castsShadows(model);
  return model;
}

/** Makes models and people from the prepared glTF files, loading each file once however often it stands. */
export class GltfModelMaker implements ModelMaker {
  private readonly loader = new GLTFLoader();
  private readonly loaded = new Map<string, Promise<GLTF>>();
  private motions: Promise<ReadonlyMap<Motion, THREE.AnimationClip>> | null = null;

  async standModel(placement: ModelPlacement): Promise<THREE.Object3D> {
    const model = (await this.load(modelUrl(placement.model))).scene.clone();
    model.scale.set(placement.isMirrored ? -placement.scale : placement.scale, placement.scale, placement.scale);
    return standOnGround(model, placement);
  }

  async makePerson(model: string): Promise<IslandWalker> {
    const [gltf, motions] = await Promise.all([this.load(modelUrl(model)), this.loadMotions()]);
    return new GltfPerson(gltf, motions);
  }

  private load(url: string): Promise<GLTF> {
    const known = this.loaded.get(url);
    if (known) return known;
    const loading = this.loader.loadAsync(url).catch((error: unknown) => { throw new ModelLoadError(url, error); });
    this.loaded.set(url, loading);
    return loading;
  }

  /** The idle, walk and run clips every person's skeleton shares. */
  private loadMotions(): Promise<ReadonlyMap<Motion, THREE.AnimationClip>> {
    this.motions ??= this.load(ANIMATIONS_URL).then(({ animations }) => new Map(MOTIONS.flatMap(motion => {
      const clip = animations.find(candidate => candidate.name === motion);
      return clip ? [[motion, clip] as const] : [];
    })));
    return this.motions;
  }
}

/** A glTF person, playing one of the shared clips at a time on their own skeleton. */
class GltfPerson implements IslandWalker {
  readonly root: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<Motion, THREE.AnimationAction>();
  private readonly turning: Turning;
  private motion: Motion | null = null;

  constructor(gltf: GLTF, motions: ReadonlyMap<Motion, THREE.AnimationClip>) {
    // A skinned model has to be cloned with its skeleton, so each copy moves on its own.
    this.root = cloneSkinned(gltf.scene);
    this.root.scale.setScalar(PERSON_TILES_PER_UNIT);
    castsShadows(this.root);
    this.turning = new Turning(this.root);
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
    this.turning.want(facing);
  }

  faceAtOnce(facing: Direction): void {
    this.turning.faceAtOnce(facing);
  }

  update(seconds: number): void {
    this.turning.update(seconds);
    this.mixer.update(seconds);
  }
}
