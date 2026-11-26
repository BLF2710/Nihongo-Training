// Makes the Japanese islands' models and people from the builders in this folder: buildings by their look, trees by
// their kind, rocks and the summit, pieces (shrine, festival, garden) by theirs, the cast by who they are, and the
// traveller as the learner dressed them.
import type * as THREE from "three";
import type { CharacterId } from "../../../lib/cast.ts";
import type { TravellerLook } from "../../../lib/travellerLook.ts";
import type { ModelPlacement } from "../../../lib/world/islandModels.ts";
import { propModel } from "../../../lib/world/islandProps.ts";
import { MOUNTAIN_MODEL, ROCK_MODEL, TRAVELLER_MODEL, buildingModel, castModel, snowy, treeModel } from "../../../lib/world/japaneseIsland3D.ts";
import { mergedByMaterial } from "../mergeStatic.ts";
import { standOnGround, castsShadows } from "../models.ts";
import type { ModelMaker } from "../models.ts";
import type { IslandWalker } from "../walkers.ts";
import { JAPANESE_BUILDING_BUILDERS } from "./buildingBuilders.ts";
import { BuiltPerson, chunRig, tamaRig, travellerRig } from "./people.ts";
import type { Rig } from "./people.ts";
import { Palette } from "./shapes.ts";
import type { PropGround } from "./shapes.ts";
import { SNOWY_TREE_BUILDERS, TREE_BUILDERS } from "./trees.ts";
import { PROP_BUILDERS } from "./props.ts";
import { NATURE_BUILDERS } from "./nature.ts";
import { kuramaRig, ponRig, senseiRig, zenRig } from "./castRigs.ts";
import { hakaseRig, hatoRig, konRig, momoRig, tsuruRig } from "./villageCastRigs.ts";

type CastRig = (palette: Palette) => Rig;
const CAST_RIGS: ReadonlyMap<CharacterId, CastRig> = new Map<CharacterId, CastRig>([
  ["chun", chunRig], ["tama", tamaRig], ["pon", ponRig], ["sensei", senseiRig], ["zen", zenRig], ["kurama", kuramaRig],
  ["kon", konRig], ["hakase", hakaseRig], ["tsuru", tsuruRig], ["hato", hatoRig], ["momo", momoRig],
]);
/** A building without a roof colour of its own gets the plain wooden one. */
const DEFAULT_ROOF = "wood";

export class UnbuiltModelError extends Error {
  constructor(model: string) { super(`No Japanese model is built for "${model}" yet.`); this.name = "UnbuiltModelError"; }
}

type StandBuilder = (palette: Palette, placement: ModelPlacement) => THREE.Object3D;

/** A piece's ground as it faces: turned east or west, what's across its front runs north to south. */
const groundAsFacing = ({ at, facing }: ModelPlacement): PropGround =>
  facing === "left" || facing === "right" ? { width: at.height, depth: at.width } : { width: at.width, depth: at.height };

const STAND_BUILDERS: ReadonlyMap<string, StandBuilder> = new Map<string, StandBuilder>([
  ...[...JAPANESE_BUILDING_BUILDERS].map(([look, build]): [string, StandBuilder] => [buildingModel(look),
    (palette, { at, roof = DEFAULT_ROOF, sign }) => build(palette, { width: at.width, depth: at.height, roof, sign })]),
  ...[...TREE_BUILDERS].map(([terrain, build]): [string, StandBuilder] => [treeModel(terrain), (palette, { at }) => build(palette, at)]),
  ...[...PROP_BUILDERS].map(([kind, build]): [string, StandBuilder] => [propModel(kind), (palette, placement) => build(palette, groundAsFacing(placement))]),
  ...[...SNOWY_TREE_BUILDERS].map(([terrain, build]): [string, StandBuilder] => [snowy(treeModel(terrain)), (palette, { at }) => build(palette, at)]),
  [ROCK_MODEL, (palette, { at }) => NATURE_BUILDERS.rock(palette, at)],
  [snowy(ROCK_MODEL), (palette, { at }) => NATURE_BUILDERS.snowyRock(palette, at)],
  [MOUNTAIN_MODEL, (palette, { at }) => NATURE_BUILDERS.mountain(palette, at)],
]);
const PERSON_RIGS: ReadonlyMap<string, CastRig> = new Map([...CAST_RIGS].map(([character, rig]) => [castModel(character), rig]));

/** Whether a model (building, tree or person) can be built for the Japanese islands yet. */
export function canBuild(model: string): boolean {
  return STAND_BUILDERS.has(model) || PERSON_RIGS.has(model) || model === TRAVELLER_MODEL;
}

export class JapaneseModelMaker implements ModelMaker {
  private readonly palette = new Palette();
  private readonly look: TravellerLook;

  /** `look` dresses the traveller. */
  constructor(look: TravellerLook) {
    this.look = look;
  }

  standModel(placement: ModelPlacement): Promise<THREE.Object3D> {
    const build = STAND_BUILDERS.get(placement.model);
    if (!build) return Promise.reject(new UnbuiltModelError(placement.model));
    const built = build(this.palette, placement);
    built.scale.multiplyScalar(placement.scale);
    // Nothing on an island moves once it stands, so each model is drawn as one mesh for each of its materials.
    return Promise.resolve(standOnGround(mergedByMaterial(built), placement));
  }

  makePerson(model: string): Promise<IslandWalker> {
    const rig = this.rigOf(model);
    if (!rig) return Promise.reject(new UnbuiltModelError(model));
    castsShadows(rig.root);
    return Promise.resolve(new BuiltPerson(rig));
  }

  private rigOf(model: string): Rig | null {
    if (model === TRAVELLER_MODEL) return travellerRig(this.palette, this.look);
    return PERSON_RIGS.get(model)?.(this.palette) ?? null;
  }
}
