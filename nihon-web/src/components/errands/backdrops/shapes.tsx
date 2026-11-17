import { useId } from "react";
import { BACKDROP_HEIGHT as GROUND } from "./BackdropCard";
import type { Ridge } from "./ridge";

// The pieces backdrops are drawn from, in the card's tiles (the ground line is y = GROUND). Their variety comes from
// fixed sums of sines and remainders, not randomness, so a scene looks the same every time it is drawn.

/** A small fixed jitter in 0..1 for the `index`th thing along a row. */
const jitter = (index: number, salt: number) => ((index * 37 + salt * 11) % 17) / 17;

/** Round crowns of trees (seen far off: blossom, leaves) along a ridge, each sunk `sink` below its top. */
export function Crowns({ along, width, spacing, radius, sink, fills }: { along: Ridge; width: number; spacing: number; radius: number; sink: number; fills: readonly string[] }) {
  const count = Math.ceil(width / spacing) + 1;
  return <>
    {Array.from({ length: count }, (_, index) => {
      const x = index * spacing + (jitter(index, 1) - 0.5) * spacing * 0.6;
      const r = radius * (0.8 + jitter(index, 2) * 0.4);
      return <circle key={index} cx={x} cy={along.topAt(x) + sink} r={r} fill={fills[index % fills.length]} />;
    })}
  </>;
}

/** A five-roofed pagoda standing on the ground at (x, foot), seen as a silhouette. */
export function PagodaSilhouette({ x, foot, height, fill }: { x: number; foot: number; height: number; fill: string }) {
  const storey = height / 6, roofs = [0, 1, 2, 3, 4];
  return <g fill={fill}>
    <rect x={x - height * 0.12} y={foot - height + storey} width={height * 0.24} height={height - storey} />
    {roofs.map(level => {
      const halfWidth = height * (0.3 - level * 0.035), y = foot - storey * (level + 1);
      return <path key={level} d={`M${x - halfWidth},${y} Q${x},${y - storey * 0.55} ${x + halfWidth},${y} L${x + halfWidth * 0.7},${y - storey * 0.35} L${x - halfWidth * 0.7},${y - storey * 0.35} Z`} />;
    })}
    <rect x={x - 0.03} y={foot - height - storey * 0.4} width={0.06} height={storey * 1.4} />
  </g>;
}

/** A temple hall's sweeping roof over its walls, at (x, foot), seen as a silhouette. */
export function TempleSilhouette({ x, foot, width, fill }: { x: number; foot: number; width: number; fill: string }) {
  const wall = width * 0.22, roof = width * 0.28, half = width / 2;
  return <g fill={fill}>
    <rect x={x - half * 0.75} y={foot - wall} width={half * 1.5} height={wall} />
    <path d={`M${x - half},${foot - wall} Q${x - half * 0.6},${foot - wall - roof * 0.2} ${x - half * 0.45},${foot - wall - roof} L${x + half * 0.45},${foot - wall - roof} Q${x + half * 0.6},${foot - wall - roof * 0.2} ${x + half},${foot - wall} Z`} />
  </g>;
}

/** A pine seen far off: a trunk under flat tiers of needles. */
export function PineSilhouette({ x, foot, size, fill }: { x: number; foot: number; size: number; fill: string }) {
  const tiers = [[0.5, 0.42], [0.36, 0.68], [0.24, 0.9]] as const;
  return <g fill={fill}>
    <rect x={x - size * 0.04} y={foot - size * 0.7} width={size * 0.08} height={size * 0.7} />
    {tiers.map(([halfWidth, up]) => <ellipse key={up} cx={x + (up - 0.6) * size * 0.3} cy={foot - size * up} rx={size * halfWidth} ry={size * 0.12} />)}
  </g>;
}

/** A snow-capped cone (Fuji): concave slopes up to a flat, notched crater rim, shaded on its eastern side, the snow's
 *  lower edge ragged where it runs down the gullies (the snow is clipped to the cone, so it is drawn straight across). */
export function SnowyCone({ middle, halfWidth, height }: { middle: number; halfWidth: number; height: number }) {
  const clipId = useId();
  const crater = halfWidth * 0.1, left = middle - halfWidth, right = middle + halfWidth, rim = GROUND - height;
  const slopeBend = GROUND - height * 0.18;
  const cone = `M${left},${GROUND} Q${middle - halfWidth * 0.35},${slopeBend} ${middle - crater},${rim}`
    + ` L${middle - crater * 0.4},${rim + height * 0.055} L${middle + crater * 0.3},${rim + height * 0.02}`
    + ` L${middle + crater},${rim} Q${middle + halfWidth * 0.35},${slopeBend} ${right},${GROUND} Z`;
  const snowline = rim + height * 0.42, streaks = 14, streakWidth = (halfWidth * 2) / streaks, reach = height * 0.14;
  const snowEdge = Array.from({ length: streaks }, (_, index) => {
    const x = left + index * streakWidth, depth = index % 3 === 1 ? reach : index % 2 ? reach / 2 : reach * 0.2;
    return `L${x + streakWidth * 0.5},${snowline + depth} L${x + streakWidth},${snowline}`;
  }).join(" ");
  return <>
    <clipPath id={clipId}><path d={cone} /></clipPath>
    <path d={cone} fill="var(--village-peak)" />
    <g clipPath={`url(#${clipId})`}>
      <rect x={middle} y={rim} width={halfWidth} height={height} fill="var(--village-peak-shade)" />
      <path d={`M${left},${rim} V${snowline} ${snowEdge} V${rim} Z`} fill="var(--village-snow)" />
      <rect x={middle} y={rim} width={halfWidth} height={snowline + reach - rim} fill="var(--village-snow-shade)" opacity={0.6} />
    </g>
  </>;
}

/** A row of cloud puffs `height` tall along the ground (or, raised by `lift`, drifting in the sky). */
export function CloudRow({ width, height, spacing, lift = 0, fills }: { width: number; height: number; spacing: number; lift?: number; fills: readonly [string, string] }) {
  const puffs = Math.ceil(width / spacing) + 1, middle = GROUND - lift - height * 0.45;
  return <>
    {lift === 0 && <rect x={0} y={GROUND - height * 0.5} width={width} height={height * 0.5} fill={fills[0]} />}
    {Array.from({ length: puffs }, (_, index) => <ellipse key={index} cx={index * spacing} cy={middle}
      rx={spacing * (index % 2 ? 0.75 : 0.6)} ry={height * (index % 3 ? 0.5 : 0.7)} fill={fills[index % 2]} />)}
  </>;
}

/** A grove of bamboo seen from its edge: a dark thicket behind jointed canes of uneven height, leaves at their tops. */
export function BambooGrove({ width, shortest, tallest }: { width: number; shortest: number; tallest: number }) {
  const spacing = 0.42, count = Math.ceil(width / spacing) + 1;
  return <>
    <rect x={0} y={GROUND - shortest * 0.8} width={width} height={shortest * 0.8} fill="var(--backdrop-near)" />
    {Array.from({ length: count }, (_, index) => {
      const x = index * spacing + jitter(index, 3) * spacing * 0.5, top = GROUND - (shortest + (tallest - shortest) * jitter(index, 4));
      const joints = [0.25, 0.5, 0.75].map(share => top + (GROUND - top) * share);
      return <g key={index}>
        <rect x={x - 0.06} y={top} width={0.12} height={GROUND - top} fill={index % 3 ? "var(--village-bamboo)" : "var(--village-bamboo-light)"} />
        <path d={joints.map(y => `M${x - 0.07},${y} h0.14`).join(" ")} stroke="var(--backdrop-near)" strokeWidth={0.03} />
        <path d={`M${x},${top + 0.1} q0.25,-0.1 0.4,0.08 M${x},${top + 0.2} q-0.25,-0.06 -0.36,0.1`} fill="none" stroke="var(--village-leaf)" strokeWidth={0.07} strokeLinecap="round" />
      </g>;
    })}
  </>;
}

/** Festival lanterns strung across between poles, sagging between each pair, glowing. */
export function LanternStrings({ width, height, span }: { width: number; height: number; span: number }) {
  const y = GROUND - height, sag = span * 0.08, perSpan = 6, spans = Math.ceil(width / span);
  return <>
    {Array.from({ length: spans }, (_, index) => {
      const start = index * span, end = start + span;
      return <g key={index}>
        <path d={`M${start},${GROUND} V${y} M${start},${y} Q${start + span / 2},${y + sag * 2} ${end},${y}`} fill="none" stroke="var(--backdrop-near)" strokeWidth={0.06} />
        {Array.from({ length: perSpan - 1 }, (_, lantern) => {
          const t = (lantern + 1) / perSpan, x = start + span * t, droop = y + sag * 2 * 2 * t * (1 - t) + 0.12;
          return <g key={lantern}>
            <circle cx={x} cy={droop} r={0.3} fill="var(--village-lantern-on)" opacity={0.3} />
            <ellipse cx={x} cy={droop} rx={0.12} ry={0.15} fill="var(--village-lantern-on)" />
          </g>;
        })}
      </g>;
    })}
  </>;
}

/** A firework bursting at (x, y): rays out from the middle, a spark at the end of each. */
export function Firework({ x, y, radius, colour }: { x: number; y: number; radius: number; colour: string }) {
  const rays = 14;
  return <g stroke={colour} strokeWidth={0.05} strokeLinecap="round" fill={colour}>
    {Array.from({ length: rays }, (_, index) => {
      const angle = (index / rays) * Math.PI * 2, inner = radius * 0.3;
      const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
      return <g key={index}>
        <path d={`M${x + cos * inner},${y + sin * inner} L${x + cos * radius},${y + sin * radius}`} />
        <circle cx={x + cos * radius * 1.12} cy={y + sin * radius * 1.12} r={0.05} stroke="none" />
      </g>;
    })}
  </g>;
}
