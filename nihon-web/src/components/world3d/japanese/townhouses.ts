// The village's townhouses, built in code (our own designs, after the merchant houses and inns of an old Japanese
// town): two-storey machiya under dark slate roofs, their ground floors dark wood slatted either side of a curtained
// door behind low bent-bamboo guards, white plaster above with a slotted window, and red lanterns either side of the
// door; and a grand two-storey ryokan, a hot-spring inn, with round windows below, a railed balcony above hung with
// white lanterns, a curved porch over its doors and steam rising behind. Each fills its ground, door in the middle of
// its front (south) side, sign hung under its eaves.
import * as THREE from "three";
import type { BuildingLook } from "../../../lib/errands/village.ts";
import {
  COLOUR, DOOR, GROUND_FLOOR_HEIGHT, PLINTH_HEIGHT, barrels, bench, besideDoor, emblemNoren, hall, koshi, pottedBush,
  shojiDoor, slotWindow, stoneLantern,
} from "./buildings.ts";
import { pentRoof } from "./buildings.ts";
import type { BuildingBuilder, BuildingPlan, HallFrame } from "./buildings.ts";
import { box, curvedRoof, gable, paperLantern, placed, post } from "./shapes.ts";
import type { Palette } from "./shapes.ts";

/** Townhouse roofs are dark slate tiles, whatever the building's colour (which its curtain and trim take). */
const SLATE = "#4b505a";
const TOWN_COLOUR = { bamboo: "#4a3524", postbox: "#c8302a", cedar: "#5e7d3a", steam: "#f4f4f2", balcony: "#5a3b28" } as const;

/** How a machiya stands: its walls' height (two storeys), its roof's rise, and how high its upper window sits. */
const MACHIYA = { wallHeight: 2.05, rise: 0.8, upperWindow: 1.42 } as const;
/** The low guards of bent bamboo at the foot of a townhouse's slatted front: how tall, how far they lean out, and
 *  how far apart their canes are. */
const INU_YARAI = { height: 0.32, lean: 0.5, spacing: 0.09 } as const;

/** Low guards of bent bamboo canes leaning against the foot of a wall, `width` wide with their middle at `x`. */
function bambooGuard(palette: Palette, { x, width, front }: { x: number; width: number; front: number }): THREE.Object3D[] {
  const bamboo = palette.of(TOWN_COLOUR.bamboo);
  const canes = Math.max(2, Math.floor(width / INU_YARAI.spacing));
  const reach = Math.sin(INU_YARAI.lean) * INU_YARAI.height;
  return [
    ...Array.from({ length: canes + 1 }, (_, cane) => {
      const slat = box(bamboo, { width: 0.025, height: INU_YARAI.height, depth: 0.025 }, { x: x - width / 2 + cane * (width / canes), z: front + reach / 2 + 0.03 });
      slat.rotation.x = -INU_YARAI.lean;
      return slat;
    }),
    box(bamboo, { width, height: 0.03, depth: 0.03 }, { x, y: INU_YARAI.height * Math.cos(INU_YARAI.lean) - 0.02, z: front + 0.04 }),
    box(bamboo, { width, height: 0.03, depth: 0.03 }, { x, y: 0.02, z: front + reach + 0.03 }),
  ];
}

/** Red lanterns hanging under the narrow roof either side of a townhouse's door. */
function doorLanterns(palette: Palette, front: number, spread: number): THREE.Object3D[] {
  return [-1, 1].flatMap(side => paperLantern(palette, COLOUR.lanternRed, { x: side * spread, y: PLINTH_HEIGHT + GROUND_FLOOR_HEIGHT - 0.04, z: front + 0.16 }, 0.09));
}

type FrontExtras = (palette: Palette, plan: BuildingPlan, frame: HallFrame) => THREE.Object3D[];

/** A machiya, with what stands in front of this one (`extras`). */
const machiya = (extras: FrontExtras): BuildingBuilder => (palette, plan) => hall(palette, plan, {
  wallHeight: MACHIYA.wallHeight, rise: MACHIYA.rise, walls: COLOUR.plaster, lowerWalls: COLOUR.planks, timber: COLOUR.timber, roofs: SLATE,
  front: (palette, built, frame) => [
    shojiDoor(palette, frame.front + 0.01),
    emblemNoren(palette, built.roof, frame.front),
    ...besideDoor(frame.bodyWidth).flatMap(({ x, width }) => [koshi(palette, { x, width, front: frame.front + 0.01 }), ...bambooGuard(palette, { x, width, front: frame.front })]),
    pentRoof(palette, SLATE, frame, GROUND_FLOOR_HEIGHT),
    slotWindow(palette, { x: 0, y: PLINTH_HEIGHT + MACHIYA.upperWindow, width: frame.bodyWidth * 0.55, front: frame.front + 0.01 }),
    ...doorLanterns(palette, frame.front, DOOR.width / 2 + 0.18),
    box(palette.of(COLOUR.step), { width: 1.1, height: 0.09, depth: 0.26 }, { z: frame.front + 0.3 }),
    ...extras(palette, built, frame),
  ],
});

/** The learner's own house: potted bushes either side of the door. */
const home = machiya((palette, _plan, { front, bodyWidth }) => [-1, 1].flatMap(side => pottedBush(palette, side * (bodyWidth / 2 - 0.25), front + 0.3)));

/** A red postbox on a stand: a round box with a dark cap and a slot for letters. */
function postbox(palette: Palette, x: number, z: number): THREE.Object3D[] {
  const red = palette.of(TOWN_COLOUR.postbox), dark = palette.of(COLOUR.window);
  return [
    post(red, 0.13, 0.62, { x, z }),
    post(dark, 0.145, 0.06, { x, z, y: 0.62 }),
    box(dark, { width: 0.14, height: 0.025, depth: 0.02 }, { x, y: 0.5, z: z + 0.13 }),
  ];
}

/** A railed balcony across the middle of the upper floor, `width` wide, its deck at `y`. */
function balcony(palette: Palette, { front, width, y }: { front: number; width: number; y: number }): THREE.Object3D[] {
  const wood = palette.of(TOWN_COLOUR.balcony), depth = 0.24, railHeight = 0.26;
  const posts = Math.max(2, Math.round(width / 0.2));
  return [
    box(wood, { width, height: 0.05, depth }, { y, z: front + depth / 2 }),
    box(wood, { width, height: 0.04, depth: 0.04 }, { y: y + railHeight, z: front + depth }),
    ...Array.from({ length: posts + 1 }, (_, index) => box(wood, { width: 0.03, height: railHeight, depth: 0.03 }, { x: -width / 2 + index * (width / posts), y, z: front + depth })),
  ];
}

/** The post office: a balcony above the door, a red bench and a red postbox out front. */
const postOffice = machiya((palette, _plan, { front, bodyWidth }) => [
  ...balcony(palette, { front, width: bodyWidth * 0.45, y: PLINTH_HEIGHT + GROUND_FLOOR_HEIGHT + 0.16 }),
  ...bench(palette, -bodyWidth / 2 + 0.45, front + 0.3),
  ...postbox(palette, bodyWidth / 2 - 0.25, front + 0.28),
]);

/** A ball of cedar twigs hung by a sake brewer's door, under the eaves. */
function cedarBall(palette: Palette, x: number, { front, eaves }: HallFrame): THREE.Object3D[] {
  return [
    post(palette.of(COLOUR.cord), 0.012, 0.2, { x, z: front + 0.2, y: eaves - 0.22 }),
    placed(new THREE.IcosahedronGeometry(0.15, 1), palette.of(TOWN_COLOUR.cedar), { x, y: eaves - 0.36, z: front + 0.2 }),
  ];
}

/** A house in the town: a sake brewer's, with barrels by the door and a cedar ball under the eaves. */
const sakeHouse = machiya((palette, _plan, frame) => [
  ...barrels(palette, frame.bodyWidth / 2 - 0.3, frame.front + 0.28),
  ...cedarBall(palette, -frame.bodyWidth / 2 + 0.35, frame),
]);

/** A shop in the town: a bench for waiting customers and a potted bush by the door. */
const shop = machiya((palette, _plan, { front, bodyWidth }) => [
  ...bench(palette, -bodyWidth / 2 + 0.45, front + 0.3),
  ...pottedBush(palette, bodyWidth / 2 - 0.25, front + 0.3),
]);

/** How a ryokan stands: its walls' height (two full storeys), its roof's rise, and its upper floor: where the
 *  balcony's deck is, and how tall the paper windows behind it stand. */
const RYOKAN = { wallHeight: 2.6, rise: 1.0, balcony: 1.42, upperWindows: 0.62, porchDepth: 0.42, porchWidth: 1.9 } as const;
const ROUND_WINDOW = 0.3;

/** A round window: a paper disc framed in a ring of timber, its middle at (x, y). */
function roundWindow(palette: Palette, { x, y, front }: { x: number; y: number; front: number }): THREE.Object3D[] {
  return [
    placed(new THREE.CircleGeometry(ROUND_WINDOW, 16), palette.of(COLOUR.shoji), { x, y, z: front + 0.015 }),
    placed(new THREE.TorusGeometry(ROUND_WINDOW, 0.035, 4, 16), palette.of(COLOUR.timber), { x, y, z: front + 0.02 }),
  ];
}

/** A row of paper windows across the upper floor, framed in timber, `width` wide with their foot at `y`. */
function paperWindows(palette: Palette, { y, width, front }: { y: number; width: number; front: number }): THREE.Object3D[] {
  const panels = Math.max(2, Math.round(width / 0.45)), panelWidth = width / panels;
  return Array.from({ length: panels }, (_, panel) => {
    const x = -width / 2 + (panel + 0.5) * panelWidth;
    return [
      box(palette.of(COLOUR.shoji), { width: panelWidth - 0.06, height: RYOKAN.upperWindows, depth: 0.02 }, { x, y, z: front + 0.01 }),
      box(palette.of(COLOUR.lattice), { width: 0.025, height: RYOKAN.upperWindows, depth: 0.03 }, { x, y, z: front + 0.02 }),
      box(palette.of(COLOUR.lattice), { width: panelWidth - 0.06, height: 0.025, depth: 0.03 }, { x, y: y + RYOKAN.upperWindows / 2, z: front + 0.02 }),
    ];
  }).flat();
}

/** The curved porch over a ryokan's doors, on two posts, its gable face white with a gold crest. */
function porch(palette: Palette, front: number): THREE.Object3D[] {
  const { porchDepth: depth, porchWidth: width } = RYOKAN;
  const base = PLINTH_HEIGHT + GROUND_FLOOR_HEIGHT + 0.02;
  const shape = { span: width, length: depth + 0.1, rise: 0.32, base, thickness: 0.08 };
  const roof = curvedRoof(palette.of(SLATE), shape);
  roof.rotation.y = Math.PI / 2;
  roof.position.z = front + depth / 2;
  const face = gable(palette.of(COLOUR.plaster), shape, 0, 0.03);
  face.rotation.y = Math.PI / 2;
  face.position.z = front + depth - 0.04;
  return [
    roof, face,
    placed(new THREE.CircleGeometry(0.07, 10), palette.of(COLOUR.gold), { y: base + 0.12, z: front + depth - 0.02 }),
    ...[-1, 1].flatMap(side => [
      post(palette.of(COLOUR.timber), 0.05, base, { x: side * (width / 2 - 0.1), z: front + depth - 0.06 }),
      ...paperLantern(palette, COLOUR.lanternRed, { x: side * (width / 2 - 0.1), y: base - 0.08, z: front + depth + 0.04 }, 0.09),
    ]),
  ];
}

/** Steam rising from the hot spring behind the inn: soft white puffs, growing as they rise. */
function steam(x: number, z: number, from: number): THREE.Object3D[] {
  const vapour = new THREE.MeshStandardMaterial({ color: TOWN_COLOUR.steam, transparent: true, opacity: 0.55, flatShading: true, depthWrite: false });
  return [0, 1, 2].map(puff => placed(new THREE.IcosahedronGeometry(0.16 + puff * 0.07, 1), vapour, { x: x + puff * 0.08, y: from + puff * 0.32, z }));
}

/** The ryokan, the hot-spring inn: the grandest house in the village. */
const ryokan: BuildingBuilder = (palette, plan) => hall(palette, plan, {
  wallHeight: RYOKAN.wallHeight, rise: RYOKAN.rise, walls: COLOUR.planks, lowerWalls: COLOUR.plaster, timber: COLOUR.timber, roofs: SLATE,
  front: (palette, { width, depth, roof }, frame) => {
    const { front, bodyWidth, eaves } = frame;
    const doors = [-1, 1].map(side => {
      const door = shojiDoor(palette, front + 0.01);
      door.position.x = side * DOOR.width / 2;
      return door;
    });
    const balconyY = PLINTH_HEIGHT + RYOKAN.balcony;
    return [
      ...doors,
      emblemNoren(palette, roof, front),
      ...[-1, 1].flatMap(side => roundWindow(palette, { x: side * bodyWidth * 0.3, y: PLINTH_HEIGHT + 0.6, front })),
      pentRoof(palette, SLATE, frame, GROUND_FLOOR_HEIGHT),
      ...porch(palette, front),
      ...paperWindows(palette, { y: balconyY + 0.08, width: bodyWidth * 0.86, front }),
      ...balcony(palette, { front, width: bodyWidth * 0.9, y: balconyY }),
      ...[-0.36, -0.12, 0.12, 0.36].flatMap(share => paperLantern(palette, COLOUR.lanternWhite, { x: share * bodyWidth, y: eaves - 0.02, z: front + 0.3 }, 0.1)),
      box(palette.of(COLOUR.step), { width: 1.6, height: 0.09, depth: 0.3 }, { z: front + 0.25 }),
      stoneLantern(palette, -width / 2 + 0.25, front + 0.3),
      stoneLantern(palette, width / 2 - 0.25, front + 0.3),
      ...[-1, 1].flatMap(side => pottedBush(palette, side * (RYOKAN.porchWidth / 2 + 0.35), front + 0.3)),
      ...steam(-width / 2 + 0.9, -depth / 2 + 0.7, frame.ridgeTop - 0.3),
    ];
  },
});

/** The village's townhouses, by the look they're built for. */
export const TOWNHOUSE_BUILDERS: ReadonlyMap<BuildingLook, BuildingBuilder> = new Map<BuildingLook, BuildingBuilder>([
  ["home", home], ["post-office", postOffice], ["house", sakeHouse], ["bakery", shop], ["onsen", ryokan],
]);
