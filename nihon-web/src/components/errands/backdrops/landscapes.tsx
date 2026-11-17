import type { ReactElement } from "react";
import type { SceneTheme } from "../../../lib/world/sceneTheme";
import { BackdropCard, BACKDROP_HEIGHT as GROUND } from "./BackdropCard";
import type { BackdropProps, Landscape } from "./BackdropCard";
import { BambooGrove, CloudRow, Crowns, Firework, LanternStrings, PagodaSilhouette, PineSilhouette, SnowyCone, TempleSilhouette } from "./shapes";
import { ridge } from "./ridge";
import type { RidgeShape } from "./ridge";

// What lies beyond each scene's far edge, after its look (docs/WORLD.md): heights in tiles, kept under about 3.5 so they
// show over the map (see BackdropCard). Colours come from the theme (--backdrop-far, --backdrop-mid, --backdrop-near and
// the scene's own: blossom, maples, bamboo, pines, lanterns), so dark mode follows.

const Hills = ({ width, shape, fill }: { width: number; shape: RidgeShape; fill: string }) => <path d={ridge(width, shape).outline} fill={fill} />;

/** Home: blue mountains far off, and green hills dotted with trees under drifting clouds. */
const HOME: Landscape = width => {
  const near = ridge(width, { base: 0.3, amplitude: 0.8, length: 13, phase: 0.4 });
  return <>
    <CloudRow width={width} height={0.5} spacing={5} lift={2.6} fills={["var(--village-cloud-light)", "var(--village-cloud-light)"]} />
    <Hills width={width} shape={{ base: 1.3, amplitude: 1.6, length: 9, phase: 1.2 }} fill="var(--backdrop-far)" />
    <path d={near.outline} fill="var(--backdrop-near)" />
    <Crowns along={near} width={width} spacing={1.6} radius={0.3} sink={0.25} fills={["var(--village-leaf)", "var(--village-leaf-light)"]} />
  </>;
};

/** The Kana island and the meadow path: soft spring hills with a pagoda on the far one, nearer hills thick with cherry
 *  trees in bloom. */
const SAKURA: Landscape = width => {
  const far = ridge(width, { base: 1.1, amplitude: 1.0, length: 11, phase: 2 }), near = ridge(width, { base: 0.3, amplitude: 0.7, length: 8, phase: 0.7 });
  const pagodaAt = width * 0.62;
  return <>
    <path d={far.outline} fill="var(--backdrop-far)" />
    <PagodaSilhouette x={pagodaAt} foot={far.topAt(pagodaAt) + 0.2} height={2} fill="var(--backdrop-mid)" />
    <path d={near.outline} fill="var(--backdrop-near)" />
    <Crowns along={near} width={width} spacing={0.7} radius={0.38} sink={0.1} fills={["var(--village-blossom-deep)", "var(--village-blossom)"]} />
    <Crowns along={near} width={width} spacing={0.8} radius={0.36} sink={0.5} fills={["var(--village-blossom)", "var(--village-blossom-light)"]} />
  </>;
};

/** The Practice island and the riverside path: misty green hills behind a grove of bamboo. */
const BAMBOO: Landscape = width => <>
  <Hills width={width} shape={{ base: 1.6, amplitude: 1.2, length: 10, phase: 0.3 }} fill="var(--backdrop-far)" />
  <BambooGrove width={width} shortest={1.8} tallest={3} />
</>;

/** The Games island and the forest path: an evening sky with fireworks, dark hills, and festival lanterns strung across. */
const FESTIVAL: Landscape = width => <>
  <Firework x={width * 0.4} y={GROUND - 2.7} radius={0.5} colour="var(--village-lantern-on)" />
  <Firework x={width * 0.5} y={GROUND - 3.1} radius={0.4} colour="var(--village-blossom)" />
  <Firework x={width * 0.6} y={GROUND - 2.6} radius={0.45} colour="var(--village-sign)" />
  <Hills width={width} shape={{ base: 0.9, amplitude: 1.0, length: 12, phase: 1.5 }} fill="var(--backdrop-far)" />
  <Hills width={width} shape={{ base: 0.2, amplitude: 0.5, length: 7, phase: 0.2 }} fill="var(--backdrop-near)" />
  <LanternStrings width={width} height={1.7} span={7} />
</>;

/** The Lessons island and the stone path: autumn mountains with a temple hall on the far slope, maples in red and gold. */
const MAPLE: Landscape = width => {
  const far = ridge(width, { base: 1.4, amplitude: 1.3, length: 10, phase: 2.6 }), near = ridge(width, { base: 0.3, amplitude: 0.8, length: 9, phase: 1 });
  const templeAt = width * 0.4;
  return <>
    <path d={far.outline} fill="var(--backdrop-far)" />
    <TempleSilhouette x={templeAt} foot={far.topAt(templeAt) + 0.6} width={2} fill="var(--backdrop-mid)" />
    <path d={near.outline} fill="var(--backdrop-near)" />
    <Crowns along={near} width={width} spacing={0.8} radius={0.4} sink={0.12} fills={["var(--village-maple-deep)", "var(--village-maple)"]} />
    <Crowns along={near} width={width} spacing={0.9} radius={0.36} sink={0.5} fills={["var(--village-maple)", "var(--village-maple-light)", "var(--village-maple-deep)"]} />
  </>;
};

/** The Review island and the pine path: hills fading into mist like ink on paper, a pale sun, pines on the nearest. */
const ZEN: Landscape = width => {
  const near = ridge(width, { base: 0.3, amplitude: 0.6, length: 7, phase: 0.5 });
  const pines = Array.from({ length: Math.ceil(width / 2.6) }, (_, index) => index * 2.6 + (index % 3) * 0.5);
  return <>
    <circle cx={width * 0.68} cy={GROUND - 3.1} r={0.6} fill="var(--backdrop-sun)" />
    <Hills width={width} shape={{ base: 1.9, amplitude: 1.0, length: 14, phase: 2.2 }} fill="var(--backdrop-far)" />
    <Hills width={width} shape={{ base: 1.0, amplitude: 0.9, length: 10, phase: 0.9 }} fill="var(--backdrop-mid)" />
    <path d={near.outline} fill="var(--backdrop-near)" />
    {pines.map(x => <PineSilhouette key={x} x={x} foot={near.topAt(x) + 0.25} size={0.6 + (x % 3) * 0.08} fill="var(--village-pine)" />)}
  </>;
};

/** The ferry: open sea to a low line of islands, and Fuji far off to the west, where the boat is going. */
const SEA: Landscape = width => <>
  <SnowyCone middle={width * 0.3} halfWidth={6} height={2.4} />
  <Hills width={width} shape={{ base: 0, amplitude: 0.6, length: 6, phase: 0.8 }} fill="var(--backdrop-far)" />
</>;

/** Where Fuji's far peaks stand either side of the summit: [share of the width along, height]. */
const FAR_PEAKS = [[0.06, 2], [0.14, 2.8], [0.22, 1.8], [0.31, 2.5], [0.69, 2.6], [0.78, 1.7], [0.86, 2.9], [0.94, 2.1]] as const;
const FAR_PEAK_HALF_WIDTH = 3;

/** Fuji: the summit rising behind, far peaks with snow on their tips, all standing out of the sea of clouds. */
const SUMMIT: Landscape = width => <>
  {FAR_PEAKS.map(([along, height]) => {
    const x = along * width, top = GROUND - height, cap = height * 0.25, capHalfWidth = FAR_PEAK_HALF_WIDTH * 0.25;
    return <g key={along}>
      <path d={`M${x - FAR_PEAK_HALF_WIDTH},${GROUND} L${x},${top} L${x + FAR_PEAK_HALF_WIDTH},${GROUND} Z`} fill="var(--village-peak-far)" />
      <path d={`M${x - capHalfWidth},${top + cap} L${x},${top} L${x + capHalfWidth},${top + cap} L${x + 0.3},${top + cap * 0.7} L${x - 0.2},${top + cap * 0.85} Z`} fill="var(--village-snow)" />
    </g>;
  })}
  <SnowyCone middle={width / 2} halfWidth={9} height={3.6} />
  <CloudRow width={width} height={0.9} spacing={1.8} fills={["var(--village-cloud)", "var(--village-cloud-light)"]} />
</>;

/** The village square (no theme) is "home". */
export type BackdropLook = SceneTheme | "home";

const LANDSCAPES: Readonly<Record<BackdropLook, Landscape>> = {
  home: HOME, sakura: SAKURA, bamboo: BAMBOO, festival: FESTIVAL, maple: MAPLE, zen: ZEN, mountain: SEA, summit: SUMMIT,
};

/** What lies beyond the far edge of a scene with this look, under the sky. */
export function Backdrop({ look, ...props }: BackdropProps & { look: BackdropLook }): ReactElement {
  return <BackdropCard {...props} landscape={LANDSCAPES[look]} />;
}
