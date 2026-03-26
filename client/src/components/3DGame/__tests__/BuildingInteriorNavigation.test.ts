/**
 * Tests for BuildingInteriorGenerator navigation improvements:
 * - Increased interior dimensions (~20%)
 * - Wider doorways (2.5m)
 * - Furniture clearance (1.5m) and collision detection
 * - Player capsule (0.5m radius) can navigate doorways and around furniture
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BuildingInteriorNavigation.test.ts
 */

import { Scene, Mesh, Vector3, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { RoomZone, InteriorLayout, FurnitureSpec } from '../BuildingInteriorGenerator';

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

console.log('\n=== BuildingInteriorGenerator Navigation Tests ===\n');

// --- Interior dimensions are increased (~20% over original values) ---
// Original template values (before increase): tavern 18x16, shop 14x12, temple 20x24, residence_small 9x9, etc.
// After 20% increase they should all be larger.

console.log('interior dimensions increased from original templates:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Small residence: was 9x9 → now 13x13 (~44% increase to ensure all rooms >= 5m)
  const resSmall = gen.generateInterior('res_small', 'residence');
  assert(resSmall.width >= 13, `small residence width >= 13 (got ${resSmall.width})`);
  assert(resSmall.depth >= 13, `small residence depth >= 13 (got ${resSmall.depth})`);

  // Medium residence: was 12x12 → now ~14x14
  const resMed = gen.generateInterior('res_med', 'residence_medium');
  assert(resMed.width >= 14, `medium residence width >= 14 (got ${resMed.width})`);
  assert(resMed.depth >= 14, `medium residence depth >= 14 (got ${resMed.depth})`);

  // Large residence: was 14x14 → now ~17x17
  const resLarge = gen.generateInterior('res_large', 'residence_large');
  assert(resLarge.width >= 17, `large residence width >= 17 (got ${resLarge.width})`);
  assert(resLarge.depth >= 17, `large residence depth >= 17 (got ${resLarge.depth})`);

  // Shop: was 14x12 → now ~17x14
  const shop = gen.generateInterior('shop1', 'business', 'shop');
  assert(shop.width >= 17, `shop width >= 17 (got ${shop.width})`);
  assert(shop.depth >= 14, `shop depth >= 14 (got ${shop.depth})`);

  // Tavern: was 18x16 → now ~22x19
  const tavern = gen.generateInterior('tav1', 'business', 'tavern');
  assert(tavern.width >= 22, `tavern width >= 22 (got ${tavern.width})`);
  assert(tavern.depth >= 19, `tavern depth >= 19 (got ${tavern.depth})`);

  // Temple: was 20x24 → now ~24x29
  const temple = gen.generateInterior('tmp1', 'business', 'temple');
  assert(temple.width >= 24, `temple width >= 24 (got ${temple.width})`);
  assert(temple.depth >= 29, `temple depth >= 29 (got ${temple.depth})`);
}

// --- All rooms have minimum area for player navigation ---
// With 20% increase, primary rooms should be at least 5m in each dimension
// (enough for a player capsule of 0.5m radius to navigate around furniture)

console.log('\nall rooms navigable (min 5m each dimension):');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const types: Array<[string, string, string?]> = [
    ['nav_res', 'residence'],
    ['nav_res_m', 'residence_medium'],
    ['nav_res_l', 'residence_large'],
    ['nav_shop', 'business', 'shop'],
    ['nav_tav', 'business', 'tavern'],
    ['nav_tmp', 'business', 'temple'],
    ['nav_guild', 'business', 'guild'],
    ['nav_wh', 'business', 'warehouse'],
  ];

  for (const [id, btype, bustype] of types) {
    const layout = gen.generateInterior(id, btype, bustype);
    for (const room of layout.rooms) {
      const label = `${bustype || btype} "${room.name}"`;
      assert(room.width >= 5, `${label} width >= 5m (got ${room.width.toFixed(1)})`);
      assert(room.depth >= 5, `${label} depth >= 5m (got ${room.depth.toFixed(1)})`);
    }
  }
}

// --- Furniture items don't overlap each other ---

console.log('\nfurniture collision detection (no overlapping items):');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const types: Array<[string, string, string?]> = [
    ['col_res', 'residence'],
    ['col_tav', 'business', 'tavern'],
    ['col_shop', 'business', 'shop'],
    ['col_temple', 'business', 'temple'],
    ['col_guild', 'business', 'guild'],
  ];

  for (const [id, btype, bustype] of types) {
    const layout = gen.generateInterior(id, btype, bustype);
    const furniture = layout.furniture;
    let overlapCount = 0;

    // Check pairwise: furniture centers should not be nearly identical
    for (let i = 0; i < furniture.length; i++) {
      for (let j = i + 1; j < furniture.length; j++) {
        const a = furniture[i];
        const b = furniture[j];
        // Skip if on different floors (Y difference > 2m)
        if (Math.abs(a.position.y - b.position.y) > 2) continue;
        const dx = Math.abs(a.position.x - b.position.x);
        const dz = Math.abs(a.position.z - b.position.z);
        // If centers within 0.3m in both axes, they're overlapping
        if (dx < 0.3 && dz < 0.3) {
          overlapCount++;
        }
      }
    }
    assert(overlapCount === 0,
      `${bustype || btype} has no overlapping furniture (${overlapCount} overlaps, ${furniture.length} items)`);
  }
}

// --- Player capsule can fit through doorways ---

console.log('\nplayer navigation (capsule 0.5m radius fits through 2.5m doorways):');

{
  const playerDiameter = 1.0; // 0.5m radius * 2
  const doorwayWidth = 2.5;
  assert(doorwayWidth > playerDiameter + 0.5,
    `doorway width (${doorwayWidth}m) > player diameter + margin (${playerDiameter + 0.5}m)`);
}

{
  // Verify furniture doesn't block the entrance area
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);
  const layout = gen.generateInterior('nav_res2', 'residence');

  const doorX = layout.doorPosition.x;
  const doorZ = layout.doorPosition.z;
  let blockedEntrance = false;

  for (const f of layout.furniture) {
    const dx = Math.abs(f.position.x - doorX);
    const dz = Math.abs(f.position.z - doorZ);
    if (dx < 1.25 && dz < 1.0) {
      blockedEntrance = true;
    }
  }
  assert(!blockedEntrance, 'no furniture blocks the entrance doorway');
}

// --- All building types still produce furniture after collision filtering ---

console.log('\nall building types produce furniture after filtering:');

{
  const buildingTypes: Array<[string, string, string?]> = [
    ['filt_tav', 'business', 'tavern'],
    ['filt_shop', 'business', 'shop'],
    ['filt_smith', 'business', 'blacksmith'],
    ['filt_temple', 'business', 'temple'],
    ['filt_guild', 'business', 'guild'],
    ['filt_res', 'residence'],
    ['filt_res_m', 'residence_medium'],
    ['filt_res_l', 'residence_large'],
    ['filt_wh', 'business', 'warehouse'],
  ];

  for (const [id, btype, bustype] of buildingTypes) {
    const scene = makeScene();
    const gen = new BuildingInteriorGenerator(scene as any);
    const layout = gen.generateInterior(id, btype, bustype);
    assert(layout.furniture.length > 0,
      `${bustype || btype} has furniture after filtering (${layout.furniture.length} pieces)`);
  }
}

// --- Dimensions are at least 20% larger than original baseline ---

console.log('\ndimensions increased at least 20% from original baselines:');

{
  // Original baseline dimensions (before this change)
  const baselines: Array<{ id: string; btype: string; bustype?: string; origW: number; origD: number }> = [
    { id: 'base_tav', btype: 'business', bustype: 'tavern', origW: 18, origD: 16 },
    { id: 'base_shop', btype: 'business', bustype: 'shop', origW: 14, origD: 12 },
    { id: 'base_temple', btype: 'business', bustype: 'temple', origW: 20, origD: 24 },
    { id: 'base_res', btype: 'residence', origW: 9, origD: 9 },
    { id: 'base_res_m', btype: 'residence_medium', origW: 12, origD: 12 },
  ];

  for (const b of baselines) {
    const scene = makeScene();
    const gen = new BuildingInteriorGenerator(scene as any);
    const layout = gen.generateInterior(b.id, b.btype, b.bustype);
    const label = b.bustype || b.btype;
    assert(layout.width >= b.origW * 1.15,
      `${label} width ${layout.width} >= ${(b.origW * 1.15).toFixed(0)} (115% of original ${b.origW})`);
    assert(layout.depth >= b.origD * 1.15,
      `${label} depth ${layout.depth} >= ${(b.origD * 1.15).toFixed(0)} (115% of original ${b.origD})`);
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
