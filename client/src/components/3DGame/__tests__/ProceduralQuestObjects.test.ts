/**
 * Tests for ProceduralQuestObjects
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/ProceduralQuestObjects.test.ts
 */

import { Scene, Color3, Mesh } from '@babylonjs/core';
import { ProceduralQuestObjects } from '../ProceduralQuestObjects';

// ── Test harness ──

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

// ── Tests ──

function testGetObjectTypes() {
  console.log('\n[getObjectTypes]');
  const types = ProceduralQuestObjects.getObjectTypes();
  assert(types.length >= 30, `has at least 30 object types (got ${types.length})`);
  assert(types.includes('apple'), 'includes apple');
  assert(types.includes('key'), 'includes key');
  assert(types.includes('book'), 'includes book');
  assert(types.includes('gem'), 'includes gem');
  assert(types.includes('chair'), 'includes chair');
  assert(types.includes('crystal'), 'includes crystal');
  assert(types.includes('barrel'), 'includes barrel');
  assert(types.includes('sword'), 'includes sword');
  assert(types.includes('flower'), 'includes flower');
  assert(types.includes('mushroom'), 'includes mushroom');
  assert(!types.includes('_default'), 'does not expose _default');
}

function testGetColor() {
  console.log('\n[getColor]');
  const red = ProceduralQuestObjects.getColor('red');
  assert(red !== undefined, 'red color exists');
  assert(red!.r > 0.8, 'red has high red channel');

  const blue = ProceduralQuestObjects.getColor('Blue');
  assert(blue !== undefined, 'case-insensitive lookup');

  const gold = ProceduralQuestObjects.getColor('gold');
  assert(gold !== undefined, 'gold color exists');

  const missing = ProceduralQuestObjects.getColor('nonexistent');
  assert(missing === undefined, 'missing color returns undefined');
}

function testGenerateKnownType() {
  console.log('\n[generate - known type]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const result = gen.generate('test_apple', { objectType: 'apple' });
  assert(result.mesh != null, 'returns a mesh for apple');
  assert(result.mesh.name.includes('quest_proc'), 'mesh name includes quest_proc prefix');
  assert(typeof result.removeGlow === 'function', 'returns removeGlow callback');

  gen.dispose();
}

function testGenerateUnknownTypeFallback() {
  console.log('\n[generate - unknown type falls back to default]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const result = gen.generate('test_unknown', { objectType: 'xyznotreal' });
  assert(result.mesh != null, 'returns a mesh for unknown type');
  assert(result.mesh.name.includes('quest_proc'), 'uses procedural prefix');

  gen.dispose();
}

function testGenerateCompositeType() {
  console.log('\n[generate - composite type (key)]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const result = gen.generate('test_key', { objectType: 'key' });
  assert(result.mesh != null, 'returns a mesh for key (composite)');
  const children = result.mesh.getChildMeshes();
  assert(children.length >= 2, `composite has child parts (got ${children.length})`);

  gen.dispose();
}

function testGenerateAllTypes() {
  console.log('\n[generate - all registered types]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);
  const types = ProceduralQuestObjects.getObjectTypes();

  let allGenerated = true;
  for (const type of types) {
    try {
      const result = gen.generate(`all_${type}`, { objectType: type });
      if (!result.mesh) {
        console.error(`  ✗ failed to generate: ${type}`);
        allGenerated = false;
      }
    } catch (e: any) {
      console.error(`  ✗ error generating ${type}: ${e.message}`);
      allGenerated = false;
    }
  }
  assert(allGenerated, `all ${types.length} object types generate successfully`);

  gen.dispose();
}

function testCustomColorOverride() {
  console.log('\n[generate - custom color override]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const customColor = new Color3(0.1, 0.2, 0.3);
  const result = gen.generate('test_colored', { objectType: 'apple', color: customColor as any });
  assert(result.mesh != null, 'returns mesh with custom color');
  assert(result.mesh.material != null, 'mesh has material');
  assert(result.mesh.material.diffuseColor.r === 0.1, 'material uses custom color');

  gen.dispose();
}

function testSizeMultiplier() {
  console.log('\n[generate - size multiplier]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const result = gen.generate('test_big', { objectType: 'ball', size: 2 });
  assert(result.mesh != null, 'returns mesh with size multiplier');

  gen.dispose();
}

function testAssetRegistryOverride() {
  console.log('\n[asset registry - registered asset overrides procedural]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const assetMesh = new Mesh('custom_apple_asset') as any;
  gen.registerAsset('apple', assetMesh);

  assert(gen.hasAsset('apple'), 'hasAsset returns true after registration');
  assert(!gen.hasAsset('book'), 'hasAsset returns false for unregistered type');

  const result = gen.generate('test_asset', { objectType: 'apple' });
  assert(result.mesh != null, 'returns cloned asset mesh');
  assert(result.mesh.name.includes('clone'), 'cloned mesh has clone suffix');

  gen.dispose();
}

function testAssetRegistryCaseInsensitive() {
  console.log('\n[asset registry - case insensitive]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  gen.registerAsset('Apple', new Mesh('a') as any);
  assert(gen.hasAsset('APPLE'), 'case-insensitive hasAsset');

  const result = gen.generate('test_case', { objectType: 'APPLE' });
  assert(result.mesh != null, 'generates with case-insensitive lookup');

  gen.dispose();
}

function testDisposeCleanup() {
  console.log('\n[dispose]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  gen.generate('d1', { objectType: 'apple' });
  gen.generate('d2', { objectType: 'book' });

  gen.dispose();
  assert(true, 'dispose completes without error');

  gen.registerAsset('apple', new Mesh('a') as any);
  gen.dispose();
  assert(!gen.hasAsset('apple'), 'asset registry cleared after dispose');
}

function testMaterialCaching() {
  console.log('\n[material caching]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const r1 = gen.generate('cache1', { objectType: 'ball' });
  const r2 = gen.generate('cache2', { objectType: 'ball' });

  assert(r1.mesh.material === r2.mesh.material, 'same-color objects share material');

  gen.dispose();
}

function testRemoveGlowCallback() {
  console.log('\n[removeGlow callback]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const result = gen.generate('test_glow', { objectType: 'gem' });
  assert(typeof result.removeGlow === 'function', 'removeGlow is a function');

  // Should not throw
  result.removeGlow!();
  assert(true, 'removeGlow executes without error');

  gen.dispose();
}

// ── Run all ──

console.log('=== ProceduralQuestObjects Tests ===');
testGetObjectTypes();
testGetColor();
testGenerateKnownType();
testGenerateUnknownTypeFallback();
testGenerateCompositeType();
testGenerateAllTypes();
testCustomColorOverride();
testSizeMultiplier();
testAssetRegistryOverride();
testAssetRegistryCaseInsensitive();
testDisposeCleanup();
testMaterialCaching();
testRemoveGlowCallback();

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
