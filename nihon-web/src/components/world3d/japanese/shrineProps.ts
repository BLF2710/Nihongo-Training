// The shrine pieces standing about the islands, built in code (our own designs, low-poly like the buildings): torii
// gates, tall stone lanterns, a pair of guardian lion-dogs, a taiko drum on its stand, a roofed water basin, a rack of
// prayer boards, a little wayside shrine, a bell tower and a roofed gateway. Each is built facing south on the ground
// it's given (as wide across its front as `width`), so a gate spans its ground from pillar to pillar.
import * as THREE from "three";
import type { ShrinePropKind } from "../../../lib/world/islandProps.ts";
import { box, curvedRoof, post } from "./shapes.ts";
import type { Palette, RoofShape } from "./shapes.ts";

/** The ground a piece stands on, in tiles, as it faces: across its front, and from front to back. */
export type PropGround = { width: number; depth: number };
export type PropBuilder = (palette: Palette, ground: PropGround) => THREE.Group;

const COLOUR = {
  vermilion: "#c8452f", black: "#2b2624", stone: "#bdb7aa", stoneDark: "#9e988b", wood: "#8a6440", darkWood: "#5a3b28",
  roof: "#474c55", copper: "#5d9b86", gold: "#d4a64a", water: "#7cc4d4", light: "#ffd98a", drum: "#9a4b2a",
  drumHead: "#efe3c6", boards: "#e6c891", paper: "#fbf8f0", rope: "#e2d6b4", bell: "#5f6e52", lantern: "#d8402f",
} as const;

/** A glowing material: lantern light, or a paper lantern lit from inside. */
const glowing = (colour: string, intensity: number) =>
  new THREE.MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: intensity, flatShading: true });

/** A mesh of `geometry` at a point. */
function placed(geometry: THREE.BufferGeometry, material: THREE.Material, at: { x?: number; y?: number; z?: number }): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(at.x ?? 0, at.y ?? 0, at.z ?? 0);
  return mesh;
}

/** A great torii's height (a small one, on a single tile, stands at `small`) and how thick its parts are at that size. */
const TORII = { height: 2.15, small: 0.95, pillar: 0.1, beam: 0.11 } as const;

/** A torii: two vermilion pillars on black feet, a tie beam through them and a black top beam whose ends sweep up,
 *  with a plaque between the beams. Its pillars stand in the middle of the end tiles of its ground. */
const torii: PropBuilder = (palette, { width }) => {
  const height = width >= 2 ? TORII.height : TORII.small;
  const scale = height / TORII.height;
  const red = palette.of(COLOUR.vermilion), black = palette.of(COLOUR.black);
  const apart = Math.max(width / 2 - 0.5, 0.3);
  const group = new THREE.Group();
  for (const side of [-1, 1]) {
    group.add(placed(new THREE.CylinderGeometry(TORII.pillar * scale * 0.85, TORII.pillar * scale, height - 0.25 * scale, 8), red, { x: side * apart, y: (height - 0.25 * scale) / 2 }));
    group.add(post(black, TORII.pillar * scale * 1.25, 0.16 * scale, { x: side * apart, z: 0 }));
  }
  const beam = TORII.beam * scale;
  group.add(
    box(red, { width: 2 * apart + 0.45 * scale, height: beam * 0.8, depth: beam * 0.7 }, { y: height * 0.7 }),
    box(red, { width: 2 * apart + 0.6 * scale, height: beam, depth: beam * 1.1 }, { y: height - 0.3 * scale }),
    box(black, { width: 2 * apart + 0.5 * scale, height: beam * 1.1, depth: beam * 1.5 }, { y: height - 0.3 * scale + beam }),
    box(red, { width: 0.08 * scale, height: height * 0.3 - 0.3 * scale, depth: beam * 0.6 }, { y: height * 0.7 }),
    box(black, { width: 0.32 * scale, height: 0.36 * scale, depth: 0.05 }, { y: height * 0.72, z: beam * 0.4 }),
    box(palette.of(COLOUR.gold), { width: 0.24 * scale, height: 0.28 * scale, depth: 0.02 }, { y: height * 0.72 + 0.04 * scale, z: beam * 0.4 + 0.025 }),
  );
  // The top beam's ends sweep up and out, as a torii's do.
  for (const side of [-1, 1]) {
    const end = box(black, { width: 0.3 * scale, height: beam * 1.1, depth: beam * 1.5 });
    end.position.set(side * (apart + 0.33 * scale), height - 0.3 * scale + beam * 1.4 + 0.03 * scale, 0);
    end.rotation.z = side * 0.22;
    group.add(end);
  }
  return group;
};

/** A tall stone lantern: a hexagonal foot, a post, a lit firebox and a flared six-sided roof with a jewel on top. */
const stoneLantern: PropBuilder = palette => {
  const stone = palette.of(COLOUR.stone), dark = palette.of(COLOUR.stoneDark);
  return new THREE.Group().add(
    placed(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 6), dark, { y: 0.05 }),
    placed(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 6), stone, { y: 0.15 }),
    placed(new THREE.CylinderGeometry(0.075, 0.09, 0.42, 8), stone, { y: 0.41 }),
    placed(new THREE.CylinderGeometry(0.24, 0.16, 0.08, 6), stone, { y: 0.66 }),
    placed(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 6), glowing(COLOUR.light, 0.7), { y: 0.81 }),
    ...[0, 1, 2, 3, 4, 5].map(corner => post(dark, 0.025, 0.22, { x: Math.cos(corner * Math.PI / 3) * 0.15, z: Math.sin(corner * Math.PI / 3) * 0.15, y: 0.7 })),
    placed(new THREE.CylinderGeometry(0.06, 0.32, 0.18, 6), stone, { y: 1.01 }),
    placed(new THREE.DodecahedronGeometry(0.065), stone, { y: 1.15 }),
  );
};

/** A guardian lion-dog sitting up on a stone plinth: haunches, chest, front legs, a curly-maned head and a curled tail. */
const komainu: PropBuilder = palette => {
  const stone = palette.of(COLOUR.stone), dark = palette.of(COLOUR.stoneDark);
  const top = 0.32;
  const sphere = (radius: number, at: { x?: number; y: number; z?: number }) => placed(new THREE.IcosahedronGeometry(radius, 1), stone, at);
  const chest = sphere(0.15, { y: top + 0.22, z: 0.04 });
  chest.scale.set(1, 1.3, 0.9);
  const head = sphere(0.14, { y: top + 0.46, z: 0.08 });
  const snout = box(stone, { width: 0.13, height: 0.08, depth: 0.08 }, { y: top + 0.4, z: 0.2 });
  const mane = [-1, -0.5, 0, 0.5, 1].map(share => placed(new THREE.DodecahedronGeometry(0.07), stone, { x: share * 0.13, y: top + 0.48 + (1 - Math.abs(share)) * 0.07, z: -0.03 }));
  const eyes = [-1, 1].map(side => placed(new THREE.IcosahedronGeometry(0.022, 0), palette.of(COLOUR.black), { x: side * 0.055, y: top + 0.49, z: 0.21 }));
  const legs = [-1, 1].map(side => post(stone, 0.04, 0.22, { x: side * 0.08, z: 0.12, y: top }));
  return new THREE.Group().add(
    box(dark, { width: 0.6, height: 0.1, depth: 0.6 }),
    box(stone, { width: 0.5, height: top - 0.1, depth: 0.5 }, { y: 0.1 }),
    sphere(0.16, { y: top + 0.12, z: -0.1 }),
    chest, head, snout, ...mane, ...eyes, ...legs,
    sphere(0.08, { y: top + 0.3, z: -0.24 }),
  );
};

/** A taiko drum on its stand, its face to the front: a bulging red-brown barrel, pale heads painted with three
 *  commas, and a ring of gold studs round each rim. */
const taiko: PropBuilder = palette => {
  const centre = 0.6, radius = 0.3, length = 0.38;
  const barrelProfile = [0, 0.25, 0.5, 0.75, 1].map(share => new THREE.Vector2(radius * (0.9 + 0.12 * Math.sin(share * Math.PI)), (share - 0.5) * length));
  const barrel = placed(new THREE.LatheGeometry(barrelProfile, 16).rotateX(Math.PI / 2), palette.of(COLOUR.drum), { y: centre });
  const group = new THREE.Group().add(barrel);
  const ink = palette.of(COLOUR.black), gold = palette.of(COLOUR.gold);
  for (const face of [-1, 1]) {
    const z = face * length / 2;
    const head = placed(new THREE.CircleGeometry(radius * 0.92, 18), palette.of(COLOUR.drumHead), { y: centre, z: z + face * 0.002 });
    if (face < 0) head.rotation.y = Math.PI;
    group.add(head);
    for (let stud = 0; stud < 14; stud += 1) {
      const angle = (stud / 14) * Math.PI * 2;
      group.add(placed(new THREE.IcosahedronGeometry(0.018, 0), gold, { x: Math.cos(angle) * radius * 0.95, y: centre + Math.sin(angle) * radius * 0.95, z }));
    }
  }
  // Three commas swirling round the middle of the front head.
  for (let comma = 0; comma < 3; comma += 1) {
    const angle = (comma / 3) * Math.PI * 2;
    const blob = placed(new THREE.CircleGeometry(0.06, 10), ink, { x: Math.cos(angle) * 0.08, y: centre + Math.sin(angle) * 0.08, z: length / 2 + 0.006 });
    const tail = placed(new THREE.CircleGeometry(0.035, 8), ink, { x: Math.cos(angle + 0.7) * 0.13, y: centre + Math.sin(angle + 0.7) * 0.13, z: length / 2 + 0.006 });
    group.add(blob, tail);
  }
  const wood = palette.of(COLOUR.darkWood);
  group.add(box(wood, { width: 0.9, height: 0.08, depth: 0.4 }));
  for (const side of [-1, 1]) {
    group.add(box(wood, { width: 0.08, height: centre + 0.05, depth: 0.12 }, { x: side * (radius + 0.06), y: 0.08 }));
  }
  return group;
};

/** A water basin under a little copper-green roof on four vermilion posts, with bamboo ladles laid across it. */
const temizuya: PropBuilder = (palette, { width, depth }) => {
  const red = palette.of(COLOUR.vermilion), stone = palette.of(COLOUR.stone);
  const eaves = 1.15;
  const roofShape: RoofShape = { span: depth - 0.05, length: width - 0.1, rise: 0.35, base: eaves, thickness: 0.08 };
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stoneDark), { width: width - 0.4, height: 0.06, depth: depth - 0.25 }),
    box(stone, { width: 1.0, height: 0.42, depth: 0.42 }, { y: 0.06 }),
    box(palette.of(COLOUR.water), { width: 0.88, height: 0.02, depth: 0.3 }, { y: 0.46 }),
    curvedRoof(palette.of(COLOUR.copper), roofShape),
    box(palette.of(COLOUR.black), { width: width - 0.2, height: 0.08, depth: 0.12 }, { y: eaves + 0.3 }),
  );
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) group.add(post(red, 0.045, eaves + 0.05, { x: x * (width / 2 - 0.3), z: z * (depth / 2 - 0.2) }));
  }
  for (const x of [-0.25, 0, 0.25]) {
    const ladle = box(palette.of("#9cc45a"), { width: 0.03, height: 0.02, depth: 0.5 }, { x, y: 0.48 });
    ladle.rotation.y = 0.3;
    group.add(ladle, placed(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), palette.of("#9cc45a"), { x: x + 0.07, y: 0.51, z: 0.2 }));
  }
  return group;
};

/** A rack of wooden prayer boards: two posts under a little gabled roof, boards hanging along two rails. */
const emaRack: PropBuilder = palette => {
  const wood = palette.of(COLOUR.darkWood), boards = palette.of(COLOUR.boards);
  const height = 1.0;
  const group = new THREE.Group();
  for (const side of [-1, 1]) {
    group.add(post(wood, 0.035, height, { x: side * 0.38, z: 0 }));
    const slope = box(wood, { width: 0.95, height: 0.03, depth: 0.22 }, { y: height + 0.04, z: side * 0.08 });
    slope.rotation.x = side * 0.55;
    group.add(slope);
  }
  for (const [rail, y] of [0.55, 0.8].entries()) {
    group.add(box(wood, { width: 0.82, height: 0.03, depth: 0.03 }, { y }));
    for (let board = 0; board < 6; board += 1) {
      const plaque = box(boards, { width: 0.1, height: 0.08, depth: 0.015 }, { x: -0.3 + board * 0.12, y: y - 0.1, z: 0.025 });
      plaque.rotation.z = ((board + rail) % 3 - 1) * 0.12;
      group.add(plaque);
    }
  }
  return group;
};

/** A little wayside shrine: a wooden house on a stone base under a dark roof, a sacred rope with paper streamers
 *  across its doors. */
const hokora: PropBuilder = palette => {
  const eaves = 0.62;
  const roofShape: RoofShape = { span: 0.72, length: 0.78, rise: 0.26, base: eaves, thickness: 0.06 };
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stoneDark), { width: 0.74, height: 0.1, depth: 0.66 }),
    box(palette.of(COLOUR.stone), { width: 0.6, height: 0.08, depth: 0.52 }, { y: 0.1 }),
    box(palette.of(COLOUR.wood), { width: 0.48, height: eaves - 0.18, depth: 0.4 }, { y: 0.18 }),
    box(palette.of(COLOUR.vermilion), { width: 0.3, height: 0.3, depth: 0.02 }, { y: 0.22, z: 0.2 }),
    curvedRoof(palette.of(COLOUR.roof), roofShape),
    box(palette.of(COLOUR.rope), { width: 0.5, height: 0.04, depth: 0.04 }, { y: eaves - 0.1, z: 0.22 }),
  );
  for (const x of [-0.15, 0, 0.15]) group.add(box(palette.of(COLOUR.paper), { width: 0.04, height: 0.1, depth: 0.01 }, { x, y: eaves - 0.2, z: 0.235 }));
  return group;
};

/** The outline of a temple bell, from its lip up to its crown, turned round to make it. */
const BELL_PROFILE = [[0.33, 0], [0.31, 0.06], [0.27, 0.2], [0.26, 0.5], [0.22, 0.66], [0.12, 0.72], [0.05, 0.8], [0, 0.82]] as const;

/** A bell tower: a great bronze bell hanging under a dark hipped roof on four vermilion posts, a log hung beside it
 *  to strike it with, on a stone base. */
const bellTower: PropBuilder = (palette, { width }) => {
  const red = palette.of(COLOUR.vermilion);
  const base = 0.3, posts = 1.75, apart = width * 0.27;
  const roofWidth = width * 0.5 + 0.55;
  const roof = placed(new THREE.CylinderGeometry(roofWidth * 0.22, roofWidth * Math.SQRT1_2 * 1.05, 0.7, 4).rotateY(Math.PI / 4), palette.of(COLOUR.roof),
    { y: base + posts + 0.35 });
  const bellShape = BELL_PROFILE.map(([radius, height]) => new THREE.Vector2(radius, height));
  const bellTop = base + posts - 0.15;
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.stone), { width: width * 0.75, height: base, depth: width * 0.75 }),
    box(red, { width: 2 * apart + 0.15, height: 0.12, depth: 2 * apart + 0.15 }, { y: base + posts - 0.12 }),
    roof,
    box(palette.of(COLOUR.roof), { width: roofWidth * 0.4, height: 0.12, depth: 0.14 }, { y: base + posts + 0.7 }),
    placed(new THREE.LatheGeometry(bellShape, 14), palette.of(COLOUR.bell), { y: bellTop - 0.82 }),
    post(palette.of(COLOUR.black), 0.02, 0.12, { x: 0, z: 0, y: bellTop - 0.02 }),
    placed(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8).rotateZ(Math.PI / 2), palette.of(COLOUR.wood), { x: 0.75, y: bellTop - 0.5 }),
  );
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) group.add(post(red, 0.07, posts, { x: x * apart, z: z * apart, y: base }));
    group.add(post(palette.of(COLOUR.rope), 0.01, 0.5, { x: 0.75 + x * 0.25, z: 0, y: bellTop - 0.5 }));
  }
  return group;
};

/** A roofed gateway: two heavy dark posts carrying a little tiled roof, its doors swung open against them, red paper
 *  lanterns hanging under the beam. Its posts stand in the middle of the end tiles of its ground. */
const gateway: PropBuilder = (palette, { width }) => {
  const wood = palette.of(COLOUR.darkWood);
  const apart = width / 2 - 0.5, height = 1.95;
  const roofShape: RoofShape = { span: 0.95, length: 2 * apart + 0.9, rise: 0.38, base: height + 0.1, thickness: 0.1 };
  const group = new THREE.Group().add(
    box(wood, { width: 2 * apart + 0.4, height: 0.16, depth: 0.22 }, { y: height - 0.06 }),
    box(wood, { width: 2 * apart + 0.2, height: 0.1, depth: 0.16 }, { y: height - 0.35 }),
    curvedRoof(palette.of(COLOUR.roof), roofShape),
    box(palette.of(COLOUR.black), { width: 2 * apart + 0.6, height: 0.09, depth: 0.14 }, { y: height + 0.43 }),
  );
  for (const side of [-1, 1]) {
    group.add(
      box(palette.of(COLOUR.stoneDark), { width: 0.34, height: 0.1, depth: 0.34 }, { x: side * apart }),
      box(wood, { width: 0.2, height: height + 0.1, depth: 0.2 }, { x: side * apart }),
      box(palette.of(COLOUR.wood), { width: 0.05, height: 1.45, depth: 0.45 }, { x: side * (apart - 0.16), y: 0.12, z: -0.25 }),
    );
    const lantern = placed(new THREE.SphereGeometry(0.13, 10, 8), glowing(COLOUR.lantern, 0.35), { x: side * (apart - 0.5), y: height - 0.62, z: 0.05 });
    lantern.scale.set(1, 1.3, 1);
    group.add(lantern, post(palette.of(COLOUR.black), 0.01, 0.12, { x: side * (apart - 0.5), z: 0.05, y: height - 0.47 }));
  }
  return group;
};

export const PROP_BUILDERS: ReadonlyMap<ShrinePropKind, PropBuilder> = new Map<ShrinePropKind, PropBuilder>([
  ["torii", torii], ["stone-lantern", stoneLantern], ["komainu", komainu], ["taiko", taiko], ["temizuya", temizuya],
  ["ema-rack", emaRack], ["hokora", hokora], ["bell-tower", bellTower], ["gate", gateway],
]);
