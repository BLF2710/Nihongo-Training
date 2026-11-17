import type { Building } from "../../lib/errands/village";
import { Upright } from "./Upright";

// A five-storey pagoda after the one on the island map, drawn whole as one card standing at the front of its plot (in
// tiles of the card): a stone podium, then storeys of white walls with vermilion panels, each under a slate roof whose
// eaves curve up at the tips, each a little narrower than the one below, and a spire of rings on top.
const ink = { stroke: "var(--village-ink)", strokeWidth: 0.04, strokeLinejoin: "round" as const };

const STOREYS = 5;
const CARD_WIDTH = 4.3;
const PODIUM = { height: 0.28, halfWidth: 1.55 } as const;
const STOREY = { wall: 0.5, wallShrink: 0.03, halfWidth: 1.08, halfWidthShrink: 0.13 } as const;
const ROOF = { reach: 1.95, reachShrink: 0.2, eaveDepth: 0.13, slope: 0.27, tipLift: 0.12 } as const;
const SPIRE = { height: 1.0, rings: 6, ringGap: 0.11 } as const;
/** The sign's text size, in tiles. */
const SIGN_SIZE = 0.2;
/** How far in from the front of its plot the pagoda stands. */
const FRONT_INSET = 0.35;

type StoreyShape = { bottom: number; wallTop: number; halfWidth: number; reach: number; roofTop: number };

/** Each storey's measurements, bottom up: where its wall stands and how far its roof reaches. */
function storeysOf(groundLevel: number): StoreyShape[] {
  const shapes: StoreyShape[] = [];
  let bottom = groundLevel - PODIUM.height;
  for (let storey = 0; storey < STOREYS; storey++) {
    const wallTop = bottom - (STOREY.wall - storey * STOREY.wallShrink);
    const roofTop = wallTop - ROOF.eaveDepth - ROOF.slope;
    shapes.push({ bottom, wallTop, roofTop, halfWidth: STOREY.halfWidth - storey * STOREY.halfWidthShrink, reach: ROOF.reach - storey * ROOF.reachShrink });
    bottom = roofTop + 0.06;
  }
  return shapes;
}

const cardHeight = () => {
  const shapes = storeysOf(0);
  return -(shapes[shapes.length - 1]?.roofTop ?? 0) + SPIRE.height + 0.1;
};

function Roof({ centre, shape, nextHalfWidth }: { centre: number; shape: StoreyShape; nextHalfWidth: number }) {
  const { wallTop, reach } = shape, eaveBottom = wallTop + 0.04, eaveTop = eaveBottom - ROOF.eaveDepth, inner = reach - 0.32;
  const front = `M${centre - reach},${eaveBottom - ROOF.tipLift} Q${centre - reach * 0.55},${eaveBottom + 0.03} ${centre},${eaveBottom + 0.03}`
    + ` Q${centre + reach * 0.55},${eaveBottom + 0.03} ${centre + reach},${eaveBottom - ROOF.tipLift}`
    + ` L${centre + inner},${eaveTop} L${centre - inner},${eaveTop} Z`;
  const top = `M${centre - inner},${eaveTop} L${centre + inner},${eaveTop} L${centre + nextHalfWidth + 0.08},${shape.roofTop} L${centre - nextHalfWidth - 0.08},${shape.roofTop} Z`;
  return <g>
    <path d={top} fill="var(--village-slate)" {...ink} />
    <path d={top} fill="var(--village-sign)" opacity={0.18} />
    <path d={front} fill="var(--village-slate)" {...ink} />
    {[-1, 1].map(side => <circle key={side} cx={centre + side * (reach - 0.05)} cy={eaveBottom - ROOF.tipLift + 0.1} r={0.045} fill="var(--village-lantern-on)" {...ink} strokeWidth={0.02} />)}
  </g>;
}

function Storey({ centre, shape, isGround }: { centre: number; shape: StoreyShape; isGround: boolean }) {
  const { bottom, wallTop, halfWidth } = shape, height = bottom - wallTop;
  return <g>
    <rect x={centre - halfWidth} y={wallTop} width={halfWidth * 2} height={height} fill="var(--village-wall)" {...ink} />
    {[-1, 1].map(side => <path key={side} d={`M${centre + side * (halfWidth - 0.1)},${wallTop} V${bottom}`} stroke="var(--village-wood)" strokeWidth={0.05} />)}
    {isGround
      ? <>
        <rect x={centre - 0.24} y={bottom - 0.4} width={0.48} height={0.4} fill="var(--village-vermilion)" {...ink} />
        <path d={`M${centre},${bottom - 0.4} V${bottom}`} stroke="var(--village-ink)" strokeWidth={0.025} />
      </>
      : <rect x={centre - 0.17} y={wallTop + height * 0.22} width={0.34} height={height * 0.6} fill="var(--village-vermilion)" {...ink} />}
  </g>;
}

/** A pagoda, standing on its plot with its door (the middle of its front) facing the viewer. */
export function Pagoda({ building, tile }: { building: Building; tile: number }) {
  const height = cardHeight(), centre = CARD_WIDTH / 2, shapes = storeysOf(height);
  const top = shapes[shapes.length - 1], ground = shapes[0];
  const spireFoot = top ? top.roofTop + 0.02 : 0;
  return <Upright feet={{ x: building.x + building.width / 2, y: building.y + building.height - FRONT_INSET }} width={CARD_WIDTH} height={height} tile={tile}>
    <svg viewBox={`0 0 ${CARD_WIDTH} ${height}`} className="block size-full overflow-visible" aria-hidden="true">
      <rect x={centre - PODIUM.halfWidth} y={height - PODIUM.height} width={PODIUM.halfWidth * 2} height={PODIUM.height} fill="var(--village-stone)" {...ink} />
      <path d={`M${centre - PODIUM.halfWidth},${height - PODIUM.height / 2} H${centre + PODIUM.halfWidth}`} stroke="var(--village-gravel-dot)" strokeWidth={0.03} />
      <path d={`M${centre},${spireFoot} V${spireFoot - SPIRE.height + 0.12}`} stroke="var(--village-ink)" strokeWidth={0.06} />
      {Array.from({ length: SPIRE.rings }, (_, ring) => <ellipse key={ring} cx={centre} cy={spireFoot - 0.12 - ring * SPIRE.ringGap} rx={0.12 - ring * 0.008} ry={0.035}
        fill="var(--village-lantern-on)" {...ink} strokeWidth={0.02} />)}
      <circle cx={centre} cy={spireFoot - SPIRE.height + 0.08} r={0.075} fill="var(--village-lantern-on)" {...ink} strokeWidth={0.025} />
      {/* Top down, so each roof lies over the foot of the storey above it. */}
      {shapes.map((shape, index) => ({ shape, index })).reverse().map(({ shape, index }) => <g key={index}>
        <Storey centre={centre} shape={shape} isGround={index === 0} />
        <Roof centre={centre} shape={shape} nextHalfWidth={shapes[index + 1]?.halfWidth ?? 0.12} />
      </g>)}
    </svg>
    {/* The sign is HTML like every building's: SVG text this small blurs once the card is turned upright in 3D. */}
    {ground && <span className="village-sign village-pagoda-sign" lang="ja" style={{ top: `${(ground.wallTop / height) * 100}%`, fontSize: tile * SIGN_SIZE }}>{building.sign}</span>}
  </Upright>;
}
