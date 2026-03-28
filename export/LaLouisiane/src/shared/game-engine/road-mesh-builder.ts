/**
 * Road Mesh Builder
 *
 * Engine-agnostic ribbon mesh generation for roads. Computes vertices,
 * normals, UVs, and triangle indices for a flat ribbon mesh along a
 * polyline path. Used by Unity, Godot, and Unreal exporters.
 */

import type { Vec3 } from './types';

export interface RibbonMeshData {
  vertices: Vec3[];
  normals: Vec3[];
  uvs: { u: number; v: number }[];
  triangles: number[];
}

/**
 * Builds a flat ribbon mesh along a polyline path.
 * For each waypoint, two vertices are placed perpendicular to the path
 * direction at +/- width/2. Triangles connect consecutive vertex pairs.
 */
export function buildRibbonMesh(waypoints: Vec3[], width: number): RibbonMeshData {
  const n = waypoints.length;
  if (n < 2) {
    return { vertices: [], normals: [], uvs: [], triangles: [] };
  }

  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];
  const uvs: { u: number; v: number }[] = [];
  const halfWidth = width * 0.5;
  let cumulativeLength = 0;

  for (let i = 0; i < n; i++) {
    // Compute tangent direction at this waypoint
    let fx: number, fz: number;
    if (i === 0) {
      fx = waypoints[1].x - waypoints[0].x;
      fz = waypoints[1].z - waypoints[0].z;
    } else if (i === n - 1) {
      fx = waypoints[n - 1].x - waypoints[n - 2].x;
      fz = waypoints[n - 1].z - waypoints[n - 2].z;
    } else {
      fx = waypoints[i + 1].x - waypoints[i - 1].x;
      fz = waypoints[i + 1].z - waypoints[i - 1].z;
    }

    // Normalize forward (XZ plane only for flat roads)
    let fLen = Math.sqrt(fx * fx + fz * fz);
    if (fLen < 0.0001) {
      fx = 0;
      fz = 1;
      fLen = 1;
    } else {
      fx /= fLen;
      fz /= fLen;
    }

    // Perpendicular in XZ plane: rotate 90 degrees
    let rx = fz;
    let rz = -fx;

    const wp = waypoints[i];
    vertices.push(
      { x: wp.x - rx * halfWidth, y: wp.y, z: wp.z - rz * halfWidth },
      { x: wp.x + rx * halfWidth, y: wp.y, z: wp.z + rz * halfWidth },
    );

    normals.push({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 0 });

    // Accumulate distance for UV tiling
    if (i > 0) {
      const dx = waypoints[i].x - waypoints[i - 1].x;
      const dy = waypoints[i].y - waypoints[i - 1].y;
      const dz = waypoints[i].z - waypoints[i - 1].z;
      cumulativeLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const v = cumulativeLength / width;
    uvs.push({ u: 0, v }, { u: 1, v });
  }

  // Build triangle indices: two triangles per segment
  const triangles: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const bl = i * 2;
    const br = i * 2 + 1;
    const tl = (i + 1) * 2;
    const tr = (i + 1) * 2 + 1;

    triangles.push(bl, tl, br, br, tl, tr);
  }

  return { vertices, normals, uvs, triangles };
}
