// The pieces the islands' Japanese models are built from: flat-shaded colours shared between models, boxes and posts,
// and the curved roof of a Japanese hall. Models are built in tiles, centred on the origin, their base at y = 0 and
// their front facing south (+z), towards the viewer.
import * as THREE from "three";

/** One material per colour, shared by every model a maker builds. Flat shading gives the low-poly look. */
export class Palette {
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();
  private colouredMaterial: THREE.MeshStandardMaterial | null = null;

  /** The material for models whose parts carry their own colours (merged into one mesh), smoothly shaded. */
  coloured(): THREE.MeshStandardMaterial {
    this.colouredMaterial ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
    return this.colouredMaterial;
  }

  of(colour: string): THREE.MeshStandardMaterial {
    const known = this.materials.get(colour);
    if (known) return known;
    const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.85, metalness: 0, flatShading: true });
    this.materials.set(colour, material);
    return material;
  }
}

export type Size = { width: number; height: number; depth: number };

/** The ground a piece stands on, in tiles, as it faces: across its front, and from front to back. */
export type PropGround = { width: number; depth: number };
/** Builds a piece (a torii, a lantern, a tea bench…) facing south on its ground. */
export type PropBuilder = (palette: Palette, ground: PropGround) => THREE.Group;

/** A glowing material: lantern light, or a paper lantern lit from inside. */
export const glowing = (colour: string, intensity: number): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: intensity, flatShading: true });

const LANTERN_CAPS = "#2b2624";

type LanternTop = { x: number; y: number; z: number };

/** A round paper lantern glowing from inside, with black caps top and bottom, hanging from `top`. */
export const paperLantern = (palette: Palette, colour: string, top: LanternTop, size = 0.12): THREE.Object3D[] =>
  hungLantern(palette, glowing(colour, 0.45), top, size);

/** A round paper lantern not lit yet: its paper only, dull in daylight. */
export const unlitPaperLantern = (palette: Palette, colour: string, top: LanternTop, size = 0.12): THREE.Object3D[] =>
  hungLantern(palette, palette.of(colour), top, size);

function hungLantern(palette: Palette, paper: THREE.Material, top: LanternTop, size: number): THREE.Object3D[] {
  const body = placed(new THREE.SphereGeometry(size, 10, 8), paper, { x: top.x, y: top.y - size * 1.25, z: top.z });
  body.scale.set(1, 1.3, 1);
  const caps = [top.y - size * 0.1, top.y - size * 2.6].map(y => post(palette.of(LANTERN_CAPS), size * 0.55, size * 0.25, { x: top.x, z: top.z, y }));
  return [body, ...caps];
}

/** A mesh of `geometry` at a point. */
export function placed(geometry: THREE.BufferGeometry, material: THREE.Material, at: { x?: number; y?: number; z?: number }): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(at.x ?? 0, at.y ?? 0, at.z ?? 0);
  return mesh;
}

/** A box of `size`, its base at `y`, centred on (x, z). */
export function box(material: THREE.Material, size: Size, at: { x?: number; y?: number; z?: number } = {}): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.width, size.height, size.depth), material);
  mesh.position.set(at.x ?? 0, (at.y ?? 0) + size.height / 2, at.z ?? 0);
  return mesh;
}

/** A round post `height` tall standing at (x, z). */
export function post(material: THREE.Material, radius: number, height: number, at: { x: number; z: number; y?: number }): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 6), material);
  mesh.position.set(at.x, (at.y ?? 0) + height / 2, at.z);
  return mesh;
}

/** A roof sloping down to the north and south, its ridge running east to west. Its slopes sag a little and flare up
 *  at the eaves, as a temple's do. `span` is its depth (north to south) at the eaves, `length` its width along the
 *  ridge, `rise` how far the ridge stands over the eaves, and `base` the height of the eaves. */
export type RoofShape = { span: number; length: number; rise: number; base: number; thickness: number };

const EAVE_FLARE = 0.12;
const SAG = 0.22;

export function curvedRoof(material: THREE.Material, { span, length, rise, base, thickness }: RoofShape): THREE.Mesh {
  const half = span / 2;
  const profile = new THREE.Shape();
  // The top surface from the south eave over the ridge to the north eave, then back underneath.
  profile.moveTo(-half, EAVE_FLARE);
  profile.quadraticCurveTo(-half * (1 - SAG), rise * SAG, 0, rise);
  profile.quadraticCurveTo(half * (1 - SAG), rise * SAG, half, EAVE_FLARE);
  profile.lineTo(half, EAVE_FLARE - thickness);
  profile.quadraticCurveTo(half * (1 - SAG), rise * SAG - thickness, 0, rise - thickness);
  profile.quadraticCurveTo(-half * (1 - SAG), rise * SAG - thickness, -half, EAVE_FLARE - thickness);
  profile.closePath();
  const geometry = new THREE.ExtrudeGeometry(profile, { depth: length, bevelEnabled: false, curveSegments: 6 });
  // The profile is drawn across the roof (x) and pushed out along z; turn it so the ridge runs east to west.
  geometry.translate(0, 0, -length / 2).rotateY(Math.PI / 2);
  const roof = new THREE.Mesh(geometry, material);
  roof.position.y = base;
  return roof;
}

/** The wall under a roof's end, from the top of the walls up to the roof's underside, at `x` (its east or west end). */
export function gable(material: THREE.Material, { span, rise, base, thickness }: RoofShape, x: number, depth: number): THREE.Mesh {
  const half = span / 2;
  const underside = new THREE.Shape();
  underside.moveTo(-half, 0);
  underside.lineTo(-half, EAVE_FLARE - thickness);
  underside.quadraticCurveTo(-half * (1 - SAG), rise * SAG - thickness, 0, rise - thickness);
  underside.quadraticCurveTo(half * (1 - SAG), rise * SAG - thickness, half, EAVE_FLARE - thickness);
  underside.lineTo(half, 0);
  underside.closePath();
  const geometry = new THREE.ExtrudeGeometry(underside, { depth, bevelEnabled: false, curveSegments: 6 });
  geometry.translate(0, 0, -depth / 2).rotateY(Math.PI / 2);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, base, 0);
  return wall;
}
