// What the English isle's places walked in 3D share (the island, the castle courtyard, the market square): what a place
// is, where a building's door is, and the townsfolk standing about. Content helpers only.
import type { Direction, Vector } from "../../lib/errands/movement.ts";
import type { VillageLayout } from "../../lib/errands/village.ts";
import type { Door } from "../../lib/village/villageDoors.ts";
import type { Island3D, IslandPerson, ModelPlacement } from "../../lib/world/islandModels.ts";
import { TOWNSFOLK } from "../../lib/englishTown/townsfolk.ts";
import type { TownsfolkId } from "../../lib/englishTown/townsfolk.ts";

/** A townsperson standing on a tile, facing one way, who talks when the traveller walks up to them. */
export type TownsfolkPlace = { id: TownsfolkId; tile: Vector; facing: Direction };

/** A place walked in 3D: `localName` is its name in the learner's own language; `layout` is what walking needs;
 *  `townsfolk` are those of its people who talk (they're among the scene's people too). */
export type ModelIsland = {
  name: string; localName: string; scene: Island3D; layout: VillageLayout; doors: readonly Door[];
  townsfolk: readonly TownsfolkPlace[];
};

/** The tile in front of the middle of a model's front, where its door is. */
export const doorTile = ({ at }: ModelPlacement): Vector => ({ x: at.x + Math.floor(at.width / 2), y: at.y + at.height });

/** A townsperson as the scene draws them: their own character model, facing one way. */
export const townspersonStanding = ({ id, tile, facing }: TownsfolkPlace): IslandPerson => ({ id, model: TOWNSFOLK[id].model, tile, facing });
