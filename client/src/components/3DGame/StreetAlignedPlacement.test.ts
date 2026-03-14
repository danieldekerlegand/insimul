/**
 * Tests for StreetAlignedPlacement
 *
 * Run with: npx tsx client/src/components/3DGame/StreetAlignedPlacement.test.ts
 */

import { Vector3 } from '@babylonjs/core';
import {
  generateStreetAlignedLots,
  sortLotsForZoning,
  resolveCornerFacing,
  type PlacedLot,
  type StreetSegment,
  type StreetAlignedResult,
} from './StreetAlignedPlacement';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
}

function assertGreaterThan(actual: number, threshold: number, message: string) {
  assert(actual > threshold, `${message} (expected > ${threshold}, got ${actual})`);
}

function assertLessThanOrEqual(actual: number, threshold: number, message: string) {
  assert(actual <= threshold, `${message} (expected <= ${threshold}, got ${actual})`);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const CENTER = new Vector3(100, 0, 100);
const RADIUS = 55;
const TERRAIN_HALF = 512;

function makeResult(lotCount: number = 20, seed: string = 'test_seed'): StreetAlignedResult {
  return generateStreetAlignedLots(CENTER, RADIUS, lotCount, seed, TERRAIN_HALF);
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== StreetAlignedPlacement Tests ===\n');

// ── Street generation ───────────────────────────────────────────────────────

console.log('Street network generation:');
{
  const result = makeResult();
  assertGreaterThan(result.streets.length, 1, 'generates more than 1 street');
  assertEqual(result.streets[0].isMainStreet, true, 'first street is the main street');

  const mainStreet = result.streets[0];
  assertEqual(mainStreet.streetName, 'Main Street', 'main street has default name');

  const sideStreets = result.streets.filter(s => !s.isMainStreet);
  assertGreaterThan(sideStreets.length, 0, 'generates at least one side street');

  // Side streets should be perpendicular-ish to the main street
  const mainDx = mainStreet.to.x - mainStreet.from.x;
  const mainDz = mainStreet.to.z - mainStreet.from.z;
  const mainAngle = Math.atan2(mainDz, mainDx);

  for (const side of sideStreets) {
    const sideDx = side.to.x - side.from.x;
    const sideDz = side.to.z - side.from.z;
    const sideAngle = Math.atan2(sideDz, sideDx);
    const angleDiff = Math.abs(sideAngle - mainAngle);
    // Should be ~90 degrees (π/2)
    const normalizedDiff = Math.min(angleDiff, Math.PI - angleDiff);
    assert(
      normalizedDiff > Math.PI / 4, // at least 45 degrees from main street
      `side street '${side.streetName}' is roughly perpendicular to main (diff: ${(normalizedDiff * 180 / Math.PI).toFixed(1)}°)`,
    );
  }
}

// ── Lot placement ───────────────────────────────────────────────────────────

console.log('\nLot placement:');
{
  const result = makeResult(20);
  assertGreaterThan(result.lots.length, 0, 'generates lots');
  assertLessThanOrEqual(result.lots.length, 20, 'does not exceed requested lot count');

  // All lots should have street names
  const withStreetName = result.lots.filter(l => l.streetName);
  assertEqual(withStreetName.length, result.lots.length, 'all lots have street names');

  // All lots should have house numbers
  const withHouseNumber = result.lots.filter(l => l.houseNumber > 0);
  assertEqual(withHouseNumber.length, result.lots.length, 'all lots have positive house numbers');
}

// ── House number parity ─────────────────────────────────────────────────────

console.log('\nHouse number parity (odd/even sides):');
{
  const result = makeResult(30);

  // Group lots by street
  const byStreet = new Map<string, PlacedLot[]>();
  for (const lot of result.lots) {
    const arr = byStreet.get(lot.streetName) || [];
    arr.push(lot);
    byStreet.set(lot.streetName, arr);
  }

  for (const [streetName, streetLots] of byStreet) {
    // Filter out corner lots — they face the intersecting street, not their own
    const nonCornerLots = streetLots.filter(l => !l.isCorner);
    const oddLots = nonCornerLots.filter(l => l.houseNumber % 2 === 1);
    const evenLots = nonCornerLots.filter(l => l.houseNumber % 2 === 0);

    if (oddLots.length > 0 && evenLots.length > 0) {
      // Odd and even should be on opposite sides (different facing angles)
      const oddAngle = oddLots[0].facingAngle;
      const evenAngle = evenLots[0].facingAngle;
      const angleDiff = Math.abs(oddAngle - evenAngle);
      assertGreaterThan(angleDiff, 0.5, `'${streetName}': odd/even non-corner lots face different directions`);
    }
  }
}

// ── Spawn clear zone ────────────────────────────────────────────────────────

console.log('\nSpawn clear zone:');
{
  const result = makeResult(20);
  const SPAWN_CLEAR = 15;

  for (const lot of result.lots) {
    const dist = Math.sqrt(
      (lot.position.x - CENTER.x) ** 2 + (lot.position.z - CENTER.z) ** 2
    );
    assert(dist >= SPAWN_CLEAR - 0.1, `lot at (${lot.position.x.toFixed(1)}, ${lot.position.z.toFixed(1)}) is outside spawn zone (dist: ${dist.toFixed(1)})`);
  }
}

// ── Terrain bounds clamping ─────────────────────────────────────────────────

console.log('\nTerrain bounds clamping:');
{
  // Place settlement near terrain edge
  const edgeCenter = new Vector3(TERRAIN_HALF - 30, 0, TERRAIN_HALF - 30);
  const result = generateStreetAlignedLots(edgeCenter, 55, 20, 'edge_test', TERRAIN_HALF);
  const MARGIN = 5;

  for (const lot of result.lots) {
    assertLessThanOrEqual(lot.position.x, TERRAIN_HALF - MARGIN, `lot x within terrain bounds`);
    assertLessThanOrEqual(lot.position.z, TERRAIN_HALF - MARGIN, `lot z within terrain bounds`);
    assertGreaterThan(lot.position.x, -TERRAIN_HALF + MARGIN - 1, `lot x above terrain min`);
    assertGreaterThan(lot.position.z, -TERRAIN_HALF + MARGIN - 1, `lot z above terrain min`);
  }
}

// ── Determinism ─────────────────────────────────────────────────────────────

console.log('\nDeterminism:');
{
  const a = makeResult(15, 'determinism_seed');
  const b = makeResult(15, 'determinism_seed');

  assertEqual(a.streets.length, b.streets.length, 'same street count with same seed');
  assertEqual(a.lots.length, b.lots.length, 'same lot count with same seed');

  for (let i = 0; i < a.lots.length; i++) {
    assertEqual(a.lots[i].position.x, b.lots[i].position.x, `lot ${i} x matches`);
    assertEqual(a.lots[i].position.z, b.lots[i].position.z, `lot ${i} z matches`);
    assertEqual(a.lots[i].houseNumber, b.lots[i].houseNumber, `lot ${i} house number matches`);
  }
}

// ── Custom street names ─────────────────────────────────────────────────────

console.log('\nCustom street names:');
{
  const customNames = ['Oak Avenue', 'Elm Street', 'Maple Lane'];
  const result = generateStreetAlignedLots(CENTER, RADIUS, 20, 'names_test', TERRAIN_HALF, customNames);

  assertEqual(result.streets[0].streetName, 'Oak Avenue', 'main street uses first custom name');
  if (result.streets.length > 1) {
    assertEqual(result.streets[1].streetName, 'Elm Street', 'second street uses second custom name');
  }
}

// ── Zoning sort ─────────────────────────────────────────────────────────────

console.log('\nZoning sort (commercial-first):');
{
  const result = makeResult(30);
  const sorted = sortLotsForZoning(result.lots, 5);

  assertEqual(sorted.length, result.lots.length, 'sorted array has same length');

  // First lots should be more commercially favorable
  const topScore = (l: PlacedLot) => (l.nearIntersection ? 2 : 0) + (l.onMainStreet ? 1 : 0);
  const bottomScore = (l: PlacedLot) => (l.nearIntersection ? 2 : 0) + (l.onMainStreet ? 1 : 0);

  if (sorted.length >= 2) {
    const firstScore = topScore(sorted[0]);
    const lastScore = bottomScore(sorted[sorted.length - 1]);
    assert(firstScore >= lastScore, `first lot score (${firstScore}) >= last lot score (${lastScore})`);
  }
}

// ── Large settlement ────────────────────────────────────────────────────────

console.log('\nLarge settlement (100 lots):');
{
  const result = makeResult(100, 'large_settlement');
  assertGreaterThan(result.lots.length, 50, 'generates at least 50 lots for 100 requested');

  // Should have multiple streets
  assertGreaterThan(result.streets.length, 2, 'large settlement has 3+ streets');

  // Lots should be distributed across streets
  const streetCounts = new Map<string, number>();
  for (const lot of result.lots) {
    streetCounts.set(lot.streetName, (streetCounts.get(lot.streetName) || 0) + 1);
  }
  assertGreaterThan(streetCounts.size, 1, 'lots distributed across multiple streets');
}

// ── Small settlement (edge case) ────────────────────────────────────────────

console.log('\nSmall settlement (3 lots):');
{
  const result = makeResult(3, 'tiny_settlement');
  assertGreaterThan(result.lots.length, 0, 'generates at least some lots for small settlement');
  assertGreaterThan(result.streets.length, 0, 'generates at least one street');
}

// ── Street-facing orientation ────────────────────────────────────────────────

console.log('\nStreet-facing building orientation:');
{
  const result = makeResult(30, 'orientation_test');

  // Group lots by street
  const byStreet = new Map<string, PlacedLot[]>();
  for (const lot of result.lots) {
    const arr = byStreet.get(lot.streetName) || [];
    arr.push(lot);
    byStreet.set(lot.streetName, arr);
  }

  for (const [streetName, streetLots] of byStreet) {
    const street = result.streets.find(s => s.streetName === streetName);
    if (!street) continue;

    const dx = street.to.x - street.from.x;
    const dz = street.to.z - street.from.z;
    const streetAngle = Math.atan2(dz, dx);

    for (const lot of streetLots) {
      // facingAngle should be streetAngle ± π/2 (perpendicular to street)
      const diff = lot.facingAngle - streetAngle;
      // Normalize to [-π, π]
      const normalized = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const absDiff = Math.abs(Math.abs(normalized) - Math.PI / 2);
      assert(
        absDiff < 0.01,
        `lot #${lot.houseNumber} on '${streetName}' faces perpendicular to street (off by ${(absDiff * 180 / Math.PI).toFixed(2)}°)`,
      );
    }
  }

  // Left-side lots (odd) should face opposite direction from right-side lots (even)
  for (const [streetName, streetLots] of byStreet) {
    const oddLots = streetLots.filter(l => l.houseNumber % 2 === 1);
    const evenLots = streetLots.filter(l => l.houseNumber % 2 === 0);

    if (oddLots.length > 0 && evenLots.length > 0) {
      const angleDiff = Math.abs(oddLots[0].facingAngle - evenLots[0].facingAngle);
      // Should differ by ~π (facing opposite directions toward the street)
      const normalizedDiff = Math.abs(angleDiff - Math.PI);
      assert(
        normalizedDiff < 0.01,
        `'${streetName}': odd/even lots face opposite directions toward street (diff: ${(angleDiff * 180 / Math.PI).toFixed(1)}°)`,
      );
    }
  }

  // Every lot must have a defined facingAngle (not NaN or undefined)
  for (const lot of result.lots) {
    assert(
      typeof lot.facingAngle === 'number' && !isNaN(lot.facingAngle),
      `lot #${lot.houseNumber} on '${lot.streetName}' has valid facingAngle (${lot.facingAngle})`,
    );
  }
}

// ── Corner building handling ────────────────────────────────────────────────

console.log('\nCorner building handling:');
{
  const result = makeResult(30);

  // All lots should have isCorner property
  for (const lot of result.lots) {
    assert(typeof lot.isCorner === 'boolean', 'lot has isCorner boolean property');
  }

  // Corner lots should be near intersections
  const cornerLots = result.lots.filter(l => l.isCorner);
  for (const lot of cornerLots) {
    assert(lot.nearIntersection, 'corner lot is also near an intersection');
  }

  // Not all near-intersection lots need to be corners (some may only be near
  // one street), but all corners must be near intersections
  const nearIntersectionLots = result.lots.filter(l => l.nearIntersection);
  assertGreaterThan(nearIntersectionLots.length, 0, 'at least some lots are near intersections');
}

console.log('\nCorner facing angle - resolveCornerFacing:');
{
  // Create a simple T-intersection: main street horizontal, side street vertical
  const streets: StreetSegment[] = [
    {
      id: 'main',
      from: new Vector3(0, 0, 0),
      to: new Vector3(100, 0, 0),
      isMainStreet: true,
      streetName: 'Main St',
    },
    {
      id: 'side',
      from: new Vector3(50, 0, -50),
      to: new Vector3(50, 0, 50),
      isMainStreet: false,
      streetName: '1st Ave',
    },
  ];
  const streetLengths = [100, 100];

  // Lot on side street near intersection should face main street
  const cornerResult = resolveCornerFacing(50, 5, 1, streets, streetLengths, 25);
  assert(cornerResult !== null, 'resolveCornerFacing finds intersecting street');
  assert(cornerResult!.streetIdx === 0, 'corner facing points to main street (index 0)');

  // Lot on main street near intersection should NOT re-orient (main > side)
  const mainResult = resolveCornerFacing(50, 0, 0, streets, streetLengths, 25);
  assert(mainResult === null, 'main street lot does not re-orient toward side street');

  // Lot far from any intersection should return null
  const farResult = resolveCornerFacing(0, 0, 0, streets, streetLengths, 25);
  assert(farResult === null, 'lot far from intersection returns null');
}

console.log('\nCorner facing angle direction:');
{
  // Horizontal main street, vertical side street intersecting at (50, 0)
  const streets: StreetSegment[] = [
    {
      id: 'main',
      from: new Vector3(0, 0, 0),
      to: new Vector3(100, 0, 0),
      isMainStreet: true,
      streetName: 'Main St',
    },
    {
      id: 'side',
      from: new Vector3(50, 0, -50),
      to: new Vector3(50, 0, 50),
      isMainStreet: false,
      streetName: '1st Ave',
    },
  ];
  const streetLengths = [100, 100];

  // Lot on side street, above main street (positive z)
  const aboveResult = resolveCornerFacing(50, 10, 1, streets, streetLengths, 25);
  assert(aboveResult !== null, 'lot above intersection is detected as corner');

  // Lot on side street, below main street (negative z)
  const belowResult = resolveCornerFacing(50, -10, 1, streets, streetLengths, 25);
  assert(belowResult !== null, 'lot below intersection is detected as corner');

  // The two lots should face opposite directions (toward the main street from their side)
  if (aboveResult && belowResult) {
    const angleDiff = Math.abs(aboveResult.facingAngle - belowResult.facingAngle);
    // Should differ by roughly π (180°)
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
    assert(
      normalizedDiff > Math.PI * 0.7,
      `lots on opposite sides face opposite directions (diff: ${(normalizedDiff * 180 / Math.PI).toFixed(1)}°)`,
    );
  }
}

// ── Facing angle determinism ─────────────────────────────────────────────────

console.log('\nFacing angle determinism:');
{
  const a = makeResult(15, 'facing_determinism');
  const b = makeResult(15, 'facing_determinism');

  for (let i = 0; i < a.lots.length; i++) {
    assertEqual(
      a.lots[i].facingAngle,
      b.lots[i].facingAngle,
      `lot ${i} facingAngle is deterministic`,
    );
  }
}

console.log('\nCorner lots in full generation:');
{
  // Use a large settlement to ensure we get corner lots
  const result = makeResult(50, 'corner_test_seed');
  const cornerLots = result.lots.filter(l => l.isCorner);

  // With 50 lots and multiple streets, we should have some corners
  assertGreaterThan(cornerLots.length, 0, 'large settlement has corner lots');

  // Corner lots should have valid facing angles (not NaN or Infinity)
  for (const lot of cornerLots) {
    assert(isFinite(lot.facingAngle), `corner lot facing angle is finite (${lot.facingAngle.toFixed(3)})`);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
