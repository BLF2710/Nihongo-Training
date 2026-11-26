// The islands' bridges drawn in 3D (our own design, after the drum bridges of Japanese gardens): a deck of planks,
// flat where it's walked on the island and arching high over the open water beyond, edged with vermilion beams, with
// vermilion railings along both sides whose end posts carry green onion-shaped caps, and stone footings where the arch
// meets the water. Tiles are world units: x east, z south, y up, the land's top at y = 0.
import * as THREE from "three";
import type { BridgeSpan } from "../../lib/world/bridges.ts";

const COLOUR = { planks: "#a57a4f", planksDark: "#916a43", vermilion: "#c8452f", cap: "#5d9b86", stone: "#8e8a82" } as const;
/** How high an arch rises for each tile it spans (and the most it ever rises). */
const ARCH = { risePerTile: 0.22, highest: 1.0 } as const;
const PLANK = { length: 0.22, gap: 0.025, depth: 0.08 } as const;
const RAILING = { postSpacing: 0.62, postHeight: 0.5, post: 0.07, inset: 0.06, topRail: 0.46, midRail: 0.24, rail: 0.05 } as const;
const EDGE_BEAM = { width: 0.09, height: 0.16 } as const;
const FOOTING = { along: 0.6, depth: 0.8, overhang: 0.2 } as const;
/** The deck lies this little above the land, so it doesn't flicker into the far shore's path where it lands on it. */
const DECK_LIFT = 0.02;

/** How high the deck stands at `along` (a distance along the bridge's run, in tiles from the map's origin). */
export function deckHeightAt({ arch }: BridgeSpan, along: number): number {
  if (!arch || along <= arch.from || along >= arch.to) return 0;
  const rise = Math.min(ARCH.highest, (arch.to - arch.from) * ARCH.risePerTile);
  return rise * Math.sin((Math.PI * (along - arch.from)) / (arch.to - arch.from));
}

/** Where a bridge's run starts and ends, and the two edges across it. */
function extentOf({ at, runsAlong }: BridgeSpan): { start: number; end: number; left: number; right: number } {
  return runsAlong === "y"
    ? { start: at.y, end: at.y + at.height, left: at.x, right: at.x + at.width }
    : { start: at.x, end: at.x + at.width, left: at.y, right: at.y + at.height };
}

/** The world point `along` the run, `across` it, `up` above the deck there. */
function pointOn(span: BridgeSpan, { along, across, up }: { along: number; across: number; up: number }): THREE.Vector3 {
  const y = deckHeightAt(span, along) + DECK_LIFT + up;
  return span.runsAlong === "y" ? new THREE.Vector3(across, y, along) : new THREE.Vector3(along, y, across);
}

/** A beam from `from` to `to`, `width` across and `height` thick (its width lying flat, across the run). */
function beam(material: THREE.Material, from: THREE.Vector3, to: THREE.Vector3, { width, height }: { width: number; height: number }): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, from.distanceTo(to)), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.lookAt(to);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** The deck: planks laid across the run, following the arch, two shades of wood in turn. */
function planks(span: BridgeSpan, materials: readonly THREE.Material[]): THREE.Mesh[] {
  const { start, end, left, right } = extentOf(span);
  const across = (left + right) / 2, width = right - left;
  const count = Math.round((end - start) / PLANK.length);
  return Array.from({ length: count }, (_, index) => {
    const from = start + (index * (end - start)) / count, to = start + ((index + 1) * (end - start)) / count - PLANK.gap;
    const ends = [from, to].map(along => pointOn(span, { along, across, up: -PLANK.depth / 2 }));
    return beam(materials[index % materials.length], ends[0], ends[1], { width, height: PLANK.depth });
  });
}

/** Along each side, a vermilion beam edging the deck, following the arch in short pieces. */
function edgeBeams(span: BridgeSpan, material: THREE.Material): THREE.Mesh[] {
  const { start, end, left, right } = extentOf(span);
  const pieces = Math.round((end - start) / PLANK.length);
  return [left + EDGE_BEAM.width / 2, right - EDGE_BEAM.width / 2].flatMap(across => Array.from({ length: pieces }, (_, index) => {
    const ends = [index, index + 1].map(piece => pointOn(span, { along: start + (piece * (end - start)) / pieces, across, up: -EDGE_BEAM.height / 2 + 0.03 }));
    return beam(material, ends[0], ends[1], { width: EDGE_BEAM.width, height: EDGE_BEAM.height });
  }));
}

/** A green onion-shaped cap on top of a post at `top`. */
function onionCap(material: THREE.Material, top: THREE.Vector3): THREE.Mesh[] {
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), material);
  bulb.scale.set(1, 1.15, 1);
  bulb.position.copy(top).add(new THREE.Vector3(0, 0.07, 0));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 8), material);
  tip.position.copy(top).add(new THREE.Vector3(0, 0.18, 0));
  return [bulb, tip];
}

/** The railings along both sides: posts, a top rail and a middle rail between each pair, following the arch, and
 *  onion caps on the posts at either end and where the arch begins and ends. */
function railings(span: BridgeSpan, materials: { wood: THREE.Material; cap: THREE.Material }): THREE.Object3D[] {
  const { start, end, left, right } = extentOf(span);
  const count = Math.max(1, Math.round((end - start) / RAILING.postSpacing));
  const posts = Array.from({ length: count + 1 }, (_, index) => start + (index * (end - start)) / count);
  const capped = new Set([posts[0], posts[posts.length - 1], ...(span.arch ? [span.arch.from, span.arch.to] : [])].map(along => posts.reduce((nearest, post) => Math.abs(post - along) < Math.abs(nearest - along) ? post : nearest)));
  const parts: THREE.Object3D[] = [];
  for (const across of [left + RAILING.inset, right - RAILING.inset]) {
    for (const along of posts) {
      const isCapped = capped.has(along);
      const foot = pointOn(span, { along, across, up: 0 }), top = foot.clone().add(new THREE.Vector3(0, RAILING.postHeight, 0));
      parts.push(beam(materials.wood, foot, top, { width: RAILING.post * (isCapped ? 1.4 : 1), height: RAILING.post * (isCapped ? 1.4 : 1) }));
      if (isCapped) parts.push(...onionCap(materials.cap, top));
    }
    posts.slice(1).forEach((along, index) => {
      for (const up of [RAILING.topRail, RAILING.midRail]) {
        const ends = [posts[index], along].map(at => pointOn(span, { along: at, across, up }));
        parts.push(beam(materials.wood, ends[0], ends[1], { width: RAILING.rail, height: RAILING.rail }));
      }
    });
  }
  return parts;
}

/** Stone footings in the water under each end of the arch. */
function footings(span: BridgeSpan, material: THREE.Material): THREE.Mesh[] {
  if (!span.arch) return [];
  const { left, right } = extentOf(span);
  const width = right - left + 2 * FOOTING.overhang;
  return [span.arch.from, span.arch.to].map(along => {
    const size = span.runsAlong === "y" ? [width, FOOTING.depth, FOOTING.along] : [FOOTING.along, FOOTING.depth, width];
    const stone = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    stone.position.copy(pointOn(span, { along, across: (left + right) / 2, up: -PLANK.depth - FOOTING.depth / 2 }));
    stone.receiveShadow = true;
    return stone;
  });
}

/** Each bridge, as its own group. */
export function buildBridges(spans: readonly BridgeSpan[]): THREE.Group {
  // A scene with no bridges (the ferry's) gets an empty group: adding nothing to one is a mistake to three.js.
  if (spans.length === 0) return new THREE.Group();
  const wood = [new THREE.MeshLambertMaterial({ color: COLOUR.planks }), new THREE.MeshLambertMaterial({ color: COLOUR.planksDark })];
  const vermilion = new THREE.MeshLambertMaterial({ color: COLOUR.vermilion });
  const cap = new THREE.MeshLambertMaterial({ color: COLOUR.cap });
  const stone = new THREE.MeshLambertMaterial({ color: COLOUR.stone });
  return new THREE.Group().add(...spans.map(span => new THREE.Group().add(
    ...planks(span, wood),
    ...edgeBeams(span, vermilion),
    ...railings(span, { wood: vermilion, cap }),
    ...footings(span, stone),
  )));
}
