import { useId } from "react";
import type { ReactNode } from "react";
import type { TownMap } from "../../../lib/errands/townMap";
import { Upright } from "../Upright";

// A scene's backdrop: what lies beyond its far (north) edge under the sky (hills, groves, a far shore), drawn on one card
// stood just past the map. The camera looks steeply down, so only the top of the screen shows past the map: a card any
// further off, or scenery any taller than about 3.5 tiles, would show only its foot. Sizes are in tiles; the card's
// ground line is its bottom edge, y = BACKDROP_HEIGHT.
const DISTANCE_BEYOND_MAP = 1;
/** How far the card reaches past the map on each side, so its ends stay off screen as the camera pans. */
const REACH_PAST_MAP = 24;
/** The card is mostly sky, tall enough to reach past the top of the screen; the scenery stands in its lowest part. */
export const BACKDROP_HEIGHT = 24;

/** What a backdrop is given: the scene's map and the tile size (px). */
export type BackdropProps = { map: TownMap; tile: number };
/** Draws one look's scenery across a card `width` tiles wide. */
export type Landscape = (width: number) => ReactNode;

/** The sky behind the scenery, fading to the haze along the ground. */
function Sky({ width }: { width: number }) {
  const gradientId = useId();
  return <>
    <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
      <stop offset="0.55" stopColor="var(--village-sky-top)" />
      <stop offset="1" stopColor="var(--village-sky-horizon)" />
    </linearGradient>
    <rect width={width} height={BACKDROP_HEIGHT} fill={`url(#${gradientId})`} />
  </>;
}

/** The card: the sky, and `landscape` drawn over it. */
export function BackdropCard({ map, tile, landscape }: BackdropProps & { landscape: Landscape }) {
  const width = map.width + REACH_PAST_MAP * 2;
  return <Upright feet={{ x: map.width / 2, y: -DISTANCE_BEYOND_MAP }} width={width} height={BACKDROP_HEIGHT} tile={tile}>
    <svg viewBox={`0 0 ${width} ${BACKDROP_HEIGHT}`} className="block size-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <Sky width={width} />
      {landscape(width)}
    </svg>
  </Upright>;
}
