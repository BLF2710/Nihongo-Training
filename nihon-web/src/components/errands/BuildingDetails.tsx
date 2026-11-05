import type { CSSProperties, ReactNode } from "react";
import type { Building, BuildingLook } from "../../lib/errands/village";
import type { LookShape } from "./buildingLooks";
import { UPRIGHT_STRETCH } from "./scene3d";
import { Upright } from "./Upright";

// What makes each kind of building look like what it is: what's on its front wall (sized in em, where 1em is a tile)
// and what stands in front of it (a shrine's torii, the post office's postbox…), as 3D cards like everything else.
const ink = { stroke: "var(--village-ink)", strokeWidth: 0.04, strokeLinejoin: "round" as const };

const Sign = ({ text, className }: { text: string; className?: string }) => <span className={`village-sign ${className ?? ""}`} lang="ja">{text}</span>;
const Door = ({ className, children }: { className?: string; children?: ReactNode }) => <span className={`village-door ${className ?? ""}`}>{children}</span>;
const Window = ({ at, className, children }: { at: CSSProperties; className?: string; children?: ReactNode }) => <span className={`village-window ${className ?? ""}`} style={at}>{children}</span>;
const LEFT: CSSProperties = { left: "12%" }, RIGHT: CSSProperties = { right: "12%" };
const SidesWindows = ({ className }: { className?: string }) => <><Window at={LEFT} className={className} /><Window at={RIGHT} className={className} /></>;

type FrontProps = { building: Building };

const FRONTS: Readonly<Record<BuildingLook, (props: FrontProps) => ReactNode>> = {
  house: ({ building }) => <><Sign text={building.sign} /><Door />{building.width >= 4 && <SidesWindows />}</>,
  home: ({ building }) => <><Sign text={building.sign} /><Door className="village-door-home" /><SidesWindows className="village-window-flowers" /></>,
  bakery: ({ building }) => <><Sign text={building.sign} /><span className="village-awning" /><Door />
    {[LEFT, RIGHT].map((at, index) => <Window key={index} at={at} className="village-window-shop"><span className="village-bread" /><span className="village-bread" /></Window>)}</>,
  school: ({ building }) => <>
    <span className="village-clock"><svg viewBox="0 0 1 1" className="block size-full"><circle cx={0.5} cy={0.5} r={0.44} fill="var(--village-sign)" {...ink} strokeWidth={0.08} />
      <path d="M0.5,0.5 V0.22 M0.5,0.5 H0.7" stroke="var(--village-ink)" strokeWidth={0.07} strokeLinecap="round" /></svg></span>
    <Sign text={building.sign} className="village-sign-low" /><Door />
    {["8%", "24%"].flatMap(side => [{ left: side }, { right: side }]).map(at => <Window key={JSON.stringify(at)} at={at} />)}
    {["8%", "24%"].flatMap(side => [{ left: side }, { right: side }]).map(at => <Window key={JSON.stringify(at)} at={at} className="village-window-upper" />)}
  </>,
  "kana-school": ({ building }) => <><Sign text={building.sign} /><Door />
    <span className="village-chalkboard" lang="ja">あ ア</span><Window at={RIGHT} /></>,
  shrine: ({ building }) => <><Sign text={building.sign} className="village-plaque" />
    <span className="village-pillar" style={{ left: "3%" }} /><span className="village-pillar" style={{ right: "3%" }} />
    <span className="village-shimenawa"><svg viewBox="0 0 2 0.5" className="block size-full overflow-visible" preserveAspectRatio="none">
      <path d="M0,0.1 Q1,0.32 2,0.1" fill="none" stroke="var(--village-thatch)" strokeWidth={0.12} strokeLinecap="round" />
      {[0.5, 1, 1.5].map(x => <path key={x} d={`M${x},0.22 l0.06,0.08 l-0.08,0.06 l0.06,0.1`} fill="none" stroke="var(--village-sign)" strokeWidth={0.05} />)}
    </svg></span>
    <Door className="village-door-lattice" /></>,
  dojo: ({ building }) => <><Sign text={building.sign} className="village-plaque" /><span className="village-shoji" /></>,
  calligraphy: ({ building }) => <><Sign text={building.sign} /><Door />
    <span className="village-scroll" style={LEFT} lang="ja">永</span><span className="village-scroll" style={RIGHT} lang="ja">書</span></>,
  "post-office": ({ building }) => <><span className="village-band" /><Sign text={building.sign} /><Door /><Window at={{ left: "14%" }} /></>,
  stall: ({ building }) => <>
    {["15%", "50%", "85%"].map(left => <span key={left} className="village-chochin" style={{ left }} />)}
    <span className="village-noren" /><Sign text={building.sign} className="village-sign-on-noren" /><span className="village-counter" /></>,
  teahouse: ({ building }) => <><Sign text={building.sign} /><span className="village-round-window" /><Door><span className="village-noren-door" /></Door><Window at={RIGHT} /></>,
  "practice-hall": ({ building }) => <><Sign text={building.sign} className="village-plaque" /><Door />{building.width >= 4 && <SidesWindows />}</>,
  onsen: ({ building }) => <><Sign text={building.sign} /><Door><span className="village-noren-door village-noren-onsen">♨</span></Door><SidesWindows /></>,
};

/** What's on a building's front wall: its sign, door and windows, in the style of what the building is. */
export function BuildingFront({ building }: FrontProps) {
  const Front = FRONTS[building.look];
  return <Front building={building} />;
}

// ---- What stands in front of (or rises above) a building. Sizes in tiles.

function Torii({ building, tile }: PropsProps) {
  const width = Math.min(2.6, building.width - 0.6);
  return <Upright feet={{ x: building.x + building.width / 2, y: building.y + building.height + 0.45 }} width={width} height={2.2} tile={tile}>
    <svg viewBox="0 0 2.6 2.2" className="block size-full overflow-visible" preserveAspectRatio="none">
      <rect x={0.42} y={0.4} width={0.2} height={1.8} fill="var(--village-vermilion)" {...ink} />
      <rect x={1.98} y={0.4} width={0.2} height={1.8} fill="var(--village-vermilion)" {...ink} />
      <rect x={0.25} y={0.72} width={2.1} height={0.14} fill="var(--village-vermilion)" {...ink} />
      <rect x={1.24} y={0.42} width={0.12} height={0.3} fill="var(--village-vermilion)" {...ink} />
      <path d="M0.02,0.22 Q1.3,0.36 2.58,0.22 L2.5,0.44 Q1.3,0.52 0.1,0.44 Z" fill="var(--village-vermilion)" {...ink} />
      <path d="M0,0.16 Q1.3,0.3 2.6,0.16" fill="none" stroke="var(--village-ink)" strokeWidth={0.1} strokeLinecap="round" />
    </svg>
  </Upright>;
}

function Postbox({ building, tile }: PropsProps) {
  return <Upright feet={{ x: building.x + building.width - 0.55, y: building.y + building.height + 0.35 }} width={0.45} height={0.95} tile={tile}>
    <svg viewBox="0 0 0.45 0.95" className="block size-full overflow-visible">
      <rect x={0.08} y={0.82} width={0.29} height={0.13} fill="var(--village-ink)" />
      <rect x={0.03} y={0.1} width={0.39} height={0.74} rx={0.16} fill="var(--village-vermilion)" {...ink} />
      <rect x={0.01} y={0.06} width={0.43} height={0.1} rx={0.04} fill="var(--village-vermilion)" {...ink} />
      <rect x={0.1} y={0.3} width={0.25} height={0.05} fill="var(--village-ink)" />
      <text x={0.225} y={0.62} textAnchor="middle" fontSize={0.2} fontWeight={800} fill="var(--village-sign)">〒</text>
    </svg>
  </Upright>;
}

function StoneLantern({ building, tile }: PropsProps) {
  return <Upright feet={{ x: building.x + 0.6, y: building.y + building.height + 0.4 }} width={0.6} height={1.1} tile={tile}>
    <svg viewBox="0 0 0.6 1.1" className="block size-full overflow-visible">
      <rect x={0.1} y={0.98} width={0.4} height={0.12} fill="var(--village-stone)" {...ink} />
      <rect x={0.23} y={0.62} width={0.14} height={0.36} fill="var(--village-stone)" {...ink} />
      <rect x={0.12} y={0.56} width={0.36} height={0.08} fill="var(--village-stone)" {...ink} />
      <rect x={0.15} y={0.34} width={0.3} height={0.22} fill="var(--village-stone)" {...ink} />
      <rect x={0.23} y={0.39} width={0.14} height={0.12} className="village-lantern" />
      <path d="M0.02,0.36 L0.3,0.16 L0.58,0.36 Z" fill="var(--village-stone)" {...ink} />
      <circle cx={0.3} cy={0.12} r={0.05} fill="var(--village-stone)" {...ink} />
    </svg>
  </Upright>;
}

function TaikoAndFlags({ building, tile }: PropsProps) {
  const front = building.y + building.height + 0.4;
  return <>
    <Upright feet={{ x: building.x + 0.7, y: front }} width={0.9} height={0.95} tile={tile}>
      <svg viewBox="0 0 0.9 0.95" className="block size-full overflow-visible">
        <path d="M0.15,0.95 L0.3,0.55 M0.75,0.95 L0.6,0.55" stroke="var(--village-wood)" strokeWidth={0.06} />
        <circle cx={0.45} cy={0.42} r={0.38} fill="var(--village-vermilion)" {...ink} />
        <circle cx={0.45} cy={0.42} r={0.3} fill="var(--village-sign)" {...ink} />
        <circle cx={0.45} cy={0.42} r={0.08} fill="var(--village-ink)" fillOpacity={0.6} />
      </svg>
    </Upright>
    {[building.x + building.width - 0.25, building.x + building.width - 0.65].map((x, index) => <Upright key={x} feet={{ x, y: front }} width={0.36} height={1.7} tile={tile}>
      <svg viewBox="0 0 0.36 1.7" className="block size-full overflow-visible">
        <path d="M0.04,0 V1.7" stroke="var(--village-wood)" strokeWidth={0.05} />
        <rect x={0.06} y={0.1} width={0.26} height={1.05} fill={index === 0 ? "var(--village-indigo)" : "var(--village-moss)"} {...ink} />
        <path d="M0.12,0.25 V1.0" stroke="var(--village-sign)" strokeWidth={0.06} strokeDasharray="0.1 0.08" />
      </svg>
    </Upright>)}
  </>;
}

/** Steam from the hot spring: a card stood in the middle of the building, so only its top shows above the roof. */
function Steam({ building, tile, shape }: PropsProps) {
  const hidden = (shape.wallHeight + shape.ridgeHeight) / UPRIGHT_STRETCH, rising = 1.1;
  return <Upright feet={{ x: building.x + building.width / 2, y: building.y + building.height / 2 }} width={1.6} height={hidden + rising} tile={tile} className="village-steam">
    <svg viewBox={`0 0 1.6 ${hidden + rising}`} className="block size-full overflow-visible">
      {[0.45, 0.8, 1.15].map((x, index) => <path key={x} className="village-steam-wisp" style={{ animationDelay: `${-index * 0.9}s` }}
        d={`M${x},${rising + 0.1} q-0.15,-0.25 0,-0.5 t0,-0.5`} fill="none" stroke="var(--village-steam)" strokeWidth={0.1} strokeLinecap="round" />)}
    </svg>
  </Upright>;
}

type PropsProps = { building: Building; tile: number; shape: LookShape };

const PROPS: Partial<Record<BuildingLook, (props: PropsProps) => ReactNode>> = {
  shrine: Torii, "post-office": Postbox, teahouse: StoneLantern, "practice-hall": TaikoAndFlags, onsen: Steam,
};

/** What stands around a building because of what it is, if anything. */
export function BuildingProps(props: PropsProps) {
  const Props = PROPS[props.building.look];
  return Props ? <Props {...props} /> : null;
}
