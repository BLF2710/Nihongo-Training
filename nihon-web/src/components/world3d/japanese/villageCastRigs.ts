// The rest of the village square's cast, built in code in the same chibi style as the traveller: Kon the shrine fox,
// Hakase the professor owl, Tsuru the calligrapher crane, Hato the carrier pigeon and Momo the onsen monkey. Each is a
// rig of a body and four limbs, swung by `BuiltPerson`; the birds' arms are wings, flapped out to the sides.
import * as THREE from "three";
import { box, post } from "./shapes.ts";
import type { Palette } from "./shapes.ts";
import { arms, legs, rig } from "./castRigs.ts";
import { EYE_DIRECTION, eyes, limb, onHead, sphere } from "./people.ts";
import type { Rig } from "./people.ts";

/** A bird's rig: wings for arms, hung from the body, flapped out to the sides as it walks. */
function birdRig(body: THREE.Group, wings: { leftArm: THREE.Group; rightArm: THREE.Group }, feet: { leftLeg: THREE.Group; rightLeg: THREE.Group }): Rig {
  body.add(wings.leftArm, wings.rightArm);
  return { body, ...wings, ...feet, root: new THREE.Group().add(body, feet.leftLeg, feet.rightLeg), armSwing: "outward" };
}

/** A wing of `colour` (its tip `tip`, if it has one) hung from the shoulder on one `side`, with `held` in it. */
function wing(palette: Palette, { colour, tip }: { colour: string; tip?: string }, shoulder: { x: number; y: number }, held: THREE.Object3D[] = []): THREE.Group {
  const feathers = sphere(palette.of(colour), 0.2, { x: Math.sign(shoulder.x) * 0.05, y: -0.2 });
  feathers.scale.set(0.35, 1, 0.8);
  const ends = tip ? [sphere(palette.of(tip), 0.1, { x: Math.sign(shoulder.x) * 0.06, y: -0.36, z: -0.04 })] : [];
  for (const end of ends) end.scale.set(0.35, 1, 0.8);
  return limb(shoulder, feathers, ...ends, ...held);
}

/** Thin bird's legs ending in three-toed feet, at `hip` height. */
function birdLegs(palette: Palette, colour: string, { hip, apart }: { hip: number; apart: number }): { leftLeg: THREE.Group; rightLeg: THREE.Group } {
  const leg = () => [post(palette.of(colour), 0.025, hip, { x: 0, z: 0, y: -hip }), box(palette.of(colour), { width: 0.12, height: 0.03, depth: 0.14 }, { y: -hip, z: 0.04 })];
  return { leftLeg: limb({ x: -apart, y: hip }, ...leg()), rightLeg: limb({ x: apart, y: hip }, ...leg()) };
}

const FOX = { fur: "#e07b39", white: "#fbf4ea", dark: "#3a2a20", bib: "#d23a2a", nose: "#1d1a18" } as const;

/** Kon, the shrine fox: orange with a white muzzle, chest and tail tip, tall pointed ears tipped dark, a great bushy
 *  tail curling up behind, and the red bib the foxes of the shrines wear. About a tile tall. */
export function konRig(palette: Palette): Rig {
  const headY = 0.88, headRadius = 0.32;
  const fur = palette.of(FOX.fur), white = palette.of(FOX.white);
  const torso = sphere(fur, 0.27, { y: 0.45 });
  torso.scale.set(1, 1.1, 0.9);
  const chest = sphere(white, 0.17, { y: 0.5, z: 0.14 });
  chest.scale.set(1, 1.2, 0.6);
  const muzzle = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 8).rotateX(Math.PI / 2), white);
  muzzle.position.set(0, headY - 0.1, headRadius + 0.06);
  const ears = [-1, 1].flatMap(side => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), fur);
    ear.position.set(side * 0.18, headY + 0.32, -0.02);
    ear.rotation.z = -side * 0.25;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 4), palette.of(FOX.dark));
    tip.position.set(side * 0.215, headY + 0.43, -0.02);
    tip.rotation.z = -side * 0.25;
    return [ear, tip];
  });
  const tail = new THREE.Group().add(sphere(fur, 0.17, { y: 0 }), sphere(fur, 0.19, { y: 0.2, z: -0.08 }), sphere(white, 0.13, { y: 0.4, z: -0.08 }));
  tail.position.set(0, 0.3, -0.32);
  tail.rotation.x = -0.35;
  const bib = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.2, 3).rotateX(Math.PI), palette.of(FOX.bib));
  bib.position.set(0, 0.6, 0.2);
  bib.scale.z = 0.3;
  const body = new THREE.Group().add(torso, chest, sphere(fur, headRadius, { y: headY }), muzzle,
    sphere(palette.of(FOX.nose), 0.04, { y: headY - 0.1, z: headRadius + 0.19 }, 0), ...ears, tail, bib, ...eyes(palette, headY + 0.03, headRadius));
  return rig(body, { ...arms(palette, { sleeve: FOX.fur, hand: FOX.dark }, { y: 0.6, apart: 0.25 }), ...legs(palette, { colour: FOX.fur, foot: FOX.dark }, { hip: 0.2, apart: 0.12 }) });
}

const OWL = { feathers: "#8a6a4a", face: "#efe0c3", rim: "#f2c14b", beak: "#d98a2b", tufts: "#5a4636", cap: "#1d1a18", tassel: "#d4a64a", glasses: "#3a3330", legs: "#d9a441" } as const;

/** Hakase, the professor owl: round and brown with a pale face, ear tufts, round glasses over big eyes, a little
 *  hooked beak and a scholar's square cap with a gold tassel. About a tile tall. */
export function hakaseRig(palette: Palette): Rig {
  const headY = 0.86, headRadius = 0.34;
  const feathers = palette.of(OWL.feathers);
  const torso = sphere(feathers, 0.32, { y: 0.48 });
  torso.scale.set(1, 1.1, 0.95);
  const belly = sphere(palette.of(OWL.face), 0.2, { y: 0.45, z: 0.16 });
  belly.scale.set(1, 1.2, 0.55);
  const discs = [-1, 1].map(side => {
    const at = onHead(headY, headRadius, EYE_DIRECTION, side);
    const disc = sphere(palette.of(OWL.face), headRadius * 0.34, { x: at.x * 0.95, y: at.y, z: at.z * 0.92 }, 1);
    disc.scale.set(1, 1, 0.35);
    return disc;
  });
  const glasses = [-1, 1].map(side => {
    const at = onHead(headY, headRadius, EYE_DIRECTION, side);
    const lens = new THREE.Mesh(new THREE.TorusGeometry(headRadius * 0.28, 0.014, 4, 14), palette.of(OWL.glasses));
    lens.position.set(at.x, at.y, at.z + 0.03);
    return lens;
  });
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4).rotateX(Math.PI), palette.of(OWL.beak));
  beak.position.set(0, headY - 0.12, headRadius * 0.97);
  const tufts = [-1, 1].map(side => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 4), palette.of(OWL.tufts));
    tuft.position.set(side * 0.22, headY + 0.28, 0);
    tuft.rotation.z = -side * 0.4;
    return tuft;
  });
  const cap = palette.of(OWL.cap);
  const board = box(cap, { width: 0.46, height: 0.04, depth: 0.46 }, { y: headY + headRadius + 0.06 });
  board.rotation.y = Math.PI / 4;
  const tassel = post(palette.of(OWL.tassel), 0.015, 0.2, { x: 0.2, z: 0.05, y: headY + headRadius - 0.13 });
  const body = new THREE.Group().add(torso, belly, sphere(feathers, headRadius, { y: headY }), ...discs, beak, ...tufts,
    post(cap, 0.17, 0.08, { x: 0, z: 0, y: headY + headRadius - 0.03 }), board, tassel, ...eyes(palette, headY, headRadius * 1.05), ...glasses);
  const wings = { leftArm: wing(palette, { colour: OWL.tufts }, { x: -0.33, y: 0.66 }), rightArm: wing(palette, { colour: OWL.tufts }, { x: 0.33, y: 0.66 }) };
  return birdRig(body, wings, birdLegs(palette, OWL.legs, { hip: 0.2, apart: 0.11 }));
}

const CRANE = { white: "#f7f6f2", black: "#262321", crown: "#d6332a", beak: "#b9b08a", legs: "#3a3632", brush: "#8a6a4a", ink: "#1d1a18" } as const;

/** Tsuru, the calligrapher crane: white, with a black neck and black tips to its wings and tail, a red crown, a long
 *  pale beak and long dark legs, and a brush in its wing. About a tile and a half tall. */
export function tsuruRig(palette: Palette): Rig {
  const headY = 1.25, headRadius = 0.24;
  const white = palette.of(CRANE.white), black = palette.of(CRANE.black);
  const torso = sphere(white, 0.3, { y: 0.72 });
  torso.scale.set(1, 0.95, 1.2);
  const neck = post(black, 0.08, 0.36, { x: 0, z: 0.06, y: 0.86 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.02, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.25), palette.of(CRANE.crown));
  crown.position.set(0, headY, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.3, 5).rotateX(Math.PI / 2), palette.of(CRANE.beak));
  beak.position.set(0, headY - 0.05, headRadius + 0.13);
  const tail = sphere(black, 0.16, { y: 0.68, z: -0.34 });
  tail.scale.set(1, 0.7, 1.2);
  const brush = new THREE.Group().add(post(palette.of(CRANE.brush), 0.018, 0.3, { x: 0, z: 0, y: -0.3 }), new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6).rotateX(Math.PI), palette.of(CRANE.ink)).translateY(-0.34));
  brush.position.set(0.04, -0.12, 0.1);
  const body = new THREE.Group().add(torso, neck, tail, sphere(white, headRadius, { y: headY }), crown, beak, ...eyes(palette, headY, headRadius));
  const wings = { leftArm: wing(palette, { colour: CRANE.white, tip: CRANE.black }, { x: -0.3, y: 0.86 }), rightArm: wing(palette, { colour: CRANE.white, tip: CRANE.black }, { x: 0.3, y: 0.86 }, [brush]) };
  return birdRig(body, wings, birdLegs(palette, CRANE.legs, { hip: 0.48, apart: 0.1 }));
}

const PIGEON = { grey: "#9aa0a8", dark: "#6b717a", neck: "#5f9a86", sheen: "#8a6a9a", cap: "#2f3b5a", peak: "#1d1a18", bag: "#8a5a36", letter: "#fbf8f0", legs: "#d98a8a", beak: "#3a3330" } as const;

/** Hato, the carrier pigeon: grey with a darker head and a green and purple sheen round its neck, a postman's cap and
 *  a satchel of letters on a strap. About a tile tall. */
export function hatoRig(palette: Palette): Rig {
  const headY = 0.92, headRadius = 0.3;
  const grey = palette.of(PIGEON.grey);
  const torso = sphere(grey, 0.32, { y: 0.52 });
  torso.scale.set(1, 1.05, 1.1);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 5, 14).rotateX(Math.PI / 2), palette.of(PIGEON.neck));
  collar.position.y = 0.7;
  const sheen = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.035, 5, 14, Math.PI).rotateX(Math.PI / 2), palette.of(PIGEON.sheen));
  sheen.position.set(0, 0.66, 0.01);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 4).rotateX(Math.PI / 2), palette.of(PIGEON.beak));
  beak.position.set(0, headY - 0.06, headRadius + 0.05);
  const cap = post(palette.of(PIGEON.cap), headRadius * 0.85, 0.12, { x: 0, z: -0.02, y: headY + headRadius - 0.1 });
  const peak = box(palette.of(PIGEON.peak), { width: 0.3, height: 0.03, depth: 0.16 }, { y: headY + headRadius - 0.09, z: headRadius * 0.75 });
  const strap = box(palette.of(PIGEON.bag), { width: 0.05, height: 0.62, depth: 0.04 }, { y: 0.4, z: 0.27 });
  strap.rotation.z = 0.6;
  const bag = box(palette.of(PIGEON.bag), { width: 0.22, height: 0.18, depth: 0.1 }, { x: 0.24, y: 0.3, z: 0.16 });
  const letter = box(palette.of(PIGEON.letter), { width: 0.14, height: 0.1, depth: 0.02 }, { x: 0.22, y: 0.45, z: 0.2 });
  const tail = box(palette.of(PIGEON.dark), { width: 0.24, height: 0.05, depth: 0.32 }, { y: 0.42, z: -0.4 });
  tail.rotation.x = 0.45;
  const body = new THREE.Group().add(torso, collar, sheen, sphere(palette.of(PIGEON.dark), headRadius, { y: headY }), beak, cap, peak, strap, bag, letter, tail,
    ...eyes(palette, headY + 0.02, headRadius));
  const wings = { leftArm: wing(palette, { colour: PIGEON.dark }, { x: -0.33, y: 0.72 }), rightArm: wing(palette, { colour: PIGEON.dark }, { x: 0.33, y: 0.72 }) };
  return birdRig(body, wings, birdLegs(palette, PIGEON.legs, { hip: 0.24, apart: 0.1 }));
}

const MACAQUE = { fur: "#9a8573", face: "#f0a8a0", towel: "#fbf8f0", stripe: "#5b8fc4", bucket: "#b98a52", hoop: "#5a3b28" } as const;

/** Momo, the onsen monkey: a grey-brown snow monkey with a pink face and ears, a folded towel on her head and a little
 *  wooden bath bucket in hand. About a tile tall. */
export function momoRig(palette: Palette): Rig {
  const headY = 0.86, headRadius = 0.32;
  const fur = palette.of(MACAQUE.fur), pink = palette.of(MACAQUE.face);
  const torso = sphere(fur, 0.27, { y: 0.45 });
  torso.scale.set(1, 1.1, 0.9);
  const face = sphere(pink, headRadius * 0.7, { y: headY - 0.03, z: headRadius * 0.45 });
  face.scale.set(1.05, 0.95, 0.6);
  const ears = [-1, 1].map(side => {
    const ear = sphere(pink, 0.08, { x: side * headRadius * 1.02, y: headY }, 1);
    ear.scale.set(0.5, 1, 0.8);
    return ear;
  });
  const towel = box(palette.of(MACAQUE.towel), { width: 0.34, height: 0.07, depth: 0.26 }, { y: headY + headRadius - 0.02 });
  towel.rotation.z = 0.12;
  const stripe = box(palette.of(MACAQUE.stripe), { width: 0.35, height: 0.02, depth: 0.04 }, { y: headY + headRadius + 0.02, z: 0.06 });
  stripe.rotation.z = 0.12;
  const tail = sphere(fur, 0.07, { y: 0.32, z: -0.27 }, 0);
  const bucket = new THREE.Group().add(post(palette.of(MACAQUE.bucket), 0.08, 0.12, { x: 0, z: 0, y: -0.5 }), post(palette.of(MACAQUE.hoop), 0.085, 0.02, { x: 0, z: 0, y: -0.44 }));
  bucket.position.z = 0.04;
  const body = new THREE.Group().add(torso, sphere(fur, headRadius, { y: headY }), face, ...ears, towel, stripe, tail, ...eyes(palette, headY + 0.02, headRadius * 1.03));
  return rig(body, { ...arms(palette, { sleeve: MACAQUE.fur, hand: MACAQUE.face }, { y: 0.6, apart: 0.25 }, [bucket]), ...legs(palette, { colour: MACAQUE.fur, foot: MACAQUE.face }, { hip: 0.2, apart: 0.12 }) });
}
