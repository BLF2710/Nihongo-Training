import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { drawingScale } from "../../lib/islandMap";
import type { IslandId, MapLayout, Point, Size } from "../../lib/islandMap";
import { journey, recallIsland, rememberIsland, standingPoint, walkLength, walkSteps, WALKING_SPEED } from "../../lib/traveller";

const ink = { stroke: "var(--ink)", strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
// The traveller's height on the map, in Home's drawing units, so it scales with the islands like the pigeon.
const TRAVELLER_HEIGHT_UNITS = 46;
const FERRY_FADE_MS = 350;

/** The learner's traveller, facing right: a straw kasa hat, an indigo kimono with a red obi, and a bundle on a stick.
 *  Its legs step while `isWalking`. */
export function TravellerArt({ isWalking = false }: { isWalking?: boolean }) {
  return <svg viewBox="0 0 24 36" className={`block h-full w-auto overflow-visible ${isWalking ? "traveller-walking" : ""}`} aria-hidden="true">
    <ellipse cx="12" cy="34.6" rx="6.5" ry="1.3" fill="var(--ink)" opacity="0.18" />
    <path d="M7,16 L1.5,8.5" stroke="var(--wood)" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="1.8" cy="8.2" r="3" fill="var(--leaf)" {...ink} />
    <path d="M0.4,7.4 l1,1 M2.6,6.6 l1,1 M1.6,9.6 l1,1" stroke="var(--paper)" strokeWidth="0.7" strokeLinecap="round" />
    <g className="traveller-leg traveller-leg-back"><path d="M10.4,26 L10,33.4" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" /><path d="M10,33.4 h-0.4" stroke="var(--paper)" strokeWidth="1.6" strokeLinecap="round" /></g>
    <g className="traveller-leg traveller-leg-front"><path d="M13.6,26 L14,33.4" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" /><path d="M14,33.4 h0.6" stroke="var(--paper)" strokeWidth="1.6" strokeLinecap="round" /></g>
    <path d="M7.4,14.6 L16.6,14.6 L18.2,27 L5.8,27 Z" fill="var(--traveller-kimono)" {...ink} />
    <path d="M12,14.6 L14.2,18.8" stroke="var(--paper)" strokeWidth="1" strokeLinecap="round" />
    <path d="M6.6,19.6 h10.8 v2.3 h-10.8 Z" fill="var(--vermilion)" {...ink} strokeWidth="0.8" />
    <path d="M15.8,16 L18,21.4" stroke="var(--traveller-kimono)" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="18.1" cy="21.8" r="1.1" fill="var(--traveller-skin)" />
    <circle cx="12" cy="12" r="3.5" fill="var(--traveller-skin)" {...ink} />
    <circle cx="13.6" cy="12.3" r="0.55" fill="var(--ink)" />
    <path d="M1.5,10 L12,1.5 L22.5,10 Q12,12.2 1.5,10 Z" fill="var(--straw)" {...ink} />
    <path d="M6,6.5 L12,1.5 M18,6.5 L12,1.5 M12,1.5 L12,11" stroke="var(--wood)" strokeWidth="0.5" opacity="0.6" />
  </svg>;
}

/** Stands in an island's strip on hub pages, having just walked in; the map stands it on the same island. */
export function StripTraveller({ id }: { id: IslandId }) {
  useEffect(() => { rememberIsland(id); }, [id]);
  return <span aria-hidden="true" className="traveller-arrive absolute bottom-[34%] left-[18%] block h-8 sm:h-9"><TravellerArt /></span>;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const facing = (isFacingRight: boolean) => isFacingRight ? "scaleX(1)" : "scaleX(-1)";
const pathThrough = (points: readonly Point[], pixelsPerUnit: number) =>
  `M${points.map(point => `${(point.x * pixelsPerUnit).toFixed(1)},${(point.y * pixelsPerUnit).toFixed(1)}`).join(" L")}`;

type MapTravellerProps = { layout: MapLayout; stage: Size; destination: IslandId | null };

/** The traveller on the map: standing on the island last visited, it walks the bridges to the island picked (or takes the
 *  ferry to an outlying place) and stays there. With reduced motion it simply appears there. */
export function MapTraveller({ layout, stage, destination }: MapTravellerProps) {
  const [at, setAt] = useState<IslandId>(recallIsland);
  const rootRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<HTMLSpanElement>(null);
  const pixelsPerUnit = stage.height / 100;
  const route = useMemo(() => destination && destination !== at ? journey(layout, at, destination) : null, [layout, at, destination]);
  const walk = route?.kind === "walk" && !prefersReducedMotion() ? route.points : null;

  // A ferry fades the traveller out and back in on the far shore; with reduced motion every journey is instant.
  useEffect(() => {
    if (!route || !destination || walk) return;
    const timer = window.setTimeout(() => { setAt(destination); rememberIsland(destination); }, route.kind === "ferry" ? FERRY_FADE_MS : 0);
    return () => window.clearTimeout(timer);
  }, [route, destination, walk]);

  useEffect(() => {
    const root = rootRef.current, turn = turnRef.current;
    if (!walk || !root || !turn || !destination) return;
    const duration = (walkLength(walk) / WALKING_SPEED) * 1000;
    const steps = walkSteps(walk);
    const moving = root.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], { duration, easing: "linear", fill: "forwards" });
    const turning = turn.animate([{ offset: 0, transform: facing(steps[0].isFacingRight) }, ...steps.flatMap((step, index) => index === 0 ? [] : [
      { offset: steps[index - 1].end, transform: facing(steps[index - 1].isFacingRight) }, { offset: steps[index - 1].end, transform: facing(step.isFacingRight) },
    ]), { offset: 1, transform: facing(steps[steps.length - 1].isFacingRight) }], { duration, fill: "forwards" });
    moving.onfinish = () => { setAt(destination); rememberIsland(destination); };
    return () => { moving.cancel(); turning.cancel(); };
  }, [walk, destination]);

  const standing = useMemo(() => standingPoint(layout, at), [layout, at]);
  if (pixelsPerUnit <= 0) return null;
  const points = walk ?? [standing, { x: standing.x + 0.01, y: standing.y }];
  const isAboard = route?.kind === "ferry" && !prefersReducedMotion();
  const style: CSSProperties = { offsetPath: `path("${pathThrough(points, pixelsPerUnit)}")`, opacity: isAboard ? 0 : 1, transition: `opacity ${FERRY_FADE_MS}ms` };
  const height = TRAVELLER_HEIGHT_UNITS * drawingScale(layout, layout.placements.home) * pixelsPerUnit;
  return <div ref={rootRef} aria-hidden="true" className="island-traveller" style={style}>
    <span ref={turnRef} className="block" style={{ height }}><TravellerArt isWalking={walk !== null} /></span>
  </div>;
}
