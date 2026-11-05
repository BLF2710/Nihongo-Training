// The shape of each kind of building in the 2.5D village: how tall its walls and roof are (in tiles) and what they're
// made of. What sits on the front wall and in front of the building is in BuildingDetails.
import type { BuildingLook } from "../../lib/errands/village";

export type LookShape = {
  wallHeight: number; ridgeHeight: number;
  /** Classes in errands.css for the walls and the roof. */
  wallClass: string; roofClass: string;
  /** A roof colour of its own (a thatched roof is straw whatever the building's roof colour). */
  roofFill?: string;
};

const PLASTER = "village-wall-plaster", PLANKS = "village-wall-planks", TILES = "village-roof-tiles";

export const LOOK_SHAPES: Readonly<Record<BuildingLook, LookShape>> = {
  house: { wallHeight: 1.6, ridgeHeight: 0.9, wallClass: PLASTER, roofClass: TILES },
  home: { wallHeight: 1.5, ridgeHeight: 1.1, wallClass: "village-wall-warm", roofClass: TILES },
  bakery: { wallHeight: 1.6, ridgeHeight: 0.8, wallClass: "village-wall-warm", roofClass: TILES },
  // Two storeys: the tallest building in the village.
  school: { wallHeight: 2.4, ridgeHeight: 0.9, wallClass: PLASTER, roofClass: TILES },
  "kana-school": { wallHeight: 1.7, ridgeHeight: 0.9, wallClass: PLASTER, roofClass: TILES },
  shrine: { wallHeight: 1.5, ridgeHeight: 1.4, wallClass: "village-wall-shrine", roofClass: TILES },
  dojo: { wallHeight: 1.7, ridgeHeight: 1.1, wallClass: PLANKS, roofClass: TILES },
  calligraphy: { wallHeight: 1.7, ridgeHeight: 0.9, wallClass: PLASTER, roofClass: TILES },
  "post-office": { wallHeight: 1.7, ridgeHeight: 0.7, wallClass: PLASTER, roofClass: TILES },
  // A festival stall is low, open at the front, with a striped awning for a roof.
  stall: { wallHeight: 1.3, ridgeHeight: 0.5, wallClass: "village-wall-stall", roofClass: "village-roof-awning" },
  teahouse: { wallHeight: 1.4, ridgeHeight: 1.2, wallClass: PLASTER, roofClass: "village-roof-thatch", roofFill: "var(--village-thatch)" },
  "practice-hall": { wallHeight: 1.6, ridgeHeight: 1.0, wallClass: PLANKS, roofClass: TILES },
  onsen: { wallHeight: 1.5, ridgeHeight: 1.0, wallClass: PLANKS, roofClass: TILES },
};
