import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { IslandLand, IslandWater } from "../components/islandMap/IslandArt";
import { HomeSummary, IslandPanel, ISLAND_PANEL_ID } from "../components/islandMap/IslandPanel";
import type { HomeStats } from "../components/islandMap/IslandPanel";
import { BridgeReflections, Bridges } from "../components/islandMap/Bridges";
import { CarrierPigeon, LetterPanel } from "../components/islandMap/PigeonLetter";
import { AskSensei, FujiClimb, HarbourFriends, OnsenBadges, TimeChooser } from "../components/islandMap/PlacePanels";
import { FishingBoat, FloatingLantern, SailingBoat, SceneryAbove, SceneryBelow } from "../components/islandMap/Scenery";
import { Sea } from "../components/islandMap/Sea";
import { useIslandMapData } from "../components/islandMap/useIslandMapData";
import { useMapTimeOfDay } from "../components/islandMap/useMapTimeOfDay";
import { TIMES_OF_DAY } from "../lib/timeOfDay";
import { GAME_KINDS, islandGrowth, sessionsOf, spreadStage } from "../lib/islandGrowth";
import type { GrowthFacts } from "../lib/islandGrowth";
import "../components/islandMap/IslandMap.css";
import { COURSE_LEVELS, inLevel, levelOfId, useCourseLevel } from "../lib/courseLevel";
import { useInboxSummary } from "../lib/inbox";
import { backdropCamera, BRIDGED_ISLANDS, bridgeDirections, cameraTransform, climbProgress, homeIsletDirection, courseProgress, drawingScale, islandState, ISLANDS, isBehindHome, layoutFor, nextCourseStep } from "../lib/islandMap";
import type { IslandId, IslandPlacement, MapLayout, Point, Size } from "../lib/islandMap";
import { useEmailReminder } from "../lib/emailReminder";
import { pagodaFinialTop } from "../lib/pagoda";
import { pigeonTour, pigeonWidth } from "../lib/pigeonFlight";
import { smoothOpenPath } from "../lib/svgPath";

const CAMERA_ZOOM = 1.7;
// Where the chosen island comes to rest: left of the side panel on wide screens, above the bottom sheet on phones.
const CAMERA_TARGET_LANDSCAPE = { x: 0.33, y: 0.5 };
const CAMERA_TARGET_PORTRAIT = { x: 0.5, y: 0.27 };
// Islands are drawn in depth order: water first, then land further back, bridges, Home, nearer land, and labels on top.
// A bridge is over the island behind Home it leads to and under Home, and over Home and under an island in front.
const LAYER = { water: 1, boat: 2, landBehind: 3, bridgesBehind: 4, home: 5, bridgesFront: 6, landFront: 7, labels: 8, pigeon: 9 } as const;
// Where a label sits below an island's anchor, in island-drawing units (just under the front shore).
const LABEL_DROP = 62;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--vermilion)]";

function useElementSize(ref: RefObject<HTMLElement | null>): Size {
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
function stageSize(space: Size, layout: MapLayout): Size {
  const width = Math.min(space.width, space.height * layout.aspect);
  return { width, height: width / layout.aspect };
}

export default function IslandMapPage() {
  const level = useCourseLevel();
  const { units, profile, srs, friends, overview, kanaStatistics } = useIslandMapData();
  const mapTime = useMapTimeOfDay();
  const inbox = useInboxSummary();
  const [selectedId, setSelectedId] = useState<IslandId | null>(null);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const emailReminder = useEmailReminder();
  const pigeonRef = useRef<HTMLButtonElement>(null);
  const seaRef = useRef<HTMLElement>(null);
  const islandRefs = useRef(new Map<IslandId, HTMLButtonElement>());
  const space = useElementSize(seaRef);
  const layout = layoutFor(space.width, space.height);
  const stage = stageSize(space, layout);
  const homeIslets = useMemo(() => [homeIsletDirection(layout)], [layout]);
  const bridgeDirectionsById = useMemo(() => Object.fromEntries(ISLANDS.map(({ id }) => [id, bridgeDirections(layout, id)])) as Record<IslandId, Point[]>, [layout]);
  const isPortrait = space.width < space.height;

  const progress = useMemo(() => units.status === "ready" ? courseProgress(units.value) : null, [units]);
  const nextStep = useMemo(() => units.status === "ready" ? nextCourseStep(units.value.filter(inLevel(level))) : null, [units, level]);
  const reviewsDue = srs.status === "ready" ? srs.value.dueTotal : null;
  const homeStats: HomeStats | null = profile.status === "ready"
    ? { streak: profile.value.current_streak, level: profile.value.level, levelPercent: Math.round(profile.value.xpProgress.progressPercent), reviewsDue }
    : null;
  const climb = useMemo(() => units.status === "ready" ? climbProgress(units.value, COURSE_LEVELS.map(item => item.id), levelOfId) : null, [units]);
  const friendList = friends.status === "ready" ? friends.value.friends : null;
  // What each landmark counts: levels reached on Fuji, badges by the onsen, friends' boats moored at the harbour, the
  // bell tower's time of day (a new one swings the bell), and the cards due on Review (fallen leaves on its sand).
  const levelsCompleted = climb ? climb.filter(station => station.isReached).length : null;
  const learning = overview.status === "ready" ? overview.value : null;
  const kanaCharacters = kanaStatistics.status === "ready" ? [...kanaStatistics.value.hiragana?.characters ?? [], ...kanaStatistics.value.katakana?.characters ?? []] : null;
  const growthFacts: GrowthFacts = {
    completedLessons: progress?.completedLessons ?? null,
    levelsCompleted,
    listeningSessions: learning ? sessionsOf(learning.practice, ["listening"]) : null,
    speakingSessions: learning ? sessionsOf(learning.practice, ["speaking"]) : null,
    readingSessions: learning ? sessionsOf(learning.practice, ["reading"]) : null,
    gamesPlayed: learning ? sessionsOf(learning.practice, GAME_KINDS) : null,
    cardsLearned: learning?.srs.learned ?? null,
    matureCards: learning?.srs.mature ?? null,
    kanjiMastered: learning?.kanji.mastered ?? null,
    kanaMastered: kanaCharacters ? kanaCharacters.filter(character => character.status === "mastered").length : null,
  };
  const growthOf = (id: IslandId) => islandGrowth(id, growthFacts);
  // TEMPORARY, development builds only: growth steps being previewed from the panel, by island.
  const [growthPreview, setGrowthPreview] = useState<Partial<Record<IslandId, number>>>({});
  const previewGrowth = (id: IslandId, stage: number | null) => setGrowthPreview(current =>
    Object.fromEntries([...Object.entries(current).filter(([key]) => key !== id), ...(stage === null ? [] : [[id, stage]])]));
  const stageOf = (id: IslandId) => growthPreview[id] ?? growthOf(id)?.stage ?? 0;
  const trackStagesOf = (id: IslandId) => {
    const tracks = growthOf(id)?.tracks ?? [];
    const previewed = growthPreview[id];
    return previewed === undefined ? tracks.map(track => track.stage) : spreadStage(previewed, tracks.map(track => track.maxStage));
  };
  const tallyOf = (id: IslandId) => id === "fuji" ? growthPreview.home ?? levelsCompleted ?? 0
    : id === "onsen" ? (profile.status === "ready" ? profile.value.achievements_count : 0)
    : id === "harbour" ? friendList?.filter(friend => friend.progress?.activeToday).length ?? 0
    : id === "belltower" ? TIMES_OF_DAY.indexOf(mapTime.timeOfDay)
    : id === "review" ? reviewsDue ?? 0 : 0;
  const notes: Record<string, string> = Object.fromEntries([
    ["/srs", reviewsDue ? `${reviewsDue} due` : ""],
    ["/messages", inbox?.direct ? `${inbox.direct} unread` : ""],
    ["/friends", inbox?.friendRequests ? `${inbox.friendRequests} new` : ""],
  ].filter(([, note]) => note));
  const panelExtras: Partial<Record<IslandId, ReactNode>> = {
    home: <HomeSummary stats={homeStats} nextStep={nextStep} />,
    fuji: <FujiClimb stations={units.status === "failed" ? null : climb ?? []} currentLevel={level} />,
    harbour: <HarbourFriends friends={friendList} />,
    teahouse: <AskSensei />,
    onsen: <OnsenBadges profile={profile.status === "ready" ? profile.value : null} />,
    belltower: <TimeChooser setting={mapTime.setting} clockTimeOfDay={mapTime.clockTimeOfDay} onChoose={mapTime.chooseSetting} />,
  };

  // The pigeon carries mail: unread messages, and a letter while the email is unconfirmed until that is put off for this browser session.
  const unconfirmedEmail = profile.status === "ready" && profile.value.email && !profile.value.email_verified_at ? profile.value.email : null;
  // TEMPORARY, development builds only: /map?preview=pigeon shows the pigeon for any account.
  const isPigeonPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "pigeon";
  const previewEmail = isPigeonPreview && profile.status === "ready" ? profile.value.email ?? "your email address" : null;
  const letterEmail = previewEmail ?? (emailReminder.isDismissed ? null : unconfirmedEmail);
  const openLetter = () => { setSelectedId(null); setIsLetterOpen(current => !current); };
  const unreadMessages = inbox?.direct ?? 0;
  const hasMail = letterEmail !== null || unreadMessages > 0;
  const putLetterOff = () => { emailReminder.dismiss(); setIsLetterOpen(false); islandRefs.current.get("home")?.focus(); };

  const close = useCallback(() => {
    const id = selectedId;
    setSelectedId(null);
    setIsLetterOpen(false);
    if (id) islandRefs.current.get(id)?.focus();
    else pigeonRef.current?.focus();
  }, [selectedId]);
  useEffect(() => {
    if (!selectedId && !isLetterOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, isLetterOpen, close]);

  const isOpen = (id: IslandId) => islandState(id, progress).status === "open";
  // The pigeon tours the open islands; its route (and so its flight) only changes when progress does.
  const openIslands = useMemo(() => ISLANDS.filter(island => islandState(island.id, progress).status === "open").map(island => island.id), [progress]);
  const badgeOf = (id: IslandId) => id === "review" && reviewsDue ? `${reviewsDue} due` : null;
  const bridged = BRIDGED_ISLANDS.map(island => island.id);
  const behindIds = bridged.filter(id => isBehindHome(layout, id));
  const frontIds = bridged.filter(id => !isBehindHome(layout, id));
  const bridgeDirectionsOf = (id: IslandId) => bridgeDirectionsById[id];

  const selected = ISLANDS.find(island => island.id === selectedId) ?? null;
  const cameraTarget = isPortrait ? CAMERA_TARGET_PORTRAIT : CAMERA_TARGET_LANDSCAPE;
  const camera = selected ? cameraTransform(layout.placements[selected.id], cameraTarget, CAMERA_ZOOM) : "none";
  const focus = selected ? layout.placements[selected.id] : null;

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main ref={seaRef} data-time={mapTime.timeOfDay} className="island-map island-sea relative min-h-0 flex-1 overflow-hidden">
      <Sea />
      <SkyCamera focus={focus} target={cameraTarget} stage={stage} space={space}><SceneryBelow /></SkyCamera>
      <MapHud streak={homeStats?.streak ?? null} level={homeStats?.level ?? null} hasProgressError={units.status === "failed"} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: stage.width, height: stage.height }}>
        <div className="island-camera absolute inset-0" style={{ transform: camera }} onClick={event => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <MapScenery layout={layout} stage={stage} />
          {ISLANDS.map(island => <Placed key={island.id} layout={layout} place={layout.placements[island.id]} layer={LAYER.water}><IslandWater id={island.id} /></Placed>)}
          <BridgeReflections layout={layout} />
          <Bridges layout={layout} ids={behindIds} isOpen={isOpen} style={{ zIndex: LAYER.bridgesBehind }} />
          <Bridges layout={layout} ids={frontIds} isOpen={isOpen} style={{ zIndex: LAYER.bridgesFront }} />
          <ul aria-label="Islands">
            {ISLANDS.map(island => {
              const isFogged = !isOpen(island.id);
              const layer = island.id === "home" ? LAYER.home : !island.isBridged || isBehindHome(layout, island.id) ? LAYER.landBehind : LAYER.landFront;
              return <Placed key={island.id} as="li" layout={layout} place={layout.placements[island.id]} layer={layer} isInteractive>
                <button type="button" ref={element => { if (element) islandRefs.current.set(island.id, element); else islandRefs.current.delete(island.id); }}
                  onClick={() => { setIsLetterOpen(false); setSelectedId(current => current === island.id ? null : island.id); }}
                  aria-label={`${island.name}${isFogged ? " · in fog" : ""}${badgeOf(island.id) ? `, ${badgeOf(island.id)}` : ""}`}
                  aria-expanded={selectedId === island.id} aria-controls={ISLAND_PANEL_ID}
                  className={`group relative block w-full rounded-3xl ${focus}`}>
                  <span className="block transition-[filter] duration-300 group-hover:brightness-105"><IslandLand id={island.id} isFogged={isFogged} bridgeDirections={bridgeDirectionsOf(island.id)} isletDirections={island.id === "home" ? homeIslets : undefined} tally={tallyOf(island.id)} stage={stageOf(island.id)} trackStages={trackStagesOf(island.id)} /></span>
                  {/* The label is drawn in its own top layer; this keeps it clickable as part of the island. */}
                  <span aria-hidden="true" className="absolute inset-x-[20%] top-[92%] h-8" />
                </button>
              </Placed>;
            })}
          </ul>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: LAYER.labels }}>
            {ISLANDS.map(island => <IslandLabel key={island.id} layout={layout} id={island.id} isFogged={!isOpen(island.id)} badge={badgeOf(island.id)} />)}
          </div>
          <PigeonPost ref={pigeonRef} layout={layout} stage={stage} islands={openIslands} lessonsStage={stageOf("lessons")} hasMail={hasMail} isExpanded={isLetterOpen} onOpen={openLetter} />
        </div>
      </div>
      <SkyCamera focus={focus} target={cameraTarget} stage={stage} space={space}><SceneryAbove /></SkyCamera>
      {selected && <IslandPanel island={selected} state={islandState(selected.id, progress)} nextStep={nextStep} growth={growthOf(selected.id)}
        growthPreview={import.meta.env.DEV ? { stage: growthPreview[selected.id] ?? null, onPreview: stage => previewGrowth(selected.id, stage) } : undefined}
        notes={notes} onClose={close}>{panelExtras[selected.id]}</IslandPanel>}
      {isLetterOpen && hasMail && <LetterPanel email={letterEmail} unreadMessages={unreadMessages} onLater={putLetterOff} onClose={close} />}
    </main>
  </div>;
}

function MapHud({ streak, level, hasProgressError }: { streak: number | null; level: number | null; hasProgressError: boolean }) {
  const chip = "rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 text-sm font-bold text-[var(--ink)] shadow-sm";
  return <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-2 p-3">
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      <h1 className={chip}><span aria-hidden="true" lang="ja" className="text-[var(--vermilion)]">島 </span>Island map</h1>
      {streak !== null && <p className={chip}><span aria-hidden="true">🔥 </span>{streak}<span className="sr-only"> day streak</span></p>}
      {level !== null && <p className={chip}>Lv {level}<span className="sr-only">, your level</span></p>}
      {hasProgressError && <p role="status" className={`${chip} font-normal`}>Progress could not be loaded, so every island is open.</p>}
    </div>
    <Link to="/" className={`pointer-events-auto ${chip} hover:bg-white ${focus}`}>Classic dashboard</Link>
  </div>;
}

/** Puts an island-sized drawing at its placement: anchored at the island's centre, in its depth layer. */
function Placed({ layout, place, layer, as: Tag = "div", isInteractive = false, children }: { layout: MapLayout; place: IslandPlacement; layer: number; as?: "div" | "li"; isInteractive?: boolean; children: ReactNode }) {
  return <Tag className={`absolute -translate-x-1/2 -translate-y-[71%] ${isInteractive ? "" : "pointer-events-none"}`} style={{ left: `${place.x * 100}%`, top: `${place.y * 100}%`, width: `${layout.islandWidth * place.scale * 100}%`, zIndex: layer }}>{children}</Tag>;
}

function IslandLabel({ layout, id, isFogged, badge }: { layout: MapLayout; id: IslandId; isFogged: boolean; badge: string | null }) {
  const island = ISLANDS.find(item => item.id === id);
  const place = layout.placements[id];
  if (!island) return null;
  return <span className="absolute inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border-2 border-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 text-xs font-bold text-[var(--ink)] shadow-sm sm:text-sm"
    style={{ left: `${place.x * 100}%`, top: `${place.y * 100 + LABEL_DROP * drawingScale(layout, place)}%` }}>
    <span lang="ja" className="text-[var(--vermilion)]">{island.mark}</span>
    {island.name}
    {isFogged && <span className="font-normal opacity-70 max-sm:hidden">· in fog</span>}
    {badge && <span className="rounded-full bg-[var(--vermilion)] px-1.5 text-xs text-white">{badge}</span>}
  </span>;
}

/** The sky (sun, clouds, cranes) covers the whole map area, so it follows the islands' camera in pixels. */
function SkyCamera({ focus, target, stage, space, children }: { focus: IslandPlacement | null; target: Point; stage: Size; space: Size; children: ReactNode }) {
  const stageOffset = { x: (space.width - stage.width) / 2, y: (space.height - stage.height) / 2 };
  const sky = focus ? backdropCamera({ placement: focus, target, zoom: CAMERA_ZOOM, stage, stageOffset }) : null;
  return <div className="island-camera pointer-events-none absolute inset-0" style={{ transform: sky ? `translate(${sky.x}px, ${sky.y}px) scale(${sky.zoom})` : "none" }}>{children}</div>;
}

type PigeonPostProps = { layout: MapLayout; stage: Size; islands: readonly IslandId[]; lessonsStage: number; hasMail: boolean; isExpanded: boolean; onOpen: () => void };

/** The carrier pigeon touring the open islands, in stage pixels; it always flies, carrying mail when there is some.
 *  `lessonsStage` is how far Lessons has grown, which sets the height of the pagoda it lands on. */
const PigeonPost = forwardRef<HTMLButtonElement, PigeonPostProps>(function PigeonPost({ layout, stage, islands, lessonsStage, hasMail, isExpanded, onOpen }, ref) {
  const pixelsPerUnit = stage.height / 100;
  // It perches on the pagoda's finial, which drops as Lessons grows.
  const tour = useMemo(() => pixelsPerUnit > 0 ? pigeonTour({ layout, islands, pixelsPerUnit, perches: { lessons: pagodaFinialTop(lessonsStage) } }) : null,
    [layout, islands, pixelsPerUnit, lessonsStage]);
  if (!tour) return null;
  return <div className="pointer-events-none absolute inset-0" style={{ zIndex: LAYER.pigeon }}>
    <CarrierPigeon ref={ref} tour={tour} width={pigeonWidth(layout, pixelsPerUnit)} hasMail={hasMail} isExpanded={isExpanded} onOpen={onOpen} />
  </div>;
});

/** Life on the open water where the layout has room: the boat on its lane, a fishing boat, and lanterns at night. */
function MapScenery({ layout, stage }: { layout: MapLayout; stage: Size }) {
  const { boatRoute, fishingBoat, lanterns } = layout.scenery;
  const pixelsPerUnit = stage.height / 100;
  const at = (point: Point) => ({ left: `${(point.x / (layout.aspect * 100)) * 100}%`, top: `${point.y}%` });
  return <div className="pointer-events-none absolute inset-0" style={{ zIndex: LAYER.boat }}>
    {boatRoute && pixelsPerUnit > 0 && <SailingBoat route={smoothOpenPath(boatRoute.map(point => ({ x: point.x * pixelsPerUnit, y: point.y * pixelsPerUnit })))} />}
    {fishingBoat && <div className="absolute" style={at(fishingBoat)}><FishingBoat /></div>}
    {lanterns.map((point, index) => <div key={`${point.x},${point.y}`} className="absolute" style={{ ...at(point), animationDelay: `${-index * 3}s` }}><FloatingLantern /></div>)}
  </div>;
}
