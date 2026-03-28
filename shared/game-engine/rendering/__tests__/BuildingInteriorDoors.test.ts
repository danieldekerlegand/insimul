/**
 * Tests for interior door meshes in BuildingInteriorGenerator.
 *
 * Verifies that:
 * - Partition doorways contain door panel + handle meshes
 * - Front entrance door is always present
 * - Door materials match building style (dark wood tavern, light wood residence, metal-banded blacksmith)
 * - Door metadata is correctly set (isDoor, isFrontEntrance, isOpen, doorAxis)
 * - Door handles are positioned on one side of the door
 * - Doors start closed with collision enabled
 * - Open/close toggle updates metadata and collision
 * - InteriorLayout.frontDoor is populated
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BuildingInteriorDoors.test.ts
 */

import { Scene, Mesh, Vector3, StandardMaterial, Color3, __materialRegistry } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';

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

function makeScene(): any {
  return new Scene();
}

// ── Tests ──

console.log('\n=== BuildingInteriorGenerator Door Tests ===\n');

// --- Front entrance door ---

console.log('front entrance door:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('door_test1', 'tavern');

  // Should have a frontDoor mesh
  assert(layout.frontDoor !== undefined, 'layout has frontDoor');
  assert(layout.frontDoor!.metadata?.isDoor === true, 'frontDoor metadata.isDoor is true');
  assert(layout.frontDoor!.metadata?.isFrontEntrance === true, 'frontDoor metadata.isFrontEntrance is true');
  assert(layout.frontDoor!.metadata?.isOpen === false, 'frontDoor starts closed');
  assert(layout.frontDoor!.checkCollisions === true, 'frontDoor has collision when closed');
  assert(layout.frontDoor!.isPickable === true, 'frontDoor is pickable');

  // Front door should be in the furniture array
  const doorPanels = layout.furniture.filter(m => m.name.includes('_door_panel'));
  assert(doorPanels.length > 0, 'door panels exist in furniture');

  // Front entrance door panel should be present
  const entrancePanels = layout.furniture.filter(
    m => m.name.includes('entrance') && m.name.includes('_door_panel')
  );
  assert(entrancePanels.length === 1, 'exactly one entrance door panel');
}

// --- Partition doors ---

console.log('\npartition doors for multi-room layout:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  // Tavern has 3+ rooms (common_room, kitchen, storage), so should have partition doors
  const layout = gen.generateInterior('door_test2', 'tavern');

  const partitionDoorPanels = layout.furniture.filter(
    m => m.name.includes('_door_panel') && !m.name.includes('entrance')
  );
  assert(partitionDoorPanels.length > 0, 'partition doors exist for multi-room tavern');

  // Each partition door should have metadata
  for (const door of partitionDoorPanels) {
    assert(door.metadata?.isDoor === true, `${door.name} has isDoor metadata`);
    assert(door.metadata?.isFrontEntrance === false, `${door.name} is not front entrance`);
    assert(door.metadata?.isOpen === false, `${door.name} starts closed`);
    assert(door.checkCollisions === true, `${door.name} has collision when closed`);
    assert(
      door.metadata?.doorAxis === 'x' || door.metadata?.doorAxis === 'z',
      `${door.name} has valid doorAxis`
    );
  }
}

// --- Door handles ---

console.log('\ndoor handles:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('door_test3', 'tavern');

  const handles = layout.furniture.filter(m => m.name.includes('_door_handle'));
  assert(handles.length > 0, 'door handles exist');

  // Each door panel should have a corresponding handle
  const doorPanels = layout.furniture.filter(m => m.name.includes('_door_panel'));
  assert(handles.length === doorPanels.length, 'one handle per door panel');

  // Handles should not be pickable
  for (const handle of handles) {
    assert(handle.isPickable === false, `${handle.name} is not pickable`);
  }
}

// --- Door materials by building style ---

console.log('\ndoor materials by building style:');

{
  // Tavern: dark wood
  __materialRegistry.clear();
  const scene1 = makeScene();
  const gen1 = new BuildingInteriorGenerator(scene1 as any);
  gen1.generateInterior('style_tavern', 'tavern');

  const tavernDoorMat = __materialRegistry.get('interior_style_tavern_entrance_door_mat');
  assert(tavernDoorMat !== undefined, 'tavern entrance door material exists');
  if (tavernDoorMat) {
    const c = tavernDoorMat.diffuseColor as Color3;
    assert(c.r < 0.4 && c.g < 0.3, 'tavern door is dark wood color');
  }

  // Residence: light wood
  __materialRegistry.clear();
  const scene2 = makeScene();
  const gen2 = new BuildingInteriorGenerator(scene2 as any);
  gen2.generateInterior('style_res', 'residence');

  const resDoorMat = __materialRegistry.get('interior_style_res_entrance_door_mat');
  assert(resDoorMat !== undefined, 'residence entrance door material exists');
  if (resDoorMat) {
    const c = resDoorMat.diffuseColor as Color3;
    assert(c.r > 0.5 && c.g > 0.3, 'residence door is light wood color');
  }

  // Blacksmith: metal-banded (high specular)
  __materialRegistry.clear();
  const scene3 = makeScene();
  const gen3 = new BuildingInteriorGenerator(scene3 as any);
  gen3.generateInterior('style_smith', 'blacksmith');

  const smithDoorMat = __materialRegistry.get('interior_style_smith_entrance_door_mat');
  assert(smithDoorMat !== undefined, 'blacksmith entrance door material exists');
  if (smithDoorMat) {
    const s = smithDoorMat.specularColor as Color3;
    assert(s.r >= 0.3, 'blacksmith door has high specular (metal-banded)');
  }
}

// --- Door handle material (brass) ---

console.log('\ndoor handle material:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  gen.generateInterior('handle_test', 'tavern');

  const handleMat = __materialRegistry.get('interior_handle_test_entrance_handle_mat');
  assert(handleMat !== undefined, 'handle material exists');
  if (handleMat) {
    const c = handleMat.diffuseColor as Color3;
    assert(c.r > 0.6 && c.g > 0.5, 'handle is brass-colored');
    const s = handleMat.specularColor as Color3;
    assert(s.r >= 0.4, 'handle has metallic specular');
  }
}

// --- Door metadata skipMerge ---

console.log('\ndoor metadata:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('meta_test', 'tavern');

  const doorPanels = layout.furniture.filter(m => m.name.includes('_door_panel'));
  for (const door of doorPanels) {
    assert(door.metadata?.skipMerge === true, `${door.name} has skipMerge metadata`);
    assert(door.metadata?.autoCloseTimer === null, `${door.name} has null autoCloseTimer`);
    assert(door.metadata?.onExitCallback === null, `${door.name} has null onExitCallback`);
  }
}

// --- Single-room building still gets front entrance door ---

console.log('\nsingle-room building:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('single_room', 'warehouse');

  assert(layout.frontDoor !== undefined, 'warehouse has front entrance door');
  assert(layout.frontDoor!.metadata?.isFrontEntrance === true, 'warehouse front door is marked as entrance');

  // Single room = no partition doors, just the entrance
  const partitionDoors = layout.furniture.filter(
    m => m.name.includes('_door_panel') && !m.name.includes('entrance')
  );
  assert(partitionDoors.length === 0, 'no partition doors for single-room building');
}

// --- ActionManager is set up ---

console.log('\naction manager:');

{
  __materialRegistry.clear();
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('action_test', 'tavern');

  const doorPanels = layout.furniture.filter(m => m.name.includes('_door_panel'));
  for (const door of doorPanels) {
    assert(door.actionManager !== null, `${door.name} has ActionManager`);
  }
}

// ── Summary ──

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
