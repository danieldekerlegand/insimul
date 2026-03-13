/**
 * StreetAlignedPlacement
 *
 * Generates an intra-settlement street network and distributes building lots
 * along both sides of each street. Replaces the old grid+jitter approach in
 * WorldScaleManager.generateLotPositions().
 *
 * Street layout:
 *  - A "main street" runs through the settlement center.
 *  - Side streets branch off the main street at regular intervals.
 *  - Buildings face the street they front, with odd house numbers on the left
 *    side and even on the right.
 *  - Commercial buildings cluster near intersections and along the main street.
 *  - Residential buildings fill side streets.
 */

import { Vector3 } from '@babylonjs/core';

// ── Public types ────────────────────────────────────────────────────────────

export interface StreetSegment {
  id: string;
  /** Start point (x, z) — y is always 0, set later by terrain projection */
  from: Vector3;
  /** End point */
  to: Vector3;
  /** true for the primary street through town */
  isMainStreet: boolean;
  /** Street name assigned from the lot data or generated */
  streetName: string;
}

export interface PlacedLot {
  position: Vector3;
  /** Rotation in radians so the building faces the street */
  facingAngle: number;
  /** House number (odd = left side, even = right side) */
  houseNumber: number;
  /** Name of the street this lot sits on */
  streetName: string;
  /** true when this lot is near an intersection (good for commercial) */
  nearIntersection: boolean;
  /** true when this lot is on the main street */
  onMainStreet: boolean;
}

export interface StreetAlignedResult {
  streets: StreetSegment[];
  lots: PlacedLot[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

type RNG = () => number;

function createSeededRandom(seed: string): RNG {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

function vec2Len(x: number, z: number): number {
  return Math.sqrt(x * x + z * z);
}

// ── Core algorithm ──────────────────────────────────────────────────────────

/**
 * Generate a street network and place lots along the streets.
 *
 * @param center        Settlement center position (x, y=0, z)
 * @param radius        Settlement radius (controls how far streets extend)
 * @param lotCount      Desired number of lots to place
 * @param seed          Deterministic seed string
 * @param terrainHalf   Half the terrain size (for clamping)
 * @param streetNames   Optional street names from lot data
 */
export function generateStreetAlignedLots(
  center: Vector3,
  radius: number,
  lotCount: number,
  seed: string,
  terrainHalf: number = 512,
  streetNames: string[] = [],
): StreetAlignedResult {
  const rand = createSeededRandom(seed);

  // ── 1. Generate street network ────────────────────────────────────────

  const streets: StreetSegment[] = [];
  const MAIN_STREET_NAME = streetNames[0] || 'Main Street';
  const LOT_SPACING = 14;

  // Scale the street network to fit the requested number of lots.
  // Each lot takes ~LOT_SPACING along a street (2 lots per segment: left+right).
  // We need enough total street length to hold all lots.
  const neededLength = (lotCount / 2) * LOT_SPACING;
  // Main street carries ~40% of lots, side streets carry the rest
  const mainLen = Math.max(radius * 0.85, neededLength * 0.4 / 2);

  // Main street: runs through center at a seeded angle
  const mainAngle = rand() * Math.PI; // 0..π (half-circle, other half is opposite direction)
  const mainFrom = new Vector3(
    center.x - Math.cos(mainAngle) * mainLen,
    0,
    center.z - Math.sin(mainAngle) * mainLen,
  );
  const mainTo = new Vector3(
    center.x + Math.cos(mainAngle) * mainLen,
    0,
    center.z + Math.sin(mainAngle) * mainLen,
  );
  streets.push({
    id: `street_main`,
    from: mainFrom,
    to: mainTo,
    isMainStreet: true,
    streetName: MAIN_STREET_NAME,
  });

  // Side streets: branch off the main street perpendicularly
  const sideAngle = mainAngle + Math.PI / 2;
  // Space side streets ~20 units apart along the main street
  const sideSpacing = 20;
  const mainFullLen = mainLen * 2;
  const sideCount = Math.max(1, Math.floor(mainFullLen / sideSpacing));
  // Scale side street length to accommodate remaining lots
  const sideLotsNeeded = Math.max(0, lotCount - Math.floor(mainFullLen / LOT_SPACING) * 2);
  const lotsPerSide = sideCount > 0 ? Math.ceil(sideLotsNeeded / sideCount / 2) : 0;
  const baseSideLen = Math.max(radius * 0.5, lotsPerSide * LOT_SPACING);

  for (let i = 0; i < sideCount; i++) {
    const t = (i + 1) / (sideCount + 1); // 0..1 along main street
    const branchX = mainFrom.x + (mainTo.x - mainFrom.x) * t;
    const branchZ = mainFrom.z + (mainTo.z - mainFrom.z) * t;

    const sideLen = baseSideLen * (0.6 + rand() * 0.8);
    const sName = streetNames[i + 1] || `${ordinal(i + 1)} Street`;

    // Each side street extends in both directions from the main street
    const sFrom = new Vector3(
      branchX - Math.cos(sideAngle) * sideLen,
      0,
      branchZ - Math.sin(sideAngle) * sideLen,
    );
    const sTo = new Vector3(
      branchX + Math.cos(sideAngle) * sideLen,
      0,
      branchZ + Math.sin(sideAngle) * sideLen,
    );

    streets.push({
      id: `street_side_${i}`,
      from: sFrom,
      to: sTo,
      isMainStreet: false,
      streetName: sName,
    });
  }

  // ── 2. Collect intersection points (for commercial clustering) ────────

  const intersections: Vector3[] = [center.clone()]; // center is always an intersection
  for (let i = 1; i < streets.length; i++) {
    // Side streets intersect the main street at their midpoint
    const mid = new Vector3(
      (streets[i].from.x + streets[i].to.x) / 2,
      0,
      (streets[i].from.z + streets[i].to.z) / 2,
    );
    intersections.push(mid);
  }

  // ── 3. Place lots along both sides of each street ─────────────────────

  const lots: PlacedLot[] = [];
  const SETBACK = 8; // perpendicular distance from street center to building
  const SPAWN_CLEAR_RADIUS = 15;
  const TERRAIN_MARGIN = 5;

  // Distribute lot budget across streets proportional to their length
  const streetLengths = streets.map(s => vec2Len(s.to.x - s.from.x, s.to.z - s.from.z));
  const totalLength = streetLengths.reduce((a, b) => a + b, 0);

  // How many lots each street can hold (both sides)
  const streetCapacities = streetLengths.map(len => {
    const slotsPerSide = Math.floor(len / LOT_SPACING);
    return slotsPerSide * 2; // both sides
  });
  const totalCapacity = streetCapacities.reduce((a, b) => a + b, 0);

  // Allocate lots proportionally, but respect capacity
  let remainingLotBudget = lotCount;
  const streetLotCounts: number[] = [];
  for (let i = 0; i < streets.length; i++) {
    const proportion = totalLength > 0 ? streetLengths[i] / totalLength : 1 / streets.length;
    const wanted = Math.round(lotCount * proportion);
    const allocated = Math.min(wanted, streetCapacities[i], remainingLotBudget);
    streetLotCounts.push(allocated);
    remainingLotBudget -= allocated;
  }

  // Distribute any remainder to streets with capacity
  for (let i = 0; i < streets.length && remainingLotBudget > 0; i++) {
    const extra = Math.min(remainingLotBudget, streetCapacities[i] - streetLotCounts[i]);
    if (extra > 0) {
      streetLotCounts[i] += extra;
      remainingLotBudget -= extra;
    }
  }

  // Place lots on each street
  for (let si = 0; si < streets.length; si++) {
    const street = streets[si];
    const count = streetLotCounts[si];
    if (count === 0) continue;

    const dx = street.to.x - street.from.x;
    const dz = street.to.z - street.from.z;
    const len = streetLengths[si];
    if (len < 1) continue;

    // Unit direction along street
    const dirX = dx / len;
    const dirZ = dz / len;
    // Perpendicular (left side when walking from→to)
    const perpX = -dirZ;
    const perpZ = dirX;

    // Facing angle: buildings on left side face right (toward street), and vice versa
    const streetAngle = Math.atan2(dirZ, dirX);

    const slotsPerSide = Math.ceil(count / 2);
    let houseOdd = 1; // odd numbers for left side
    let houseEven = 2; // even numbers for right side

    for (let slot = 0; slot < slotsPerSide; slot++) {
      const t = (slot + 0.5) / slotsPerSide; // 0..1 along the street
      const cx = street.from.x + dx * t;
      const cz = street.from.z + dz * t;

      // Check if near an intersection
      const nearIntersection = intersections.some(
        int => vec2Len(cx - int.x, cz - int.z) < LOT_SPACING * 1.5
      );

      // ── Left side (odd house numbers) ──
      if (lots.length < lotCount) {
        let lx = cx + perpX * SETBACK + (rand() - 0.5) * 2;
        let lz = cz + perpZ * SETBACK + (rand() - 0.5) * 2;

        // Clamp to terrain
        lx = Math.max(-terrainHalf + TERRAIN_MARGIN, Math.min(terrainHalf - TERRAIN_MARGIN, lx));
        lz = Math.max(-terrainHalf + TERRAIN_MARGIN, Math.min(terrainHalf - TERRAIN_MARGIN, lz));

        // Skip if too close to spawn
        const dFromCenter = vec2Len(lx - center.x, lz - center.z);
        if (dFromCenter >= SPAWN_CLEAR_RADIUS) {
          lots.push({
            position: new Vector3(lx, 0, lz),
            facingAngle: streetAngle - Math.PI / 2, // face toward street (right)
            houseNumber: houseOdd,
            streetName: street.streetName,
            nearIntersection,
            onMainStreet: street.isMainStreet,
          });
          houseOdd += 2;
        }
      }

      // ── Right side (even house numbers) ──
      if (lots.length < lotCount) {
        let rx = cx - perpX * SETBACK + (rand() - 0.5) * 2;
        let rz = cz - perpZ * SETBACK + (rand() - 0.5) * 2;

        rx = Math.max(-terrainHalf + TERRAIN_MARGIN, Math.min(terrainHalf - TERRAIN_MARGIN, rx));
        rz = Math.max(-terrainHalf + TERRAIN_MARGIN, Math.min(terrainHalf - TERRAIN_MARGIN, rz));

        const dFromCenter = vec2Len(rx - center.x, rz - center.z);
        if (dFromCenter >= SPAWN_CLEAR_RADIUS) {
          lots.push({
            position: new Vector3(rx, 0, rz),
            facingAngle: streetAngle + Math.PI / 2, // face toward street (left)
            houseNumber: houseEven,
            streetName: street.streetName,
            nearIntersection,
            onMainStreet: street.isMainStreet,
          });
          houseEven += 2;
        }
      }
    }
  }

  return { streets, lots };
}

/**
 * Sort lots so commercial-friendly positions come first.
 * Commercial lots = near intersections or on the main street.
 * Residential lots = everything else.
 *
 * @param lots      The placed lots
 * @param bizCount  Number of business slots needed
 * @returns lots reordered: businesses-friendly first, then residential
 */
export function sortLotsForZoning(lots: PlacedLot[], bizCount: number): PlacedLot[] {
  // Score: higher = more commercial
  const scored = lots.map((lot, i) => ({
    lot,
    idx: i,
    score: (lot.nearIntersection ? 2 : 0) + (lot.onMainStreet ? 1 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.lot);
}

// ── Utilities ───────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
