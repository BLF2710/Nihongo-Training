// Rough water, where wild kana leap out at a boat going by: white crests riding up and down on every rough-water tile,
// so it shows from afar. As with the tall grass, every crest is a copy of one shape (an instanced mesh), and they rise
// and fall on the graphics card from the time and where each one is.
import * as THREE from "three";
import type { TownMap } from "../../lib/errands/townMap.ts";
import { steadyNoise } from "../../lib/world/islandModels.ts";
import { WATER_LEVEL } from "./water.ts";

/** A crest: a low lens of foam this long, high and wide (in tiles). */
const CREST = { length: 0.62, height: 0.05, width: 0.13 } as const;
const SHADES = ["#ffffff", "#e8f6fb", "#d6eef6"] as const;
/** How far the crests rise and fall (in tiles) and how quickly. */
const SWELL = { height: 0.05, speed: 2.4 } as const;

/** A crest of foam: a low, faceted lens, longer than it's wide. */
const crestShape = () => new THREE.IcosahedronGeometry(1, 1).scale(CREST.length / 2, CREST.height, CREST.width / 2);

/** Where a tile's crests ride (as shares of the tile): in staggered rows, so together they read as lines of chop. */
const CREST_SPOTS: readonly { x: number; y: number }[] = [{ x: 0.28, y: 0.2 }, { x: 0.74, y: 0.45 }, { x: 0.3, y: 0.7 }, { x: 0.78, y: 0.92 }];
/** How far a crest strays from its spot (a share of the tile) and from lying east to west (in radians). */
const STRAY = { place: 0.08, turn: 0.18 } as const;

/** Where each crest rides on the map's rough water, all lying much the same way, as wind-driven chop does. */
function crestPlaces(map: TownMap): THREE.Matrix4[] {
  const places: THREE.Matrix4[] = [];
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (terrain !== "waves") return;
    CREST_SPOTS.forEach((spot, crest) => {
      const stray = { x: steadyNoise(x * 5 + crest, y * 3) * STRAY.place, y: steadyNoise(y * 4 + crest, x * 6) * STRAY.place };
      places.push(new THREE.Matrix4().compose(
        new THREE.Vector3(x + spot.x + stray.x, WATER_LEVEL, y + spot.y + stray.y),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), steadyNoise(crest, x - y) * STRAY.turn),
        new THREE.Vector3(1, 1, 1)));
    });
  }));
  return places;
}

export class RoughWater {
  readonly mesh: THREE.InstancedMesh;
  private readonly time = { value: 0 };

  constructor(map: TownMap) {
    const places = crestPlaces(map);
    const material = new THREE.MeshStandardMaterial({ roughness: 0.4, flatShading: true });
    material.onBeforeCompile = shader => {
      shader.uniforms.swellTime = this.time;
      // Each crest rises out of the water and sinks back, out of step with its neighbours.
      shader.vertexShader = `uniform float swellTime;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
        float swellPhase = swellTime * ${SWELL.speed.toFixed(2)} + instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
        transformed.y += (sin(swellPhase) - 0.4) * ${SWELL.height.toFixed(3)};`);
    };
    this.mesh = new THREE.InstancedMesh(crestShape(), material, places.length);
    places.forEach((place, index) => {
      this.mesh.setMatrixAt(index, place);
      this.mesh.setColorAt(index, new THREE.Color(SHADES[index % SHADES.length]));
    });
  }

  update(seconds: number): void {
    this.time.value += seconds;
  }
}
