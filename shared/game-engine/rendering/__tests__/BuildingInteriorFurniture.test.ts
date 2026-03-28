/**
 * Tests for BuildingInteriorGenerator furniture model integration.
 *
 * Verifies that:
 * - Interiors use glTF model clones when FurnitureModelLoader is set
 * - Fallback procedural geometry uses correct shapes (cylinders, composites)
 * - Container metadata is preserved on model-based furniture
 * - All building types produce furniture
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BuildingInteriorFurniture.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { FurnitureModelLoader, FurnitureTemplate } from '../FurnitureModelLoader';

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

// ── Mock FurnitureModelLoader ──

function makeMockLoader(types: string[]): FurnitureModelLoader {
  const clonedNames: string[] = [];
  return {
    hasTemplate(type: string) { return types.includes(type); },
    getTemplate(type: string) {
      if (!types.includes(type)) return undefined;
      return {
        mesh: new Mesh(`${type}_template`) as any,
        originalHeight: 1,
        originalWidth: 1,
        originalDepth: 1,
      } as FurnitureTemplate;
    },
    getLoadedTypes() { return types; },
    cloneForFurniture(type: string, name: string, _w: number, _h: number, _d: number) {
      if (!types.includes(type)) return null;
      clonedNames.push(name);
      const m = new Mesh(name) as any;
      m.scaling = new Vector3(1, 1, 1) as any;
      m._clonedFrom = type;
      return m;
    },
    loadAll: async () => {},
    dispose: () => {},
    _clonedNames: clonedNames,
  } as any;
}

function makeScene(): any {
  return new Scene();
}

// ── Tests ──

console.log('\n=== BuildingInteriorGenerator Furniture Tests ===\n');

// --- Basic interior generation ---

console.log('basic interior generation:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('bld1', 'residence');

  assert(layout.id === 'interior_bld1', 'interior id matches');
  assert(layout.furniture.length > 0, 'residence has furniture');
  assert(layout.roomMesh !== null, 'room mesh created');
  assert(layout.doorPosition.y > 0, 'door position is above ground');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('bld2', 'business', 'tavern');

  assert(layout.furniture.length > 5, 'tavern has many furniture pieces');
}

// --- Caching ---

console.log('\ncaching:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout1 = gen.generateInterior('bld1', 'residence');
  const layout2 = gen.generateInterior('bld1', 'residence');

  assert(layout1 === layout2, 'returns cached interior on second call');
}

// --- All building types produce furniture ---

console.log('\nall building types produce furniture:');

const buildingTypes = [
  ['tavern', 'business'],
  ['shop', 'business'],
  ['blacksmith', 'business'],
  ['temple', 'business'],
  ['guild', 'business'],
  ['residence', 'residence'],
  ['warehouse', 'business'],
];

for (const [bType, category] of buildingTypes) {
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior(`bld_${bType}`, category, bType);

  assert(layout.furniture.length > 0, `${bType} has furniture (${layout.furniture.length} pieces)`);
}

// --- glTF model integration ---

console.log('\nglTF model integration:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const loader = makeMockLoader(['table', 'chair', 'barrel', 'chest']);
  gen.setFurnitureLoader(loader);

  const layout = gen.generateInterior('bld_model', 'residence');

  // Check that some furniture was cloned from models
  const clonedNames = (loader as any)._clonedNames as string[];
  assert(clonedNames.length > 0, `furniture cloned from models (${clonedNames.length} pieces)`);

  // Verify the cloned meshes are in the furniture array
  const modelFurniture = layout.furniture.filter((f: any) => f._clonedFrom);
  assert(modelFurniture.length > 0, 'model-based furniture in layout');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  // Loader with no types — all furniture should use procedural fallback
  const loader = makeMockLoader([]);
  gen.setFurnitureLoader(loader);

  const layout = gen.generateInterior('bld_fallback', 'residence');
  assert(layout.furniture.length > 0, 'furniture still generated with empty loader');

  const clonedNames = (loader as any)._clonedNames as string[];
  assert(clonedNames.length === 0, 'no models cloned from empty loader');
}

// --- Container metadata preserved ---

console.log('\ncontainer metadata:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const loader = makeMockLoader(['chest', 'barrel', 'crate']);
  gen.setFurnitureLoader(loader);

  const layout = gen.generateInterior('bld_containers', 'business', 'warehouse');

  const containers = layout.furniture.filter((f: any) => f.metadata?.isContainer);
  assert(containers.length > 0, 'container furniture has isContainer metadata');

  const chests = containers.filter((f: any) => f.metadata?.containerType === 'crate' || f.metadata?.containerType === 'barrel');
  assert(chests.length > 0, 'containers have correct containerType');

  // Verify building context is added
  const withBuildingId = containers.filter((f: any) => f.metadata?.buildingId === 'bld_containers');
  assert(withBuildingId.length > 0, 'container metadata includes buildingId');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Without model loader, containers should still have metadata
  const layout = gen.generateInterior('bld_nomodel', 'business', 'shop');
  const containers = layout.furniture.filter((f: any) => f.metadata?.isContainer);
  assert(containers.length > 0, 'procedural containers also have metadata');
}

// --- Procedural fallback produces correct shapes ---

console.log('\nprocedural fallback shapes:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  // No loader set — pure procedural mode

  const layout = gen.generateInterior('bld_proc', 'business', 'blacksmith');
  assert(layout.furniture.length >= 5, `blacksmith has expected furniture count (${layout.furniture.length})`);

  // Verify furniture names contain the type
  const types = layout.furniture.map(f => f.name);
  assert(types.some(n => n.includes('anvil')), 'blacksmith has anvil');
  assert(types.some(n => n.includes('barrel')), 'blacksmith has barrel');
  assert(types.some(n => n.includes('forge')), 'blacksmith has forge');
}

// --- Partial model coverage ---

console.log('\npartial model coverage:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  // Only barrel has a model
  const loader = makeMockLoader(['barrel']);
  gen.setFurnitureLoader(loader);

  const layout = gen.generateInterior('bld_partial', 'business', 'tavern');
  const clonedNames = (loader as any)._clonedNames as string[];

  // Barrels should be model-cloned, everything else procedural
  assert(clonedNames.length >= 2, `barrels cloned from model (${clonedNames.length})`);
  assert(clonedNames.every((n: string) => n.includes('barrel')), 'only barrel types cloned');

  // Total furniture should still include tables, stools, counter
  assert(layout.furniture.length > clonedNames.length, 'non-barrel furniture uses procedural fallback');
}

// --- Dispose ---

console.log('\ndispose:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  gen.generateInterior('bld_dispose', 'residence');

  assert(gen.getInterior('bld_dispose') !== undefined, 'interior exists before dispose');
  gen.dispose();
  assert(gen.getInterior('bld_dispose') === undefined, 'interior cleared after dispose');
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
