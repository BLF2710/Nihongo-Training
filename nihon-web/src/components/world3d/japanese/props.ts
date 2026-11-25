// Every piece that can stand about the islands, shrine, festival and garden, by its kind.
import type { ShrinePropKind } from "../../../lib/world/islandProps.ts";
import { FESTIVAL_PROP_BUILDERS } from "./festivalProps.ts";
import { GARDEN_PROP_BUILDERS } from "./gardenProps.ts";
import type { PropBuilder } from "./shapes.ts";
import { SHRINE_PROP_BUILDERS } from "./shrineProps.ts";

export const PROP_BUILDERS: ReadonlyMap<ShrinePropKind, PropBuilder> = new Map([...SHRINE_PROP_BUILDERS, ...FESTIVAL_PROP_BUILDERS, ...GARDEN_PROP_BUILDERS]);
