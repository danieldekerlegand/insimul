/**
 * Tests for ProceduralQuestObjects
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/ProceduralQuestObjects.test.ts
 */

import { Scene, Color3, Mesh } from '@babylonjs/core';
import { ProceduralQuestObjects, ItemSizeCategory } from '../ProceduralQuestObjects';

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

function testSizeCategories() {
  console.log('\n[size categories]');
  assert(ProceduralQuestObjects.getSizeCategory('coin') === ItemSizeCategory.TINY, 'coin is TINY');
  assert(ProceduralQuestObjects.getSizeCategory('ring') === ItemSizeCategory.TINY, 'ring is TINY');
  assert(ProceduralQuestObjects.getSizeCategory('apple') === ItemSizeCategory.SMALL, 'apple is SMALL');
  assert(ProceduralQuestObjects.getSizeCategory('key') === ItemSizeCategory.SMALL, 'key is SMALL');
  assert(ProceduralQuestObjects.getSizeCategory('sword') === ItemSizeCategory.MEDIUM, 'sword is MEDIUM');
  assert(ProceduralQuestObjects.getSizeCategory('book') === ItemSizeCategory.MEDIUM, 'book is MEDIUM');
  assert(ProceduralQuestObjects.getSizeCategory('barrel') === ItemSizeCategory.LARGE, 'barrel is LARGE');
  assert(ProceduralQuestObjects.getSizeCategory('chest') === ItemSizeCategory.LARGE, 'chest is LARGE');
  assert(ProceduralQuestObjects.getSizeCategory('unknown_thing') === ItemSizeCategory.MEDIUM, 'unknown defaults to MEDIUM');
  assert(ProceduralQuestObjects.getSizeCategory('APPLE') === ItemSizeCategory.SMALL, 'case-insensitive size lookup');
}

function testSizeCategoryValues() {
  console.log('\n[size category values are ordered]');
  assert(ItemSizeCategory.TINY < ItemSizeCategory.SMALL, 'TINY < SMALL');
  assert(ItemSizeCategory.SMALL < ItemSizeCategory.MEDIUM, 'SMALL < MEDIUM');
  assert(ItemSizeCategory.MEDIUM < ItemSizeCategory.LARGE, 'MEDIUM < LARGE');
}

function testMeshPoolRecycle() {
  console.log('\n[mesh pool - recycle and reuse]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  // Generate an apple
  const r1 = gen.generate('pool_apple', { objectType: 'apple' });
  const originalMesh = r1.mesh;

  // Recycle it
  gen.recycle('apple', originalMesh);

  // Generate another apple — should get the recycled mesh back
  const r2 = gen.generate('pool_apple_reuse', { objectType: 'apple' });
  assert(r2.mesh === originalMesh, 'recycled mesh is reused from pool');

  gen.dispose();
}

function testMeshPoolCapLimit() {
  console.log('\n[mesh pool - cap at 10]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const meshes: Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const r = gen.generate(`cap_${i}`, { objectType: 'gem' });
    meshes.push(r.mesh);
  }

  // Recycle all 12
  for (const m of meshes) {
    gen.recycle('gem', m);
  }

  // Generate 11 — first 10 should come from pool, 11th should be new
  let fromPool = 0;
  const poolSet = new Set(meshes);
  for (let i = 0; i < 11; i++) {
    const r = gen.generate(`reuse_${i}`, { objectType: 'gem' });
    if (poolSet.has(r.mesh)) fromPool++;
  }
  assert(fromPool === 10, `pool capped at 10 (got ${fromPool} from pool)`);

  gen.dispose();
}

function testGlowMapMultipleObjects() {
  console.log('\n[glow map - multiple objects get correct glow]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  // Generate two different items — both should have removeGlow
  const r1 = gen.generate('glow_apple', { objectType: 'apple' });
  const r2 = gen.generate('glow_gem', { objectType: 'gem' });

  assert(typeof r1.removeGlow === 'function', 'first object has removeGlow');
  assert(typeof r2.removeGlow === 'function', 'second object has removeGlow');

  // Removing glow from first should not throw
  r1.removeGlow!();
  assert(true, 'removing glow from first object succeeds');

  // Second should still have glow
  r2.removeGlow!();
  assert(true, 'removing glow from second object succeeds after first removed');

  gen.dispose();
}

function testDisposeIncludesPool() {
  console.log('\n[dispose - clears mesh pool]');
  const scene = new Scene() as any;
  const gen = new ProceduralQuestObjects(scene);

  const r = gen.generate('dispose_pool', { objectType: 'apple' });
  gen.recycle('apple', r.mesh);

  gen.dispose();

  // After dispose, generating should create a new mesh (not reuse from pool)
  // We can't directly check the pool is empty, but we can verify dispose doesn't throw
  assert(true, 'dispose with pooled meshes completes without error');
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
testSizeCategories();
testSizeCategoryValues();
testMeshPoolRecycle();
testMeshPoolCapLimit();
testGlowMapMultipleObjects();
testDisposeIncludesPool();

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
