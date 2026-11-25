// The islands' Japanese buildings, built in code (our own designs, in the chunky low-poly style of the English island's
// models): halls of white plaster and dark timber on a stone base under a curved tiled roof, and an open market stall
// under a cloth awning. Each fills the ground it stands on, its door in the middle of its front (south) side, and
// hangs its Japanese sign from the front of its roof, where nothing hides it from the camera above.
import * as THREE from "three";
import type { BuildingLook, RoofColour } from "../../../lib/errands/village.ts";
import { Palette, box, curvedRoof, gable, post } from "./shapes.ts";
import type { RoofShape } from "./shapes.ts";
import { signboard } from "./signboard.ts";

/** What a building is built to: its ground (in tiles), roof colour and sign. */
export type BuildingPlan = { width: number; depth: number; roof: RoofColour; sign?: string };
export type BuildingBuilder = (palette: Palette, plan: BuildingPlan) => THREE.Group;

const ROOF_COLOURS: Readonly<Record<RoofColour, string>> = { vermilion: "#c8452f", indigo: "#34557f", moss: "#5f7d3c", wood: "#8a6440" };
/** An awning is cloth, so a "wood" stall gets straw-coloured cloth rather than brown. */
const AWNING_COLOURS: Readonly<Record<RoofColour, string>> = { ...ROOF_COLOURS, wood: "#cfa868" };
const COLOUR = {
  plaster: "#f1ebdd", timber: "#5a3b28", stone: "#a8a49b", step: "#c3beb2", shoji: "#f7f0dc", lattice: "#6b4a33",
  deck: "#9b7350", window: "#3a2a20", lanternStone: "#b9b4a8", lanternLight: "#ffd98a", cord: "#3b2a1e",
} as const;

/** How far a hall's walls stand in from the edges of its ground (its roof reaches out over them). */
const WALL_INSET = 0.5;
const ROOF_OVERHANG_INSET = 0.05;
const PLINTH_HEIGHT = 0.18;
const TIMBER = 0.08;
const DOOR = { width: 0.9, height: 0.95 };
const SIGN_DROP = 0.3;

const roofColour = (roof: RoofColour): string => ROOF_COLOURS[roof];
const ridgeColour = (roof: RoofColour): string => `#${new THREE.Color(ROOF_COLOURS[roof]).multiplyScalar(0.7).getHexString()}`;

/** A sign hanging on cords just under the front edge of a roof whose eaves are at `eaves`, `front` tiles south. */
function hangingSign(palette: Palette, sign: string, eaves: number, front: number): THREE.Group {
  const board = signboard(palette, sign);
  board.position.set(0, eaves - SIGN_DROP, front);
  const group = new THREE.Group().add(board);
  for (const side of [-1, 1]) group.add(box(palette.of(COLOUR.cord), { width: 0.03, height: SIGN_DROP - 0.2, depth: 0.03 }, { x: side * 0.3, y: eaves - SIGN_DROP + 0.2, z: front }));
  return group;
}

/** A roof's ridge beam, with its end tiles standing up. */
function ridge(palette: Palette, roof: RoofColour, { length, rise, base }: RoofShape): THREE.Group {
  const material = palette.of(ridgeColour(roof));
  const top = base + rise - 0.04;
  const group = new THREE.Group().add(box(material, { width: length * 0.9, height: 0.14, depth: 0.18 }, { y: top }));
  for (const side of [-1, 1]) group.add(box(material, { width: 0.16, height: 0.3, depth: 0.22 }, { x: side * length * 0.45, y: top }));
  return group;
}

/** A sliding paper door: pale panels in a timber lattice. */
function shojiDoor(palette: Palette, front: number): THREE.Group {
  const lattice = palette.of(COLOUR.lattice);
  const group = new THREE.Group().add(box(palette.of(COLOUR.shoji), { width: DOOR.width, height: DOOR.height, depth: 0.04 }, { z: front }));
  for (const x of [-DOOR.width / 2, 0, DOOR.width / 2]) group.add(box(lattice, { width: 0.05, height: DOOR.height, depth: 0.06 }, { x, z: front }));
  for (const y of [0.3, 0.6, DOOR.height - 0.03]) group.add(box(lattice, { width: DOOR.width, height: 0.04, depth: 0.06 }, { y, z: front }));
  group.position.y = PLINTH_HEIGHT;
  return group;
}

/** A window of upright timber slats, its middle at `x`. */
function latticeWindow(palette: Palette, x: number, front: number): THREE.Group {
  const group = new THREE.Group().add(box(palette.of(COLOUR.window), { width: 0.62, height: 0.5, depth: 0.03 }, { x, z: front }));
  for (let slat = 0; slat < 6; slat += 1) group.add(box(palette.of(COLOUR.lattice), { width: 0.045, height: 0.5, depth: 0.06 }, { x: x - 0.28 + slat * 0.112, z: front }));
  group.position.y = PLINTH_HEIGHT + 0.45;
  return group;
}

/** A short cloth curtain hung across the top of a doorway, split into panels. */
function noren(palette: Palette, roof: RoofColour, front: number): THREE.Group {
  const group = new THREE.Group();
  for (const x of [-0.3, 0, 0.3]) group.add(box(palette.of(roofColour(roof)), { width: 0.28, height: 0.42, depth: 0.03 }, { x, y: PLINTH_HEIGHT + DOOR.height - 0.42, z: front + 0.04 }));
  return group;
}

/** A stone lantern: a post holding a lit firebox under a little roof. */
function stoneLantern(palette: Palette, x: number, z: number): THREE.Group {
  const stone = palette.of(COLOUR.lanternStone);
  const light = new THREE.MeshStandardMaterial({ color: COLOUR.lanternLight, emissive: COLOUR.lanternLight, emissiveIntensity: 0.6, flatShading: true });
  return new THREE.Group().add(
    box(stone, { width: 0.26, height: 0.06, depth: 0.26 }, { x, z }),
    post(stone, 0.06, 0.4, { x, z, y: 0.06 }),
    box(light, { width: 0.2, height: 0.18, depth: 0.2 }, { x, y: 0.46, z }),
    new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.14, 4).rotateY(Math.PI / 4), stone).translateX(x).translateY(0.71).translateZ(z),
  );
}

type HallFront = (palette: Palette, plan: BuildingPlan, front: number, bodyWidth: number) => THREE.Object3D[];

/** A hall: stone base, white walls framed in timber, a curved roof with gabled ends, and its front as `front` makes it. */
function hall(palette: Palette, plan: BuildingPlan, wallHeight: number, rise: number, front: HallFront): THREE.Group {
  const bodyWidth = plan.width - 2 * WALL_INSET, bodyDepth = plan.depth - 2 * WALL_INSET;
  const eaves = PLINTH_HEIGHT + wallHeight;
  const roofShape: RoofShape = { span: plan.depth - 2 * ROOF_OVERHANG_INSET, length: plan.width - 2 * ROOF_OVERHANG_INSET, rise, base: eaves, thickness: 0.14 };
  const timber = palette.of(COLOUR.timber), plaster = palette.of(COLOUR.plaster);
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stone), { width: bodyWidth + 0.3, height: PLINTH_HEIGHT, depth: bodyDepth + 0.3 }),
    box(plaster, { width: bodyWidth, height: wallHeight, depth: bodyDepth }, { y: PLINTH_HEIGHT }),
    box(timber, { width: bodyWidth + 0.04, height: 0.12, depth: bodyDepth + 0.04 }, { y: eaves - 0.12 }),
    box(timber, { width: bodyWidth + 0.04, height: 0.1, depth: bodyDepth + 0.04 }, { y: PLINTH_HEIGHT }),
    curvedRoof(palette.of(roofColour(plan.roof)), roofShape),
    ridge(palette, plan.roof, roofShape),
    ...[-1, 1].map(side => gable(plaster, roofShape, side * (bodyWidth / 2 - 0.02), 0.04)),
    ...front(palette, plan, bodyDepth / 2, bodyWidth),
  );
  for (const x of [-bodyWidth / 2, -bodyWidth / 6, bodyWidth / 6, bodyWidth / 2]) {
    for (const z of [-bodyDepth / 2, bodyDepth / 2]) group.add(post(timber, TIMBER, wallHeight, { x, z, y: PLINTH_HEIGHT }));
  }
  if (plan.sign) group.add(hangingSign(palette, plan.sign, eaves, plan.depth / 2 - ROOF_OVERHANG_INSET - 0.05));
  return group;
}

/** The kana school: a tall hall with a paper door, slatted windows, a veranda along its front and stone lanterns. */
const kanaSchool: BuildingBuilder = (palette, plan) => hall(palette, plan, 1.5, 1.05, (palette, { width }, front, bodyWidth) => [
  shojiDoor(palette, front + 0.01),
  latticeWindow(palette, -bodyWidth / 2 + 0.55, front + 0.01),
  latticeWindow(palette, bodyWidth / 2 - 0.55, front + 0.01),
  box(palette.of(COLOUR.deck), { width: bodyWidth + 0.3, height: 0.06, depth: 0.26 }, { y: PLINTH_HEIGHT - 0.06, z: front + 0.15 }),
  box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.2 }, { z: front + 0.38 }),
  stoneLantern(palette, -width / 2 + 0.2, front + 0.33),
  stoneLantern(palette, width / 2 - 0.2, front + 0.33),
]);

/** The calligraphy house: a low townhouse with a curtain over its door and a wide slatted window. */
const calligraphyHouse: BuildingBuilder = (palette, plan) => hall(palette, plan, 1.3, 0.85, (palette, { roof }, front, bodyWidth) => [
  shojiDoor(palette, front + 0.01),
  noren(palette, roof, front),
  latticeWindow(palette, -bodyWidth / 2 + 0.5, front + 0.01),
  latticeWindow(palette, bodyWidth / 2 - 0.5, front + 0.01),
  box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.3 }, { z: front + 0.3 }),
]);

/** A market stall: a counter of goods under a cloth awning on four posts, and a banner on a pole. */
const stall: BuildingBuilder = (palette, plan) => {
  const timber = palette.of(COLOUR.timber), deck = palette.of(COLOUR.deck);
  const cloth = palette.of(AWNING_COLOURS[plan.roof]);
  const width = plan.width - 2 * WALL_INSET, depth = plan.depth - 2 * WALL_INSET - 0.2;
  const awning = 1.55;
  const awningShape: RoofShape = { span: depth + 0.6, length: width + 0.4, rise: 0.35, base: awning, thickness: 0.06 };
  const goods = ["#d9534f", "#f0ad4e", "#5cb85c", "#5bc0de", "#f7f0dc", "#9b59b6"];
  const group = new THREE.Group().add(
    box(deck, { width: width - 0.2, height: 0.72, depth: 0.5 }, { z: depth / 2 - 0.25 }),
    box(palette.of(COLOUR.shoji), { width: width - 0.1, height: 0.04, depth: 0.56 }, { y: 0.72, z: depth / 2 - 0.25 }),
    box(deck, { width: width - 0.2, height: 1.2, depth: 0.3 }, { z: -depth / 2 + 0.15 }),
    curvedRoof(cloth, awningShape),
    post(timber, 0.04, 2.3, { x: width / 2 + 0.25, z: depth / 2 + 0.1 }),
    box(cloth, { width: 0.03, height: 1.1, depth: 0.32 }, { x: width / 2 + 0.25, y: 1.05, z: depth / 2 - 0.08 }),
  );
  goods.forEach((colour, index) => group.add(box(palette.of(colour), { width: 0.26, height: 0.12 + (index % 3) * 0.04, depth: 0.2 }, { x: -width / 2 + 0.35 + index * ((width - 0.7) / (goods.length - 1)), y: 0.76, z: depth / 2 - 0.25 })));
  for (const x of [-width / 2, width / 2]) {
    for (const z of [-depth / 2, depth / 2]) group.add(post(timber, 0.06, awning + 0.12, { x, z }));
  }
  if (plan.sign) group.add(hangingSign(palette, plan.sign, awning + 0.05, depth / 2 + 0.3));
  return group;
};

/** A pagoda's storeys: how wide the first is (as a share of its ground), how much narrower each one up, how tall. */
const PAGODA = { storeys: 3, baseShare: 0.5, narrowing: 0.13, storeyHeight: 0.62, eaves: 0.38, roofHeight: 0.32, spire: 1.1 } as const;
const PAGODA_ROOF = "#474c55";
const PAGODA_GOLD = "#d4a64a";

/** A pagoda: storeys of its roof colour, each under a wide dark roof, narrowing to a gold spire. */
const pagoda: BuildingBuilder = (palette, plan) => {
  const ground = Math.min(plan.width, plan.depth);
  const walls = palette.of(roofColour(plan.roof)), roofs = palette.of(PAGODA_ROOF);
  const group = new THREE.Group().add(box(palette.of(COLOUR.stone), { width: ground * 0.62, height: PLINTH_HEIGHT, depth: ground * 0.62 }));
  let floor = PLINTH_HEIGHT;
  for (let storey = 0; storey < PAGODA.storeys; storey += 1) {
    const width = ground * (PAGODA.baseShare - storey * PAGODA.narrowing);
    group.add(box(walls, { width, height: PAGODA.storeyHeight, depth: width }, { y: floor }));
    // A roof is a four-sided cone cut short, turned so its sides face the four ways.
    const eaves = (width / 2 + PAGODA.eaves) * Math.SQRT2;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(eaves * 0.35, eaves, PAGODA.roofHeight, 4).rotateY(Math.PI / 4), roofs);
    roof.position.y = floor + PAGODA.storeyHeight + PAGODA.roofHeight / 2;
    group.add(roof);
    floor += PAGODA.storeyHeight + PAGODA.roofHeight;
  }
  const gold = palette.of(PAGODA_GOLD);
  group.add(post(gold, 0.04, PAGODA.spire, { x: 0, z: 0, y: floor }));
  for (let ring = 1; ring <= 4; ring += 1) group.add(post(gold, 0.09, 0.04, { x: 0, z: 0, y: floor + ring * 0.18 }));
  return group;
};

export const BUILDING_BUILDERS: ReadonlyMap<BuildingLook, BuildingBuilder> = new Map<BuildingLook, BuildingBuilder>([
  ["kana-school", kanaSchool], ["calligraphy", calligraphyHouse], ["stall", stall], ["pagoda", pagoda],
]);
