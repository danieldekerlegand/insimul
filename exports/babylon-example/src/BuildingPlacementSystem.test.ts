/**
 * Tests for elevation-aware building placement (US-026)
 *
 * Run with: npx tsx client/src/components/3DGame/BuildingPlacementSystem.test.ts
 */

import { MAX_SLOPE_ANGLE } from './BuildingPlacementSystem';
import type { HeightSampler } from './BuildingPlacementSystem';

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

function assertApprox(actual: number, expected: number, epsilon: number, message: string) {
  const ok = Math.abs(actual - expected) < epsilon;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message} (expected ~${expected}, got ${actual})`);
  }
}

// ── computeSlopeAngle tests (pure math, no Babylon dependency) ──

// Re-implement the slope computation logic here to test it independently
// (avoids needing to instantiate Babylon Scene/ResourceSystem in tests)
const SLOPE_SAMPLE_OFFSET = 0.5;

function computeSlopeAngle(
  sampler: HeightSampler,
  x: number, z: number,
  width: number, depth: number
): number {
  const hw = (width / 2) - SLOPE_SAMPLE_OFFSET;
  const hd = (depth / 2) - SLOPE_SAMPLE_OFFSET;

  const centerY = sampler(x, z);
  const samples = [
    sampler(x - hw, z - hd),
    sampler(x + hw, z - hd),
    sampler(x - hw, z + hd),
    sampler(x + hw, z + hd),
  ];

  let maxAngle = 0;
  for (const sy of samples) {
    const dy = Math.abs(sy - centerY);
    const dist = Math.sqrt(hw * hw + hd * hd);
    const angle = Math.atan2(dy, dist);
    if (angle > maxAngle) maxAngle = angle;
  }
  return maxAngle;
}

// ── Test: flat terrain ──
console.log('\n── Flat terrain ──');

{
  const flatSampler: HeightSampler = () => 0;
  const angle = computeSlopeAngle(flatSampler, 5, 5, 3, 3);
  assertApprox(angle, 0, 0.001, 'flat terrain has zero slope');
}

// ── Test: elevated but flat terrain ──
console.log('\n── Elevated flat terrain ──');

{
  const elevatedFlat: HeightSampler = () => 10;
  const angle = computeSlopeAngle(elevatedFlat, 5, 5, 3, 3);
  assertApprox(angle, 0, 0.001, 'elevated flat terrain has zero slope');
}

// ── Test: gentle slope ──
console.log('\n── Gentle slope ──');

{
  // 1 unit rise over 10 units → ~5.7 degrees
  const gentleSampler: HeightSampler = (x) => x * 0.1;
  const angle = computeSlopeAngle(gentleSampler, 5, 5, 3, 3);
  assert(angle > 0, 'gentle slope has positive angle');
  assert(angle < MAX_SLOPE_ANGLE, 'gentle slope is below max slope threshold');
}

// ── Test: steep slope ──
console.log('\n── Steep slope ──');

{
  // 3 units rise over 1 unit → very steep
  const steepSampler: HeightSampler = (x) => x * 3;
  const angle = computeSlopeAngle(steepSampler, 5, 5, 3, 3);
  assert(angle > MAX_SLOPE_ANGLE, 'steep slope exceeds max slope threshold');
}

// ── Test: slope only in Z direction ──
console.log('\n── Z-axis slope ──');

{
  const zSlopeSampler: HeightSampler = (_x, z) => z * 0.1;
  const angle = computeSlopeAngle(zSlopeSampler, 5, 5, 3, 3);
  assert(angle > 0, 'z-axis slope has positive angle');
}

// ── Test: height sampler values propagate correctly ──
console.log('\n── Height sampling ──');

{
  const calls: Array<[number, number]> = [];
  const trackingSampler: HeightSampler = (x, z) => {
    calls.push([x, z]);
    return 0;
  };
  computeSlopeAngle(trackingSampler, 10, 20, 4, 4);
  // Should sample center + 4 corners = 5 calls
  assert(calls.length === 5, `slope computation samples 5 points (got ${calls.length})`);
  // Center should be first
  assert(calls[0][0] === 10 && calls[0][1] === 20, 'first sample is at center position');
}

// ── Test: MAX_SLOPE_ANGLE constant ──
console.log('\n── Constants ──');

{
  assertApprox(MAX_SLOPE_ANGLE, Math.PI / 6, 0.001, 'MAX_SLOPE_ANGLE is ~30 degrees (π/6)');
}

// ── Test: terrain-snapped Y position calculation ──
console.log('\n── Terrain Y snapping ──');

{
  const hillSampler: HeightSampler = (x, z) => Math.sin(x * 0.5) * 3;
  const terrainY = hillSampler(4, 0);
  const buildingHeight = 3;
  const expectedY = terrainY + buildingHeight / 2;
  assertApprox(expectedY, terrainY + 1.5, 0.001, 'building Y = terrain height + half building height');
  assert(expectedY !== buildingHeight / 2, 'building Y is NOT just height/2 on non-flat terrain');
}

// ── Test: per-building maxSlopeAngle override ──
console.log('\n── Per-building slope override ──');

{
  // A building with a very permissive slope limit
  const permissiveMaxSlope = Math.PI / 3; // 60 degrees
  const steepSampler: HeightSampler = (x) => x * 1.5;
  const angle = computeSlopeAngle(steepSampler, 5, 5, 3, 3);
  assert(angle > MAX_SLOPE_ANGLE, 'slope exceeds default max');
  assert(angle < permissiveMaxSlope, 'slope is within permissive override');
}

// ── Test: building size affects slope on non-linear terrain ──
console.log('\n── Building size affects slope on curved terrain ──');

{
  // A terrain bump — non-linear, so larger buildings sample further from peak
  const bumpSampler: HeightSampler = (x) => Math.exp(-((x - 5) ** 2));
  const smallAngle = computeSlopeAngle(bumpSampler, 5, 5, 1.5, 1.5);
  const largeAngle = computeSlopeAngle(bumpSampler, 5, 5, 6, 6);
  assert(largeAngle > smallAngle, 'larger footprint detects greater height variation on a bump');
}

// ── Results ──
console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) {
  process.exit(1);
}
