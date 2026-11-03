import type { Point } from "../../lib/svgPath";
import "./japaneseRoom.css";

// A washitsu drawn in one-point perspective (2.5D) behind the profile: the back wall faces the viewer, the side walls,
// ceiling and tatami floor recede towards the vanishing point. Drawn 1600 × 900 and cut to fit from the bottom middle.
const WIDTH = 1600, HEIGHT = 900;
const VANISHING = { x: 800, y: 380 };
// The back wall, and how far it sits from the vanishing point.
const BACK = { left: 360, right: 1240, top: 120, bottom: 560 };
const HALF_WIDTH = (BACK.right - BACK.left) / 2, ABOVE = VANISHING.y - BACK.top, BELOW = BACK.bottom - VANISHING.y;

/** A point on a side wall: `depth` 1 is the back corner and smaller is nearer; `height` 0 is the floor, 1 the ceiling. */
function onWall(side: -1 | 1, depth: number, height: number): Point {
  const floor = VANISHING.y + BELOW / depth, ceiling = VANISHING.y - ABOVE / depth;
  return { x: VANISHING.x + side * HALF_WIDTH / depth, y: floor + (ceiling - floor) * height };
}
/** A point on the floor: `across` 0 is the left wall and 1 the right, at a depth as on the walls. */
function onFloor(across: number, depth: number): Point {
  return { x: VANISHING.x + (across * 2 - 1) * HALF_WIDTH / depth, y: VANISHING.y + BELOW / depth };
}
const polygon = (points: readonly Point[]) => points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

// The nearest depth drawn, below the bottom of the picture.
const NEAR = 0.3;
const FLOOR = polygon([onFloor(0, 1), onFloor(1, 1), onFloor(1, NEAR), onFloor(0, NEAR)]);
const sideWall = (side: -1 | 1) => polygon([onWall(side, 1, 0), onWall(side, 1, 1), onWall(side, NEAR, 1), onWall(side, NEAR, 0)]);
const CEILING = polygon([onWall(-1, 1, 1), onWall(1, 1, 1), onWall(1, NEAR, 1), onWall(-1, NEAR, 1)]);

// Tatami: mats laid in rows across the room, each row split differently so the seams do not line up.
const MAT_ROWS = [1, 0.78, 0.62, 0.5, 0.41, 0.34, NEAR];
const MAT_SEAMS: readonly (readonly number[])[] = [[0.25, 0.5, 0.75], [0.375, 0.625], [0.25, 0.5, 0.75], [0.375, 0.625], [0.25, 0.5, 0.75], [0.375, 0.625]];
// Ceiling battens, running from the back wall towards the viewer.
const BATTENS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

// Shoji on each side wall: panels between these depths, up to the lintel.
const SHOJI_DEPTHS = [0.96, 0.82, 0.7, 0.6, 0.52];
const LINTEL = 0.78;
const SHOJI_BARS = [0.2, 0.4, 0.6, 0.8];

function Shoji({ side }: { side: -1 | 1 }) {
  return <g>
    {SHOJI_DEPTHS.slice(1).map((near, index) => {
      const far = SHOJI_DEPTHS[index];
      const corners = [onWall(side, far, 0), onWall(side, far, LINTEL), onWall(side, near, LINTEL), onWall(side, near, 0)];
      return <g key={near}>
        <polygon points={polygon(corners)} className="room-shoji" />
        {SHOJI_BARS.map(height => <line key={height} {...ends(onWall(side, far, LINTEL * height), onWall(side, near, LINTEL * height))} className="room-lattice" />)}
        {[1 / 3, 2 / 3].map(share => {
          const depth = 1 / (1 / far + (1 / near - 1 / far) * share);
          return <line key={share} {...ends(onWall(side, depth, 0), onWall(side, depth, LINTEL))} className="room-lattice" />;
        })}
        <polygon points={polygon(corners)} className="room-frame" />
      </g>;
    })}
    <line {...ends(onWall(side, 1, LINTEL), onWall(side, NEAR, LINTEL))} className="room-beam" />
  </g>;
}

const ends = (from: Point, to: Point) => ({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });

/** The back wall: fusuma with Fuji painted across them on the left, the tokonoma alcove with its scroll on the right. */
function BackWall() {
  const lintel = BACK.bottom - (BACK.bottom - BACK.top) * LINTEL;
  return <g>
    <rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={BACK.bottom - BACK.top} className="room-wall" />
    <rect x={BACK.left} y={lintel - 5} width={BACK.right - BACK.left} height="10" className="room-beam-fill" />
    {/* Fusuma: two sliding doors with one painting across them. */}
    <rect x="392" y={lintel + 8} width="468" height={BACK.bottom - lintel - 8} className="room-fusuma" />
    <path d={`M392,500 Q520,470 590,${lintel + 70} Q610,${lintel + 62} 630,${lintel + 70} Q700,470 860,505 L860,${BACK.bottom} L392,${BACK.bottom} Z`} className="room-painted-fuji" />
    <path d={`M574,${lintel + 92} Q590,${lintel + 68} 610,${lintel + 64} Q630,${lintel + 68} 646,${lintel + 92} L632,${lintel + 86} L622,${lintel + 100} L610,${lintel + 86} L598,${lintel + 100} L588,${lintel + 86} Z`} className="room-painted-snow" />
    <circle cx="760" cy={lintel + 60} r="22" className="room-painted-sun" />
    <path d={`M626,${lintel + 8} V${BACK.bottom}`} className="room-frame" />
    <rect x="392" y={lintel + 8} width="468" height={BACK.bottom - lintel - 8} className="room-frame" />
    {[600, 652].map(x => <ellipse key={x} cx={x} cy="470" rx="4" ry="7" className="room-pull" />)}
    {/* Tokonoma: a recessed alcove on a raised floor, with a hanging scroll and flowers. */}
    <rect x="900" y={lintel + 8} width="300" height={BACK.bottom - lintel - 8} className="room-alcove" />
    <polygon points={polygon([{ x: 900, y: 538 }, { x: 1200, y: 538 }, { x: 1212, y: BACK.bottom }, { x: 888, y: BACK.bottom }])} className="room-alcove-floor" />
    <rect x="1010" y={lintel + 22} width="58" height="168" className="room-scroll" />
    <rect x="1004" y={lintel + 18} width="70" height="6" rx="3" className="room-scroll-rod" />
    <rect x="1004" y={lintel + 188} width="70" height="6" rx="3" className="room-scroll-rod" />
    <text x="1039" y={lintel + 92} textAnchor="middle" lang="ja" className="room-scroll-text">道</text>
    <text x="1039" y={lintel + 150} textAnchor="middle" lang="ja" className="room-scroll-text">学</text>
    <path d="M1140,536 q-8,-2 -8,-16 q0,-14 8,-18 q8,4 8,18 q0,14 -8,16 Z" className="room-vase" />
    <path d="M1140,504 q-10,-40 -34,-58 M1140,504 q6,-46 30,-70 M1140,504 q-2,-30 6,-54" className="room-branch" />
    {[[1106, 446], [1170, 434], [1146, 450], [1118, 470], [1160, 462]].map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r="6" className="room-blossom" />)}
    <rect x="890" y={lintel + 8} width="12" height={BACK.bottom - lintel - 8} className="room-post" />
  </g>;
}

/** A low round table with a teapot and two cups, drawn with its top tilted towards the viewer. */
function TeaTable({ x, y }: Point) {
  return <g>
    <ellipse cx={x} cy={y + 46} rx="132" ry="26" className="room-shadow" />
    {[-80, 80].map(offset => <rect key={offset} x={x + offset - 7} y={y + 8} width="14" height="36" className="room-wood-dark" />)}
    <ellipse cx={x} cy={y + 10} rx="130" ry="34" className="room-wood-dark" />
    <ellipse cx={x} cy={y} rx="130" ry="34" className="room-wood" />
    <ellipse cx={x} cy={y} rx="112" ry="27" className="room-wood-sheen" />
    <ellipse cx={x - 20} cy={y - 4} rx="26" ry="8" className="room-shadow" />
    <path d={`M${x - 44},${y - 6} q0,-30 24,-30 q24,0 24,30 Z`} className="room-teapot" />
    <path d={`M${x + 2},${y - 22} q16,-6 18,-18`} className="room-teapot-spout" />
    <path d={`M${x - 34},${y - 34} q14,-14 28,0`} className="room-teapot-handle" />
    {[40, 74].map(offset => <g key={offset}>
      <path d={`M${x + offset - 10},${y - 14} h20 l-3,14 h-14 Z`} className="room-cup" />
      <ellipse cx={x + offset} cy={y - 14} rx="10" ry="3" className="room-tea" />
    </g>)}
  </g>;
}

/** A floor cushion, with its thickness showing. */
function Zabuton({ x, y, width }: Point & { width: number }) {
  const depth = width * 0.32, rise = 12;
  const top = [{ x: x - width / 2 + depth * 0.3, y }, { x: x + width / 2 + depth * 0.3, y }, { x: x + width / 2, y: y + depth }, { x: x - width / 2, y: y + depth }];
  return <g>
    <polygon points={polygon(top.map(point => ({ x: point.x, y: point.y + rise })))} className="room-cushion-side" />
    <polygon points={polygon(top)} className="room-cushion" />
    <circle cx={x + depth * 0.15} cy={y + depth / 2} r="4" className="room-cushion-tuft" />
  </g>;
}

/** An andon: a paper lantern on a wooden frame, its front and side lit from within. */
function Andon({ x, y }: Point) {
  return <g>
    <circle cx={x + 10} cy={y - 90} r="120" className="room-glow" />
    <ellipse cx={x + 10} cy={y + 4} rx="56" ry="12" className="room-shadow" />
    <polygon points={polygon([{ x: x + 40, y: y - 160 }, { x: x + 62, y: y - 172 }, { x: x + 62, y: y - 12 }, { x: x + 40, y }])} className="room-lantern-side" />
    <rect x={x - 40} y={y - 160} width="80" height="160" className="room-lantern" />
    <polygon points={polygon([{ x: x - 40, y: y - 160 }, { x: x - 18, y: y - 172 }, { x: x + 62, y: y - 172 }, { x: x + 40, y: y - 160 }])} className="room-wood" />
    {[y - 108, y - 56].map(bar => <line key={bar} x1={x - 40} y1={bar} x2={x + 40} y2={bar} className="room-lantern-bar" />)}
    <rect x={x - 40} y={y - 160} width="80" height="160" className="room-frame" />
    <path d={`M${x - 36},${y} v10 M${x + 36},${y} v10 M${x + 58},${y - 12} v10`} className="room-frame" />
  </g>;
}

/** A bonsai on a low stand by the wall. */
function Bonsai({ x, y }: Point) {
  return <g>
    <ellipse cx={x} cy={y + 6} rx="64" ry="10" className="room-shadow" />
    <rect x={x - 54} y={y - 20} width="108" height="22" className="room-wood-dark" />
    <rect x={x - 58} y={y - 26} width="116" height="8" className="room-wood" />
    <path d={`M${x - 34},${y - 26} l6,-18 h56 l6,18 Z`} className="room-pot" />
    <path d={`M${x},${y - 44} q-6,-24 10,-40 q-18,-10 -26,-30`} className="room-trunk" />
    {[[x - 30, y - 110, 30], [x + 22, y - 92, 26], [x - 4, y - 128, 22]].map(([cx, cy, r]) => <ellipse key={`${cx},${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.55} className="room-leaves" />)}
  </g>;
}

/** The profile's room, behind its panels (decorative). */
export function JapaneseRoom() {
  return <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="japanese-room absolute inset-0 -z-10 size-full">
    <polygon points={CEILING} className="room-ceiling" />
    {BATTENS.map(share => <line key={share} {...ends({ x: BACK.left + (BACK.right - BACK.left) * share, y: BACK.top }, { x: VANISHING.x + (BACK.left + (BACK.right - BACK.left) * share - VANISHING.x) / NEAR, y: VANISHING.y - ABOVE / NEAR })} className="room-batten" />)}
    {([-1, 1] as const).map(side => <polygon key={side} points={sideWall(side)} className="room-side-wall" />)}
    <Shoji side={-1} />
    <Shoji side={1} />
    <BackWall />
    <polygon points={FLOOR} className="room-tatami" />
    {MAT_ROWS.slice(1).map((near, row) => {
      const far = MAT_ROWS[row];
      return <g key={near}>
        <line {...ends(onFloor(0, near), onFloor(1, near))} className="room-mat-edge" />
        {MAT_SEAMS[row].map(across => <line key={across} {...ends(onFloor(across, far), onFloor(across, near))} className="room-mat-edge" />)}
      </g>;
    })}
    <polygon points={polygon([onFloor(0, 1), onFloor(1, 1), { x: BACK.right, y: BACK.bottom + 6 }, { x: BACK.left, y: BACK.bottom + 6 }])} className="room-sill" />
    <Bonsai x={250} y={640} />
    <Andon x={1440} y={700} />
    <Zabuton x={1240} y={800} width={190} />
    <TeaTable x={1330} y={730} />
    <Zabuton x={300} y={820} width={200} />
  </svg>;
}
