// Merging a model that never moves into as few meshes as it has materials, so it costs a few draw calls a frame
// rather than one for each of its hundreds of parts (every slat, lantern and tile row), drawn twice with shadows.
// It looks exactly the same: each part is baked where it stood.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Parts drawn alike: the same material, the same shadows, and geometry with the same attributes. */
type Bucket = { material: THREE.Material; castShadow: boolean; receiveShadow: boolean; geometries: THREE.BufferGeometry[] };

/** A triangle list's vertices in the opposite order, so a part baked through a mirroring matrix still faces out. */
function reverseWinding(geometry: THREE.BufferGeometry): void {
  for (const attribute of Object.values(geometry.attributes)) {
    if (!(attribute instanceof THREE.BufferAttribute)) continue;
    for (let vertex = 0; vertex + 2 < attribute.count; vertex += 3) {
      for (let component = 0; component < attribute.itemSize; component += 1) {
        const second = attribute.getComponent(vertex + 1, component);
        attribute.setComponent(vertex + 1, component, attribute.getComponent(vertex + 2, component));
        attribute.setComponent(vertex + 2, component, second);
      }
    }
  }
}

/** A mesh's geometry as a plain triangle list, baked to where it stands in the model. */
function baked(mesh: THREE.Mesh): THREE.BufferGeometry {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  geometry.applyMatrix4(mesh.matrixWorld);
  if (mesh.matrixWorld.determinant() < 0) reverseWinding(geometry);
  for (const name of Object.keys(geometry.morphAttributes)) delete geometry.morphAttributes[name];
  geometry.clearGroups();
  return geometry;
}

/** `model` (standing on its own, with no parent) as one mesh for each way its parts are drawn. Parts with more than
 *  one material, and instanced meshes, are kept as they are. The parts' old geometry is let go. */
export function mergedByMaterial(model: THREE.Object3D): THREE.Group {
  model.updateMatrixWorld(true);
  const buckets = new Map<string, Bucket>();
  const kept: THREE.Mesh[] = [];
  model.traverse(part => {
    if (!(part instanceof THREE.Mesh)) return;
    // An instanced mesh is drawn in one call already, each copy where it stands.
    if (Array.isArray(part.material) || part instanceof THREE.InstancedMesh) {
      kept.push(part);
      return;
    }
    const geometry = baked(part);
    part.geometry.dispose();
    const key = [part.material.uuid, part.castShadow, part.receiveShadow, Object.keys(geometry.attributes).sort().join()].join("|");
    const bucket = buckets.get(key) ?? { material: part.material, castShadow: part.castShadow, receiveShadow: part.receiveShadow, geometries: [] };
    bucket.geometries.push(geometry);
    buckets.set(key, bucket);
  });
  const merged = new THREE.Group();
  for (const { material, castShadow, receiveShadow, geometries } of buckets.values()) {
    const whole = geometries.length > 1 ? mergeGeometries(geometries) : null;
    if (whole) for (const part of geometries) part.dispose();
    // Parts whose attributes differ in size can't be merged; they're drawn as they were, each its own mesh.
    for (const geometry of whole ? [whole] : geometries) {
      const mesh = new THREE.Mesh(geometry, material);
      Object.assign(mesh, { castShadow, receiveShadow });
      merged.add(mesh);
    }
  }
  for (const mesh of kept) {
    mesh.removeFromParent();
    mesh.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
    merged.add(mesh);
  }
  return merged;
}
