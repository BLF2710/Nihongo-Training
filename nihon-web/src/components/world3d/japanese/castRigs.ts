// The cast of the festival, the temple school, the zen garden and the summit, built in code in the same chibi style as
// the traveller: Pon the tanuki, Sensei of the tea house, Zen the garden monk and Kurama the tengu. Each is a rig of
// a body and four limbs, swung by `BuiltPerson`.
import * as THREE from "three";
import { box, post } from "./shapes.ts";
import type { Palette } from "./shapes.ts";
import { EYE_DIRECTION, eyes, limb, onHead, rosyCheeks, sphere } from "./people.ts";
import type { Rig } from "./people.ts";

const SKIN = "#f1d0b0";
const SANDAL = "#c9a46a";

type Limbs = { leftArm: THREE.Group; rightArm: THREE.Group; leftLeg: THREE.Group; rightLeg: THREE.Group };

/** Legs of `colour` ending in `foot` (sandals unless said), hung from the hips `apart` wide at `hip` height. */
function legs(palette: Palette, { colour, foot = SANDAL }: { colour: string; foot?: string }, { hip, apart }: { hip: number; apart: number }): Pick<Limbs, "leftLeg" | "rightLeg"> {
  const leg = () => [post(palette.of(colour), 0.08, hip - 0.04, { x: 0, z: 0, y: -hip + 0.02 }), box(palette.of(foot), { width: 0.13, height: 0.05, depth: 0.2 }, { y: -hip, z: 0.03 })];
  return { leftLeg: limb({ x: -apart, y: hip }, ...leg()), rightLeg: limb({ x: apart, y: hip }, ...leg()) };
}

/** Arms in sleeves ending in hands, hung from the shoulders, `held` in the right hand. */
function arms(palette: Palette, colours: { sleeve: string; hand: string }, shoulder: { y: number; apart: number }, held: THREE.Object3D[] = []): Pick<Limbs, "leftArm" | "rightArm"> {
  const arm = (extra: THREE.Object3D[]) => [post(palette.of(colours.sleeve), 0.08, 0.32, { x: 0, z: 0, y: -0.32 }), sphere(palette.of(colours.hand), 0.07, { y: -0.38 }, 0), ...extra];
  return { leftArm: limb({ x: -shoulder.apart, y: shoulder.y }, ...arm([])), rightArm: limb({ x: shoulder.apart, y: shoulder.y }, ...arm(held)) };
}

/** A rig from its body and limbs: the arms hang from the body (so they bob with it), the legs from the root. */
function rig(body: THREE.Group, limbs: Limbs): Rig {
  body.add(limbs.leftArm, limbs.rightArm);
  return { body, ...limbs, root: new THREE.Group().add(body, limbs.leftLeg, limbs.rightLeg), armSwing: "forward" };
}

/** A robe: a cone of cloth from the shoulders to the hem. */
function robe(palette: Palette, colour: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.3, 0.6, 8), palette.of(colour));
  mesh.position.y = 0.6;
  return mesh;
}

const TANUKI = { fur: "#a88a6c", dark: "#5a4636", cream: "#efe0c3", leaf: "#5c8e46", nose: "#2a2220" } as const;

/** Pon, the festival tanuki: round and brown with a cream belly and muzzle, dark patches round his eyes (each with a
 *  pale rim, so his eyes show on them), round dark ears, a striped bushy tail, and the leaf tanuki wear on his head to
 *  change shape. About a tile tall. */
export function ponRig(palette: Palette): Rig {
  const headY = 0.86, headRadius = 0.34;
  const fur = palette.of(TANUKI.fur), dark = palette.of(TANUKI.dark), cream = palette.of(TANUKI.cream);
  const belly = sphere(fur, 0.3, { y: 0.45 });
  belly.scale.set(1.05, 1.05, 0.95);
  const tummy = sphere(cream, 0.2, { y: 0.42, z: 0.15 });
  tummy.scale.set(1, 1.1, 0.6);
  const masks = [-1, 1].flatMap(side => {
    const at = onHead(headY + 0.02, headRadius, EYE_DIRECTION, side);
    const mask = sphere(dark, headRadius * 0.3, { x: at.x * 1.02, y: at.y - 0.01, z: at.z * 0.96 }, 1);
    mask.scale.set(1.25, 0.9, 0.4);
    mask.rotation.z = side * 0.35;
    const rim = sphere(cream, headRadius * 0.15, { x: at.x * 1.03, y: at.y, z: at.z * 0.99 }, 1);
    rim.scale.set(0.85, 1.1, 0.4);
    return [mask, rim];
  });
  const muzzle = sphere(cream, 0.13, { y: headY - 0.1, z: headRadius * 0.8 });
  muzzle.scale.set(1.2, 0.8, 0.7);
  const ears = [-1, 1].map(side => sphere(dark, 0.09, { x: side * 0.22, y: headY + 0.27, z: -0.03 }, 1));
  const tail = new THREE.Group();
  for (let ring = 0; ring < 3; ring += 1) tail.add(sphere(ring % 2 === 0 ? fur : dark, 0.13 - ring * 0.02, { y: ring * 0.12, z: -ring * 0.08 }));
  tail.position.set(0, 0.25, -0.3);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4).scale(1.5, 0.15, 0.7), palette.of(TANUKI.leaf));
  leaf.position.set(0.02, headY + headRadius + 0.02, 0.02);
  leaf.rotation.z = 0.3;
  const body = new THREE.Group().add(belly, tummy, sphere(fur, headRadius, { y: headY }), ...masks, muzzle,
    sphere(palette.of(TANUKI.nose), 0.04, { y: headY - 0.06, z: headRadius * 1.02 }, 0), ...ears, tail, leaf,
    ...eyes(palette, headY + 0.02, headRadius));
  return rig(body, { ...arms(palette, { sleeve: TANUKI.dark, hand: TANUKI.dark }, { y: 0.6, apart: 0.27 }), ...legs(palette, { colour: TANUKI.dark, foot: TANUKI.dark }, { hip: 0.2, apart: 0.13 }) });
}

const TEACHER = { kimono: "#2f5d8a", collar: "#fbf5ea", hair: "#b8b4aa", pin: "#c94f35", glasses: "#3a3330", cup: "#f1ebdd" } as const;

/** Sensei of the tea house: grey hair in a bun with a red hairpin, round glasses, an indigo kimono, a cup of tea in
 *  hand. About a tile and a half tall, like the traveller. */
export function senseiRig(palette: Palette): Rig {
  const headY = 1.12, headRadius = 0.32;
  const hair = palette.of(TEACHER.hair);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), hair);
  cap.position.set(0, headY, -0.02);
  cap.rotation.x = -0.35;
  const back = new THREE.Mesh(new THREE.SphereGeometry(headRadius * 1.04, 18, 10, Math.PI, Math.PI, 0, Math.PI * 0.7), hair);
  back.position.set(0, headY, -0.01);
  const pin = box(palette.of(TEACHER.pin), { width: 0.34, height: 0.025, depth: 0.025 }, { y: headY + 0.32, z: -0.2 });
  pin.rotation.z = 0.4;
  const glasses = [-1, 1].map(side => {
    const at = onHead(headY, headRadius, EYE_DIRECTION, side);
    const lens = new THREE.Mesh(new THREE.TorusGeometry(headRadius * 0.2, 0.012, 4, 12), palette.of(TEACHER.glasses));
    lens.position.set(at.x, at.y, at.z + 0.02);
    return lens;
  });
  const cup = post(palette.of(TEACHER.cup), 0.06, 0.09, { x: 0, z: 0.08, y: -0.46 });
  const body = new THREE.Group().add(robe(palette, TEACHER.kimono), post(palette.of(TEACHER.collar), 0.21, 0.06, { x: 0, z: 0, y: 0.84 }),
    sphere(palette.of(SKIN), headRadius, { y: headY }), cap, back, sphere(hair, 0.13, { y: headY + 0.24, z: -0.24 }), pin, ...glasses,
    ...eyes(palette, headY, headRadius), ...rosyCheeks(palette, headY, headRadius));
  return rig(body, { ...arms(palette, { sleeve: TEACHER.kimono, hand: SKIN }, { y: 0.82, apart: 0.26 }, [cup]), ...legs(palette, { colour: TEACHER.kimono }, { hip: 0.34, apart: 0.11 }) });
}

const MONK = { robe: "#4a5560", kesa: "#c98a3a", rake: "#8a6a4a", tines: "#5a4636" } as const;

/** Zen, the garden monk: a shaven head, a grey robe under an ochre sash over one shoulder, and the rake for the gravel
 *  garden in his hand. About a tile and a half tall. */
export function zenRig(palette: Palette): Rig {
  const headY = 1.12, headRadius = 0.32;
  const kesa = box(palette.of(MONK.kesa), { width: 0.14, height: 0.62, depth: 0.5 }, { x: 0.02, y: 0.32 });
  kesa.rotation.z = 0.55;
  const rake = new THREE.Group().add(
    post(palette.of(MONK.rake), 0.02, 1.25, { x: 0, z: 0, y: -0.9 }),
    box(palette.of(MONK.tines), { width: 0.4, height: 0.05, depth: 0.05 }, { y: -0.92 }),
  );
  rake.position.z = 0.06;
  const ears = [-1, 1].map(side => sphere(palette.of(SKIN), 0.06, { x: side * headRadius * 0.98, y: headY - 0.02 }, 0));
  const body = new THREE.Group().add(robe(palette, MONK.robe), kesa, sphere(palette.of(SKIN), headRadius, { y: headY }), ...ears,
    ...eyes(palette, headY, headRadius));
  return rig(body, { ...arms(palette, { sleeve: MONK.robe, hand: SKIN }, { y: 0.82, apart: 0.27 }, [rake]), ...legs(palette, { colour: MONK.robe }, { hip: 0.34, apart: 0.11 }) });
}

const TENGU = { face: "#c94f35", nose: "#d9663b", beard: "#f3eee4", robe: "#fbf5ea", cap: "#1d1a18", pompom: "#c94f35", wing: "#3a3430", fan: "#5c8e46" } as const;

/** Kurama, the tengu of the dojo: a red face with a long nose and a white beard and brows, the small black cap of
 *  the mountain monks, a white robe with red pompoms down its front, dark wings, and a leaf fan. About a tile and a
 *  half tall. */
export function kuramaRig(palette: Palette): Rig {
  const headY = 1.14, headRadius = 0.32;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.34, 6).rotateX(Math.PI / 2), palette.of(TENGU.nose));
  nose.position.set(0, headY - 0.06, headRadius + 0.14);
  const beard = sphere(palette.of(TENGU.beard), 0.2, { y: headY - 0.24, z: 0.12 });
  beard.scale.set(1.1, 1, 0.7);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.12, 5), palette.of(TENGU.cap));
  cap.position.set(0, headY + headRadius + 0.03, 0.05);
  const brows = [-1, 1].map(side => {
    const at = onHead(headY + 0.1, headRadius, EYE_DIRECTION, side);
    const brow = box(palette.of(TENGU.beard), { width: 0.14, height: 0.04, depth: 0.04 }, { x: at.x, y: at.y, z: at.z });
    brow.rotation.z = side * -0.25;
    return brow;
  });
  const pompoms = [0.76, 0.56].flatMap(y => [-1, 1].map(side => sphere(palette.of(TENGU.pompom), 0.045, { x: side * 0.07, y, z: 0.25 }, 0)));
  const wings = [-1, 1].map(side => {
    const wing = sphere(palette.of(TENGU.wing), 0.26, { x: side * 0.18, y: 0.8, z: -0.26 });
    wing.scale.set(0.9, 1.3, 0.25);
    wing.rotation.z = side * 0.4;
    return wing;
  });
  const fan = new THREE.Mesh(new THREE.CircleGeometry(0.16, 7), palette.of(TENGU.fan));
  fan.position.set(0, -0.5, 0.08);
  fan.rotation.x = -0.6;
  const body = new THREE.Group().add(robe(palette, TENGU.robe), sphere(palette.of(TENGU.face), headRadius, { y: headY }), nose, beard, cap, ...brows, ...pompoms, ...wings,
    ...eyes(palette, headY, headRadius));
  return rig(body, { ...arms(palette, { sleeve: TENGU.robe, hand: TENGU.face }, { y: 0.82, apart: 0.26 }, [fan]), ...legs(palette, { colour: TENGU.robe }, { hip: 0.34, apart: 0.11 }) });
}
