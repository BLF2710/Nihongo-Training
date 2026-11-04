import { memo } from "react";
import type { ReactElement } from "react";
import type { Rect, Terrain, TownMap } from "../../lib/errands/townMap";

// Drawn in tile units: tile (x, y) covers x..x+1, y..y+1.
const BANK_DEPTH = 0.18;

const TILE_ART: Partial<Record<Terrain, (x: number, y: number) => ReactElement>> = {
  path: (x, y) => <rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-path)" />,
  gravel: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-gravel)" />
    <circle cx={x + 0.3} cy={y + 0.35} r={0.04} fill="var(--village-gravel-dot)" /><circle cx={x + 0.7} cy={y + 0.75} r={0.04} fill="var(--village-gravel-dot)" /></g>,
  water: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
    <path d={`M${x + 0.15},${y + 0.45} q0.17,-0.12 0.35,0 t0.35,0`} fill="none" stroke="var(--village-water-light)" strokeWidth={0.05} strokeLinecap="round" /></g>,
  bridge: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-wood-light)" />
    {[0.25, 0.5, 0.75].map(step => <path key={step} d={`M${x},${y + step} h1`} stroke="var(--village-wood)" strokeWidth={0.04} />)}
    <path d={`M${x + 0.06},${y} v1 M${x + 0.94},${y} v1`} stroke="var(--village-wood)" strokeWidth={0.1} /></g>,
  tree: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.62} rx={0.55} ry={0.3} fill="var(--village-shadow)" />,
  fence: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.55} rx={0.4} ry={0.1} fill="var(--village-shadow)" />,
  // A round patch of grass, so flowers in the gravel garden read as a planted bed (on grass it doesn't show).
  flowers: (x, y) => <g><rect x={x + 0.06} y={y + 0.08} width={0.88} height={0.84} rx={0.36} fill="var(--village-grass)" />{[[0.3, 0.35], [0.65, 0.5], [0.4, 0.72]].map(([dx, dy]) => <g key={dx}>
    <circle cx={x + dx} cy={y + dy} r={0.09} fill="var(--village-flower)" /><circle cx={x + dx} cy={y + dy} r={0.035} fill="var(--village-flower-centre)" /></g>)}</g>,
};

function Ground({ map }: { map: TownMap }) {
  return <>
    <rect width={map.width} height={map.height} fill="var(--village-grass)" />
    {map.terrain.flatMap((row, y) => row.map((tile, x) => {
      const art = TILE_ART[tile];
      // Water lies lower than the bank above it, which shows as a strip of earth.
      const hasBank = tile === "water" && map.terrain[y - 1]?.[x] !== "water";
      if (art) return <g key={`${x},${y}`}>{art(x, y)}{hasBank && <rect x={x} y={y} width={1.01} height={BANK_DEPTH} fill="var(--village-bank)" />}</g>;
      return (x * 7 + y * 3) % 5 === 0 ? <path key={`${x},${y}`} d={`M${x + 0.4},${y + 0.6} l0.05,-0.12 l0.05,0.12`} fill="none" stroke="var(--village-grass-tuft)" strokeWidth={0.04} /> : null;
    }))}
  </>;
}

/** The ground lying flat: grass, paths, water, flower beds, and the shadows of what stands on it (each building's a
 *  little wider than its walls, which stand up in VillageScenery). Memoised: it never changes while the traveller walks. */
export const VillageGround = memo(function VillageGround({ map, buildings }: { map: TownMap; buildings: readonly Rect[] }) {
  return <svg viewBox={`0 0 ${map.width} ${map.height}`} className="absolute inset-0 size-full" aria-hidden="true">
    <Ground map={map} />
    {buildings.map(({ x, y, width, height }) => <rect key={`${x},${y}`} x={x - 0.15} y={y + 0.1} width={width + 0.3} height={height + 0.12} rx={0.2} fill="var(--village-shadow)" />)}
  </svg>;
});
