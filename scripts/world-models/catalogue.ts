// The models the English island is built from (docs/ENGLISH.md, phase 4), all by Kay Lousberg (CC0, kaylousberg.com):
// the Medieval Hexagon Pack and the Forest Nature Pack for the island, the Adventurers for its people, and Character
// Animations for how they move. `source` is the path under .asset-sources; `id` is the model's name on the site.

export type ModelSource = { id: string; source: string };

const MEDIEVAL = "kaykit-medieval-hexagon/extracted/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Assets/gltf";
const FOREST = "kaykit-forest/extracted/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf";
const CHARACTERS = "kaykit-adventurers/extracted/KayKit_Adventurers_2.0_FREE/Characters/gltf";
const ANIMATIONS = "kaykit-character-animations/extracted/KayKit_Character_Animations_1.1/Animations/gltf/Rig_Medium";

const building = (name: string): ModelSource => ({ id: name, source: `${MEDIEVAL}/buildings/blue/building_${name}_blue.gltf` });
/** A building in another colour of the pack, for a second building of the same kind or one the blue set lacks. */
const coloured = (id: string, name: string, colour: string): ModelSource => ({ id, source: `${MEDIEVAL}/buildings/${colour}/building_${name}_${colour}.gltf` });
const neutral = (id: string, name = id): ModelSource => ({ id, source: `${MEDIEVAL}/buildings/neutral/${name}.gltf` });
const nature = (id: string): ModelSource => ({ id, source: `${MEDIEVAL}/decoration/nature/${id}.gltf` });
const prop = (id: string): ModelSource => ({ id, source: `${MEDIEVAL}/decoration/props/${id}.gltf` });
/** Forest models come in colour variants; the first is the summer green the island uses. */
const forest = (name: string): ModelSource => ({ id: `forest_${name.toLowerCase()}`, source: `${FOREST}/${name}_Color1.gltf` });
const character = (id: string, name: string): ModelSource => ({ id, source: `${CHARACTERS}/${name}.glb` });

export const MODELS: readonly ModelSource[] = [
  ...["castle", "church", "tavern", "market", "home_A", "home_B", "blacksmith", "windmill", "well", "tower_A", "archeryrange", "tower_B", "barracks", "tower_catapult"].map(building),
  coloured("abbey", "church", "green"),
  neutral("fence_stone", "fence_stone_straight"), neutral("grain", "building_grain"),
  // The castle courtyard's curtain wall, and the market square's stage.
  neutral("wall_straight"), neutral("wall_straight_gate"), neutral("wall_corner_A_outside"), neutral("stage", "building_stage_A"),
  ...["tree_single_A", "tree_single_B", "trees_A_small", "trees_A_medium", "trees_B_medium", "rock_single_C", "mountain_A_grass_trees", "mountain_B_grass_trees", "mountain_C_grass", "hills_A_trees", "hills_B_trees", "cloud_big", "cloud_small"].map(nature),
  ...["barrel", "crate_open", "sack", "wheelbarrow", "flag_blue", "resource_lumber",
    "flag_yellow", "flag_red", "tent", "target", "weaponrack", "crate_A_big", "bucket_water", "resource_stone"].map(prop),
  ...["Tree_1_A", "Tree_2_A", "Tree_3_A", "Bush_3_A", "Grass_1_A"].map(forest),
  character("rogue", "Rogue"), character("knight", "Knight"), character("barbarian", "Barbarian"), character("mage", "Mage"),
  character("ranger", "Ranger"), character("rogue_hooded", "Rogue_Hooded"),
];

/** The people's animations, each a clip from the Character Animations pack, gathered into one file. */
export const CLIPS = {
  idle: { source: `${ANIMATIONS}/Rig_Medium_General.glb`, clip: "Idle_A" },
  walk: { source: `${ANIMATIONS}/Rig_Medium_MovementBasic.glb`, clip: "Walking_A" },
  run: { source: `${ANIMATIONS}/Rig_Medium_MovementBasic.glb`, clip: "Running_A" },
} as const;
