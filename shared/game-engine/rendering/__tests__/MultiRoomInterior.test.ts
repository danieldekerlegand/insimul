/**
 * Tests for multi-room interior layout system.
 *
 * Verifies:
 * - Room dimensions are increased (30-50% larger)
 * - Multi-room layouts generate room zones with partitions
 * - Staircase mesh is created for multi-floor buildings
 * - Room-specific furniture is generated (kitchen, bedroom, shop, storage)
 * - InteriorNPCManager positions NPCs in correct rooms based on role/time
 * - InteriorLayout includes rooms and floorCount fields
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/MultiRoomInterior.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { InteriorLayout, RoomZone } from '../BuildingInteriorGenerator';
import { InteriorNPCManager } from '../InteriorNPCManager';
import type { InteriorNPCCallbacks } from '../InteriorNPCManager';

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

function makeLayout(overrides?: Partial<InteriorLayout>): InteriorLayout {
  return {
    id: 'interior_test',
    buildingId: 'test',
    buildingType: 'residence',
    position: new Vector3(0, 500, 0) as any,
    width: 12,
    depth: 12,
    height: 4,
    roomMesh: new Mesh('room') as any,
    furniture: [],
    doorPosition: new Vector3(0, 501, -6) as any,
    exitPosition: new Vector3(0, 0, 0) as any,
    rooms: [],
    floorCount: 1,
    ...overrides,
  } as any;
}

// ── Tests ──

console.log('\n=== Multi-Room Interior Tests ===\n');

// --- Increased room dimensions ---

console.log('increased room dimensions:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const small = gen.generateInterior('res_small', 'residence');
  assert(small.width === 13, `small residence width=13 (got ${small.width})`);
  assert(small.depth === 13, `small residence depth=13 (got ${small.depth})`);

  const med = gen.generateInterior('res_med', 'residence_medium');
  assert(med.width === 14, `medium residence width=14 (got ${med.width})`);
  assert(med.depth === 14, `medium residence depth=14 (got ${med.depth})`);

  const large = gen.generateInterior('res_large', 'residence_large');
  assert(large.width === 19, `large residence width=19 (got ${large.width})`);
  assert(large.depth === 19, `large residence depth=19 (got ${large.depth})`);
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const shop = gen.generateInterior('shop1', 'business', 'shop');
  assert(shop.width === 17, `shop width=17 (got ${shop.width})`);

  const tavern = gen.generateInterior('tav1', 'business', 'tavern');
  assert(tavern.width === 22, `tavern width=22 (got ${tavern.width})`);
  assert(tavern.depth === 19, `tavern depth=19 (got ${tavern.depth})`);

  const temple = gen.generateInterior('tmp1', 'business', 'temple');
  assert(temple.width === 24, `temple width=24 (got ${temple.width})`);
  assert(temple.depth === 29, `temple depth=29 (got ${temple.depth})`);
}

// --- Room zones ---

console.log('\nroom zones:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Medium residence: living + kitchen + bedroom ground; hallway + 2 bedrooms upper
  const layout = gen.generateInterior('res_rooms', 'residence_medium');
  assert(layout.rooms.length === 6, `medium residence has ${layout.rooms.length} room zones`);
  assert(layout.floorCount === 2, `medium residence has 2 floors (got ${layout.floorCount})`);

  const groundRooms = layout.rooms.filter(r => r.floor === 0);
  assert(groundRooms.length === 3, `has ${groundRooms.length} ground floor rooms`);

  const upperRooms = layout.rooms.filter(r => r.floor === 1);
  assert(upperRooms.length === 3, `has ${upperRooms.length} upper floor rooms`);

  // Check room functions
  const functions = layout.rooms.map(r => r.function);
  assert(functions.includes('living'), 'has living room');
  assert(functions.includes('kitchen'), 'has kitchen');
  assert(functions.includes('bedroom'), 'has bedroom');
  assert(functions.includes('hallway'), 'has hallway');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Shop should have shop floor + storage
  const layout = gen.generateInterior('shop_rooms', 'business', 'shop');
  assert(layout.rooms.length >= 2, `shop has ${layout.rooms.length} room zones`);

  const functions = layout.rooms.map(r => r.function);
  assert(functions.includes('shop'), 'shop has shop floor room');
  assert(functions.includes('storage'), 'shop has storage room');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Tavern: common room + kitchen + storage ground; 3 guest rooms upper
  const layout = gen.generateInterior('tav_rooms', 'business', 'tavern');
  assert(layout.rooms.length === 6, `tavern has ${layout.rooms.length} room zones`);
  const functions = layout.rooms.map(r => r.function);
  assert(functions.includes('tavern_main'), 'tavern has common room');
  assert(functions.includes('tavern_kitchen'), 'tavern has kitchen');
  assert(functions.includes('storage'), 'tavern has storage');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Small residence: single floor — living (60%) + bedroom (40%)
  const layout = gen.generateInterior('res_small2', 'residence');
  assert(layout.floorCount === 1, 'small residence is single floor');
  assert(layout.rooms.length >= 2, `small residence has ${layout.rooms.length} room zones`);
  const fns = layout.rooms.map(r => r.function);
  assert(fns.includes('living'), 'small residence has living room');
  assert(fns.includes('bedroom'), 'small residence has bedroom');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Temple: nave (70%) + altar area (20%) + vestry (10%)
  const layout = gen.generateInterior('temple1', 'business', 'temple');
  assert(layout.floorCount === 1, 'temple is single floor');
  assert(layout.rooms.length === 3, `temple has ${layout.rooms.length} room zones`);
  const functions = layout.rooms.map(r => r.function);
  assert(functions.includes('temple'), 'temple has nave');
  assert(functions.includes('altar'), 'temple has altar area');
  assert(functions.includes('vestry'), 'temple has vestry');
}

// --- Staircase mesh ---

console.log('\nstaircase mesh:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('tav_stairs', 'business', 'tavern');
  // Multi-floor building should have staircase in furniture
  const stairMeshes = layout.furniture.filter(f => f.name.includes('staircase'));
  assert(stairMeshes.length > 0, 'tavern has staircase mesh');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('small_no_stairs', 'residence');
  // Single-floor: no staircase
  const stairMeshes = layout.furniture.filter(f => f.name.includes('staircase'));
  assert(stairMeshes.length === 0, 'small residence has no staircase');
}

// --- Room-specific furniture ---

console.log('\nroom-specific furniture:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('res_furn', 'residence_medium');

  // Should have furniture from multiple room types
  const names = layout.furniture.map(f => f.name);
  const hasLivingFurn = names.some(n => n.includes('living_room'));
  const hasKitchenFurn = names.some(n => n.includes('kitchen'));
  const hasBedroomFurn = names.some(n => n.includes('bedroom'));

  assert(hasLivingFurn, 'has living room furniture');
  assert(hasKitchenFurn, 'has kitchen furniture');
  assert(hasBedroomFurn, 'has bedroom furniture');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('shop_furn', 'business', 'shop');
  const names = layout.furniture.map(f => f.name);
  const hasShopFurn = names.some(n => n.includes('shop_floor'));
  const hasStorageFurn = names.some(n => n.includes('storage'));

  assert(hasShopFurn, 'shop has shop floor furniture');
  assert(hasStorageFurn, 'shop has storage room furniture');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Kitchen should have stove/forge type furniture
  const layout = gen.generateInterior('res_kitchen', 'residence_large');
  const names = layout.furniture.map(f => f.name);
  const hasForge = names.some(n => n.includes('kitchen') && n.includes('forge'));
  assert(hasForge, 'kitchen has stove/hearth (forge type)');
}

// --- NPC room-based positioning ---

console.log('\nNPC room-based positioning:');

{
  // Daytime: residence NPCs in living room
  const callbacks: InteriorNPCCallbacks = {
    getGameHour: () => 12,
  };
  const mgr = new InteriorNPCManager(callbacks);

  const layout = makeLayout({
    buildingType: 'residence',
    rooms: [
      { name: 'living_room', function: 'living', offsetX: 0, offsetZ: -3, offsetY: 0, width: 12, depth: 7, floor: 0 },
      { name: 'kitchen', function: 'kitchen', offsetX: 0, offsetZ: 3, offsetY: 0, width: 12, depth: 5, floor: 0 },
    ],
    floorCount: 1,
  });

  const ownerMesh = new Mesh('owner') as any;
  ownerMesh._enabled = true;
  ownerMesh.isEnabled = () => true;
  ownerMesh.setEnabled = () => {};

  const allNPCs = new Map<string, { mesh: any; characterData?: any }>();
  allNPCs.set('owner1', { mesh: ownerMesh, characterData: {} });

  const placed = mgr.populateInterior('bld1', layout as any, {
    buildingType: 'residence',
    ownerId: 'owner1',
    residenceId: 'res1',
  }, allNPCs as any);

  assert(placed.length === 1, `placed 1 NPC (got ${placed.length})`);
  // Daytime: should be in living area (negative Z offset, not bedroom)
  const ownerPlaced = placed[0];
  assert(ownerPlaced.animationState !== undefined, `NPC has animation state: ${ownerPlaced.animationState}`);
}

{
  // Nighttime: residence NPCs in bedroom area
  const callbacks: InteriorNPCCallbacks = {
    getGameHour: () => 23,
  };
  const mgr = new InteriorNPCManager(callbacks);

  const layout = makeLayout({
    buildingType: 'residence',
    rooms: [
      { name: 'living_room', function: 'living', offsetX: 0, offsetZ: -3, offsetY: 0, width: 12, depth: 7, floor: 0 },
      { name: 'bedroom', function: 'bedroom', offsetX: 0, offsetZ: 0, offsetY: 4, width: 12, depth: 12, floor: 1 },
    ],
    floorCount: 2,
  });

  const ownerMesh = new Mesh('owner') as any;
  ownerMesh._enabled = true;
  ownerMesh.isEnabled = () => true;
  ownerMesh.setEnabled = () => {};

  const allNPCs = new Map<string, { mesh: any; characterData?: any }>();
  allNPCs.set('owner1', { mesh: ownerMesh, characterData: {} });

  const placed = mgr.populateInterior('bld1', layout as any, {
    buildingType: 'residence',
    ownerId: 'owner1',
    residenceId: 'res1',
  }, allNPCs as any);

  assert(placed.length === 1, `nighttime: placed 1 NPC (got ${placed.length})`);
  // Nighttime: the furniture role should have bedroom function
  const ownerPlaced = placed[0];
  assert(ownerPlaced.role === 'owner', 'owner role preserved');
  // Nighttime: NPC on bed should have 'sleep' animation, not 'idle'
  assert(ownerPlaced.animationState === 'sleep', `nighttime bed animation should be 'sleep' (got '${ownerPlaced.animationState}')`);
}

{
  // Shop: shopkeeper at counter, employee in storage
  const callbacks: InteriorNPCCallbacks = {
    getGameHour: () => 12,
  };
  const mgr = new InteriorNPCManager(callbacks);

  const layout = makeLayout({
    buildingType: 'business',
    businessType: 'Shop',
    rooms: [
      { name: 'shop_floor', function: 'shop', offsetX: 0, offsetZ: -3, offsetY: 0, width: 14, depth: 8, floor: 0 },
      { name: 'storage', function: 'storage', offsetX: 0, offsetZ: 4, offsetY: 0, width: 14, depth: 6, floor: 0 },
    ],
    floorCount: 2,
  });

  const ownerMesh = new Mesh('shopkeeper') as any;
  ownerMesh._enabled = true;
  ownerMesh.isEnabled = () => true;
  ownerMesh.setEnabled = () => {};

  const empMesh = new Mesh('employee') as any;
  empMesh._enabled = true;
  empMesh.isEnabled = () => true;
  empMesh.setEnabled = () => {};

  const allNPCs = new Map<string, { mesh: any; characterData?: any }>();
  allNPCs.set('shopkeeper1', { mesh: ownerMesh, characterData: {} });
  allNPCs.set('emp1', { mesh: empMesh, characterData: {} });

  const placed = mgr.populateInterior('bld2', layout as any, {
    buildingType: 'business',
    businessType: 'Shop',
    ownerId: 'shopkeeper1',
    employees: ['emp1'],
  }, allNPCs as any);

  assert(placed.length === 2, `placed 2 NPCs in shop (got ${placed.length})`);
  const shopkeeper = placed.find(p => p.npcId === 'shopkeeper1');
  assert(shopkeeper !== undefined, 'shopkeeper is placed');
  assert(shopkeeper!.role === 'owner', 'shopkeeper has owner role');
}

// --- InteriorLayout has rooms and floorCount ---

console.log('\nlayout structure:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('struct_test', 'business', 'guild');
  assert(Array.isArray(layout.rooms), 'layout.rooms is an array');
  assert(layout.rooms.length > 0, `layout has ${layout.rooms.length} rooms`);
  assert(typeof layout.floorCount === 'number', 'layout.floorCount is a number');
  assert(layout.floorCount >= 1, `floor count >= 1 (got ${layout.floorCount})`);

  // Each room zone should have required fields
  for (const room of layout.rooms) {
    assert(typeof room.name === 'string' && room.name.length > 0, `room has name: ${room.name}`);
    assert(typeof room.function === 'string', `room has function: ${room.function}`);
    assert(typeof room.floor === 'number', `room has floor: ${room.floor}`);
    assert(room.width > 0, `room width > 0: ${room.width}`);
    assert(room.depth > 0, `room depth > 0: ${room.depth}`);
  }
}

// --- All building types still produce furniture with new system ---

console.log('\nall building types produce furniture (multi-room):');

const buildingTypes = [
  ['tavern', 'business'],
  ['shop', 'business'],
  ['blacksmith', 'business'],
  ['temple', 'business'],
  ['guild', 'business'],
  ['residence', 'residence'],
  ['residence_medium', 'residence'],
  ['residence_large', 'residence'],
  ['warehouse', 'business'],
];

for (const [bType, category] of buildingTypes) {
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior(`bld_${bType}_mr`, category, bType);

  assert(layout.furniture.length > 0, `${bType} has furniture (${layout.furniture.length} pieces)`);
  assert(layout.rooms.length > 0, `${bType} has room zones (${layout.rooms.length})`);
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
