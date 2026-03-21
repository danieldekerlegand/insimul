#!/usr/bin/env tsx
/**
 * Migration 026: Register newly downloaded Polyhaven prop/furniture assets
 *
 * Registers 43 new 3D model assets downloaded by scripts/download-polyhaven-assets.ts
 * into the visual_assets collection so the game engine can reference them.
 *
 * Usage:
 *   npx tsx server/migrations/026-register-new-prop-assets.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Assets to register: [polyhavenId, category, semanticRole, description]
const NEW_ASSETS: Array<{
  id: string;
  category: 'furniture' | 'props';
  semanticRole: string;
  description: string;
}> = [
  // Furniture: Tables
  { id: 'WoodenTable_03', category: 'furniture', semanticRole: 'furniture_table_round', description: 'Round wooden table' },
  { id: 'CoffeeTable_01', category: 'furniture', semanticRole: 'furniture_coffee_table', description: 'Low coffee table' },
  { id: 'coffee_table_round_01', category: 'furniture', semanticRole: 'furniture_coffee_table_round', description: 'Round coffee table' },
  { id: 'chinese_tea_table', category: 'furniture', semanticRole: 'furniture_tea_table', description: 'Chinese tea table' },
  // Furniture: Chairs
  { id: 'WoodenChair_01', category: 'furniture', semanticRole: 'furniture_chair_wooden', description: 'Simple wooden chair' },
  { id: 'dining_chair_02', category: 'furniture', semanticRole: 'furniture_chair_dining', description: 'Upholstered dining chair' },
  { id: 'SchoolChair_01', category: 'furniture', semanticRole: 'furniture_chair_school', description: 'School chair' },
  { id: 'chinese_armchair', category: 'furniture', semanticRole: 'furniture_armchair_ornate', description: 'Ornate Chinese armchair' },
  { id: 'chinese_stool', category: 'furniture', semanticRole: 'furniture_stool_ornate', description: 'Chinese wooden stool' },
  { id: 'BarberShopChair_01', category: 'furniture', semanticRole: 'furniture_chair_barber', description: 'Barber shop chair' },
  // Furniture: Beds & Bedroom
  { id: 'ClassicNightstand_01', category: 'furniture', semanticRole: 'furniture_nightstand', description: 'Classic wooden nightstand' },
  { id: 'GothicCommode_01', category: 'furniture', semanticRole: 'furniture_dresser', description: 'Gothic commode/dresser' },
  // Furniture: Seating
  { id: 'Sofa_01', category: 'furniture', semanticRole: 'furniture_sofa', description: 'Upholstered sofa' },
  { id: 'Ottoman_01', category: 'furniture', semanticRole: 'furniture_ottoman', description: 'Upholstered ottoman' },
  { id: 'chinese_sofa', category: 'furniture', semanticRole: 'furniture_sofa_ornate', description: 'Ornate Chinese sofa' },
  // Furniture: Storage & Shelving
  { id: 'chinese_cabinet', category: 'furniture', semanticRole: 'furniture_cabinet_ornate', description: 'Ornate Chinese cabinet' },
  { id: 'chinese_console_table', category: 'furniture', semanticRole: 'furniture_console', description: 'Chinese console table' },
  { id: 'chinese_screen_panels', category: 'furniture', semanticRole: 'furniture_screen', description: 'Decorative screen panels' },
  // Furniture: Desks
  { id: 'SchoolDesk_01', category: 'furniture', semanticRole: 'furniture_desk', description: 'School desk' },
  // Lighting
  { id: 'Chandelier_02', category: 'furniture', semanticRole: 'chandelier_ornate', description: 'Ornate chandelier variant' },
  { id: 'Chandelier_03', category: 'furniture', semanticRole: 'chandelier_simple', description: 'Simple chandelier' },
  { id: 'desk_lamp_arm_01', category: 'furniture', semanticRole: 'desk_lamp', description: 'Articulated desk lamp' },
  // Props: Kitchen & Food
  { id: 'brass_pan_01', category: 'props', semanticRole: 'kitchen_pan', description: 'Brass cooking pan' },
  { id: 'brass_pot_01', category: 'props', semanticRole: 'kitchen_pot', description: 'Brass cooking pot' },
  { id: 'brass_pot_02', category: 'props', semanticRole: 'kitchen_pot_large', description: 'Large brass pot' },
  { id: 'croissant', category: 'props', semanticRole: 'food_croissant', description: 'Croissant pastry' },
  { id: 'carrot_cake', category: 'props', semanticRole: 'food_cake', description: 'Carrot cake' },
  { id: 'CheeseBox_01', category: 'props', semanticRole: 'food_cheese', description: 'Cheese box' },
  { id: 'carved_wooden_plate', category: 'props', semanticRole: 'kitchen_plate', description: 'Carved wooden serving plate' },
  // Props: Decorative
  { id: 'antique_ceramic_vase_01', category: 'props', semanticRole: 'vase_antique', description: 'Antique ceramic vase' },
  { id: 'brass_vase_01', category: 'props', semanticRole: 'vase_brass', description: 'Brass vase' },
  { id: 'ceramic_vase_01', category: 'props', semanticRole: 'vase_ceramic', description: 'Ceramic vase' },
  { id: 'ceramic_vase_02', category: 'props', semanticRole: 'vase_ceramic_tall', description: 'Tall ceramic vase' },
  { id: 'chess_set', category: 'props', semanticRole: 'decoration_chess', description: 'Chess set' },
  { id: 'carved_wooden_elephant', category: 'props', semanticRole: 'decoration_elephant', description: 'Carved wooden elephant' },
  { id: 'brass_diya_lantern', category: 'props', semanticRole: 'lantern_ornate', description: 'Ornate brass diya lantern' },
  { id: 'alarm_clock_01', category: 'props', semanticRole: 'clock', description: 'Alarm clock' },
  { id: 'concrete_cat_statue', category: 'props', semanticRole: 'decoration_statue', description: 'Cat statue' },
  // Props: Containers
  { id: 'Barrel_02', category: 'props', semanticRole: 'barrel_small', description: 'Small barrel' },
  { id: 'cardboard_box_01', category: 'props', semanticRole: 'box_cardboard', description: 'Cardboard box' },
  // Props: Tools
  { id: 'bench_vice_01', category: 'props', semanticRole: 'tool_vice', description: 'Bench vice' },
  { id: 'crowbar_01', category: 'props', semanticRole: 'tool_crowbar', description: 'Crowbar' },
];

async function main() {
  console.log('\n📦 Migration 026: Register new prop/furniture assets\n');

  let registered = 0;
  let skipped = 0;

  for (const asset of NEW_ASSETS) {
    const baseDir = asset.category === 'furniture'
      ? 'assets/models/furniture/polyhaven'
      : 'assets/models/props/polyhaven';
    const filePath = `${baseDir}/${asset.id}/${asset.id}.gltf`;

    // Verify file exists on disk
    const absPath = path.join(PROJECT_ROOT, 'client/public', filePath);
    if (!fs.existsSync(absPath)) {
      console.log(`  ⚠️  Skipping ${asset.id}: file not found at ${filePath}`);
      skipped++;
      continue;
    }

    // Check if already registered
    try {
      const existing = await (storage as any).getVisualAssetsByFilePath?.(filePath);
      if (existing && existing.length > 0) {
        console.log(`  ✓ ${asset.id} already registered`);
        skipped++;
        continue;
      }
    } catch {
      // Method may not exist, proceed with registration
    }

    const fileSize = fs.statSync(absPath).size;

    try {
      await storage.createVisualAsset({
        name: `${asset.description} (${asset.id})`,
        filePath,
        fileName: `${asset.id}.gltf`,
        assetType: 'model_prop' as any,
        mimeType: 'model/gltf+json',
        fileSize,
        status: 'completed',
        purpose: 'bundled',
        tags: [asset.category, asset.semanticRole, 'polyhaven', 'migration-026'],
        metadata: {
          source: 'polyhaven',
          polyhavenId: asset.id,
          semanticRole: asset.semanticRole,
          license: 'CC0',
          resolution: '1k',
          migratedBy: 'migration-026',
        },
      } as any);
      console.log(`  ✅ ${asset.id} → ${asset.semanticRole}`);
      registered++;
    } catch (e) {
      console.warn(`  ⚠️  Failed to register ${asset.id}: ${e}`);
    }
  }

  console.log(`\n📊 Results: ${registered} registered, ${skipped} skipped`);
  console.log('   Total new assets: furniture + props for interiors, food, kitchen, decor, containers, tools\n');

  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
