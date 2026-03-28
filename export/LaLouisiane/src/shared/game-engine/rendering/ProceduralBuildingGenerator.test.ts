/**
 * Tests for ProceduralBuildingGenerator.createSpecFromData rotation handling
 *
 * Run with: npx tsx client/src/components/3DGame/ProceduralBuildingGenerator.test.ts
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

console.log('\n--- Preset texture ID propagation ---');
{
  const preset = {
    id: 'tex_preset_1',
    name: 'Textured Stone',
    baseColors: [{ r: 0.6, g: 0.6, b: 0.6 }],
    roofColor: { r: 0.3, g: 0.2, b: 0.15 },
    windowColor: { r: 0.8, g: 0.8, b: 1.0 },
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'stone' as const,
    architectureStyle: 'medieval' as const,
    wallTextureId: 'asset_wall_123',
    roofTextureId: 'asset_roof_456',
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_tex_building',
    type: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultCommercialStyleId: 'tex_preset_1',
    },
  });

  assertEqual(spec.style.wallTextureId, 'asset_wall_123', 'wallTextureId propagated from preset to style');
  assertEqual(spec.style.roofTextureId, 'asset_roof_456', 'roofTextureId propagated from preset to style');
}

console.log('\nPreset without texture IDs leaves them undefined:');
{
  const preset = {
    id: 'no_tex_preset',
    name: 'Plain Wood',
    baseColors: [{ r: 0.6, g: 0.4, b: 0.2 }],
    roofColor: { r: 0.3, g: 0.2, b: 0.1 },
    windowColor: { r: 0.7, g: 0.7, b: 0.7 },
    doorColor: { r: 0.5, g: 0.3, b: 0.2 },
    materialType: 'wood' as const,
    architectureStyle: 'rustic' as const,
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_no_tex',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultResidentialStyleId: 'no_tex_preset',
    },
  });

  assert(spec.style.wallTextureId === undefined, 'wallTextureId is undefined when not set on preset');
  assert(spec.style.roofTextureId === undefined, 'roofTextureId is undefined when not set on preset');
}

console.log('\nType-specific override preset carries texture IDs:');
{
  const presetA = {
    id: 'preset_a',
    name: 'Style A',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'brick' as const,
    architectureStyle: 'colonial' as const,
    wallTextureId: 'wall_brick_tex',
  };
  const presetB = {
    id: 'preset_b',
    name: 'Style B',
    baseColors: [{ r: 0.7, g: 0.7, b: 0.7 }],
    roofColor: { r: 0.2, g: 0.2, b: 0.2 },
    windowColor: { r: 0.9, g: 0.9, b: 0.9 },
    doorColor: { r: 0.3, g: 0.3, b: 0.3 },
    materialType: 'stone' as const,
    architectureStyle: 'medieval' as const,
    roofTextureId: 'roof_slate_tex',
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_override_tex',
    type: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [presetA, presetB],
      defaultCommercialStyleId: 'preset_a',
      buildingTypeOverrides: {
        'Bakery': { stylePresetId: 'preset_b' },
      },
    },
  });

  // Should use preset_b (type override), not preset_a (default)
  assertEqual(spec.style.name, 'preset_b', 'type override preset selected');
  assert(spec.style.wallTextureId === undefined, 'preset_b has no wallTextureId');
  assertEqual(spec.style.roofTextureId, 'roof_slate_tex', 'roofTextureId from type-override preset');
}

console.log('\n--- Balcony, ironwork, porch, shutter texture ID propagation ---');
{
  const preset = {
    id: 'creole_preset',
    name: 'Creole Style',
    baseColors: [{ r: 0.8, g: 0.7, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.2, b: 0.15 },
    windowColor: { r: 0.8, g: 0.8, b: 1.0 },
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'stucco' as const,
    architectureStyle: 'creole' as const,
    hasIronworkBalcony: true,
    hasShutters: true,
    hasPorch: true,
    balconyTextureId: 'asset_balcony_tex',
    ironworkTextureId: 'asset_ironwork_tex',
    porchTextureId: 'asset_porch_tex',
    shutterTextureId: 'asset_shutter_tex',
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_feature_tex',
    type: 'residence',
    businessType: 'residence_medium',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultResidentialStyleId: 'creole_preset',
    },
  });

  assertEqual(spec.style.balconyTextureId, 'asset_balcony_tex', 'balconyTextureId propagated from preset');
  assertEqual(spec.style.ironworkTextureId, 'asset_ironwork_tex', 'ironworkTextureId propagated from preset');
  assertEqual(spec.style.porchTextureId, 'asset_porch_tex', 'porchTextureId propagated from preset');
  assertEqual(spec.style.shutterTextureId, 'asset_shutter_tex', 'shutterTextureId propagated from preset');
}

console.log('\nFeature texture IDs undefined when not set on preset:');
{
  const preset = {
    id: 'plain_preset',
    name: 'Plain Style',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'wood' as const,
    architectureStyle: 'rustic' as const,
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_no_feature_tex',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultResidentialStyleId: 'plain_preset',
    },
  });

  assert(spec.style.balconyTextureId === undefined, 'balconyTextureId undefined when not set');
  assert(spec.style.ironworkTextureId === undefined, 'ironworkTextureId undefined when not set');
  assert(spec.style.porchTextureId === undefined, 'porchTextureId undefined when not set');
  assert(spec.style.shutterTextureId === undefined, 'shutterTextureId undefined when not set');
}

console.log('\nPartial feature texture IDs (only some set):');
{
  const preset = {
    id: 'partial_preset',
    name: 'Partial Style',
    baseColors: [{ r: 0.6, g: 0.6, b: 0.6 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'brick' as const,
    architectureStyle: 'colonial' as const,
    shutterTextureId: 'only_shutter_tex',
    porchTextureId: 'only_porch_tex',
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_partial_tex',
    type: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultCommercialStyleId: 'partial_preset',
    },
  });

  assert(spec.style.balconyTextureId === undefined, 'balconyTextureId undefined when not set (partial)');
  assert(spec.style.ironworkTextureId === undefined, 'ironworkTextureId undefined when not set (partial)');
  assertEqual(spec.style.porchTextureId, 'only_porch_tex', 'porchTextureId set when provided (partial)');
  assertEqual(spec.style.shutterTextureId, 'only_shutter_tex', 'shutterTextureId set when provided (partial)');
}

console.log('\n--- Material cache key uniqueness for texture IDs ---');
{
  // Verify that different texture IDs produce different cache keys
  // (This tests the key format logic indirectly via spec creation)
  const presetWithWall = {
    id: 'wall_tex_preset',
    name: 'With Wall Tex',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'brick' as const,
    architectureStyle: 'colonial' as const,
    wallTextureId: 'tex_alpha',
  };

  const presetWithDiffWall = {
    id: 'diff_wall_preset',
    name: 'Diff Wall Tex',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'brick' as const,
    architectureStyle: 'colonial' as const,
    wallTextureId: 'tex_beta',
  };

  const specA = ProceduralBuildingGenerator.createSpecFromData({
    id: 'cache_test_a',
    type: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [presetWithWall],
      defaultCommercialStyleId: 'wall_tex_preset',
    },
  });

  const specB = ProceduralBuildingGenerator.createSpecFromData({
    id: 'cache_test_b',
    type: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [presetWithDiffWall],
      defaultCommercialStyleId: 'diff_wall_preset',
    },
  });

  assert(
    specA.style.wallTextureId !== specB.style.wallTextureId,
    'different presets produce different wallTextureIds for cache key differentiation'
  );
  assertEqual(specA.style.wallTextureId, 'tex_alpha', 'specA has tex_alpha');
  assertEqual(specB.style.wallTextureId, 'tex_beta', 'specB has tex_beta');
}

console.log('\n--- Texture ID with wallTextureId set but no roofTextureId ---');
{
  const preset = {
    id: 'wall_only_preset',
    name: 'Wall Only',
    baseColors: [{ r: 0.6, g: 0.5, b: 0.4 }],
    roofColor: { r: 0.2, g: 0.2, b: 0.2 },
    windowColor: { r: 0.7, g: 0.7, b: 0.7 },
    doorColor: { r: 0.3, g: 0.3, b: 0.3 },
    materialType: 'stone' as const,
    architectureStyle: 'medieval' as const,
    wallTextureId: 'my_wall_tex',
  };

  const spec = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_wall_only',
    type: 'residence',
    businessType: 'residence_medium',
    position: new Vector3(5, 0, 10),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [preset],
      defaultResidentialStyleId: 'wall_only_preset',
    },
  });

  assertEqual(spec.style.wallTextureId, 'my_wall_tex', 'wallTextureId propagated when only wall texture set');
  assert(spec.style.roofTextureId === undefined, 'roofTextureId remains undefined when not set');
}

console.log('\n--- Multiple presets with different texture combinations ---');
{
  const presetFull = {
    id: 'full_tex',
    name: 'Full Textures',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'brick' as const,
    architectureStyle: 'colonial' as const,
    wallTextureId: 'wall_full',
    roofTextureId: 'roof_full',
  };

  const presetNone = {
    id: 'no_tex',
    name: 'No Textures',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.3, g: 0.3, b: 0.3 },
    windowColor: { r: 0.8, g: 0.8, b: 0.8 },
    doorColor: { r: 0.4, g: 0.4, b: 0.4 },
    materialType: 'wood' as const,
    architectureStyle: 'rustic' as const,
  };

  const specFull = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_full_tex',
    type: 'business',
    businessType: 'Tavern',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [presetFull, presetNone],
      buildingTypeOverrides: { 'Tavern': { stylePresetId: 'full_tex' } },
    },
  });

  const specNone = ProceduralBuildingGenerator.createSpecFromData({
    id: 'test_no_tex',
    type: 'residence',
    businessType: 'residence_small',
    position: new Vector3(0, 0, 0),
    worldStyle: testStyle,
    proceduralConfig: {
      stylePresets: [presetFull, presetNone],
      defaultResidentialStyleId: 'no_tex',
    },
  });

  assertEqual(specFull.style.wallTextureId, 'wall_full', 'full-texture preset has wallTextureId');
  assertEqual(specFull.style.roofTextureId, 'roof_full', 'full-texture preset has roofTextureId');
  assert(specNone.style.wallTextureId === undefined, 'no-texture preset has no wallTextureId');
  assert(specNone.style.roofTextureId === undefined, 'no-texture preset has no roofTextureId');

  // Verify style names differ (used in cache key)
  assert(specFull.style.name !== specNone.style.name, 'different presets produce different style names');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
