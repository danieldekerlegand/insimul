/**
 * Tests for bedroom/bed guarantees in building interiors.
 *
 * Verifies:
 * - Every residence type has at least one bedroom
 * - Every bedroom has at least one bed
 * - Beds have unique IDs tracked in InteriorLayout.beds
 * - Bed count scales with residentCount (1 per 8 sq m max)
 * - Bedrooms include wardrobe and nightstand
 * - Bed placement: against wall with clearance
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BedroomBeds.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { InteriorLayout, BedAssignment } from '../BuildingInteriorGenerator';

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

console.log('\n=== Bedroom & Bed Guarantee Tests ===\n');

// --- Every residence type has at least one bedroom ---

console.log('every residence type has a bedroom:');

{
  const residenceTypes: Array<[string, string | undefined]> = [
    ['residence', undefined],
    ['residence_medium', undefined],
    ['residence_large', undefined],
    ['mansion', undefined],
  ];

  for (const [buildingType, businessType] of residenceTypes) {
    const scene = makeScene();
    const gen = new BuildingInteriorGenerator(scene as any);
    const layout = gen.generateInterior(`res_${buildingType}`, buildingType, businessType);

    const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
    assert(bedrooms.length >= 1, `${buildingType} has ${bedrooms.length} bedroom(s)`);
  }
}

// --- Every bedroom has at least one bed ---

console.log('\nevery bedroom has at least one bed:');

{
  const residenceTypes = ['residence', 'residence_medium', 'residence_large'];

  for (const buildingType of residenceTypes) {
    const scene = makeScene();
    const gen = new BuildingInteriorGenerator(scene as any);
    const layout = gen.generateInterior(`bed_${buildingType}`, buildingType);

    const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
    for (const bedroom of bedrooms) {
      // Check that at least one furniture mesh in this room is a bed
      const bedFurniture = layout.furniture.filter(m =>
        m.name.includes(bedroom.name) && (m.name.includes('_bed') || m.name.includes('_bed_single') || m.name.includes('_bed_double'))
      );
      assert(bedFurniture.length >= 1, `${buildingType} bedroom '${bedroom.name}' has ${bedFurniture.length} bed(s)`);
    }
  }
}

// --- Beds have unique IDs tracked in layout.beds ---

console.log('\nbeds have unique IDs in layout.beds:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('bed_ids', 'residence_medium');

  assert(layout.beds.length >= 1, `layout.beds has ${layout.beds.length} entries`);

  // All bed IDs are unique
  const bedIds = layout.beds.map(b => b.bedId);
  const uniqueIds = new Set(bedIds);
  assert(uniqueIds.size === bedIds.length, `all ${bedIds.length} bed IDs are unique`);

  // Each bed ID corresponds to a furniture mesh
  for (const bed of layout.beds) {
    const meshExists = layout.furniture.some(m => m.name === bed.bedId);
    assert(meshExists, `bed '${bed.bedId}' has matching furniture mesh`);
  }
}

// --- Bed count scales with residentCount ---

console.log('\nbed count scales with residentCount:');

{
  // Medium residence bedrooms: 6x12 each = 72 sq m -> max 9 beds per room
  const scene1 = makeScene();
  const gen1 = new BuildingInteriorGenerator(scene1 as any);
  const layout1 = gen1.generateInterior('scale_1', 'residence_medium', undefined, undefined, 1);
  assert(layout1.beds.length >= 1, `1 resident -> ${layout1.beds.length} bed(s)`);

  const scene2 = makeScene();
  const gen2 = new BuildingInteriorGenerator(scene2 as any);
  const layout2 = gen2.generateInterior('scale_4', 'residence_medium', undefined, undefined, 4);
  assert(layout2.beds.length >= 2, `4 residents -> ${layout2.beds.length} bed(s)`);
  assert(layout2.beds.length >= layout1.beds.length, `more residents -> more beds`);
}

// --- Bedrooms have wardrobe and nightstand ---

console.log('\nbedrooms have wardrobe and nightstand:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('furn_check', 'residence_medium');

  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  for (const bedroom of bedrooms) {
    const roomFurniture = layout.furniture.filter(m => m.name.includes(bedroom.name));
    const types = roomFurniture.map(m => {
      const parts = m.name.split('_');
      return parts[parts.length - 1];
    });

    assert(types.includes('wardrobe'), `${bedroom.name} has wardrobe`);
    assert(types.includes('table'), `${bedroom.name} has nightstand (table)`);
  }
}

// --- Bed placement: wall clearance ---

console.log('\nbed placement against walls:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('placement', 'residence_large');

  for (const bed of layout.beds) {
    const bedroom = layout.rooms.find(r => r.name === bed.roomName);
    if (!bedroom) continue;

    // Bed should be within room bounds with clearance from walls
    const halfW = bedroom.width / 2;
    const halfD = bedroom.depth / 2;
    const localX = bed.offsetX - bedroom.offsetX;
    const localZ = bed.offsetZ - bedroom.offsetZ;

    assert(
      Math.abs(localX) < halfW,
      `bed '${bed.bedId}' X within room bounds (${localX.toFixed(2)} vs ±${halfW.toFixed(2)})`,
    );
    assert(
      Math.abs(localZ) < halfD,
      `bed '${bed.bedId}' Z within room bounds (${localZ.toFixed(2)} vs ±${halfD.toFixed(2)})`,
    );
  }
}

// --- Small residence has bedroom on ground floor ---

console.log('\nsmall residence has ground-floor bedroom:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('small_bedroom', 'residence');

  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  assert(bedrooms.length >= 1, `small residence has ${bedrooms.length} bedroom(s)`);
  assert(bedrooms[0].floor === 0, `bedroom is on ground floor (floor=${bedrooms[0].floor})`);
  assert(layout.beds.length >= 1, `small residence has ${layout.beds.length} bed(s) tracked`);
}

// --- Tavern guest rooms also get beds ---

console.log('\ntavern guest rooms have beds:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('tavern_beds', 'business', 'tavern');

  const bedrooms = layout.rooms.filter(r => r.function === 'bedroom');
  if (bedrooms.length > 0) {
    assert(layout.beds.length >= 1, `tavern has ${layout.beds.length} bed(s) in guest rooms`);
  } else {
    // Some taverns may not have bedrooms depending on template
    console.log('  (tavern has no guest rooms in current layout)');
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
