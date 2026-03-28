/**
 * Tests for wealth-aware residence furnishing in BuildingInteriorGenerator.
 *
 * Verifies:
 * - All residences get minimum furniture: 1 bed, 1 table, 1 chair, 1 storage item
 * - Poor tier: minimal furniture, bare floors (no rugs)
 * - Middle tier: standard furniture + bookshelf, rug, additional chairs
 * - Wealthy tier: ornate furniture, decorations, multiple bookshelves/wardrobes, curtains
 * - Family size affects bed count, table/chair count, kitchen size
 * - Kitchen always has counter + barrel/crate food storage
 * - Living area has table + chairs matching resident count
 * - Fireplace in cottages/houses (not mansions)
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/ResidenceFurnishing.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { InteriorLayout, WealthTier } from '../BuildingInteriorGenerator';

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

/** Extract furniture type names from a layout, optionally filtering by room name */
function getFurnitureTypes(layout: InteriorLayout, roomName?: string): string[] {
  const items = roomName
    ? layout.furniture.filter(m => m.name.includes(roomName))
    : layout.furniture;
  return items.map(m => {
    const parts = m.name.split('_');
    return parts[parts.length - 1];
  });
}

/** Check if any furniture mesh name contains the given type substring */
function hasFurnitureType(layout: InteriorLayout, type: string, roomName?: string): boolean {
  const items = roomName
    ? layout.furniture.filter(m => m.name.includes(roomName))
    : layout.furniture;
  return items.some(m => m.name.includes(`_${type}`));
}

function generateResidence(
  buildingType: string,
  residentCount: number,
  wealthTier: WealthTier,
  id?: string,
): InteriorLayout {
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  return gen.generateInterior(
    id ?? `res_${buildingType}_${wealthTier}_${residentCount}`,
    buildingType, undefined, undefined, residentCount, wealthTier,
  );
}

// ── Tests ──

console.log('\n=== Residence Furnishing Tests ===\n');

// --- Minimum furniture for all residences ---

console.log('all residences have minimum furniture (1 bed, 1 table, 1 chair, 1 storage):');

{
  const configs: Array<[string, WealthTier]> = [
    ['residence', 'poor'],
    ['residence', 'middle'],
    ['residence', 'wealthy'],
    ['residence_medium', 'poor'],
    ['residence_medium', 'middle'],
    ['residence_large', 'wealthy'],
    ['mansion', 'wealthy'],
  ];

  for (const [buildingType, tier] of configs) {
    const layout = generateResidence(buildingType, 2, tier, `min_${buildingType}_${tier}`);
    const allTypes = getFurnitureTypes(layout);

    const hasBed = layout.furniture.some(m =>
      m.name.includes('_bed') || m.name.includes('_bed_single') || m.name.includes('_bed_double'),
    );
    const hasTable = allTypes.includes('table');
    const hasChair = allTypes.includes('chair');
    const hasStorage = allTypes.includes('wardrobe') || allTypes.includes('chest')
      || allTypes.includes('barrel') || allTypes.includes('crate');

    assert(hasBed, `${buildingType}/${tier} has at least 1 bed`);
    assert(hasTable, `${buildingType}/${tier} has at least 1 table`);
    assert(hasChair, `${buildingType}/${tier} has at least 1 chair`);
    assert(hasStorage, `${buildingType}/${tier} has at least 1 storage item`);
  }
}

// --- Poor tier: minimal furniture, no rugs ---

console.log('\npoor tier has minimal furniture, no rugs:');

{
  const layout = generateResidence('residence_medium', 2, 'poor');
  const allTypes = getFurnitureTypes(layout);

  // Poor should NOT have rugs
  assert(!allTypes.includes('rug'), 'poor residence has no rugs');
  // Poor should NOT have bookshelves
  assert(!hasFurnitureType(layout, 'bookshelf', 'living'), 'poor living room has no bookshelf');
  // Poor bedrooms should use chest instead of wardrobe
  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  for (const br of bedrooms) {
    const hasChest = hasFurnitureType(layout, 'chest', br.name);
    assert(hasChest, `poor bedroom '${br.name}' uses chest for storage`);
  }
}

// --- Middle tier adds bookshelf, additional chairs ---

console.log('\nmiddle tier adds bookshelf:');

{
  const layout = generateResidence('residence_medium', 3, 'middle');

  // Middle living room should have bookshelf
  assert(hasFurnitureType(layout, 'bookshelf', 'living'), 'middle living room has bookshelf');

  // Middle bedrooms should use wardrobe
  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  for (const br of bedrooms) {
    assert(hasFurnitureType(layout, 'wardrobe', br.name), `middle bedroom '${br.name}' has wardrobe`);
  }
}

// --- Wealthy tier adds decorations, extra wardrobes ---

console.log('\nwealthy tier adds decorations, extra wardrobes:');

{
  const layout = generateResidence('residence_large', 4, 'wealthy');

  // Wealthy should have decorations (across all rooms)
  const hasDecoration = layout.furniture.some(m => m.name.includes('_decoration'));
  assert(hasDecoration, 'wealthy residence has decorations');

  // Wealthy bedrooms should have multiple wardrobes
  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  if (bedrooms.length > 0) {
    const br = bedrooms[0];
    const wardrobes = layout.furniture.filter(m =>
      m.name.includes(br.name) && m.name.includes('wardrobe'),
    );
    assert(wardrobes.length >= 2, `wealthy bedroom '${br.name}' has ${wardrobes.length} wardrobes`);
  }

  // Wealthy should have bookshelf somewhere in the residence
  const hasBookshelf = layout.furniture.some(m => m.name.includes('bookshelf'));
  assert(hasBookshelf, 'wealthy residence has bookshelf');
}

// --- Family size affects bed count ---

console.log('\nfamily size affects bed count:');

{
  const layout1 = generateResidence('residence_medium', 1, 'middle', 'family_1');
  const layout4 = generateResidence('residence_medium', 4, 'middle', 'family_4');
  const layout8 = generateResidence('residence_medium', 8, 'middle', 'family_8');

  assert(layout1.beds.length >= 1, `1 resident -> ${layout1.beds.length} bed(s)`);
  assert(layout4.beds.length >= 2, `4 residents -> ${layout4.beds.length} bed(s)`);
  assert(layout8.beds.length >= layout4.beds.length, `8 residents -> ${layout8.beds.length} >= ${layout4.beds.length} beds`);
}

// --- Family size affects chair count ---

console.log('\nfamily size affects chair count in living room:');

{
  const layout2 = generateResidence('residence_medium', 2, 'middle', 'chairs_2');
  const layout6 = generateResidence('residence_medium', 6, 'middle', 'chairs_6');

  const chairs2 = layout2.furniture.filter(m =>
    m.name.includes('living') && m.name.includes('_chair'),
  ).length;
  const chairs6 = layout6.furniture.filter(m =>
    m.name.includes('living') && m.name.includes('_chair'),
  ).length;

  assert(chairs2 >= 2, `2 residents -> ${chairs2} chairs in living room`);
  assert(chairs6 >= chairs2, `6 residents -> ${chairs6} >= ${chairs2} chairs in living room`);
}

// --- Kitchen always has counter + barrel/crate ---

console.log('\nkitchen always has counter and barrel/crate:');

{
  const tiers: WealthTier[] = ['poor', 'middle', 'wealthy'];
  for (const tier of tiers) {
    const layout = generateResidence('residence_medium', 2, tier, `kitchen_${tier}`);
    const kitchenRoom = layout.rooms.find(r => r.function === 'kitchen');
    if (kitchenRoom) {
      assert(
        hasFurnitureType(layout, 'counter', kitchenRoom.name),
        `${tier} kitchen has counter`,
      );
      const hasBarrelOrCrate = hasFurnitureType(layout, 'barrel', kitchenRoom.name)
        || hasFurnitureType(layout, 'crate', kitchenRoom.name);
      assert(hasBarrelOrCrate, `${tier} kitchen has barrel or crate`);
    } else {
      // Small residence may have combined living/kitchen
      console.log(`  (${tier} kitchen: no separate kitchen room in this layout)`);
    }
  }
}

// --- Fireplace in cottages/houses ---

console.log('\nfireplace in cottages/houses:');

{
  // Small residence (cottage-like) should have fireplace
  const cottage = generateResidence('residence', 2, 'middle', 'fireplace_cottage');
  assert(
    hasFurnitureType(cottage, 'fireplace', 'living'),
    'small residence living room has fireplace',
  );

  // Medium house should have fireplace
  const house = generateResidence('residence_medium', 3, 'middle', 'fireplace_house');
  assert(
    hasFurnitureType(house, 'fireplace', 'living'),
    'medium residence living room has fireplace',
  );
}

// --- Wealthy kitchen has extra shelf ---

console.log('\nwealthy kitchen has extra furnishing:');

{
  const layout = generateResidence('residence_medium', 3, 'wealthy', 'wealthy_kitchen');
  const kitchenRoom = layout.rooms.find(r => r.function === 'kitchen');
  if (kitchenRoom) {
    const shelves = layout.furniture.filter(m =>
      m.name.includes(kitchenRoom.name) && m.name.includes('_shelf'),
    );
    assert(shelves.length >= 1, `wealthy kitchen has ${shelves.length} shelf/shelves`);
  }
}

// --- Wealthy bedrooms have larger beds (bed_double type) ---

console.log('\nwealthy bedrooms use larger beds:');

{
  const layout = generateResidence('residence_medium', 1, 'wealthy', 'wealthy_beds');
  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  if (bedrooms.length > 0) {
    // Single-occupancy wealthy bedrooms should have bed_double
    const hasBedDouble = layout.furniture.some(m =>
      m.name.includes(bedrooms[0].name) && m.name.includes('bed_double'),
    );
    assert(hasBedDouble, 'wealthy single-occupancy bedroom has bed_double');
  }
}

// --- Wealthy entry hall has decorations ---

console.log('\nwealthy entry hall has decorations:');

{
  const layout = generateResidence('residence_large', 4, 'wealthy', 'wealthy_entry');
  const entryHall = layout.rooms.find(r => r.function === 'entry_hall');
  if (entryHall) {
    assert(
      hasFurnitureType(layout, 'decoration', entryHall.name),
      'wealthy entry hall has decoration',
    );
    assert(
      hasFurnitureType(layout, 'bookshelf', entryHall.name),
      'wealthy entry hall has bookshelf',
    );
  } else {
    console.log('  (no entry hall in this layout)');
  }
}

// --- Poor entry hall has no rug ---

console.log('\npoor entry hall has no rug:');

{
  const layout = generateResidence('residence_large', 2, 'poor', 'poor_entry');
  const entryHall = layout.rooms.find(r => r.function === 'entry_hall');
  if (entryHall) {
    assert(
      !hasFurnitureType(layout, 'rug', entryHall.name),
      'poor entry hall has no rug',
    );
  } else {
    console.log('  (no entry hall in this layout)');
  }
}

// --- Dining room has table and shelf ---

console.log('\ndining room has table and sideboard:');

{
  const layout = generateResidence('residence_large', 4, 'middle', 'dining_test');

  const dining = layout.rooms.find(r => r.function === 'dining');
  if (dining) {
    assert(hasFurnitureType(layout, 'table', dining.name), 'dining room has table');
    assert(hasFurnitureType(layout, 'shelf', dining.name), 'dining room has sideboard/shelf');
  } else {
    console.log('  (no dining room in layout)');
  }
}

// --- Default wealth tier is middle when not specified ---

console.log('\ndefault wealth tier is middle when not specified:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('default_tier', 'residence_medium', undefined, undefined, 2);

  // Should have features of middle tier (bookshelf in living room, wardrobe in bedroom)
  assert(hasFurnitureType(layout, 'bookshelf', 'living'), 'default (no tier) living room has bookshelf (middle tier)');
  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  if (bedrooms.length > 0) {
    assert(hasFurnitureType(layout, 'wardrobe', bedrooms[0].name), 'default (no tier) bedroom has wardrobe (middle tier)');
  }
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
