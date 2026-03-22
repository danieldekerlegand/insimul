/**
 * Migration: Fix French Louisiana collection to restore creole architecture settings
 *
 * The populate migration overwrote the French Louisiana collection's building
 * configs with generic settings. This restores the correct New Orleans Creole
 * architecture — wrought iron balconied townhouses, colorful shotgun houses
 * with front porches, and Creole cottages with shuttered windows.
 *
 * Usage:
 *   npx tsx server/db/migrations/fix-french-louisiana-collection.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import mongoose, { Schema } from 'mongoose';

const AssetCollectionSchema = new Schema({}, { strict: false });
const AssetCollectionModel = mongoose.model('AssetCollection', AssetCollectionSchema, 'assetcollections');

// New Orleans Creole color palettes
const CREOLE_WALLS = [
  { r: 0.9, g: 0.85, b: 0.7 },   // warm cream
  { r: 0.85, g: 0.75, b: 0.55 },  // golden ochre
  { r: 0.75, g: 0.82, b: 0.78 },  // seafoam green
  { r: 0.88, g: 0.78, b: 0.68 },  // peach
  { r: 0.7, g: 0.78, b: 0.85 },   // powder blue
  { r: 0.82, g: 0.7, b: 0.72 },   // dusty rose
  { r: 0.92, g: 0.88, b: 0.75 },  // buttercream
];

const CREOLE_ROOF = { r: 0.25, g: 0.2, b: 0.15 };     // dark brown slate
const CREOLE_WINDOW = { r: 0.75, g: 0.8, b: 0.85 };    // light blue-gray glass
const CREOLE_DOOR = { r: 0.3, g: 0.45, b: 0.35 };      // dark green (traditional)
const CREOLE_SHUTTER = { r: 0.2, g: 0.35, b: 0.28 };   // forest green shutters
const CREOLE_IRONWORK = { r: 0.15, g: 0.15, b: 0.15 };  // black wrought iron

// Common creole features
const CREOLE_FEATURES = {
  hasBalcony: true,
  hasIronworkBalcony: true,
  hasPorch: true,
  hasShutters: true,
  porchDepth: 4,
  porchSteps: 3,
  shutterColor: CREOLE_SHUTTER,
};

// Category presets with creole architecture
const categoryPresets: Record<string, any> = {
  commercial_food: {
    id: 'cat_commercial_food',
    name: 'Creole Commercial — Food',
    baseColors: [CREOLE_WALLS[0], CREOLE_WALLS[1], CREOLE_WALLS[6]],
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: CREOLE_DOOR,
    materialType: 'stucco',
    architectureStyle: 'creole',
    roofStyle: 'hip',
    ...CREOLE_FEATURES,
  },
  commercial_retail: {
    id: 'cat_commercial_retail',
    name: 'Creole Commercial — Retail',
    baseColors: [CREOLE_WALLS[2], CREOLE_WALLS[4], CREOLE_WALLS[5]],
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: CREOLE_DOOR,
    materialType: 'stucco',
    architectureStyle: 'creole',
    roofStyle: 'hip',
    ...CREOLE_FEATURES,
  },
  commercial_service: {
    id: 'cat_commercial_service',
    name: 'Creole Commercial — Service',
    baseColors: [CREOLE_WALLS[0], CREOLE_WALLS[3], CREOLE_WALLS[6]],
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: CREOLE_DOOR,
    materialType: 'stucco',
    architectureStyle: 'creole',
    roofStyle: 'hip',
    ...CREOLE_FEATURES,
  },
  civic: {
    id: 'cat_civic',
    name: 'Creole Civic',
    baseColors: [{ r: 0.92, g: 0.9, b: 0.85 }, { r: 0.85, g: 0.82, b: 0.75 }],
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: { r: 0.35, g: 0.25, b: 0.18 },
    materialType: 'brick',
    architectureStyle: 'creole',
    roofStyle: 'hipped_dormers',
    hasBalcony: true,
    hasIronworkBalcony: true,
    hasShutters: true,
    shutterColor: CREOLE_SHUTTER,
  },
  industrial: {
    id: 'cat_industrial',
    name: 'Creole Industrial',
    baseColors: [{ r: 0.7, g: 0.62, b: 0.5 }, { r: 0.65, g: 0.58, b: 0.48 }],
    roofColor: { r: 0.3, g: 0.28, b: 0.22 },
    windowColor: CREOLE_WINDOW,
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'brick',
    architectureStyle: 'creole',
    roofStyle: 'gable',
    hasShutters: true,
    shutterColor: CREOLE_SHUTTER,
  },
  maritime: {
    id: 'cat_maritime',
    name: 'Creole Maritime',
    baseColors: [{ r: 0.8, g: 0.85, b: 0.88 }, CREOLE_WALLS[4]],
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: CREOLE_DOOR,
    materialType: 'wood',
    architectureStyle: 'creole',
    roofStyle: 'hip',
    hasPorch: true,
    hasShutters: true,
    porchDepth: 3,
    porchSteps: 2,
    shutterColor: CREOLE_SHUTTER,
  },
  residential: {
    id: 'cat_residential',
    name: 'Creole Residential',
    baseColors: CREOLE_WALLS,
    roofColor: CREOLE_ROOF,
    windowColor: CREOLE_WINDOW,
    doorColor: CREOLE_DOOR,
    materialType: 'wood',
    architectureStyle: 'creole',
    roofStyle: 'hip',
    ...CREOLE_FEATURES,
  },
};

// All building types get procedural mode with creole style
const ALL_BUILDING_TYPES = [
  'Restaurant', 'Bar', 'Bakery', 'Brewery',
  'Shop', 'GroceryStore', 'JewelryStore', 'BookStore', 'PawnShop', 'HerbShop',
  'Bank', 'Hotel', 'Barbershop', 'Tailor', 'Bathhouse', 'DentalOffice',
  'OptometryOffice', 'Pharmacy', 'LawFirm', 'InsuranceOffice', 'RealEstateOffice', 'TattoParlor',
  'Church', 'TownHall', 'School', 'University', 'Hospital', 'PoliceStation', 'FireStation', 'Daycare', 'Mortuary',
  'Factory', 'Farm', 'Warehouse', 'Blacksmith', 'Carpenter', 'Butcher',
  'Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse',
  'house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home',
];

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting...`);
  await mongoose.connect(mongoUri);

  // Find French Louisiana collection(s)
  const docs = await AssetCollectionModel.find({
    $or: [
      { name: /french.*louisiana/i },
      { name: /louisiana/i },
      { worldType: 'historical-french-colonial' },
    ]
  });

  if (docs.length === 0) {
    console.log('No French Louisiana collection found.');
    await mongoose.disconnect();
    return;
  }

  for (const doc of docs) {
    const data = doc.toObject() as any;
    console.log(`Fixing "${data.name}"...`);

    const existing = data.worldTypeConfig || {};

    // Build building type configs — all procedural, inheriting from category presets
    const buildingTypeConfigs: Record<string, any> = {};
    for (const typeName of ALL_BUILDING_TYPES) {
      // Preserve existing asset assignments if any
      const existingCfg = existing.buildingConfig?.buildingTypeConfigs?.[typeName];
      if (existingCfg?.mode === 'asset' && existingCfg?.assetId) {
        buildingTypeConfigs[typeName] = existingCfg;
      } else {
        buildingTypeConfigs[typeName] = { mode: 'procedural', styleOverrides: {} };
      }
    }

    const groundConfig = {
      ground: { mode: 'procedural' as const, color: { r: 0.35, g: 0.5, b: 0.3 }, tiling: 4 },
      road: { mode: 'procedural' as const, color: { r: 0.45, g: 0.42, b: 0.38 }, tiling: 4 },
      sidewalk: { mode: 'procedural' as const, color: { r: 0.6, g: 0.58, b: 0.52 }, tiling: 4 },
    };

    const characterConfig = {
      ...(existing.characterConfig || {}),
      npcClothingPalette: [
        '#8B4513', '#2F4F4F', '#800020', '#191970', '#556B2F',
        '#4B0082', '#CD853F', '#DAA520', '#8B0000', '#006400',
      ],
      npcSkinTonePalette: [
        '#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524',
        '#6B3A2A', '#4A2511', '#3B1F0E',
      ],
    };

    const worldTypeConfig = {
      ...existing,
      buildingConfig: {
        buildingTypeConfigs,
        categoryPresets,
      },
      groundConfig: existing.groundConfig || groundConfig,
      characterConfig,
      // Preserve nature and item configs
      natureConfig: existing.natureConfig,
      itemConfig: existing.itemConfig,
    };

    await AssetCollectionModel.updateOne(
      { _id: doc._id },
      { $set: { worldTypeConfig } },
    );

    console.log(`  ✓ Restored creole architecture for "${data.name}" — ${Object.keys(categoryPresets).length} category presets, ${ALL_BUILDING_TYPES.length} building types`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
