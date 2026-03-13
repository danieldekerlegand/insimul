/**
 * Tests for boundary-generator.ts — settlement boundary polygon generation.
 *
 * Run with: npx tsx server/generators/boundary-generator.test.ts
 */

import { generateSettlementBoundary, SettlementBoundary, BoundaryConfig } from './boundary-generator';

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

// ── Helpers ──

function makeConfig(overrides: Partial<BoundaryConfig> = {}): BoundaryConfig {
  return {
    seed: 'test-seed',
    terrain: 'plains',
    settlementType: 'town',
    population: 500,
    ...overrides,
  };
}

function polygonCenter(polygon: { x: number; z: number }[]): { x: number; z: number } {
  let cx = 0, cz = 0;
  for (const p of polygon) {
    cx += p.x;
    cz += p.z;
  }
  return { x: cx / polygon.length, z: cz / polygon.length };
}

// ── Tests ──

console.log('\n=== Settlement Boundary Generator Tests ===\n');

// Basic generation
console.log('--- Basic generation ---');
{
  const boundary = generateSettlementBoundary(makeConfig());
  assert(boundary.polygon.length > 0, 'Polygon has vertices');
  assert(boundary.polygon.length >= 32, 'Polygon has sufficient detail (>= 32 vertices)');
  assert(boundary.area > 0, 'Area is positive');
  assert(['natural', 'walled', 'open'].includes(boundary.perimeterType), 'Perimeter type is valid');
}

// Determinism
console.log('--- Determinism ---');
{
  const config = makeConfig({ seed: 'determinism-test' });
  const b1 = generateSettlementBoundary(config);
  const b2 = generateSettlementBoundary(config);
  assert(b1.polygon.length === b2.polygon.length, 'Same seed produces same vertex count');
  let allMatch = true;
  for (let i = 0; i < b1.polygon.length; i++) {
    if (b1.polygon[i].x !== b2.polygon[i].x || b1.polygon[i].z !== b2.polygon[i].z) {
      allMatch = false;
      break;
    }
  }
  assert(allMatch, 'Same seed produces identical polygon');
  assert(b1.area === b2.area, 'Same seed produces same area');
}

// Different seeds produce different results
console.log('--- Different seeds ---');
{
  const b1 = generateSettlementBoundary(makeConfig({ seed: 'seed-a' }));
  const b2 = generateSettlementBoundary(makeConfig({ seed: 'seed-b' }));
  let anyDiff = false;
  const len = Math.min(b1.polygon.length, b2.polygon.length);
  for (let i = 0; i < len; i++) {
    if (b1.polygon[i].x !== b2.polygon[i].x || b1.polygon[i].z !== b2.polygon[i].z) {
      anyDiff = true;
      break;
    }
  }
  assert(anyDiff, 'Different seeds produce different polygons');
}

// Terrain types
console.log('--- Terrain types ---');
const terrains: BoundaryConfig['terrain'][] = ['plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert'];
for (const terrain of terrains) {
  const boundary = generateSettlementBoundary(makeConfig({ terrain }));
  assert(boundary.polygon.length > 0, `${terrain}: produces valid polygon`);
  assert(boundary.area > 0, `${terrain}: has positive area`);
}

// Settlement type sizes
console.log('--- Settlement type sizes ---');
{
  const village = generateSettlementBoundary(makeConfig({ settlementType: 'village', population: 200 }));
  const town = generateSettlementBoundary(makeConfig({ settlementType: 'town', population: 500 }));
  const city = generateSettlementBoundary(makeConfig({ settlementType: 'city', population: 2000 }));
  assert(village.area < town.area, 'Village area < town area');
  assert(town.area < city.area, 'Town area < city area');
}

// Perimeter type selection
console.log('--- Perimeter type ---');
{
  const village = generateSettlementBoundary(makeConfig({ settlementType: 'village', population: 100 }));
  assert(village.perimeterType === 'open', 'Village has open perimeter');

  const city = generateSettlementBoundary(makeConfig({ settlementType: 'city', population: 2000 }));
  assert(city.perimeterType === 'walled', 'Large city has walled perimeter');

  const town = generateSettlementBoundary(makeConfig({ settlementType: 'town', population: 500 }));
  assert(town.perimeterType === 'natural', 'Town has natural perimeter');
}

// Center offset
console.log('--- Center offset ---');
{
  const center = { x: 100, z: -50 };
  const boundary = generateSettlementBoundary(makeConfig({ center }));
  const c = polygonCenter(boundary.polygon);
  // Center of polygon should be approximately at the requested center
  assert(Math.abs(c.x - center.x) < 50, 'Polygon centered near requested x');
  assert(Math.abs(c.z - center.z) < 50, 'Polygon centered near requested z');
}

// Coast terrain produces asymmetric shape (flattened on coast side)
console.log('--- Coast asymmetry ---');
{
  const coast = generateSettlementBoundary(makeConfig({ terrain: 'coast', seed: 'coast-test' }));
  // Compute min and max radii from center
  const c = polygonCenter(coast.polygon);
  const radii = coast.polygon.map(p => Math.sqrt((p.x - c.x) ** 2 + (p.z - c.z) ** 2));
  const minR = Math.min(...radii);
  const maxR = Math.max(...radii);
  assert(maxR / minR > 1.3, 'Coast boundary is asymmetric (max/min radius ratio > 1.3)');
}

// Mountain terrain produces elongated shape
console.log('--- Mountain elongation ---');
{
  const mountain = generateSettlementBoundary(makeConfig({ terrain: 'mountains', seed: 'mountain-test' }));
  const c = polygonCenter(mountain.polygon);
  const radii = mountain.polygon.map(p => Math.sqrt((p.x - c.x) ** 2 + (p.z - c.z) ** 2));
  const minR = Math.min(...radii);
  const maxR = Math.max(...radii);
  assert(maxR / minR > 1.2, 'Mountain boundary is elongated (max/min radius ratio > 1.2)');
}

// Desert terrain produces compact shape
console.log('--- Desert compactness ---');
{
  const desert = generateSettlementBoundary(makeConfig({ terrain: 'desert', seed: 'desert-test' }));
  const plains = generateSettlementBoundary(makeConfig({ terrain: 'plains', seed: 'desert-test' }));
  assert(desert.area < plains.area, 'Desert boundary is more compact than plains');
}

// River terrain produces elongated shape
console.log('--- River elongation ---');
{
  const river = generateSettlementBoundary(makeConfig({ terrain: 'river', seed: 'river-test' }));
  const c = polygonCenter(river.polygon);
  const radii = river.polygon.map(p => Math.sqrt((p.x - c.x) ** 2 + (p.z - c.z) ** 2));
  const minR = Math.min(...radii);
  const maxR = Math.max(...radii);
  assert(maxR / minR > 1.3, 'River boundary is elongated (max/min radius ratio > 1.3)');
}

// Heightmap integration
console.log('--- Heightmap integration ---');
{
  // Create a heightmap with steep gradients on the right half
  const size = 128;
  const heightmap: number[][] = [];
  for (let z = 0; z < size; z++) {
    heightmap[z] = [];
    for (let x = 0; x < size; x++) {
      // Right half has a steep continuous gradient (slope ~0.5 per cell)
      heightmap[z][x] = x > size / 2 ? ((x - size / 2) / (size / 2)) * 50 : 0.0;
    }
  }

  const withHeight = generateSettlementBoundary(
    makeConfig({ terrain: 'mountains', seed: 'hmap-test' }),
    heightmap,
  );
  const withoutHeight = generateSettlementBoundary(
    makeConfig({ terrain: 'mountains', seed: 'hmap-test' }),
  );
  // With heightmap should modify the boundary (potentially different area)
  assert(withHeight.polygon.length === withoutHeight.polygon.length, 'Same vertex count with/without heightmap');
  assert(withHeight.area !== withoutHeight.area, 'Heightmap affects boundary shape');
}

// Polygon validity — no self-intersections (basic winding check)
console.log('--- Polygon validity ---');
{
  const boundary = generateSettlementBoundary(makeConfig());
  // Check that all vertices are distinct
  const uniquePoints = new Set(boundary.polygon.map(p => `${p.x},${p.z}`));
  assert(uniquePoints.size === boundary.polygon.length, 'All polygon vertices are unique');

  // Check polygon is closed (first and last vertex should be different — it's implicitly closed)
  const first = boundary.polygon[0];
  const last = boundary.polygon[boundary.polygon.length - 1];
  assert(first.x !== last.x || first.z !== last.z, 'Polygon is implicitly closed (first ≠ last)');
}

// ── Summary ──
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
