/**
 * Tests for InteriorDecorationGenerator.
 *
 * Verifies that:
 * - Decorations are generated for all building types
 * - 3-6 decorations per room based on room function and building type
 * - Rugs appear in living rooms and bedrooms of residences
 * - Taverns get shields, banners, and animal heads
 * - Shops get display signs and price lists
 * - Churches get religious icons and stained glass
 * - Decorations are non-colliding (checkCollisions=false, isPickable=false)
 * - Wall decorations are placed at eye height (Y~2m)
 * - Decoration metadata marks isDecoration=true
 * - Deterministic output with same building ID
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/InteriorDecorationGenerator.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import {
  InteriorDecorationGenerator,
  getDecorationPool,
  hashString,
  seededRandom,
  RUG_PALETTES,
} from '../InteriorDecorationGenerator';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { RoomZone } from '../BuildingInteriorGenerator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.error(`  \u2717 ${message}`);
  }
}

function makeScene(): any {
  return new Scene();
}

function makeRoom(overrides: Partial<RoomZone> = {}): RoomZone {
  return {
    name: 'room_0',
    function: 'living',
    offsetX: 0,
    offsetZ: 0,
    offsetY: 0,
    width: 8,
    depth: 6,
    floor: 0,
    ...overrides,
  };
}

// ── Tests ──

console.log('\n=== InteriorDecorationGenerator Tests ===\n');

// --- Seeded RNG determinism ---

console.log('seeded RNG:');

{
  const rng1 = seededRandom(12345);
  const rng2 = seededRandom(12345);
  const vals1 = [rng1(), rng1(), rng1()];
  const vals2 = [rng2(), rng2(), rng2()];
  assert(
    vals1[0] === vals2[0] && vals1[1] === vals2[1] && vals1[2] === vals2[2],
    'same seed produces same sequence',
  );

  const rng3 = seededRandom(99999);
  const val3 = rng3();
  assert(val3 !== vals1[0], 'different seed produces different values');
}

// --- Hash string consistency ---

console.log('\nhash string:');

{
  const h1 = hashString('test_building_room_0_decor');
  const h2 = hashString('test_building_room_0_decor');
  assert(h1 === h2, 'same string produces same hash');
  assert(h1 > 0, 'hash is positive');

  const h3 = hashString('different_string');
  assert(h3 !== h1, 'different strings produce different hashes');
}

// --- Decoration pool selection ---

console.log('\ndecoration pool selection:');

{
  // Residence living room
  const residencePool = getDecorationPool('living', 'residential', 'residence', undefined);
  assert(residencePool.rugs === true, 'residence living room gets rugs');
  assert(residencePool.wallDecor.length > 0, 'residence has wall decorations');
  assert(
    residencePool.wallDecor.some(d => d.type === 'painting') || residencePool.wallDecor.some(d => d.type === 'mirror'),
    'residence wall decor includes paintings or mirrors',
  );

  // Residence bedroom
  const bedroomPool = getDecorationPool('bedroom', 'residential', 'residence', undefined);
  assert(bedroomPool.rugs === true, 'residence bedroom gets rugs');

  // Tavern
  const tavernPool = getDecorationPool('tavern_main', undefined, 'building', 'Tavern');
  assert(tavernPool.wallDecor.some(d => d.type === 'shield'), 'tavern has shields');
  assert(tavernPool.wallDecor.some(d => d.type === 'banner'), 'tavern has banners');
  assert(tavernPool.wallDecor.some(d => d.type === 'animal_head'), 'tavern has animal heads');

  // Church
  const churchPool = getDecorationPool('altar', undefined, 'building', 'Church');
  assert(churchPool.rugs === true, 'church altar room gets rugs');
  assert(churchPool.wallDecor.some(d => d.type === 'religious_icon'), 'church has religious icons');
  assert(churchPool.wallDecor.some(d => d.type === 'stained_glass'), 'church has stained glass');

  // Shop
  const shopPool = getDecorationPool('shop', 'commercial_retail', 'building', 'Shop');
  assert(shopPool.rugs === false, 'shop does not get rugs');
  assert(shopPool.wallDecor.some(d => d.type === 'display_sign'), 'shop has display signs');
  assert(shopPool.wallDecor.some(d => d.type === 'price_list'), 'shop has price lists');
}

// --- Decoration count per room ---

console.log('\ndecoration count per room:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;

  // Test multiple building types
  const testCases = [
    { buildingType: 'residence', businessType: undefined, roomFn: 'living' },
    { buildingType: 'building', businessType: 'Tavern', roomFn: 'tavern_main' },
    { buildingType: 'building', businessType: 'Church', roomFn: 'altar' },
    { buildingType: 'building', businessType: 'Shop', roomFn: 'shop' },
  ];

  for (const tc of testCases) {
    const rooms = [makeRoom({ function: tc.roomFn })];
    const decorations = gen.generateDecorations(
      `test_${tc.businessType || tc.buildingType}`,
      position as any,
      rooms,
      4,
      tc.buildingType,
      tc.businessType,
    );
    const label = tc.businessType || tc.buildingType;
    assert(decorations.length >= 3, `${label}: at least 3 decorations (got ${decorations.length})`);
    assert(decorations.length <= 6, `${label}: at most 6 decorations (got ${decorations.length})`);
  }
}

// --- Decoration metadata ---

console.log('\ndecoration metadata:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'living' })];

  const decorations = gen.generateDecorations('meta_test', position as any, rooms, 4, 'residence');

  for (const mesh of decorations) {
    assert(mesh.metadata?.isDecoration === true, `${mesh.name}: isDecoration metadata is true`);
    assert(typeof mesh.metadata?.decorationType === 'string', `${mesh.name}: has decorationType string`);
    assert(mesh.checkCollisions === false, `${mesh.name}: checkCollisions is false`);
    assert(mesh.isPickable === false, `${mesh.name}: isPickable is false`);
  }
}

// --- Rugs in eligible rooms ---

console.log('\nrug placement:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;

  // Living room should have rugs
  const livingRooms = [makeRoom({ function: 'living' })];
  const livingDecor = gen.generateDecorations('rug_test_living', position as any, livingRooms, 4, 'residence');
  const livingRugs = livingDecor.filter(m => m.metadata?.decorationType === 'rug');
  assert(livingRugs.length >= 1, `living room has rugs (got ${livingRugs.length})`);
  assert(livingRugs.length <= 2, `living room has at most 2 rugs (got ${livingRugs.length})`);

  // Bedroom should have rugs
  const bedroomRooms = [makeRoom({ function: 'bedroom', name: 'bedroom_0' })];
  const bedroomDecor = gen.generateDecorations('rug_test_bedroom', position as any, bedroomRooms, 4, 'residence');
  const bedroomRugs = bedroomDecor.filter(m => m.metadata?.decorationType === 'rug');
  assert(bedroomRugs.length >= 1, `bedroom has rugs (got ${bedroomRugs.length})`);

  // Rug meshes should be near floor level
  for (const rug of livingRugs) {
    assert(rug.position.y < position.y + 0.5, `rug is near floor level (y=${rug.position.y})`);
  }

  // Shop should not have rugs
  const shopRooms = [makeRoom({ function: 'shop', name: 'shop_0' })];
  const shopDecor = gen.generateDecorations('rug_test_shop', position as any, shopRooms, 4, 'building', 'Shop');
  const shopRugs = shopDecor.filter(m => m.metadata?.decorationType === 'rug');
  assert(shopRugs.length === 0, 'shop has no rugs');
}

// --- Wall decorations at eye height ---

console.log('\nwall decoration placement:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'tavern_main' })];

  const decorations = gen.generateDecorations('wall_test', position as any, rooms, 4, 'building', 'Tavern');
  const wallTypes = new Set(['shield', 'banner', 'animal_head', 'painting', 'mirror',
    'religious_icon', 'stained_glass', 'display_sign', 'price_list']);
  const wallDecor = decorations.filter(m => wallTypes.has(m.metadata?.decorationType));

  assert(wallDecor.length > 0, `tavern has wall decorations (got ${wallDecor.length})`);
  for (const wd of wallDecor) {
    // Wall decorations should be near Y=2m above room floor
    const relativeY = wd.position.y - position.y;
    assert(
      relativeY >= 1.5 && relativeY <= 2.5,
      `${wd.name}: wall decor at eye height (relY=${relativeY.toFixed(2)})`,
    );
  }
}

// --- Tavern-specific decorations ---

console.log('\ntavern decorations:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'tavern_main', name: 'main' })];

  const decorations = gen.generateDecorations('tavern_decor', position as any, rooms, 4, 'building', 'Tavern');
  const types = new Set(decorations.map(m => m.metadata?.decorationType));

  // Tavern should have some combination of shields, banners, animal heads, candles, lanterns
  const tavernTypes = ['shield', 'banner', 'animal_head', 'candle_holder', 'lantern'];
  const hasTavernDecor = tavernTypes.some(t => types.has(t));
  assert(hasTavernDecor, `tavern has tavern-specific decorations (types: ${[...types].join(', ')})`);
}

// --- Church-specific decorations ---

console.log('\nchurch decorations:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'altar', name: 'altar_0' })];

  const decorations = gen.generateDecorations('church_decor', position as any, rooms, 4, 'building', 'Church');
  const types = new Set(decorations.map(m => m.metadata?.decorationType));

  const churchTypes = ['religious_icon', 'stained_glass', 'candle_holder', 'rug'];
  const hasChurchDecor = churchTypes.some(t => types.has(t));
  assert(hasChurchDecor, `church has church-specific decorations (types: ${[...types].join(', ')})`);
}

// --- Shop-specific decorations ---

console.log('\nshop decorations:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'shop', name: 'shop_0' })];

  const decorations = gen.generateDecorations('shop_decor', position as any, rooms, 4, 'building', 'Shop');
  const types = new Set(decorations.map(m => m.metadata?.decorationType));

  const shopTypes = ['display_sign', 'price_list', 'lantern', 'flower_pot'];
  const hasShopDecor = shopTypes.some(t => types.has(t));
  assert(hasShopDecor, `shop has shop-specific decorations (types: ${[...types].join(', ')})`);
}

// --- Ambient props ---

console.log('\nambient props:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'living' })];

  const decorations = gen.generateDecorations('ambient_test', position as any, rooms, 4, 'residence');
  const ambientTypes = ['candle_holder', 'flower_pot', 'lantern'];
  const ambientDecor = decorations.filter(m => ambientTypes.includes(m.metadata?.decorationType));
  assert(ambientDecor.length > 0, `room has ambient props (got ${ambientDecor.length})`);
}

// --- Deterministic output ---

console.log('\ndeterministic output:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms = [makeRoom({ function: 'living' })];

  const d1 = gen.generateDecorations('determinism_test', position as any, rooms, 4, 'residence');
  const d2 = gen.generateDecorations('determinism_test', position as any, rooms, 4, 'residence');

  assert(d1.length === d2.length, 'same input produces same count');
  for (let i = 0; i < d1.length; i++) {
    assert(
      d1[i].metadata?.decorationType === d2[i].metadata?.decorationType,
      `decoration ${i} type matches: ${d1[i].metadata?.decorationType}`,
    );
  }
}

// --- Multi-room interior ---

console.log('\nmulti-room interior:');

{
  const scene = makeScene();
  const gen = new InteriorDecorationGenerator(scene as any);
  const position = new Vector3(0, 500, 0) as any;
  const rooms: RoomZone[] = [
    makeRoom({ name: 'living_0', function: 'living', offsetX: -3, width: 6, depth: 6 }),
    makeRoom({ name: 'kitchen_0', function: 'kitchen', offsetX: 3, width: 6, depth: 6 }),
    makeRoom({ name: 'bedroom_0', function: 'bedroom', offsetX: 0, offsetY: 4, width: 8, depth: 6, floor: 1 }),
  ];

  const decorations = gen.generateDecorations('multi_room', position as any, rooms, 4, 'residence');
  assert(decorations.length >= 9, `multi-room: at least 9 total decorations (got ${decorations.length})`);
  assert(decorations.length <= 18, `multi-room: at most 18 total decorations (got ${decorations.length})`);

  // Each room should have decorations
  const livingDecor = decorations.filter(m => m.name.includes('living_0'));
  const kitchenDecor = decorations.filter(m => m.name.includes('kitchen_0'));
  const bedroomDecor = decorations.filter(m => m.name.includes('bedroom_0'));
  assert(livingDecor.length > 0, 'living room has decorations');
  assert(kitchenDecor.length > 0, 'kitchen has decorations');
  assert(bedroomDecor.length > 0, 'bedroom has decorations');
}

// --- Integration with BuildingInteriorGenerator ---

console.log('\nintegration with BuildingInteriorGenerator:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('decor_integration', 'residence');

  const decorMeshes = layout.furniture.filter(
    (m: any) => m.metadata?.isDecoration === true,
  );
  assert(decorMeshes.length > 0, `integrated: residence has decoration meshes (got ${decorMeshes.length})`);
  assert(
    decorMeshes.every((m: any) => m.checkCollisions === false),
    'all decoration meshes have checkCollisions=false',
  );
}

// ── Summary ──

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) process.exit(1);
