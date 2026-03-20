#!/usr/bin/env tsx
/**
 * Migration 023: Fill collection model gaps
 *
 * Populates the empty buildingModels, characterModels, playerModels fields
 * in all base asset collections, expands questObjectModels, and adds missing
 * objectModel slots for cyberpunk/sci-fi item roles.
 *
 * Depends on migration 022 having registered character/building/quest assets in DB.
 *
 * Usage:
 *   npx tsx server/migrations/023-fill-collection-model-gaps.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Asset lookup helpers ────────────────────────────────────────────────────

/** Build a map of filePath → asset ID from all visual assets in DB */
async function buildAssetPathMap(): Promise<Map<string, string>> {
  const allAssets = await (storage as any).getAllVisualAssets();
  const map = new Map<string, string>();
  for (const a of allAssets) {
    if (a.filePath) map.set(a.filePath, a.id);
  }
  return map;
}

/** Find asset ID by partial path match (e.g., filename contains "npc_guard") */
function findAssetByPartial(pathMap: Map<string, string>, partial: string): string | null {
  for (const [fp, id] of pathMap.entries()) {
    if (fp.includes(partial)) return id;
  }
  return null;
}

// ─── Building model mappings ─────────────────────────────────────────────────

const BUILDING_ROLES: Record<string, string> = {
  house: 'building_home_A_blue',
  home: 'building_home_B_blue',
  blacksmith: 'building_blacksmith_blue',
  church: 'building_church_blue',
  barracks: 'building_barracks_blue',
  castle: 'building_castle_blue',
  tavern: 'building_tavern_blue',
  market: 'building_market_blue',
  mine: 'building_mine_blue',
  windmill: 'building_windmill_blue',
  watermill: 'building_watermill_blue',
  lumbermill: 'building_lumbermill_blue',
  well: 'building_well_blue',
};

// ─── Character model mappings ────────────────────────────────────────────────

function buildCharacterModels(pathMap: Map<string, string>, genre: string): Record<string, string> {
  const models: Record<string, string> = {};

  // Try genre-specific first, fallback to generic
  const genreMap = genre === 'generic' ? 'generic' :
    ['fantasy', 'medieval-fantasy', 'high-fantasy', 'dark-fantasy', 'low-fantasy'].includes(genre) ? 'fantasy' :
    ['cyberpunk', 'sci-fi-space', 'post-apocalyptic', 'solarpunk', 'dieselpunk'].includes(genre) ? 'scifi' :
    ['modern-realistic', 'urban-fantasy', 'superhero', 'horror'].includes(genre) ? 'modern' :
    'generic';

  const tryGenres = [genreMap, 'generic'];

  for (const g of tryGenres) {
    if (Object.keys(models).length > 0) break;

    const civMale = findAssetByPartial(pathMap, `characters/${g}/npc_civilian_male`);
    const civFemale = findAssetByPartial(pathMap, `characters/${g}/npc_civilian_female`);
    const guard = findAssetByPartial(pathMap, `characters/${g}/npc_guard`);
    const merchant = findAssetByPartial(pathMap, `characters/${g}/npc_merchant`);

    // For genres with gendered variants
    const maleAvg = findAssetByPartial(pathMap, `characters/${g}/npc_male_average`);
    const femaleAvg = findAssetByPartial(pathMap, `characters/${g}/npc_female_average`);

    const defaultNpc = civMale || maleAvg;

    if (defaultNpc) {
      models['npcDefault'] = defaultNpc;
      models['civilian'] = defaultNpc;
    }
    if (civMale || maleAvg) models['civilian_male'] = (civMale || maleAvg)!;
    if (civFemale || femaleAvg) models['civilian_female'] = (civFemale || femaleAvg)!;
    if (guard) {
      models['guard'] = guard;
    } else if (findAssetByPartial(pathMap, `characters/${g}/npc_guard_male`)) {
      models['guard'] = findAssetByPartial(pathMap, `characters/${g}/npc_guard_male`)!;
      const guardF = findAssetByPartial(pathMap, `characters/${g}/npc_guard_female`);
      if (guardF) models['guard_female'] = guardF;
    }
    if (merchant) {
      models['merchant'] = merchant;
    } else if (findAssetByPartial(pathMap, `characters/${g}/npc_merchant_male`)) {
      models['merchant'] = findAssetByPartial(pathMap, `characters/${g}/npc_merchant_male`)!;
      const merchantF = findAssetByPartial(pathMap, `characters/${g}/npc_merchant_female`);
      if (merchantF) models['merchant_female'] = merchantF;
    }
    if (defaultNpc) models['questgiver'] = defaultNpc;
  }

  return models;
}

function buildPlayerModels(pathMap: Map<string, string>): Record<string, string> {
  const models: Record<string, string> = {};
  const def = findAssetByPartial(pathMap, 'player_default.glb');
  const male = findAssetByPartial(pathMap, 'player_male.glb');
  const female = findAssetByPartial(pathMap, 'player_female.glb');
  if (def) models['default'] = def;
  if (male) models['male'] = male;
  if (female) models['female'] = female;
  return models;
}

// ─── Quest object mappings ───────────────────────────────────────────────────

function buildQuestObjectModels(pathMap: Map<string, string>): Record<string, string> {
  const models: Record<string, string> = {};
  const mappings: Record<string, string> = {
    collectible: 'collectible_gem',
    container: 'chest.glb',
    marker: 'quest_marker',
    lamp: 'brass_lamp',
    bottle: 'water_bottle',
  };
  for (const [role, partial] of Object.entries(mappings)) {
    const id = findAssetByPartial(pathMap, partial);
    if (id) models[role] = id;
  }
  return models;
}

// ─── Missing objectModel roles for cyberpunk/sci-fi ──────────────────────────

const MISSING_OBJECT_ROLES: Record<string, string> = {
  // Map missing objectRoles to closest existing Polyhaven model polyhavenId
  rifle: 'antique_estoc',
  pistol: 'vintage_pocket_watch',
  baton: 'wooden_pole',
  grenade: 'moon_rock_01',
  syringe: 'vintage_oil_lamp',
  med_pack: 'metal_tool_chest',
  toolbox: 'metal_tool_chest',
  battery: 'barrel_stove',
  tank: 'Barrel_01',
  food_bar: 'book_encyclopedia_set_01',
  drink_can: 'brass_goblets',
  card: 'book_encyclopedia_set_01',
  wire_coil: 'wooden_pole',
  saddle: 'wooden_stool_01',
  dynamite: 'wooden_pole',
  can: 'brass_goblets',
};

// ─── Main migration ──────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 023: Fill Collection Model Gaps');
  console.log('='.repeat(60) + '\n');

  // Step 1: Build asset path → ID map
  console.log('📋 Loading all visual assets...');
  const pathMap = await buildAssetPathMap();
  console.log(`   ${pathMap.size} assets in database\n`);

  // Step 2: Build player models (same for all collections)
  const playerModels = buildPlayerModels(pathMap);
  console.log(`👤 Player models: ${Object.keys(playerModels).length} mapped`);
  for (const [k, v] of Object.entries(playerModels)) {
    console.log(`   ${k} → ${v.substring(0, 12)}...`);
  }

  // Step 3: Build building models (KayKit)
  const buildingModels: Record<string, string> = {};
  for (const [role, filename] of Object.entries(BUILDING_ROLES)) {
    const id = findAssetByPartial(pathMap, filename);
    if (id) buildingModels[role] = id;
  }
  console.log(`\n🏠 Building models: ${Object.keys(buildingModels).length} mapped`);

  // Step 4: Build quest object models
  const questObjectModels = buildQuestObjectModels(pathMap);
  console.log(`⚔️  Quest object models: ${Object.keys(questObjectModels).length} mapped`);

  // Step 5: Resolve missing objectModel role → asset IDs
  const missingObjectModels: Record<string, string> = {};
  for (const [role, polyhavenName] of Object.entries(MISSING_OBJECT_ROLES)) {
    const id = findAssetByPartial(pathMap, polyhavenName);
    if (id) missingObjectModels[role] = id;
  }
  console.log(`📦 Missing objectModel roles resolved: ${Object.keys(missingObjectModels).length}/${Object.keys(MISSING_OBJECT_ROLES).length}`);

  // Step 6: Update all base collections
  console.log('\n🔄 Updating base collections...\n');
  const allCollections = await storage.getAllAssetCollections();
  const baseCollections = allCollections.filter(c => c.isBase);
  console.log(`   ${baseCollections.length} base collections found\n`);

  let updated = 0;
  for (const collection of baseCollections) {
    const worldType = collection.worldType || 'generic';
    console.log(`   Processing: ${collection.name} (${worldType})`);

    const updates: any = {};

    // Building models — use KayKit for all collections (medieval-themed but usable as fallback)
    if (!collection.buildingModels || Object.keys(collection.buildingModels).length === 0) {
      updates.buildingModels = buildingModels;
      console.log(`     + buildingModels (${Object.keys(buildingModels).length} entries)`);
    }

    // Character models — genre-specific
    if (!collection.characterModels || Object.keys(collection.characterModels).length === 0) {
      const charModels = buildCharacterModels(pathMap, worldType);
      if (Object.keys(charModels).length > 0) {
        updates.characterModels = charModels;
        console.log(`     + characterModels (${Object.keys(charModels).length} entries)`);
      }
    }

    // Player models — same for all
    if (!collection.playerModels || Object.keys(collection.playerModels).length === 0) {
      if (Object.keys(playerModels).length > 0) {
        updates.playerModels = playerModels;
        console.log(`     + playerModels (${Object.keys(playerModels).length} entries)`);
      }
    }

    // Quest object models — expand
    const existingQuest = collection.questObjectModels || {};
    const mergedQuest = { ...existingQuest, ...questObjectModels };
    if (Object.keys(mergedQuest).length > Object.keys(existingQuest).length) {
      updates.questObjectModels = mergedQuest;
      console.log(`     + questObjectModels (${Object.keys(existingQuest).length} → ${Object.keys(mergedQuest).length})`);
    }

    // Missing objectModel roles — merge
    const existingObj = collection.objectModels || {};
    let objUpdated = false;
    const mergedObj = { ...existingObj };
    for (const [role, assetId] of Object.entries(missingObjectModels)) {
      if (!mergedObj[role]) {
        mergedObj[role] = assetId;
        objUpdated = true;
      }
    }
    if (objUpdated) {
      updates.objectModels = mergedObj;
      const addedCount = Object.keys(mergedObj).length - Object.keys(existingObj).length;
      console.log(`     + objectModels (+${addedCount} new roles)`);
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await storage.updateAssetCollection(collection.id, updates);
      updated++;
      console.log(`     ✅ Updated`);
    } else {
      console.log(`     (no changes needed)`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Migration complete! ${updated}/${baseCollections.length} collections updated`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('✅ Done'); process.exit(0); })
  .catch((error) => { console.error('❌ Failed:', error); process.exit(1); });
