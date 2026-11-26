// The traveller afloat: seated in a little wooden rowing boat (our own low-poly design), which carries them where they
// go, turns to their heading, bobs on the water and rows while it moves. It wraps the traveller's own walker, so the
// renderer drives it as it drives anyone walking (a decorator: the person inside only sits).
import * as THREE from "three";
import type { Direction, Vector } from "../../lib/errands/movement.ts";
import { WATER_LEVEL } from "./water.ts";
import { Turning } from "./walkers.ts";
import type { IslandWalker, Motion } from "./walkers.ts";

const WOOD = { hull: "#9a6a43", inside: "#7a5234", rim: "#5e3d27", oar: "#c79a63" } as const;
/** The boat's size (in tiles): from stern to bow, across its middle, and how high its sides stand. */
const HULL = { stern: -0.8, bow: 1, halfWidth: 0.46, sternHalfWidth: 0.34, depth: 0.36, wall: 0.06 } as const;
/** How far its sides stand above the water. */
const FREEBOARD = 0.2;
/** How far the person sits down into the boat, so only their top half shows over its sides. */
const SEAT_DROP = 0.45;
/** How the boat rides the water: how high it bobs and how far it rocks, and how quickly. */
const BOB = { height: 0.03, rock: 0.04, speed: 1.6 } as const;
/** How the oars swing as the boat is rowed: how far each way, how deep they dip, strokes a second at each pace. */
const STROKE = { sweep: 0.55, dip: 0.25 } as const;
const STROKES_PER_SECOND: Readonly<Record<Motion, number>> = { idle: 0, walk: 0.9, run: 1.5 };

/** The boat's outline seen from above: a pointed bow ahead (towards +z), a squarer stern. */
function outline(inset: number): THREE.Shape {
  const half = HULL.halfWidth - inset, stern = HULL.sternHalfWidth - inset;
  const back = HULL.stern + inset, front = HULL.bow - inset * 2;
  // Shapes are drawn in x and y; the boat is laid flat afterwards, its y becoming the boat's forward z.
  const shape = new THREE.Shape().moveTo(-stern, back).lineTo(stern, back);
  shape.quadraticCurveTo(half, 0, half * 0.92, 0.12);
  shape.quadraticCurveTo(half * 0.75, front * 0.7, 0, front);
  shape.quadraticCurveTo(-half * 0.75, front * 0.7, -half * 0.92, 0.12);
  shape.quadraticCurveTo(-half, 0, -stern, back);
  return shape;
}

/** A flat outline stood up into a solid `height` tall, its base at `bottom`. */
const raised = (shape: THREE.Shape, height: number, bottom: number) =>
  new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2).rotateY(Math.PI).translate(0, bottom, 0);

function hull(materials: { hull: THREE.Material; inside: THREE.Material; rim: THREE.Material }): THREE.Group {
  const walls = outline(0);
  walls.holes.push(outline(HULL.wall));
  const bottom = FREEBOARD - HULL.depth;
  const boat = new THREE.Group().add(
    new THREE.Mesh(raised(walls, HULL.depth, bottom), materials.hull),
    new THREE.Mesh(raised(outline(HULL.wall), 0.04, bottom), materials.inside),
  );
  // Two seats across, one for the rower and one at the stern.
  for (const z of [-0.02, -0.55]) {
    boat.add(new THREE.Mesh(new THREE.BoxGeometry(HULL.halfWidth * 1.8, 0.04, 0.12).translate(0, FREEBOARD - 0.09, z), materials.rim));
  }
  return boat;
}

/** An oar resting in its rowlock at the boat's side (`side` -1 port, 1 starboard): a long shaft with a broad blade. */
function oar(material: THREE.Material, side: number): THREE.Group {
  const length = 1;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, length, 5).rotateZ(Math.PI / 2).translate(side * length * 0.35, 0, 0), material);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.09).translate(side * length * 0.78, 0, 0), material);
  const pivot = new THREE.Group().add(shaft, blade);
  pivot.position.set(side * (HULL.halfWidth - 0.02), FREEBOARD + 0.02, 0.02);
  return pivot;
}

export class RowingTraveller implements IslandWalker {
  readonly root = new THREE.Group();
  private readonly boat: THREE.Group;
  private readonly oars: readonly { pivot: THREE.Group; side: number }[];
  private readonly turning: Turning;
  private readonly rower: IslandWalker;
  private motion: Motion = "idle";
  private stroke = 0;
  private time = 0;

  /** `rower` is the traveller themself, seated in the boat. */
  constructor(rower: IslandWalker) {
    this.rower = rower;
    const materials = {
      hull: new THREE.MeshStandardMaterial({ color: WOOD.hull, roughness: 0.85, flatShading: true }),
      inside: new THREE.MeshStandardMaterial({ color: WOOD.inside, roughness: 0.9, flatShading: true }),
      rim: new THREE.MeshStandardMaterial({ color: WOOD.rim, roughness: 0.85, flatShading: true }),
    };
    const oarMaterial = new THREE.MeshStandardMaterial({ color: WOOD.oar, roughness: 0.8, flatShading: true });
    this.oars = [-1, 1].map(side => ({ pivot: oar(oarMaterial, side), side }));
    this.boat = hull(materials).add(rower.root, ...this.oars.map(({ pivot }) => pivot));
    rower.standAt({ x: 0, y: 0 }, "down");
    rower.faceAtOnce("down");
    rower.root.position.y = FREEBOARD - SEAT_DROP;
    this.boat.position.y = WATER_LEVEL;
    this.root.add(this.boat);
    this.boat.traverse(part => { if (part instanceof THREE.Mesh) part.castShadow = true; });
    this.turning = new Turning(this.root);
  }

  play(motion: Motion): void {
    this.motion = motion;
    // The rower sits still; the oars do the moving.
    this.rower.play("idle");
  }

  standAt(position: Vector, facing: Direction): void {
    this.root.position.set(position.x, 0, position.y);
    this.turning.want(facing);
  }

  faceAtOnce(facing: Direction): void {
    this.turning.faceAtOnce(facing);
  }

  update(seconds: number): void {
    this.time += seconds;
    this.turning.update(seconds);
    this.rower.update(seconds);
    const swell = this.time * BOB.speed;
    this.boat.position.y = WATER_LEVEL + Math.sin(swell) * BOB.height;
    this.boat.rotation.set(Math.sin(swell * 0.8) * BOB.rock, 0, Math.sin(swell * 0.6 + 1) * BOB.rock);
    this.rowOars(seconds);
  }

  /** Swings the oars through a stroke while the boat moves, and lets them rest level when it stops. */
  private rowOars(seconds: number): void {
    const strokes = STROKES_PER_SECOND[this.motion];
    this.stroke = strokes > 0 ? this.stroke + seconds * strokes * Math.PI * 2 : 0;
    for (const { pivot, side } of this.oars) {
      pivot.rotation.y = -side * Math.sin(this.stroke) * STROKE.sweep * Math.sign(strokes);
      // The blades dip into the water on the pull and lift out on the way back.
      pivot.rotation.z = -side * (strokes > 0 ? (Math.cos(this.stroke) * 0.5 + 0.5) * STROKE.dip : STROKE.dip);
    }
  }
}
