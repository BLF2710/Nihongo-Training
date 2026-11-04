// The island map: which islands exist, what each leads to, when the fog over an island clears, and where islands sit.
// Pure data and rules (no React), so they run in node tests.
import { coastPointToward } from "./islandCoastline.ts";
import type { CoastlineOptions } from "./islandCoastline.ts";
import type { Point } from "./svgPath";

export type { Point };

/** Home, the six islands bridged to it, and five outlying places reached by water (Fuji, the onsen, the harbour, the tea house, the bell tower). */
export type IslandId = "home" | "lessons" | "practice" | "games" | "review" | "kanji" | "kana" | "fuji" | "harbour" | "teahouse" | "belltower" | "onsen";
export type Destination = { label: string; href: string; description: string };
/** `isBridged`: a bridge joins it to Home (the six islands of the ring). */
export type Island = { id: IslandId; name: string; mark: string; tagline: string; isBridged: boolean; destinations: readonly Destination[] };

/** The course progress the map needs, counted over every level (finished N5 lessons still count while studying N4). */
export type CourseProgress = { completedLessons: number; completedUnits: number };
/** A shape-compatible subset of the API's course unit. */
export type ProgressUnit = { completedLessons: number; completed: boolean; isPlaceholder?: boolean };

export type IslandState = { status: "open" } | { status: "fogged"; hint: string };

// The hub pages that open with a strip showing their island (components/islandMap/IslandStrip.tsx). Only hubs: lessons,
// quizzes, games, skill practice (listening, speaking and reading open straight on a question) and chats need the whole
// screen, so they have none.
const ISLAND_PAGES: Readonly<Record<string, IslandId>> = {
  "/": "home",
  "/lessons": "lessons", "/vocabulary": "lessons", "/grammar": "lessons", "/quizzes": "lessons",
  "/mistakes": "review",
  "/learn/kanji": "kanji",
  "/learn/hiragana": "kana", "/learn/katakana": "kana",
  "/levels": "fuji", "/statistics/japanese": "fuji",
  "/friends": "harbour",
  "/achievements": "onsen",
};

/** The island whose strip opens a page, or null. A page with a query (`?unit=…`) is in the middle of something, so it has none. */
export function islandForPage(pathname: string, search: string): IslandId | null {
  if (search) return null;
  return ISLAND_PAGES[pathname.replace(/(.)\/$/, "$1")] ?? null;
}

export const PRACTICE_UNLOCK_LESSONS = 1;
export const REVIEW_UNLOCK_LESSONS = 2;
export const GAMES_UNLOCK_LESSONS = 3;
export const KANJI_UNLOCK_UNITS = 1;

export const ISLANDS: readonly Island[] = [
  { id: "home", isBridged: false, name: "Home", mark: "家", tagline: "Your streak, level and next step.", destinations: [
    { label: "Village square", href: "/village", description: "Walk around: the cast has today's news and errands." },
    { label: "Classic dashboard", href: "/", description: "Every tool and statistic on one page." },
    { label: "Statistics", href: "/statistics/japanese", description: "Accuracy, time studied and test results." },
    { label: "Achievements", href: "/achievements", description: "Badges you have earned." },
  ] },
  { id: "lessons", isBridged: true, name: "Lessons", mark: "学", tagline: "Units, lessons and assessments.", destinations: [
    { label: "All units", href: "/lessons", description: "Every unit of your level and what is open." },
    { label: "Vocabulary", href: "/vocabulary", description: "Words by unit, with audio." },
    { label: "Grammar", href: "/grammar", description: "Patterns with clear examples." },
    { label: "Unit assessments", href: "/quizzes", description: "Score 80% to complete a unit." },
    { label: "Mock exam", href: "/mock-exam", description: "A timed end-of-level exam." },
  ] },
  { id: "practice", isBridged: true, name: "Practice", mark: "練", tagline: "Listen, speak and read.", destinations: [
    { label: "Listening", href: "/listening", description: "Words, sentences and dialogues." },
    { label: "Speaking", href: "/speaking", description: "Say it aloud and get checked." },
    { label: "Reading", href: "/reading", description: "Short passages with questions." },
  ] },
  { id: "games", isBridged: true, name: "Games", mark: "遊", tagline: "Play in Japanese.", destinations: [
    { label: "Island Errands", href: "/games/errands", description: "Walk the village and run errands in Japanese." },
    { label: "Particle Drop", href: "/games/particles", description: "Fill in は, を, に… against the clock." },
    { label: "Kana speed quiz", href: "/practice?type=hiragana", description: "Read kana as fast as you can." },
  ] },
  { id: "review", isBridged: true, name: "Review", mark: "復", tagline: "Keep what you have learned.", destinations: [
    { label: "Daily review", href: "/srs", description: "Spaced repetition for your words and kanji." },
    { label: "Mistake notebook", href: "/mistakes", description: "Practise the questions you got wrong." },
    { label: "Unit review", href: "/review", description: "Mixed questions per unit or level." },
  ] },
  { id: "kanji", isBridged: true, name: "Kanji", mark: "漢", tagline: "Meanings, readings and strokes.", destinations: [
    { label: "Kanji list", href: "/learn/kanji", description: "Your level's kanji and their mastery." },
    { label: "Kanji flashcards", href: "/learn/kanji/flashcards", description: "Flip through your kanji." },
    { label: "Kanji practice", href: "/learn/kanji/practice", description: "Meaning, reading and word questions." },
  ] },
  { id: "kana", isBridged: true, name: "Kana", mark: "あ", tagline: "Hiragana and katakana.", destinations: [
    { label: "Hiragana", href: "/learn/hiragana", description: "Flashcards, stroke order and writing." },
    { label: "Katakana", href: "/learn/katakana", description: "Flashcards, stroke order and writing." },
    { label: "Kana review", href: "/review/hiragana", description: "Characters you still find hard." },
  ] },
  { id: "fuji", isBridged: false, name: "Progress", mark: "進", tagline: "Your climb from N5 to N1.", destinations: [
    { label: "Choose your level", href: "/levels", description: "Move up when you are ready." },
    { label: "Mock exam", href: "/mock-exam", description: "A timed end-of-level exam." },
    { label: "Your statistics", href: "/statistics/japanese", description: "Accuracy, time studied and test results." },
  ] },
  { id: "harbour", isBridged: false, name: "Community", mark: "友", tagline: "Friends, messages and the leaderboard.", destinations: [
    { label: "Friends and leaderboard", href: "/friends", description: "Your friends and this week's XP." },
    { label: "Messages", href: "/messages", description: "Chat with your friends." },
  ] },
  { id: "teahouse", isBridged: false, name: "Assistant", mark: "師", tagline: "Ask sensei anything.", destinations: [
    { label: "Study assistant", href: "/assistant", description: "Questions about grammar, words and kanji." },
  ] },
  { id: "belltower", isBridged: false, name: "Time", mark: "時", tagline: "Dawn, day, dusk or night on the map.", destinations: [] },
  { id: "onsen", isBridged: false, name: "Achievements", mark: "賞", tagline: "An ema plaque on the rack for every badge.", destinations: [
    { label: "All achievements", href: "/achievements", description: "Badges you have earned and the ones still ahead." },
  ] },
];

/** Whether a stored or typed string names an island. */
export const isIslandId = (value: string): value is IslandId => ISLANDS.some(island => island.id === value);

/** The six islands of the ring, each joined to Home by a bridge. */
export const BRIDGED_ISLANDS = ISLANDS.filter(island => island.isBridged);

export function courseProgress(units: readonly ProgressUnit[]): CourseProgress {
  const real = units.filter(unit => !unit.isPlaceholder);
  return { completedLessons: real.reduce((sum, unit) => sum + unit.completedLessons, 0), completedUnits: real.filter(unit => unit.completed).length };
}

const lessonsLeft = (needed: number, done: number) => {
  const left = needed - done;
  return `Finish ${left === 1 ? (done === 0 ? "your first lesson" : "1 more lesson") : `${left} more lessons`} to clear the fog.`;
};

/** Fog clears as the learner studies. Without progress (still loading, or it failed) every island is open: fog never blocks. */
export function islandState(id: IslandId, progress: CourseProgress | null): IslandState {
  if (!progress) return { status: "open" };
  const byLessons = (needed: number): IslandState => progress.completedLessons >= needed ? { status: "open" } : { status: "fogged", hint: lessonsLeft(needed, progress.completedLessons) };
  switch (id) {
    case "practice": return byLessons(PRACTICE_UNLOCK_LESSONS);
    case "review": return byLessons(REVIEW_UNLOCK_LESSONS);
    case "games": return byLessons(GAMES_UNLOCK_LESSONS);
    case "kanji": return progress.completedUnits >= KANJI_UNLOCK_UNITS ? { status: "open" } : { status: "fogged", hint: "Complete Unit 1 to clear the fog." };
    default: return { status: "open" };
  }
}

/** Where an island sits, as a share of the stage (0–1), and how large it is drawn. */
export type IslandPlacement = { x: number; y: number; scale: number };
/** Decoration on open water, in stage units (see bridgeSpan): the lane a boat sails along, a fishing boat, and the paper
 *  lanterns that float there at night. */
export type MapScenery = { boatRoute: readonly Point[] | null; fishingBoat: Point | null; lanterns: readonly Point[] };
/** `aspect` is the stage's width / height; `islandWidth` is an island's width at scale 1, as a share of the stage width. */
export type MapLayout = { aspect: number; islandWidth: number; placements: Record<IslandId, IslandPlacement>; scenery: MapScenery };

// Six islands in a ring around Home; phones get a tall ring so islands stay large enough to tap.
export const LANDSCAPE_LAYOUT: MapLayout = { aspect: 1.6, islandWidth: 0.17, placements: {
  home: { x: 0.5, y: 0.5, scale: 1.25 },
  lessons: { x: 0.5, y: 0.17, scale: 1 }, kanji: { x: 0.77, y: 0.33, scale: 1 }, kana: { x: 0.77, y: 0.69, scale: 1 },
  games: { x: 0.5, y: 0.84, scale: 1 }, review: { x: 0.23, y: 0.69, scale: 1 }, practice: { x: 0.23, y: 0.33, scale: 1 },
  // Outlying places: Fuji half off the left edge (wide screens show it whole) with the onsen below it; the harbour, tea
  // house and bell tower down the right.
  fuji: { x: -0.012, y: 0.315, scale: 1.1 }, onsen: { x: 0.045, y: 0.79, scale: 0.95 },
  harbour: { x: 0.975, y: 0.2, scale: 0.9 }, teahouse: { x: 0.975, y: 0.53, scale: 0.75 }, belltower: { x: 0.95, y: 0.86, scale: 0.75 },
}, scenery: {
  // In from the left between Practice and Review, then south between Review and Home, under the Review bridge.
  boatRoute: [{ x: -60, y: 49.6 }, { x: 30, y: 49.6 }, { x: 47, y: 49.8 }, { x: 54, y: 55 }, { x: 56.6, y: 66 }, { x: 56.8, y: 85 }, { x: 57, y: 130 }],
  fishingBoat: { x: 126, y: 89 },
  lanterns: [{ x: 28, y: 97 }, { x: 104, y: 93 }, { x: 64, y: 30 }, { x: 140, y: 70 }, { x: 20, y: 56 }],
} };
export const PORTRAIT_LAYOUT: MapLayout = { aspect: 0.62, islandWidth: 0.34, placements: {
  home: { x: 0.5, y: 0.5, scale: 1.25 },
  lessons: { x: 0.5, y: 0.13, scale: 1 }, kanji: { x: 0.78, y: 0.3, scale: 1 }, kana: { x: 0.78, y: 0.7, scale: 1 },
  games: { x: 0.5, y: 0.87, scale: 1 }, review: { x: 0.22, y: 0.7, scale: 1 }, practice: { x: 0.22, y: 0.3, scale: 1 },
  // Phones have only the corners for the outlying places, so they are drawn small.
  fuji: { x: 0.85, y: 0.93, scale: 0.62 }, harbour: { x: 0.86, y: 0.1, scale: 0.6 }, teahouse: { x: 0.14, y: 0.93, scale: 0.6 },
  belltower: { x: 0.14, y: 0.12, scale: 0.55 }, onsen: { x: 0.155, y: 0.5, scale: 0.55 },
}, scenery: { boatRoute: null, fishingBoat: null, lanterns: [{ x: 56, y: 40 }, { x: 54, y: 60 }, { x: 31, y: 99 }] } };

export const layoutFor = (width: number, height: number) => width < height ? PORTRAIT_LAYOUT : LANDSCAPE_LAYOUT;

// An island's drawing (IslandArt) is 280 units wide around its anchor point, with the coast below.
export const ISLAND_DRAWING_WIDTH = 280;
/** Each island's own coastline, in drawing units; changing a seed reshapes that island. */
export const ISLAND_COASTS: Record<IslandId, CoastlineOptions> = {
  home: { radiusX: 118, radiusY: 54, seed: 3 }, lessons: { radiusX: 118, radiusY: 54, seed: 11 }, practice: { radiusX: 118, radiusY: 54, seed: 7 },
  games: { radiusX: 118, radiusY: 54, seed: 19 }, review: { radiusX: 118, radiusY: 54, seed: 23 }, kanji: { radiusX: 118, radiusY: 54, seed: 5 },
  kana: { radiusX: 118, radiusY: 54, seed: 13 },
  fuji: { radiusX: 150, radiusY: 56, seed: 29 }, harbour: { radiusX: 124, radiusY: 54, seed: 37 }, teahouse: { radiusX: 104, radiusY: 48, seed: 41 },
  belltower: { radiusX: 108, radiusY: 50, seed: 43 }, onsen: { radiusX: 124, radiusY: 54, seed: 47 },
};
// A bridge rests on the beach of the island it is drawn over (sand runs from 84% of the coast outwards), and meets
// the very edge of the island drawn over it.
const BRIDGE_RESTS_ON_BEACH = 0.92;
const BRIDGE_MEETS_SHORE = 0.99;

/** Islands further back (higher on the map) than Home: their bridge meets their front shore and Home's back shore. */
export const isBehindHome = (layout: MapLayout, id: IslandId) => layout.placements[id].y < layout.placements.home.y;

/** Stage units per unit of an island drawing at this placement. */
export const drawingScale = (layout: MapLayout, place: IslandPlacement) => (layout.islandWidth * place.scale * layout.aspect * 100) / ISLAND_DRAWING_WIDTH;

const stagePoint = (layout: MapLayout, place: IslandPlacement) => ({ x: place.x * layout.aspect * 100, y: place.y * 100 });

/** The directions (in its drawing) in which bridges leave an island, so nothing else is placed there. */
export function bridgeDirections(layout: MapLayout, id: IslandId): Point[] {
  const here = stagePoint(layout, layout.placements[id]);
  const isBridged = BRIDGED_ISLANDS.some(island => island.id === id);
  const others: readonly IslandId[] = id === "home" ? BRIDGED_ISLANDS.map(island => island.id) : isBridged ? ["home"] : [];
  return others.map(other => { const there = stagePoint(layout, layout.placements[other]); return { x: there.x - here.x, y: there.y - here.y }; });
}

/** Home's one islet sits in the water between its bridges to Kanji and Kana (a direction in its drawing). */
export function homeIsletDirection(layout: MapLayout): Point {
  const home = stagePoint(layout, layout.placements.home);
  const toward = (id: IslandId) => {
    const there = stagePoint(layout, layout.placements[id]), length = Math.hypot(there.x - home.x, there.y - home.y);
    return { x: (there.x - home.x) / length, y: (there.y - home.y) / length };
  };
  const [toKanji, toKana] = [toward("kanji"), toward("kana")];
  return { x: toKanji.x + toKana.x, y: toKanji.y + toKana.y };
}

/** A bridge from Home's shore to an island's shore, in stage units (stage width = aspect × 100, height 100). */
export function bridgeSpan(layout: MapLayout, id: IslandId): { start: Point; end: Point } {
  const [homePlace, islandPlace] = [layout.placements.home, layout.placements[id]];
  const [home, island] = [stagePoint(layout, homePlace), stagePoint(layout, islandPlace)];
  const behind = isBehindHome(layout, id);
  const landing = (centre: Point, place: IslandPlacement, coast: CoastlineOptions, toward: Point, share: number) => {
    const edge = coastPointToward(coast, toward), scale = drawingScale(layout, place) * share;
    return { x: centre.x + edge.x * scale, y: centre.y + edge.y * scale };
  };
  const direction = { x: island.x - home.x, y: island.y - home.y };
  return {
    start: landing(home, homePlace, ISLAND_COASTS.home, direction, behind ? BRIDGE_MEETS_SHORE : BRIDGE_RESTS_ON_BEACH),
    end: landing(island, islandPlace, ISLAND_COASTS[id], { x: -direction.x, y: -direction.y }, behind ? BRIDGE_RESTS_ON_BEACH : BRIDGE_MEETS_SHORE),
  };
}

/** The camera move that brings an island to `target` (shares of the stage) at `zoom`, as a CSS transform with origin 0 0. */
export type Size = { width: number; height: number };
export type BackdropCamera = { x: number; y: number; zoom: number };
/** The camera's move (`placement` to `target`, as stage shares) and where the stage sits in the map area, in pixels. */
export type BackdropCameraOptions = { placement: IslandPlacement; target: Point; zoom: number; stage: Size; stageOffset: Point };

/** The same camera move for a layer covering the whole map area, in pixels, so the sky (sun, clouds, cranes) zooms in
 *  with the islands instead of staying pinned to the screen. */
export function backdropCamera({ placement, target, zoom, stage, stageOffset }: BackdropCameraOptions): BackdropCamera {
  const inSpace = (share: Point) => ({ x: stageOffset.x + share.x * stage.width, y: stageOffset.y + share.y * stage.height });
  const island = inSpace(placement);
  const goal = inSpace(target);
  return { x: goal.x - island.x * zoom, y: goal.y - island.y * zoom, zoom };
}

export function cameraTransform(placement: IslandPlacement, target: { x: number; y: number }, zoom: number) {
  const share = (value: number) => `${((value) * 100).toFixed(2)}%`;
  return `translate(${share(target.x - placement.x * zoom)}, ${share(target.y - placement.y * zoom)}) scale(${zoom})`;
}

export type NextStepUnit = ProgressUnit & {
  id: string; number: number; allowed: boolean; assessmentUnlocked: boolean; assessmentPassed: boolean;
  lessons: readonly { slug: string; title: string; isPlaceholder: boolean; allowed: boolean; completed: boolean }[];
};
export type NextStep = { title: string; detail: string; href: string };

/** The learner's next step in a level: the next open lesson, the unit assessment once its lessons are done, or the unit list. */
export function nextCourseStep(units: readonly NextStepUnit[]): NextStep {
  const unit = units.find(item => !item.isPlaceholder && item.allowed && !item.completed);
  if (!unit) return { title: "Browse your units", detail: "See what is open and what comes next.", href: "/lessons" };
  if (unit.assessmentUnlocked && !unit.assessmentPassed) return { title: `Unit ${unit.number} assessment`, detail: "Score 80% to complete the unit.", href: `/quizzes/${unit.id}` };
  const lesson = unit.lessons.find(item => !item.isPlaceholder && item.allowed && !item.completed);
  return lesson ? { title: lesson.title, detail: `Unit ${unit.number} · next lesson`, href: `/lessons/japanese/${lesson.slug}` } : { title: "Browse your units", detail: "See what is open and what comes next.", href: "/lessons" };
}

/** One JLPT level on the climb up Fuji: units completed of its units, and whether every unit is done. */
export type ClimbStation = { level: string; completedUnits: number; totalUnits: number; isReached: boolean };

/** The climb from the first level to the last (in `levels` order), counted from the course units; placeholder units
 *  (content still coming) are left out, and a level without units is never reached. */
export function climbProgress(units: readonly (ProgressUnit & { id: string })[], levels: readonly string[], levelOf: (unitId: string) => string | null): ClimbStation[] {
  return levels.map(level => {
    const inLevel = units.filter(unit => !unit.isPlaceholder && levelOf(unit.id) === level);
    const completedUnits = inLevel.filter(unit => unit.completed).length;
    return { level, completedUnits, totalUnits: inLevel.length, isReached: inLevel.length > 0 && completedUnits === inLevel.length };
  });
}
