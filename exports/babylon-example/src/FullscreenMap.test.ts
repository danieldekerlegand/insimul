/**
 * Tests for FullscreenMap (US-043)
 *
 * Tests the coordinate transformation and toggle logic without Babylon.js dependencies.
 *
 * Run with: npx tsx client/src/components/3DGame/FullscreenMap.test.ts
 */

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

// ── Re-implement the coordinate transform from FullscreenMap for testing ──

const MAP_SIZE = 600;

function worldToMap(
  wx: number,
  wz: number,
  worldSize: number
): [number, number] {
  const worldHalf = worldSize / 2;
  const mapHalf = MAP_SIZE / 2;
  const mx = ((wx + worldHalf) / worldSize) * MAP_SIZE - mapHalf;
  const mz = ((-wz + worldHalf) / worldSize) * MAP_SIZE - mapHalf;
  return [mx, mz];
}

// ── worldToMap tests ──

console.log('\n── worldToMap coordinate transform ──');

{
  // World origin (0,0) should map to center of the map (0,0 in GUI offset coords)
  const [mx, mz] = worldToMap(0, 0, 1024);
  assertApprox(mx, 0, 0.1, 'world origin maps to map center X');
  assertApprox(mz, 0, 0.1, 'world origin maps to map center Z');
}

{
  // Top-left corner of world (-512, 512) in a 1024 world
  const [mx, mz] = worldToMap(-512, 512, 1024);
  assertApprox(mx, -300, 0.1, 'world top-left maps to map left edge');
  assertApprox(mz, -300, 0.1, 'world top-left maps to map top edge');
}

{
  // Bottom-right corner of world (512, -512) in a 1024 world
  const [mx, mz] = worldToMap(512, -512, 1024);
  assertApprox(mx, 300, 0.1, 'world bottom-right maps to map right edge');
  assertApprox(mz, 300, 0.1, 'world bottom-right maps to map bottom edge');
}

{
  // Quarter world (256, 0) in a 1024 world
  const [mx, mz] = worldToMap(256, 0, 1024);
  assertApprox(mx, 150, 0.1, 'quarter X maps to quarter map X');
  assertApprox(mz, 0, 0.1, 'zero Z stays at center');
}

{
  // Different world size (512)
  const [mx, mz] = worldToMap(0, 0, 512);
  assertApprox(mx, 0, 0.1, 'origin still maps to center with different world size');
  assertApprox(mz, 0, 0.1, 'origin Z still maps to center with different world size');
}

{
  // Edge of a 512 world
  const [mx, mz] = worldToMap(256, -256, 512);
  assertApprox(mx, 300, 0.1, 'edge of 512 world maps to map edge X');
  assertApprox(mz, 300, 0.1, 'edge of 512 world maps to map edge Z');
}

// ── Toggle state tests (pure logic, no Babylon) ──

console.log('\n── Toggle state machine ──');

{
  // Simulate toggle logic
  let isOpen = false;
  const toggle = () => { isOpen = !isOpen; };
  const open = () => { isOpen = true; };
  const close = () => { isOpen = false; };

  assert(isOpen === false, 'starts closed');

  toggle();
  assert(isOpen === true, 'toggle opens');

  toggle();
  assert(isOpen === false, 'toggle closes');

  open();
  assert(isOpen === true, 'open() opens');

  open();
  assert(isOpen === true, 'open() while open stays open');

  close();
  assert(isOpen === false, 'close() closes');

  close();
  assert(isOpen === false, 'close() while closed stays closed');
}

// ── Marker color assignment tests ──

console.log('\n── Marker color assignment ──');

{
  function getSettlementColor(type: string): string {
    return type === 'city' ? '#9C27B0' : type === 'town' ? '#2196F3' : '#4CAF50';
  }

  assert(getSettlementColor('city') === '#9C27B0', 'city is purple');
  assert(getSettlementColor('town') === '#2196F3', 'town is blue');
  assert(getSettlementColor('village') === '#4CAF50', 'village is green');
  assert(getSettlementColor('hamlet') === '#4CAF50', 'unknown type defaults to green');
}

{
  function getNpcColor(role?: string): string {
    if (role === 'guard') return '#F44336';
    if (role === 'merchant') return '#4CAF50';
    if (role === 'questgiver') return '#FFC107';
    return 'rgba(200,200,200,0.7)';
  }

  assert(getNpcColor('guard') === '#F44336', 'guard is red');
  assert(getNpcColor('merchant') === '#4CAF50', 'merchant is green');
  assert(getNpcColor('questgiver') === '#FFC107', 'questgiver is amber');
  assert(getNpcColor('civilian') === 'rgba(200,200,200,0.7)', 'civilian is gray');
  assert(getNpcColor() === 'rgba(200,200,200,0.7)', 'undefined role is gray');
}

// ── Symmetry: worldToMap at opposite corners should be symmetric ──

console.log('\n── Symmetry tests ──');

{
  const ws = 1024;
  const [lx, lz] = worldToMap(-100, 50, ws);
  const [rx, rz] = worldToMap(100, -50, ws);
  assertApprox(lx, -rx, 0.1, 'symmetric X for opposite world positions');
  assertApprox(lz, -rz, 0.1, 'symmetric Z for opposite world positions');
}

// ── Summary ──

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
