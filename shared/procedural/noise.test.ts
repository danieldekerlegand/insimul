/**
 * Tests for seeded Simplex noise module.
 *
 * Run with: npx tsx shared/procedural/noise.test.ts
 */

import { createNoise2D, fractalNoise } from './noise';

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

function testDeterminism() {
  console.log('\n── Determinism ──');
  const noiseA = createNoise2D('test-seed-42');
  const noiseB = createNoise2D('test-seed-42');

  // Same seed must produce identical output at multiple points
  const points = [
    [0, 0], [1.5, 2.3], [-10, 7.7], [100.1, -50.5], [0.001, 0.001],
  ];

  for (const [x, y] of points) {
    assert(noiseA(x, y) === noiseB(x, y), `same seed same value at (${x}, ${y})`);
  }
}

function testDifferentSeeds() {
  console.log('\n── Different Seeds ──');
  const noiseA = createNoise2D('seed-alpha');
  const noiseB = createNoise2D('seed-beta');

  // Different seeds should produce different values (statistically guaranteed for multiple points)
  let differences = 0;
  const points = [
    [0, 0], [1, 1], [5, 5], [10, 10], [0.5, 0.5],
  ];

  for (const [x, y] of points) {
    if (noiseA(x, y) !== noiseB(x, y)) {
      differences++;
    }
  }

  assert(differences >= 3, `different seeds produce different values (${differences}/5 differ)`);
}

function testRange() {
  console.log('\n── Output Range ──');
  const noise = createNoise2D('range-test');

  let min = Infinity;
  let max = -Infinity;

  // Sample many points
  for (let x = -50; x <= 50; x += 0.7) {
    for (let y = -50; y <= 50; y += 0.7) {
      const v = noise(x, y);
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  assert(min >= -1, `min value >= -1 (got ${min.toFixed(6)})`);
  assert(max <= 1, `max value <= 1 (got ${max.toFixed(6)})`);
  assert(min < -0.1, `noise has negative values (min: ${min.toFixed(6)})`);
  assert(max > 0.1, `noise has positive values (max: ${max.toFixed(6)})`);
}

function testFractalNoise() {
  console.log('\n── Fractal Noise ──');
  const noise = createNoise2D('fractal-test');

  // Fractal noise should be deterministic too
  const a = fractalNoise(noise, 5.5, 3.3, 4, 2.0, 0.5);
  const b = fractalNoise(noise, 5.5, 3.3, 4, 2.0, 0.5);
  assert(a === b, `fractalNoise is deterministic`);

  // Different parameters should produce different results
  const c = fractalNoise(noise, 5.5, 3.3, 2, 2.0, 0.5);
  assert(a !== c, `different octaves produce different values`);

  // Fractal noise with default params
  const d = fractalNoise(noise, 1, 1);
  assert(typeof d === 'number' && !isNaN(d), `default params produce valid number`);

  // Check range is roughly [-1, 1]
  let min = Infinity;
  let max = -Infinity;
  for (let x = -20; x <= 20; x += 0.5) {
    for (let y = -20; y <= 20; y += 0.5) {
      const v = fractalNoise(noise, x, y, 6, 2.0, 0.5);
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  assert(min >= -1.5, `fractal min within reasonable range (${min.toFixed(4)})`);
  assert(max <= 1.5, `fractal max within reasonable range (${max.toFixed(4)})`);
}

function testFunctionSignature() {
  console.log('\n── Function Signature ──');
  const noise = createNoise2D('sig-test');
  assert(typeof noise === 'function', `createNoise2D returns a function`);

  const result = noise(0, 0);
  assert(typeof result === 'number', `noise function returns a number`);
  assert(!isNaN(result), `noise function returns non-NaN`);
}

// Run all tests
testDeterminism();
testDifferentSeeds();
testRange();
testFractalNoise();
testFunctionSignature();

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
