/**
 * Tests for Polyhaven asset integration — verifies downloaded assets
 * exist on disk and are properly referenced in base-asset-collections.json.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/PolygonAssetIntegration.test.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../..');
const MODELS_BASE = path.join(PROJECT_ROOT, 'client/public/assets/models');

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

// ── Expected new assets from the download script ──

const EXPECTED_FURNITURE = [
  'WoodenTable_03', 'CoffeeTable_01', 'coffee_table_round_01', 'chinese_tea_table',
  'WoodenChair_01', 'dining_chair_02', 'SchoolChair_01', 'chinese_armchair',
  'chinese_stool', 'BarberShopChair_01', 'ClassicNightstand_01', 'GothicCommode_01',
  'Sofa_01', 'Ottoman_01', 'chinese_sofa', 'chinese_cabinet', 'chinese_console_table',
  'chinese_screen_panels', 'SchoolDesk_01', 'Chandelier_02', 'Chandelier_03',
  'desk_lamp_arm_01',
];

const EXPECTED_PROPS = [
  'brass_pan_01', 'brass_pot_01', 'brass_pot_02', 'croissant', 'carrot_cake',
  'CheeseBox_01', 'carved_wooden_plate', 'antique_ceramic_vase_01', 'brass_vase_01',
  'ceramic_vase_01', 'ceramic_vase_02', 'chess_set', 'carved_wooden_elephant',
  'brass_diya_lantern', 'alarm_clock_01', 'concrete_cat_statue', 'Barrel_02',
  'cardboard_box_01', 'bench_vice_01', 'crowbar_01',
];

// ── Test 1: Verify downloaded furniture assets exist on disk ──

console.log('\n🪑 Test: Downloaded furniture assets exist on disk');
for (const id of EXPECTED_FURNITURE) {
  const dir = path.join(MODELS_BASE, 'furniture/polyhaven', id);
  const gltfFile = path.join(dir, `${id}.gltf`);
  assert(fs.existsSync(gltfFile), `${id}.gltf exists`);
}

// ── Test 2: Verify downloaded prop assets exist on disk ──

console.log('\n🏺 Test: Downloaded prop assets exist on disk');
for (const id of EXPECTED_PROPS) {
  const dir = path.join(MODELS_BASE, 'props/polyhaven', id);
  const gltfFile = path.join(dir, `${id}.gltf`);
  assert(fs.existsSync(gltfFile), `${id}.gltf exists`);
}

// ── Test 3: Each GLTF has required companion files (bin + textures) ──

console.log('\n📦 Test: Each GLTF has companion bin and texture files');
const allAssets = [
  ...EXPECTED_FURNITURE.map((id) => ({ id, category: 'furniture' })),
  ...EXPECTED_PROPS.map((id) => ({ id, category: 'props' })),
];

for (const { id, category } of allAssets) {
  const dir = path.join(MODELS_BASE, `${category}/polyhaven`, id);
  if (!fs.existsSync(dir)) continue;

  const binFile = path.join(dir, `${id}.bin`);
  assert(fs.existsSync(binFile), `${id}.bin exists`);

  const texturesDir = path.join(dir, 'textures');
  if (fs.existsSync(texturesDir)) {
    const texFiles = fs.readdirSync(texturesDir).filter((f) => f.endsWith('.jpg'));
    assert(texFiles.length > 0, `${id} has texture files (${texFiles.length} found)`);
  }
}

// ── Test 4: GLTF files are valid JSON ──

console.log('\n📄 Test: GLTF files are valid JSON');
for (const { id, category } of allAssets) {
  const gltfFile = path.join(MODELS_BASE, `${category}/polyhaven`, id, `${id}.gltf`);
  if (!fs.existsSync(gltfFile)) continue;

  try {
    const content = fs.readFileSync(gltfFile, 'utf-8');
    const parsed = JSON.parse(content);
    assert(parsed.asset && parsed.asset.version, `${id}.gltf is valid GLTF with version ${parsed.asset.version}`);
  } catch {
    assert(false, `${id}.gltf is valid JSON`);
  }
}

// ── Test 5: base-asset-collections.json references the new assets ──

console.log('\n🗺️ Test: base-asset-collections.json references new assets');
const collectionsPath = path.join(PROJECT_ROOT, 'data/base-asset-collections.json');
const collections = JSON.parse(fs.readFileSync(collectionsPath, 'utf-8'));
const medievalConfig = collections.collections['medieval-fantasy'].config3D.objectModels;

const EXPECTED_ROLES = [
  'furniture_table_round', 'furniture_coffee_table', 'furniture_chair_wooden',
  'furniture_chair_dining', 'furniture_nightstand', 'furniture_dresser',
  'furniture_sofa', 'furniture_ottoman', 'furniture_desk',
  'chandelier_ornate', 'chandelier_simple',
  'kitchen_pan', 'kitchen_pot', 'kitchen_plate',
  'food_croissant', 'food_cake',
  'vase', 'decoration_chess', 'tool_vice', 'barrel_small', 'clock',
];

for (const role of EXPECTED_ROLES) {
  assert(
    medievalConfig[role] !== undefined,
    `config3D.objectModels has "${role}" mapping`,
  );
}

// ── Test 6: Food placeholders replaced with real food models ──

console.log('\n🍞 Test: Food role placeholders replaced with real models');
assert(
  medievalConfig.food_loaf?.includes('croissant'),
  'food_loaf maps to croissant (not wooden_bucket placeholder)',
);
assert(
  medievalConfig.food_plate?.includes('carved_wooden_plate'),
  'food_plate maps to carved_wooden_plate (not brass_goblets placeholder)',
);
assert(
  medievalConfig.food_wedge?.includes('carrot_cake'),
  'food_wedge maps to carrot_cake (not wooden_bucket placeholder)',
);

// ── Test 7: New assets in medieval-fantasy objects array ──

console.log('\n📋 Test: New assets listed in medieval-fantasy objects array');
const medievalObjects = collections.collections['medieval-fantasy'].assets.objects;
const objectPolyhavenIds = medievalObjects.map((o: any) => o.polyhavenId);

const EXPECTED_IN_OBJECTS = [
  'WoodenTable_03', 'CoffeeTable_01', 'WoodenChair_01', 'dining_chair_02',
  'ClassicNightstand_01', 'GothicCommode_01', 'Sofa_01', 'Ottoman_01',
  'SchoolDesk_01', 'Chandelier_02', 'Chandelier_03',
  'brass_pan_01', 'brass_pot_01', 'croissant', 'carrot_cake',
  'antique_ceramic_vase_01', 'chess_set', 'carved_wooden_plate',
  'bench_vice_01', 'Barrel_02', 'alarm_clock_01',
];

for (const id of EXPECTED_IN_OBJECTS) {
  assert(
    objectPolyhavenIds.includes(id),
    `"${id}" is in medieval-fantasy objects array`,
  );
}

// ── Test 8: Download script exports PRIORITY_ASSETS ──

console.log('\n📜 Test: Download script has correct structure');
const scriptPath = path.join(PROJECT_ROOT, 'scripts/download-polyhaven-assets.ts');
assert(fs.existsSync(scriptPath), 'download-polyhaven-assets.ts exists');
const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
assert(scriptContent.includes('PRIORITY_ASSETS'), 'Script exports PRIORITY_ASSETS');
assert(scriptContent.includes('downloadAsset'), 'Script has downloadAsset function');

// ── Test 9: Migration file exists and has correct structure ──

console.log('\n🔄 Test: Migration 026 exists and has correct structure');
const migrationPath = path.join(PROJECT_ROOT, 'server/migrations/026-register-new-prop-assets.ts');
assert(fs.existsSync(migrationPath), '026-register-new-prop-assets.ts exists');
const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
assert(migrationContent.includes('createVisualAsset'), 'Migration calls createVisualAsset');
assert(migrationContent.includes('model_prop'), 'Migration uses model_prop asset type');
assert(migrationContent.includes('polyhaven'), 'Migration tags with polyhaven source');

// ── Summary ──

console.log(`\n${'═'.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
