// The festival's pieces, built in code (our own designs, low-poly like the buildings): paper lanterns on posts,
// strings of lanterns hung between them, tall banners (for the festival, for tea and for dumplings), tea benches under
// red parasols with a sign stood by them, a food cart selling dumplings, a rickshaw and a festival tower. Each is
// built facing south on the ground it's given.
import * as THREE from "three";
import type { ShrinePropKind } from "../../../lib/world/islandProps.ts";
import { box, curvedRoof, paperLantern, placed, post } from "./shapes.ts";
import { signboard } from "./signboard.ts";
import type { Palette, PropBuilder } from "./shapes.ts";

const COLOUR = {
  pole: "#5a3b28", wood: "#8a6440", red: "#c8452f", black: "#2b2624", cloth: "#f4ede0", felt: "#c73a2e",
  parasol: "#d9442f", rope: "#e2d6b4", cup: "#f1ebdd", tea: "#6c8a3a", hood: "#2f2a28", seat: "#b53a2c", gold: "#d4a64a",
  indigo: "#2f4a7a", board: "#e8d3a8", ink: "#3a2a20", slate: "#474c55", counter: "#c9a46c", pot: "#3b3633",
} as const;
/** The three colours of a skewer of dumplings, from the top. */
const DANGO_COLOURS = ["#f3a9c0", "#fbf3e8", "#8fbf5a"] as const;
const LANTERN_COLOURS = ["#e0412f", "#f7efe0", "#f2c14b"] as const;
/** How high a lantern post stands, and the rope strung between two of them. */
const POST_HEIGHT = 1.75;
const STRING_HEIGHT = 1.68;

/** A material seen from both sides (a parasol's or a hood's underside shows), its own so the shared ones stay one-sided. */
const twoSided = (colour: string) => new THREE.MeshStandardMaterial({ color: colour, roughness: 0.85, flatShading: true, side: THREE.DoubleSide });

/** A post with a red paper lantern hanging from its arm. */
const paperLanternPost: PropBuilder = palette => new THREE.Group().add(
  box(palette.of(COLOUR.black), { width: 0.24, height: 0.08, depth: 0.24 }),
  post(palette.of(COLOUR.pole), 0.045, POST_HEIGHT, { x: 0, z: 0 }),
  box(palette.of(COLOUR.pole), { width: 0.32, height: 0.04, depth: 0.04 }, { x: 0.12, y: POST_HEIGHT - 0.12 }),
  ...paperLantern(palette, LANTERN_COLOURS[0], { x: 0.24, y: POST_HEIGHT - 0.12, z: 0 }, 0.13),
);

const STRING_SAG = 0.22;
const LANTERN_SPACING = 0.75;

/** Lanterns strung on a sagging rope from the top of one lantern post to another, at the ends of its ground (the
 *  posts are the island's own lanterns, standing there). */
const lanternString: PropBuilder = (palette, { width }) => {
  const span = width - 1;
  const ropeAt = (share: number) => new THREE.Vector3((share - 0.5) * span, STRING_HEIGHT - STRING_SAG * 4 * share * (1 - share), 0);
  const rope = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0, 0.25, 0.5, 0.75, 1].map(ropeAt)), 16, 0.012, 4);
  const group = new THREE.Group().add(new THREE.Mesh(rope, palette.of(COLOUR.rope)));
  const count = Math.max(1, Math.floor(span / LANTERN_SPACING));
  for (let lantern = 1; lantern <= count; lantern += 1) {
    const at = ropeAt(lantern / (count + 1));
    group.add(...paperLantern(palette, LANTERN_COLOURS[lantern % LANTERN_COLOURS.length], { x: at.x, y: at.y - 0.02, z: 0 }, 0.09));
  }
  return group;
};

const BANNER = { width: 0.34, height: 1.25, pole: 2.0 } as const;
/** Canvas pixels to a tile of cloth or board, so its words stay sharp. */
const PIXELS_PER_TILE = 200;
const JAPANESE_FONT = `"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;

/** Words written down a cloth or board: `text` in `ink` on `cloth`, with a band of `ink` across its top if `band`. */
type Lettering = { text: string; cloth: string; ink: string; band?: string };

/** `lettering` painted down a canvas `width` by `height` tiles; null where there's no canvas to paint with. */
function verticalWords({ text, cloth, ink, band }: Lettering, width: number, height: number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * PIXELS_PER_TILE);
  canvas.height = Math.round(height * PIXELS_PER_TILE);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = cloth;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (band) {
    context.fillStyle = band;
    context.fillRect(0, 0, canvas.width, canvas.height * 0.08);
  }
  const step = Math.min(canvas.width * 0.78, (canvas.height * 0.84) / [...text].length);
  context.font = `700 ${Math.round(step * 0.82)}px ${JAPANESE_FONT}`;
  context.fillStyle = ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const top = (canvas.height - step * [...text].length) / 2 + (band ? canvas.height * 0.04 : 0);
  [...text].forEach((character, index) => context.fillText(character, canvas.width / 2, top + step * (index + 0.5)));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A material showing `lettering` painted on a face `width` by `height` tiles, or plain cloth where it can't be painted. */
function letteredMaterial(palette: Palette, lettering: Lettering, size: { width: number; height: number }): THREE.Material {
  const words = verticalWords(lettering, size.width, size.height);
  return words ? new THREE.MeshStandardMaterial({ map: words, roughness: 0.9, side: THREE.DoubleSide }) : palette.of(lettering.cloth);
}

/** A tall banner on its pole with `lettering` down it. */
function banner(lettering: Lettering): PropBuilder {
  return palette => {
    const cloth = letteredMaterial(palette, lettering, BANNER);
    const hung = placed(new THREE.PlaneGeometry(BANNER.width, BANNER.height), cloth, { x: BANNER.width / 2 + 0.04, y: BANNER.pole - 0.12 - BANNER.height / 2, z: 0.02 });
    return new THREE.Group().add(
      box(palette.of(COLOUR.black), { width: 0.26, height: 0.1, depth: 0.26 }),
      post(palette.of(COLOUR.pole), 0.03, BANNER.pole, { x: 0, z: 0 }),
      box(palette.of(COLOUR.pole), { width: BANNER.width + 0.1, height: 0.03, depth: 0.03 }, { x: BANNER.width / 2 + 0.04, y: BANNER.pole - 0.12 }),
      hung,
    );
  };
}

/** まつり ("festival") in white on red. */
const FESTIVAL_BANNER: Lettering = { text: "まつり", cloth: COLOUR.red, ink: COLOUR.cloth, band: COLOUR.cloth };
/** おちゃ ("tea") in white on indigo. */
const TEA_BANNER: Lettering = { text: "おちゃ", cloth: COLOUR.indigo, ink: COLOUR.cloth, band: COLOUR.cloth };
/** だんご ("dumplings") in red on white. */
const DANGO_BANNER: Lettering = { text: "だんご", cloth: COLOUR.cloth, ink: COLOUR.red, band: COLOUR.red };

const STANDING_SIGN = { width: 0.2, height: 0.62, legs: 0.18 } as const;

/** A narrow wooden board stood on two short legs, `text` written down it, at (x, z). */
function standingSign(palette: Palette, text: string, at: { x: number; z: number }): THREE.Object3D[] {
  const face = letteredMaterial(palette, { text, cloth: COLOUR.board, ink: COLOUR.ink }, STANDING_SIGN);
  const middle = STANDING_SIGN.legs + STANDING_SIGN.height / 2;
  return [
    box(palette.of(COLOUR.pole), { width: STANDING_SIGN.width + 0.04, height: STANDING_SIGN.height + 0.04, depth: 0.04 }, { x: at.x, y: STANDING_SIGN.legs - 0.02, z: at.z }),
    placed(new THREE.PlaneGeometry(STANDING_SIGN.width, STANDING_SIGN.height), face, { x: at.x, y: middle, z: at.z + 0.022 }),
    ...[-1, 1].map(side => post(palette.of(COLOUR.pole), 0.02, STANDING_SIGN.legs, { x: at.x + side * 0.07, z: at.z })),
  ];
}

/** A bench spread with red felt and a tea tray, under a big red paper parasol. */
const teaBench: PropBuilder = (palette, { width }) => {
  const benchWidth = width - 0.5;
  const parasol = placed(new THREE.ConeGeometry(0.85, 0.32, 16, 1, true), twoSided(COLOUR.parasol), { x: 0.2, y: 1.75, z: -0.05 });
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.felt), { width: benchWidth, height: 0.05, depth: 0.5 }, { y: 0.38 }),
    parasol,
    post(palette.of(COLOUR.wood), 0.02, 1.85, { x: 0.2, z: -0.05 }),
    box(palette.of(COLOUR.wood), { width: 0.3, height: 0.03, depth: 0.2 }, { x: -0.3, y: 0.43 }),
    post(palette.of(COLOUR.cup), 0.035, 0.06, { x: -0.36, z: 0, y: 0.46 }),
    post(palette.of(COLOUR.cup), 0.035, 0.06, { x: -0.24, z: 0.02, y: 0.46 }),
    placed(new THREE.SphereGeometry(0.05, 8, 6), palette.of(COLOUR.tea), { x: 0.1, y: 0.48, z: 0.05 }),
    ...standingSign(palette, "おちゃ", { x: width / 2 - 0.13, z: 0.1 }),
  );
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) group.add(post(palette.of(COLOUR.wood), 0.025, 0.38, { x: x * (benchWidth / 2 - 0.08), z: z * 0.18 }));
  }
  return group;
};

/** A skewer of three dumplings, pink, white and green, stood upright at (x, z) from `y`. */
function dango(palette: Palette, at: { x: number; y: number; z: number }): THREE.Object3D[] {
  return [
    post(palette.of(COLOUR.counter), 0.008, 0.28, { x: at.x, z: at.z, y: at.y }),
    ...DANGO_COLOURS.map((colour, index) => placed(new THREE.SphereGeometry(0.045, 8, 6), palette.of(colour), { x: at.x, y: at.y + 0.22 - index * 0.075, z: at.z })),
  ];
}

/** A round wooden stool. */
function stool(palette: Palette, x: number, z: number): THREE.Object3D[] {
  return [post(palette.of(COLOUR.wood), 0.13, 0.05, { x, z, y: 0.3 }), post(palette.of(COLOUR.pole), 0.05, 0.3, { x, z })];
}

/** How a food cart is built: its counter's width, height and depth, and how high its roof's eaves are. */
const YATAI = { width: 1.5, counter: 0.78, depth: 0.62, eaves: 1.62 } as const;

/** A food cart selling dumplings: a wooden counter on two wheels, a tiled roof on four posts with だんご on a board
 *  across its front, red lanterns at its corners, skewers of dumplings, a pot and bowls on the counter, stools for
 *  customers and a sign stood beside it. */
const yatai: PropBuilder = (palette, { depth }) => {
  const back = -0.25, front = back + YATAI.depth / 2;
  const wood = palette.of(COLOUR.wood), pole = palette.of(COLOUR.pole);
  const header = signboard(palette, "だんご");
  header.position.set(0, YATAI.eaves + 0.32, front + 0.12);
  const group = new THREE.Group().add(
    box(wood, { width: YATAI.width, height: YATAI.counter - 0.12, depth: YATAI.depth }, { y: 0.12, z: back }),
    box(palette.of(COLOUR.counter), { width: YATAI.width + 0.12, height: 0.05, depth: YATAI.depth + 0.14 }, { y: YATAI.counter, z: back + 0.04 }),
    box(palette.of(COLOUR.indigo), { width: YATAI.width - 0.1, height: 0.3, depth: 0.02 }, { y: YATAI.counter - 0.42, z: front + 0.01 }),
    curvedRoof(palette.of(COLOUR.slate), { span: YATAI.depth + 0.5, length: YATAI.width + 0.35, rise: 0.26, base: YATAI.eaves, thickness: 0.07 }).translateZ(back),
    header,
    placed(new THREE.CylinderGeometry(0.13, 0.11, 0.2, 10), palette.of(COLOUR.pot), { x: 0.48, y: YATAI.counter + 0.15, z: back - 0.05 }),
    ...[0, 1, 2].map(bowl => post(palette.of(COLOUR.cup), 0.08 - bowl * 0.005, 0.05, { x: -0.52, z: back, y: YATAI.counter + 0.05 + bowl * 0.05 })),
  );
  for (const x of [-1, 1]) {
    for (const z of [back - YATAI.depth / 2 + 0.04, front - 0.04]) group.add(post(pole, 0.035, YATAI.eaves - YATAI.counter, { x: x * (YATAI.width / 2 - 0.04), z, y: YATAI.counter }));
    group.add(wheel(palette, 0.28, { x: x * (YATAI.width / 2 + 0.05), y: 0.28, z: back }));
    group.add(...paperLantern(palette, LANTERN_COLOURS[0], { x: x * (YATAI.width / 2 + 0.1), y: YATAI.eaves + 0.02, z: front + 0.15 }, 0.12));
  }
  for (let skewer = 0; skewer < 5; skewer += 1) group.add(...dango(palette, { x: -0.25 + skewer * 0.12, y: YATAI.counter + 0.05, z: front - 0.08 }));
  for (const x of [-0.45, 0, 0.45]) group.add(...stool(palette, x, front + 0.38));
  group.add(...standingSign(palette, "だんご", { x: -YATAI.width / 2 - 0.12, z: Math.min(depth / 2 - 0.15, front + 0.5) }));
  return group;
};

/** A spoked wheel turned to roll forward (along z), `radius` big, its hub at `at`. */
function wheel(palette: Palette, radius: number, at: { x: number; y: number; z: number }): THREE.Group {
  const wood = palette.of(COLOUR.red);
  const group = new THREE.Group().add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 4, 18), palette.of(COLOUR.black)));
  for (let spoke = 0; spoke < 6; spoke += 1) {
    const bar = box(wood, { width: 0.02, height: radius * 2, depth: 0.02 }, { y: -radius });
    bar.rotation.z = (spoke / 6) * Math.PI;
    group.add(bar);
  }
  group.rotation.y = Math.PI / 2;
  group.position.set(at.x, at.y, at.z);
  return group;
}

/** A rickshaw waiting with its shafts down: big spoked wheels, a red seat under a black folding hood, shafts reaching
 *  forward to rest on the ground. */
const rickshaw: PropBuilder = (palette, { depth }) => {
  const wheelRadius = 0.36, back = -depth / 2 + 0.45;
  const hood = placed(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 10, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), twoSided(COLOUR.hood), { y: 0.95, z: back - 0.05 });
  const group = new THREE.Group().add(
    box(palette.of(COLOUR.seat), { width: 0.55, height: 0.3, depth: 0.4 }, { y: 0.45, z: back }),
    box(palette.of(COLOUR.seat), { width: 0.55, height: 0.35, depth: 0.06 }, { y: 0.72, z: back - 0.2 }),
    hood,
    wheel(palette, wheelRadius, { x: -0.33, y: wheelRadius, z: back }),
    wheel(palette, wheelRadius, { x: 0.33, y: wheelRadius, z: back }),
  );
  for (const side of [-1, 1]) {
    const shaft = box(palette.of(COLOUR.black), { width: 0.03, height: 0.03, depth: depth - 0.55 }, { x: side * 0.24, y: 0.22, z: back + (depth - 0.55) / 2 });
    shaft.rotation.x = 0.28;
    group.add(shaft);
  }
  return group;
};

/** A festival tower: four timber legs braced across, a platform hung with red and white cloth and lanterns, and a
 *  small roof over the drummer's place on top. */
const watchtower: PropBuilder = (palette, { width }) => {
  const wood = palette.of(COLOUR.pole);
  const apart = width * 0.22, floor = 2.2, roofAt = 3.3;
  const group = new THREE.Group().add(
    box(wood, { width: 2 * apart + 0.5, height: 0.1, depth: 2 * apart + 0.5 }, { y: floor }),
    placed(new THREE.CylinderGeometry(0.15, (apart + 0.55) * Math.SQRT2, 0.5, 4).rotateY(Math.PI / 4), palette.of(COLOUR.black), { y: roofAt + 0.25 }),
  );
  // The cloth round the platform, in red and white stripes.
  const sides: { x: number; z: number; turn: number }[] = [{ x: 0, z: apart + 0.26, turn: 0 }, { x: 0, z: -apart - 0.26, turn: 0 }, { x: apart + 0.26, z: 0, turn: Math.PI / 2 }, { x: -apart - 0.26, z: 0, turn: Math.PI / 2 }];
  for (const side of sides) {
    for (let stripe = 0; stripe < 6; stripe += 1) {
      const cloth = box(palette.of(stripe % 2 === 0 ? COLOUR.red : COLOUR.cloth), { width: (2 * apart + 0.5) / 6, height: 0.4, depth: 0.02 }, { x: -apart - 0.25 + (stripe + 0.5) * ((2 * apart + 0.5) / 6), y: floor - 0.3 });
      const holder = new THREE.Group().add(cloth);
      holder.rotation.y = side.turn;
      holder.position.set(side.x, 0, side.z);
      group.add(holder);
    }
  }
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      group.add(post(wood, 0.07, roofAt, { x: x * apart, z: z * apart }));
      group.add(...paperLantern(palette, LANTERN_COLOURS[(x + z + 2) % LANTERN_COLOURS.length], { x: x * (apart + 0.3), y: floor - 0.35, z: z * (apart + 0.3) }, 0.1));
    }
    const brace = box(wood, { width: 0.05, height: Math.hypot(2 * apart, floor), depth: 0.05 }, { y: -Math.hypot(2 * apart, floor) / 2 });
    brace.rotation.z = Math.atan2(2 * apart, floor) * x;
    const holder = new THREE.Group().add(brace);
    holder.position.set(0, floor / 2, x * apart);
    group.add(holder);
  }
  return group;
};

export const FESTIVAL_PROP_BUILDERS: ReadonlyMap<ShrinePropKind, PropBuilder> = new Map<ShrinePropKind, PropBuilder>([
  ["paper-lantern", paperLanternPost], ["lantern-string", lanternString], ["nobori", banner(FESTIVAL_BANNER)],
  ["nobori-tea", banner(TEA_BANNER)], ["nobori-dango", banner(DANGO_BANNER)], ["tea-bench", teaBench], ["yatai", yatai],
  ["rickshaw", rickshaw], ["watchtower", watchtower],
]);
