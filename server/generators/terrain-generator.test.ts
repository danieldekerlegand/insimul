/**
 * Tests for TerrainGenerator.
 *
 * Run with: npx tsx server/generators/terrain-generator.test.ts
 */

import { TerrainGenerator, TerrainType, TerrainConfig } from './terrain-generator';

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

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  assert(Math.abs(actual - expected) <= tolerance, `${message} (got ${actual.toFixed(4)}, expected ~${expected} ±${tolerance})`);
}

/** Compute mean and standard deviation of a 2D array */
function stats(heightmap: number[][]): { min: number; max: number; mean: number; stddev: number } {
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  let count = 0;
  for (const row of heightmap) {
    for (const v of row) {
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
      count++;
    }
  }
  const mean = sum / count;
  let variance = 0;
  for (const row of heightmap) {
    for (const v of row) {
      variance += (v - mean) ** 2;
    }
  }
  return { min, max, mean, stddev: Math.sqrt(variance / count) };
}

const gen = new TerrainGenerator();
const baseSeed = 'terrain-test-42';

// ── Basic shape and range ──

function testOutputDimensions() {
  console.log('\n── Output Dimensions ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'plains' });
  assert(hm.length === 128, 'default resolution is 128 rows');
  assert(hm[0].length === 128, 'default resolution is 128 cols');

  const hm64 = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'plains', resolution: 64 });
  assert(hm64.length === 64, 'custom resolution 64 rows');
  assert(hm64[0].length === 64, 'custom resolution 64 cols');
}

function testNormalizedRange() {
  console.log('\n── Normalized [0,1] Range ──');
  const terrainTypes: TerrainType[] = ['plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert'];

  for (const tt of terrainTypes) {
    const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: tt, resolution: 64 });
    const s = stats(hm);
    assert(s.min >= 0, `${tt}: min >= 0 (got ${s.min.toFixed(4)})`);
    assert(s.max <= 1, `${tt}: max <= 1 (got ${s.max.toFixed(4)})`);
  }
}

// ── Terrain type distinct distributions ──

function testPlainsFlat() {
  console.log('\n── Plains are flat ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'plains', resolution: 64 });
  const s = stats(hm);
  assert(s.stddev < 0.05, `plains stddev < 0.05 (got ${s.stddev.toFixed(4)})`);
  assertApprox(s.mean, 0.5, 0.1, 'plains mean near 0.5');
}

function testMountainsHighVariation() {
  console.log('\n── Mountains have high variation ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'mountains', resolution: 64 });
  const s = stats(hm);
  assert(s.stddev > 0.05, `mountains stddev > 0.05 (got ${s.stddev.toFixed(4)})`);
  const range = s.max - s.min;
  assert(range > 0.1, `mountains range > 0.1 (got ${range.toFixed(4)})`);
}

function testHillsModerateVariation() {
  console.log('\n── Hills have moderate variation ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'hills', resolution: 64 });
  const s = stats(hm);
  assert(s.stddev > 0.02, `hills stddev > 0.02 (got ${s.stddev.toFixed(4)})`);
}

function testDesertLowOctaves() {
  console.log('\n── Desert has low-detail noise ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'desert', resolution: 64 });
  const s = stats(hm);
  // Desert uses only 2 octaves, so should be smoother than mountains
  const hmMountains = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'mountains', resolution: 64 });
  const sMountains = stats(hmMountains);
  assert(s.stddev < sMountains.stddev, `desert stddev (${s.stddev.toFixed(4)}) < mountains stddev (${sMountains.stddev.toFixed(4)})`);
}

function testCoastGradient() {
  console.log('\n── Coast has land-to-sea gradient ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'coast', resolution: 64 });
  // Left columns (land) should average higher than right columns (sea)
  let leftMean = 0, rightMean = 0;
  const mid = 32;
  for (let row = 0; row < 64; row++) {
    for (let col = 0; col < mid; col++) leftMean += hm[row][col];
    for (let col = mid; col < 64; col++) rightMean += hm[row][col];
  }
  leftMean /= (64 * mid);
  rightMean /= (64 * mid);
  assert(leftMean > rightMean, `coast: left mean (${leftMean.toFixed(4)}) > right mean (${rightMean.toFixed(4)})`);
}

function testRiverChannel() {
  console.log('\n── River has center channel ──');
  const hm = gen.generateHeightmap({ seed: baseSeed, width: 100, height: 100, terrainType: 'river', resolution: 64 });
  // Center column area should average lower than edges
  let centerMean = 0, edgeMean = 0;
  let centerCount = 0, edgeCount = 0;
  for (let row = 0; row < 64; row++) {
    for (let col = 0; col < 64; col++) {
      const distFromCenter = Math.abs(col - 32);
      if (distFromCenter < 8) {
        centerMean += hm[row][col];
        centerCount++;
      } else if (distFromCenter > 20) {
        edgeMean += hm[row][col];
        edgeCount++;
      }
    }
  }
  centerMean /= centerCount;
  edgeMean /= edgeCount;
  assert(centerMean < edgeMean, `river: center mean (${centerMean.toFixed(4)}) < edge mean (${edgeMean.toFixed(4)})`);
}

// ── Determinism ──

function testDeterminism() {
  console.log('\n── Determinism ──');
  const hm1 = gen.generateHeightmap({ seed: 'det-seed', width: 50, height: 50, terrainType: 'hills', resolution: 32 });
  const hm2 = gen.generateHeightmap({ seed: 'det-seed', width: 50, height: 50, terrainType: 'hills', resolution: 32 });

  let identical = true;
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 32; c++) {
      if (hm1[r][c] !== hm2[r][c]) { identical = false; break; }
    }
    if (!identical) break;
  }
  assert(identical, 'same seed produces identical heightmap');

  const hm3 = gen.generateHeightmap({ seed: 'different-seed', width: 50, height: 50, terrainType: 'hills', resolution: 32 });
  let allSame = true;
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 32; c++) {
      if (hm1[r][c] !== hm3[r][c]) { allSame = false; break; }
    }
    if (!allSame) break;
  }
  assert(!allSame, 'different seeds produce different heightmaps');
}

// ── Resolution scaling ──

function testResolutionScaling() {
  console.log('\n── Resolution Scaling ──');
  assert(TerrainGenerator.resolutionForSettlement('village') === 128, 'village → 128');
  assert(TerrainGenerator.resolutionForSettlement('town') === 256, 'town → 256');
  assert(TerrainGenerator.resolutionForSettlement('city') === 512, 'city → 512');
}

// ── Run all tests ──

console.log('=== TerrainGenerator Tests ===');
testOutputDimensions();
testNormalizedRange();
testPlainsFlat();
testMountainsHighVariation();
testHillsModerateVariation();
testDesertLowOctaves();
testCoastGradient();
testRiverChannel();
testDeterminism();
testResolutionScaling();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
