// Every building that can stand on the Japanese islands and in the village, halls and townhouses, by its look.
import type { BuildingLook } from "../../../lib/errands/village.ts";
import { BUILDING_BUILDERS } from "./buildings.ts";
import type { BuildingBuilder } from "./buildings.ts";
import { TOWNHOUSE_BUILDERS } from "./townhouses.ts";

export const JAPANESE_BUILDING_BUILDERS: ReadonlyMap<BuildingLook, BuildingBuilder> = new Map([...BUILDING_BUILDERS, ...TOWNHOUSE_BUILDERS]);
