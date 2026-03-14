/**
 * Tests for StreetAlignedPlacement
 *
 * Run with: npx tsx client/src/components/3DGame/StreetAlignedPlacement.test.ts
 */

import { Vector3 } from '@babylonjs/core';
import {
  generateStreetAlignedLots,
  sortLotsForZoning,
  type PlacedLot,
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
    const oddLots = streetLots.filter(l => l.houseNumber % 2 === 1);
    const evenLots = streetLots.filter(l => l.houseNumber % 2 === 0);

    if (oddLots.length > 0 && evenLots.length > 0) {
      // Odd and even should be on opposite sides (different facing angles)
      const oddAngle = oddLots[0].facingAngle;
      const evenAngle = evenLots[0].facingAngle;
      const angleDiff = Math.abs(oddAngle - evenAngle);
      assertGreaterThan(angleDiff, 0.5, `'${streetName}': odd/even lots face different directions`);
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

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
