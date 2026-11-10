import { forwardRef, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { GuideNote } from "../cast/GuideNote";
import { BridgeReflections, Bridges } from "../islandMap/Bridges";
import { IslandLand, IslandWater } from "../islandMap/IslandArt";
import { IslandLabel, Placed } from "../islandMap/MapStage";
import { Sea } from "../islandMap/Sea";
import { islandLayer, MAP_LAYER, stageSize, useElementSize } from "../islandMap/stageLayout";
import "../islandMap/IslandMap.css";
import { GUEST_KANA_QUIZZES, GUEST_OPEN_ISLANDS, GUEST_WELCOME, introductionOf } from "../../data/guest/guestCast";
import { CastPanel } from "./CastIntroductions";
import { characterOf } from "../../lib/cast";
import { BRIDGED_ISLANDS, bridgeDirections, homeIsletDirection, ISLANDS, isBehindHome, layoutFor } from "../../lib/islandMap";
import type { Island, IslandId } from "../../lib/islandMap";
import { FirstLesson } from "./FirstLesson";
import { IntroBoat } from "./IntroBoat";
import type { Heading } from "./IntroBoat";
import { OpenSea } from "./OpenSea";
import { useVoyage } from "./useVoyage";
import { useOpeningScene } from "./useOpeningScene";
import { INTRO_ZOOM, introCameraTransform, introVoyage, voyageOffset } from "../../lib/guest/introCamera";
import "./guest.css";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--vermilion)]";
const primary = `inline-block rounded-xl bg-[var(--vermilion)] px-4 py-2.5 font-bold text-white hover:brightness-110 ${focus}`;
const secondary = `inline-block rounded-xl border-2 border-[var(--ink)]/20 bg-[var(--paper)] px-4 py-2 font-bold hover:border-[var(--vermilion)] ${focus}`;
const GUEST_PANEL_ID = "guest-island-panel";
// The boat's width, as a share of an island's.
const BOAT_WIDTH = 0.45;
const isOpenToGuests = (id: IslandId) => GUEST_OPEN_ISLANDS.includes(id);
/** What covers the map: the first lesson, or the cast introducing themselves (from Home). */
type Overlay = "lesson" | "cast" | null;

/** The island as a guest first sees it: an opening close on their traveller's boat at sea pulls back to reveal the
 *  island (the traveller drifts on open sea, then sails in to Home), in fog but for Home and Kana, with Hakase's welcome. The Kana island holds
 *  the first lesson and the speed quizzes, Home the cast's introductions; every other island says what it holds and
 *  that it opens with an account. The island is the whole page. */
export function GuestIsland() {
  const [selectedId, setSelectedId] = useState<IslandId | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const isLessonOpen = overlay === "lesson";
  const seaRef = useRef<HTMLDivElement>(null);
  const islandRefs = useRef(new Map<IslandId, HTMLButtonElement>());
  const startRef = useRef<HTMLButtonElement>(null);
  const space = useElementSize(seaRef);
  const layout = layoutFor(space.width, space.height);
  const stage = stageSize(space, layout);
  const homeIslets = [homeIsletDirection(layout)];
  const bridged = BRIDGED_ISLANDS.map(island => island.id);
  const selected = ISLANDS.find(island => island.id === selectedId) ?? null;
  const opening = useOpeningScene();
  const isRevealed = opening.phase === "done";
  const voyage = introVoyage(layout);
  const heading: Heading = voyage.to.x < voyage.from.x ? "left" : "right";
  const offset = voyageOffset(voyage, stage);
  const cameraStart = introCameraTransform(space, stage, voyage.from, INTRO_ZOOM);
  const boatStart = `translate(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px)`;
  const boatWidth = layout.islandWidth * BOAT_WIDTH * stage.width;
  const cameraRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<HTMLDivElement>(null);
  useVoyage({ phase: opening.phase, cameraRef, boatRef, cameraStart, boatStart, onLanded: opening.finish });
  const promptRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (opening.phase === "waiting") promptRef.current?.focus({ preventScroll: true }); }, [opening.phase]);
  const wasRevealed = useRef(isRevealed);
  // Once the island is revealed, focus moves on to the welcome's first action.
  useEffect(() => {
    if (isRevealed && !wasRevealed.current) startRef.current?.focus({ preventScroll: true });
    wasRevealed.current = isRevealed;
  }, [isRevealed]);

  const closePanel = () => {
    if (selectedId) islandRefs.current.get(selectedId)?.focus();
    setSelectedId(null);
  };
  const startLesson = () => { setSelectedId(null); setOverlay("lesson"); };
  const leaveLesson = () => { setOverlay(null); requestAnimationFrame(() => startRef.current?.focus()); };
  // Home stays chosen under the cast, so closing it goes back to Home's panel.
  const openCast = () => setOverlay("cast");
  const closeCast = () => setOverlay(null);
  useEffect(() => {
    if (!selectedId && !overlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (overlay === "lesson") leaveLesson(); else if (overlay === "cast") closeCast(); else closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The island fills the page. On phones the welcome sits above the sea instead of over it, so it hides no island.
  return <section aria-labelledby="guest-welcome-heading" data-time="day" className="island-map island-sea relative flex h-full min-h-0 flex-col overflow-hidden">
    {!selected && !overlay && <Welcome startRef={startRef} onStart={startLesson} className={isRevealed ? "intro-fade-in" : "invisible"} />}
    <div ref={seaRef} className={`relative min-h-0 flex-1 ${isRevealed ? "" : "overflow-hidden"}`}>
    <Sea />
    {/* Until it is revealed, the island waits under the open sea, already framed on the voyage's start. */}
    <div ref={cameraRef} className={`intro-camera absolute inset-0 ${isRevealed ? "" : "intro-camera-moving"}`} style={{ transform: isRevealed ? undefined : cameraStart }}>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: stage.width, height: stage.height }} inert={overlay !== null || !isRevealed}>
      <div className="absolute inset-0">
        <div ref={boatRef} className={`pointer-events-none absolute ${isRevealed ? "" : "intro-sailing"}`} style={{ left: `${voyage.to.x * 100}%`, top: `${voyage.to.y * 100}%`, width: `${layout.islandWidth * BOAT_WIDTH * 100}%`, zIndex: MAP_LAYER.boat, transform: isRevealed ? undefined : boatStart }}>
          <div className="-translate-x-1/2 -translate-y-[80%]"><IntroBoat heading={heading} /></div>
        </div>
        {ISLANDS.map(island => <Placed key={island.id} layout={layout} place={layout.placements[island.id]} layer={MAP_LAYER.water}><IslandWater id={island.id} /></Placed>)}
        <BridgeReflections layout={layout} />
        <Bridges layout={layout} ids={bridged.filter(id => isBehindHome(layout, id))} isOpen={isOpenToGuests} style={{ zIndex: MAP_LAYER.bridgesBehind }} />
        <Bridges layout={layout} ids={bridged.filter(id => !isBehindHome(layout, id))} isOpen={isOpenToGuests} style={{ zIndex: MAP_LAYER.bridgesFront }} />
        <ul aria-label="Islands">
          {ISLANDS.map(island => {
            const isFogged = !isOpenToGuests(island.id);
            return <Placed key={island.id} as="li" layout={layout} place={layout.placements[island.id]} layer={islandLayer(layout, island)} isInteractive>
              <button type="button" ref={element => { if (element) islandRefs.current.set(island.id, element); else islandRefs.current.delete(island.id); }}
                onClick={() => setSelectedId(current => current === island.id ? null : island.id)}
                aria-label={`${island.name}${isFogged ? " · in fog" : ""}`} aria-expanded={selectedId === island.id} aria-controls={GUEST_PANEL_ID}
                className={`group relative block w-full rounded-3xl ${focus}`}>
                <span className="block transition-[filter] duration-300 group-hover:brightness-105">
                  <IslandLand id={island.id} isFogged={isFogged} bridgeDirections={bridgeDirections(layout, island.id)} isletDirections={island.id === "home" ? homeIslets : undefined} />
                </span>
                <span aria-hidden="true" className="absolute inset-x-[20%] top-[92%] h-8" />
              </button>
            </Placed>;
          })}
        </ul>
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${isRevealed ? "" : "opacity-0"}`} style={{ zIndex: MAP_LAYER.labels }}>
          {ISLANDS.map(island => <IslandLabel key={island.id} layout={layout} id={island.id} isFogged={!isOpenToGuests(island.id)} badge={null} />)}
        </div>
      </div>
    </div>
    </div>
    </div>
    {/* The open sea fills the whole scene (on phones, the welcome's space too), with the boat at the middle of the sea area,
        where the island's camera frames it. */}
    {!isRevealed && <OpenSea boatWidth={boatWidth * INTRO_ZOOM} boatTop={`calc(100% - ${space.height / 2}px)`} heading={heading} isLeaving={opening.phase === "revealing"} />}
    {!isRevealed && <OpeningPrompt ref={promptRef} isWaiting={opening.phase === "waiting"} onClick={opening.phase === "waiting" ? opening.start : opening.finish} />}

    {selected && !overlay && <GuestIslandPanel island={selected} onClose={closePanel} onStartLesson={startLesson} onMeetCast={openCast} />}
    {isLessonOpen && <FirstLesson onLeave={leaveLesson} />}
    {overlay === "cast" && <CastPanel onClose={closeCast} />}
  </section>;
}

function Welcome({ startRef, onStart, className }: { startRef: RefObject<HTMLButtonElement | null>; onStart: () => void; className: string }) {
  return <div className={`${className} relative z-20 m-2 rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] p-3 text-[var(--ink)] sm:p-4 shadow-xl sm:absolute sm:left-4 sm:top-4 sm:m-0 sm:w-[24rem]`}>
    <h1 id="guest-welcome-heading" className="text-xl font-black leading-tight sm:text-3xl">Read your first Japanese in a minute</h1>
    <GuideNote character="hakase" mood="happy" className="mt-2 sm:mt-3">
      <p lang="ja" className="font-bold max-sm:text-sm">{GUEST_WELCOME.japanese}</p>
      <p className="text-sm sm:hidden">{GUEST_WELCOME.englishShort}</p>
      <p className="text-sm max-sm:hidden">{GUEST_WELCOME.english}</p>
    </GuideNote>
    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
      <button ref={startRef} type="button" onClick={onStart} className={primary}>Start the first lesson</button>
      <Link to="/login" className={secondary}>Sign in</Link>
    </div>
  </div>;
}

type GuestIslandPanelProps = { island: Island; onClose: () => void; onStartLesson: () => void; onMeetCast: () => void };

function GuestIslandPanel({ island, onClose, onStartLesson, onMeetCast }: GuestIslandPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, [island.id]);
  const introduction = introductionOf(island.id);
  const character = introduction?.character ?? characterOf(island.id).id;
  const isFogged = !isOpenToGuests(island.id);
  return <section id={GUEST_PANEL_ID} aria-labelledby="guest-panel-title" className="absolute z-20 flex flex-col overflow-y-auto border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-xl max-sm:inset-x-2 max-sm:bottom-2 max-sm:max-h-[55%] max-sm:rounded-2xl sm:right-4 sm:top-4 sm:w-[22rem] sm:rounded-2xl">
    <header className="flex items-start gap-3 border-b border-[var(--ink)]/20 px-5 py-4">
      <span aria-hidden="true" lang="ja" className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--vermilion)] text-2xl font-bold text-white">{island.mark}</span>
      <div className="min-w-0 flex-1">
        <h2 id="guest-panel-title" className="text-xl font-black">{island.name}</h2>
        <p className="text-sm opacity-75">{island.tagline}</p>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label={`Close ${island.name}`} className={`grid size-9 shrink-0 place-items-center rounded-lg text-xl hover:bg-[var(--ink)]/10 ${focus}`}>×</button>
    </header>
    <div className="space-y-4 px-5 py-4">
      {island.id === "home" && <>
        <GuideNote character="kon" mood="happy"><p>This will be your home: your streak, your level and your next step, all in one place.</p></GuideNote>
        <button type="button" onClick={onMeetCast} className={`${secondary} w-full`}><span aria-hidden="true">👋 </span>Meet the island</button>
      </>}
      {island.id !== "home" && introduction && <GuideNote character={character} mood={isFogged ? "calm" : "happy"}>
        <p lang="ja" className="font-bold">{introduction.japanese}</p><p className="text-sm">{introduction.english}</p>
      </GuideNote>}
      {isFogged && <p className="rounded-xl bg-[var(--ink)]/5 px-3 py-2 text-sm"><span aria-hidden="true">🌫 </span>In fog for now. It clears once you have an account and start learning.</p>}
      <div className="flex flex-wrap gap-2">
        {island.id === "kana" ? <><button type="button" onClick={onStartLesson} className={primary}>Start the first lesson</button><KanaQuizzes /></>
          : island.id === "home" ? <><Link to="/register" className={primary}>Create a free account</Link><Link to="/login" className={secondary}>Sign in</Link></>
          : <><button type="button" onClick={onStartLesson} className={primary}>Try the free lesson first</button><Link to="/register" className={secondary}>Create an account</Link></>}
      </div>
    </div>
  </section>;
}

/** The guest speed quizzes, played without an account. */
function KanaQuizzes() {
  return <ul className="w-full space-y-2" aria-label="Speed quizzes">
    {GUEST_KANA_QUIZZES.map(quiz => <li key={quiz.href}>
      <Link to={quiz.href} className={`flex items-center gap-3 rounded-xl border border-[var(--ink)]/15 bg-white/60 px-4 py-3 hover:border-[var(--vermilion)] dark:bg-black/10 ${focus}`}>
        <span aria-hidden="true" lang="ja" className="text-2xl font-bold">{quiz.mark}</span>
        <span className="min-w-0 flex-1"><span className="block font-bold">{quiz.title}</span><span className="block text-sm opacity-75">{quiz.description}</span></span>
        <span aria-hidden="true">→</span>
      </Link>
    </li>)}
  </ul>;
}

type OpeningPromptProps = { isWaiting: boolean; onClick: () => void };

/** Covers the scene during the opening: "click anywhere to start" over the boat, then a skip while the camera pulls back. */
const OpeningPrompt = forwardRef<HTMLButtonElement, OpeningPromptProps>(function OpeningPrompt({ isWaiting, onClick }, ref) {
  return <button ref={ref} type="button" onClick={onClick} aria-label={isWaiting ? "Click anywhere to start" : "Skip the opening"}
    className={`absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-between px-4 py-[8%] max-sm:justify-start max-sm:gap-6 text-center text-white transition-colors duration-700 focus-visible:outline-none ${isWaiting ? "bg-linear-to-b from-black/30 via-transparent to-black/40" : "bg-transparent"}`}>
    {isWaiting && <>
      <span className="intro-fade-in [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
        <span lang="ja" className="block text-lg font-bold tracking-[0.4em]">ようこそ</span>
        <span className="block text-5xl font-black tracking-tight sm:text-6xl">Lingora</span>
        <span className="mt-1 block text-base font-semibold sm:text-lg">An island where you learn Japanese</span>
      </span>
      <span className="intro-prompt rounded-full border-2 border-white/80 bg-black/25 px-5 py-2 text-base font-bold backdrop-blur-sm">
        <span className="intro-click">Click anywhere to start</span><span className="intro-tap">Tap anywhere to start</span>
      </span>
    </>}
  </button>;
});
