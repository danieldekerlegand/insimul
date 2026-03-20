#!/usr/bin/env tsx
/**
 * Download top-priority 3D assets from Polyhaven.
 *
 * Uses the Polyhaven API to fetch 1K GLTF models with textures.
 * Assets are saved into client/public/assets/models/{category}/polyhaven/{assetId}/
 *
 * Usage:
 *   npx tsx scripts/download-polyhaven-assets.ts [--dry-run] [--category furniture]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const ROOT = path.resolve(import.meta.dirname, '..');
const MODELS_BASE = path.join(ROOT, 'client/public/assets/models');

// ─── Priority asset list ────────────────────────────────────────────────────
// Organized by category. Each entry: [polyhavenId, semanticRole, description]

export interface AssetEntry {
  id: string;
  semanticRole: string;
  category: 'furniture' | 'props';
  description: string;
}

export const PRIORITY_ASSETS: AssetEntry[] = [
  // ── Furniture: Tables ──
  { id: 'WoodenTable_03', semanticRole: 'furniture_table_round', category: 'furniture', description: 'Round wooden table' },
  { id: 'CoffeeTable_01', semanticRole: 'furniture_coffee_table', category: 'furniture', description: 'Low coffee table' },
  { id: 'coffee_table_round_01', semanticRole: 'furniture_coffee_table_round', category: 'furniture', description: 'Round coffee table' },
  { id: 'chinese_tea_table', semanticRole: 'furniture_tea_table', category: 'furniture', description: 'Chinese tea table' },

  // ── Furniture: Chairs ──
  { id: 'WoodenChair_01', semanticRole: 'furniture_chair_wooden', category: 'furniture', description: 'Simple wooden chair' },
  { id: 'dining_chair_02', semanticRole: 'furniture_chair_dining', category: 'furniture', description: 'Upholstered dining chair' },
  { id: 'SchoolChair_01', semanticRole: 'furniture_chair_school', category: 'furniture', description: 'School chair' },
  { id: 'chinese_armchair', semanticRole: 'furniture_armchair_ornate', category: 'furniture', description: 'Ornate Chinese armchair' },
  { id: 'chinese_stool', semanticRole: 'furniture_stool_ornate', category: 'furniture', description: 'Chinese wooden stool' },
  { id: 'BarberShopChair_01', semanticRole: 'furniture_chair_barber', category: 'furniture', description: 'Barber shop chair' },

  // ── Furniture: Beds & Bedroom ──
  { id: 'ClassicNightstand_01', semanticRole: 'furniture_nightstand', category: 'furniture', description: 'Classic wooden nightstand' },
  { id: 'GothicCommode_01', semanticRole: 'furniture_dresser', category: 'furniture', description: 'Gothic commode/dresser' },

  // ── Furniture: Seating ──
  { id: 'Sofa_01', semanticRole: 'furniture_sofa', category: 'furniture', description: 'Upholstered sofa' },
  { id: 'Ottoman_01', semanticRole: 'furniture_ottoman', category: 'furniture', description: 'Upholstered ottoman' },
  { id: 'chinese_sofa', semanticRole: 'furniture_sofa_ornate', category: 'furniture', description: 'Ornate Chinese sofa' },

  // ── Furniture: Storage & Shelving ──
  { id: 'chinese_cabinet', semanticRole: 'furniture_cabinet_ornate', category: 'furniture', description: 'Ornate Chinese cabinet' },
  { id: 'chinese_console_table', semanticRole: 'furniture_console', category: 'furniture', description: 'Chinese console table' },
  { id: 'chinese_screen_panels', semanticRole: 'furniture_screen', category: 'furniture', description: 'Decorative screen panels' },

  // ── Furniture: Desks ──
  { id: 'SchoolDesk_01', semanticRole: 'furniture_desk', category: 'furniture', description: 'School desk' },

  // ── Lighting ──
  { id: 'Chandelier_02', semanticRole: 'chandelier_ornate', category: 'furniture', description: 'Ornate chandelier variant' },
  { id: 'Chandelier_03', semanticRole: 'chandelier_simple', category: 'furniture', description: 'Simple chandelier' },
  { id: 'desk_lamp_arm_01', semanticRole: 'desk_lamp', category: 'furniture', description: 'Articulated desk lamp' },

  // ── Props: Kitchen & Food ──
  { id: 'brass_pan_01', semanticRole: 'kitchen_pan', category: 'props', description: 'Brass cooking pan' },
  { id: 'brass_pot_01', semanticRole: 'kitchen_pot', category: 'props', description: 'Brass cooking pot' },
  { id: 'brass_pot_02', semanticRole: 'kitchen_pot_large', category: 'props', description: 'Large brass pot' },
  { id: 'croissant', semanticRole: 'food_croissant', category: 'props', description: 'Croissant pastry' },
  { id: 'carrot_cake', semanticRole: 'food_cake', category: 'props', description: 'Carrot cake' },
  { id: 'CheeseBox_01', semanticRole: 'food_cheese', category: 'props', description: 'Cheese box' },
  { id: 'carved_wooden_plate', semanticRole: 'kitchen_plate', category: 'props', description: 'Carved wooden serving plate' },

  // ── Props: Decorative ──
  { id: 'antique_ceramic_vase_01', semanticRole: 'vase_antique', category: 'props', description: 'Antique ceramic vase' },
  { id: 'brass_vase_01', semanticRole: 'vase_brass', category: 'props', description: 'Brass vase' },
  { id: 'ceramic_vase_01', semanticRole: 'vase_ceramic', category: 'props', description: 'Ceramic vase' },
  { id: 'ceramic_vase_02', semanticRole: 'vase_ceramic_tall', category: 'props', description: 'Tall ceramic vase' },
  { id: 'chess_set', semanticRole: 'decoration_chess', category: 'props', description: 'Chess set' },
  { id: 'decorative_book_set_01', semanticRole: 'books_decorative', category: 'props', description: 'Decorative book set' },
  { id: 'carved_wooden_elephant', semanticRole: 'decoration_elephant', category: 'props', description: 'Carved wooden elephant' },
  { id: 'brass_diya_lantern', semanticRole: 'lantern_ornate', category: 'props', description: 'Ornate brass diya lantern' },
  { id: 'alarm_clock_01', semanticRole: 'clock', category: 'props', description: 'Alarm clock' },
  { id: 'concrete_cat_statue', semanticRole: 'decoration_statue', category: 'props', description: 'Cat statue' },

  // ── Props: Containers ──
  { id: 'Barrel_01', semanticRole: 'barrel_large', category: 'props', description: 'Large barrel' },
  { id: 'Barrel_02', semanticRole: 'barrel_small', category: 'props', description: 'Small barrel' },
  { id: 'cardboard_box_01', semanticRole: 'box_cardboard', category: 'props', description: 'Cardboard box' },

  // ── Props: Tools ──
  { id: 'bench_vice_01', semanticRole: 'tool_vice', category: 'props', description: 'Bench vice' },
  { id: 'crowbar_01', semanticRole: 'tool_crowbar', category: 'props', description: 'Crowbar' },
];

// Assets already downloaded (skip these)
const ALREADY_DOWNLOADED = new Set([
  'ArmChair_01', 'bar_chair_round_01', 'book_encyclopedia_set_01', 'brass_candleholders',
  'brass_goblets', 'Chandelier_01', 'ClassicConsole_01', 'GothicBed_01', 'GothicCabinet_01',
  'GreenChair_01', 'Lantern_01', 'painted_wooden_cabinet', 'Rockingchair_01', 'Shelf_01',
  'tea_set_01', 'vintage_cabinet_01', 'vintage_grandfather_clock_01', 'wooden_bookshelf_worn',
  'wooden_stool_01', 'wooden_table_02', 'WoodenTable_01', 'antique_estoc', 'antique_katana_01',
  'barrel_03', 'barrel_stove', 'boombox', 'CashRegister_01', 'fire_hydrant', 'metal_tool_chest',
  'metal_trash_can', 'security_camera_01', 'stone_fire_pit', 'street_lamp_01', 'street_lamp_02',
  'treasure_chest', 'utility_box_01', 'utility_box_02', 'vintage_oil_lamp', 'wine_barrel_01',
  'wooden_axe', 'wooden_barrels_01', 'wooden_bucket_01', 'wooden_bucket_02', 'wooden_candlestick',
  'wooden_crate_01', 'wooden_crate_02', 'wooden_handle_saber', 'wooden_lantern_01',
]);

// ─── Download helpers ───────────────────────────────────────────────────────

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJson(res.headers.location).then(resolve, reject);
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`JSON parse error for ${url}: ${e}`)); }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    fs.mkdirSync(dir, { recursive: true });

    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, destPath).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const ws = fs.createWriteStream(destPath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadAsset(assetId: string, category: string): Promise<boolean> {
  const destDir = path.join(MODELS_BASE, category, 'polyhaven', assetId);

  // Check if already exists
  if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
    console.log(`  ✓ ${assetId} already exists, skipping`);
    return true;
  }

  try {
    // Fetch file list from Polyhaven API
    const filesData = await fetchJson(`https://api.polyhaven.com/files/${assetId}`);

    if (!filesData.gltf) {
      console.log(`  ✗ ${assetId}: no GLTF format available`);
      return false;
    }

    // Prefer 1k resolution, fallback to 2k
    const resolution = filesData.gltf['1k'] || filesData.gltf['2k'];
    if (!resolution?.gltf) {
      console.log(`  ✗ ${assetId}: no 1k/2k resolution available`);
      return false;
    }

    const gltfEntry = resolution.gltf;

    // Download main GLTF file (rename to standard name without resolution suffix)
    const gltfUrl = gltfEntry.url;
    const gltfDest = path.join(destDir, `${assetId}.gltf`);
    console.log(`  ↓ ${assetId}.gltf`);
    await downloadFile(gltfUrl, gltfDest);

    // Download included files (bin, textures)
    if (gltfEntry.include) {
      for (const [relPath, fileInfo] of Object.entries(gltfEntry.include) as [string, any][]) {
        const fileDest = path.join(destDir, relPath);
        console.log(`  ↓ ${relPath}`);
        await downloadFile(fileInfo.url, fileDest);
      }
    }

    // Fix GLTF references: the downloaded GLTF may reference the resolution-suffixed name
    // but we renamed it, so patch the bin reference if needed
    const gltfContent = fs.readFileSync(gltfDest, 'utf-8');
    const patchedContent = gltfContent
      .replace(new RegExp(`${assetId}_1k\\.gltf`, 'g'), `${assetId}.gltf`)
      .replace(new RegExp(`${assetId}_2k\\.gltf`, 'g'), `${assetId}.gltf`);

    // Texture references use relative paths (textures/xxx_1k.jpg) which should be fine
    if (patchedContent !== gltfContent) {
      fs.writeFileSync(gltfDest, patchedContent);
    }

    return true;
  } catch (err) {
    console.error(`  ✗ ${assetId}: ${err}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const categoryFilter = args.includes('--category')
    ? args[args.indexOf('--category') + 1]
    : null;

  const toDownload = PRIORITY_ASSETS.filter((a) => {
    if (ALREADY_DOWNLOADED.has(a.id)) return false;
    if (categoryFilter && a.category !== categoryFilter) return false;
    return true;
  });

  console.log(`\n🎨 Polyhaven Asset Downloader`);
  console.log(`  Total priority assets: ${PRIORITY_ASSETS.length}`);
  console.log(`  Already downloaded: ${PRIORITY_ASSETS.filter((a) => ALREADY_DOWNLOADED.has(a.id)).length}`);
  console.log(`  To download: ${toDownload.length}`);
  if (dryRun) {
    console.log(`\n  [DRY RUN] Would download:`);
    for (const a of toDownload) {
      console.log(`    ${a.id} → ${a.category}/polyhaven/${a.id}/`);
    }
    return;
  }

  console.log(`\nDownloading...\n`);

  let success = 0;
  let failed = 0;

  for (const asset of toDownload) {
    console.log(`[${success + failed + 1}/${toDownload.length}] ${asset.id} (${asset.semanticRole})`);
    const ok = await downloadAsset(asset.id, asset.category);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n✅ Done: ${success} downloaded, ${failed} failed`);
  console.log(`Total assets on disk: ${success + PRIORITY_ASSETS.filter((a) => ALREADY_DOWNLOADED.has(a.id)).length}`);
}

main().catch(console.error);
