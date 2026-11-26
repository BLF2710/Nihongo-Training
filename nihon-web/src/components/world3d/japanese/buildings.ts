// The islands' Japanese buildings, built in code (our own designs, in the chunky low-poly style of the English island's
// models): halls on a stone base under a curved roof laid with rows of tiles (white plaster and dark timber, a
// townhouse's dark slatted ground floor under a narrow roof, dark planks for a dojo, vermilion framing for a shrine),
// a pagoda, and an open market stall under a cloth awning. Paper lanterns hang under their eaves, and benches, barrels
// and potted bushes stand out front. Each fills the ground it stands on, its door in the middle of its front (south)
// side, and hangs its Japanese sign from the front of its roof, where nothing hides it from the camera above.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { BuildingLook, RoofColour } from "../../../lib/errands/village.ts";
import { Palette, box, curvedRoof, gable, paperLantern, placed, post } from "./shapes.ts";
import type { RoofShape } from "./shapes.ts";
import { signboard } from "./signboard.ts";

/** What a building is built to: its ground (in tiles), roof colour and sign. */
export type BuildingPlan = { width: number; depth: number; roof: RoofColour; sign?: string };
export type BuildingBuilder = (palette: Palette, plan: BuildingPlan) => THREE.Group;

const ROOF_COLOURS: Readonly<Record<RoofColour, string>> = { vermilion: "#c8452f", indigo: "#34557f", moss: "#5f7d3c", wood: "#8a6440" };
/** An awning is cloth, so a "wood" stall gets straw-coloured cloth rather than brown. */
const AWNING_COLOURS: Readonly<Record<RoofColour, string>> = { ...ROOF_COLOURS, wood: "#cfa868" };
export const COLOUR = {
  plaster: "#f1ebdd", timber: "#5a3b28", stone: "#a8a49b", step: "#c3beb2", shoji: "#f7f0dc", lattice: "#6b4a33",
  deck: "#9b7350", window: "#3a2a20", lanternStone: "#b9b4a8", lanternLight: "#ffd98a", cord: "#3b2a1e",
  planks: "#7a5236", vermilion: "#c8452f", gold: "#d4a64a", straw: "#d9c48c", paper: "#fbf8f0",
  lanternRed: "#d8402c", lanternWhite: "#f7efe0", barrel: "#b98a52", bench: "#b53a2c", pot: "#6d5a4a", bush: "#5f9447",
} as const;

/** How far a hall's walls stand in from the edges of its ground (its roof reaches out over them). */
export const WALL_INSET = 0.5;
const ROOF_OVERHANG_INSET = 0.05;
export const PLINTH_HEIGHT = 0.18;
export const TIMBER = 0.08;
export const DOOR = { width: 0.9, height: 0.95 };
const SIGN_DROP = 0.3;

export const roofColour = (roof: RoofColour): string => ROOF_COLOURS[roof];
/** A roof's ridge and tile rows, a darker shade of the roof. */
const ridgeColour = (roof: string): string => `#${new THREE.Color(roof).multiplyScalar(0.7).getHexString()}`;

/** A sign hanging on cords just under the front edge of a roof whose eaves are at `eaves`, `front` tiles south. */
export function hangingSign(palette: Palette, sign: string, eaves: number, front: number): THREE.Group {
  const board = signboard(palette, sign);
  board.position.set(0, eaves - SIGN_DROP, front);
  const group = new THREE.Group().add(board);
  for (const side of [-1, 1]) group.add(box(palette.of(COLOUR.cord), { width: 0.03, height: SIGN_DROP - 0.2, depth: 0.03 }, { x: side * 0.3, y: eaves - SIGN_DROP + 0.2, z: front }));
  return group;
}

/** How far apart the rows of round tiles down a roof are, and how wide and thick each row is. */
const TILE_ROWS = { spacing: 0.2, width: 0.06, height: 0.05 } as const;

/** Rows of round tiles running down a roof's slopes, in a darker shade of it, so it reads as tiled. One mesh. */
function roofTiles(palette: Palette, roof: string, shape: RoofShape): THREE.Mesh {
  const material = palette.of(ridgeColour(roof));
  const row = curvedRoof(material, { ...shape, length: TILE_ROWS.width, base: 0, thickness: TILE_ROWS.height }).geometry;
  const count = Math.floor((shape.length - 0.2) / TILE_ROWS.spacing) + 1;
  const rows = Array.from({ length: count }, (_, index) => row.clone().translate((index - (count - 1) / 2) * TILE_ROWS.spacing, 0, 0));
  const tiles = new THREE.Mesh(mergeGeometries(rows), material);
  for (const geometry of [row, ...rows]) geometry.dispose();
  // Each row sits a little proud of the roof, sunk into it at its foot.
  tiles.position.y = shape.base + TILE_ROWS.height * 0.6;
  return tiles;
}

/** A roof's ridge beam, with its end tiles standing up. */
function ridge(palette: Palette, roof: string, { length, rise, base }: RoofShape): THREE.Group {
  const material = palette.of(ridgeColour(roof));
  const top = base + rise - 0.04;
  const group = new THREE.Group().add(box(material, { width: length * 0.9, height: 0.14, depth: 0.18 }, { y: top }));
  for (const side of [-1, 1]) group.add(box(material, { width: 0.16, height: 0.3, depth: 0.22 }, { x: side * length * 0.45, y: top }));
  return group;
}

/** A sliding paper door: pale panels in a timber lattice. */
export function shojiDoor(palette: Palette, front: number): THREE.Group {
  const lattice = palette.of(COLOUR.lattice);
  const group = new THREE.Group().add(box(palette.of(COLOUR.shoji), { width: DOOR.width, height: DOOR.height, depth: 0.04 }, { z: front }));
  for (const x of [-DOOR.width / 2, 0, DOOR.width / 2]) group.add(box(lattice, { width: 0.05, height: DOOR.height, depth: 0.06 }, { x, z: front }));
  for (const y of [0.3, 0.6, DOOR.height - 0.03]) group.add(box(lattice, { width: DOOR.width, height: 0.04, depth: 0.06 }, { y, z: front }));
  group.position.y = PLINTH_HEIGHT;
  return group;
}

/** A window of upright timber slats, its middle at `x`. */
export function latticeWindow(palette: Palette, x: number, front: number): THREE.Group {
  const group = new THREE.Group().add(box(palette.of(COLOUR.window), { width: 0.62, height: 0.5, depth: 0.03 }, { x, z: front }));
  for (let slat = 0; slat < 6; slat += 1) group.add(box(palette.of(COLOUR.lattice), { width: 0.045, height: 0.5, depth: 0.06 }, { x: x - 0.28 + slat * 0.112, z: front }));
  group.position.y = PLINTH_HEIGHT + 0.45;
  return group;
}

/** A short cloth curtain hung across the top of a doorway, split into panels. */
export function noren(palette: Palette, roof: RoofColour, front: number): THREE.Group {
  const group = new THREE.Group();
  for (const x of [-0.3, 0, 0.3]) group.add(box(palette.of(roofColour(roof)), { width: 0.28, height: 0.42, depth: 0.03 }, { x, y: PLINTH_HEIGHT + DOOR.height - 0.42, z: front + 0.04 }));
  return group;
}

/** A curtain with a white emblem on its middle panel, as a shop hangs over its door. */
export function emblemNoren(palette: Palette, roof: RoofColour, front: number): THREE.Group {
  const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), palette.of(COLOUR.paper));
  emblem.position.set(0, PLINTH_HEIGHT + DOOR.height - 0.2, front + 0.06);
  return noren(palette, roof, front).add(emblem);
}

/** How tall a townhouse's slatted front stands, and how thick its slats are and how far apart. */
export const KOSHI = { height: 0.78, slat: 0.035, spacing: 0.075 } as const;

/** A townhouse's ground-floor front: fine upright slats over a dark opening, `width` wide with its middle at `x`. */
export function koshi(palette: Palette, { x, width, front }: { x: number; width: number; front: number }): THREE.Group {
  const lattice = palette.of(COLOUR.lattice);
  const group = new THREE.Group().add(box(palette.of(COLOUR.window), { width, height: KOSHI.height, depth: 0.03 }, { x, z: front }));
  const gaps = Math.max(1, Math.floor(width / KOSHI.spacing));
  for (let slat = 0; slat <= gaps; slat += 1) group.add(box(lattice, { width: KOSHI.slat, height: KOSHI.height, depth: 0.05 }, { x: x - width / 2 + slat * (width / gaps), z: front + 0.01 }));
  group.add(box(lattice, { width: width + 0.04, height: 0.05, depth: 0.06 }, { x, y: KOSHI.height, z: front + 0.01 }));
  group.position.y = PLINTH_HEIGHT + 0.08;
  return group;
}

/** The stretch of front wall either side of the door, between it and the wall's end, as `x` and `width`. */
export function besideDoor(bodyWidth: number): { x: number; width: number }[] {
  const inner = DOOR.width / 2 + 0.1, outer = bodyWidth / 2 - 0.1;
  return [-1, 1].map(side => ({ x: side * (inner + outer) / 2, width: outer - inner }));
}

/** An upper-floor window of narrow dark slots in the plaster, framed in timber, `width` wide with its middle at `x`. */
export function slotWindow(palette: Palette, { x, y, width, front }: { x: number; y: number; width: number; front: number }): THREE.Group {
  const dark = palette.of(COLOUR.window), timber = palette.of(COLOUR.timber);
  const group = new THREE.Group();
  const slots = Math.max(2, Math.floor(width / 0.11));
  for (let slot = 0; slot < slots; slot += 1) group.add(box(dark, { width: 0.05, height: 0.22, depth: 0.02 }, { x: x - width / 2 + (slot + 0.5) * (width / slots), y: 0.04, z: front }));
  for (const top of [0, 0.28]) group.add(box(timber, { width: width + 0.06, height: 0.04, depth: 0.04 }, { x, y: top, z: front }));
  group.position.y = y;
  return group;
}

/** Paper lanterns hanging under the front eaves, near either end of the front wall. */
export function eaveLanterns(palette: Palette, { front, bodyWidth, eaves }: HallFrame, colour: string): THREE.Object3D[] {
  return [-1, 1].flatMap(side => paperLantern(palette, colour, { x: side * (bodyWidth / 2 - 0.22), y: eaves - 0.02, z: front + 0.22 }, 0.11));
}

/** Two sake barrels side by side by a wall, a third on top, each hooped in dark rope. */
export function barrels(palette: Palette, x: number, z: number): THREE.Object3D[] {
  const wood = palette.of(COLOUR.barrel), hoop = palette.of(COLOUR.timber);
  const stacked = [{ x: x - 0.12, y: 0 }, { x: x + 0.12, y: 0 }, { x, y: 0.2 }];
  return stacked.flatMap(barrel => [
    post(wood, 0.11, 0.2, { x: barrel.x, z, y: barrel.y }),
    ...[0.04, 0.15].map(height => post(hoop, 0.115, 0.025, { x: barrel.x, z, y: barrel.y + height })),
  ]);
}

/** A low red bench for passers-by, on four legs. */
export function bench(palette: Palette, x: number, z: number): THREE.Object3D[] {
  const red = palette.of(COLOUR.bench), legs = palette.of(COLOUR.timber);
  return [
    box(red, { width: 0.62, height: 0.05, depth: 0.24 }, { x, y: 0.2, z }),
    ...[-1, 1].flatMap(side => [-1, 1].map(end => box(legs, { width: 0.04, height: 0.2, depth: 0.04 }, { x: x + side * 0.27, z: z + end * 0.09 }))),
  ];
}

/** A round bush in a clay pot. */
export function pottedBush(palette: Palette, x: number, z: number): THREE.Object3D[] {
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), palette.of(COLOUR.bush));
  leaves.position.set(x, 0.3, z);
  return [post(palette.of(COLOUR.pot), 0.1, 0.16, { x, z }), leaves];
}

/** A stone lantern: a post holding a lit firebox under a little roof. */
export function stoneLantern(palette: Palette, x: number, z: number): THREE.Group {
  const stone = palette.of(COLOUR.lanternStone);
  const light = new THREE.MeshStandardMaterial({ color: COLOUR.lanternLight, emissive: COLOUR.lanternLight, emissiveIntensity: 0.6, flatShading: true });
  return new THREE.Group().add(
    box(stone, { width: 0.26, height: 0.06, depth: 0.26 }, { x, z }),
    post(stone, 0.06, 0.4, { x, z, y: 0.06 }),
    box(light, { width: 0.2, height: 0.18, depth: 0.2 }, { x, y: 0.46, z }),
    new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.14, 4).rotateY(Math.PI / 4), stone).translateX(x).translateY(0.71).translateZ(z),
  );
}

/** Where a hall's front is: how far south its front wall stands, how wide its walls are, the height of its eaves and
 *  of the top of its ridge. */
export type HallFrame = { front: number; bodyWidth: number; eaves: number; ridgeTop: number };
type HallFront = (palette: Palette, plan: BuildingPlan, frame: HallFrame) => THREE.Object3D[];
/** How a hall is built: how tall its walls stand, how high its roof rises over them, the colours of its walls and of
 *  the timber framing them, and its front. A townhouse's ground floor is dark wood up to a beam (`lowerWalls`), with
 *  the plaster above it. Its roof is of its roof colour, unless it's tiled in a colour of its own (`roofs`). */
type HallStyle = { wallHeight: number; rise: number; walls: string; lowerWalls?: string; timber: string; roofs?: string; front: HallFront };

/** How high a townhouse's ground floor reaches, where a beam runs round it. */
export const GROUND_FLOOR_HEIGHT = 1.08;

/** A hall: stone base, walls framed in timber, a curved roof with gabled ends, and its front as its style makes it. */
export function hall(palette: Palette, plan: BuildingPlan, { wallHeight, rise, walls, lowerWalls, timber: timberColour, roofs = roofColour(plan.roof), front }: HallStyle): THREE.Group {
  const bodyWidth = plan.width - 2 * WALL_INSET, bodyDepth = plan.depth - 2 * WALL_INSET;
  const eaves = PLINTH_HEIGHT + wallHeight;
  const roofShape: RoofShape = { span: plan.depth - 2 * ROOF_OVERHANG_INSET, length: plan.width - 2 * ROOF_OVERHANG_INSET, rise, base: eaves, thickness: 0.14 };
  const timber = palette.of(timberColour), wall = palette.of(walls);
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stone), { width: bodyWidth + 0.3, height: PLINTH_HEIGHT, depth: bodyDepth + 0.3 }),
    box(wall, { width: bodyWidth, height: wallHeight, depth: bodyDepth }, { y: PLINTH_HEIGHT }),
    box(timber, { width: bodyWidth + 0.04, height: 0.12, depth: bodyDepth + 0.04 }, { y: eaves - 0.12 }),
    box(timber, { width: bodyWidth + 0.04, height: 0.1, depth: bodyDepth + 0.04 }, { y: PLINTH_HEIGHT }),
    curvedRoof(palette.of(roofs), roofShape),
    roofTiles(palette, roofs, roofShape),
    ridge(palette, roofs, roofShape),
    ...[-1, 1].map(side => gable(palette.of(COLOUR.plaster), roofShape, side * (bodyWidth / 2 - 0.02), 0.04)),
    ...front(palette, plan, { front: bodyDepth / 2, bodyWidth, eaves, ridgeTop: eaves + rise }),
  );
  for (const x of [-bodyWidth / 2, -bodyWidth / 6, bodyWidth / 6, bodyWidth / 2]) {
    for (const z of [-bodyDepth / 2, bodyDepth / 2]) group.add(post(timber, TIMBER, wallHeight, { x, z, y: PLINTH_HEIGHT }));
  }
  for (const side of [-1, 1]) group.add(post(timber, TIMBER, wallHeight, { x: side * bodyWidth / 2, z: 0, y: PLINTH_HEIGHT }));
  if (lowerWalls) {
    // Slightly proud of the plaster, so the two never flicker where they meet.
    group.add(
      box(palette.of(lowerWalls), { width: bodyWidth + 0.006, height: GROUND_FLOOR_HEIGHT, depth: bodyDepth + 0.006 }, { y: PLINTH_HEIGHT }),
      box(timber, { width: bodyWidth + 0.05, height: 0.08, depth: bodyDepth + 0.05 }, { y: PLINTH_HEIGHT + GROUND_FLOOR_HEIGHT }),
    );
  }
  if (plan.sign) group.add(hangingSign(palette, plan.sign, eaves, plan.depth / 2 - ROOF_OVERHANG_INSET - 0.05));
  return group;
}

/** The kana school: a tall hall with a paper door, slatted windows, a veranda along its front and stone lanterns. */
const kanaSchool: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: 1.5, rise: 1.05, walls: COLOUR.plaster, timber: COLOUR.timber,
  front: (palette, { width }, frame) => [
    shojiDoor(palette, frame.front + 0.01),
    latticeWindow(palette, -frame.bodyWidth / 2 + 0.55, frame.front + 0.01),
    latticeWindow(palette, frame.bodyWidth / 2 - 0.55, frame.front + 0.01),
    box(palette.of(COLOUR.deck), { width: frame.bodyWidth + 0.3, height: 0.06, depth: 0.26 }, { y: PLINTH_HEIGHT - 0.06, z: frame.front + 0.15 }),
    box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.2 }, { z: frame.front + 0.38 }),
    stoneLantern(palette, -width / 2 + 0.2, frame.front + 0.33),
    stoneLantern(palette, width / 2 - 0.2, frame.front + 0.33),
    ...eaveLanterns(palette, frame, COLOUR.lanternWhite),
  ],
});

const TOWNHOUSE_WALL_HEIGHT = 1.85;
/** How high a townhouse's upper windows sit over its plinth. */
const UPPER_WINDOWS = 1.33;

/** The calligraphy house: a two-storey townhouse. Its ground floor is dark wood, slatted either side of a curtained
 *  door, under a narrow roof; above, white plaster with slotted windows. Red lanterns hang under its eaves, and a
 *  bench and a potted bush stand out front. */
const calligraphyHouse: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: TOWNHOUSE_WALL_HEIGHT, rise: 0.85, walls: COLOUR.plaster, lowerWalls: COLOUR.planks, timber: COLOUR.timber,
  front: (palette, { roof }, frame) => [
    shojiDoor(palette, frame.front + 0.01),
    emblemNoren(palette, roof, frame.front),
    ...besideDoor(frame.bodyWidth).map(({ x, width }) => koshi(palette, { x, width, front: frame.front + 0.01 })),
    pentRoof(palette, roofColour(roof), frame, GROUND_FLOOR_HEIGHT),
    ...[-1, 1].map(side => slotWindow(palette, { x: side * frame.bodyWidth * 0.3, y: PLINTH_HEIGHT + UPPER_WINDOWS, width: 0.7, front: frame.front + 0.01 })),
    ...eaveLanterns(palette, frame, COLOUR.lanternRed),
    box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.3 }, { z: frame.front + 0.3 }),
    ...bench(palette, -frame.bodyWidth / 2 + 0.5, frame.front + 0.3),
    ...pottedBush(palette, frame.bodyWidth / 2 - 0.3, frame.front + 0.3),
  ],
});

/** How deep a veranda is, how high its railing stands, and how wide the steps up the middle of it are. */
const VERANDA = { depth: 0.32, railHeight: 0.26, stepsWidth: 1.0 } as const;

/** A veranda along a hall's front, with a railing along its edge either side of the steps up to it. */
function veranda(palette: Palette, { front, bodyWidth }: HallFrame, colours: { deck: string; rail: string }): THREE.Object3D[] {
  const deck = palette.of(colours.deck), rail = palette.of(colours.rail);
  const edge = front + VERANDA.depth;
  const railLength = (bodyWidth + 0.3 - VERANDA.stepsWidth) / 2;
  const parts: THREE.Object3D[] = [
    box(deck, { width: bodyWidth + 0.3, height: 0.06, depth: VERANDA.depth }, { y: PLINTH_HEIGHT - 0.06, z: front + VERANDA.depth / 2 }),
    box(palette.of(COLOUR.step), { width: VERANDA.stepsWidth, height: 0.09, depth: 0.14 }, { z: edge + 0.04 }),
  ];
  for (const side of [-1, 1]) {
    const middle = side * (VERANDA.stepsWidth / 2 + railLength / 2);
    parts.push(box(rail, { width: railLength, height: 0.04, depth: 0.04 }, { x: middle, y: PLINTH_HEIGHT + VERANDA.railHeight, z: edge - 0.03 }));
    for (const x of [middle - railLength / 2, middle, middle + railLength / 2]) parts.push(post(rail, 0.025, VERANDA.railHeight, { x, z: edge - 0.03, y: PLINTH_HEIGHT }));
  }
  return parts;
}

/** Wide wooden doors slid open to either side, showing the dark hall inside. */
function openDoors(palette: Palette, front: number, width: number): THREE.Object3D[] {
  const panel = palette.of(COLOUR.deck);
  return [
    box(palette.of(COLOUR.window), { width, height: DOOR.height + 0.1, depth: 0.03 }, { y: PLINTH_HEIGHT, z: front + 0.01 }),
    ...[-1, 1].map(side => box(panel, { width: width / 2, height: DOOR.height + 0.1, depth: 0.04 }, { x: side * width * 0.75, y: PLINTH_HEIGHT, z: front + 0.03 })),
  ];
}

/** The seams between the upright planks of a wooden front wall, leaving a gap for its doors. */
function plankSeams(palette: Palette, { front, bodyWidth }: HallFrame, wallHeight: number, doorsWidth: number): THREE.Object3D[] {
  const seam = palette.of(COLOUR.timber);
  const seams: THREE.Object3D[] = [];
  for (let x = -bodyWidth / 2 + 0.25; x < bodyWidth / 2 - 0.1; x += 0.25) {
    if (Math.abs(x) < doorsWidth) continue;
    seams.push(box(seam, { width: 0.025, height: wallHeight - 0.25, depth: 0.02 }, { x, y: PLINTH_HEIGHT + 0.1, z: front + 0.01 }));
  }
  return seams;
}

const DOJO_WALL_HEIGHT = 1.4;
const DOJO_DOORS_WIDTH = 1.3;

/** The dojo: a hall of dark wooden planks under a heavy roof, its wide doors slid open onto a railed veranda, and a
 *  white band of plaster under its eaves. */
const dojo: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: DOJO_WALL_HEIGHT, rise: 1.1, walls: COLOUR.planks, timber: COLOUR.timber,
  front: (palette, _plan, frame) => [
    ...openDoors(palette, frame.front, DOJO_DOORS_WIDTH),
    ...plankSeams(palette, frame, DOJO_WALL_HEIGHT, DOJO_DOORS_WIDTH),
    box(palette.of(COLOUR.plaster), { width: frame.bodyWidth, height: 0.2, depth: 0.02 }, { y: frame.eaves - 0.34, z: frame.front + 0.01 }),
    ...veranda(palette, frame, { deck: COLOUR.deck, rail: COLOUR.timber }),
    ...eaveLanterns(palette, frame, COLOUR.lanternWhite),
    ...barrels(palette, frame.bodyWidth / 2 + 0.2, frame.front + 0.3),
  ],
});

/** Gold caps along the top of a shrine hall's ridge. */
function ridgeCaps(palette: Palette, { ridgeTop }: HallFrame, length: number): THREE.Object3D[] {
  const gold = palette.of(COLOUR.gold);
  return [-0.3, -0.1, 0.1, 0.3].map(share => post(gold, 0.05, 0.12, { x: share * length, z: 0, y: ridgeTop + 0.04 }));
}

/** The practice hall: a shrine hall of white walls framed in vermilion, its lattice doors up steps between vermilion
 *  railings, gold caps along its ridge. */
const practiceHall: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: 1.45, rise: 1.0, walls: COLOUR.plaster, timber: COLOUR.vermilion,
  front: (palette, { width }, frame) => [
    shojiDoor(palette, frame.front + 0.01),
    latticeWindow(palette, -frame.bodyWidth / 2 + 0.55, frame.front + 0.01),
    latticeWindow(palette, frame.bodyWidth / 2 - 0.55, frame.front + 0.01),
    ...veranda(palette, frame, { deck: COLOUR.deck, rail: COLOUR.vermilion }),
    ...eaveLanterns(palette, frame, COLOUR.lanternWhite),
    ...ridgeCaps(palette, frame, width),
  ],
});

/** How a market stall is built: how high its counter, its back wall and its awning's eaves stand, and how deep its
 *  back wall and counter are. */
const STALL = { counter: 0.72, backWall: 1.2, awning: 1.55, wallDepth: 0.12, counterDepth: 0.5 } as const;
/** The colours of the goods on a stall: jars, fruit and boxes of sweets. */
const GOODS = ["#d9534f", "#f0ad4e", "#5cb85c", "#5bc0de", "#f7f0dc", "#9b59b6", "#e88aa8"] as const;
const CRATE = "#b08a5a";

/** A row of goods along a shelf or counter `width` wide at height `y`, `z` deep: a jar, a bowl of fruit and a box in
 *  turn, each its own colour. */
function goodsRow(palette: Palette, { width, y, z, count }: { width: number; y: number; z: number; count: number }): THREE.Object3D[] {
  return Array.from({ length: count }, (_, index) => {
    const x = -width / 2 + (index + 0.5) * (width / count);
    const colour = palette.of(GOODS[(index * 3 + count) % GOODS.length]);
    if (index % 3 === 0) return [post(colour, 0.07, 0.18, { x, z, y }), post(palette.of(COLOUR.timber), 0.05, 0.03, { x, z, y: y + 0.18 })];
    if (index % 3 === 1) {
      const fruit = [-0.05, 0.05, 0].map((offset, piece) => placed(new THREE.SphereGeometry(0.05, 8, 6), colour, { x: x + offset, y: y + 0.1 + (piece === 2 ? 0.06 : 0), z }));
      return [post(palette.of(COLOUR.shoji), 0.11, 0.06, { x, z, y }), ...fruit];
    }
    return [box(colour, { width: 0.22, height: 0.1, depth: 0.16 }, { x, y, z }), box(palette.of(COLOUR.paper), { width: 0.23, height: 0.025, depth: 0.04 }, { x, y: y + 0.04, z: z + 0.07 })];
  }).flat();
}

/** A fringe of cloth flaps along the front edge of an awning, `colour` and white in turn, `width` wide at (y, z). */
function valance(palette: Palette, colour: string, { width, y, z }: { width: number; y: number; z: number }): THREE.Object3D[] {
  const flaps = Math.round(width / 0.26);
  return Array.from({ length: flaps }, (_, flap) => {
    const x = -width / 2 + (flap + 0.5) * (width / flaps);
    const cloth = box(palette.of(flap % 2 === 0 ? colour : COLOUR.paper), { width: width / flaps - 0.01, height: 0.2, depth: 0.02 }, { x, y: y - 0.2, z });
    // A round hem at the foot of each flap, so the fringe scallops.
    const hem = placed(new THREE.CircleGeometry(width / flaps / 2 - 0.005, 10, Math.PI, Math.PI), cloth.material instanceof THREE.Material ? cloth.material : palette.of(colour), { x, y: y - 0.2, z: z + 0.011 });
    return [cloth, hem];
  }).flat();
}

/** Two wooden crates stacked by a stall, the top one turned a little. */
function crates(palette: Palette, x: number, z: number): THREE.Object3D[] {
  const wood = palette.of(CRATE);
  const top = box(wood, { width: 0.32, height: 0.24, depth: 0.3 }, { x, y: 0.26, z });
  top.rotation.y = 0.3;
  return [box(wood, { width: 0.36, height: 0.26, depth: 0.34 }, { x, z }), top, box(palette.of(GOODS[1]), { width: 0.24, height: 0.06, depth: 0.2 }, { x, y: 0.5, z })];
}

/** A market stall: a back wall with two shelves of goods, a counter laid with more under a cloth awning on four
 *  posts, its front draped in the stall's colour with a white emblem, a scalloped fringe along the awning with paper
 *  lanterns at its corners, crates stacked beside it and a banner on a pole. */
const stall: BuildingBuilder = (palette, plan) => {
  const timber = palette.of(COLOUR.timber), deck = palette.of(COLOUR.deck);
  const clothColour = AWNING_COLOURS[plan.roof], cloth = palette.of(clothColour);
  const width = plan.width - 2 * WALL_INSET, depth = plan.depth - 2 * WALL_INSET - 0.2;
  const back = -depth / 2, front = depth / 2;
  const counterZ = front - STALL.counterDepth / 2;
  const awningShape: RoofShape = { span: depth + 0.6, length: width + 0.4, rise: 0.35, base: STALL.awning, thickness: 0.06 };
  const emblem = placed(new THREE.CircleGeometry(0.13, 14), palette.of(COLOUR.paper), { y: STALL.counter * 0.5, z: front + 0.02 });
  const group = new THREE.Group().add(
    box(deck, { width: width - 0.2, height: STALL.backWall, depth: STALL.wallDepth }, { z: back + STALL.wallDepth / 2 }),
    ...[0.55, 0.92].map(y => box(palette.of(COLOUR.planks), { width: width - 0.3, height: 0.04, depth: 0.24 }, { y, z: back + 0.22 })),
    ...[0.59, 0.96].flatMap(y => goodsRow(palette, { width: width - 0.5, y, z: back + 0.22, count: 6 })),
    box(deck, { width: width - 0.2, height: STALL.counter, depth: STALL.counterDepth }, { z: counterZ }),
    box(cloth, { width: width - 0.16, height: STALL.counter * 0.8, depth: 0.02 }, { y: 0.06, z: front + 0.005 }),
    emblem,
    box(palette.of(COLOUR.shoji), { width: width - 0.1, height: 0.04, depth: STALL.counterDepth + 0.06 }, { y: STALL.counter, z: counterZ }),
    ...goodsRow(palette, { width: width - 0.4, y: STALL.counter + 0.04, z: counterZ, count: 7 }),
    curvedRoof(cloth, awningShape),
    ...valance(palette, clothColour, { width: width + 0.4, y: STALL.awning + 0.08, z: front + 0.3 }),
    post(timber, 0.04, 2.3, { x: width / 2 + 0.25, z: front + 0.1 }),
    box(cloth, { width: 0.03, height: 1.1, depth: 0.32 }, { x: width / 2 + 0.25, y: 1.05, z: front - 0.08 }),
    ...crates(palette, -width / 2 - 0.25, front - 0.15),
  );
  for (const x of [-width / 2, width / 2]) {
    for (const z of [back, front]) group.add(post(timber, 0.06, STALL.awning + 0.12, { x, z }));
    group.add(...paperLantern(palette, COLOUR.lanternRed, { x, y: STALL.awning - 0.15, z: front + 0.22 }, 0.1));
  }
  if (plan.sign) group.add(hangingSign(palette, plan.sign, STALL.awning + 0.05, front + 0.36));
  return group;
};

const SCHOOL_WALL_HEIGHT = 2.0;
/** How high the school's upper floor starts, where a narrow roof runs along its front. */
const SCHOOL_UPPER_FLOOR = 1.15;

/** A narrow sloping roof along a front wall at `y`, sheltering the ground floor. */
export function pentRoof(palette: Palette, roof: string, { front, bodyWidth }: HallFrame, y: number): THREE.Object3D {
  const pent = box(palette.of(roof), { width: bodyWidth + 0.2, height: 0.06, depth: 0.36 }, { y: PLINTH_HEIGHT + y, z: front + 0.16 });
  pent.rotation.x = 0.35;
  return pent;
}

/** The school: a tall two-storey hall, a paper door and slatted windows below, a row of windows above, and a narrow
 *  roof along its front between the floors. */
const school: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: SCHOOL_WALL_HEIGHT, rise: 0.95, walls: COLOUR.plaster, lowerWalls: COLOUR.planks, timber: COLOUR.timber,
  front: (palette, { roof }, frame) => {
    const upper = [-1, 0, 1].map(column => latticeWindow(palette, column * frame.bodyWidth * 0.32, frame.front + 0.01));
    for (const window of upper) window.position.y += SCHOOL_UPPER_FLOOR;
    return [
      shojiDoor(palette, frame.front + 0.01),
      ...besideDoor(frame.bodyWidth).map(({ x, width }) => koshi(palette, { x, width, front: frame.front + 0.01 })),
      ...upper,
      pentRoof(palette, roofColour(roof), frame, SCHOOL_UPPER_FLOOR),
      ...eaveLanterns(palette, frame, COLOUR.lanternRed),
      box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.3 }, { z: frame.front + 0.3 }),
      ...[-1, 1].flatMap(side => pottedBush(palette, side * (frame.bodyWidth / 2 - 0.3), frame.front + 0.3)),
    ];
  },
});

const THATCH = "#c8a865";
/** The thatch's cut edge along the eaves, darker for its thickness. */
const THATCH_EDGE = "#a98b4f";
const TEAHOUSE = { wallHeight: 1.05, roofHeight: 1.2, rim: 0.16 } as const;

/** A hipped thatch roof: a four-sided cone cut short, `span` across at the eaves and stretched to `length`, with its
 *  thick cut edge showing along the eaves. */
function thatchRoof(palette: Palette, { span, length, eaves }: { span: number; length: number; eaves: number }): THREE.Object3D[] {
  const hipped = (top: number, bottom: number, height: number, colour: string, y: number) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, 4, 1).rotateY(Math.PI / 4), palette.of(colour));
    mesh.scale.x = length / span;
    mesh.position.y = y;
    return mesh;
  };
  const corner = span * Math.SQRT1_2;
  return [
    hipped(span * 0.18, corner, TEAHOUSE.roofHeight, THATCH, eaves + TEAHOUSE.roofHeight / 2 - 0.05),
    hipped(corner * 0.95, corner * 1.02, TEAHOUSE.rim, THATCH_EDGE, eaves - 0.05 + TEAHOUSE.rim / 2),
  ];
}

/** Along a thatch ridge at `top`: a cap, a little smoke vent under its own thatch, and pairs of logs crossed over it. */
function thatchRidge(palette: Palette, roof: RoofColour, { top, length }: { top: number; length: number }): THREE.Object3D[] {
  const timber = palette.of(COLOUR.timber);
  const crossed = [-1, 1].flatMap(end => [-1, 1].map(lean => {
    const log = box(timber, { width: 0.05, height: 0.5, depth: 0.05 }, { y: -0.25 });
    const holder = new THREE.Group().add(log);
    holder.rotation.z = lean * 0.55;
    holder.position.set(end * length * 0.22, top + 0.3, 0);
    return holder;
  }));
  return [
    box(palette.of(roofColour(roof)), { width: length * 0.62, height: 0.16, depth: 0.3 }, { y: top - 0.07 }),
    box(timber, { width: 0.46, height: 0.2, depth: 0.3 }, { y: top + 0.08 }),
    box(palette.of(THATCH), { width: 0.6, height: 0.08, depth: 0.44 }, { y: top + 0.27 }),
    ...crossed,
  ];
}

/** The teahouse: white walls framed in dark timber under a deep, steep roof of thatch, with smoke vent and crossed
 *  logs along its ridge; a paper door with a curtain, a round window and a slatted one, a veranda along its front with
 *  a stepping stone up to it, white lanterns under its eaves, and a rain barrel and a potted bush either side. */
const teahouse: BuildingBuilder = (palette, plan) => {
  const bodyWidth = plan.width - 2 * WALL_INSET - 0.2, bodyDepth = plan.depth - 2 * WALL_INSET;
  const eaves = PLINTH_HEIGHT + TEAHOUSE.wallHeight, front = bodyDepth / 2;
  const span = Math.min(plan.width, plan.depth) - 0.1, length = plan.width - 0.1;
  const timber = palette.of(COLOUR.timber);
  const round = new THREE.Mesh(new THREE.CircleGeometry(0.28, 14), palette.of(COLOUR.shoji));
  round.position.set(-bodyWidth / 2 + 0.5, PLINTH_HEIGHT + 0.6, front + 0.015);
  const frame: HallFrame = { front, bodyWidth, eaves, ridgeTop: eaves + TEAHOUSE.roofHeight };
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stone), { width: bodyWidth + 0.2, height: PLINTH_HEIGHT, depth: bodyDepth + 0.2 }),
    box(palette.of(COLOUR.plaster), { width: bodyWidth, height: TEAHOUSE.wallHeight, depth: bodyDepth }, { y: PLINTH_HEIGHT }),
    ...[PLINTH_HEIGHT, eaves - 0.1].map(y => box(timber, { width: bodyWidth + 0.04, height: 0.1, depth: bodyDepth + 0.04 }, { y })),
    ...thatchRoof(palette, { span, length, eaves }),
    ...thatchRidge(palette, plan.roof, { top: eaves + TEAHOUSE.roofHeight - 0.05, length }),
    round,
    new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 4, 14), palette.of(COLOUR.lattice)).translateX(round.position.x).translateY(round.position.y).translateZ(front + 0.02),
    latticeWindow(palette, bodyWidth / 2 - 0.5, front + 0.01),
    shojiDoor(palette, front + 0.01),
    noren(palette, plan.roof, front),
    box(palette.of(COLOUR.deck), { width: bodyWidth + 0.1, height: 0.06, depth: 0.3 }, { y: PLINTH_HEIGHT - 0.06, z: front + 0.15 }),
    box(palette.of(COLOUR.step), { width: 0.6, height: 0.1, depth: 0.22 }, { z: front + 0.39 }),
    ...eaveLanterns(palette, frame, COLOUR.lanternWhite),
    post(palette.of(COLOUR.barrel), 0.13, 0.34, { x: bodyWidth / 2 + 0.25, z: front - 0.25 }),
    post(timber, 0.135, 0.03, { x: bodyWidth / 2 + 0.25, z: front - 0.25, y: 0.26 }),
    ...pottedBush(palette, -bodyWidth / 2 - 0.25, front - 0.25),
  );
  for (const x of [-bodyWidth / 2, -bodyWidth / 6, bodyWidth / 6, bodyWidth / 2]) {
    for (const z of [-bodyDepth / 2, bodyDepth / 2]) group.add(post(timber, TIMBER, TEAHOUSE.wallHeight, { x, z, y: PLINTH_HEIGHT }));
  }
  if (plan.sign) group.add(hangingSign(palette, plan.sign, eaves + 0.15, plan.depth / 2 - 0.1));
  return group;
};

/** A sacred rope hung across a shrine's porch at height `y`, with zigzag paper streamers hanging from it. */
function shimenawa(palette: Palette, y: number, z: number, width: number): THREE.Object3D[] {
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, width, 8).rotateZ(Math.PI / 2), palette.of(COLOUR.straw));
  rope.position.set(0, y, z);
  const streamers = [-0.3, 0, 0.3].map(share => box(palette.of(COLOUR.paper), { width: 0.06, height: 0.16, depth: 0.01 }, { x: share * width, y: y - 0.2, z: z + 0.03 }));
  return [rope, ...streamers];
}

/** The shrine: a hall framed in vermilion, a little roofed porch on two posts before its doors, a sacred rope across
 *  it, an offering box and the bell rope, and gold caps along the ridge. */
const shrine: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: 1.35, rise: 1.05, walls: COLOUR.plaster, timber: COLOUR.vermilion,
  front: (palette, { roof, width }, frame) => {
    const porchDepth = 0.42, porchWidth = 1.5, porchEaves = frame.eaves - 0.15;
    const porch = curvedRoof(palette.of(roofColour(roof)), { span: porchDepth + 0.1, length: porchWidth + 0.2, rise: 0.22, base: porchEaves, thickness: 0.08 });
    porch.position.z = frame.front + porchDepth / 2;
    return [
      shojiDoor(palette, frame.front + 0.01),
      latticeWindow(palette, -frame.bodyWidth / 2 + 0.5, frame.front + 0.01),
      latticeWindow(palette, frame.bodyWidth / 2 - 0.5, frame.front + 0.01),
      porch,
      ...[-1, 1].map(side => post(palette.of(COLOUR.vermilion), 0.05, porchEaves, { x: side * porchWidth / 2, z: frame.front + porchDepth })),
      // The rope hangs just over the door, low enough that it doesn't cross the sign under the eaves.
      ...shimenawa(palette, PLINTH_HEIGHT + DOOR.height + 0.12, frame.front + porchDepth, porchWidth),
      box(palette.of(COLOUR.timber), { width: 0.5, height: 0.3, depth: 0.28 }, { z: frame.front + 0.25 }),
      post(palette.of(COLOUR.straw), 0.025, porchEaves - 0.5, { x: 0.15, z: frame.front + 0.3, y: 0.35 }),
      post(palette.of(COLOUR.gold), 0.06, 0.08, { x: 0.15, z: frame.front + 0.3, y: porchEaves - 0.2 }),
      ...eaveLanterns(palette, frame, COLOUR.lanternWhite),
      ...ridgeCaps(palette, frame, width),
    ];
  },
});

/** A pagoda's five storeys: how wide the first is (as a share of its ground), how much narrower each one up (also a
 *  share), how tall the first and the rest stand, and its roofs: how far their eaves reach out, how thick they are,
 *  how high each slopes up to the storey above, and how far their corners curl up. */
const PAGODA = {
  storeys: 5, baseShare: 0.72, narrowing: 0.06, firstHeight: 0.8, storeyHeight: 0.54,
  eaves: 0.28, eaveThickness: 0.08, roofRise: 0.12, cornerLift: 0.14, spire: 1.3,
} as const;
/** The ground (in tiles across) a pagoda's measures are for. */
const PAGODA_DESIGN_GROUND = 3;
/** A pagoda's roofs are dark slate, unless its roof colour is itself a dark one. */
const PAGODA_SLATE = "#474c55";
const PAGODA_ROOFS: Readonly<Record<RoofColour, string>> = { vermilion: PAGODA_SLATE, wood: PAGODA_SLATE, indigo: ROOF_COLOURS.indigo, moss: ROOF_COLOURS.moss };
const PAGODA_GOLD = "#d4a64a";
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;

/** One storey `width` wide and `height` tall from `floor`: white walls framed by vermilion posts and beams, a dark
 *  doorway on its front, and a railing round its foot (but the first, which stands on the plinth). */
function pagodaStorey(palette: Palette, { width, height, floor, hasRailing }: { width: number; height: number; floor: number; hasRailing: boolean }): THREE.Object3D[] {
  const frame = palette.of(COLOUR.vermilion), half = width / 2;
  const parts: THREE.Object3D[] = [
    box(palette.of(COLOUR.plaster), { width, height, depth: width }, { y: floor }),
    box(frame, { width: width + 0.03, height: 0.07, depth: width + 0.03 }, { y: floor + height - 0.07 }),
    ...DIAGONALS.map(([x, z]) => post(frame, 0.04, height, { x: x * half, z: z * half, y: floor })),
    box(palette.of(COLOUR.window), { width: width * 0.36, height: height * 0.62, depth: 0.02 }, { y: floor + height * 0.12, z: half + 0.01 }),
    box(frame, { width: width * 0.46, height: 0.04, depth: 0.03 }, { y: floor + height * 0.74, z: half + 0.015 }),
  ];
  if (hasRailing) parts.push(box(frame, { width: width + 0.12, height: 0.05, depth: width + 0.12 }, { y: floor + 0.08 }));
  return parts;
}

/** A storey's roof over `width` of wall at `base`: thin wide eaves sloping up to `topWidth`, their corners curling up. */
function pagodaRoof(material: THREE.Material, { width, topWidth, base }: { width: number; topWidth: number; base: number }): THREE.Object3D[] {
  const reach = width / 2 + PAGODA.eaves;
  const slope = new THREE.Mesh(new THREE.CylinderGeometry(topWidth / Math.SQRT2, reach * Math.SQRT2, PAGODA.roofRise, 4).rotateY(Math.PI / 4), material);
  slope.position.y = base + PAGODA.eaveThickness + PAGODA.roofRise / 2;
  // Each corner's tip leans out along the diagonal and up, so the eaves look to flare.
  const tips = DIAGONALS.map(([x, z]) => {
    const tip = box(material, { width: 0.08, height: PAGODA.eaveThickness, depth: 0.26 });
    tip.rotation.order = "YXZ";
    tip.rotation.set(-Math.atan2(PAGODA.cornerLift, 0.26), Math.atan2(x, z), 0);
    tip.position.set(x * (reach - 0.06), base + PAGODA.eaveThickness / 2 + PAGODA.cornerLift / 2, z * (reach - 0.06));
    return tip;
  });
  return [box(material, { width: reach * 2, height: PAGODA.eaveThickness, depth: reach * 2 }, { y: base }), slope, ...tips];
}

/** A five-storey pagoda: white-walled, vermilion-framed storeys narrowing upwards, each under a thin flaring roof,
 *  topped by a gold spire with rings. */
const pagoda: BuildingBuilder = (palette, plan) => {
  const ground = PAGODA_DESIGN_GROUND;
  const roofs = palette.of(PAGODA_ROOFS[plan.roof]);
  const widthOf = (storey: number) => ground * (PAGODA.baseShare - storey * PAGODA.narrowing);
  const group = new THREE.Group().add(box(palette.of(COLOUR.stone), { width: widthOf(0) + 0.3, height: PLINTH_HEIGHT, depth: widthOf(0) + 0.3 }));
  let floor = PLINTH_HEIGHT;
  for (let storey = 0; storey < PAGODA.storeys; storey += 1) {
    const width = widthOf(storey), height = storey === 0 ? PAGODA.firstHeight : PAGODA.storeyHeight;
    group.add(...pagodaStorey(palette, { width, height, floor, hasRailing: storey > 0 }));
    group.add(...pagodaRoof(roofs, { width, topWidth: widthOf(storey + 1) * 0.9, base: floor + height }));
    floor += height + PAGODA.eaveThickness + PAGODA.roofRise;
  }
  const gold = palette.of(PAGODA_GOLD);
  group.add(post(gold, 0.035, PAGODA.spire, { x: 0, z: 0, y: floor }));
  for (let ring = 1; ring <= 5; ring += 1) group.add(post(gold, 0.08, 0.03, { x: 0, z: 0, y: floor + ring * 0.13 }));
  // Its sign hangs from the lowest roof's eaves, over the door.
  if (plan.sign) group.add(hangingSign(palette, plan.sign, PLINTH_HEIGHT + PAGODA.firstHeight, widthOf(0) / 2 + 0.16));
  // Built on a ground of its design size, then grown (or shrunk) to its own, roofs, spire and sign alike.
  group.scale.setScalar(Math.min(plan.width, plan.depth) / PAGODA_DESIGN_GROUND);
  return group;
};

export const BUILDING_BUILDERS: ReadonlyMap<BuildingLook, BuildingBuilder> = new Map<BuildingLook, BuildingBuilder>([
  ["kana-school", kanaSchool], ["calligraphy", calligraphyHouse], ["stall", stall], ["pagoda", pagoda],
  ["dojo", dojo], ["practice-hall", practiceHall], ["school", school], ["teahouse", teahouse], ["shrine", shrine],
]);
