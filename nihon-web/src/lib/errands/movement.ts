// Walking around the village: speed, collisions with blocked tiles, facing, and who is close enough to talk to.
// Positions are in tiles, measured at the traveller's feet; tile (x, y) covers x..x+1 and y..y+1.

export type Vector = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
/** Whether a tile can't be walked through (see townMap's isBlocked). */
export type IsBlocked = (x: number, y: number) => boolean;

/** Tiles per second. */
export const WALK_SPEED = 4.5;
/** The traveller's feet: a box this far either side of the position, so they fit through a one-tile gap. */
export const FEET_HALF_WIDTH = 0.3;
export const FEET_HALF_DEPTH = 0.2;
/** How near (from feet to the middle of someone's tile) the traveller must be to talk to someone. */
export const TALK_DISTANCE = 1.6;
/** A slow frame is walked in steps this long, so the traveller never jumps through a wall… */
export const MAX_STEP_SECONDS = 0.05;
/** …and a very long one (a background tab coming back) counts as this long, so they don't wander off. */
export const MAX_FRAME_SECONDS = 0.25;

const DIRECTION_VECTORS: Readonly<Record<Direction, Vector>> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

/** The direction held, as a vector of length 1 (0 when nothing, or two opposite keys, are held). */
export function heldDirection(held: ReadonlySet<Direction>): Vector {
  let x = 0, y = 0;
  for (const direction of held) { x += DIRECTION_VECTORS[direction].x; y += DIRECTION_VECTORS[direction].y; }
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}

const fitsAt = ({ x, y }: Vector, isBlocked: IsBlocked) => {
  const left = Math.floor(x - FEET_HALF_WIDTH), right = Math.floor(x + FEET_HALF_WIDTH - 1e-6);
  const top = Math.floor(y - FEET_HALF_DEPTH), bottom = Math.floor(y + FEET_HALF_DEPTH - 1e-6);
  for (let row = top; row <= bottom; row++) for (let column = left; column <= right; column++) if (isBlocked(column, row)) return false;
  return true;
};

/** Where the traveller ends up after walking `direction` for `seconds`, at the same speed however slow the frames. */
export function walk(from: Vector, direction: Vector, seconds: number, isBlocked: IsBlocked): Vector {
  let position = from;
  for (let left = Math.min(seconds, MAX_FRAME_SECONDS); left > 0; left -= MAX_STEP_SECONDS) position = walkStep(position, direction, Math.min(left, MAX_STEP_SECONDS), isBlocked);
  return position;
}

/** As far as `at` can move by `move` along one axis before the feet (`half` either side) touch the next tile's edge. */
const upToEdge = (at: number, move: number, half: number) =>
  move > 0 ? Math.max(at, Math.floor(at + half + move) - half) : Math.min(at, Math.ceil(at - half + move) + half);

/** One short step. Each axis is tried on its own, so walking diagonally into a wall slides along it instead of stopping;
 *  walking into a wall stops right at it. */
function walkStep(from: Vector, direction: Vector, seconds: number, isBlocked: IsBlocked): Vector {
  const distance = WALK_SPEED * seconds;
  const moveAlong = (position: Vector, axis: "x" | "y", half: number): Vector => {
    const move = direction[axis] * distance;
    if (move === 0) return position;
    const moved = { ...position, [axis]: position[axis] + move };
    if (fitsAt(moved, isBlocked)) return moved;
    const atEdge = { ...position, [axis]: upToEdge(position[axis], move, half) };
    return fitsAt(atEdge, isBlocked) ? atEdge : position;
  };
  return moveAlong(moveAlong(from, "x", FEET_HALF_WIDTH), "y", FEET_HALF_DEPTH);
}

/** Which way the traveller faces while walking `direction`; standing still keeps the last facing. */
export function facingOf(direction: Vector, previous: Direction): Direction {
  if (direction.x === 0 && direction.y === 0) return previous;
  if (Math.abs(direction.x) >= Math.abs(direction.y)) return direction.x < 0 ? "left" : "right";
  return direction.y < 0 ? "up" : "down";
}

/** The nearest of `people` (each standing on a tile) within talking distance, or null. */
export function nearestWithin<T extends { tile: Vector }>(position: Vector, people: readonly T[], distance = TALK_DISTANCE): T | null {
  let nearest: T | null = null, best = distance;
  for (const person of people) {
    const away = Math.hypot(person.tile.x + 0.5 - position.x, person.tile.y + 0.5 - position.y);
    if (away <= best) { nearest = person; best = away; }
  }
  return nearest;
}
