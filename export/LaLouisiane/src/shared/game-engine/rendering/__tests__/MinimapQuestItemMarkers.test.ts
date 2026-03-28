/**
 * Tests for minimap quest item markers
 *
 * Verifies that QuestObjectManager.getCollectibleItemPositions() returns
 * the correct positions for uncollected fetch quest items, and that
 * collected/disposed items are excluded.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/MinimapQuestItemMarkers.test.ts
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

// ── Mock the QuestObjectManager's questObjects map and getCollectibleItemPositions logic ──
// We replicate the logic here since importing the actual class requires Babylon.js

type QuestObjectiveType =
  | 'collect_item'
  | 'identify_object'
  | 'find_vocabulary_items'
  | 'visit_location'
  | 'talk_to_npc'
  | 'defeat_enemies';

interface MockMesh {
  name: string;
  position: { x: number; z: number };
  isDisposed(): boolean;
}

interface MockQuestObject {
  mesh: MockMesh;
  questId: string;
  objectiveId: string;
  type: QuestObjectiveType;
  isCollected: boolean;
}

function getCollectibleItemPositions(questObjects: Map<string, MockQuestObject>) {
  const items: Array<{ id: string; questId: string; itemName: string; position: { x: number; z: number } }> = [];
  questObjects.forEach((obj, id) => {
    if (obj.isCollected) return;
    if (obj.type !== 'collect_item' && obj.type !== 'identify_object' && obj.type !== 'find_vocabulary_items') return;
    if (!obj.mesh || obj.mesh.isDisposed()) return;
    items.push({
      id,
      questId: obj.questId,
      itemName: obj.mesh.name,
      position: { x: obj.mesh.position.x, z: obj.mesh.position.z }
    });
  });
  return items;
}

// ── Tests ──

console.log('\n── getCollectibleItemPositions ──');

{
  const objects = new Map<string, MockQuestObject>();
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 0, 'empty map returns no items');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('item_0', {
    mesh: { name: 'quest_item_gem', position: { x: 10, z: 20 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'collect_item',
    isCollected: false,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 1, 'returns uncollected collect_item');
  assert(result[0].id === 'item_0', 'correct id');
  assert(result[0].questId === 'q1', 'correct questId');
  assert(result[0].position.x === 10, 'correct x position');
  assert(result[0].position.z === 20, 'correct z position');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('item_0', {
    mesh: { name: 'quest_item_gem', position: { x: 10, z: 20 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'collect_item',
    isCollected: true,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 0, 'excludes collected items');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('item_0', {
    mesh: { name: 'quest_item_gem', position: { x: 10, z: 20 }, isDisposed: () => true },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'collect_item',
    isCollected: false,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 0, 'excludes disposed meshes');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('loc_0', {
    mesh: { name: 'location_marker', position: { x: 5, z: 5 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'visit_location',
    isCollected: false,
  });
  objects.set('npc_0', {
    mesh: { name: 'npc_target', position: { x: 15, z: 15 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj2',
    type: 'talk_to_npc',
    isCollected: false,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 0, 'excludes non-collectible objective types');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('item_0', {
    mesh: { name: 'vocab_apple', position: { x: 1, z: 2 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'identify_object',
    isCollected: false,
  });
  objects.set('item_1', {
    mesh: { name: 'vocab_tree', position: { x: 3, z: 4 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj2',
    type: 'find_vocabulary_items',
    isCollected: false,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 2, 'includes identify_object and find_vocabulary_items types');
}

{
  const objects = new Map<string, MockQuestObject>();
  objects.set('item_0', {
    mesh: { name: 'gem', position: { x: 10, z: 20 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj1',
    type: 'collect_item',
    isCollected: false,
  });
  objects.set('item_1', {
    mesh: { name: 'potion', position: { x: 30, z: 40 }, isDisposed: () => false },
    questId: 'q1',
    objectiveId: 'obj2',
    type: 'collect_item',
    isCollected: true,
  });
  objects.set('item_2', {
    mesh: { name: 'scroll', position: { x: 50, z: 60 }, isDisposed: () => false },
    questId: 'q2',
    objectiveId: 'obj3',
    type: 'collect_item',
    isCollected: false,
  });
  const result = getCollectibleItemPositions(objects);
  assert(result.length === 2, 'mixed scenario: returns only uncollected items');
  const ids = result.map(r => r.id);
  assert(ids.includes('item_0'), 'includes first uncollected item');
  assert(ids.includes('item_2'), 'includes third uncollected item from different quest');
  assert(!ids.includes('item_1'), 'excludes collected item');
}

// ── MinimapData questItemMarkers integration ──

console.log('\n── MinimapData questItemMarkers construction ──');

{
  // Simulate what BabylonGame.ts does to build questItemMarkers
  const collectiblePositions = [
    { id: 'item_0', questId: 'q1', itemName: 'gem', position: { x: 10, z: 20 } },
    { id: 'item_1', questId: 'q1', itemName: 'scroll', position: { x: 30, z: 40 } },
  ];
  const questItemMarkers = collectiblePositions.map(item => ({
    id: item.id,
    itemName: item.itemName,
    position: item.position,
  }));

  assert(questItemMarkers.length === 2, 'builds correct number of item markers');
  assert(questItemMarkers[0].id === 'item_0', 'first marker has correct id');
  assert(questItemMarkers[0].itemName === 'gem', 'first marker has correct itemName');
  assert(questItemMarkers[1].position.x === 30, 'second marker has correct x');
  assert(questItemMarkers[1].position.z === 40, 'second marker has correct z');
}

// ── Summary ──
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
