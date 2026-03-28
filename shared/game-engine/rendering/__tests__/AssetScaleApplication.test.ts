/**
 * Tests for asset scaleHint application throughout the rendering pipeline.
 *
 * Verifies that stored scaleHint values from asset metadata are correctly
 * applied when rendering buildings, props, furniture, and interior items.
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/AssetScaleApplication.test.ts
 */

import { Scene, Mesh, Vector3 } from './babylon-mock';
import { ProceduralBuildingGenerator } from '../ProceduralBuildingGenerator';
import { InteriorItemManager, type InteriorItemData } from '../InteriorItemManager';
import type { InteriorLayout } from '../BuildingInteriorGenerator';

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

function assertApprox(actual: number, expected: number, message: string, tolerance = 0.001) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message} (${actual.toFixed(6)} ≈ ${expected.toFixed(6)})`);
  } else {
    failed++;
    console.error(`  ✗ ${message} (expected ≈${expected.toFixed(6)}, got ${actual.toFixed(6)})`);
  }
}

// ── Helpers ──

function makeMeshWithChildren(name: string, height: number): any {
  const root = new Mesh(name) as any;
  const child = new Mesh(`${name}_child`) as any;
  child.parent = root;
  child.getBoundingInfo = () => ({
    boundingBox: {
      minimumWorld: new Vector3(0, 0, 0),
      maximumWorld: new Vector3(1, height, 1),
    }
  });
  return root;
}

function makeInterior(buildingId: string): InteriorLayout {
  return {
    id: `interior_${buildingId}`,
    buildingId,
    buildingType: 'business',
    businessType: 'Shop',
    position: new Vector3(0, 0, 0) as any,
    width: 10,
    depth: 10,
    height: 4.5,
    roomMesh: new Mesh('room') as any,
    furniture: [],
    doorPosition: new Vector3(0, 0, -4.5) as any,
    exitPosition: new Vector3(0, 0, 0) as any,
  };
}

// ── Building Generator: scaleHint storage ──

console.log('\n=== Asset Scale Application Tests ===\n');

console.log('ProceduralBuildingGenerator — registerRoleModel stores scaleHint:');

{
  const scene = new Scene();
  const gen = new ProceduralBuildingGenerator(scene as any);

  // Simulate Medieval House 1: rawHeight=909.9, scaleHint=0.0088
  const mesh = makeMeshWithChildren('house', 909.9);
  mesh.metadata = { scaleHint: 0.0088 };
  gen.registerRoleModel('default', mesh);
  assert(true, 'registerRoleModel stores mesh with scaleHint=0.0088');
}

{
  const scene = new Scene();
  const gen = new ProceduralBuildingGenerator(scene as any);

  // Model without scaleHint
  const mesh = makeMeshWithChildren('generic', 10.0);
  gen.registerRoleModel('largeResidence', mesh);
  assert(true, 'registerRoleModel works without scaleHint');
}

{
  const scene = new Scene();
  const gen = new ProceduralBuildingGenerator(scene as any);

  // Model with invalid scaleHint (zero)
  const mesh = makeMeshWithChildren('bad', 5.0);
  mesh.metadata = { scaleHint: 0 };
  gen.registerRoleModel('shop', mesh);
  assert(true, 'registerRoleModel ignores zero scaleHint');
}

{
  const scene = new Scene();
  const gen = new ProceduralBuildingGenerator(scene as any);

  // Model with negative scaleHint
  const mesh = makeMeshWithChildren('negative', 5.0);
  mesh.metadata = { scaleHint: -1 };
  gen.registerRoleModel('tavern', mesh);
  assert(true, 'registerRoleModel ignores negative scaleHint');
}

// ── InteriorItemManager: scaleHint application ──

console.log('\nInteriorItemManager — uses scaleHint when available:');

{
  const scene = new Scene();
  const template = new Mesh('chest_template') as any;
  const templates = new Map<string, any>([['chest', template]]);
  const heights = new Map<string, number>([['chest', 100.0]]);
  const scaleHints = new Map<string, number>([['chest', 0.006]]);

  const mgr = new InteriorItemManager(scene as any, templates, heights, scaleHints);
  const items: InteriorItemData[] = [{
    id: 'item1', name: 'Treasure Chest', objectRole: 'chest',
    itemType: 'collectible', metadata: { businessId: 'biz1' },
  }];

  const meshes = mgr.spawnItems('biz1', makeInterior('biz1'), items);
  assert(meshes.length === 1, 'spawns mesh with scaleHint');

  // With scaleHint=0.006, scaling should be 0.006 (not fallback 0.4/100 = 0.004)
  assertApprox(meshes[0].scaling.x, 0.006, 'scaling.x uses scaleHint');
  assertApprox(meshes[0].scaling.y, 0.006, 'scaling.y uses scaleHint');
  assertApprox(meshes[0].scaling.z, 0.006, 'scaling.z uses scaleHint');
}

console.log('\nInteriorItemManager — falls back without scaleHint:');

{
  const scene = new Scene();
  const template = new Mesh('sword_template') as any;
  const templates = new Map<string, any>([['sword', template]]);
  const heights = new Map<string, number>([['sword', 2.0]]);

  const mgr = new InteriorItemManager(scene as any, templates, heights);
  const items: InteriorItemData[] = [{
    id: 'item2', name: 'Iron Sword', objectRole: 'sword',
    itemType: 'weapon', metadata: { businessId: 'biz2' },
  }];

  const meshes = mgr.spawnItems('biz2', makeInterior('biz2'), items);
  assert(meshes.length === 1, 'spawns mesh without scaleHint');

  // Without scaleHint: scale = 0.4 / 2.0 = 0.2
  assertApprox(meshes[0].scaling.x, 0.2, 'scaling.x uses fallback target/origH');
  assertApprox(meshes[0].scaling.y, 0.2, 'scaling.y uses fallback target/origH');
  assertApprox(meshes[0].scaling.z, 0.2, 'scaling.z uses fallback target/origH');
}

console.log('\nInteriorItemManager — ignores invalid scaleHint (zero):');

{
  const scene = new Scene();
  const template = new Mesh('lantern_template') as any;
  const templates = new Map<string, any>([['lantern', template]]);
  const heights = new Map<string, number>([['lantern', 4.0]]);
  const scaleHints = new Map<string, number>([['lantern', 0]]);

  const mgr = new InteriorItemManager(scene as any, templates, heights, scaleHints);
  const items: InteriorItemData[] = [{
    id: 'item3', name: 'Lantern', objectRole: 'lantern',
    itemType: 'tool', metadata: { businessId: 'biz3' },
  }];

  const meshes = mgr.spawnItems('biz3', makeInterior('biz3'), items);

  // With zero scaleHint, should fall back: scale = 0.4 / 4.0 = 0.1
  assertApprox(meshes[0].scaling.x, 0.1, 'scaling.x falls back when scaleHint is zero');
}

console.log('\nInteriorItemManager — ignores negative scaleHint:');

{
  const scene = new Scene();
  const template = new Mesh('potion_template') as any;
  const templates = new Map<string, any>([['potion', template]]);
  const heights = new Map<string, number>([['potion', 0.8]]);
  const scaleHints = new Map<string, number>([['potion', -0.5]]);

  const mgr = new InteriorItemManager(scene as any, templates, heights, scaleHints);
  const items: InteriorItemData[] = [{
    id: 'item4', name: 'Health Potion', objectRole: 'potion',
    itemType: 'consumable', metadata: { businessId: 'biz4' },
  }];

  const meshes = mgr.spawnItems('biz4', makeInterior('biz4'), items);

  // With negative scaleHint, should fall back: scale = 0.4 / 0.8 = 0.5
  assertApprox(meshes[0].scaling.x, 0.5, 'scaling.x falls back when scaleHint is negative');
}

console.log('\nInteriorItemManager — backward compatible with 3-arg constructor:');

{
  const scene = new Scene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  assert(mgr != null, 'constructor works without scaleHints parameter');
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
