// An island in real 3D, as a React component: it hands the traveller's walk to the renderer, shows a prompt over the
// door they're standing at, and if the browser can't draw 3D (or the models won't load) lists the doors instead.
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { Island3D } from "../../lib/world/islandModels";
import type { Door } from "../../lib/village/villageDoors";
import { useDarkActive } from "../../lib/theme";
import { IslandRenderer } from "./islandRenderer";
import type { TravellerState } from "./islandRenderer";

/** How high above the door's tile the prompt floats, in tiles (about a door's height). */
const DOOR_PROMPT_HEIGHT = 1.6;

type LoadState = "loading" | "ready" | "failed";

type IslandScene3DProps = {
  island: Island3D;
  position: Vector;
  facing: Direction;
  isWalking: boolean;
  isRunning: boolean;
  nearbyDoor: Door | null;
  onEnterDoor: () => void;
  children?: ReactNode;
};

export function IslandScene3D({ island, position, facing, isWalking, isRunning, nearbyDoor, onEnterDoor, children }: IslandScene3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLButtonElement>(null);
  const rendererRef = useRef<IslandRenderer | null>(null);
  // Where the traveller starts; after that, every move is handed to the renderer as it happens.
  const startRef = useRef<TravellerState>({ position, facing, isWalking, isRunning });
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const isDark = useDarkActive();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => rendererRef.current?.resize(entry.contentRect.width, entry.contentRect.height));
    let isCurrent = true;
    const start = async () => {
      const renderer = new IslandRenderer(host, island, startRef.current);
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
  }, [island]);

  useEffect(() => { rendererRef.current?.setTraveller({ position, facing, isWalking, isRunning }); }, [position, facing, isWalking, isRunning]);
  useEffect(() => { rendererRef.current?.setDark(isDark); }, [isDark, loadState]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.onFrame = () => {
      const prompt = promptRef.current;
      if (!prompt || !nearbyDoor) return;
      const point = renderer.screenPoint({ x: nearbyDoor.tile.x + 0.5, y: nearbyDoor.tile.y + 0.5 }, DOOR_PROMPT_HEIGHT);
      prompt.style.visibility = point ? "visible" : "hidden";
      if (point) prompt.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -100%)`;
    };
    return () => { renderer.onFrame = null; };
  }, [nearbyDoor, loadState]);

  if (loadState === "failed") return <DoorList doors={island.doors}>{children}</DoorList>;

  return <div className="relative size-full overflow-hidden bg-sky-200 dark:bg-slate-900">
    <div ref={hostRef} className="absolute inset-0" />
    {loadState === "loading" && <p role="status" className="absolute inset-0 grid place-items-center text-sm font-semibold text-gray-700 dark:text-gray-200">Loading the island…</p>}
    {loadState === "ready" && nearbyDoor && <button ref={promptRef} type="button" tabIndex={-1} onClick={onEnterDoor}
      aria-label={nearbyDoor.action ? nearbyDoor.label : `Go into ${nearbyDoor.label.toLowerCase()}`}
      className="absolute left-0 top-0 z-[700] whitespace-nowrap rounded-lg border border-gray-800 bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">
      {nearbyDoor.action ?? "Enter"} <kbd className="font-mono">E</kbd></button>}
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
