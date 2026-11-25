// The water round an island drawn in 3D, alive: gentle overlapping waves roll across it (tilting how it catches the
// light, their crests lighter, with a glint here and there), broad patches drift lighter and darker, it turns
// turquoise in the shallows near land, and foam laps in and out along every shore. It's the scene's ordinary lit
// material with these added to its shader, so the sun, shadows and fog fall on it as on everything else. High on the
// mountain the same surface, white and slow, is a sea of clouds rolling below the summit's edge.
import * as THREE from "three";
import type { TownMap } from "../../lib/errands/townMap.ts";
import type { FarShore, Sea } from "../../lib/world/islandModels.ts";
import { shallowsMask } from "../../lib/world/shallows.ts";

/** How far the water lies below the land. */
export const WATER_LEVEL = -0.16;
const SEA_SIZE = 600;
/** How the sea looks: its colours, how glossy it is, how fast it rolls (1 for water) and how brightly it glints. */
type SeaLook = { deep: string; shallow: string; crest: string; foam: string; roughness: number; pace: number; glint: number };
const SEA_LOOKS: Readonly<Record<Sea, SeaLook>> = {
  water: { deep: "#4f9fcf", shallow: "#7fd3d6", crest: "#d4eef7", foam: "#f7fcff", roughness: 0.3, pace: 1, glint: 0.6 },
  clouds: { deep: "#dfe6ef", shallow: "#f4f7fb", crest: "#ffffff", foam: "#ffffff", roughness: 1, pace: 0.3, glint: 0 },
};

const VERTEX_DECLARATIONS = /* glsl */ `varying vec3 vWaterPosition;\n`;
const VERTEX_POSITION = /* glsl */ `#include <begin_vertex>
vWaterPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`;

const FRAGMENT_DECLARATIONS = /* glsl */ `uniform float uTime;
uniform sampler2D uShallows;
uniform vec2 uShallowsOrigin;
uniform vec2 uShallowsSize;
uniform vec3 uShallow;
uniform vec3 uCrest;
uniform vec3 uFoam;
uniform float uGlint;
varying vec3 vWaterPosition;
float waterHash(vec2 cell) { return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453); }
`;

// Three waves of different lengths and headings, and how near land this point is.
const FRAGMENT_COLOUR = /* glsl */ `#include <color_fragment>
vec2 waterAt = vWaterPosition.xz;
float waveA = sin(dot(waterAt, vec2(0.9, 0.4)) + uTime * 1.1);
float waveB = sin(dot(waterAt, vec2(-0.5, 1.3)) + uTime * 0.8 + 1.7);
float waveC = sin(dot(waterAt, vec2(2.3, 2.3)) - uTime * 1.7);
float crest = smoothstep(0.72, 0.97, (waveA * 0.5 + waveB * 0.35 + waveC * 0.15) * 0.5 + 0.5);
vec2 landNearness = texture2D(uShallows, (waterAt - uShallowsOrigin) / uShallowsSize).rg;
float nearLand = landNearness.g;
float nearEdge = landNearness.r;
float drift = sin(waterAt.x * 0.13 + uTime * 0.15) * sin(waterAt.y * 0.17 - uTime * 0.12);
diffuseColor.rgb *= 1.0 + drift * 0.07;
diffuseColor.rgb = mix(diffuseColor.rgb, uShallow, smoothstep(0.04, 0.42, nearLand) * 0.85);
diffuseColor.rgb = mix(diffuseColor.rgb, uCrest, crest * 0.4 * (1.0 - nearLand));
float lapping = nearEdge + 0.06 * sin(uTime * 1.6 + waterAt.x * 0.7 + waterAt.y * 0.5);
// Foam in a band just off the shore (at the land's edge, nearness is a half), and a fainter line further out in open
// water, rolling in by the broad blur (a narrow river, near land all across by that one, has no such line).
float foam = smoothstep(0.22, 0.34, lapping) * (1.0 - smoothstep(0.5, 0.6, lapping));
float swell = nearLand + 0.04 * sin(uTime * 1.1 + waterAt.x * 0.5 - waterAt.y * 0.4);
foam = max(foam, smoothstep(0.1, 0.13, swell) * (1.0 - smoothstep(0.13, 0.17, swell)) * 0.45);
diffuseColor.rgb = mix(diffuseColor.rgb, uFoam, foam);
vec2 glintCell = floor(waterAt * 6.0);
float glint = step(0.996, waterHash(glintCell + floor(uTime * 2.5))) * (0.4 + crest) * (1.0 - foam);
diffuseColor.rgb += glint * uGlint;
`;

// The waves tilt the surface, so the light catches it differently as they roll by (foam lies flat).
const FRAGMENT_NORMAL = /* glsl */ `#include <normal_fragment_maps>
vec3 waveTilt = vec3(
  cos(dot(waterAt, vec2(0.9, 0.4)) + uTime * 1.1) * 0.07 + cos(waterAt.x * 3.1 - uTime * 2.0) * 0.025,
  0.0,
  cos(dot(waterAt, vec2(-0.5, 1.3)) + uTime * 0.8 + 1.7) * 0.08 + cos(waterAt.y * 2.7 + uTime * 1.6) * 0.025) * (1.0 - foam);
normal = normalize(normal - (viewMatrix * vec4(waveTilt, 0.0)).xyz);
`;

/** The blurred picture of the land, as a texture the water reads how near land it is from. */
function shallowsTexture(map: TownMap, shore?: FarShore): { texture: THREE.DataTexture; origin: THREE.Vector2; size: THREE.Vector2 } {
  const mask = shallowsMask(map, shore);
  const texture = new THREE.DataTexture(mask.data, mask.width, mask.height, THREE.RGFormat, THREE.UnsignedByteType);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { texture, origin: new THREE.Vector2(mask.origin.x, mask.origin.y), size: new THREE.Vector2(mask.size.x, mask.size.y) };
}

export class LivelyWater {
  readonly mesh: THREE.Mesh;
  private readonly time = { value: 0 };
  private readonly shallows: THREE.DataTexture;

  private readonly pace: number;

  /** `sea` is what it is: water, or clouds. */
  constructor(map: TownMap, { shore, sea = "water" }: { shore?: FarShore; sea?: Sea }) {
    const shallows = shallowsTexture(map, shore);
    const look = SEA_LOOKS[sea];
    this.shallows = shallows.texture;
    this.pace = look.pace;
    const material = new THREE.MeshStandardMaterial({ color: look.deep, roughness: look.roughness, metalness: 0 });
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, {
        uTime: this.time, uShallows: { value: shallows.texture }, uShallowsOrigin: { value: shallows.origin }, uShallowsSize: { value: shallows.size },
        uShallow: { value: new THREE.Color(look.shallow) }, uCrest: { value: new THREE.Color(look.crest) }, uFoam: { value: new THREE.Color(look.foam) },
        uGlint: { value: look.glint },
      });
      shader.vertexShader = VERTEX_DECLARATIONS + shader.vertexShader.replace("#include <begin_vertex>", VERTEX_POSITION);
      shader.fragmentShader = FRAGMENT_DECLARATIONS + shader.fragmentShader
        .replace("#include <color_fragment>", FRAGMENT_COLOUR)
        .replace("#include <normal_fragment_maps>", FRAGMENT_NORMAL);
    };
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(SEA_SIZE, SEA_SIZE).rotateX(-Math.PI / 2), material);
    this.mesh.position.y = WATER_LEVEL;
    this.mesh.receiveShadow = true;
  }

  /** Frees the picture of the land (the scene frees the water's mesh with everything else). */
  dispose(): void {
    this.shallows.dispose();
  }

  /** Lets the waves roll on for `seconds`. */
  update(seconds: number): void {
    this.time.value += seconds * this.pace;
  }
}
