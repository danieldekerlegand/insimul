/**
 * Tests for building scale by zone (US-037)
 *
 * Verifies that ProceduralBuildingGenerator.createSpecFromData applies
 * zone-based scale multipliers to building dimensions.
 *
 * Run with: npx tsx client/src/components/3DGame/BuildingScaleByZone.test.ts
 */

import { Vector3, Color3 } from '@babylonjs/core';
import { ProceduralBuildingGenerator, type BuildingStyle } from '/game-engine/rendering/ProceduralBuildingGenerator';

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

// ── Helpers ─────────────────────────────────────────────────────────────────

const MOCK_STYLE: BuildingStyle = {
  name: 'Test Style',
  baseColor: new Color3(0.5, 0.5, 0.5),
  roofColor: new Color3(0.3, 0.3, 0.3),
  windowColor: new Color3(0.8, 0.8, 0.8),
  doorColor: new Color3(0.4, 0.4, 0.4),
  materialType: 'wood',
  architectureStyle: 'medieval',
};

function makeSpec(zone?: 'commercial' | 'residential', businessType: string = 'Shop') {
  return ProceduralBuildingGenerator.createSpecFromData({
    id: `test_${zone}_${businessType}`,
    type: 'business',
    businessType,
    position: new Vector3(0, 0, 0),
    worldStyle: MOCK_STYLE,
    zone,
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== Building Scale by Zone Tests ===\n');

// ── Zone scale multipliers exist ────────────────────────────────────────────

console.log('Zone scale multiplier configuration:');
{
  const zoneScale = ProceduralBuildingGenerator.ZONE_SCALE;
  assert(zoneScale.commercial !== undefined, 'commercial zone scale defined');
  assert(zoneScale.residential !== undefined, 'residential zone scale defined');

  assertGreaterThan(zoneScale.commercial.floors, zoneScale.residential.floors, 'commercial floors multiplier > residential');
  assertGreaterThan(zoneScale.commercial.width, zoneScale.residential.width, 'commercial width multiplier > residential');
  assertGreaterThan(zoneScale.commercial.depth, zoneScale.residential.depth, 'commercial depth multiplier > residential');

  assertEqual(zoneScale.residential.floors, 1.0, 'residential floors multiplier is 1.0 (baseline)');
  assertEqual(zoneScale.residential.width, 1.0, 'residential width multiplier is 1.0 (baseline)');
  assertEqual(zoneScale.residential.depth, 1.0, 'residential depth multiplier is 1.0 (baseline)');
}

// ── Commercial buildings are larger ─────────────────────────────────────────

console.log('\nCommercial buildings are larger than residential:');
{
  const commercial = makeSpec('commercial', 'Shop');
  const residential = makeSpec('residential', 'Shop');

  assertGreaterThan(commercial.floors, residential.floors - 1, 'commercial Shop has more or equal floors');
  assertGreaterThan(commercial.width, residential.width - 1, 'commercial Shop is wider or equal');
  assertGreaterThan(commercial.depth, residential.depth - 1, 'commercial Shop is deeper or equal');

  // For a 2-floor Shop, commercial should round to 3 (2 * 1.3 = 2.6 → 3)
  assertEqual(commercial.floors, 3, 'Shop in commercial zone: 2 base floors * 1.3 = 3 floors');
  assertEqual(residential.floors, 2, 'Shop in residential zone: 2 base floors * 1.0 = 2 floors');
}

// ── No zone defaults to residential ─────────────────────────────────────────

console.log('\nNo zone defaults to residential scale:');
{
  const noZone = makeSpec(undefined, 'Shop');
  const residential = makeSpec('residential', 'Shop');

  assertEqual(noZone.floors, residential.floors, 'no zone has same floors as residential');
  assertEqual(noZone.width, residential.width, 'no zone has same width as residential');
  assertEqual(noZone.depth, residential.depth, 'no zone has same depth as residential');
}

// ── Various building types scale correctly ──────────────────────────────────

console.log('\nZone scaling applies to various building types:');
{
  const types = ['Tavern', 'Inn', 'Bakery', 'Market', 'Bank'];
  for (const bt of types) {
    const commercial = makeSpec('commercial', bt);
    const residential = makeSpec('residential', bt);

    // Commercial should be >= residential in all dimensions
    assert(commercial.floors >= residential.floors, `${bt}: commercial floors >= residential`);
    assert(commercial.width >= residential.width, `${bt}: commercial width >= residential`);
    assert(commercial.depth >= residential.depth, `${bt}: commercial depth >= residential`);
  }
}

// ── Residence types also scale by zone ──────────────────────────────────────

console.log('\nResidence types scale by zone:');
{
  const residenceSpec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_res_commercial',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: MOCK_STYLE,
    zone: 'commercial',
  });
  const residenceResidential = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_res_residential',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: MOCK_STYLE,
    zone: 'residential',
  });

  // residence_small has 1 floor base; commercial: round(1*1.3)=1, residential: 1
  // Width: 8 base; commercial: round(8*1.15)=9, residential: 8
  assert(residenceSpec.width >= residenceResidential.width, 'residence in commercial zone is wider');
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
