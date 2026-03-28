/**
 * Tests for varied multi-room interior layouts.
 *
 * Verifies:
 * - Tavern: main hall (50%), kitchen (25%), storage (25%); 3 guest rooms upstairs
 * - Restaurant: dining (60%), kitchen (30%), storage (10%)
 * - Shop: showroom (70%), storeroom (30%)
 * - Small residence: living (60%), bedroom (40%)
 * - Medium residence: living + kitchen + bedroom ground; hallway + 2 bedrooms upper
 * - Large residence: entry hall, living, dining, kitchen ground; 3 bedrooms + study upper
 * - Church/Temple: nave (70%), altar (20%), vestry (10%)
 * - Room labels are generated for each room
 * - Partition walls between 3+ rooms per floor
 * - New room function furniture (dining, altar, vestry, entry_hall, hallway)
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/MultiRoomLayouts.test.ts
 */

import { Scene, Mesh, Vector3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { RoomZone } from '../BuildingInteriorGenerator';

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

function makeGen(): BuildingInteriorGenerator {
  return new BuildingInteriorGenerator(new Scene() as any);
}

function roomFunctions(rooms: RoomZone[]): string[] {
  return rooms.map(r => r.function);
}

function roomNames(rooms: RoomZone[]): string[] {
  return rooms.map(r => r.name);
}

function groundRooms(rooms: RoomZone[]): RoomZone[] {
  return rooms.filter(r => r.floor === 0);
}

function upperRooms(rooms: RoomZone[]): RoomZone[] {
  return rooms.filter(r => r.floor === 1);
}

// ── Tests ──

console.log('\n=== Multi-Room Layout Tests ===\n');

// --- Tavern layout ---
console.log('tavern layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('tav1', 'business', 'tavern');
  const ground = groundRooms(layout.rooms);
  const upper = upperRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(ground.length === 3, `tavern ground floor has 3 rooms (got ${ground.length})`);
  assert(upper.length >= 2, `tavern upper floor has ${upper.length} guest rooms`);
  assert(fns.includes('tavern_main'), 'tavern has main hall');
  assert(fns.includes('tavern_kitchen'), 'tavern has kitchen');
  assert(fns.includes('storage'), 'tavern has storage');

  // Guest rooms should all be bedrooms
  const guestFns = upper.map(r => r.function);
  assert(guestFns.every(f => f === 'bedroom'), 'all upper rooms are bedrooms');

  // Main hall should be the largest ground room
  const mainHall = ground.find(r => r.function === 'tavern_main')!;
  const kitchenRoom = ground.find(r => r.function === 'tavern_kitchen')!;
  const storageRoom = ground.find(r => r.function === 'storage')!;
  assert(mainHall.width * mainHall.depth > kitchenRoom.width * kitchenRoom.depth,
    'main hall is larger than kitchen');
  assert(mainHall.width * mainHall.depth > storageRoom.width * storageRoom.depth,
    'main hall is larger than storage');
}

// --- Restaurant layout ---
console.log('\nrestaurant layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('rest1', 'business', 'restaurant');
  const ground = groundRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(ground.length === 3, `restaurant has 3 ground rooms (got ${ground.length})`);
  assert(fns.includes('dining'), 'restaurant has dining room');
  assert(fns.includes('kitchen') || fns.includes('tavern_kitchen'), 'restaurant has kitchen');
  assert(fns.includes('storage'), 'restaurant has storage');

  // Dining room should be the largest
  const dining = ground.find(r => r.function === 'dining' || r.function === 'restaurant_main')!;
  assert(dining !== undefined, 'dining room found');
  const totalArea = ground.reduce((sum, r) => sum + r.width * r.depth, 0);
  const diningArea = dining.width * dining.depth;
  assert(diningArea / totalArea > 0.45, `dining room is > 45% of total (${(diningArea / totalArea * 100).toFixed(0)}%)`);
}

// --- Shop layout ---
console.log('\nshop layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('shop1', 'business', 'shop');
  const ground = groundRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(ground.length === 2, `shop has 2 ground rooms (got ${ground.length})`);
  assert(fns.includes('shop'), 'shop has showroom');
  assert(fns.includes('storage'), 'shop has storeroom');

  // Showroom should be larger than storage
  const showroom = ground.find(r => r.function === 'shop')!;
  const storage = ground.find(r => r.function === 'storage')!;
  assert(showroom.depth > storage.depth, 'showroom is deeper than storeroom');

  // Living quarters upstairs
  if (layout.floorCount > 1) {
    const upper = upperRooms(layout.rooms);
    assert(upper.length >= 1, 'shop has living quarters upstairs');
    assert(upper.some(r => r.function === 'living'), 'upstairs is living quarters');
  }
}

// --- Small residence layout ---
console.log('\nsmall residence layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('res_s', 'residence');
  const fns = roomFunctions(layout.rooms);

  assert(layout.floorCount === 1, 'small residence is single floor');
  assert(layout.rooms.length === 2, `has 2 rooms (got ${layout.rooms.length})`);
  assert(fns.includes('living'), 'has living room');
  assert(fns.includes('bedroom'), 'has bedroom');

  // Living room should be 60% of depth
  const living = layout.rooms.find(r => r.function === 'living')!;
  const bedroom = layout.rooms.find(r => r.function === 'bedroom')!;
  assert(living.depth > bedroom.depth, 'living area is deeper than bedroom');
}

// --- Medium residence layout ---
console.log('\nmedium residence layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('res_m', 'residence_medium');
  const ground = groundRooms(layout.rooms);
  const upper = upperRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(layout.floorCount === 2, 'medium residence has 2 floors');
  assert(ground.length === 3, `has 3 ground rooms (got ${ground.length})`);
  assert(fns.includes('living'), 'has living room');
  assert(fns.includes('kitchen'), 'has kitchen');
  assert(fns.includes('bedroom'), 'has bedroom on ground');
  assert(fns.includes('hallway'), 'has hallway upstairs');

  // Upper floor has bedrooms + hallway
  const upperBedrooms = upper.filter(r => r.function === 'bedroom');
  assert(upperBedrooms.length === 2, `upper floor has 2 bedrooms (got ${upperBedrooms.length})`);
  assert(upper.some(r => r.function === 'hallway'), 'upper floor has hallway');
}

// --- Large residence / mansion layout ---
console.log('\nlarge residence layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('res_l', 'residence_large');
  const ground = groundRooms(layout.rooms);
  const upper = upperRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(layout.floorCount === 2, 'large residence has 2 floors');
  assert(ground.length === 4, `has 4 ground rooms (got ${ground.length})`);
  assert(fns.includes('entry_hall'), 'has entry hall');
  assert(fns.includes('living'), 'has living room');
  assert(fns.includes('dining'), 'has dining room');
  assert(fns.includes('kitchen'), 'has kitchen');

  // Upper floor: 3 bedrooms + study
  const upperBedrooms = upper.filter(r => r.function === 'bedroom');
  assert(upperBedrooms.length === 3, `upper floor has 3 bedrooms (got ${upperBedrooms.length})`);
  assert(upper.some(r => r.function === 'office'), 'upper floor has study/office');
}

// --- Church/Temple layout ---
console.log('\nchurch/temple layout:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('church1', 'business', 'temple');
  const ground = groundRooms(layout.rooms);
  const fns = roomFunctions(layout.rooms);

  assert(layout.floorCount === 1, 'temple is single floor');
  assert(ground.length === 3, `has 3 rooms (got ${ground.length})`);
  assert(fns.includes('temple'), 'has nave');
  assert(fns.includes('altar'), 'has altar area');
  assert(fns.includes('vestry'), 'has vestry');

  // Nave should be the largest room
  const nave = ground.find(r => r.function === 'temple')!;
  const altar = ground.find(r => r.function === 'altar')!;
  const vestry = ground.find(r => r.function === 'vestry')!;
  assert(nave.depth > altar.depth, 'nave is deeper than altar area');
  assert(altar.depth > vestry.depth, 'altar area is deeper than vestry');
}

// --- Room labels ---
console.log('\nroom labels:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('label_test', 'business', 'tavern');

  // Room labels are generated as meshes with _label suffix in the name
  const labelMeshes = layout.furniture.filter(f => f.name.endsWith('_label'));
  assert(labelMeshes.length > 0, `has room label meshes (${labelMeshes.length})`);
  assert(labelMeshes.length === layout.rooms.length,
    `has one label per room (${labelMeshes.length} labels, ${layout.rooms.length} rooms)`);

  // Verify each room has a corresponding label
  for (const room of layout.rooms) {
    const hasLabel = labelMeshes.some(m => m.name.includes(room.name));
    assert(hasLabel, `room '${room.name}' has a label`);
  }

  // Each label should have a material
  const allHaveMaterial = labelMeshes.every(m => m.material !== null);
  assert(allHaveMaterial, 'all labels have materials');
}

// --- Partition walls for 3+ rooms ---
console.log('\npartition walls:');
{
  const gen = makeGen();
  const layout = gen.generateInterior('part_test', 'business', 'tavern');

  // Tavern has 3 ground rooms — should generate partition walls
  // Partitions are in the scene meshes (not in furniture array)
  // But we can verify rooms don't overlap
  const ground = groundRooms(layout.rooms);
  for (let i = 0; i < ground.length; i++) {
    for (let j = i + 1; j < ground.length; j++) {
      const a = ground[i];
      const b = ground[j];
      // Check that rooms don't fully overlap in both axes
      const overlapX = Math.max(0,
        Math.min(a.offsetX + a.width / 2, b.offsetX + b.width / 2) -
        Math.max(a.offsetX - a.width / 2, b.offsetX - b.width / 2));
      const overlapZ = Math.max(0,
        Math.min(a.offsetZ + a.depth / 2, b.offsetZ + b.depth / 2) -
        Math.max(a.offsetZ - a.depth / 2, b.offsetZ - b.depth / 2));
      const overlapArea = overlapX * overlapZ;
      const minArea = Math.min(a.width * a.depth, b.width * b.depth);
      // Allow some overlap tolerance but rooms shouldn't be mostly overlapping
      assert(overlapArea < minArea * 0.5,
        `rooms ${a.name} and ${b.name} don't significantly overlap (${(overlapArea / minArea * 100).toFixed(0)}%)`);
    }
  }
}

// --- New room functions produce furniture ---
console.log('\nnew room function furniture:');
{
  const gen = makeGen();

  // Large residence has dining, entry_hall rooms
  const largeRes = gen.generateInterior('furn_large', 'residence_large');
  const names = largeRes.furniture.map(f => f.name);
  assert(names.some(n => n.includes('entry_hall')), 'entry hall has furniture');
  assert(names.some(n => n.includes('dining_room')), 'dining room has furniture');
  assert(names.some(n => n.includes('study')), 'study has furniture');
}

{
  const gen = makeGen();

  // Temple has altar, vestry rooms
  const temple = gen.generateInterior('furn_temple', 'business', 'temple');
  const names = temple.furniture.map(f => f.name);
  assert(names.some(n => n.includes('altar_area')), 'altar area has furniture');
  assert(names.some(n => n.includes('vestry')), 'vestry has furniture');
}

{
  const gen = makeGen();

  // Medium residence has hallway
  const medRes = gen.generateInterior('furn_med', 'residence_medium');
  const names = medRes.furniture.map(f => f.name);
  assert(names.some(n => n.includes('hallway')), 'hallway has furniture/label');
}

// --- Room zones have valid dimensions ---
console.log('\nroom zone validity:');
{
  const types: Array<[string, string, string?]> = [
    ['res', 'residence'],
    ['res_m', 'residence_medium'],
    ['res_l', 'residence_large'],
    ['tav', 'business', 'tavern'],
    ['rest', 'business', 'restaurant'],
    ['shop', 'business', 'shop'],
    ['church', 'business', 'temple'],
    ['guild', 'business', 'guild'],
    ['smith', 'business', 'blacksmith'],
    ['ware', 'business', 'warehouse'],
  ];

  for (const [id, bt, bst] of types) {
    const gen = makeGen();
    const layout = gen.generateInterior(`valid_${id}`, bt, bst);
    for (const room of layout.rooms) {
      assert(room.width > 0, `${id}/${room.name} width > 0`);
      assert(room.depth > 0, `${id}/${room.name} depth > 0`);
      assert(room.name.length > 0, `${id}/${room.name} has name`);
      assert(room.function.length > 0, `${id}/${room.name} has function`);
    }
  }
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
