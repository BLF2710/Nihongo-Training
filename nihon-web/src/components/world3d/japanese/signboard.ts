// A building's signboard: a wooden plaque over its door with its Japanese sign painted on, which the learner reads.
// The board is built anywhere; painting its words needs a browser's canvas, so it's done only where there is one.
import * as THREE from "three";
import type { Palette } from "./shapes.ts";

const FRAME_COLOUR = "#4a3222";
const BOARD_COLOUR = "#f3e6c8";
const INK_COLOUR = "#1f1a17";
/** The board's face, in tiles, and the frame round it. */
const BOARD_HEIGHT = 0.42;
const FRAME = 0.05;
const BOARD_THICKNESS = 0.06;
/** How wide the board is for each character of its sign, and at least. */
const WIDTH_PER_CHARACTER = 0.3;
const MIN_WIDTH = 0.9;
/** Canvas pixels to a tile of board, so the words stay sharp up close. */
const PIXELS_PER_TILE = 256;
const FONT = `700 ${Math.round(BOARD_HEIGHT * PIXELS_PER_TILE * 0.7)}px "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;

/** The sign's words, painted dark on the board's pale face; null where there's no canvas to paint with. */
function paintedWords(sign: string, width: number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * PIXELS_PER_TILE);
  canvas.height = Math.round(BOARD_HEIGHT * PIXELS_PER_TILE);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = BOARD_COLOUR;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = INK_COLOUR;
  context.font = FONT;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(sign, canvas.width / 2, canvas.height / 2, canvas.width * 0.92);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** A framed board with `sign` on its front, centred on the origin and facing south. */
export function signboard(palette: Palette, sign: string): THREE.Group {
  const width = Math.max(MIN_WIDTH, [...sign].length * WIDTH_PER_CHARACTER);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 2 * FRAME, BOARD_HEIGHT + 2 * FRAME, BOARD_THICKNESS), palette.of(FRAME_COLOUR));
  const words = paintedWords(sign, width);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, BOARD_HEIGHT),
    words ? new THREE.MeshStandardMaterial({ map: words, roughness: 0.9 }) : palette.of(BOARD_COLOUR));
  face.position.z = BOARD_THICKNESS / 2 + 0.002;
  return new THREE.Group().add(frame, face);
}
