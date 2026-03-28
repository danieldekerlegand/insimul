/**
 * Tests for asset scaling management
 *
 * Verifies that model scaling data is correctly structured, retrieved,
 * and applied via the World3DConfig pipeline.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/AssetScalingManagement.test.ts
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

function assertClose(actual: number, expected: number, message: string, epsilon = 0.001) {
  assert(Math.abs(actual - expected) < epsilon, `${message} (expected ${expected}, got ${actual})`);
}

// ── Types matching the schema ──────────────────────────────────────────────

type ScaleEntry = { x: number; y: number; z: number };
type ModelScaling = Record<string, ScaleEntry>;

// ── Helper: build scaling key (mirrors admin panel logic) ──────────────────

function buildScalingKey(field: string, role: string): string {
  return `${field}.${role}`;
}

// ── Helper: apply scaling to a mock mesh (mirrors BabylonGame logic) ───────

function applyModelScaling(
  meshScaling: { x: number; y: number; z: number },
  scalingMap: ModelScaling,
  group: string,
  role: string
): { x: number; y: number; z: number } {
  const key = `${group}.${role}`;
  const s = scalingMap[key];
  if (s) {
    return {
      x: meshScaling.x * s.x,
      y: meshScaling.y * s.y,
      z: meshScaling.z * s.z,
    };
  }
  return meshScaling;
}

// ── Tests ──────────────────────────────────────────────────────────────────

console.log('\n=== Asset Scaling Management Tests ===\n');

console.log('--- Scaling Key Format ---');
{
  assert(
    buildScalingKey('buildingModels', 'tavern') === 'buildingModels.tavern',
    'building model key uses dot notation'
  );
  assert(
    buildScalingKey('natureModels', 'defaultTree') === 'natureModels.defaultTree',
    'nature model key uses dot notation'
  );
  assert(
    buildScalingKey('playerModels', 'default') === 'playerModels.default',
    'player model key uses dot notation'
  );
  assert(
    buildScalingKey('characterModels', 'guard') === 'characterModels.guard',
    'character model key uses dot notation'
  );
  assert(
    buildScalingKey('objectModels', 'chest') === 'objectModels.chest',
    'object model key uses dot notation'
  );
  assert(
    buildScalingKey('questObjectModels', 'collectible') === 'questObjectModels.collectible',
    'quest object model key uses dot notation'
  );
}

console.log('\n--- Scale Application ---');
{
  const scalingMap: ModelScaling = {
    'buildingModels.tavern': { x: 2, y: 1.5, z: 2 },
    'natureModels.defaultTree': { x: 0.5, y: 0.5, z: 0.5 },
  };

  // Apply scaling to a building with custom scale
  const result1 = applyModelScaling({ x: 1, y: 1, z: 1 }, scalingMap, 'buildingModels', 'tavern');
  assertClose(result1.x, 2, 'tavern x scaled to 2');
  assertClose(result1.y, 1.5, 'tavern y scaled to 1.5');
  assertClose(result1.z, 2, 'tavern z scaled to 2');

  // Apply scaling to nature model
  const result2 = applyModelScaling({ x: 1, y: 1, z: 1 }, scalingMap, 'natureModels', 'defaultTree');
  assertClose(result2.x, 0.5, 'tree x scaled to 0.5');
  assertClose(result2.y, 0.5, 'tree y scaled to 0.5');
  assertClose(result2.z, 0.5, 'tree z scaled to 0.5');

  // No scaling entry → returns original
  const result3 = applyModelScaling({ x: 1, y: 1, z: 1 }, scalingMap, 'buildingModels', 'church');
  assertClose(result3.x, 1, 'church x unchanged (no scaling entry)');
  assertClose(result3.y, 1, 'church y unchanged (no scaling entry)');
  assertClose(result3.z, 1, 'church z unchanged (no scaling entry)');
}

console.log('\n--- Cumulative Scaling ---');
{
  // Mesh already has non-identity scaling
  const scalingMap: ModelScaling = {
    'buildingModels.shop': { x: 1.5, y: 2, z: 1.5 },
  };
  const result = applyModelScaling({ x: 0.5, y: 0.5, z: 0.5 }, scalingMap, 'buildingModels', 'shop');
  assertClose(result.x, 0.75, 'cumulative x = 0.5 * 1.5');
  assertClose(result.y, 1, 'cumulative y = 0.5 * 2');
  assertClose(result.z, 0.75, 'cumulative z = 0.5 * 1.5');
}

console.log('\n--- Empty Scaling Map ---');
{
  const result = applyModelScaling({ x: 1, y: 1, z: 1 }, {}, 'buildingModels', 'tavern');
  assertClose(result.x, 1, 'empty map returns identity x');
  assertClose(result.y, 1, 'empty map returns identity y');
  assertClose(result.z, 1, 'empty map returns identity z');
}

console.log('\n--- Uniform vs Per-Axis Scaling ---');
{
  // Uniform scaling (all axes same)
  const uniformMap: ModelScaling = {
    'natureModels.rock': { x: 3, y: 3, z: 3 },
  };
  const result1 = applyModelScaling({ x: 1, y: 1, z: 1 }, uniformMap, 'natureModels', 'rock');
  assert(result1.x === result1.y && result1.y === result1.z, 'uniform scaling: all axes equal');
  assertClose(result1.x, 3, 'uniform scaling value is 3');

  // Per-axis scaling (different axes)
  const perAxisMap: ModelScaling = {
    'characterModels.merchant': { x: 1, y: 1.5, z: 1 },
  };
  const result2 = applyModelScaling({ x: 1, y: 1, z: 1 }, perAxisMap, 'characterModels', 'merchant');
  assertClose(result2.x, 1, 'per-axis x unchanged');
  assertClose(result2.y, 1.5, 'per-axis y stretched');
  assertClose(result2.z, 1, 'per-axis z unchanged');
}

console.log('\n--- World3DConfig Integration ---');
{
  // Simulate a World3DConfig with modelScaling
  const config = {
    buildingModels: { tavern: 'asset-123', church: 'asset-456' },
    natureModels: { defaultTree: 'asset-789' },
    modelScaling: {
      'buildingModels.tavern': { x: 2, y: 2, z: 2 },
      'natureModels.defaultTree': { x: 0.8, y: 1.2, z: 0.8 },
    } as ModelScaling,
  };

  // Verify scaling entries exist for configured models
  assert('buildingModels.tavern' in config.modelScaling, 'tavern has scaling entry');
  assert('natureModels.defaultTree' in config.modelScaling, 'tree has scaling entry');
  assert(!('buildingModels.church' in config.modelScaling), 'church has no scaling entry (uses default)');

  // Verify that modelScaling keys correspond to valid model entries
  for (const key of Object.keys(config.modelScaling)) {
    const [group, role] = key.split('.');
    const models = (config as any)[group] as Record<string, string> | undefined;
    assert(models !== undefined, `group "${group}" exists in config`);
    if (models) {
      assert(role in models, `role "${role}" exists in ${group}`);
    }
  }
}

console.log('\n--- Scale Value Validation ---');
{
  // Ensure scale values are within reasonable ranges
  const testScaling = (s: ScaleEntry, label: string) => {
    assert(s.x > 0, `${label}: x > 0`);
    assert(s.y > 0, `${label}: y > 0`);
    assert(s.z > 0, `${label}: z > 0`);
    assert(s.x <= 50, `${label}: x <= 50`);
    assert(s.y <= 50, `${label}: y <= 50`);
    assert(s.z <= 50, `${label}: z <= 50`);
  };

  testScaling({ x: 1, y: 1, z: 1 }, 'identity');
  testScaling({ x: 0.1, y: 0.1, z: 0.1 }, 'minimum');
  testScaling({ x: 5, y: 5, z: 5 }, 'large');
  testScaling({ x: 0.5, y: 2, z: 0.5 }, 'mixed');
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
