/**
 * Tests for ProceduralBuildingGenerator.createSpecFromData rotation handling
 *
 * Run with: npx tsx client/src/components/3DGame/ProceduralBuildingGenerator.test.ts
 */

import { Vector3, Color3 } from '@babylonjs/core';
import { ProceduralBuildingGenerator, type BuildingStyle } from './ProceduralBuildingGenerator';

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

const testStyle: BuildingStyle = {
  name: 'Test',
  baseColor: new Color3(0.5, 0.5, 0.5),
  roofColor: new Color3(0.3, 0.3, 0.3),
  windowColor: new Color3(0.8, 0.8, 0.8),
  doorColor: new Color3(0.4, 0.4, 0.4),
  materialType: 'wood',
  architectureStyle: 'medieval',
};

console.log('\n=== ProceduralBuildingGenerator.createSpecFromData Tests ===\n');

console.log('Street-facing rotation parameter:');
{
  // When rotation is provided, it should be used exactly
  const facingAngle = Math.PI / 4; // 45 degrees
  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_building_1',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(10, 0, 20),
    worldStyle: testStyle,
    rotation: facingAngle,
  });

  assertEqual(spec.rotation, facingAngle, 'rotation uses provided facingAngle');

  // Test with different angles
  const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI * 1.5];
  for (const angle of angles) {
    const s = ProceduralBuildingGenerator.createSpecFromData({
      id: `test_angle_${angle}`,
      type: 'business',
      businessType: 'Tavern',
      position: new Vector3(0, 0, 0),
      worldStyle: testStyle,
      rotation: angle,
    });
    assertEqual(s.rotation, angle, `rotation ${angle.toFixed(2)} rad passed through correctly`);
  }
}

console.log('\nFallback to random rotation when not provided:');
{
  // When rotation is NOT provided, it should fall back to a random value
  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_no_rotation',
    type: 'residence',
    businessType: 'residence_medium',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
  });

  assert(
    typeof spec.rotation === 'number' && !isNaN(spec.rotation),
    `rotation is a valid number when not provided (got ${spec.rotation})`,
  );
  assert(
    spec.rotation >= 0 && spec.rotation < Math.PI * 2,
    `fallback rotation is in [0, 2π) range (got ${spec.rotation})`,
  );
}

console.log('\nRotation zero is valid (not treated as falsy):');
{
  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_zero_rotation',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    rotation: 0,
  });

  assertEqual(spec.rotation, 0, 'rotation of 0 is preserved (not replaced by random)');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
