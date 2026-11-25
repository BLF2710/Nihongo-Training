// Makes the Japanese islands' models and people from the builders in this folder: buildings by their look, trees by
// their kind, the cast by who they are, and the traveller as the learner dressed them.
import type * as THREE from "three";
import type { CharacterId } from "../../../lib/cast.ts";
import type { TravellerLook } from "../../../lib/travellerLook.ts";
import type { ModelPlacement } from "../../../lib/world/islandModels.ts";
import { TRAVELLER_MODEL, buildingModel, castModel, treeModel } from "../../../lib/world/japaneseIsland3D.ts";
import { standOnGround, castsShadows } from "../models.ts";
import type { ModelMaker } from "../models.ts";
import type { IslandWalker } from "../walkers.ts";
import { BUILDING_BUILDERS } from "./buildings.ts";
import { BuiltPerson, chunRig, travellerRig } from "./people.ts";
import type { Rig } from "./people.ts";
import { Palette } from "./shapes.ts";
import { TREE_BUILDERS } from "./trees.ts";

type CastRig = (palette: Palette) => Rig;
const CAST_RIGS: ReadonlyMap<CharacterId, CastRig> = new Map<CharacterId, CastRig>([["chun", chunRig]]);
/** A building without a roof colour of its own gets the plain wooden one. */
const DEFAULT_ROOF = "wood";

export class UnbuiltModelError extends Error {
  constructor(model: string) { super(`No Japanese model is built for "${model}" yet.`); this.name = "UnbuiltModelError"; }
}

type StandBuilder = (palette: Palette, placement: ModelPlacement) => THREE.Object3D;

const STAND_BUILDERS: ReadonlyMap<string, StandBuilder> = new Map<string, StandBuilder>([
  ...[...BUILDING_BUILDERS].map(([look, build]): [string, StandBuilder] => [buildingModel(look),
    (palette, { at, roof = DEFAULT_ROOF, sign }) => build(palette, { width: at.width, depth: at.height, roof, sign })]),
  ...[...TREE_BUILDERS].map(([terrain, build]): [string, StandBuilder] => [treeModel(terrain), (palette, { at }) => build(palette, at)]),
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
    return Promise.resolve(standOnGround(build(this.palette, placement), placement));
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
