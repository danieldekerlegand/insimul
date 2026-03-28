/**
 * Tests for StreetAlignedPlacement (block-based lot placement)
 *
 * Run with: npx tsx client/src/components/3DGame/StreetAlignedPlacement.test.ts
 */

import { Vector3 } from '@babylonjs/core';
import {
  generateStreetAlignedLots,
  sortLotsForZoning,
  resolveCornerFacing,
  getCenterBlockBounds,
  getBlockCellSize,
  type PlacedLot,
  type StreetSegment,
  type StreetAlignedResult,
} from '/game-engine/rendering/StreetAlignedPlacement';
import { getGridParams } from '/game-engine/logic/StreetNetworkLayout';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.error(`  \u2717 ${message}`);
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

// ── Street generation (fallback) ────────────────────────────────────────────

console.log('Street network generation (fallback, no server network):');
{
  const result = makeResult();
  assertGreaterThan(result.streets.length, 1, 'generates more than 1 street');
  assertEqual(result.streets[0].isMainStreet, true, 'first street is the main street');
  assertEqual(result.streets[0].streetName, 'Main Street', 'main street has default name');

  const sideStreets = result.streets.filter(s => !s.isMainStreet);
  assertGreaterThan(sideStreets.length, 0, 'generates at least one side street');
}

// ── Block-based lot placement ───────────────────────────────────────────────

console.log('\nBlock-based lot placement:');
{
  const result = makeResult(100);
  const buildingLots = result.lots.filter(l => l.zone !== 'park');
  const parkLots = result.lots.filter(l => l.zone === 'park');

  assertGreaterThan(buildingLots.length, 0, 'generates building lots');
  assertGreaterThan(parkLots.length, 0, 'generates park lots for the town square');

  // Grid params for RADIUS=55: gridSize=6, blockCount=5 → 25 blocks, 1 park = 24 building blocks
  // Each block gets 3x2 = 6 lots, so max = 24 * 6 = 144, capped at lotCount=100
  assertLessThanOrEqual(buildingLots.length, 100, 'does not exceed requested lot count');
}

// ── Park block at bottom-center ─────────────────────────────────────────────

console.log('\nPark block at bottom-center:');
{
  const result = makeResult(100);
  const parkLots = result.lots.filter(l => l.zone === 'park');
  assertGreaterThan(parkLots.length, 0, 'has park lots');

  // Park should be at bottom-center (last row, center column)
  const bounds = getCenterBlockBounds(CENTER, RADIUS);
  assert(bounds !== null, 'center block bounds exist');

  if (bounds) {
    const { gridSize, spacing, halfGrid } = getGridParams(RADIUS);
    const blockCount = gridSize - 1;

    // Verify bottom-center positioning: maxZ should be near the grid bottom edge
    const gridMaxZ = CENTER.z - halfGrid + blockCount * spacing;
    assert(
      Math.abs(bounds.maxZ - gridMaxZ) < 1,
      `park block maxZ (${bounds.maxZ.toFixed(1)}) is at grid bottom edge (${gridMaxZ.toFixed(1)})`,
    );

    // Verify center-column: block center X should equal settlement center X
    const blockCenterX = (bounds.minX + bounds.maxX) / 2;
    assert(
      Math.abs(blockCenterX - CENTER.x) < spacing,
      `park block is in the center column (centerX diff: ${Math.abs(blockCenterX - CENTER.x).toFixed(1)})`,
    );

    // Park lots should all be inside the bounds
    for (const lot of parkLots) {
      assert(
        lot.position.x >= bounds.minX && lot.position.x <= bounds.maxX &&
        lot.position.z >= bounds.minZ && lot.position.z <= bounds.maxZ,
        `park lot at (${lot.position.x.toFixed(1)}, ${lot.position.z.toFixed(1)}) is inside park bounds`,
      );
    }
  }
}

// ── Buildings within block boundaries ───────────────────────────────────────

console.log('\nBuildings within block boundaries:');
{
  const result = makeResult(100);
  const buildingLots = result.lots.filter(l => l.zone !== 'park');
  const { gridSize, spacing, halfGrid } = getGridParams(RADIUS);

  // Each building lot should be inside the grid extent
  const gridMinX = CENTER.x - halfGrid;
  const gridMaxX = CENTER.x - halfGrid + (gridSize - 1) * spacing;
  const gridMinZ = CENTER.z - halfGrid;
  const gridMaxZ = CENTER.z - halfGrid + (gridSize - 1) * spacing;

  for (const lot of buildingLots) {
    assert(
      lot.position.x >= gridMinX && lot.position.x <= gridMaxX,
      `lot x (${lot.position.x.toFixed(1)}) within grid X bounds [${gridMinX.toFixed(1)}, ${gridMaxX.toFixed(1)}]`,
    );
    assert(
      lot.position.z >= gridMinZ && lot.position.z <= gridMaxZ,
      `lot z (${lot.position.z.toFixed(1)}) within grid Z bounds [${gridMinZ.toFixed(1)}, ${gridMaxZ.toFixed(1)}]`,
    );
  }

  // No building lot should overlap with the park block
  const bounds = getCenterBlockBounds(CENTER, RADIUS);
  if (bounds) {
    for (const lot of buildingLots) {
      const inPark = lot.position.x >= bounds.minX && lot.position.x <= bounds.maxX &&
                     lot.position.z >= bounds.minZ && lot.position.z <= bounds.maxZ;
      assert(!inPark, `building lot at (${lot.position.x.toFixed(1)}, ${lot.position.z.toFixed(1)}) is NOT in park block`);
    }
  }
}

// ── Even distribution: 3x2 per block ────────────────────────────────────────

console.log('\nEven 3x2 distribution per block:');
{
  // Use a large lotCount so all blocks fill up
  const result = makeResult(200);
  const buildingLots = result.lots.filter(l => l.zone !== 'park');
  const { gridSize, spacing, halfGrid } = getGridParams(RADIUS);
  const blockCount = gridSize - 1;
  const parkCol = Math.floor(blockCount / 2);
  const parkRow = blockCount - 1;

  // Count lots per block
  const blockCounts = new Map<string, number>();
  for (const lot of buildingLots) {
    const col = Math.floor((lot.position.x - (CENTER.x - halfGrid)) / spacing);
    const row = Math.floor((lot.position.z - (CENTER.z - halfGrid)) / spacing);
    const key = `${row},${col}`;
    blockCounts.set(key, (blockCounts.get(key) || 0) + 1);
  }

  // Each non-park block should have exactly 6 lots (3x2)
  for (let row = 0; row < blockCount; row++) {
    for (let col = 0; col < blockCount; col++) {
      if (row === parkRow && col === parkCol) continue;
      const key = `${row},${col}`;
      const count = blockCounts.get(key) || 0;
      assertEqual(count, 6, `block (${row},${col}) has 6 lots`);
    }
  }
}

// ── Facing angles (cardinal directions toward nearest street) ───────────────

console.log('\nFacing angles toward nearest street edge:');
{
  const result = makeResult(100);
  const buildingLots = result.lots.filter(l => l.zone !== 'park');

  // All facing angles should be one of 4 cardinal directions:
  // 0 (face +Z), PI (-Z), PI/2 (+X), -PI/2 (-X)
  const validAngles = [0, Math.PI, Math.PI / 2, -Math.PI / 2];
  for (const lot of buildingLots) {
    const isValid = validAngles.some(a => Math.abs(lot.facingAngle - a) < 0.01);
    assert(isValid, `lot facing ${lot.facingAngle.toFixed(3)} is a cardinal direction`);
  }
}

// ── Determinism ─────────────────────────────────────────────────────────────

console.log('\nDeterminism:');
{
  const a = makeResult(50, 'determinism_seed');
  const b = makeResult(50, 'determinism_seed');

  assertEqual(a.streets.length, b.streets.length, 'same street count with same seed');
  assertEqual(a.lots.length, b.lots.length, 'same lot count with same seed');

  for (let i = 0; i < a.lots.length; i++) {
    assertEqual(a.lots[i].position.x, b.lots[i].position.x, `lot ${i} x matches`);
    assertEqual(a.lots[i].position.z, b.lots[i].position.z, `lot ${i} z matches`);
  }
}

// ── Zoning sort ─────────────────────────────────────────────────────────────

console.log('\nZoning sort (commercial-first):');
{
  const result = makeResult(50);
  const sorted = sortLotsForZoning(result.lots, 5);

  assertEqual(sorted.length, result.lots.length, 'sorted array has same length');

  const commercialLots = sorted.filter(l => l.zone === 'commercial');
  const residentialLots = sorted.filter(l => l.zone === 'residential');
  const parkLots = sorted.filter(l => l.zone === 'park');

  assertEqual(commercialLots.length, 5, 'exactly 5 commercial lots');
  assertGreaterThan(residentialLots.length, 0, 'has residential lots');
  assertGreaterThan(parkLots.length, 0, 'park lots preserved after zoning');
}

// ── Block cell size ─────────────────────────────────────────────────────────

console.log('\nBlock cell size:');
{
  const cell = getBlockCellSize(RADIUS);
  assertGreaterThan(cell.maxWidth, 3, `cell maxWidth (${cell.maxWidth}) > 3`);
  assertGreaterThan(cell.maxDepth, 3, `cell maxDepth (${cell.maxDepth}) > 3`);
  assertLessThanOrEqual(cell.maxWidth, 30, `cell maxWidth (${cell.maxWidth}) <= 30`);
  assertLessThanOrEqual(cell.maxDepth, 30, `cell maxDepth (${cell.maxDepth}) <= 30`);

  // Cell depth (2 per block) should be larger than cell width (3 per block)
  assertGreaterThan(cell.maxDepth, cell.maxWidth, 'cell depth > width (2 rows vs 3 cols)');
}

// ── Small settlement ────────────────────────────────────────────────────────

console.log('\nSmall settlement (radius=35):');
{
  const smallResult = generateStreetAlignedLots(CENTER, 35, 30, 'small_test', TERRAIN_HALF);
  const buildingLots = smallResult.lots.filter(l => l.zone !== 'park');
  assertGreaterThan(buildingLots.length, 0, 'small settlement generates building lots');

  // gridSize=4 → 3x3 blocks → 8 building blocks × 6 = 48
  // But lotCount=30 so should cap at 30
  assertLessThanOrEqual(buildingLots.length, 30, 'does not exceed requested lot count');
}

// ── Corner lot detection ────────────────────────────────────────────────────

console.log('\nCorner lot detection:');
{
  const result = makeResult(100);
  const cornerLots = result.lots.filter(l => l.isCorner && l.zone !== 'park');

  // With 3x2 grid per block, corners are at (0,0), (0,2), (1,0), (1,2) = 4 corners per block
  assertGreaterThan(cornerLots.length, 0, 'has corner lots');

  for (const lot of cornerLots) {
    assert(lot.nearIntersection, 'corner lot is near an intersection');
  }
}

// ── resolveCornerFacing (unchanged helper) ──────────────────────────────────

console.log('\nresolveCornerFacing:');
{
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

  const cornerResult = resolveCornerFacing(50, 5, 1, streets, streetLengths, 25);
  assert(cornerResult !== null, 'resolveCornerFacing finds intersecting street');
  assert(cornerResult!.streetIdx === 0, 'corner facing points to main street');

  const mainResult = resolveCornerFacing(50, 0, 0, streets, streetLengths, 25);
  assert(mainResult === null, 'main street lot does not re-orient toward side street');
}

// ── Custom street names ─────────────────────────────────────────────────────

console.log('\nCustom street names (fallback streets):');
{
  const customNames = ['Oak Avenue', 'Elm Street', 'Maple Lane'];
  const result = generateStreetAlignedLots(CENTER, RADIUS, 20, 'names_test', TERRAIN_HALF, customNames);

  assertEqual(result.streets[0].streetName, 'Oak Avenue', 'main street uses first custom name');
  if (result.streets.length > 1) {
    assertEqual(result.streets[1].streetName, 'Elm Street', 'second street uses second custom name');
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
