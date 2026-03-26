/**
 * Tests for BuildingInteriorGenerator texture system.
 *
 * Verifies that:
 * - Building types map to correct texture styles (residential, commercial, civic, industrial)
 * - Procedural textures are generated and applied to floor, wall, and ceiling materials
 * - UV scaling is based on room dimensions (~1 tile per 2m)
 * - Asset collection textures override procedural defaults when configured
 * - Partition walls share the same wall texture style as outer walls
 * - Different building types get different textures
 * - Upper floor surfaces have textures
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BuildingInteriorTextures.test.ts
 */

import { Scene, Texture, __materialRegistry } from './babylon-mock';
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

function getMat(name: string) {
  return __materialRegistry.get(name) ?? null;
}

// ── Tests ──

console.log('\n=== BuildingInteriorGenerator Texture Tests ===\n');

// --- Texture style mapping ---

console.log('texture style mapping for building types:');

{
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Residential
  const resStyle = gen.getTextureStyle('residence', undefined);
  assert(resStyle.floor === 'wood_plank', 'residential floor is wood_plank');
  assert(resStyle.wall === 'plaster', 'residential wall is plaster');
  assert(resStyle.ceiling === 'wood_beam', 'residential ceiling is wood_beam');

  // Tavern (entertainment)
  const tavStyle = gen.getTextureStyle('building', 'Tavern');
  assert(tavStyle.floor === 'wood_plank', 'tavern floor is wood_plank');
  assert(tavStyle.wall === 'wood_panel', 'tavern wall is wood_panel');
  assert(tavStyle.ceiling === 'wood_beam', 'tavern ceiling is wood_beam');

  // Church (civic)
  const civicStyle = gen.getTextureStyle('building', 'Church');
  assert(civicStyle.floor === 'stone_tile', 'church floor is stone_tile');
  assert(civicStyle.wall === 'stone_block', 'church wall is stone_block');
  assert(civicStyle.ceiling === 'stone_block', 'church ceiling is stone_block');

  // Blacksmith (industrial)
  const indStyle = gen.getTextureStyle('building', 'Blacksmith');
  assert(indStyle.floor === 'dirt', 'blacksmith floor is dirt');
  assert(indStyle.wall === 'brick', 'blacksmith wall is brick');
  assert(indStyle.ceiling === 'wood_beam', 'blacksmith ceiling is wood_beam');

  // Shop (commercial_retail)
  const shopStyle = gen.getTextureStyle('building', 'Shop');
  assert(shopStyle.floor === 'stone_tile', 'shop floor is stone_tile');
  assert(shopStyle.wall === 'plaster', 'shop wall is plaster');

  // Unknown type gets default
  const defStyle = gen.getTextureStyle('unknown_building', undefined);
  assert(defStyle.floor === 'wood_plank', 'unknown type gets default wood_plank floor');
  assert(defStyle.wall === 'plaster', 'unknown type gets default plaster wall');
}

// --- Keyword fallback matching ---

console.log('\ntexture style keyword fallback:');

{
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const houseStyle = gen.getTextureStyle('house', undefined);
  assert(houseStyle.floor === 'wood_plank', 'house keyword matches residential');

  const templeStyle = gen.getTextureStyle('temple', undefined);
  assert(templeStyle.floor === 'stone_tile', 'temple keyword matches civic');
  assert(templeStyle.wall === 'stone_block', 'temple keyword matches civic walls');

  const forgeStyle = gen.getTextureStyle('forge', undefined);
  assert(forgeStyle.floor === 'dirt', 'forge keyword matches industrial');
  assert(forgeStyle.wall === 'brick', 'forge keyword matches industrial walls');

  const innStyle = gen.getTextureStyle('inn', undefined);
  assert(innStyle.wall === 'wood_panel', 'inn keyword matches entertainment');
}

// --- Procedural textures applied to interiors ---

console.log('\nprocedural textures applied to interior materials:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.generateInterior('tex1', 'residence');

  const floorMat = getMat('interior_tex1_floor_mat');
  assert(floorMat !== null, 'floor material exists');
  if (floorMat) {
    assert(floorMat.diffuseTexture !== null, 'floor has procedural diffuseTexture applied');
    assert(floorMat.diffuseTexture?.uScale > 0, 'floor texture has positive uScale');
    assert(floorMat.diffuseTexture?.vScale > 0, 'floor texture has positive vScale');
  }

  const wallMat = getMat('interior_tex1_wall_mat');
  assert(wallMat !== null, 'wall material exists');
  if (wallMat) {
    assert(wallMat.diffuseTexture !== null, 'wall has procedural diffuseTexture applied');
  }

  const ceilingMat = getMat('interior_tex1_ceiling_mat');
  assert(ceilingMat !== null, 'ceiling material exists');
  if (ceilingMat) {
    assert(ceilingMat.diffuseTexture !== null, 'ceiling has procedural diffuseTexture applied');
  }
}

// --- UV scaling based on room dimensions ---

console.log('\nUV scaling based on room dimensions:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Residence matches layout template: 13x13 (increased from 9x9)
  gen.generateInterior('uv1', 'residence');
  const floorMat = getMat('interior_uv1_floor_mat');
  if (floorMat?.diffuseTexture) {
    // UV_TILES_PER_METER = 0.5, so 13 * 0.5 = 6.5
    assert(floorMat.diffuseTexture.uScale === 6.5, `floor uScale is 6.5 for 13m width (got ${floorMat.diffuseTexture.uScale})`);
    assert(floorMat.diffuseTexture.vScale === 6.5, `floor vScale is 6.5 for 13m depth (got ${floorMat.diffuseTexture.vScale})`);
  } else {
    assert(false, 'floor material should have texture for UV test');
  }

  // Temple matches church layout template: 24x29 (increased from 20x24)
  gen.generateInterior('uv2', 'temple');
  const templeFloorMat = getMat('interior_uv2_floor_mat');
  if (templeFloorMat?.diffuseTexture) {
    // 24 * 0.5 = 12, 29 * 0.5 = 14.5
    assert(templeFloorMat.diffuseTexture.uScale === 12, `temple floor uScale is 12 for 24m width (got ${templeFloorMat.diffuseTexture.uScale})`);
    assert(templeFloorMat.diffuseTexture.vScale === 14.5, `temple floor vScale is 14.5 for 29m depth (got ${templeFloorMat.diffuseTexture.vScale})`);
  } else {
    assert(false, 'temple floor material should have texture for UV test');
  }

  // Verify UV scales differ between buildings of different sizes
  if (floorMat?.diffuseTexture && templeFloorMat?.diffuseTexture) {
    assert(
      floorMat.diffuseTexture.uScale !== templeFloorMat.diffuseTexture.uScale,
      'different sized buildings get different UV scales'
    );
  }
}

// --- Asset collection texture overrides procedural ---

console.log('\nasset texture overrides procedural:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const customTexture = new Texture('custom_floor.png', scene as any);
  gen.registerInteriorTexture('custom_floor', customTexture as any);

  gen.setInteriorConfigs({
    residence: {
      mode: 'procedural' as const,
      floorTextureId: 'custom_floor',
    },
  });

  gen.generateInterior('asset1', 'residence');
  const floorMat = getMat('interior_asset1_floor_mat');
  if (floorMat?.diffuseTexture) {
    assert(floorMat.diffuseTexture.url === 'custom_floor.png', 'floor uses asset collection texture, not procedural');
  } else {
    assert(false, 'floor should have texture when asset configured');
  }
}

// --- Partition walls use same wall texture as outer walls ---

console.log('\npartition walls match outer wall texture:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.generateInterior('part1', 'tavern');

  const outerWallMat = getMat('interior_part1_wall_mat');
  const partitionMat = getMat('interior_part1_partition_mat');

  assert(outerWallMat !== null, 'outer wall material exists');
  assert(partitionMat !== null, 'partition material exists');
  if (outerWallMat && partitionMat) {
    assert(outerWallMat.diffuseTexture !== null, 'outer wall has texture');
    assert(partitionMat.diffuseTexture !== null, 'partition has texture');
    if (outerWallMat.diffuseTexture && partitionMat.diffuseTexture) {
      assert(
        outerWallMat.diffuseTexture.name === partitionMat.diffuseTexture.name,
        'partition and outer wall use same texture type'
      );
    }
  }
}

// --- Different building types get different textures ---

console.log('\ndifferent building types get different floor textures:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.generateInterior('diff1', 'residence');
  gen.generateInterior('diff2', 'temple');

  const resMat = getMat('interior_diff1_floor_mat');
  const templeMat = getMat('interior_diff2_floor_mat');

  if (resMat?.diffuseTexture && templeMat?.diffuseTexture) {
    assert(
      resMat.diffuseTexture.name !== templeMat.diffuseTexture.name,
      `residence floor (${resMat.diffuseTexture.name}) differs from temple floor (${templeMat.diffuseTexture.name})`
    );
  } else {
    assert(false, 'both materials should have textures');
  }
}

// --- Multi-floor buildings have textures on upper floor ---

console.log('\nupper floor surfaces have textures:');

{
  __materialRegistry.clear();
  const scene = new Scene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.generateInterior('upper1', 'residence_large');

  const upperFloorMat = getMat('interior_upper1_upper_floor_mat');
  assert(upperFloorMat !== null, 'upper floor material exists');
  if (upperFloorMat) {
    assert(upperFloorMat.diffuseTexture !== null, 'upper floor has texture');
  }

  const upperCeilingMat = getMat('interior_upper1_upper_ceiling_mat');
  assert(upperCeilingMat !== null, 'upper ceiling material exists');
  if (upperCeilingMat) {
    assert(upperCeilingMat.diffuseTexture !== null, 'upper ceiling has texture');
  }

  const upperWallMat = getMat('interior_upper1_upper_wall_mat');
  assert(upperWallMat !== null, 'upper wall material exists');
  if (upperWallMat) {
    assert(upperWallMat.diffuseTexture !== null, 'upper wall has texture');
  }
}

// ── Summary ──

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
