/**
 * Tests for TerrainGenerator.
 *
 * Run with: npx tsx server/generators/terrain-generator.test.ts
 */

import { TerrainGenerator, TerrainType, TerrainConfig, TerrainFeature, FeatureType } from './terrain-generator';

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

// ── Feature stamping ──

/** Create a flat heightmap at a given elevation */
function flatMap(res: number, elevation: number = 0.5): number[][] {
  return Array.from({ length: res }, () => Array(res).fill(elevation));
}

function testStampPeak() {
  console.log('\n── stampPeak ──');
  const hm = flatMap(64, 0.5);
  gen.stampPeak(hm, 32, 32, 10, 0.3);
  assert(hm[32][32] > 0.5, `peak center elevated (${hm[32][32].toFixed(4)} > 0.5)`);
  assert(hm[32][32] > hm[32][48], 'peak center higher than distant point');
  assert(hm[0][0] === 0.5, 'far corner unchanged');
  const s = stats(hm);
  assert(s.max <= 1, 'peak clamped to <= 1');
}

function testStampValley() {
  console.log('\n── stampValley ──');
  const hm = flatMap(64, 0.5);
  gen.stampValley(hm, 32, 32, 10, 0.25);
  assert(hm[32][32] < 0.5, `valley center depressed (${hm[32][32].toFixed(4)} < 0.5)`);
  assert(hm[32][32] < hm[32][48], 'valley center lower than distant point');
  const s = stats(hm);
  assert(s.min >= 0, 'valley clamped to >= 0');
}

function testStampCanyon() {
  console.log('\n── stampCanyon ──');
  const hm = flatMap(64, 0.5);
  gen.stampCanyon(hm, 32, 32, 20, 0.35);
  assert(hm[32][32] < 0.5, `canyon center depressed (${hm[32][32].toFixed(4)} < 0.5)`);
  // Canyon is narrow — points far from center X should be untouched
  assert(hm[32][0] === 0.5, 'far left untouched by canyon');
  const s = stats(hm);
  assert(s.min >= 0, 'canyon clamped to >= 0');
}

function testStampCliff() {
  console.log('\n── stampCliff ──');
  const hm = flatMap(64, 0.5);
  gen.stampCliff(hm, 32, 32, 15, 0.2);
  // Above cliff center should differ from below
  const above = hm[20][32];
  const below = hm[44][32];
  assert(above !== below, `cliff creates elevation difference (above=${above.toFixed(4)}, below=${below.toFixed(4)})`);
  const s = stats(hm);
  assert(s.min >= 0 && s.max <= 1, 'cliff values in [0,1]');
}

function testStampMesa() {
  console.log('\n── stampMesa ──');
  const hm = flatMap(64, 0.4);
  gen.stampMesa(hm, 32, 32, 15, 0.2);
  assert(hm[32][32] > 0.4, `mesa center raised (${hm[32][32].toFixed(4)} > 0.4)`);
  // Inner area should be flat (uniform elevation)
  const inner1 = hm[32][30];
  const inner2 = hm[30][32];
  assertApprox(inner1, inner2, 0.01, 'mesa inner area is flat');
  const s = stats(hm);
  assert(s.max <= 1, 'mesa clamped to <= 1');
}

function testStampCrater() {
  console.log('\n── stampCrater ──');
  const hm = flatMap(64, 0.5);
  gen.stampCrater(hm, 32, 32, 12, 0.3);
  assert(hm[32][32] < 0.5, `crater center depressed (${hm[32][32].toFixed(4)} < 0.5)`);
  // Rim should be near or above baseline
  const rimRow = 32 + Math.round(12 * 0.9);
  const rimVal = hm[rimRow][32];
  assert(rimVal >= hm[32][32], `crater rim (${rimVal.toFixed(4)}) >= center (${hm[32][32].toFixed(4)})`);
  const s = stats(hm);
  assert(s.min >= 0 && s.max <= 1, 'crater values in [0,1]');
}

function testStampFeaturesCount() {
  console.log('\n── stampFeatures count ──');
  const hm = gen.generateHeightmap({ seed: 'feat-test', width: 100, height: 100, terrainType: 'mountains', resolution: 64 });
  const features = gen.stampFeatures(hm, 'mountains', 'feat-test');
  assert(features.length >= 2, `at least 2 features (got ${features.length})`);
  assert(features.length <= 5, `at most 5 features (got ${features.length})`);
}

function testStampFeaturesProperties() {
  console.log('\n── stampFeatures properties ──');
  const hm = flatMap(64, 0.5);
  const features = gen.stampFeatures(hm, 'desert', 'desert-feat');
  for (const f of features) {
    assert(typeof f.id === 'string' && f.id.length > 0, `feature ${f.id} has id`);
    assert(typeof f.name === 'string' && f.name.length > 0, `feature ${f.id} has name`);
    assert(['peak', 'valley', 'canyon', 'cliff', 'mesa', 'crater'].includes(f.type), `feature ${f.id} has valid type (${f.type})`);
    assert(f.position.x >= 0 && f.position.x < 64, `feature ${f.id} x in bounds`);
    assert(f.position.z >= 0 && f.position.z < 64, `feature ${f.id} z in bounds`);
    assert(f.radius > 0, `feature ${f.id} has positive radius`);
    assert(typeof f.elevation === 'number', `feature ${f.id} has elevation`);
  }
}

function testStampFeaturesTerrainAppropriate() {
  console.log('\n── stampFeatures terrain-appropriate types ──');
  const desertTypes: FeatureType[] = ['mesa', 'canyon', 'crater'];
  const hmD = flatMap(64, 0.5);
  const featuresD = gen.stampFeatures(hmD, 'desert', 'desert-types');
  for (const f of featuresD) {
    assert(desertTypes.includes(f.type), `desert feature type ${f.type} is appropriate`);
  }

  const hillTypes: FeatureType[] = ['peak', 'valley', 'cliff'];
  const hmH = flatMap(64, 0.5);
  const featuresH = gen.stampFeatures(hmH, 'hills', 'hill-types');
  for (const f of featuresH) {
    assert(hillTypes.includes(f.type), `hills feature type ${f.type} is appropriate`);
  }
}

function testStampFeaturesDeterminism() {
  console.log('\n── stampFeatures determinism ──');
  const hm1 = flatMap(64, 0.5);
  const f1 = gen.stampFeatures(hm1, 'mountains', 'det-feat');
  const hm2 = flatMap(64, 0.5);
  const f2 = gen.stampFeatures(hm2, 'mountains', 'det-feat');
  assert(f1.length === f2.length, 'same seed same count');
  for (let i = 0; i < f1.length; i++) {
    assert(f1[i].id === f2[i].id, `feature ${i} same id`);
    assert(f1[i].type === f2[i].type, `feature ${i} same type`);
    assert(f1[i].position.x === f2[i].position.x, `feature ${i} same x`);
    assert(f1[i].position.z === f2[i].position.z, `feature ${i} same z`);
  }
}

function testStampFeaturesModifiesHeightmap() {
  console.log('\n── stampFeatures modifies heightmap ──');
  const hm = flatMap(64, 0.5);
  const before = hm.map(r => [...r]);
  gen.stampFeatures(hm, 'mountains', 'modify-test');
  let changed = false;
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      if (hm[r][c] !== before[r][c]) { changed = true; break; }
    }
    if (changed) break;
  }
  assert(changed, 'heightmap was modified by stampFeatures');
}

function testStampFeaturesStaysInRange() {
  console.log('\n── stampFeatures keeps values in [0,1] ──');
  const terrainTypes: TerrainType[] = ['plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert'];
  for (const tt of terrainTypes) {
    const hm = gen.generateHeightmap({ seed: 'range-' + tt, width: 100, height: 100, terrainType: tt, resolution: 64 });
    gen.stampFeatures(hm, tt, 'range-' + tt);
    const s = stats(hm);
    assert(s.min >= 0, `${tt} + features: min >= 0 (got ${s.min.toFixed(4)})`);
    assert(s.max <= 1, `${tt} + features: max <= 1 (got ${s.max.toFixed(4)})`);
  }
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
testStampPeak();
testStampValley();
testStampCanyon();
testStampCliff();
testStampMesa();
testStampCrater();
testStampFeaturesCount();
testStampFeaturesProperties();
testStampFeaturesTerrainAppropriate();
testStampFeaturesDeterminism();
testStampFeaturesModifiesHeightmap();
testStampFeaturesStaysInRange();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
