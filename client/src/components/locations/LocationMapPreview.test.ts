/**
 * Tests for LocationMapPreview layout consistency with 3D game.
 *
 * Run with: npx tsx client/src/components/locations/LocationMapPreview.test.ts
 */

import { computeSettlementLayout } from './LocationMapPreview';

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

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (expected ~${expected}, got ${actual}, diff=${diff.toFixed(4)})`);
}

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('\n=== computeSettlementLayout ===\n');

// Test 1: Uses positionX/positionZ when available
console.log('-- DB position data --');
{
  const lots = [
    { id: 'lot1', positionX: 100, positionZ: 200, facingAngle: 1.5, streetName: 'Main Street' },
    { id: 'lot2', positionX: 120, positionZ: 200, facingAngle: 0.5, streetName: 'Main Street' },
    { id: 'lot3', positionX: 100, positionZ: 220, facingAngle: 2.0, streetName: '1st Street' },
    { id: 'lot4', positionX: 120, positionZ: 220, facingAngle: 0.0, streetName: '1st Street' },
  ];

  const { positions, streets } = computeSettlementLayout(lots);

  assert(positions.size === 4, 'All 4 lots get positions');

  // Lots with same X in world should have same X in preview
  const p1 = positions.get('lot1')!;
  const p3 = positions.get('lot3')!;
  assertClose(p1.x, p3.x, 0.01, 'Lots on same X column stay aligned');

  // Lots with same Z in world should have same Z in preview
  const p2 = positions.get('lot2')!;
  assertClose(p1.z, p2.z, 0.01, 'Lots on same Z row stay aligned');

  // Facing angles preserved from DB
  assertClose(p1.angle, 1.5, 0.001, 'Facing angle preserved for lot1');
  assertClose(p2.angle, 0.5, 0.001, 'Facing angle preserved for lot2');

  // Relative distances maintained (lot1→lot2 = 20 units X, lot1→lot3 = 20 units Z)
  const d12x = Math.abs(p1.x - p2.x);
  const d13z = Math.abs(p1.z - p3.z);
  assertClose(d12x, d13z, 0.01, 'Equal world distances produce equal preview distances');

  // Streets reconstructed from lot positions
  assert(streets.length >= 1, 'At least one street segment reconstructed');
  const mainStreet = streets.find(s => s.streetName === 'Main Street');
  assert(!!mainStreet, 'Main Street segment exists');
  assert(mainStreet!.isMainStreet === true, 'Main Street flagged as main');
}

// Test 2: Falls back to generateStreetAlignedLots when no positions
console.log('\n-- Fallback (no position data) --');
{
  const lots = [
    { id: 'a1', streetName: 'Oak Ave' },
    { id: 'a2', streetName: 'Oak Ave' },
    { id: 'a3', streetName: 'Elm St' },
    { id: 'a4', streetName: 'Elm St' },
    { id: 'a5' },
    { id: 'a6' },
  ];

  const { positions, streets } = computeSettlementLayout(lots, 'test-settlement-123');

  assert(positions.size === 6, 'All 6 lots get positions from fallback');

  // Streets should be generated
  assert(streets.length >= 1, 'Streets generated in fallback mode');

  // Positions should be spread out, not all at origin
  let maxDist = 0;
  for (const pos of positions.values()) {
    const d = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    maxDist = Math.max(maxDist, d);
  }
  assert(maxDist > 1, 'Lots spread across preview (not all at origin)');
}

// Test 3: Deterministic — same input produces same output
console.log('\n-- Deterministic layout --');
{
  const lots = [
    { id: 'det1', streetName: 'Main Street' },
    { id: 'det2', streetName: 'Main Street' },
    { id: 'det3', streetName: '1st Street' },
  ];

  const r1 = computeSettlementLayout(lots, 'seed-abc');
  const r2 = computeSettlementLayout(lots, 'seed-abc');

  for (const id of ['det1', 'det2', 'det3']) {
    const p1 = r1.positions.get(id)!;
    const p2 = r2.positions.get(id)!;
    assertClose(p1.x, p2.x, 0.0001, `${id} x is deterministic`);
    assertClose(p1.z, p2.z, 0.0001, `${id} z is deterministic`);
    assertClose(p1.angle, p2.angle, 0.0001, `${id} angle is deterministic`);
  }
}

// Test 4: Mixed — some lots with positions, some without
console.log('\n-- Mixed position data --');
{
  const lots = [
    { id: 'mix1', positionX: 50, positionZ: 50, facingAngle: 0.5, streetName: 'Main Street' },
    { id: 'mix2', positionX: 60, positionZ: 50, facingAngle: 1.0, streetName: 'Main Street' },
    { id: 'mix3' }, // no position data
  ];

  const { positions } = computeSettlementLayout(lots);

  assert(positions.size === 3, 'All lots get positions (mixed mode)');
  assert(positions.has('mix3'), 'Lot without position data still gets a position');

  // The positioned lots should use DB-based placement
  assertClose(positions.get('mix1')!.angle, 0.5, 0.001, 'DB angle preserved in mixed mode');
}

// Test 5: Empty lots
console.log('\n-- Empty lots --');
{
  const { positions, streets } = computeSettlementLayout([]);
  assert(positions.size === 0, 'No positions for empty lots');
  assert(streets.length === 0, 'No streets for empty lots');
}

// Test 6: Positions fit within preview bounds
console.log('\n-- Preview bounds --');
{
  const lots = Array.from({ length: 20 }, (_, i) => ({
    id: `bound${i}`,
    positionX: Math.cos(i * 0.5) * 500,
    positionZ: Math.sin(i * 0.5) * 500,
    facingAngle: 0,
    streetName: i < 10 ? 'Main Street' : '1st Street',
  }));

  const { positions } = computeSettlementLayout(lots);

  let maxCoord = 0;
  for (const pos of positions.values()) {
    maxCoord = Math.max(maxCoord, Math.abs(pos.x), Math.abs(pos.z));
  }
  assert(maxCoord <= 15, `Positions fit within preview bounds (max coord: ${maxCoord.toFixed(2)})`);
  assert(maxCoord > 3, `Positions use reasonable preview space (max coord: ${maxCoord.toFixed(2)})`);
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
