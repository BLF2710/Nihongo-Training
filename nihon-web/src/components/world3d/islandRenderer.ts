// Draws an island in real 3D with three.js: its ground, its models and people standing in sunlight with real shadows,
// and the traveller walking among them, seen from above at the 2.5D scenes' angle by a camera that follows them.
import * as THREE from "three";
import type { Direction, Vector } from "../../lib/errands/movement";
import { cameraDistance, drawnTowards, personPosition } from "../../lib/world/islandModels";
import type { Island3D } from "../../lib/world/islandModels";
import { buildGround } from "./ground";
import { FallingPetals, PETAL_LOOKS } from "./fallingPetals";
import { LivelyWater } from "./water";
import { SwimmingKoi } from "./koi";
import { cloudBanks } from "./clouds";
import { mergedByMaterial } from "./mergeStatic";
import type { ModelMaker } from "./models";
import type { IslandWalker, Motion } from "./walkers";

/** The camera looks down at the scenes' angle (their ground is tipped 50° back, so seen from 40° above), through a
 *  narrow lens, so things far off aren't much smaller than things near. */
const ELEVATION_DEGREES = 40;
const FIELD_OF_VIEW_DEGREES = 30;
/** The camera looks a little north of the traveller and above the ground, so they stand below the middle of the
 *  screen with more of where they're going in view. */
const LOOK_AHEAD = new THREE.Vector3(0, 0.6, -1.2);
/** How much of the way to the traveller the camera moves each second. */
const CAMERA_FOLLOW_PER_SECOND = 8;
/** Where the sun shines from, relative to what it lights: high, front and left, as the models' own shading expects. */
const SUN_OFFSET = new THREE.Vector3(-8, 16, 12);
/** The sun's shadows reach this far around the traveller (in tiles), at this sharpness. */
const SHADOW_REACH = 20;
const SHADOW_MAP_SIZE = 2048;
/** No sharper than this many device pixels to a CSS pixel, so phones with dense screens stay smooth. */
const MAX_PIXEL_RATIO = 2;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** The longest step one frame may take, in seconds, so a tab coming back doesn't jump everyone along. */
const MAX_FRAME_SECONDS = 0.1;

type Lighting = { skyTop: string; skyHorizon: string; fog: [number, number]; sun: number; sunColour: string; sky: number; skyColour: string; groundColour: string };
const DAY: Lighting = { skyTop: "#7fb6e3", skyHorizon: "#e6f1f2", fog: [45, 120], sun: 2.3, sunColour: "#fff6e6", sky: 1.5, skyColour: "#fff6e8", groundColour: "#7d8a6a" };
const NIGHT: Lighting = { skyTop: "#0f1726", skyHorizon: "#33415a", fog: [35, 100], sun: 0.7, sunColour: "#b8c8ff", sky: 0.6, skyColour: "#8fa2d6", groundColour: "#2a3328" };

export type TravellerState = { position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean };

export class WebGLUnavailableError extends Error {
  constructor(cause: unknown) { super("This browser can't draw 3D scenes.", { cause }); this.name = "WebGLUnavailableError"; }
}

/** A vertical gradient from `top` to `horizon`, for the sky behind everything. */
function skyTexture(top: string, horizon: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2; canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, horizon);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeRenderer(): THREE.WebGLRenderer {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    return renderer;
  } catch (error) {
    throw new WebGLUnavailableError(error);
  }
}

export class IslandRenderer {
  /** Called after every frame is drawn (to move overlays that follow something in the scene). */
  onFrame: (() => void) | null = null;
  private readonly renderer = makeRenderer();
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW_DEGREES, 1, 0.5, 400);
  private readonly sun = new THREE.DirectionalLight();
  private readonly skyLight = new THREE.HemisphereLight();
  private readonly timer = new THREE.Timer();
  private readonly people: IslandWalker[] = [];
  private traveller: IslandWalker | null = null;
  private state: TravellerState;
  /** Where the traveller is drawn: easing after where they are (see `drawnTowards`). */
  private drawn: Vector;
  private readonly focus = new THREE.Vector3();
  private viewport = { width: 1, height: 1 };
  /** The page element the scene is drawn into, while it's on a page (it's set aside, not drawn, in between). */
  private host: HTMLElement | null = null;
  private hasLoaded = false;
  private frame = 0;
  private isDisposed = false;
  /** Each switched lantern as it looks lit and dark, and how many are lit (the first so many). */
  private readonly lanterns: { lit: THREE.Object3D; unlit: THREE.Object3D }[] = [];
  private litLanterns = 0;
  private petals: FallingPetals | null = null;
  private readonly koi: SwimmingKoi;
  private readonly water: LivelyWater;
  /** Whether the water, koi and petals move (not when the learner has asked for less motion). */
  private readonly isMoving = !window.matchMedia(REDUCED_MOTION).matches;
  private readonly island: Island3D;
  private readonly maker: ModelMaker;

  /** `maker` makes the island's models and people, however they're made. */
  constructor(island: Island3D, maker: ModelMaker, start: TravellerState) {
    this.island = island;
    this.maker = maker;
    this.state = start;
    this.drawn = start.position;
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.domElement.className = "block size-full";
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
    Object.assign(this.sun.shadow.camera, { left: -SHADOW_REACH, right: SHADOW_REACH, top: SHADOW_REACH, bottom: -SHADOW_REACH, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.03;
    this.water = new LivelyWater(island.map, { shore: island.shore, sea: island.sea });
    this.koi = new SwimmingKoi(island.ponds ?? [], Math.random);
    this.scene.add(this.sun, this.sun.target, this.skyLight, this.water.mesh, this.koi.group,
      mergedByMaterial(buildGround(island.map, { shore: island.shore, landColours: island.landColours })));
    if (island.sea === "clouds") this.scene.add(cloudBanks(island.map));
    // Petals (or leaves) fall where it's their season.
    if (island.weather && this.isMoving) {
      this.petals = new FallingPetals(Math.random, PETAL_LOOKS[island.weather]);
      this.scene.add(this.petals.mesh);
    }
    this.setDark(false);
    this.focus.set(start.position.x, 0, start.position.y);
  }

  /** Loads and stands every model and person, then starts drawing (once it's on a page). */
  async load(): Promise<void> {
    const lanterns = this.island.lanterns ?? [];
    const [standing, people, traveller, lit, unlit] = await Promise.all([
      Promise.all([...this.island.models, ...this.island.backdrop].map(placement => this.maker.standModel(placement))),
      Promise.all(this.island.people.map(async resident => {
        const person = await this.maker.makePerson(resident.model);
        person.standAt(personPosition(resident), resident.facing);
        person.faceAtOnce(resident.facing);
        return person;
      })),
      this.maker.makePerson(this.island.traveller),
      Promise.all(lanterns.map(({ lit: placement }) => this.maker.standModel(placement))),
      Promise.all(lanterns.map(({ unlit: placement }) => this.maker.standModel(placement))),
    ]);
    // Left before it finished loading: nothing more to draw.
    if (this.isDisposed) return;
    this.scene.add(...standing, ...people.map(person => person.root), traveller.root, ...lit, ...unlit);
    this.people.push(...people);
    this.lanterns.push(...lit.map((model, index) => ({ lit: model, unlit: unlit[index] })));
    this.setLitLanterns(this.litLanterns);
    traveller.faceAtOnce(this.state.facing);
    this.traveller = traveller;
    this.timer.connect(document);
    this.hasLoaded = true;
    this.startDrawing();
  }

  /** Draws the scene into `host`, the traveller standing as `traveller` says (where they are on coming back). */
  attachTo(host: HTMLElement, traveller: TravellerState): void {
    host.append(this.renderer.domElement);
    this.host = host;
    this.placeTraveller(traveller);
    this.startDrawing();
  }

  /** Takes the scene off its page and stops drawing it, keeping everything built for when it's attached again. */
  detach(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.onFrame = null;
    this.renderer.domElement.remove();
    this.host = null;
  }

  /** Lights the first `count` switched lanterns, the rest dark. */
  setLitLanterns(count: number): void {
    this.litLanterns = count;
    this.lanterns.forEach(({ lit, unlit }, index) => {
      lit.visible = index < count;
      unlit.visible = !lit.visible;
    });
  }

  setTraveller(state: TravellerState): void {
    this.state = state;
  }

  setDark(isDark: boolean): void {
    const lighting = isDark ? NIGHT : DAY;
    if (this.scene.background instanceof THREE.Texture) this.scene.background.dispose();
    this.scene.background = skyTexture(lighting.skyTop, lighting.skyHorizon);
    this.scene.fog = new THREE.Fog(lighting.skyHorizon, ...lighting.fog);
    this.sun.intensity = lighting.sun;
    this.sun.color.set(lighting.sunColour);
    this.skyLight.intensity = lighting.sky;
    this.skyLight.color.set(lighting.skyColour);
    this.skyLight.groundColor.set(lighting.groundColour);
  }

  resize(width: number, height: number): void {
    this.viewport = { width: Math.max(1, width), height: Math.max(1, height) };
    this.renderer.setSize(this.viewport.width, this.viewport.height, false);
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  /** Where a point of the island (in tiles, `height` above the ground) shows on the screen, in CSS pixels from the
   *  scene's top-left, or null if it's behind the camera. */
  screenPoint(at: Vector, height: number): Vector | null {
    const point = new THREE.Vector3(at.x, height, at.y).project(this.camera);
    if (point.z > 1) return null;
    return { x: ((point.x + 1) / 2) * this.viewport.width, y: ((1 - point.y) / 2) * this.viewport.height };
  }

  dispose(): void {
    this.isDisposed = true;
    this.detach();
    this.timer.dispose();
    this.water.dispose();
    this.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      for (const material of [object.material].flat()) {
        if (material instanceof THREE.MeshStandardMaterial) material.map?.dispose();
        material.dispose();
      }
    });
    this.renderer.dispose();
  }

  private startDrawing(): void {
    if (!this.host || !this.hasLoaded || this.frame !== 0) return;
    this.frame = requestAnimationFrame(this.draw);
  }

  /** Stands the traveller (and the camera over them) straight where they are, with no easing over from before. */
  private placeTraveller(traveller: TravellerState): void {
    this.state = traveller;
    this.drawn = traveller.position;
    this.traveller?.faceAtOnce(traveller.facing);
    this.focus.set(traveller.position.x, 0, traveller.position.y).add(LOOK_AHEAD);
  }

  private readonly draw = (): void => {
    this.timer.update();
    const seconds = Math.min(this.timer.getDelta(), MAX_FRAME_SECONDS);
    this.moveTraveller(seconds);
    for (const person of this.people) person.update(seconds);
    this.followWithCamera(seconds);
    this.petals?.update(seconds, this.focus);
    if (this.isMoving) {
      this.water.update(seconds);
      this.koi.update(seconds);
    }
    this.renderer.render(this.scene, this.camera);
    this.onFrame?.();
    this.frame = requestAnimationFrame(this.draw);
  };

  private moveTraveller(seconds: number): void {
    if (!this.traveller) return;
    const { position, facing, isWalking, isRunning } = this.state;
    const motion: Motion = !isWalking ? "idle" : isRunning ? "run" : "walk";
    this.traveller.play(motion);
    this.drawn = drawnTowards(this.drawn, position, seconds);
    this.traveller.standAt(this.drawn, facing);
    this.traveller.update(seconds);
  }

  private followWithCamera(seconds: number): void {
    const target = new THREE.Vector3(this.drawn.x, 0, this.drawn.y).add(LOOK_AHEAD);
    this.focus.lerp(target, Math.min(1, seconds * CAMERA_FOLLOW_PER_SECOND));
    const distance = cameraDistance(this.viewport, FIELD_OF_VIEW_DEGREES);
    const elevation = THREE.MathUtils.degToRad(ELEVATION_DEGREES);
    this.camera.position.set(this.focus.x, this.focus.y + Math.sin(elevation) * distance, this.focus.z + Math.cos(elevation) * distance);
    this.camera.lookAt(this.focus);
    this.sun.position.copy(this.focus).add(SUN_OFFSET);
    this.sun.target.position.copy(this.focus);
  }
}
