/**
 * Tests for foundation-calculator.ts
 */

import { calculateFoundation, FoundationData } from './foundation-calculator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

/** Create a flat heightmap where every cell has the same value */
function flatHeightmap(resolution: number, value: number): number[][] {
  const hm: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    hm.push(new Array(resolution).fill(value));
  }
  return hm;
}

/** Create a heightmap with a linear gradient left-to-right (low→high) */
function gradientHeightmap(resolution: number, lowValue: number, highValue: number): number[][] {
  const hm: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    const row: number[] = [];
    for (let c = 0; c < resolution; c++) {
      const t = c / (resolution - 1);
      row.push(lowValue + t * (highValue - lowValue));
    }
    hm.push(row);
  }
  return hm;
}

/** Create a heightmap with a steep slope in a localized region */
function steepRegionHeightmap(resolution: number): number[][] {
  const hm: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    const row: number[] = [];
    for (let c = 0; c < resolution; c++) {
      // Steep slope in upper-left quadrant
      if (r < resolution / 2 && c < resolution / 2) {
        row.push(0.2 + (c / resolution) * 0.8);
      } else {
        row.push(0.5);
      }
    }
    hm.push(row);
  }
  return hm;
}

// ── Flat terrain → flat foundation ──
function testFlatTerrain() {
  console.log('\n── Flat terrain → flat foundation ──');
  const hm = flatHeightmap(64, 0.5);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 10, depth: 10 },
    hm,
  );
  assert(result.type === 'flat', `type should be flat (got ${result.type})`);
  assert(result.foundationHeight === 0, `foundationHeight should be 0 (got ${result.foundationHeight})`);
  assert(result.retainingWall === false, 'no retaining wall on flat terrain');
}

// ── Gentle slope → raised foundation ──
function testGentleSlope() {
  console.log('\n── Gentle slope → raised foundation ──');
  // Gradient from 0.5 to 0.54 over 64 cells. With lot width=10, mapExtent=100,
  // the lot spans ~5 cells. Delta ≈ (0.04/64)*5 * 20 ≈ 0.0625 per cell * scale
  // We need delta in [0.3, 1.0). Use a steeper gradient.
  // With gradient 0.0 to 1.0, lot at center spans 5% of map.
  // Corner elevations differ by ~0.05 * 20 = 1.0 → that's stilted.
  // For raised (0.3-1.0), we need delta = 0.015-0.05 in heightmap units.
  // Gradient 0.4 to 0.6 across 64 cells. Lot at x=0, width=10, mapExtent=100:
  //   left corner at x=-5 → u = 95/200 = 0.475 → col ~30 → value ≈ 0.4 + (30/63)*0.2 = 0.495
  //   right corner at x=+5 → u = 105/200 = 0.525 → col ~33 → value ≈ 0.4 + (33/63)*0.2 = 0.505
  //   delta in heightmap = 0.01, * 20 = 0.2 → flat!
  // Need wider lot or steeper gradient.
  // Let's use gradient 0.0 to 1.0, lot width=20, mapExtent=50:
  //   left corner x=-10 → u = 40/100 = 0.4 → col 25 → value ≈ 25/63 = 0.397
  //   right corner x=+10 → u = 60/100 = 0.6 → col 38 → value ≈ 38/63 = 0.603
  //   delta = 0.206 * 20 = 4.12 → terraced. Too steep.
  // Use elevationScale=3, gradient 0.0 to 1.0, width=20, mapExtent=50:
  //   delta = 0.206 * 3 = 0.62 → raised!
  const hm = gradientHeightmap(64, 0.0, 1.0);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 20, depth: 10 },
    hm,
    50,
    3,
  );
  assert(result.type === 'raised', `type should be raised (got ${result.type})`);
  assert(result.foundationHeight > 0, `foundationHeight should be > 0 (got ${result.foundationHeight})`);
  assert(result.foundationHeight < 1.0, `foundationHeight should be < 1.0 (got ${result.foundationHeight})`);
  assert(result.retainingWall === false, 'no retaining wall for raised');
}

// ── Moderate slope → stilted foundation ──
function testModerateSlope() {
  console.log('\n── Moderate slope → stilted foundation ──');
  // gradient 0.0 to 1.0, width=20, mapExtent=50, elevationScale=7:
  //   delta ≈ 0.206 * 7 = 1.44 → stilted (1.0-2.5)
  const hm = gradientHeightmap(64, 0.0, 1.0);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 20, depth: 10 },
    hm,
    50,
    7,
  );
  assert(result.type === 'stilted', `type should be stilted (got ${result.type})`);
  assert(result.foundationHeight >= 1.0, `foundationHeight >= 1.0 (got ${result.foundationHeight})`);
  assert(result.foundationHeight < 2.5, `foundationHeight < 2.5 (got ${result.foundationHeight})`);
  assert(result.retainingWall === false, 'no retaining wall for stilted');
}

// ── Steep slope → terraced with retaining wall ──
function testSteepSlope() {
  console.log('\n── Steep slope → terraced with retaining wall ──');
  // gradient 0.0 to 1.0, width=20, mapExtent=50, elevationScale=20:
  //   delta ≈ 0.206 * 20 = 4.12 → terraced (>=2.5)
  const hm = gradientHeightmap(64, 0.0, 1.0);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 20, depth: 10 },
    hm,
    50,
    20,
  );
  assert(result.type === 'terraced', `type should be terraced (got ${result.type})`);
  assert(result.foundationHeight >= 2.5, `foundationHeight >= 2.5 (got ${result.foundationHeight})`);
  assert(result.retainingWall === true, 'terraced has retaining wall');
}

// ── baseElevation is the minimum corner ──
function testBaseElevation() {
  console.log('\n── baseElevation is minimum corner ──');
  const hm = gradientHeightmap(64, 0.0, 1.0);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 20, depth: 10 },
    hm,
    50,
    20,
  );
  // Left corners should be lower
  assert(result.baseElevation < 10, `baseElevation should be < 10 (got ${result.baseElevation})`);
  assert(result.baseElevation >= 0, `baseElevation should be >= 0 (got ${result.baseElevation})`);
}

// ── Empty heightmap returns flat ──
function testEmptyHeightmap() {
  console.log('\n── Empty heightmap returns flat ──');
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 10, depth: 10 },
    [],
  );
  assert(result.type === 'flat', `type should be flat (got ${result.type})`);
  assert(result.foundationHeight === 0, `foundationHeight should be 0 (got ${result.foundationHeight})`);
}

// ── Lot at edge of map ──
function testEdgeOfMap() {
  console.log('\n── Lot at edge of map ──');
  const hm = flatHeightmap(64, 0.3);
  const result = calculateFoundation(
    { x: 90, y: 0, z: 90 },
    { width: 10, depth: 10 },
    hm,
    100,
    20,
  );
  assert(result.type === 'flat', `type should be flat at edge (got ${result.type})`);
  assert(result.baseElevation === 0.3 * 20, `baseElevation should be 6 (got ${result.baseElevation})`);
}

// ── Depth direction slope also detected ──
function testDepthSlope() {
  console.log('\n── Depth direction slope also detected ──');
  // Gradient in Z direction (rows): lot with large depth should detect slope
  const hm: number[][] = [];
  for (let r = 0; r < 64; r++) {
    const val = r / 63;
    hm.push(new Array(64).fill(val));
  }
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 10, depth: 20 },
    hm,
    50,
    20,
  );
  assert(result.type !== 'flat', `should not be flat with Z-gradient (got ${result.type})`);
  assert(result.foundationHeight > 0, `foundationHeight > 0 (got ${result.foundationHeight})`);
}

// ── FoundationData interface shape ──
function testInterfaceShape() {
  console.log('\n── FoundationData interface shape ──');
  const hm = flatHeightmap(32, 0.5);
  const result = calculateFoundation(
    { x: 0, y: 0, z: 0 },
    { width: 10, depth: 10 },
    hm,
  );
  assert('type' in result, 'has type field');
  assert('baseElevation' in result, 'has baseElevation field');
  assert('foundationHeight' in result, 'has foundationHeight field');
  assert('retainingWall' in result, 'has retainingWall field');
  assert(typeof result.type === 'string', 'type is string');
  assert(typeof result.baseElevation === 'number', 'baseElevation is number');
  assert(typeof result.foundationHeight === 'number', 'foundationHeight is number');
  assert(typeof result.retainingWall === 'boolean', 'retainingWall is boolean');
}

// Run all tests
testFlatTerrain();
testGentleSlope();
testModerateSlope();
testSteepSlope();
testBaseElevation();
testEmptyHeightmap();
testEdgeOfMap();
testDepthSlope();
testInterfaceShape();

console.log(`\n════════════════════════════════════`);
console.log(`Foundation Calculator Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
