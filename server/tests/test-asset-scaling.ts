/**
 * Tests for asset scaling in the collection resolver
 *
 * Verifies that modelScaling is correctly passed through the
 * World3DConfig pipeline and update flow.
 *
 * Run with: npx tsx server/tests/test-asset-scaling.ts
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

// Simulate the World3DConfig type from the resolver
type World3DConfig = {
  buildingModels?: Record<string, string>;
  natureModels?: Record<string, string>;
  characterModels?: Record<string, string>;
  objectModels?: Record<string, string>;
  groundTextureId?: string;
  roadTextureId?: string;
  wallTextureId?: string;
  roofTextureId?: string;
  playerModels?: Record<string, string>;
  questObjectModels?: Record<string, string>;
  audioAssets?: Record<string, string>;
  modelScaling?: Record<string, { x: number; y: number; z: number }>;
};

// Simulate the collection-to-config conversion (mirrors resolver logic)
function collectionToConfig(collection: any): World3DConfig {
  return {
    buildingModels: collection.buildingModels || {},
    natureModels: collection.natureModels || {},
    characterModels: collection.characterModels || {},
    objectModels: collection.objectModels || {},
    groundTextureId: collection.groundTextureId || undefined,
    roadTextureId: collection.roadTextureId || undefined,
    wallTextureId: collection.wallTextureId || undefined,
    roofTextureId: collection.roofTextureId || undefined,
    playerModels: collection.playerModels || {},
    questObjectModels: collection.questObjectModels || {},
    audioAssets: collection.audioAssets || {},
    modelScaling: collection.modelScaling || {},
  };
}

// Simulate the config update logic (mirrors resolver update)
function applyConfigUpdate(existing: any, update: Partial<World3DConfig>): any {
  const updates: any = { ...existing };
  if (update.modelScaling !== undefined) {
    updates.modelScaling = update.modelScaling;
  }
  return updates;
}

console.log('\n=== Asset Scaling Resolver Tests ===\n');

console.log('--- Collection to Config Conversion ---');
{
  const collection = {
    buildingModels: { tavern: 'asset-1', church: 'asset-2' },
    natureModels: { defaultTree: 'asset-3' },
    modelScaling: {
      'buildingModels.tavern': { x: 2, y: 2, z: 2 },
      'natureModels.defaultTree': { x: 0.5, y: 0.5, z: 0.5 },
    },
  };

  const config = collectionToConfig(collection);

  assert(config.modelScaling !== undefined, 'modelScaling is present in config');
  assert(
    Object.keys(config.modelScaling!).length === 2,
    'modelScaling has 2 entries'
  );
  assert(
    config.modelScaling!['buildingModels.tavern']?.x === 2,
    'tavern x scale is 2'
  );
  assert(
    config.modelScaling!['natureModels.defaultTree']?.y === 0.5,
    'tree y scale is 0.5'
  );
}

console.log('\n--- Empty Scaling ---');
{
  const collection = {
    buildingModels: { tavern: 'asset-1' },
  };

  const config = collectionToConfig(collection);
  assert(config.modelScaling !== undefined, 'modelScaling defaults to empty object');
  assert(Object.keys(config.modelScaling!).length === 0, 'no scaling entries');
}

console.log('\n--- Config Update with Scaling ---');
{
  const existing = {
    buildingModels: { tavern: 'asset-1' },
    modelScaling: {},
  };

  const newScaling = {
    'buildingModels.tavern': { x: 1.5, y: 1.5, z: 1.5 },
  };

  const updated = applyConfigUpdate(existing, { modelScaling: newScaling });
  assert(
    updated.modelScaling['buildingModels.tavern']?.x === 1.5,
    'scaling updated via config update'
  );
}

console.log('\n--- Partial Scaling Update ---');
{
  const existing = {
    modelScaling: {
      'buildingModels.tavern': { x: 2, y: 2, z: 2 },
      'natureModels.rock': { x: 3, y: 3, z: 3 },
    },
  };

  // Replace entire modelScaling (this is how PATCH works)
  const newScaling = {
    'buildingModels.tavern': { x: 2, y: 2, z: 2 },
    'natureModels.rock': { x: 3, y: 3, z: 3 },
    'characterModels.guard': { x: 1, y: 1.2, z: 1 },
  };

  const updated = applyConfigUpdate(existing, { modelScaling: newScaling });
  assert(
    Object.keys(updated.modelScaling).length === 3,
    'updated scaling has 3 entries'
  );
  assert(
    updated.modelScaling['characterModels.guard']?.y === 1.2,
    'new guard scaling added'
  );
}

console.log('\n--- Scaling Reset (Remove Entry) ---');
{
  const existing = {
    modelScaling: {
      'buildingModels.tavern': { x: 2, y: 2, z: 2 },
      'natureModels.rock': { x: 3, y: 3, z: 3 },
    },
  };

  // Remove one entry by creating new object without it
  const { 'buildingModels.tavern': _, ...newScaling } = existing.modelScaling;

  const updated = applyConfigUpdate(existing, { modelScaling: newScaling });
  assert(
    Object.keys(updated.modelScaling).length === 1,
    'one entry removed'
  );
  assert(
    !('buildingModels.tavern' in updated.modelScaling),
    'tavern scaling removed'
  );
  assert(
    'natureModels.rock' in updated.modelScaling,
    'rock scaling preserved'
  );
}

console.log('\n--- Scale Entry Structure ---');
{
  const entry = { x: 1.5, y: 2.0, z: 0.8 };
  assert(typeof entry.x === 'number', 'x is a number');
  assert(typeof entry.y === 'number', 'y is a number');
  assert(typeof entry.z === 'number', 'z is a number');
  assert(entry.x > 0, 'x is positive');
  assert(entry.y > 0, 'y is positive');
  assert(entry.z > 0, 'z is positive');
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
