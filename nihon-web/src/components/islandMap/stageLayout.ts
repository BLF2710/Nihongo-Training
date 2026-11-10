import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import { isBehindHome } from "../../lib/islandMap";
import type { Island, MapLayout, Size } from "../../lib/islandMap";

/** The size of an element, kept up to date as it resizes. */
export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** The largest stage of the layout's aspect that fits the space. */
export function stageSize(space: Size, layout: MapLayout): Size {
  const width = Math.min(space.width, space.height * layout.aspect);
  return { width, height: width / layout.aspect };
}

// Islands are drawn in depth order: water first, then land further back, bridges, Home, nearer land, and labels on top.
// A bridge is over the island behind Home it leads to and under Home, and over Home and under an island in front.
export const MAP_LAYER = { water: 1, boat: 2, landBehind: 3, bridgesBehind: 4, home: 5, bridgesFront: 6, landFront: 7, traveller: 8, labels: 9, pigeon: 10 } as const;

/** The depth layer an island's land is drawn in. */
export function islandLayer(layout: MapLayout, island: Island): number {
  if (island.id === "home") return MAP_LAYER.home;
  return !island.isBridged || isBehindHome(layout, island.id) ? MAP_LAYER.landBehind : MAP_LAYER.landFront;
}
