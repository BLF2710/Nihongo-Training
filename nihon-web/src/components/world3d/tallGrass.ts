// The tall grass where wild kana hide, standing in 3D: tufts of long blades on every tall-grass tile, swaying in the
// wind. Every tuft is a copy of one shape (an instanced mesh, one draw call however many there are); the sway is
// worked out on the graphics card from the time and where each tuft stands, so nothing is moved by hand each frame.
import * as THREE from "three";
import type { TownMap } from "../../lib/errands/townMap.ts";
import { steadyNoise } from "../../lib/world/islandModels.ts";

/** Tufts on each tile, and the blades in a tuft. */
const TUFTS_PER_TILE = 10;
const BLADES_PER_TUFT = 6;
const BLADE = { width: 0.07, height: 0.5 } as const;
/** How far a tuft is scaled each way from its usual size, for a ragged top. */
const HEIGHT_SPREAD = 0.3;
const SHADES = ["#5d9a3c", "#6fae45", "#4f8a35", "#7fb84f"] as const;
/** How far the tops swing (in tiles) and how quickly. */
const SWAY = { reach: 0.09, speed: 1.7 } as const;

/** One tuft: blades fanned round its middle, each a narrow triangle leaning out, darker at the root. */
function tuftShape(): THREE.BufferGeometry {
  const corners: number[] = [];
  const shades: number[] = [];
  const root = new THREE.Color("#3d6b2a"), tip = new THREE.Color("#ffffff");
  for (let blade = 0; blade < BLADES_PER_TUFT; blade += 1) {
    const angle = (blade / BLADES_PER_TUFT) * Math.PI * 2;
    const lean = 0.12 + (blade % 2) * 0.08;
    const across = { x: Math.cos(angle + Math.PI / 2) * BLADE.width / 2, z: Math.sin(angle + Math.PI / 2) * BLADE.width / 2 };
    const top = { x: Math.cos(angle) * lean, y: BLADE.height * (0.8 + (blade % 3) * 0.12), z: Math.sin(angle) * lean };
    corners.push(-across.x, 0, -across.z, across.x, 0, across.z, top.x, top.y, top.z);
    // The instance's colour tints the blade; its root is shaded darker.
    shades.push(...root.toArray(), ...root.toArray(), ...tip.toArray());
  }
  const shape = new THREE.BufferGeometry();
  shape.setAttribute("position", new THREE.Float32BufferAttribute(corners, 3));
  shape.setAttribute("color", new THREE.Float32BufferAttribute(shades, 3));
  shape.computeVertexNormals();
  return shape;
}

/** Where each tuft stands on the map's tall grass: scattered steadily over each tile, the same every visit. */
function tuftPlaces(map: TownMap): THREE.Matrix4[] {
  const places: THREE.Matrix4[] = [];
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (terrain !== "tallgrass") return;
    for (let tuft = 0; tuft < TUFTS_PER_TILE; tuft += 1) {
      const across = (steadyNoise(x * 3 + tuft, y * 5) + 1) / 2, down = (steadyNoise(y * 7 + tuft, x * 2) + 1) / 2;
      const height = 1 + steadyNoise(x + tuft * 1.3, y - tuft) * HEIGHT_SPREAD;
      places.push(new THREE.Matrix4().compose(
        new THREE.Vector3(x + 0.08 + across * 0.84, 0, y + 0.08 + down * 0.84),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), steadyNoise(tuft, x + y) * Math.PI),
        new THREE.Vector3(1, height, 1)));
    }
  }));
  return places;
}

export class TallGrass {
  readonly mesh: THREE.InstancedMesh;
  private readonly time = { value: 0 };

  constructor(map: TownMap) {
    const places = tuftPlaces(map);
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    material.onBeforeCompile = shader => {
      shader.uniforms.swayTime = this.time;
      // The higher up a blade, the further it swings; tufts swing out of step with their neighbours.
      shader.vertexShader = `uniform float swayTime;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
        float swayPhase = swayTime * ${SWAY.speed.toFixed(2)} + instanceMatrix[3].x * 0.8 + instanceMatrix[3].z * 0.6;
        float swayReach = ${SWAY.reach.toFixed(3)} * position.y / ${BLADE.height.toFixed(2)};
        transformed.x += sin(swayPhase) * swayReach;
        transformed.z += sin(swayPhase * 0.7 + 1.3) * swayReach * 0.5;`);
    };
    this.mesh = new THREE.InstancedMesh(tuftShape(), material, places.length);
    places.forEach((place, index) => {
      this.mesh.setMatrixAt(index, place);
      this.mesh.setColorAt(index, new THREE.Color(SHADES[index % SHADES.length]));
    });
    // The blades take the sun's shadows but cast none (a swaying shadow would need its own shader too).
    this.mesh.receiveShadow = true;
  }

  update(seconds: number): void {
    this.time.value += seconds;
  }
}
