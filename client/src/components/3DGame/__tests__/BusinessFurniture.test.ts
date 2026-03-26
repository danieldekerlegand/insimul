/**
 * Tests for business-specific furniture and new furniture types.
 *
 * Verifies that:
 * - New procedural furniture types (oven, loom, display_case, lectern, throne,
 *   bed_single, bed_double, desk, cauldron, weapon_rack, armor_stand) generate meshes
 * - Business-specific furniture matches expectations (bakery, blacksmith, church, etc.)
 * - Minimum furniture counts are enforced (4 ground floor, 2 upper floor)
 * - Collision meshes are set on all furniture
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BusinessFurniture.test.ts
 */

import { Scene, Mesh, Vector3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { FurnitureModelLoader, FurnitureTemplate } from '../FurnitureModelLoader';
import { PROCEDURAL_FURNITURE_TYPES } from '../FurnitureModelLoader';

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

function makeMockLoader(types: string[]): FurnitureModelLoader {
  return {
    hasTemplate(type: string) { return types.includes(type); },
    getTemplate(type: string) {
      if (!types.includes(type)) return undefined;
      return { mesh: new Mesh(`${type}_template`) as any, originalHeight: 1, originalWidth: 1, originalDepth: 1 } as FurnitureTemplate;
    },
    getLoadedTypes() { return types; },
    cloneForFurniture(type: string, name: string) {
      if (!types.includes(type)) return null;
      const m = new Mesh(name) as any;
      m.scaling = new Vector3(1, 1, 1) as any;
      return m;
    },
    loadAll: async () => {},
    dispose: () => {},
  } as any;
}

// ── Tests ──

console.log('\n=== Business-Specific Furniture Tests ===\n');

// --- New procedural furniture types ---

console.log('new procedural furniture types generate meshes:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Blacksmith should have anvil and weapon_rack
  const layout = gen.generateInterior('bld_blacksmith', 'business', 'blacksmith');
  const names = layout.furniture.map((f: any) => f.name);
  assert(names.some(n => n.includes('anvil')), 'blacksmith has anvil');
  assert(names.some(n => n.includes('weapon_rack')), 'blacksmith has weapon_rack');
  assert(names.some(n => n.includes('workbench')), 'blacksmith has workbench');
  assert(names.some(n => n.includes('forge')), 'blacksmith has forge');
}

// --- Church / temple furniture ---

console.log('\nchurch/temple furniture:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('bld_church', 'business', 'church');
  const names = layout.furniture.map((f: any) => f.name);
  assert(names.some(n => n.includes('altar')), 'church has altar');
  assert(names.some(n => n.includes('pew')), 'church has pews');
  assert(names.some(n => n.includes('lectern')), 'church has lectern');
  assert(names.some(n => n.includes('pillar')), 'church has pillars');
}

// --- Bakery furniture ---

console.log('\nbakery furniture:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('bld_bakery', 'business', 'bakery');
  const names = layout.furniture.map((f: any) => f.name);
  assert(names.some(n => n.includes('oven')), 'bakery has oven');
  assert(names.some(n => n.includes('counter')), 'bakery has counter');
  assert(names.some(n => n.includes('display_case')), 'bakery has display_case');
}

// --- Library furniture ---

console.log('\nlibrary furniture:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('bld_library', 'business', 'library');
  const names = layout.furniture.map((f: any) => f.name);
  assert(names.some(n => n.includes('bookshelf')), 'library has bookshelves');
  assert(names.some(n => n.includes('desk')), 'library has desks');
  assert(names.some(n => n.includes('chair')), 'library has chairs');
}

// --- Minimum furniture count enforcement ---

console.log('\nminimum furniture counts:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Residence has ground floor rooms — each should have >= 4 items
  const layout = gen.generateInterior('bld_res_min', 'residence');
  assert(layout.furniture.length >= 4, `residence ground floor has >= 4 furniture (got ${layout.furniture.length})`);
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // A 2-floor building — upper floor rooms should have >= 2 items
  const layout = gen.generateInterior('bld_tavern_min', 'business', 'tavern');
  assert(layout.furniture.length >= 6, `tavern has substantial furniture (got ${layout.furniture.length})`);
}

// --- All furniture has collision enabled ---

console.log('\ncollision meshes:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('bld_coll', 'business', 'blacksmith');
  const allHaveCollision = layout.furniture.every((f: any) => f.checkCollisions === true);
  assert(allHaveCollision, 'all furniture has checkCollisions enabled');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const layout = gen.generateInterior('bld_coll2', 'business', 'bakery');
  const allHaveCollision = layout.furniture.every((f: any) => f.checkCollisions === true);
  assert(allHaveCollision, 'bakery furniture all has checkCollisions enabled');
}

// --- PROCEDURAL_FURNITURE_TYPES export ---

console.log('\nprocedural furniture types export:');

{
  assert(PROCEDURAL_FURNITURE_TYPES.includes('oven'), 'oven in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('loom'), 'loom in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('display_case'), 'display_case in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('lectern'), 'lectern in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('throne'), 'throne in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('weapon_rack'), 'weapon_rack in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('armor_stand'), 'armor_stand in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('desk'), 'desk in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('cauldron'), 'cauldron in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('bed_single'), 'bed_single in procedural types');
  assert(PROCEDURAL_FURNITURE_TYPES.includes('bed_double'), 'bed_double in procedural types');
}

// --- Business types produce business-specific furniture ---

console.log('\nbusiness types produce specific furniture:');

const businessTests: Array<{ type: string; expected: string[] }> = [
  { type: 'blacksmith', expected: ['anvil', 'weapon_rack', 'workbench'] },
  { type: 'church', expected: ['altar', 'pew', 'lectern'] },
  { type: 'bakery', expected: ['oven', 'counter', 'display_case'] },
  { type: 'tavern', expected: ['counter', 'stool', 'barrel'] },
  { type: 'warehouse', expected: ['crate', 'barrel', 'shelf'] },
];

for (const { type, expected } of businessTests) {
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior(`bld_${type}`, 'business', type);
  const names = layout.furniture.map((f: any) => f.name);

  for (const exp of expected) {
    assert(names.some(n => n.includes(exp)), `${type} has ${exp}`);
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
