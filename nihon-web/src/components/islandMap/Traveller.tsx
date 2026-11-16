import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { drawingScale } from "../../lib/islandMap";
import type { IslandId, MapLayout, Point, Size } from "../../lib/islandMap";
import type { TravellerLook } from "../../lib/travellerLook";
import { useTravellerLook } from "../../lib/useTravellerLook";
import { TravellerFigure } from "../traveller/TravellerFigure";
import { journey, recallIsland, rememberIsland, standingPoint, walkLength, walkSteps, WALKING_SPEED } from "../../lib/traveller";

// The traveller's height on the map, in Home's drawing units, so it scales with the islands like the pigeon.
const TRAVELLER_HEIGHT_UNITS = 46;
const FERRY_FADE_MS = 350;

/** The learner's traveller, facing right, in their own look (or `look`, for a preview). Its legs step while
 *  `isWalking`. */
export function TravellerArt({ isWalking = false, look }: { isWalking?: boolean; look?: TravellerLook }) {
  const ownLook = useTravellerLook();
  return <TravellerFigure look={look ?? ownLook} isWalking={isWalking} />;
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
