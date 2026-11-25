// The islands' people, built in code in the chibi style of the English island's models: the learner's traveller,
// dressed as they chose in the wardrobe, and the island cast. Each is a rig of a body and four limbs that swing as
// they walk and run, and breathe as they stand.
import * as THREE from "three";
import type { Direction, Vector } from "../../../lib/errands/movement.ts";
import { ACCESSORIES, HAIR_COLOURS, OUTFITS, SASHES, SKIN_TONES } from "../../../lib/travellerLook.ts";
import type { TravellerLook } from "../../../lib/travellerLook.ts";
import { Turning } from "../walkers.ts";
import type { IslandWalker, Motion } from "../walkers.ts";
import { box, post } from "./shapes.ts";
import type { Palette } from "./shapes.ts";

/** What swings: legs forward and back; arms forward and back, or (a bird's wings) out to the sides. */
export type Rig = {
  root: THREE.Group; body: THREE.Object3D;
  leftLeg: THREE.Object3D; rightLeg: THREE.Object3D; leftArm: THREE.Object3D; rightArm: THREE.Object3D;
  armSwing: "forward" | "outward";
};

/** How a motion moves the rig: steps a second, how far limbs swing (radians), how high the body bobs (tiles). */
type Gait = { stepsPerSecond: number; legSwing: number; armSwing: number; bob: number };
const GAITS: Readonly<Record<Motion, Gait>> = {
  idle: { stepsPerSecond: 0.6, legSwing: 0, armSwing: 0.04, bob: 0.012 },
  walk: { stepsPerSecond: 1.9, legSwing: 0.55, armSwing: 0.5, bob: 0.04 },
  run: { stepsPerSecond: 2.6, legSwing: 0.85, armSwing: 0.8, bob: 0.07 },
};
/** How fast one gait blends into the next, as a share of the way each second. */
const BLEND_PER_SECOND = 8;

const blend = (from: Gait, to: Gait, amount: number): Gait => ({
  stepsPerSecond: THREE.MathUtils.lerp(from.stepsPerSecond, to.stepsPerSecond, amount),
  legSwing: THREE.MathUtils.lerp(from.legSwing, to.legSwing, amount),
  armSwing: THREE.MathUtils.lerp(from.armSwing, to.armSwing, amount),
  bob: THREE.MathUtils.lerp(from.bob, to.bob, amount),
});

/** A person built in code: their rig, swung by the gait of what they're doing. */
export class BuiltPerson implements IslandWalker {
  readonly root: THREE.Group;
  private readonly rig: Rig;
  private readonly turning: Turning;
  private readonly bodyHeight: number;
  private wanted: Gait = GAITS.idle;
  private gait: Gait = GAITS.idle;
  private phase = 0;

  constructor(rig: Rig) {
    this.rig = rig;
    this.root = rig.root;
    this.bodyHeight = rig.body.position.y;
    this.turning = new Turning(this.root);
  }

  play(motion: Motion): void {
    this.wanted = GAITS[motion];
  }

  standAt(position: Vector, facing: Direction): void {
    this.root.position.set(position.x, 0, position.y);
    this.turning.want(facing);
  }

  faceAtOnce(facing: Direction): void {
    this.turning.faceAtOnce(facing);
  }

  update(seconds: number): void {
    this.turning.update(seconds);
    this.gait = blend(this.gait, this.wanted, Math.min(1, seconds * BLEND_PER_SECOND));
    this.phase += seconds * this.gait.stepsPerSecond * Math.PI;
    const swing = Math.sin(this.phase);
    const { leftLeg, rightLeg, leftArm, rightArm, body, armSwing } = this.rig;
    leftLeg.rotation.x = swing * this.gait.legSwing;
    rightLeg.rotation.x = -swing * this.gait.legSwing;
    if (armSwing === "forward") {
      leftArm.rotation.x = -swing * this.gait.armSwing;
      rightArm.rotation.x = swing * this.gait.armSwing;
    } else {
      leftArm.rotation.z = -Math.abs(swing) * this.gait.armSwing;
      rightArm.rotation.z = Math.abs(swing) * this.gait.armSwing;
    }
    body.position.y = this.bodyHeight + Math.abs(Math.cos(this.phase)) * this.gait.bob;
  }
}

/** A limb hanging from a joint at `joint`: a pivot to swing, with the limb's parts hung below it. */
function limb(joint: { x: number; y: number; z?: number }, ...parts: THREE.Object3D[]): THREE.Group {
  const pivot = new THREE.Group().add(...parts);
  pivot.position.set(joint.x, joint.y, joint.z ?? 0);
  return pivot;
}

function sphere(material: THREE.Material, radius: number, at: { x?: number; y?: number; z?: number }, detail = 1): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), material);
  mesh.position.set(at.x ?? 0, at.y ?? 0, at.z ?? 0);
  return mesh;
}

const INK = "#1d1a18";
const ROSY = "#f08f8f";
const SANDAL = "#c9a46a";
const STRAW = "#d9b56f";
const HEADBAND = "#f4efe4";
const LANTERN_PAPER = "#ffe2a0";
const FAN = "#f3e2c0";

const EYE_SHINE = "#ffffff";
/** Where on a head (as a direction from its middle) each eye sits, and the rosy cheeks below them. */
const EYE_DIRECTION = { x: 0.36, y: -0.06, z: 0.93 } as const;
const CHEEK_DIRECTION = { x: 0.55, y: -0.32, z: 0.78 } as const;

/** A point on the surface of a head of `radius` centred at height `y`, in a direction from its middle. */
const onHead = (y: number, radius: number, direction: { x: number; y: number; z: number }, side: number) => {
  const point = new THREE.Vector3(side * direction.x, direction.y, direction.z).normalize().multiplyScalar(radius);
  return { x: point.x, y: y + point.y, z: point.z };
};

/** Two oval eyes on the front of a head, each with a glint of light. */
function eyes(palette: Palette, y: number, radius: number): THREE.Object3D[] {
  return [-1, 1].flatMap(side => {
    const at = onHead(y, radius, EYE_DIRECTION, side);
    const eye = sphere(palette.of(INK), radius * 0.12, at, 1);
    eye.scale.set(0.8, 1.15, 0.45);
    const shine = sphere(palette.of(EYE_SHINE), radius * 0.035, { x: at.x + side * radius * 0.02, y: at.y + radius * 0.05, z: at.z + radius * 0.04 }, 0);
    return [eye, shine];
  });
}

/** Rosy cheeks below the eyes. */
function rosyCheeks(palette: Palette, y: number, radius: number): THREE.Object3D[] {
  return [-1, 1].map(side => {
    const cheek = sphere(palette.of(ROSY), radius * 0.13, onHead(y, radius, CHEEK_DIRECTION, side), 1);
    cheek.scale.set(1, 0.6, 0.35);
    return cheek;
  });
}

/** What the traveller carries, by their look. */
function carried(palette: Palette, accessory: keyof typeof ACCESSORIES, sash: string): { back: THREE.Object3D[]; hand: THREE.Object3D[] } {
  if (accessory === "bundle") return { back: [sphere(palette.of(sash), 0.2, { y: 0.78, z: -0.27 })], hand: [] };
  if (accessory === "fan") {
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.17, 6, 0, Math.PI), palette.of(FAN));
    fan.position.set(0, -0.42, 0.08);
    fan.rotation.x = -Math.PI / 2.5;
    return { back: [], hand: [fan] };
  }
  if (accessory === "lantern") {
    const light = new THREE.MeshStandardMaterial({ color: LANTERN_PAPER, emissive: LANTERN_PAPER, emissiveIntensity: 0.7, flatShading: true });
    return { back: [], hand: [post(light, 0.09, 0.2, { x: 0, z: 0.05, y: -0.62 })] };
  }
  return { back: [], hand: [] };
}

/** The learner's traveller, as dressed in the wardrobe: a kimono with its obi sash, hair, a hat or headband, and
 *  what they carry. About one and a half tiles tall, like the English island's people. */
export function travellerRig(palette: Palette, look: TravellerLook): Rig {
  const kimono = palette.of(OUTFITS[look.outfit].colour);
  const skin = palette.of(SKIN_TONES[look.skin].colour);
  const hair = palette.of(HAIR_COLOURS[look.hair].colour);
  const sash = SASHES[look.sash].colour;
  const { back, hand } = carried(palette, look.accessory, sash);
  const headY = 1.12, headRadius = 0.33;

  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.29, 0.56, 8), kimono);
  robe.position.y = 0.6;
  // A cap of hair over the top, tipped back so the face shows under its fringe, and hair down the back of the head.
  const scalp = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), hair);
  scalp.position.set(0, headY, 0);
  scalp.rotation.x = -0.35;
  const backHair = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.04, 18, 10, Math.PI, Math.PI, 0, Math.PI * 0.72), hair);
  backHair.position.set(0, headY, -0.01);
  const hat = look.hat === "kasa"
    ? [new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.24, 10), palette.of(STRAW)).translateY(headY + headRadius + 0.06)]
    : look.hat === "hachimaki"
      ? [new THREE.Mesh(new THREE.TorusGeometry(headRadius * 1.02, 0.035, 4, 12).rotateX(Math.PI / 2), palette.of(HEADBAND)).translateY(headY + 0.1)]
      : [];
  const body = new THREE.Group().add(
    robe,
    post(palette.of(sash), 0.25, 0.1, { x: 0, z: 0, y: 0.6 }),
    sphere(skin, headRadius, { y: headY }),
    scalp,
    backHair,
    sphere(hair, 0.11, { y: headY + 0.24, z: -0.24 }, 0),
    ...eyes(palette, headY, headRadius),
    ...(look.cheeks === "rosy" ? rosyCheeks(palette, headY, headRadius) : []),
    ...hat,
    ...back,
  );
  const sleeve = (extra: THREE.Object3D[]) => [post(kimono, 0.075, 0.34, { x: 0, z: 0, y: -0.34 }), sphere(skin, 0.07, { y: -0.4 }, 0), ...extra];
  const leftArm = limb({ x: -0.26, y: 0.82 }, ...sleeve([]));
  const rightArm = limb({ x: 0.26, y: 0.82 }, ...sleeve(hand));
  body.add(leftArm, rightArm);
  const leg = () => [post(kimono, 0.08, 0.3, { x: 0, z: 0, y: -0.32 }), box(palette.of(SANDAL), { width: 0.13, height: 0.05, depth: 0.2 }, { y: -0.34, z: 0.03 })];
  const leftLeg = limb({ x: -0.11, y: 0.34 }, ...leg());
  const rightLeg = limb({ x: 0.11, y: 0.34 }, ...leg());
  const root = new THREE.Group().add(body, leftLeg, rightLeg);
  return { root, body, leftLeg, rightLeg, leftArm, rightArm, armSwing: "forward" };
}

const SPARROW = { cap: "#8a5a36", face: "#f6efe2", belly: "#efe3cc", wing: "#7a5233", patch: "#2a2420", beak: "#4a3426", legs: "#a0744a" } as const;

/** Chun, the kana sparrow: a round brown-capped sparrow with black cheek patches, standing a little over a tile tall
 *  on thin legs, wings for arms. */
export function chunRig(palette: Palette): Rig {
  const headY = 0.95, headRadius = 0.32;
  const belly = sphere(palette.of(SPARROW.belly), 0.33, { y: 0.55 });
  belly.scale.set(1, 1.1, 0.95);
  const back = sphere(palette.of(SPARROW.cap), 0.34, { y: 0.57, z: -0.06 });
  back.scale.set(1, 1.05, 0.9);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.04, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), palette.of(SPARROW.cap));
  cap.position.set(0, headY + 0.02, -0.02);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4).rotateX(Math.PI / 2), palette.of(SPARROW.beak));
  beak.position.set(0, headY - 0.06, headRadius + 0.04);
  // The black patches on a sparrow's cheeks lie on the sides of its head, behind its eyes; its bib is under its beak.
  const patches = [-1, 1].map(side => {
    const patch = sphere(palette.of(SPARROW.patch), 0.08, { x: side * headRadius * 0.93, y: headY - 0.06, z: headRadius * 0.12 }, 1);
    patch.scale.set(0.3, 1, 0.8);
    return patch;
  });
  const bib = sphere(palette.of(SPARROW.patch), 0.06, { y: headY - headRadius * 0.92, z: headRadius * 0.62 }, 1);
  bib.scale.set(1.2, 0.6, 0.5);
  const tail = box(palette.of(SPARROW.wing), { width: 0.22, height: 0.05, depth: 0.3 }, { y: 0.45, z: -0.42 });
  tail.rotation.x = 0.5;
  const body = new THREE.Group().add(belly, back, sphere(palette.of(SPARROW.face), headRadius, { y: headY }), cap, beak, ...patches, bib, tail,
    ...eyes(palette, headY + 0.02, headRadius));
  const wing = (side: number) => {
    const feathers = sphere(palette.of(SPARROW.wing), 0.2, { x: side * 0.06, y: -0.2 });
    feathers.scale.set(0.35, 1, 0.8);
    return limb({ x: side * 0.33, y: 0.72 }, feathers);
  };
  const leftArm = wing(-1), rightArm = wing(1);
  body.add(leftArm, rightArm);
  const leg = () => [post(palette.of(SPARROW.legs), 0.025, 0.25, { x: 0, z: 0, y: -0.25 }), box(palette.of(SPARROW.legs), { width: 0.12, height: 0.03, depth: 0.14 }, { y: -0.26, z: 0.04 })];
  const leftLeg = limb({ x: -0.1, y: 0.26 }, ...leg());
  const rightLeg = limb({ x: 0.1, y: 0.26 }, ...leg());
  const root = new THREE.Group().add(body, leftLeg, rightLeg);
  return { root, body, leftLeg, rightLeg, leftArm, rightArm, armSwing: "outward" };
}

const CALICO = { fur: "#fbf7ef", ginger: "#e0904a", dark: "#3d332d", nose: "#f2a0a8", collar: "#c8452f", bell: "#e6b94a", inner: "#f6c4c4" } as const;

/** Tama, the practice cat: a round white calico, a ginger patch over one ear and a dark one over the other, a red
 *  collar with a gold bell, and a tail curling up behind; about a tile tall, walking on her hind legs. */
export function tamaRig(palette: Palette): Rig {
  const headY = 0.86, headRadius = 0.34;
  const fur = palette.of(CALICO.fur);
  const torso = sphere(fur, 0.27, { y: 0.45 });
  torso.scale.set(1, 1.1, 0.9);
  const head = sphere(fur, headRadius, { y: headY });
  head.scale.set(1.08, 0.92, 1);
  // The patches lie on the head's crown, one each side towards the back, like a calico's, clear of the eyes. (A
  // sphere's segments start at its west side and go round by the front, so the east-back quarter starts at 0.9π.)
  const patch = (colour: string, side: number) => {
    const shape = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.03, 14, 8, side > 0 ? Math.PI * 0.9 : Math.PI * 1.4, Math.PI * 0.7, 0, Math.PI * 0.38), palette.of(colour));
    shape.position.set(0, headY + 0.01, -0.01);
    shape.scale.set(1.08, 0.92, 1);
    return shape;
  };
  const ear = (colour: string, side: number) => {
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 4), palette.of(colour));
    outer.position.set(side * 0.2, headY + 0.3, -0.02);
    outer.rotation.z = -side * 0.35;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), palette.of(CALICO.inner));
    inner.position.set(side * 0.19, headY + 0.28, 0.03);
    inner.rotation.z = -side * 0.35;
    return [outer, inner];
  };
  const muzzle = sphere(fur, 0.12, { y: headY - 0.1, z: headRadius * 0.82 });
  muzzle.scale.set(1.3, 0.75, 0.6);
  const nose = sphere(palette.of(CALICO.nose), 0.035, { y: headY - 0.06, z: headRadius * 0.98 }, 0);
  const whiskers = [-1, 1].flatMap(side => [-0.03, 0.02].map(dy => {
    const whisker = box(palette.of(CALICO.dark), { width: 0.2, height: 0.008, depth: 0.008 }, { x: side * 0.26, y: headY - 0.1 + dy, z: headRadius * 0.7 });
    whisker.rotation.z = side * dy * 4;
    return whisker;
  }));
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 5, 14).rotateX(Math.PI / 2), palette.of(CALICO.collar));
  collar.position.y = 0.66;
  const bell = sphere(palette.of(CALICO.bell), 0.055, { y: 0.6, z: 0.21 }, 1);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 5, 10, Math.PI * 1.2), palette.of(CALICO.ginger));
  tail.position.set(0.05, 0.42, -0.3);
  tail.rotation.set(0, Math.PI / 2, -0.4);
  const body = new THREE.Group().add(torso, head, patch(CALICO.ginger, -1), patch(CALICO.dark, 1), ...ear(CALICO.ginger, -1), ...ear(CALICO.dark, 1),
    muzzle, nose, ...whiskers, collar, bell, tail, ...eyes(palette, headY + 0.02, headRadius));
  const paw = (side: number) => limb({ x: side * 0.24, y: 0.55 }, post(fur, 0.06, 0.2, { x: 0, z: 0.02, y: -0.2 }), sphere(fur, 0.07, { y: -0.22, z: 0.03 }, 0));
  const leftArm = paw(-1), rightArm = paw(1);
  body.add(leftArm, rightArm);
  const leg = () => [post(fur, 0.07, 0.16, { x: 0, z: 0, y: -0.18 }), sphere(fur, 0.085, { y: -0.19, z: 0.04 }, 0)];
  const leftLeg = limb({ x: -0.12, y: 0.2 }, ...leg());
  const rightLeg = limb({ x: 0.12, y: 0.2 }, ...leg());
  const root = new THREE.Group().add(body, leftLeg, rightLeg);
  return { root, body, leftLeg, rightLeg, leftArm, rightArm, armSwing: "forward" };
}
