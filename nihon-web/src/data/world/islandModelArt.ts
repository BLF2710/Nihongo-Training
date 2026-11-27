// The English island's models (scripts/world-models copies them into public/world/models and measures them into the
// manifest), looked up by name and placed at one scale, so a house is as big beside the castle as the models make it.
import modelSizes from "./modelSizes.json" with { type: "json" };
import type { Direction, Vector } from "../../lib/errands/movement.ts";
import type { ModelPlacement } from "../../lib/world/islandModels.ts";

type ModelSize = { file: string; width: number; depth: number; height: number };

const MODELS: Readonly<Record<string, ModelSize>> = modelSizes.models;
const MODEL_FOLDER = "/world/models";
/** A model unit is about a cottage's width: three tiles makes a cottage half again as wide as the traveller is tall. */
const TILES_PER_MODEL_UNIT = 3;
/** KayKit people are chibi, two units tall: this makes them a little taller than a tile and a half. */
export const PERSON_TILES_PER_UNIT = 0.75;

export class UnknownModelError extends Error {
  constructor(model: string) { super(`No model is called "${model}"; add it with scripts/world-models first.`); this.name = "UnknownModelError"; }
}

export const hasModel = (model: string): boolean => Object.hasOwn(MODELS, model);

function modelSize(model: string): ModelSize {
  if (!hasModel(model)) throw new UnknownModelError(model);
  return MODELS[model];
}

export const modelUrl = (model: string): string => `${MODEL_FOLDER}/${modelSize(model).file}`;
/** The people's animations (idle, walk, run), for every person's skeleton. */
export const ANIMATIONS_URL = `${MODEL_FOLDER}/${modelSizes.animations}`;

/** `scale` shrinks or grows one model from the common scale (the castle, so it fits on screen); `facing` turns it
 *  (it faces south unless said). */
type Standing = { scale?: number; isWalkable?: boolean; isMirrored?: boolean; facing?: Direction };

const isTurnedSideways = (facing: Direction | undefined) => facing === "left" || facing === "right";

/** A model standing with the north-west corner of its ground at `corner`, its ground the model's own footprint
 *  (turned with it when it faces east or west). */
export function place(model: string, corner: Vector, { scale = 1, ...looks }: Standing = {}): ModelPlacement {
  const size = modelSize(model);
  const tilesPerUnit = TILES_PER_MODEL_UNIT * scale;
  const tilesOf = (units: number) => Math.max(1, Math.round(units * tilesPerUnit));
  const [across, deep] = isTurnedSideways(looks.facing) ? [size.depth, size.width] : [size.width, size.depth];
  return { model, at: { ...corner, width: tilesOf(across), height: tilesOf(deep) }, scale: tilesPerUnit, ...looks };
}
