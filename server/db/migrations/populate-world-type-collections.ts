/**
 * Migration: Populate all World Type Collections with comprehensive configs
 *
 * For every world type collection, this migration:
 *   1. Populates buildingConfig with procedural buildings for ALL building types
 *   2. Populates groundConfig with themed ground/road/sidewalk colors
 *   3. Populates characterConfig with player + NPC model roles and palettes
 *   4. Populates natureConfig with trees, vegetation, water, rocks
 *   5. Populates itemConfig with objects and quest objects
 *   6. Removes "Base Furniture", "Base Props & Objects", "Base Weapons & Tools" collections
 *
 * Non-destructive: only fills in missing config modules. Existing configs are preserved.
 *
 * Usage:
 *   npx tsx server/db/migrations/populate-world-type-collections.ts
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

// ─── Theme-specific style definitions ───────────────────────────────────────

interface ThemeColors {
  walls: Array<{ r: number; g: number; b: number }>;
  roof: { r: number; g: number; b: number };
  window: { r: number; g: number; b: number };
  door: { r: number; g: number; b: number };
  ground: { r: number; g: number; b: number };
  road: { r: number; g: number; b: number };
  sidewalk: { r: number; g: number; b: number };
  material: string;
  architecture: string;
  roofStyle?: string;
  features?: Record<string, boolean>;
  clothing: string[];
  skinTones: string[];
}

const THEME_DEFAULTS: Record<string, ThemeColors> = {
  'medieval-fantasy': {
    walls: [{ r: 0.75, g: 0.68, b: 0.55 }, { r: 0.65, g: 0.58, b: 0.45 }, { r: 0.8, g: 0.72, b: 0.6 }],
    roof: { r: 0.35, g: 0.25, b: 0.18 }, window: { r: 0.7, g: 0.75, b: 0.8 }, door: { r: 0.4, g: 0.28, b: 0.18 },
    ground: { r: 0.35, g: 0.5, b: 0.25 }, road: { r: 0.45, g: 0.4, b: 0.35 }, sidewalk: { r: 0.55, g: 0.5, b: 0.45 },
    material: 'wood', architecture: 'medieval', roofStyle: 'gable',
    clothing: ['#8B4513', '#2F4F4F', '#8B0000', '#191970', '#556B2F', '#4B0082', '#CD853F', '#DAA520'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'high-fantasy': {
    walls: [{ r: 0.85, g: 0.8, b: 0.7 }, { r: 0.7, g: 0.65, b: 0.55 }, { r: 0.9, g: 0.85, b: 0.75 }],
    roof: { r: 0.3, g: 0.2, b: 0.35 }, window: { r: 0.6, g: 0.7, b: 0.85 }, door: { r: 0.5, g: 0.35, b: 0.25 },
    ground: { r: 0.3, g: 0.55, b: 0.3 }, road: { r: 0.5, g: 0.45, b: 0.4 }, sidewalk: { r: 0.6, g: 0.55, b: 0.5 },
    material: 'stone', architecture: 'medieval', roofStyle: 'hipped_dormers',
    clothing: ['#4B0082', '#8B0000', '#006400', '#191970', '#DAA520', '#CD853F', '#800080', '#2F4F4F'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#90EE90', '#ADD8E6'],
  },
  'dark-fantasy': {
    walls: [{ r: 0.35, g: 0.3, b: 0.28 }, { r: 0.4, g: 0.35, b: 0.3 }, { r: 0.3, g: 0.25, b: 0.22 }],
    roof: { r: 0.2, g: 0.15, b: 0.12 }, window: { r: 0.4, g: 0.35, b: 0.3 }, door: { r: 0.25, g: 0.2, b: 0.15 },
    ground: { r: 0.25, g: 0.3, b: 0.2 }, road: { r: 0.3, g: 0.28, b: 0.25 }, sidewalk: { r: 0.35, g: 0.32, b: 0.3 },
    material: 'stone', architecture: 'medieval', roofStyle: 'gable',
    features: { hasShutters: true },
    clothing: ['#1a1a1a', '#2d1b2e', '#3d0c02', '#1c1c3e', '#2e2e2e', '#4a0e0e', '#0d0d0d'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#d3c6b5'],
  },
  'cyberpunk': {
    walls: [{ r: 0.25, g: 0.25, b: 0.3 }, { r: 0.2, g: 0.22, b: 0.28 }, { r: 0.3, g: 0.28, b: 0.35 }],
    roof: { r: 0.15, g: 0.15, b: 0.2 }, window: { r: 0.3, g: 0.8, b: 0.9 }, door: { r: 0.2, g: 0.2, b: 0.25 },
    ground: { r: 0.2, g: 0.2, b: 0.22 }, road: { r: 0.15, g: 0.15, b: 0.18 }, sidewalk: { r: 0.25, g: 0.25, b: 0.28 },
    material: 'metal', architecture: 'futuristic', roofStyle: 'flat',
    clothing: ['#0ff', '#f0f', '#ff0', '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#b0c4de', '#778899'],
  },
  'steampunk': {
    walls: [{ r: 0.6, g: 0.5, b: 0.35 }, { r: 0.55, g: 0.45, b: 0.3 }, { r: 0.65, g: 0.55, b: 0.4 }],
    roof: { r: 0.4, g: 0.3, b: 0.2 }, window: { r: 0.7, g: 0.65, b: 0.5 }, door: { r: 0.45, g: 0.35, b: 0.2 },
    ground: { r: 0.35, g: 0.32, b: 0.25 }, road: { r: 0.4, g: 0.38, b: 0.3 }, sidewalk: { r: 0.5, g: 0.45, b: 0.38 },
    material: 'brick', architecture: 'industrial', roofStyle: 'gable',
    clothing: ['#8B4513', '#DAA520', '#B8860B', '#556B2F', '#2F4F4F', '#800000', '#4B0082', '#CD853F'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'sci-fi-space': {
    walls: [{ r: 0.7, g: 0.72, b: 0.75 }, { r: 0.6, g: 0.62, b: 0.65 }, { r: 0.8, g: 0.82, b: 0.85 }],
    roof: { r: 0.3, g: 0.32, b: 0.35 }, window: { r: 0.4, g: 0.7, b: 0.9 }, door: { r: 0.35, g: 0.37, b: 0.4 },
    ground: { r: 0.3, g: 0.32, b: 0.35 }, road: { r: 0.25, g: 0.27, b: 0.3 }, sidewalk: { r: 0.4, g: 0.42, b: 0.45 },
    material: 'metal', architecture: 'futuristic', roofStyle: 'flat',
    clothing: ['#c0c0c0', '#4682b4', '#2e2e2e', '#1a1a2e', '#e0e0e0', '#0077b6', '#48cae4'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#b8d4e3', '#7ec8e3'],
  },
  'historical-medieval': {
    walls: [{ r: 0.7, g: 0.65, b: 0.55 }, { r: 0.65, g: 0.6, b: 0.5 }, { r: 0.75, g: 0.7, b: 0.6 }],
    roof: { r: 0.35, g: 0.28, b: 0.2 }, window: { r: 0.65, g: 0.7, b: 0.75 }, door: { r: 0.4, g: 0.3, b: 0.2 },
    ground: { r: 0.35, g: 0.45, b: 0.25 }, road: { r: 0.45, g: 0.42, b: 0.38 }, sidewalk: { r: 0.5, g: 0.48, b: 0.42 },
    material: 'stone', architecture: 'medieval', roofStyle: 'gable',
    clothing: ['#8B4513', '#2F4F4F', '#556B2F', '#800000', '#191970', '#A0522D', '#6B8E23'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'historical-victorian': {
    walls: [{ r: 0.8, g: 0.75, b: 0.65 }, { r: 0.7, g: 0.65, b: 0.55 }, { r: 0.85, g: 0.8, b: 0.7 }],
    roof: { r: 0.3, g: 0.25, b: 0.2 }, window: { r: 0.75, g: 0.8, b: 0.85 }, door: { r: 0.35, g: 0.25, b: 0.18 },
    ground: { r: 0.3, g: 0.45, b: 0.25 }, road: { r: 0.4, g: 0.38, b: 0.35 }, sidewalk: { r: 0.55, g: 0.52, b: 0.48 },
    material: 'brick', architecture: 'colonial', roofStyle: 'hipped_dormers',
    features: { hasBalcony: true, hasShutters: true },
    clothing: ['#2F4F4F', '#191970', '#800020', '#3B3B3B', '#556B2F', '#8B4513', '#4B0082'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'post-apocalyptic': {
    walls: [{ r: 0.5, g: 0.45, b: 0.4 }, { r: 0.45, g: 0.4, b: 0.35 }, { r: 0.55, g: 0.5, b: 0.42 }],
    roof: { r: 0.35, g: 0.3, b: 0.25 }, window: { r: 0.45, g: 0.42, b: 0.38 }, door: { r: 0.4, g: 0.35, b: 0.3 },
    ground: { r: 0.4, g: 0.38, b: 0.3 }, road: { r: 0.35, g: 0.33, b: 0.28 }, sidewalk: { r: 0.42, g: 0.4, b: 0.35 },
    material: 'stone', architecture: 'rustic', roofStyle: 'flat',
    clothing: ['#556B2F', '#8B4513', '#2F4F4F', '#696969', '#8B0000', '#3B3B3B', '#A0522D'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'wild-west': {
    walls: [{ r: 0.7, g: 0.6, b: 0.45 }, { r: 0.65, g: 0.55, b: 0.4 }, { r: 0.75, g: 0.65, b: 0.5 }],
    roof: { r: 0.4, g: 0.3, b: 0.2 }, window: { r: 0.7, g: 0.72, b: 0.68 }, door: { r: 0.45, g: 0.35, b: 0.22 },
    ground: { r: 0.6, g: 0.5, b: 0.35 }, road: { r: 0.55, g: 0.48, b: 0.35 }, sidewalk: { r: 0.6, g: 0.55, b: 0.45 },
    material: 'wood', architecture: 'rustic', roofStyle: 'gable',
    clothing: ['#8B4513', '#DAA520', '#2F4F4F', '#A0522D', '#556B2F', '#CD853F', '#800000'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
  },
  'modern-realistic': {
    walls: [{ r: 0.85, g: 0.85, b: 0.85 }, { r: 0.75, g: 0.75, b: 0.75 }, { r: 0.9, g: 0.88, b: 0.85 }],
    roof: { r: 0.35, g: 0.35, b: 0.38 }, window: { r: 0.6, g: 0.7, b: 0.8 }, door: { r: 0.3, g: 0.3, b: 0.3 },
    ground: { r: 0.3, g: 0.5, b: 0.28 }, road: { r: 0.3, g: 0.3, b: 0.32 }, sidewalk: { r: 0.6, g: 0.6, b: 0.6 },
    material: 'glass', architecture: 'modern', roofStyle: 'flat',
    clothing: ['#2c3e50', '#34495e', '#7f8c8d', '#2980b9', '#27ae60', '#e74c3c', '#8e44ad', '#f39c12'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#4A2511', '#3B1F0E'],
  },
  'horror': {
    walls: [{ r: 0.35, g: 0.32, b: 0.3 }, { r: 0.3, g: 0.28, b: 0.25 }, { r: 0.4, g: 0.35, b: 0.3 }],
    roof: { r: 0.2, g: 0.18, b: 0.15 }, window: { r: 0.35, g: 0.3, b: 0.28 }, door: { r: 0.25, g: 0.2, b: 0.18 },
    ground: { r: 0.25, g: 0.28, b: 0.2 }, road: { r: 0.28, g: 0.25, b: 0.22 }, sidewalk: { r: 0.32, g: 0.3, b: 0.28 },
    material: 'stone', architecture: 'colonial', roofStyle: 'hipped_dormers',
    features: { hasShutters: true },
    clothing: ['#1a1a1a', '#2d1b2e', '#3d0c02', '#1c1c3e', '#2e2e2e', '#0d0d0d', '#3b0000'],
    skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#d0c8c0'],
  },
};

// Fallback for any unmatched world type
const GENERIC_THEME: ThemeColors = {
  walls: [{ r: 0.75, g: 0.7, b: 0.6 }, { r: 0.7, g: 0.65, b: 0.55 }],
  roof: { r: 0.35, g: 0.3, b: 0.25 }, window: { r: 0.7, g: 0.75, b: 0.8 }, door: { r: 0.4, g: 0.3, b: 0.2 },
  ground: { r: 0.35, g: 0.5, b: 0.3 }, road: { r: 0.45, g: 0.4, b: 0.35 }, sidewalk: { r: 0.55, g: 0.5, b: 0.45 },
  material: 'wood', architecture: 'colonial',
  clothing: ['#8B4513', '#2F4F4F', '#8B0000', '#191970', '#556B2F', '#4B0082', '#CD853F', '#DAA520'],
  skinTones: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A'],
};

// ─── Building types ─────────────────────────────────────────────────────────

const ALL_BUILDING_TYPES = [
  // commercial_food
  'Restaurant', 'Bar', 'Bakery', 'Brewery',
  // commercial_retail
  'Shop', 'GroceryStore', 'JewelryStore', 'BookStore', 'PawnShop', 'HerbShop',
  // commercial_service
  'Bank', 'Hotel', 'Barbershop', 'Tailor', 'Bathhouse', 'DentalOffice',
  'OptometryOffice', 'Pharmacy', 'LawFirm', 'InsuranceOffice', 'RealEstateOffice', 'TattoParlor',
  // civic
  'Church', 'TownHall', 'School', 'University', 'Hospital', 'PoliceStation', 'FireStation', 'Daycare', 'Mortuary',
  // industrial
  'Factory', 'Farm', 'Warehouse', 'Blacksmith', 'Carpenter', 'Butcher',
  // maritime
  'Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse',
  // residential
  'house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home',
];

const CATEGORY_MAP: Record<string, string> = {};
const CATEGORY_GROUPINGS: Record<string, string[]> = {
  commercial_food: ['Restaurant', 'Bar', 'Bakery', 'Brewery'],
  commercial_retail: ['Shop', 'GroceryStore', 'JewelryStore', 'BookStore', 'PawnShop', 'HerbShop'],
  commercial_service: ['Bank', 'Hotel', 'Barbershop', 'Tailor', 'Bathhouse', 'DentalOffice', 'OptometryOffice', 'Pharmacy', 'LawFirm', 'InsuranceOffice', 'RealEstateOffice', 'TattoParlor'],
  civic: ['Church', 'TownHall', 'School', 'University', 'Hospital', 'PoliceStation', 'FireStation', 'Daycare', 'Mortuary'],
  industrial: ['Factory', 'Farm', 'Warehouse', 'Blacksmith', 'Carpenter', 'Butcher'],
  maritime: ['Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse'],
  residential: ['house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home'],
};
for (const [cat, types] of Object.entries(CATEGORY_GROUPINGS)) {
  for (const t of types) CATEGORY_MAP[t] = cat;
}

function buildWorldTypeConfig(theme: ThemeColors) {
  // ── Building Config ─────────────────────────────────────────────────────
  const buildingTypeConfigs: Record<string, any> = {};
  for (const typeName of ALL_BUILDING_TYPES) {
    buildingTypeConfigs[typeName] = {
      mode: 'procedural',
      styleOverrides: {},
    };
  }

  const categoryPresets: Record<string, any> = {};
  for (const cat of Object.keys(CATEGORY_GROUPINGS)) {
    categoryPresets[cat] = {
      id: `cat_${cat}`,
      name: `${cat.replace(/_/g, ' ')} style`,
      baseColors: theme.walls,
      roofColor: theme.roof,
      windowColor: theme.window,
      doorColor: theme.door,
      materialType: theme.material,
      architectureStyle: theme.architecture,
      ...(theme.roofStyle ? { roofStyle: theme.roofStyle } : {}),
      ...(theme.features || {}),
    };
  }

  // ── Ground Config ───────────────────────────────────────────────────────
  const groundConfig = {
    ground: { mode: 'procedural', color: theme.ground, tiling: 4 },
    road: { mode: 'procedural', color: theme.road, tiling: 4 },
    sidewalk: { mode: 'procedural', color: theme.sidewalk, tiling: 4 },
  };

  // ── Character Config ────────────────────────────────────────────────────
  const characterConfig = {
    playerModels: {
      default: { mode: 'asset' },
      male: { mode: 'asset' },
      female: { mode: 'asset' },
    },
    characterModels: {
      civilian_male: { mode: 'asset' },
      civilian_female: { mode: 'asset' },
      guard: { mode: 'asset' },
      merchant: { mode: 'asset' },
      noble: { mode: 'asset' },
      elder: { mode: 'asset' },
      child: { mode: 'asset' },
      worker: { mode: 'asset' },
      priest: { mode: 'asset' },
      scholar: { mode: 'asset' },
    },
    npcBodyModels: [
      'outfit_male_peasant', 'outfit_female_peasant',
      'outfit_male_merchant', 'outfit_female_merchant',
      'outfit_male_noble', 'outfit_female_noble',
      'outfit_male_guard', 'outfit_female_worker',
    ],
    npcHairStyles: {
      male: ['short', 'medium', 'long', 'bald', 'mohawk', 'ponytail'],
      female: ['long', 'medium', 'short', 'ponytail', 'braids', 'bun', 'curly'],
    },
    npcClothingPalette: theme.clothing,
    npcSkinTonePalette: theme.skinTones,
  };

  // ── Nature Config ───────────────────────────────────────────────────────
  const natureConfig = {
    trees: {
      oak: { mode: 'asset' },
      pine: { mode: 'asset' },
      birch: { mode: 'asset' },
      willow: { mode: 'asset' },
      palm: { mode: 'asset' },
      maple: { mode: 'asset' },
      cypress: { mode: 'asset' },
      dead_tree: { mode: 'asset' },
    },
    vegetation: {
      grass_patch: { mode: 'asset' },
      bush: { mode: 'asset' },
      shrub: { mode: 'asset' },
      flower_bed: { mode: 'asset' },
      fern: { mode: 'asset' },
      ivy: { mode: 'asset' },
      tall_grass: { mode: 'asset' },
      moss: { mode: 'asset' },
    },
    water: {
      fountain: { mode: 'asset' },
      pond: { mode: 'asset' },
      stream: { mode: 'asset' },
      well: { mode: 'asset' },
      puddle: { mode: 'asset' },
    },
    rocks: {
      boulder: { mode: 'asset' },
      rock: { mode: 'asset' },
      pebbles: { mode: 'asset' },
      cliff_face: { mode: 'asset' },
      stone_pile: { mode: 'asset' },
    },
  };

  // ── Item Config ─────────────────────────────────────────────────────────
  const itemConfig = {
    objects: {
      chair: { mode: 'asset' },
      table: { mode: 'asset' },
      barrel: { mode: 'asset' },
      crate: { mode: 'asset' },
      lantern: { mode: 'asset' },
      sign: { mode: 'asset' },
      cart: { mode: 'asset' },
      fence: { mode: 'asset' },
      bench: { mode: 'asset' },
      ladder: { mode: 'asset' },
      bucket: { mode: 'asset' },
      basket: { mode: 'asset' },
      pot: { mode: 'asset' },
      candle: { mode: 'asset' },
      bookshelf: { mode: 'asset' },
      bed: { mode: 'asset' },
      chest: { mode: 'asset' },
      wardrobe: { mode: 'asset' },
      anvil: { mode: 'asset' },
      workbench: { mode: 'asset' },
      stool: { mode: 'asset' },
      rug: { mode: 'asset' },
      painting: { mode: 'asset' },
      mirror: { mode: 'asset' },
      fireplace: { mode: 'asset' },
      broom: { mode: 'asset' },
      shovel: { mode: 'asset' },
      axe: { mode: 'asset' },
      hammer: { mode: 'asset' },
      saw: { mode: 'asset' },
      sword: { mode: 'asset' },
      shield: { mode: 'asset' },
      bow: { mode: 'asset' },
      staff: { mode: 'asset' },
    },
    questObjects: {
      collectible: { mode: 'asset' },
      marker: { mode: 'asset' },
      container: { mode: 'asset' },
      key: { mode: 'asset' },
      scroll: { mode: 'asset' },
      chest: { mode: 'asset' },
      artifact: { mode: 'asset' },
      gem: { mode: 'asset' },
      potion: { mode: 'asset' },
      map: { mode: 'asset' },
      letter: { mode: 'asset' },
      relic: { mode: 'asset' },
    },
  };

  return {
    buildingConfig: {
      buildingTypeConfigs,
      categoryPresets,
    },
    groundConfig,
    characterConfig,
    natureConfig,
    itemConfig,
  };
}

// ─── Collections to remove ──────────────────────────────────────────────────

const COLLECTIONS_TO_REMOVE = [
  'Base Furniture',
  'Base Props & Objects',
  'Base Weapons & Tools',
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting to ${mongoUri.replace(/\/\/[^@]+@/, '//***@')}...`);
  await mongoose.connect(mongoUri);

  // 1. Remove base-only collections
  console.log('\n─── Removing base-only asset collections ───');
  for (const name of COLLECTIONS_TO_REMOVE) {
    const result = await AssetCollectionModel.deleteMany({ name });
    if (result.deletedCount > 0) {
      console.log(`  ✗ Removed "${name}" (${result.deletedCount} doc(s))`);
    } else {
      console.log(`  · "${name}" not found, skipping`);
    }
  }

  // 2. Populate all remaining collections
  console.log('\n─── Populating world type collections ───');
  const collections = await AssetCollectionModel.find({});
  let populated = 0;
  let skipped = 0;

  for (const doc of collections) {
    const data = doc.toObject() as any;
    const worldType = data.worldType || 'generic';
    const theme = THEME_DEFAULTS[worldType] || GENERIC_THEME;
    const fullConfig = buildWorldTypeConfig(theme);

    const existing = data.worldTypeConfig || {};

    // Helper: check if a config module is comprehensively populated
    // (not just present — it needs to have substantial content)
    const hasBuildingTypes = existing.buildingConfig?.buildingTypeConfigs &&
      Object.keys(existing.buildingConfig.buildingTypeConfigs).length >= ALL_BUILDING_TYPES.length;
    const hasCategoryPresets = existing.buildingConfig?.categoryPresets &&
      Object.keys(existing.buildingConfig.categoryPresets).length >= Object.keys(CATEGORY_GROUPINGS).length;
    const hasGround = existing.groundConfig?.ground && existing.groundConfig?.road && existing.groundConfig?.sidewalk;
    const hasCharacters = existing.characterConfig?.characterModels &&
      Object.keys(existing.characterConfig.characterModels).length >= 5 &&
      existing.characterConfig?.npcClothingPalette?.length > 0;
    const hasNature = existing.natureConfig?.trees &&
      Object.keys(existing.natureConfig.trees).length >= 5;
    const hasItems = existing.itemConfig?.objects &&
      Object.keys(existing.itemConfig.objects).length >= 10;

    // Overwrite each module that isn't comprehensively populated
    const merged: any = { ...existing };
    let changed = false;

    if (!hasBuildingTypes || !hasCategoryPresets) {
      merged.buildingConfig = fullConfig.buildingConfig;
      changed = true;
    }
    if (!hasGround) {
      merged.groundConfig = fullConfig.groundConfig;
      changed = true;
    }
    if (!hasCharacters) {
      merged.characterConfig = fullConfig.characterConfig;
      changed = true;
    }
    if (!hasNature) {
      merged.natureConfig = fullConfig.natureConfig;
      changed = true;
    }
    if (!hasItems) {
      merged.itemConfig = fullConfig.itemConfig;
      changed = true;
    }

    if (changed) {
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        { $set: { worldTypeConfig: merged, collectionType: 'world_type_collection' } },
      );
      console.log(`  → "${data.name}" (${worldType}) — populated missing/incomplete configs`);
      populated++;
    } else {
      console.log(`  ✓ "${data.name}" — already fully populated`);
      skipped++;
    }
  }

  console.log(`\nDone. Populated: ${populated}, Already complete: ${skipped}, Total: ${collections.length}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
