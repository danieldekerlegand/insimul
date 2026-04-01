#!/usr/bin/env tsx
/**
 * Migration 051: Merge hardcoded theme data into asset collection (template) records
 *
 * Consolidates scattered theme-specific data from:
 * - shared/game-engine/world-type-presets/*.json (visual identity)
 * - shared/style-presets.ts (AI generation prompts, color palettes)
 * - server/engines/world-type-defaults.ts (simulation rates)
 *
 * Into a unified `templateConfig` field on each asset collection record,
 * making each record a self-contained world type template.
 *
 * Usage:
 *   npx tsx server/migrations/051-merge-theme-data-into-templates.ts
 *   npx tsx server/migrations/051-merge-theme-data-into-templates.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { getAllWorldTypePresets } from '../../shared/game-engine/world-type-presets/index.js';

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Style presets (AI generation prompts) ─────────────────────────────────

const STYLE_PRESETS: Record<string, {
  styleModifiers: string[];
  negativePrompts: string[];
  recommendedProvider?: string;
  recommendedQuality?: string;
  colorPalette?: string[];
}> = {
  'medieval-fantasy': {
    styleModifiers: ['medieval fantasy style', 'dungeons and dragons aesthetic', 'epic fantasy setting', 'swords and sorcery theme', 'tolkienesque atmosphere'],
    negativePrompts: ['modern', 'contemporary', 'technology', 'sci-fi', 'futuristic'],
    recommendedProvider: 'flux',
    colorPalette: ['#8B4513', '#2F4F2F', '#FFD700', '#4B0082', '#8B0000'],
  },
  'dark-fantasy': {
    styleModifiers: ['dark fantasy aesthetic', 'gothic horror style', 'grim and foreboding atmosphere', 'dark souls inspired', 'moody lighting, shadows'],
    negativePrompts: ['bright', 'cheerful', 'colorful', 'happy', 'lighthearted'],
    recommendedProvider: 'stable-diffusion',
    colorPalette: ['#1a1a1a', '#4a0e0e', '#2d1b2e', '#1c2321', '#3d3d3d'],
  },
  'high-fantasy': {
    styleModifiers: ['high fantasy style', 'epic magical world', 'enchanted forests and crystal towers', 'vibrant magical atmosphere'],
    negativePrompts: ['modern', 'realistic', 'mundane', 'technology'],
    recommendedProvider: 'flux',
    colorPalette: ['#4169E1', '#FFD700', '#228B22', '#9932CC', '#FF6347'],
  },
  'low-fantasy': {
    styleModifiers: ['low fantasy style', 'realistic medieval with subtle magic', 'gritty and grounded'],
    negativePrompts: ['flashy magic', 'bright colors', 'high fantasy', 'sci-fi'],
    colorPalette: ['#696969', '#8B7355', '#556B2F', '#8B4513', '#2F4F4F'],
  },
  'urban-fantasy': {
    styleModifiers: ['urban fantasy style', 'modern city with hidden magical elements', 'neon and arcane blend'],
    negativePrompts: ['purely medieval', 'historical', 'no technology'],
    colorPalette: ['#1E90FF', '#FF1493', '#00CED1', '#FFD700', '#4B0082'],
  },
  'cyberpunk': {
    styleModifiers: ['cyberpunk aesthetic', 'neon-lit dystopian city', 'blade runner atmosphere', 'high tech low life', 'rain-slicked streets'],
    negativePrompts: ['nature', 'medieval', 'fantasy', 'clean', 'utopian'],
    recommendedProvider: 'stable-diffusion',
    colorPalette: ['#FF00FF', '#00FFFF', '#FF1493', '#7B68EE', '#1a1a2e'],
  },
  'sci-fi-space': {
    styleModifiers: ['science fiction space opera', 'interstellar setting', 'futuristic space stations', 'star wars/trek inspired'],
    negativePrompts: ['medieval', 'fantasy', 'magic', 'primitive'],
    colorPalette: ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'],
  },
  'solarpunk': {
    styleModifiers: ['solarpunk aesthetic', 'sustainable green technology', 'optimistic future', 'organic architecture with solar panels'],
    negativePrompts: ['dystopian', 'dark', 'polluted', 'industrial'],
    colorPalette: ['#228B22', '#32CD32', '#FFD700', '#87CEEB', '#F5F5DC'],
  },
  'steampunk': {
    styleModifiers: ['steampunk aesthetic', 'victorian era with steam-powered technology', 'brass and copper machinery', 'clockwork gears'],
    negativePrompts: ['modern', 'digital', 'plastic', 'minimalist'],
    recommendedProvider: 'flux',
    colorPalette: ['#B87333', '#CD7F32', '#8B4513', '#2F4F4F', '#DAA520'],
  },
  'dieselpunk': {
    styleModifiers: ['dieselpunk aesthetic', '1920s-1950s with advanced diesel technology', 'art deco with heavy machinery'],
    negativePrompts: ['modern digital', 'clean energy', 'medieval', 'fantasy'],
    colorPalette: ['#4A4A4A', '#8B0000', '#DAA520', '#2F4F4F', '#696969'],
  },
  'post-apocalyptic': {
    styleModifiers: ['post-apocalyptic wasteland', 'ruined civilization', 'survival in devastated world', 'mad max aesthetic'],
    negativePrompts: ['pristine', 'clean', 'new', 'utopian', 'lush'],
    colorPalette: ['#8B7355', '#696969', '#CD853F', '#8B0000', '#2F2F2F'],
  },
  'historical-ancient': {
    styleModifiers: ['ancient civilization aesthetic', 'Rome, Greece, Egypt style', 'classical architecture', 'ancient world setting'],
    negativePrompts: ['modern', 'technology', 'medieval European', 'fantasy magic'],
    colorPalette: ['#DAA520', '#CD853F', '#8B4513', '#FFFFF0', '#4682B4'],
  },
  'historical-medieval': {
    styleModifiers: ['realistic medieval European', 'historically accurate', 'no magic or fantasy elements', 'feudal society'],
    negativePrompts: ['fantasy', 'magic', 'monsters', 'modern', 'technology'],
    colorPalette: ['#8B4513', '#556B2F', '#696969', '#8B7355', '#2F4F4F'],
  },
  'historical-renaissance': {
    styleModifiers: ['Renaissance era aesthetic', 'art and science flourishing', 'Italian city-states', 'Leonardo da Vinci era'],
    negativePrompts: ['medieval', 'primitive', 'modern', 'fantasy'],
    colorPalette: ['#8B0000', '#DAA520', '#2F4F4F', '#4B0082', '#FFFFF0'],
  },
  'historical-victorian': {
    styleModifiers: ['Victorian era aesthetic', 'industrial revolution', 'gas lamps and cobblestones', 'Dickensian atmosphere'],
    negativePrompts: ['modern', 'fantasy', 'medieval', 'futuristic'],
    colorPalette: ['#2F4F4F', '#696969', '#8B4513', '#4B0082', '#DAA520'],
  },
  'wild-west': {
    styleModifiers: ['Wild West frontier style', 'cowboys and outlaws', 'dusty desert towns', 'saloons and sheriff offices'],
    negativePrompts: ['modern', 'technology', 'medieval', 'fantasy', 'urban'],
    colorPalette: ['#CD853F', '#8B4513', '#DAA520', '#D2691E', '#F4A460'],
  },
  'modern-realistic': {
    styleModifiers: ['modern contemporary setting', 'realistic everyday world', 'current-day architecture and fashion'],
    negativePrompts: ['fantasy', 'medieval', 'sci-fi', 'historical'],
    colorPalette: ['#4A4A4A', '#808080', '#DCDCDC', '#1E90FF', '#2F4F4F'],
  },
  'superhero': {
    styleModifiers: ['superhero comic style', 'powered individuals', 'dramatic action poses', 'urban heroics'],
    negativePrompts: ['realistic', 'mundane', 'historical', 'fantasy'],
    colorPalette: ['#FF0000', '#0000FF', '#FFD700', '#FF1493', '#00FF00'],
  },
  'horror': {
    styleModifiers: ['horror atmosphere', 'supernatural terrors', 'psychological dread', 'dim lighting, fog, decay'],
    negativePrompts: ['bright', 'cheerful', 'safe', 'clean', 'happy'],
    recommendedProvider: 'stable-diffusion',
    colorPalette: ['#1a1a1a', '#4a0e0e', '#2d2d2d', '#8B0000', '#556B2F'],
  },
  'mythological': {
    styleModifiers: ['mythological setting', 'gods and legendary creatures', 'ancient myths brought to life'],
    negativePrompts: ['modern', 'technology', 'realistic', 'mundane'],
    colorPalette: ['#FFD700', '#4169E1', '#FFFFF0', '#8B0000', '#228B22'],
  },
  'creole-colonial': {
    styleModifiers: ['New Orleans French Quarter aesthetic', 'Creole architecture', 'ironwork balconies', 'stucco facades', 'live oaks with Spanish moss'],
    negativePrompts: ['modern', 'futuristic', 'medieval European', 'Asian'],
    colorPalette: ['#F5F5DC', '#8B4513', '#DAA520', '#800020', '#2F4F4F'],
  },
  'tropical-pirate': {
    styleModifiers: ['Caribbean pirate aesthetic', 'tropical port towns', 'wooden ships and treasure maps', 'palm trees and sandy beaches'],
    negativePrompts: ['cold', 'snow', 'modern', 'futuristic', 'urban'],
    colorPalette: ['#00CED1', '#FFD700', '#8B4513', '#228B22', '#FF6347'],
  },
};

// ─── Simulation rates ──────────────────────────────────────────────────────

const SIMULATION_RATES: Record<string, any> = {
  'medieval-fantasy': { birthRate: 0.18, deathRateMultiplier: 1.4, marriageRate: 0.008, divorceRate: 0.0005, immigrationRate: 0.002, businessFoundingRate: 0.003, businessClosureRate: 0.002 },
  'modern-realistic': { birthRate: 0.10, deathRateMultiplier: 0.7, marriageRate: 0.005, divorceRate: 0.003, immigrationRate: 0.008, businessFoundingRate: 0.006, businessClosureRate: 0.004 },
  'sci-fi': { birthRate: 0.06, deathRateMultiplier: 0.4, marriageRate: 0.004, divorceRate: 0.004, immigrationRate: 0.012, businessFoundingRate: 0.008, businessClosureRate: 0.005 },
  'historical': { birthRate: 0.20, deathRateMultiplier: 1.6, marriageRate: 0.010, divorceRate: 0.0002, immigrationRate: 0.003, businessFoundingRate: 0.002, businessClosureRate: 0.003 },
};

function getSimulationRates(worldType: string): any {
  const wt = worldType.toLowerCase();
  if (SIMULATION_RATES[wt]) return SIMULATION_RATES[wt];
  if (wt.includes('fantasy') || wt.includes('medieval') || wt.includes('mytholog')) return SIMULATION_RATES['medieval-fantasy'];
  if (wt.includes('modern') || wt.includes('realistic') || wt.includes('superhero')) return SIMULATION_RATES['modern-realistic'];
  if (wt.includes('sci-fi') || wt.includes('cyber') || wt.includes('space') || wt.includes('solar') || wt.includes('steam') || wt.includes('diesel')) return SIMULATION_RATES['sci-fi'];
  if (wt.includes('histor') || wt.includes('ancient') || wt.includes('colonial') || wt.includes('victorian') || wt.includes('renaissance') || wt.includes('wild-west') || wt.includes('pirate')) return SIMULATION_RATES['historical'];
  return { birthRate: 0.15, deathRateMultiplier: 1.0, marriageRate: 0.006, divorceRate: 0.002, immigrationRate: 0.005, businessFoundingRate: 0.005, businessClosureRate: 0.003 };
}

// ─── Building style mapping ────────────────────────────────────────────────

function getBuildingStyle(worldType: string): string {
  const wt = worldType.toLowerCase();
  if (wt.includes('medieval') || wt.includes('fantasy') || wt.includes('mythological')) return 'medieval_stone';
  if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('space') || wt.includes('solar')) return 'futuristic_metal';
  if (wt.includes('modern') || wt.includes('superhero')) return 'modern_concrete';
  if (wt.includes('steam') || wt.includes('diesel') || wt.includes('victorian')) return 'victorian_brick';
  if (wt.includes('colonial') || wt.includes('pirate') || wt.includes('wild-west')) return 'rustic_wood';
  if (wt.includes('horror') || wt.includes('dark')) return 'gothic_stone';
  if (wt.includes('ancient') || wt.includes('renaissance')) return 'classical_stone';
  if (wt.includes('post-apocal')) return 'ruined_concrete';
  return 'medieval_wood';
}

// ─── Migration ─────────────────────────────────────────────────────────────

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL or DATABASE_URL not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');
  if (DRY_RUN) console.log('*** DRY RUN — no writes ***\n');

  const db = mongoose.connection.db!;
  // Rename collections to simpler names
  const renames: [string, string][] = [
    ['assetcollections', 'templates'],
    ['gametexts', 'texts'],
    ['visualassets', 'assets'],
    ['worldlanguages', 'languages'],
    ['generationjobs', 'jobs'],
  ];
  for (const [oldName, newName] of renames) {
    const exists = await db.listCollections({ name: oldName }).toArray();
    if (exists.length > 0) {
      if (!DRY_RUN) {
        await db.collection(oldName).rename(newName);
      }
      console.log(`  ✓ Renamed: ${oldName} → ${newName}`);
    }
  }
  // Drop obsolete collections that Mongoose was auto-recreating
  const dropList = ['playthroughs', 'playthroughdeltas', 'playthroughconversations', 'versionalerts', 'apikeys'];
  for (const name of dropList) {
    const exists = await db.listCollections({ name }).toArray();
    if (exists.length > 0) {
      if (!DRY_RUN) {
        await db.collection(name).drop();
      }
      console.log(`  ✗ Dropped obsolete collection: ${name}`);
    }
  }

  const coll = db.collection('templates');

  const presets = getAllWorldTypePresets();
  console.log(`\n051: Merging ${presets.length} world type presets into template records...\n`);

  let updated = 0;
  let created = 0;
  let errors = 0;

  for (const preset of presets) {
    if (preset.worldType === 'generic') continue;

    const stylePreset = STYLE_PRESETS[preset.worldType];
    const simRates = getSimulationRates(preset.worldType);
    const buildingStyle = getBuildingStyle(preset.worldType);

    const templateConfig = {
      label: preset.label,
      description: preset.description,

      visualPreset: {
        buildingPresets: preset.buildingPresets,
        buildingTextures: preset.buildingTextures,
        groundConfig: preset.groundConfig,
        characterConfig: preset.characterConfig,
        natureConfig: preset.natureConfig,
        objectConfig: preset.objectConfig,
      },

      stylePreset: stylePreset ? {
        styleModifiers: stylePreset.styleModifiers,
        negativePrompts: stylePreset.negativePrompts,
        recommendedProvider: stylePreset.recommendedProvider || 'flux',
        recommendedQuality: stylePreset.recommendedQuality || 'standard',
        colorPalette: stylePreset.colorPalette || [],
      } : null,

      simulationRates: simRates,
      defaultBuildingStyle: buildingStyle,
    };

    try {
      const existing = await coll.findOne({ worldType: preset.worldType });

      if (existing) {
        if (!DRY_RUN) {
          await coll.updateOne(
            { _id: existing._id },
            { $set: { templateConfig, collectionType: 'world_type_template', updatedAt: new Date() } },
          );
        }
        console.log(`  ✓ Updated: ${preset.worldType} (${preset.label})`);
        updated++;
      } else {
        if (!DRY_RUN) {
          await coll.insertOne({
            name: preset.label,
            description: preset.description,
            collectionType: 'world_type_template',
            worldType: preset.worldType,
            templateConfig,
            tags: [preset.worldType, 'template'],
            isBase: true,
            isPublic: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        console.log(`  + Created: ${preset.worldType} (${preset.label})`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ Failed: ${preset.worldType}:`, err);
      errors++;
    }
  }

  console.log(`\n✅ Migration complete: ${updated} updated, ${created} created, ${errors} errors`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
