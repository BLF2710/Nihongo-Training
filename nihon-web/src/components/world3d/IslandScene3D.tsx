// An island in real 3D, as a React component: it hands the traveller's walk to the renderer, pins a prompt (and any
// marks) to places in the scene, and if the browser can't draw 3D (or the models won't load) lists the doors instead.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { Island3D } from "../../lib/world/islandModels";
import type { Door } from "../../lib/village/villageDoors";
import { useDarkActive } from "../../lib/theme";
import { IslandRenderer } from "./islandRenderer";
import type { TravellerState } from "./islandRenderer";
import type { ModelMaker } from "./models";
import type { SceneMarker, ScenePrompt } from "./scenePrompts";

type LoadState = "loading" | "ready" | "failed";
/** Something drawn over the scene at a place in it, moved there every frame. */
type Pinned = { at: Vector; height: number };

const PROMPT_KEY = "prompt";
const NO_MARKERS: readonly SceneMarker[] = [];

type IslandScene3DProps = {
  island: Island3D;
  /** Makes the island's models and people. Keep it the same object between renders: a new one rebuilds the scene. */
  maker: ModelMaker;
  position: Vector;
  facing: Direction;
  isWalking: boolean;
  isRunning: boolean;
  prompt: ScenePrompt | null;
  onPrompt: () => void;
  markers?: readonly SceneMarker[];
  children?: ReactNode;
};

export function IslandScene3D({ island, maker, position, facing, isWalking, isRunning, prompt, onPrompt, markers = NO_MARKERS, children }: IslandScene3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<IslandRenderer | null>(null);
  // Where the traveller starts; after that, every move is handed to the renderer as it happens.
  const startRef = useRef<TravellerState>({ position, facing, isWalking, isRunning });
  const pinnedElements = useRef(new Map<string, HTMLElement>());
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const isDark = useDarkActive();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => rendererRef.current?.resize(entry.contentRect.width, entry.contentRect.height));
    let isCurrent = true;
    const start = async () => {
      const renderer = new IslandRenderer(host, island, maker, startRef.current);
      rendererRef.current = renderer;
      observer.observe(host);
      await renderer.load();
    };
    start().then(
      () => { if (isCurrent) setLoadState("ready"); },
      (error: unknown) => { console.error(error); if (isCurrent) setLoadState("failed"); },
    );
    return () => {
      isCurrent = false;
      observer.disconnect();
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [island, maker]);

  useEffect(() => { rendererRef.current?.setTraveller({ position, facing, isWalking, isRunning }); }, [position, facing, isWalking, isRunning]);
  useEffect(() => { rendererRef.current?.setDark(isDark); }, [isDark, loadState]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const pinned = new Map<string, Pinned>(markers.map(marker => [marker.id, marker]));
    if (prompt) pinned.set(PROMPT_KEY, prompt);
    renderer.onFrame = () => {
      for (const [key, { at, height }] of pinned) {
        const element = pinnedElements.current.get(key);
        if (!element) continue;
        const point = renderer.screenPoint(at, height);
        element.style.visibility = point ? "visible" : "hidden";
        if (point) element.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -100%)`;
      }
    };
    return () => { renderer.onFrame = null; };
  }, [prompt, markers, loadState]);

  const pin = useCallback((key: string) => (element: HTMLElement | null) => {
    if (element) pinnedElements.current.set(key, element);
    else pinnedElements.current.delete(key);
  }, []);

  if (loadState === "failed") return <DoorList doors={island.doors}>{children}</DoorList>;

  // Pinned things start hidden, until the first frame puts them in place.
  return <div className="relative size-full overflow-hidden bg-sky-200 dark:bg-slate-900">
    <div ref={hostRef} className="absolute inset-0" />
    {loadState === "loading" && <p role="status" className="absolute inset-0 grid place-items-center text-sm font-semibold text-gray-700 dark:text-gray-200">Loading the island…</p>}
    {loadState === "ready" && markers.map(marker => <span key={marker.id} ref={pin(marker.id)} aria-hidden="true" style={{ visibility: "hidden" }}
      className="pointer-events-none absolute left-0 top-0 z-[650] grid size-6 place-items-center rounded-full border-2 border-gray-800 bg-amber-300 text-sm font-black text-gray-900 shadow">!</span>)}
    {loadState === "ready" && prompt && <button ref={pin(PROMPT_KEY)} type="button" tabIndex={-1} onClick={onPrompt} aria-label={prompt.label} style={{ visibility: "hidden" }}
      className="absolute left-0 top-0 z-[700] whitespace-nowrap rounded-lg border border-gray-800 bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">
      {prompt.action} <kbd className="font-mono">E</kbd></button>}
    {children}
  </div>;
}

/** The island's doors as plain links, for a browser that can't draw it. */
function DoorList({ doors, children }: { doors: readonly Door[]; children?: ReactNode }) {
  return <div className="relative grid size-full place-items-center bg-sky-100 p-4 dark:bg-slate-900">
    <nav aria-label="Places on the island" className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">This browser can't draw the island in 3D. Go straight to:</p>
      <ul className="space-y-1">{doors.map(door => <li key={door.id}><Link to={door.href} className="font-semibold text-blue-700 underline dark:text-blue-300">{door.label}</Link></li>)}</ul>
    </nav>
    {children}
  </div>;
}
