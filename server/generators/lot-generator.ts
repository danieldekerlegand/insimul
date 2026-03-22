/**
 * Lot Generator — Places lots along street edges with proper frontage.
 *
 * Walks each street edge, placing lots on both sides at configurable widths
 * and setbacks. Lots face perpendicular to the street direction and do not overlap.
 */

import type { StreetNetwork, StreetEdge, Vec3 } from '../../shared/game-engine/types';
import type { GeographyConfig } from './geography-generator';

export interface LotPosition {
  position: Vec3;
  facingAngle: number;
  width: number;
  depth: number;
  side: 'left' | 'right';
  distanceAlongStreet: number;
  streetEdgeId: string;
}

/**
 * Get lot width based on settlement type.
 */
function getLotWidth(settlementType: string): number {
  switch (settlementType) {
    case 'village': return 15;
    case 'town': return 12;
    case 'city': return 10;
    default: return 12;
  }
}

/**
 * Get lot depth based on settlement type.
 */
function getLotDepth(settlementType: string): number {
  switch (settlementType) {
    case 'village': return 28;
    case 'town': return 24;
    case 'city': return 20;
    default: return 24;
  }
}

/**
 * Density multiplier per street type — busier streets get more lots.
 */
function lotDensityByStreetType(streetType: string): number {
  switch (streetType) {
    case 'boulevard':
    case 'main_road': return 1.0;
    case 'avenue': return 0.9;
    case 'residential': return 0.8;
    case 'lane': return 0.5;
    case 'alley': return 0.15;
    default: return 0.7;
  }
}

/**
 * Compute total polyline length from waypoints.
 */
function polylineLength(waypoints: Vec3[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dz = waypoints[i].z - waypoints[i - 1].z;
    total += Math.sqrt(dx * dx + dz * dz);
  }
  return total;
}

/**
 * Interpolate position along waypoints at distance d (absolute, not normalized).
 */
function interpolateAtDistance(waypoints: Vec3[], d: number): Vec3 {
  if (waypoints.length === 0) return { x: 0, y: 0, z: 0 };
  if (waypoints.length === 1 || d <= 0) return { ...waypoints[0] };

  let accum = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dz = waypoints[i].z - waypoints[i - 1].z;
    const segLen = Math.sqrt(dx * dx + dz * dz);

    if (accum + segLen >= d) {
      const t = segLen > 0 ? (d - accum) / segLen : 0;
      return {
        x: waypoints[i - 1].x + dx * t,
        y: waypoints[i - 1].y + (waypoints[i].y - waypoints[i - 1].y) * t,
        z: waypoints[i - 1].z + dz * t,
      };
    }
    accum += segLen;
  }
  return { ...waypoints[waypoints.length - 1] };
}

/**
 * Compute normalized tangent at distance d along waypoints.
 * Returns { nx, nz } — the direction vector in the XZ plane.
 */
function tangentAtDistance(waypoints: Vec3[], d: number): { nx: number; nz: number } {
  if (waypoints.length < 2) return { nx: 1, nz: 0 };

  let accum = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dz = waypoints[i].z - waypoints[i - 1].z;
    const segLen = Math.sqrt(dx * dx + dz * dz);

    if (accum + segLen >= d || i === waypoints.length - 1) {
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len === 0) return { nx: 1, nz: 0 };
      return { nx: dx / len, nz: dz / len };
    }
    accum += segLen;
  }

  // Fallback: use last segment
  const last = waypoints.length - 1;
  const dx = waypoints[last].x - waypoints[last - 1].x;
  const dz = waypoints[last].z - waypoints[last - 1].z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len === 0) return { nx: 1, nz: 0 };
  return { nx: dx / len, nz: dz / len };
}

/**
 * Generate lots along all street edges in a network.
 *
 * Walks each edge placing lots on both sides. Uses a target lot count based
 * on population / 4, distributing lots proportionally across edges by their
 * usable length weighted by density.
 */
export function generateLotsAlongStreets(
  network: StreetNetwork,
  config: GeographyConfig
): LotPosition[] {
  const lotWidth = getLotWidth(config.settlementType);
  const lotDepth = getLotDepth(config.settlementType);
  const targetLots = Math.round(config.population / 4);

  // Compute effective capacity for each edge (how many lots can fit on both sides)
  const edgeInfo: { edge: StreetEdge; edgeLength: number; density: number; capacity: number }[] = [];
  let totalCapacity = 0;

  for (const edge of network.edges) {
    const edgeLength = polylineLength(edge.waypoints);
    const density = lotDensityByStreetType(edge.streetType);

    // Leave margin at both ends of the edge to avoid overlapping intersections
    const margin = lotWidth * 0.5;
    const usableLength = Math.max(0, edgeLength - 2 * margin);

    // How many lots fit per side
    const lotsPerSide = Math.max(0, Math.floor(usableLength / lotWidth));
    const capacity = lotsPerSide * 2; // both sides

    edgeInfo.push({ edge, edgeLength, density, capacity });
    totalCapacity += capacity * density;
  }

  if (totalCapacity === 0) return [];

  // Scale factor to hit target lot count (counts both sides)
  // Ensure at least 1 lot when target > 0
  const effectiveTarget = Math.max(targetLots, 1);
  const scale = effectiveTarget / totalCapacity;

  const lots: LotPosition[] = [];
  let accumulated = 0; // Bresenham-style fractional accumulator

  for (const { edge, edgeLength, density, capacity } of edgeInfo) {
    const margin = lotWidth * 0.5;
    const usableLength = Math.max(0, edgeLength - 2 * margin);
    const lotsPerSide = Math.max(0, Math.floor(usableLength / lotWidth));

    if (lotsPerSide === 0) continue;

    // Fractional lots desired per side for this edge
    const desiredPerSide = lotsPerSide * density * scale;
    accumulated += desiredPerSide;
    const actualPerSide = Math.min(Math.round(accumulated), lotsPerSide);
    accumulated -= actualPerSide;

    if (actualPerSide <= 0) continue;

    // Setback distance: half the street width + half the lot depth
    const setback = edge.width / 2 + lotDepth / 2;

    for (const side of ['left', 'right'] as const) {
      const sideSign = side === 'left' ? 1 : -1;

      for (let i = 0; i < actualPerSide; i++) {
        // Evenly space lots along the usable portion
        const spacing = actualPerSide === 1
          ? usableLength / 2
          : (usableLength / (actualPerSide)) * (i + 0.5);
        const distAlongStreet = margin + spacing;

        // Position on the street centerline
        const streetPos = interpolateAtDistance(edge.waypoints, distAlongStreet);
        const tangent = tangentAtDistance(edge.waypoints, distAlongStreet);

        // Perpendicular direction: rotate tangent 90°
        // Left of travel direction = (nz, -nx), Right = (-nz, nx)
        const perpX = tangent.nz * sideSign;
        const perpZ = -tangent.nx * sideSign;

        // Lot center = street center + perpendicular offset
        const position: Vec3 = {
          x: streetPos.x + perpX * setback,
          y: streetPos.y,
          z: streetPos.z + perpZ * setback,
        };

        // Facing angle: direction from lot toward street (opposite of perpendicular offset)
        // atan2 gives angle in radians
        const facingAngle = Math.atan2(-perpZ, -perpX);

        lots.push({
          position,
          facingAngle,
          width: lotWidth,
          depth: lotDepth,
          side,
          distanceAlongStreet: distAlongStreet,
          streetEdgeId: edge.id,
        });
      }
    }
  }

  // Guarantee at least 1 lot when target > 0 and edges exist
  if (lots.length === 0 && targetLots > 0 && edgeInfo.length > 0) {
    const { edge } = edgeInfo[0];
    const edgeLen = polylineLength(edge.waypoints);
    const mid = edgeLen / 2;
    const streetPos = interpolateAtDistance(edge.waypoints, mid);
    const tangent = tangentAtDistance(edge.waypoints, mid);
    const setback = edge.width / 2 + lotDepth / 2;

    lots.push({
      position: {
        x: streetPos.x + tangent.nz * setback,
        y: streetPos.y,
        z: streetPos.z + (-tangent.nx) * setback,
      },
      facingAngle: Math.atan2(tangent.nx, -tangent.nz),
      width: lotWidth,
      depth: lotDepth,
      side: 'left',
      distanceAlongStreet: mid,
      streetEdgeId: edge.id,
    });
  }

  return lots;
}
