/**
 * Tests for applying interior config from asset collection in BuildingInteriorGenerator.
 *
 * Verifies:
 * - Config lookup by businessType, buildingType, and case-insensitive variants
 * - Model mode creates layout with modelPath metadata
 * - Procedural mode with custom dimensions overrides defaults
 * - Procedural mode with color overrides applies to room meshes
 * - Layout template generates correct room zones
 * - Floor count override works
 * - Falls back to hardcoded behavior when no config is set
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/InteriorConfigApplication.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3, Light, Texture } from './babylon-mock';
import { BuildingInteriorGenerator, resolveLightingPreset } from '../BuildingInteriorGenerator';
import type { InteriorLayout } from '../BuildingInteriorGenerator';
import type { InteriorTemplateConfig, InteriorLayoutTemplate, LightingPreset } from '@shared/game-engine/types';

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

// ── Tests ──

console.log('\n=== Interior Config Application Tests ===\n');

// --- Config lookup ---

console.log('config lookup:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // No configs set — should return null
  assert(gen.getInteriorConfig('residence') === null, 'returns null when no configs set');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'model', modelPath: '/models/tavern.glb' },
    'Shop': { mode: 'procedural', width: 20 },
  });

  // Exact businessType match
  const tavernConfig = gen.getInteriorConfig('business', 'tavern');
  assert(tavernConfig !== null, 'finds config by businessType');
  assert(tavernConfig?.mode === 'model', 'tavern config is model mode');

  // Exact buildingType match
  const shopConfig = gen.getInteriorConfig('Shop');
  assert(shopConfig !== null, 'finds config by buildingType');
  assert(shopConfig?.mode === 'procedural', 'shop config is procedural mode');

  // Case-insensitive fallback
  const shopLower = gen.getInteriorConfig('shop');
  assert(shopLower === null, 'case-sensitive first — no match for lowercase "shop"');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', width: 25 },
  });

  // businessType takes priority over buildingType
  const config = gen.getInteriorConfig('business', 'tavern');
  assert(config?.width === 25, 'businessType lookup takes priority');

  // buildingType fallback
  const config2 = gen.getInteriorConfig('tavern');
  assert(config2?.width === 25, 'buildingType fallback works');

  // No match
  const config3 = gen.getInteriorConfig('residence');
  assert(config3 === null, 'returns null for unmatched type');
}

// --- Model mode ---

console.log('\nmodel mode:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'model', modelPath: '/assets/models/interiors/tavern.glb', width: 15, depth: 12, height: 5 },
  });

  const layout = gen.generateInterior('tav1', 'business', 'tavern');

  assert(layout.roomMesh.metadata?.interiorMode === 'model', 'model mode sets interiorMode metadata');
  assert(layout.roomMesh.metadata?.modelPath === '/assets/models/interiors/tavern.glb', 'model mode sets modelPath metadata');
  assert(layout.rooms.length === 0, 'model mode has no procedural rooms');
  assert(layout.furniture.length === 0, 'model mode has no procedural furniture');
  assert(layout.width === 15, 'model mode uses configured width');
  assert(layout.depth === 12, 'model mode uses configured depth');
  assert(layout.height === 5, 'model mode uses configured height');
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'model', modelPath: '/models/tavern.glb' },
  });

  // Cached interior
  const layout1 = gen.generateInterior('tav_cache', 'business', 'tavern');
  const layout2 = gen.generateInterior('tav_cache', 'business', 'tavern');
  assert(layout1 === layout2, 'model mode layout is cached');
}

// --- Procedural mode with dimension overrides ---

console.log('\nprocedural mode - dimension overrides:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', width: 25, depth: 20, height: 6 },
  });

  const layout = gen.generateInterior('tav_dims', 'business', 'tavern');
  assert(layout.width === 25, `width overridden to 25 (got ${layout.width})`);
  assert(layout.depth === 20, `depth overridden to 20 (got ${layout.depth})`);
  assert(layout.height === 6, `height overridden to 6 (got ${layout.height})`);
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', width: 22 },
  });

  // Partial override: only width, depth/height from defaults
  const layout = gen.generateInterior('tav_partial', 'business', 'tavern');
  assert(layout.width === 22, `width overridden to 22 (got ${layout.width})`);
  assert(layout.depth === 16, `depth falls back to default 16 (got ${layout.depth})`);
  assert(layout.height === 5, `height falls back to default 5 (got ${layout.height})`);
}

// --- Floor count override ---

console.log('\nfloor count override:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Small residence normally has 1 floor — override to 2
  gen.setInteriorConfigs({
    'residence': { mode: 'procedural', floorCount: 2 },
  });

  const layout = gen.generateInterior('res_floors', 'residence');
  assert(layout.floorCount === 2, `floor count overridden to 2 (got ${layout.floorCount})`);
  // Should have staircase furniture
  const hasStairs = layout.furniture.some(f => f.name.includes('staircase'));
  assert(hasStairs, 'has staircase with overridden floor count');
}

// --- Color overrides ---

console.log('\ncolor overrides:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'tavern': {
      mode: 'procedural',
      wallColor: { r: 0.8, g: 0.2, b: 0.1 },
      floorColor: { r: 0.1, g: 0.5, b: 0.3 },
      ceilingColor: { r: 0.9, g: 0.9, b: 0.9 },
    },
  });

  const layout = gen.generateInterior('tav_colors', 'business', 'tavern');

  // Check that the room mesh has children with materials using our custom colors
  const roomChildren = layout.roomMesh.getChildMeshes();
  const floorMesh = roomChildren.find((m: any) => m.name.includes('floor') && !m.name.includes('upper'));
  const wallMesh = roomChildren.find((m: any) => m.name.includes('wall_back'));

  if (floorMesh?.material) {
    const floorColor = (floorMesh.material as any).diffuseColor;
    assert(
      Math.abs(floorColor.r - 0.1) < 0.01 && Math.abs(floorColor.g - 0.5) < 0.01,
      'floor color overridden'
    );
  } else {
    assert(false, 'floor mesh with material not found');
  }

  if (wallMesh?.material) {
    const wallColor = (wallMesh.material as any).diffuseColor;
    assert(
      Math.abs(wallColor.r - 0.8) < 0.01 && Math.abs(wallColor.g - 0.2) < 0.01,
      'wall color overridden'
    );
  } else {
    assert(false, 'wall mesh with material not found');
  }
}

// --- Layout template ---

console.log('\nlayout template:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const template: InteriorLayoutTemplate = {
    id: 'custom_tavern',
    name: 'Custom Tavern',
    rooms: [
      { name: 'bar_area', function: 'tavern_main', relativeWidth: 1, relativeDepth: 0.6, floor: 0 },
      { name: 'back_kitchen', function: 'kitchen', relativeWidth: 1, relativeDepth: 0.4, floor: 0 },
    ],
    totalWidth: 20,
    totalDepth: 18,
    totalHeight: 5,
    floors: 1,
  };

  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', layoutTemplate: template },
  });

  const layout = gen.generateInterior('tav_template', 'business', 'tavern');

  assert(layout.width === 20, `template width=20 (got ${layout.width})`);
  assert(layout.depth === 18, `template depth=18 (got ${layout.depth})`);
  assert(layout.height === 5, `template height=5 (got ${layout.height})`);
  assert(layout.rooms.length === 2, `template has 2 rooms (got ${layout.rooms.length})`);

  const barRoom = layout.rooms.find(r => r.name === 'bar_area');
  assert(barRoom !== undefined, 'has bar_area room');
  assert(barRoom!.function === 'tavern_main', 'bar_area has correct function');
  assert(Math.abs(barRoom!.width - 20) < 0.01, `bar_area width=20 (got ${barRoom!.width})`);
  assert(Math.abs(barRoom!.depth - 10.8) < 0.01, `bar_area depth=10.8 (got ${barRoom!.depth})`); // 0.6 * 18

  const kitchenRoom = layout.rooms.find(r => r.name === 'back_kitchen');
  assert(kitchenRoom !== undefined, 'has back_kitchen room');
  assert(Math.abs(kitchenRoom!.depth - 7.2) < 0.01, `kitchen depth=7.2 (got ${kitchenRoom!.depth})`); // 0.4 * 18
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Template with absolute dimensions (> 1)
  const template: InteriorLayoutTemplate = {
    id: 'abs_template',
    name: 'Absolute Dims',
    rooms: [
      { name: 'main', function: 'living', relativeWidth: 8, relativeDepth: 6, floor: 0 },
      { name: 'back', function: 'storage', relativeWidth: 8, relativeDepth: 4, floor: 0 },
    ],
    totalWidth: 10,
    totalDepth: 12,
    totalHeight: 4,
    floors: 1,
  };

  gen.setInteriorConfigs({
    'warehouse': { mode: 'procedural', layoutTemplate: template },
  });

  const layout = gen.generateInterior('wh_abs', 'warehouse');
  const mainRoom = layout.rooms.find(r => r.name === 'main');
  assert(mainRoom!.width === 8, `absolute width=8 (got ${mainRoom!.width})`);
  assert(mainRoom!.depth === 6, `absolute depth=6 (got ${mainRoom!.depth})`);
}

// --- Fallback behavior (no config) ---

console.log('\nfallback behavior:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // No configs set — should use hardcoded defaults exactly as before
  const layout = gen.generateInterior('res_default', 'residence');
  assert(layout.width === 9, `default residence width=9 (got ${layout.width})`);
  assert(layout.depth === 9, `default residence depth=9 (got ${layout.depth})`);
  assert(layout.floorCount === 1, `default residence 1 floor (got ${layout.floorCount})`);
  assert(layout.rooms.length >= 2, `default residence has rooms (got ${layout.rooms.length})`);
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Config set for tavern but not for residence — residence should use defaults
  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', width: 30 },
  });

  const layout = gen.generateInterior('res_unmatched', 'residence');
  assert(layout.width === 9, `unmatched type uses default width (got ${layout.width})`);
}

// --- Model mode with default dimensions ---

console.log('\nmodel mode defaults:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  gen.setInteriorConfigs({
    'church': { mode: 'model', modelPath: '/models/church.glb' },
  });

  const layout = gen.generateInterior('church1', 'business', 'church');
  assert(layout.width === 10, 'model mode defaults to width=10');
  assert(layout.depth === 10, 'model mode defaults to depth=10');
  assert(layout.height === 4, 'model mode defaults to height=4');
}

// --- Lighting preset application ---

console.log('\nlighting preset application:');

{
  // resolveLightingPreset returns correct configs for all presets
  const presets: LightingPreset[] = ['bright', 'dim', 'warm', 'cool', 'candlelit'];
  for (const preset of presets) {
    const config = resolveLightingPreset(preset);
    assert(config !== undefined, `resolveLightingPreset('${preset}') returns a config`);
    assert(config.ambientIntensity > 0, `'${preset}' has positive ambientIntensity`);
    assert(config.pointLightIntensity > 0, `'${preset}' has positive pointLightIntensity`);
    assert(config.ambientColor instanceof Color3, `'${preset}' ambientColor is Color3`);
    assert(config.pointLightColor instanceof Color3, `'${preset}' pointLightColor is Color3`);
  }
}

{
  // bright is brighter than dim
  const bright = resolveLightingPreset('bright');
  const dim = resolveLightingPreset('dim');
  assert(bright.ambientIntensity > dim.ambientIntensity, 'bright ambient > dim ambient');
  assert(bright.pointLightIntensity > dim.pointLightIntensity, 'bright point > dim point');
}

{
  // candlelit is the dimmest
  const candlelit = resolveLightingPreset('candlelit');
  const presets: LightingPreset[] = ['bright', 'dim', 'warm', 'cool'];
  for (const p of presets) {
    const other = resolveLightingPreset(p);
    assert(other.ambientIntensity >= candlelit.ambientIntensity, `${p} ambient >= candlelit ambient`);
  }
}

{
  // warm preset has warm (orange-shifted) color
  const warm = resolveLightingPreset('warm');
  assert(warm.ambientColor.r > warm.ambientColor.g, 'warm: r > g');
  assert(warm.ambientColor.g > warm.ambientColor.b, 'warm: g > b');
}

{
  // cool preset has cool (blue-shifted) color
  const cool = resolveLightingPreset('cool');
  assert(cool.ambientColor.b > cool.ambientColor.r, 'cool: b > r');
}

{
  // lightingPreset string is applied to scene lights
  const scene = makeScene();
  // Add mock lights matching what InteriorSceneManager creates
  const ambient = new Light('interior_ambient');
  const center = new Light('interior_center_light');
  (scene as any).addLight(ambient);
  (scene as any).addLight(center);

  const gen = new BuildingInteriorGenerator(scene as any);
  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural', lightingPreset: 'warm' },
  });

  gen.generateInterior('tav_light', 'business', 'tavern');

  const warmCfg = resolveLightingPreset('warm');
  assert(
    Math.abs(ambient.intensity - warmCfg.ambientIntensity) < 0.01,
    `ambient intensity set to warm (${ambient.intensity} ≈ ${warmCfg.ambientIntensity})`
  );
  assert(
    Math.abs(center.intensity - warmCfg.pointLightIntensity) < 0.01,
    `point light intensity set to warm (${center.intensity} ≈ ${warmCfg.pointLightIntensity})`
  );
  assert(
    Math.abs(ambient.diffuse.r - warmCfg.ambientColor.r) < 0.01,
    `ambient diffuse color set to warm`
  );
  assert(
    Math.abs(center.diffuse.r - warmCfg.pointLightColor.r) < 0.01,
    `center light diffuse color set to warm`
  );
}

{
  // different presets produce different results
  const scene1 = makeScene();
  const ambient1 = new Light('interior_ambient');
  const center1 = new Light('interior_center_light');
  (scene1 as any).addLight(ambient1);
  (scene1 as any).addLight(center1);
  const gen1 = new BuildingInteriorGenerator(scene1 as any);
  gen1.setInteriorConfigs({ 'bar': { mode: 'procedural', lightingPreset: 'candlelit' } });
  gen1.generateInterior('bar_candle', 'business', 'bar');

  const scene2 = makeScene();
  const ambient2 = new Light('interior_ambient');
  const center2 = new Light('interior_center_light');
  (scene2 as any).addLight(ambient2);
  (scene2 as any).addLight(center2);
  const gen2 = new BuildingInteriorGenerator(scene2 as any);
  gen2.setInteriorConfigs({ 'bar': { mode: 'procedural', lightingPreset: 'bright' } });
  gen2.generateInterior('bar_bright', 'business', 'bar');

  assert(
    ambient1.intensity !== ambient2.intensity,
    `candlelit vs bright produce different ambient (${ambient1.intensity} vs ${ambient2.intensity})`
  );
  assert(
    center1.intensity !== center2.intensity,
    `candlelit vs bright produce different point light (${center1.intensity} vs ${center2.intensity})`
  );
}

{
  // no lightingPreset → lights are NOT modified (stay at defaults)
  const scene = makeScene();
  const ambient = new Light('interior_ambient');
  const center = new Light('interior_center_light');
  (scene as any).addLight(ambient);
  (scene as any).addLight(center);

  const gen = new BuildingInteriorGenerator(scene as any);
  gen.setInteriorConfigs({
    'tavern': { mode: 'procedural' },
  });

  gen.generateInterior('tav_no_light', 'business', 'tavern');

  assert(ambient.intensity === 1, `ambient stays at default intensity when no preset (got ${ambient.intensity})`);
  assert(center.intensity === 1, `center stays at default intensity when no preset (got ${center.intensity})`);
}

// --- Interior texture application ---

console.log('\ninterior texture application:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const wallTex = new Texture('/textures/wall.png', scene);
  const floorTex = new Texture('/textures/floor.png', scene);
  const ceilingTex = new Texture('/textures/ceiling.png', scene);

  gen.registerInteriorTexture('wall-tex-1', wallTex as any);
  gen.registerInteriorTexture('floor-tex-1', floorTex as any);
  gen.registerInteriorTexture('ceiling-tex-1', ceilingTex as any);

  gen.setInteriorConfigs({
    'tavern': {
      mode: 'procedural',
      wallTextureId: 'wall-tex-1',
      floorTextureId: 'floor-tex-1',
      ceilingTextureId: 'ceiling-tex-1',
    },
  });

  const layout = gen.generateInterior('tav_tex', 'business', 'tavern');
  const roomChildren = layout.roomMesh.getChildMeshes();
  const floorMesh = roomChildren.find((m: any) => m.name.includes('floor') && !m.name.includes('upper'));
  const wallMesh = roomChildren.find((m: any) => m.name.includes('wall_back'));
  const ceilingMesh = roomChildren.find((m: any) => m.name.includes('ceiling'));

  if (floorMesh?.material) {
    const mat = floorMesh.material as any;
    assert(mat.diffuseTexture !== null, 'floor has diffuseTexture applied');
    assert(mat.diffuseTexture.uScale === 2, 'floor texture uScale=2');
    assert(mat.diffuseColor.r === 1, 'floor diffuseColor set to white when textured');
  } else {
    assert(false, 'floor mesh with material not found for texture test');
  }

  if (wallMesh?.material) {
    const mat = wallMesh.material as any;
    assert(mat.diffuseTexture !== null, 'wall has diffuseTexture applied');
    assert(mat.diffuseTexture.vScale === 2, 'wall texture vScale=2');
    assert(mat.diffuseColor.r === 1, 'wall diffuseColor set to white when textured');
  } else {
    assert(false, 'wall mesh with material not found for texture test');
  }

  if (ceilingMesh?.material) {
    const mat = ceilingMesh.material as any;
    assert(mat.diffuseTexture !== null, 'ceiling has diffuseTexture applied');
  } else {
    assert(false, 'ceiling mesh with material not found for texture test');
  }
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // No textures registered — texture IDs in config should be ignored gracefully
  gen.setInteriorConfigs({
    'tavern': {
      mode: 'procedural',
      wallTextureId: 'nonexistent-tex',
      floorTextureId: 'nonexistent-tex',
    },
  });

  const layout = gen.generateInterior('tav_no_tex', 'business', 'tavern');
  const roomChildren = layout.roomMesh.getChildMeshes();
  const floorMesh = roomChildren.find((m: any) => m.name.includes('floor') && !m.name.includes('upper'));

  if (floorMesh?.material) {
    const mat = floorMesh.material as any;
    assert(mat.diffuseTexture === null, 'no texture applied when texture ID not registered');
    assert(mat.diffuseColor.r !== 1 || mat.diffuseColor.g !== 1, 'fallback color preserved when texture missing');
  } else {
    assert(false, 'floor mesh not found for missing texture test');
  }
}

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Partial texture: only wall texture, floor and ceiling should use colors
  const wallTex = new Texture('/textures/wall.png', scene);
  gen.registerInteriorTexture('wall-only', wallTex as any);

  gen.setInteriorConfigs({
    'shop': {
      mode: 'procedural',
      wallTextureId: 'wall-only',
      floorColor: { r: 0.5, g: 0.3, b: 0.1 },
    },
  });

  const layout = gen.generateInterior('shop_partial', 'business', 'shop');
  const roomChildren = layout.roomMesh.getChildMeshes();
  const floorMesh = roomChildren.find((m: any) => m.name.includes('floor') && !m.name.includes('upper'));
  const wallMesh = roomChildren.find((m: any) => m.name.includes('wall_back'));

  if (floorMesh?.material) {
    const mat = floorMesh.material as any;
    assert(mat.diffuseTexture === null, 'floor has no texture when only wall texture set');
    assert(Math.abs(mat.diffuseColor.r - 0.5) < 0.01, 'floor uses color override');
  } else {
    assert(false, 'floor mesh not found for partial texture test');
  }

  if (wallMesh?.material) {
    const mat = wallMesh.material as any;
    assert(mat.diffuseTexture !== null, 'wall has texture when wallTextureId set');
  } else {
    assert(false, 'wall mesh not found for partial texture test');
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
