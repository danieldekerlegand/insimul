/**
 * Tests for InteriorItemManager — interior item prop spawning.
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/InteriorItemManager.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { InteriorItemManager, InteriorItemData } from '../InteriorItemManager';
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

// ── Test helpers ──

function makeScene(): any {
  return new Scene();
}

function makeInterior(overrides: Partial<InteriorLayout> = {}): InteriorLayout {
  return {
    id: 'interior_biz1',
    buildingId: 'biz1',
    buildingType: 'business',
    businessType: 'Shop',
    position: new Vector3(0, 500, 0) as any,
    width: 10,
    depth: 10,
    height: 4.5,
    roomMesh: new Mesh('room') as any,
    furniture: [],
    doorPosition: new Vector3(0, 501, -4.5) as any,
    exitPosition: new Vector3(0, 0, 0) as any,
    ...overrides,
  };
}

function makeItem(overrides: Partial<InteriorItemData> = {}): InteriorItemData {
  return {
    id: 'item1',
    name: 'Iron Sword',
    objectRole: 'sword',
    itemType: 'weapon',
    metadata: { businessId: 'biz1' },
    ...overrides,
  };
}

// ── Tests ──

console.log('\n=== InteriorItemManager Tests ===\n');

// --- getItemsForBuilding ---

console.log('getItemsForBuilding:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());

  const items: InteriorItemData[] = [
    makeItem({ id: '1', metadata: { businessId: 'biz1' } }),
    makeItem({ id: '2', metadata: { businessId: 'biz2' } }),
    makeItem({ id: '3', metadata: { residenceId: 'biz1' } }),
    makeItem({ id: '4', metadata: { businessId: 'other' } }),
    makeItem({ id: '5', metadata: null }),
    makeItem({ id: '6', metadata: undefined }),
  ];

  const result = mgr.getItemsForBuilding('biz1', items);
  assert(result.length === 2, 'filters items matching businessId or residenceId');
  assert(result[0].id === '1', 'includes business item');
  assert(result[1].id === '3', 'includes residence item matching buildingId');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());

  const result = mgr.getItemsForBuilding('biz1', []);
  assert(result.length === 0, 'returns empty array when no items');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());

  const items = [
    makeItem({ id: '1', metadata: { businessId: 'other' } }),
    makeItem({ id: '2', metadata: { residenceId: 'other' } }),
  ];
  const result = mgr.getItemsForBuilding('biz1', items);
  assert(result.length === 0, 'returns empty when no items match buildingId');
}

// --- spawnItems ---

console.log('\nspawnItems:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [
    makeItem({ id: '1', metadata: { businessId: 'biz1' } }),
    makeItem({ id: '2', metadata: { businessId: 'biz1' }, itemType: 'food' }),
  ];

  const meshes = mgr.spawnItems('biz1', interior, items);
  assert(meshes.length === 2, 'spawns one mesh per matching item');
  assert(meshes[0].isPickable === true, 'meshes are pickable');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();

  const meshes = mgr.spawnItems('biz1', interior, []);
  assert(meshes.length === 0, 'returns empty when no items for building');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [
    makeItem({ id: '1', metadata: { businessId: 'biz1' } }),
  ];

  mgr.spawnItems('biz1', interior, items);
  assert(mgr.getSpawnedMeshes().length === 1, 'tracks spawned meshes');

  // Spawn again clears previous
  mgr.spawnItems('biz1', interior, items);
  assert(mgr.getSpawnedMeshes().length === 1, 'clearItems called before respawning');
}

// --- metadata on spawned meshes ---

console.log('\nspawned mesh metadata:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [
    makeItem({ id: 'item42', objectRole: 'chest', metadata: { businessId: 'biz1' } }),
  ];

  const meshes = mgr.spawnItems('biz1', interior, items);
  const meta = meshes[0].metadata;
  assert(meta.objectRole === 'chest', 'mesh metadata has objectRole from item');
  assert(meta.itemId === 'item42', 'mesh metadata has itemId');
  assert(meta.interiorItem === true, 'mesh metadata marks as interiorItem');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [
    makeItem({ id: 'item99', objectRole: null, itemType: 'food', metadata: { businessId: 'biz1' } }),
  ];

  const meshes = mgr.spawnItems('biz1', interior, items);
  const meta = meshes[0].metadata;
  assert(meta.objectRole === 'food', 'falls back to itemType when objectRole is null');
}

// --- template-based spawning ---

console.log('\ntemplate-based spawning:');

{
  const scene = makeScene();
  const template = new Mesh('chest_template') as any;
  const templates = new Map([['chest', template]]);
  const heights = new Map([['chest', 1.0]]);

  const mgr = new InteriorItemManager(scene as any, templates as any, heights as any);
  const interior = makeInterior();
  const items = [
    makeItem({ id: '1', objectRole: 'chest', metadata: { businessId: 'biz1' } }),
  ];

  const meshes = mgr.spawnItems('biz1', interior, items);
  assert(meshes.length === 1, 'spawns mesh from template');
  // The mock clone returns a new Mesh, so just verify it was created
  assert(meshes[0].name !== 'chest_template', 'creates a clone, not the template itself');
}

// --- clearItems ---

console.log('\nclearItems:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [
    makeItem({ id: '1', metadata: { businessId: 'biz1' } }),
    makeItem({ id: '2', metadata: { businessId: 'biz1' } }),
  ];

  mgr.spawnItems('biz1', interior, items);
  assert(mgr.getSpawnedMeshes().length === 2, 'has spawned meshes');

  mgr.clearItems();
  assert(mgr.getSpawnedMeshes().length === 0, 'all meshes cleared');
}

// --- placement by building type ---

console.log('\nplacement by building type:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());

  // Tavern interior
  const tavernInterior = makeInterior({ businessType: 'Tavern' });
  const items = Array.from({ length: 5 }, (_, i) =>
    makeItem({ id: `t${i}`, metadata: { businessId: 'biz1' }, itemType: 'drink' })
  );

  const meshes = mgr.spawnItems('biz1', tavernInterior, items);
  assert(meshes.length === 5, 'spawns all items for tavern');

  // Check that positions differ (items placed at different locations)
  const positions = meshes.map(m => `${m.position.x},${m.position.z}`);
  const uniquePositions = new Set(positions);
  assert(uniquePositions.size > 1, 'items placed at different positions');
}

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());

  // Residence interior
  const residenceInterior = makeInterior({
    buildingType: 'residence',
    businessType: undefined,
  });
  const items = [
    makeItem({ id: 'r1', metadata: { businessId: 'biz1' }, itemType: 'food' }),
  ];

  const meshes = mgr.spawnItems('biz1', residenceInterior, items);
  assert(meshes.length === 1, 'spawns items in residence');
}

// --- dispose ---

console.log('\ndispose:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior();
  const items = [makeItem({ id: '1', metadata: { businessId: 'biz1' } })];

  mgr.spawnItems('biz1', interior, items);
  mgr.dispose();
  assert(mgr.getSpawnedMeshes().length === 0, 'dispose clears all meshes');
}

// --- many items cycle through placements ---

console.log('\nplacement cycling:');

{
  const scene = makeScene();
  const mgr = new InteriorItemManager(scene as any, new Map(), new Map());
  const interior = makeInterior({ businessType: 'Temple' });

  // Temple has 4 placements; spawn 6 items to test cycling
  const items = Array.from({ length: 6 }, (_, i) =>
    makeItem({ id: `temple${i}`, metadata: { businessId: 'biz1' }, itemType: 'collectible' })
  );

  const meshes = mgr.spawnItems('biz1', interior, items);
  assert(meshes.length === 6, 'all items spawned even when more than placement slots');
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
