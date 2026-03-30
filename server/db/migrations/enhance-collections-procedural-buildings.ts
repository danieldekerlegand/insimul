/**
 * Migration: Enhance all World Type Collections with rich procedural building configs
 *
 * Sets ALL building types to procedural mode with themed textures and styles.
 * Sets ALL interiors to procedural mode. Assigns textures from Polyhaven library
 * based on world type theme. Ground textures are also assigned.
 *
 * Usage:
 *   npx tsx server/db/migrations/enhance-collections-procedural-buildings.ts
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

const VisualAssetSchema = new Schema({}, { strict: false });
const VisualAssetModel = mongoose.model('VisualAsset', VisualAssetSchema, 'visualassets');

// ─── Texture mapping ────────────────────────────────────────────────────────

// Map Polyhaven folder names → MongoDB asset IDs at runtime
let textureIdMap: Map<string, string> = new Map();

async function buildTextureMap() {
  const assets = await VisualAssetModel.find({
    'metadata.polyhavenId': { $exists: true },
  });
  for (const a of assets) {
    const data = a.toObject() as any;
    const phId = data.metadata?.polyhavenId;
    if (phId) {
      textureIdMap.set(phId, data._id.toString());
    }
  }
  console.log(`Loaded ${textureIdMap.size} texture assets from database`);
}

function tex(polyhavenId: string): string | undefined {
  return textureIdMap.get(polyhavenId);
}

// ─── All building types ─────────────────────────────────────────────────────

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

const CATEGORY_GROUPINGS: Record<string, string[]> = {
  commercial_food: ['Restaurant', 'Bar', 'Bakery', 'Brewery'],
  commercial_retail: ['Shop', 'GroceryStore', 'JewelryStore', 'BookStore', 'PawnShop', 'HerbShop'],
  commercial_service: ['Bank', 'Hotel', 'Barbershop', 'Tailor', 'Bathhouse', 'DentalOffice', 'OptometryOffice', 'Pharmacy', 'LawFirm', 'InsuranceOffice', 'RealEstateOffice', 'TattoParlor'],
  civic: ['Church', 'TownHall', 'School', 'University', 'Hospital', 'PoliceStation', 'FireStation', 'Daycare', 'Mortuary'],
  industrial: ['Factory', 'Farm', 'Warehouse', 'Blacksmith', 'Carpenter', 'Butcher'],
  maritime: ['Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse'],
  residential: ['house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home'],
};

// ─── Theme definitions ──────────────────────────────────────────────────────

interface CategoryTheme {
  baseColors: Array<{ r: number; g: number; b: number }>;
  roofColor: { r: number; g: number; b: number };
  windowColor: { r: number; g: number; b: number };
  doorColor: { r: number; g: number; b: number };
  materialType: string;
  architectureStyle: string;
  roofStyle?: string;
  hasBalcony?: boolean;
  hasIronworkBalcony?: boolean;
  hasPorch?: boolean;
  hasShutters?: boolean;
  porchDepth?: number;
  porchSteps?: number;
  shutterColor?: { r: number; g: number; b: number };
  // Polyhaven texture IDs (resolved to asset IDs at runtime)
  wallTexture?: string;
  roofTexture?: string;
  floorTexture?: string;
  doorTexture?: string;
}

interface WorldTheme {
  categories: Record<string, CategoryTheme>;
  ground: { texture?: string; color: { r: number; g: number; b: number } };
  road: { texture?: string; color: { r: number; g: number; b: number } };
  sidewalk: { texture?: string; color: { r: number; g: number; b: number } };
  interiorFloor?: string;
  interiorWall?: string;
  clothing: string[];
  skinTones: string[];
}

// Helper to make a category theme
function cat(
  colors: Array<[number, number, number]>,
  roof: [number, number, number],
  window: [number, number, number],
  door: [number, number, number],
  material: string,
  arch: string,
  opts: Partial<CategoryTheme> = {},
): CategoryTheme {
  return {
    baseColors: colors.map(([r, g, b]) => ({ r, g, b })),
    roofColor: { r: roof[0], g: roof[1], b: roof[2] },
    windowColor: { r: window[0], g: window[1], b: window[2] },
    doorColor: { r: door[0], g: door[1], b: door[2] },
    materialType: material,
    architectureStyle: arch,
    ...opts,
  };
}

const SKIN_DEFAULT = ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#6B3A2A', '#4A2511', '#3B1F0E'];

const THEMES: Record<string, WorldTheme> = {
  // ── Medieval Fantasy ─────────────────────────────────────────────────────
  'medieval-fantasy': {
    categories: {
      commercial_food: cat([[0.75, 0.68, 0.55], [0.8, 0.72, 0.6]], [0.35, 0.25, 0.18], [0.7, 0.75, 0.8], [0.4, 0.28, 0.18], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'half_timbered_wall_01', roofTexture: 'clay_roof_tiles' }),
      commercial_retail: cat([[0.7, 0.65, 0.5], [0.78, 0.72, 0.58]], [0.3, 0.22, 0.15], [0.7, 0.75, 0.8], [0.35, 0.25, 0.15], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'medieval_wall_01', roofTexture: 'clay_roof_tiles' }),
      commercial_service: cat([[0.72, 0.68, 0.58], [0.65, 0.6, 0.5]], [0.32, 0.25, 0.18], [0.7, 0.75, 0.8], [0.38, 0.28, 0.18], 'stone', 'medieval', { roofStyle: 'gable', wallTexture: 'castle_brick_01', roofTexture: 'clay_roof_tiles' }),
      civic: cat([[0.8, 0.78, 0.7], [0.75, 0.72, 0.65]], [0.3, 0.25, 0.2], [0.7, 0.75, 0.82], [0.35, 0.25, 0.18], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'medieval_blocks_02', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.6, 0.55, 0.45], [0.55, 0.5, 0.4]], [0.35, 0.3, 0.22], [0.55, 0.58, 0.6], [0.4, 0.3, 0.2], 'wood', 'rustic', { roofStyle: 'gable', wallTexture: 'brown_planks_03', roofTexture: 'brown_planks_05' }),
      maritime: cat([[0.65, 0.7, 0.72], [0.7, 0.72, 0.68]], [0.35, 0.3, 0.25], [0.65, 0.7, 0.75], [0.35, 0.3, 0.22], 'wood', 'rustic', { roofStyle: 'gable', wallTexture: 'old_planks_02' }),
      residential: cat([[0.75, 0.68, 0.55], [0.7, 0.62, 0.5], [0.8, 0.72, 0.58]], [0.35, 0.25, 0.18], [0.7, 0.75, 0.8], [0.4, 0.28, 0.18], 'wood', 'medieval', { roofStyle: 'gable', hasPorch: true, porchDepth: 2, porchSteps: 2, wallTexture: 'half_timbered_wall_01', roofTexture: 'clay_roof_tiles' }),
    },
    ground: { texture: 'forest_floor', color: { r: 0.35, g: 0.5, b: 0.25 } },
    road: { texture: 'cobblestone_floor_01', color: { r: 0.45, g: 0.4, b: 0.35 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.55, g: 0.5, b: 0.45 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'beige_wall_001',
    clothing: ['#8B4513', '#2F4F4F', '#8B0000', '#191970', '#556B2F', '#4B0082', '#CD853F', '#DAA520'],
    skinTones: SKIN_DEFAULT,
  },

  // ── French Louisiana (Creole) ────────────────────────────────────────────
  'historical-french-colonial': {
    categories: {
      commercial_food: cat([[0.9, 0.85, 0.7], [0.85, 0.75, 0.55], [0.92, 0.88, 0.75]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.3, 0.45, 0.35], 'stucco', 'creole', { roofStyle: 'hip', hasBalcony: true, hasIronworkBalcony: true, hasPorch: true, hasShutters: true, porchDepth: 4, porchSteps: 3, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'blue_painted_planks', roofTexture: 'red_slate_roof_tiles_01' }),
      commercial_retail: cat([[0.75, 0.82, 0.78], [0.7, 0.78, 0.85], [0.82, 0.7, 0.72]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.3, 0.45, 0.35], 'stucco', 'creole', { roofStyle: 'hip', hasBalcony: true, hasIronworkBalcony: true, hasPorch: true, hasShutters: true, porchDepth: 4, porchSteps: 3, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'dark_wooden_planks', roofTexture: 'roof_slates_03' }),
      commercial_service: cat([[0.9, 0.85, 0.7], [0.88, 0.78, 0.68]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.3, 0.45, 0.35], 'stucco', 'creole', { roofStyle: 'hip', hasBalcony: true, hasIronworkBalcony: true, hasPorch: true, hasShutters: true, porchDepth: 4, porchSteps: 3, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'green_rough_planks', roofTexture: 'roof_slates_02' }),
      civic: cat([[0.92, 0.9, 0.85], [0.85, 0.82, 0.75]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.35, 0.25, 0.18], 'brick', 'creole', { roofStyle: 'hipped_dormers', hasBalcony: true, hasIronworkBalcony: true, hasShutters: true, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'wood_plank_wall', roofTexture: 'grey_roof_01' }),
      industrial: cat([[0.7, 0.62, 0.5], [0.65, 0.58, 0.48]], [0.3, 0.28, 0.22], [0.65, 0.68, 0.7], [0.4, 0.3, 0.2], 'brick', 'creole', { roofStyle: 'gable', hasShutters: true, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'wooden_rough_planks', roofTexture: 'corrugated_iron' }),
      maritime: cat([[0.8, 0.85, 0.88], [0.7, 0.78, 0.85]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.3, 0.45, 0.35], 'wood', 'creole', { roofStyle: 'hip', hasPorch: true, hasShutters: true, porchDepth: 3, porchSteps: 2, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'dark_wooden_planks', roofTexture: 'corrugated_iron' }),
      residential: cat([[0.9, 0.85, 0.7], [0.85, 0.75, 0.55], [0.75, 0.82, 0.78], [0.88, 0.78, 0.68], [0.7, 0.78, 0.85], [0.82, 0.7, 0.72], [0.92, 0.88, 0.75]], [0.25, 0.2, 0.15], [0.75, 0.8, 0.85], [0.3, 0.45, 0.35], 'wood', 'creole', { roofStyle: 'hip', hasBalcony: true, hasIronworkBalcony: true, hasPorch: true, hasShutters: true, porchDepth: 4, porchSteps: 3, shutterColor: { r: 0.2, g: 0.35, b: 0.28 }, wallTexture: 'blue_painted_planks', roofTexture: 'red_slate_roof_tiles_01' }),
    },
    ground: { texture: 'sparse_grass', color: { r: 0.35, g: 0.5, b: 0.3 } },
    road: { texture: 'cobblestone_floor_01', color: { r: 0.45, g: 0.42, b: 0.38 } },
    sidewalk: { texture: 'brick_floor', color: { r: 0.6, g: 0.58, b: 0.52 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'beige_wall_001',
    clothing: ['#8B4513', '#2F4F4F', '#800020', '#191970', '#556B2F', '#4B0082', '#CD853F', '#DAA520', '#8B0000', '#006400'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Cyberpunk ────────────────────────────────────────────────────────────
  'cyberpunk': {
    categories: {
      commercial_food: cat([[0.25, 0.25, 0.3], [0.3, 0.28, 0.35]], [0.15, 0.15, 0.2], [0.3, 0.8, 0.9], [0.2, 0.2, 0.25], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_004', roofTexture: 'corrugated_iron' }),
      commercial_retail: cat([[0.2, 0.22, 0.28], [0.25, 0.25, 0.32]], [0.12, 0.12, 0.18], [0.3, 0.8, 0.9], [0.18, 0.18, 0.22], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_003', roofTexture: 'corrugated_iron_02' }),
      commercial_service: cat([[0.3, 0.3, 0.35], [0.25, 0.28, 0.32]], [0.15, 0.15, 0.2], [0.3, 0.8, 0.9], [0.2, 0.2, 0.25], 'glass', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_005' }),
      civic: cat([[0.35, 0.35, 0.4], [0.3, 0.32, 0.38]], [0.2, 0.2, 0.25], [0.3, 0.7, 0.9], [0.22, 0.22, 0.28], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_006' }),
      industrial: cat([[0.22, 0.22, 0.25], [0.18, 0.18, 0.22]], [0.12, 0.12, 0.15], [0.25, 0.6, 0.7], [0.15, 0.15, 0.18], 'metal', 'industrial', { roofStyle: 'flat', wallTexture: 'corrugated_iron', roofTexture: 'corrugated_iron_02' }),
      maritime: cat([[0.2, 0.25, 0.3], [0.25, 0.28, 0.32]], [0.15, 0.18, 0.22], [0.3, 0.7, 0.85], [0.2, 0.22, 0.25], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_004' }),
      residential: cat([[0.25, 0.25, 0.3], [0.2, 0.22, 0.28], [0.3, 0.28, 0.35]], [0.15, 0.15, 0.2], [0.3, 0.8, 0.9], [0.2, 0.2, 0.25], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_003', roofTexture: 'corrugated_iron_03' }),
    },
    ground: { texture: 'asphalt_02', color: { r: 0.2, g: 0.2, b: 0.22 } },
    road: { texture: 'asphalt_01', color: { r: 0.15, g: 0.15, b: 0.18 } },
    sidewalk: { texture: 'concrete_floor', color: { r: 0.25, g: 0.25, b: 0.28 } },
    interiorFloor: 'concrete_floor',
    interiorWall: 'concrete_wall_001',
    clothing: ['#0ff', '#f0f', '#ff0', '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Dark Fantasy ─────────────────────────────────────────────────────────
  'dark-fantasy': {
    categories: {
      commercial_food: cat([[0.35, 0.3, 0.28], [0.4, 0.35, 0.3]], [0.2, 0.15, 0.12], [0.4, 0.35, 0.3], [0.25, 0.2, 0.15], 'stone', 'medieval', { roofStyle: 'gable', hasShutters: true, shutterColor: { r: 0.2, g: 0.18, b: 0.15 }, wallTexture: 'old_stone_wall', roofTexture: 'castle_wall_slates' }),
      commercial_retail: cat([[0.38, 0.32, 0.28], [0.3, 0.25, 0.22]], [0.18, 0.15, 0.12], [0.35, 0.3, 0.28], [0.22, 0.18, 0.14], 'stone', 'medieval', { roofStyle: 'gable', hasShutters: true, wallTexture: 'mossy_stone_wall', roofTexture: 'castle_wall_slates' }),
      commercial_service: cat([[0.4, 0.35, 0.3], [0.35, 0.3, 0.25]], [0.2, 0.18, 0.15], [0.38, 0.33, 0.3], [0.25, 0.2, 0.15], 'stone', 'medieval', { roofStyle: 'gable', wallTexture: 'old_stone_wall_02' }),
      civic: cat([[0.45, 0.4, 0.35], [0.4, 0.38, 0.32]], [0.2, 0.18, 0.15], [0.35, 0.32, 0.3], [0.25, 0.2, 0.15], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'castle_brick_01', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.3, 0.28, 0.25], [0.28, 0.25, 0.22]], [0.2, 0.18, 0.15], [0.3, 0.28, 0.25], [0.22, 0.2, 0.15], 'stone', 'rustic', { roofStyle: 'gable', wallTexture: 'mossy_brick' }),
      maritime: cat([[0.35, 0.32, 0.3], [0.3, 0.28, 0.25]], [0.2, 0.18, 0.15], [0.35, 0.32, 0.28], [0.22, 0.2, 0.15], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'dark_wooden_planks' }),
      residential: cat([[0.35, 0.3, 0.28], [0.4, 0.35, 0.3], [0.3, 0.25, 0.22]], [0.2, 0.15, 0.12], [0.4, 0.35, 0.3], [0.25, 0.2, 0.15], 'stone', 'medieval', { roofStyle: 'gable', hasShutters: true, shutterColor: { r: 0.2, g: 0.18, b: 0.15 }, wallTexture: 'old_stone_wall', roofTexture: 'castle_wall_slates' }),
    },
    ground: { texture: 'forest_ground_04', color: { r: 0.25, g: 0.3, b: 0.2 } },
    road: { texture: 'mossy_cobblestone', color: { r: 0.3, g: 0.28, b: 0.25 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.35, g: 0.32, b: 0.3 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'old_stone_wall',
    clothing: ['#1a1a1a', '#2d1b2e', '#3d0c02', '#1c1c3e', '#2e2e2e', '#4a0e0e', '#0d0d0d'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Steampunk ────────────────────────────────────────────────────────────
  'steampunk': {
    categories: {
      commercial_food: cat([[0.6, 0.5, 0.35], [0.65, 0.55, 0.4]], [0.4, 0.3, 0.2], [0.7, 0.65, 0.5], [0.45, 0.35, 0.2], 'brick', 'industrial', { roofStyle: 'gable', wallTexture: 'brick_wall_001', roofTexture: 'corrugated_iron' }),
      commercial_retail: cat([[0.55, 0.48, 0.32], [0.6, 0.52, 0.38]], [0.38, 0.28, 0.18], [0.7, 0.65, 0.5], [0.42, 0.32, 0.2], 'brick', 'industrial', { roofStyle: 'gable', wallTexture: 'brick_wall_003', roofTexture: 'corrugated_iron_02' }),
      commercial_service: cat([[0.6, 0.52, 0.38], [0.58, 0.5, 0.35]], [0.4, 0.3, 0.2], [0.7, 0.65, 0.5], [0.45, 0.35, 0.22], 'brick', 'industrial', { roofStyle: 'gable', wallTexture: 'brick_wall_006' }),
      civic: cat([[0.65, 0.58, 0.45], [0.62, 0.55, 0.42]], [0.38, 0.3, 0.2], [0.7, 0.68, 0.55], [0.42, 0.32, 0.2], 'brick', 'industrial', { roofStyle: 'hipped_dormers', wallTexture: 'brick_wall_001' }),
      industrial: cat([[0.5, 0.45, 0.35], [0.48, 0.42, 0.32]], [0.35, 0.3, 0.22], [0.55, 0.5, 0.4], [0.38, 0.3, 0.2], 'metal', 'industrial', { roofStyle: 'gable', wallTexture: 'corrugated_iron', roofTexture: 'corrugated_iron_02' }),
      maritime: cat([[0.55, 0.5, 0.38], [0.58, 0.52, 0.4]], [0.38, 0.3, 0.22], [0.65, 0.6, 0.48], [0.4, 0.32, 0.2], 'wood', 'industrial', { roofStyle: 'gable', wallTexture: 'brown_planks_04' }),
      residential: cat([[0.6, 0.5, 0.35], [0.55, 0.45, 0.3], [0.65, 0.55, 0.4]], [0.4, 0.3, 0.2], [0.7, 0.65, 0.5], [0.45, 0.35, 0.2], 'brick', 'industrial', { roofStyle: 'gable', hasPorch: true, porchDepth: 2, porchSteps: 2, wallTexture: 'brick_wall_003', roofTexture: 'corrugated_iron' }),
    },
    ground: { texture: 'cobblestone_floor_01', color: { r: 0.35, g: 0.32, b: 0.25 } },
    road: { texture: 'cobblestone_03', color: { r: 0.4, g: 0.38, b: 0.3 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.5, g: 0.45, b: 0.38 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'brick_wall_001',
    clothing: ['#8B4513', '#DAA520', '#B8860B', '#556B2F', '#2F4F4F', '#800000', '#4B0082', '#CD853F'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Wild West ────────────────────────────────────────────────────────────
  'wild-west': {
    categories: {
      commercial_food: cat([[0.7, 0.6, 0.45], [0.75, 0.65, 0.5]], [0.4, 0.3, 0.2], [0.7, 0.72, 0.68], [0.45, 0.35, 0.22], 'wood', 'rustic', { roofStyle: 'gable', hasPorch: true, porchDepth: 3, porchSteps: 2, wallTexture: 'brown_planks_03' }),
      commercial_retail: cat([[0.68, 0.58, 0.42], [0.72, 0.62, 0.48]], [0.38, 0.28, 0.18], [0.68, 0.7, 0.65], [0.42, 0.32, 0.2], 'wood', 'rustic', { roofStyle: 'gable', hasPorch: true, porchDepth: 3, porchSteps: 2, wallTexture: 'brown_planks_04' }),
      commercial_service: cat([[0.72, 0.62, 0.48], [0.7, 0.6, 0.45]], [0.4, 0.3, 0.2], [0.7, 0.72, 0.68], [0.45, 0.35, 0.22], 'wood', 'rustic', { roofStyle: 'gable', hasPorch: true, porchDepth: 3, porchSteps: 2, wallTexture: 'brown_planks_05' }),
      civic: cat([[0.75, 0.68, 0.55], [0.72, 0.65, 0.52]], [0.38, 0.3, 0.2], [0.7, 0.72, 0.68], [0.42, 0.32, 0.2], 'wood', 'rustic', { roofStyle: 'gable', hasPorch: true, porchDepth: 4, porchSteps: 3, wallTexture: 'brown_planks_03' }),
      industrial: cat([[0.6, 0.52, 0.38], [0.58, 0.5, 0.35]], [0.38, 0.3, 0.22], [0.6, 0.62, 0.58], [0.4, 0.3, 0.2], 'wood', 'rustic', { roofStyle: 'gable', wallTexture: 'brown_planks_07' }),
      maritime: cat([[0.65, 0.58, 0.42], [0.62, 0.55, 0.4]], [0.38, 0.3, 0.2], [0.65, 0.68, 0.62], [0.4, 0.32, 0.2], 'wood', 'rustic', { roofStyle: 'gable', wallTexture: 'brown_planks_08' }),
      residential: cat([[0.7, 0.6, 0.45], [0.65, 0.55, 0.4], [0.75, 0.65, 0.5]], [0.4, 0.3, 0.2], [0.7, 0.72, 0.68], [0.45, 0.35, 0.22], 'wood', 'rustic', { roofStyle: 'gable', hasPorch: true, porchDepth: 4, porchSteps: 3, wallTexture: 'brown_planks_03' }),
    },
    ground: { texture: 'dry_ground_01', color: { r: 0.6, g: 0.5, b: 0.35 } },
    road: { texture: 'dirt', color: { r: 0.55, g: 0.48, b: 0.35 } },
    sidewalk: { texture: 'brown_planks_03', color: { r: 0.6, g: 0.55, b: 0.45 } },
    interiorFloor: 'brown_planks_03',
    interiorWall: 'brown_planks_04',
    clothing: ['#8B4513', '#DAA520', '#2F4F4F', '#A0522D', '#556B2F', '#CD853F', '#800000'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Post-Apocalyptic ─────────────────────────────────────────────────────
  'post-apocalyptic': {
    categories: {
      commercial_food: cat([[0.5, 0.45, 0.4], [0.55, 0.5, 0.42]], [0.35, 0.3, 0.25], [0.45, 0.42, 0.38], [0.4, 0.35, 0.3], 'stone', 'rustic', { roofStyle: 'flat', wallTexture: 'concrete_wall_004', roofTexture: 'corrugated_iron_03' }),
      commercial_retail: cat([[0.48, 0.42, 0.38], [0.52, 0.48, 0.4]], [0.33, 0.28, 0.22], [0.42, 0.4, 0.35], [0.38, 0.33, 0.28], 'stone', 'rustic', { roofStyle: 'flat', wallTexture: 'concrete_wall_003' }),
      commercial_service: cat([[0.5, 0.45, 0.4], [0.48, 0.42, 0.38]], [0.35, 0.3, 0.25], [0.45, 0.42, 0.38], [0.4, 0.35, 0.3], 'stone', 'rustic', { roofStyle: 'flat', wallTexture: 'broken_brick_wall' }),
      civic: cat([[0.55, 0.5, 0.45], [0.5, 0.48, 0.42]], [0.35, 0.3, 0.25], [0.45, 0.42, 0.38], [0.38, 0.33, 0.28], 'stone', 'rustic', { roofStyle: 'flat', wallTexture: 'concrete_wall_005' }),
      industrial: cat([[0.42, 0.38, 0.32], [0.4, 0.35, 0.3]], [0.3, 0.28, 0.22], [0.38, 0.35, 0.3], [0.35, 0.3, 0.25], 'metal', 'industrial', { roofStyle: 'flat', wallTexture: 'corrugated_iron', roofTexture: 'corrugated_iron_03' }),
      maritime: cat([[0.45, 0.42, 0.38], [0.48, 0.45, 0.4]], [0.32, 0.28, 0.22], [0.42, 0.4, 0.35], [0.38, 0.33, 0.28], 'metal', 'rustic', { roofStyle: 'flat', wallTexture: 'corrugated_iron_02' }),
      residential: cat([[0.5, 0.45, 0.4], [0.45, 0.4, 0.35], [0.55, 0.5, 0.42]], [0.35, 0.3, 0.25], [0.45, 0.42, 0.38], [0.4, 0.35, 0.3], 'stone', 'rustic', { roofStyle: 'flat', wallTexture: 'concrete_wall_004', roofTexture: 'corrugated_iron_03' }),
    },
    ground: { texture: 'dry_ground_01', color: { r: 0.4, g: 0.38, b: 0.3 } },
    road: { texture: 'asphalt_04', color: { r: 0.35, g: 0.33, b: 0.28 } },
    sidewalk: { texture: 'dirty_concrete', color: { r: 0.42, g: 0.4, b: 0.35 } },
    interiorFloor: 'concrete_floor',
    interiorWall: 'concrete_wall_001',
    clothing: ['#556B2F', '#8B4513', '#2F4F4F', '#696969', '#8B0000', '#3B3B3B', '#A0522D'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Modern Realistic ─────────────────────────────────────────────────────
  'modern-realistic': {
    categories: {
      commercial_food: cat([[0.85, 0.85, 0.85], [0.9, 0.88, 0.85]], [0.35, 0.35, 0.38], [0.6, 0.7, 0.8], [0.3, 0.3, 0.3], 'glass', 'modern', { roofStyle: 'flat', wallTexture: 'concrete_wall_001' }),
      commercial_retail: cat([[0.82, 0.82, 0.82], [0.88, 0.86, 0.84]], [0.33, 0.33, 0.36], [0.6, 0.7, 0.8], [0.28, 0.28, 0.28], 'glass', 'modern', { roofStyle: 'flat', wallTexture: 'concrete_wall_003' }),
      commercial_service: cat([[0.88, 0.88, 0.88], [0.85, 0.83, 0.8]], [0.35, 0.35, 0.38], [0.6, 0.7, 0.8], [0.3, 0.3, 0.3], 'glass', 'modern', { roofStyle: 'flat', wallTexture: 'concrete_wall_005' }),
      civic: cat([[0.9, 0.9, 0.9], [0.88, 0.86, 0.84]], [0.35, 0.35, 0.38], [0.6, 0.7, 0.8], [0.3, 0.3, 0.3], 'glass', 'modern', { roofStyle: 'flat', wallTexture: 'concrete_wall_006' }),
      industrial: cat([[0.7, 0.7, 0.72], [0.65, 0.65, 0.68]], [0.3, 0.3, 0.32], [0.5, 0.55, 0.6], [0.28, 0.28, 0.28], 'metal', 'modern', { roofStyle: 'flat', wallTexture: 'corrugated_iron', roofTexture: 'corrugated_iron_02' }),
      maritime: cat([[0.8, 0.82, 0.85], [0.78, 0.8, 0.82]], [0.33, 0.33, 0.36], [0.6, 0.7, 0.8], [0.28, 0.28, 0.3], 'metal', 'modern', { roofStyle: 'flat', wallTexture: 'concrete_wall_004' }),
      residential: cat([[0.85, 0.85, 0.85], [0.75, 0.75, 0.75], [0.9, 0.88, 0.85]], [0.35, 0.35, 0.38], [0.6, 0.7, 0.8], [0.3, 0.3, 0.3], 'brick', 'modern', { roofStyle: 'flat', wallTexture: 'brick_wall_001' }),
    },
    ground: { texture: 'grass_path_2', color: { r: 0.3, g: 0.5, b: 0.28 } },
    road: { texture: 'asphalt_01', color: { r: 0.3, g: 0.3, b: 0.32 } },
    sidewalk: { texture: 'concrete_floor', color: { r: 0.6, g: 0.6, b: 0.6 } },
    interiorFloor: 'floor_tiles_06',
    interiorWall: 'beige_wall_001',
    clothing: ['#2c3e50', '#34495e', '#7f8c8d', '#2980b9', '#27ae60', '#e74c3c', '#8e44ad', '#f39c12'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Historical Victorian ─────────────────────────────────────────────────
  'historical-victorian': {
    categories: {
      commercial_food: cat([[0.8, 0.75, 0.65], [0.85, 0.8, 0.7]], [0.3, 0.25, 0.2], [0.75, 0.8, 0.85], [0.35, 0.25, 0.18], 'brick', 'colonial', { roofStyle: 'hipped_dormers', hasBalcony: true, hasShutters: true, shutterColor: { r: 0.25, g: 0.2, b: 0.15 }, wallTexture: 'brick_wall_001', roofTexture: 'castle_wall_slates' }),
      commercial_retail: cat([[0.78, 0.72, 0.6], [0.82, 0.78, 0.68]], [0.28, 0.22, 0.18], [0.75, 0.8, 0.85], [0.32, 0.22, 0.15], 'brick', 'colonial', { roofStyle: 'hipped_dormers', hasShutters: true, wallTexture: 'brick_wall_003' }),
      commercial_service: cat([[0.82, 0.78, 0.68], [0.8, 0.75, 0.65]], [0.3, 0.25, 0.2], [0.75, 0.8, 0.85], [0.35, 0.25, 0.18], 'brick', 'colonial', { roofStyle: 'hipped_dormers', wallTexture: 'brick_wall_006' }),
      civic: cat([[0.85, 0.82, 0.75], [0.82, 0.78, 0.7]], [0.28, 0.22, 0.18], [0.75, 0.8, 0.85], [0.32, 0.22, 0.15], 'stone', 'colonial', { roofStyle: 'hipped_dormers', wallTexture: 'old_stone_wall', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.6, 0.55, 0.45], [0.58, 0.52, 0.42]], [0.32, 0.28, 0.2], [0.6, 0.65, 0.68], [0.35, 0.28, 0.2], 'brick', 'industrial', { roofStyle: 'gable', wallTexture: 'brick_wall_001', roofTexture: 'castle_wall_slates' }),
      maritime: cat([[0.72, 0.68, 0.58], [0.7, 0.65, 0.55]], [0.3, 0.25, 0.2], [0.7, 0.75, 0.8], [0.35, 0.25, 0.18], 'wood', 'colonial', { roofStyle: 'gable', wallTexture: 'brown_planks_03' }),
      residential: cat([[0.8, 0.75, 0.65], [0.7, 0.65, 0.55], [0.85, 0.8, 0.7]], [0.3, 0.25, 0.2], [0.75, 0.8, 0.85], [0.35, 0.25, 0.18], 'brick', 'colonial', { roofStyle: 'hipped_dormers', hasBalcony: true, hasShutters: true, hasPorch: true, porchDepth: 3, porchSteps: 3, shutterColor: { r: 0.25, g: 0.2, b: 0.15 }, wallTexture: 'brick_wall_003', roofTexture: 'castle_wall_slates' }),
    },
    ground: { texture: 'grass_path_2', color: { r: 0.3, g: 0.45, b: 0.25 } },
    road: { texture: 'cobblestone_floor_01', color: { r: 0.4, g: 0.38, b: 0.35 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.55, g: 0.52, b: 0.48 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'beige_wall_002',
    clothing: ['#2F4F4F', '#191970', '#800020', '#3B3B3B', '#556B2F', '#8B4513', '#4B0082'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Horror ───────────────────────────────────────────────────────────────
  'horror': {
    categories: {
      commercial_food: cat([[0.35, 0.32, 0.3], [0.4, 0.35, 0.3]], [0.2, 0.18, 0.15], [0.35, 0.3, 0.28], [0.25, 0.2, 0.18], 'stone', 'colonial', { roofStyle: 'hipped_dormers', hasShutters: true, shutterColor: { r: 0.2, g: 0.18, b: 0.15 }, wallTexture: 'old_stone_wall', roofTexture: 'castle_wall_slates' }),
      commercial_retail: cat([[0.32, 0.28, 0.25], [0.38, 0.33, 0.28]], [0.18, 0.15, 0.12], [0.32, 0.28, 0.25], [0.22, 0.18, 0.15], 'stone', 'colonial', { roofStyle: 'hipped_dormers', hasShutters: true, wallTexture: 'mossy_stone_wall' }),
      commercial_service: cat([[0.38, 0.35, 0.3], [0.35, 0.3, 0.28]], [0.2, 0.18, 0.15], [0.35, 0.3, 0.28], [0.25, 0.2, 0.18], 'stone', 'colonial', { roofStyle: 'hipped_dormers', wallTexture: 'old_stone_wall_02' }),
      civic: cat([[0.4, 0.38, 0.32], [0.38, 0.35, 0.3]], [0.2, 0.18, 0.15], [0.35, 0.32, 0.3], [0.22, 0.2, 0.15], 'stone', 'colonial', { roofStyle: 'hipped_dormers', wallTexture: 'castle_brick_01', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.3, 0.28, 0.25], [0.28, 0.25, 0.22]], [0.18, 0.15, 0.12], [0.3, 0.28, 0.25], [0.22, 0.2, 0.15], 'stone', 'rustic', { roofStyle: 'gable', wallTexture: 'mossy_brick' }),
      maritime: cat([[0.32, 0.3, 0.28], [0.3, 0.28, 0.25]], [0.18, 0.15, 0.12], [0.32, 0.28, 0.25], [0.22, 0.2, 0.15], 'wood', 'colonial', { roofStyle: 'gable', wallTexture: 'dark_wooden_planks' }),
      residential: cat([[0.35, 0.32, 0.3], [0.3, 0.28, 0.25], [0.4, 0.35, 0.3]], [0.2, 0.18, 0.15], [0.35, 0.3, 0.28], [0.25, 0.2, 0.18], 'stone', 'colonial', { roofStyle: 'hipped_dormers', hasShutters: true, hasPorch: true, porchDepth: 3, porchSteps: 3, shutterColor: { r: 0.2, g: 0.18, b: 0.15 }, wallTexture: 'old_stone_wall', roofTexture: 'castle_wall_slates' }),
    },
    ground: { texture: 'forest_ground_04', color: { r: 0.25, g: 0.28, b: 0.2 } },
    road: { texture: 'mossy_cobblestone', color: { r: 0.28, g: 0.25, b: 0.22 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.32, g: 0.3, b: 0.28 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'old_stone_wall',
    clothing: ['#1a1a1a', '#2d1b2e', '#3d0c02', '#1c1c3e', '#2e2e2e', '#0d0d0d', '#3b0000'],
    skinTones: SKIN_DEFAULT,
  },

  // ── Sci-Fi Space ─────────────────────────────────────────────────────────
  'sci-fi-space': {
    categories: {
      commercial_food: cat([[0.7, 0.72, 0.75], [0.8, 0.82, 0.85]], [0.3, 0.32, 0.35], [0.4, 0.7, 0.9], [0.35, 0.37, 0.4], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_006' }),
      commercial_retail: cat([[0.65, 0.68, 0.72], [0.75, 0.78, 0.82]], [0.28, 0.3, 0.33], [0.4, 0.7, 0.9], [0.32, 0.35, 0.38], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_005' }),
      commercial_service: cat([[0.72, 0.75, 0.78], [0.78, 0.8, 0.83]], [0.3, 0.32, 0.35], [0.4, 0.7, 0.9], [0.35, 0.37, 0.4], 'glass', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_007' }),
      civic: cat([[0.78, 0.8, 0.83], [0.82, 0.85, 0.88]], [0.3, 0.32, 0.35], [0.4, 0.7, 0.9], [0.35, 0.37, 0.4], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_008' }),
      industrial: cat([[0.55, 0.58, 0.62], [0.5, 0.52, 0.58]], [0.25, 0.28, 0.3], [0.35, 0.6, 0.75], [0.3, 0.32, 0.35], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'corrugated_iron_02' }),
      maritime: cat([[0.65, 0.7, 0.75], [0.7, 0.72, 0.78]], [0.28, 0.3, 0.33], [0.4, 0.7, 0.85], [0.32, 0.35, 0.38], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_004' }),
      residential: cat([[0.7, 0.72, 0.75], [0.6, 0.62, 0.65], [0.8, 0.82, 0.85]], [0.3, 0.32, 0.35], [0.4, 0.7, 0.9], [0.35, 0.37, 0.4], 'metal', 'futuristic', { roofStyle: 'flat', wallTexture: 'concrete_wall_003' }),
    },
    ground: { texture: 'concrete_floor', color: { r: 0.3, g: 0.32, b: 0.35 } },
    road: { texture: 'asphalt_02', color: { r: 0.25, g: 0.27, b: 0.3 } },
    sidewalk: { texture: 'concrete_tiles', color: { r: 0.4, g: 0.42, b: 0.45 } },
    interiorFloor: 'floor_tiles_06',
    interiorWall: 'concrete_wall_001',
    clothing: ['#c0c0c0', '#4682b4', '#2e2e2e', '#1a1a2e', '#e0e0e0', '#0077b6', '#48cae4'],
    skinTones: SKIN_DEFAULT,
  },

  // ── High Fantasy ─────────────────────────────────────────────────────────
  'high-fantasy': {
    categories: {
      commercial_food: cat([[0.85, 0.8, 0.7], [0.9, 0.85, 0.75]], [0.3, 0.2, 0.35], [0.6, 0.7, 0.85], [0.5, 0.35, 0.25], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'medieval_blocks_02', roofTexture: 'clay_roof_tiles' }),
      commercial_retail: cat([[0.82, 0.78, 0.68], [0.88, 0.82, 0.72]], [0.28, 0.2, 0.32], [0.6, 0.7, 0.85], [0.48, 0.33, 0.22], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'medieval_blocks_03', roofTexture: 'clay_roof_tiles_02' }),
      commercial_service: cat([[0.85, 0.82, 0.72], [0.82, 0.78, 0.68]], [0.3, 0.22, 0.34], [0.6, 0.7, 0.85], [0.5, 0.35, 0.25], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'medieval_blocks_05' }),
      civic: cat([[0.9, 0.88, 0.8], [0.88, 0.85, 0.78]], [0.28, 0.2, 0.32], [0.6, 0.7, 0.88], [0.45, 0.32, 0.22], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'castle_brick_02_white', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.65, 0.6, 0.5], [0.6, 0.55, 0.45]], [0.32, 0.25, 0.2], [0.55, 0.6, 0.65], [0.42, 0.3, 0.2], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'medieval_wood' }),
      maritime: cat([[0.7, 0.72, 0.75], [0.72, 0.75, 0.78]], [0.3, 0.22, 0.3], [0.6, 0.68, 0.8], [0.45, 0.32, 0.22], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'brown_planks_03' }),
      residential: cat([[0.85, 0.8, 0.7], [0.7, 0.65, 0.55], [0.9, 0.85, 0.75]], [0.3, 0.2, 0.35], [0.6, 0.7, 0.85], [0.5, 0.35, 0.25], 'stone', 'medieval', { roofStyle: 'hipped_dormers', hasPorch: true, porchDepth: 2, porchSteps: 2, wallTexture: 'medieval_blocks_02', roofTexture: 'clay_roof_tiles' }),
    },
    ground: { texture: 'forest_floor', color: { r: 0.3, g: 0.55, b: 0.3 } },
    road: { texture: 'cobblestone_floor_01', color: { r: 0.5, g: 0.45, b: 0.4 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.6, g: 0.55, b: 0.5 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'beige_wall_001',
    clothing: ['#4B0082', '#8B0000', '#006400', '#191970', '#DAA520', '#CD853F', '#800080', '#2F4F4F'],
    skinTones: [...SKIN_DEFAULT, '#90EE90', '#ADD8E6'],
  },

  // ── Historical Medieval ──────────────────────────────────────────────────
  'historical-medieval': {
    categories: {
      commercial_food: cat([[0.7, 0.65, 0.55], [0.75, 0.7, 0.6]], [0.35, 0.28, 0.2], [0.65, 0.7, 0.75], [0.4, 0.3, 0.2], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'half_timbered_wall_01', roofTexture: 'clay_roof_tiles' }),
      commercial_retail: cat([[0.68, 0.62, 0.52], [0.72, 0.68, 0.58]], [0.33, 0.25, 0.18], [0.65, 0.7, 0.75], [0.38, 0.28, 0.18], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'medieval_wall_02', roofTexture: 'clay_roof_tiles' }),
      commercial_service: cat([[0.72, 0.68, 0.58], [0.7, 0.65, 0.55]], [0.35, 0.28, 0.2], [0.65, 0.7, 0.75], [0.4, 0.3, 0.2], 'stone', 'medieval', { roofStyle: 'gable', wallTexture: 'medieval_blocks_06' }),
      civic: cat([[0.78, 0.75, 0.65], [0.75, 0.72, 0.62]], [0.3, 0.25, 0.18], [0.65, 0.7, 0.78], [0.38, 0.28, 0.18], 'stone', 'medieval', { roofStyle: 'hipped_dormers', wallTexture: 'castle_brick_01', roofTexture: 'castle_wall_slates' }),
      industrial: cat([[0.58, 0.52, 0.42], [0.55, 0.5, 0.4]], [0.33, 0.28, 0.2], [0.55, 0.58, 0.6], [0.38, 0.28, 0.2], 'wood', 'rustic', { roofStyle: 'gable', wallTexture: 'brown_planks_03' }),
      maritime: cat([[0.62, 0.58, 0.48], [0.6, 0.55, 0.45]], [0.35, 0.28, 0.2], [0.6, 0.65, 0.7], [0.38, 0.28, 0.2], 'wood', 'medieval', { roofStyle: 'gable', wallTexture: 'old_planks_02' }),
      residential: cat([[0.7, 0.65, 0.55], [0.65, 0.6, 0.5], [0.75, 0.7, 0.6]], [0.35, 0.28, 0.2], [0.65, 0.7, 0.75], [0.4, 0.3, 0.2], 'wood', 'medieval', { roofStyle: 'gable', hasPorch: true, porchDepth: 2, porchSteps: 2, wallTexture: 'half_timbered_wall_01', roofTexture: 'clay_roof_tiles' }),
    },
    ground: { texture: 'forest_floor', color: { r: 0.35, g: 0.45, b: 0.25 } },
    road: { texture: 'cobblestone_floor_01', color: { r: 0.45, g: 0.42, b: 0.38 } },
    sidewalk: { texture: 'cobblestone_floor_02', color: { r: 0.5, g: 0.48, b: 0.42 } },
    interiorFloor: 'old_planks_02',
    interiorWall: 'beige_wall_001',
    clothing: ['#8B4513', '#2F4F4F', '#556B2F', '#800000', '#191970', '#A0522D', '#6B8E23'],
    skinTones: SKIN_DEFAULT,
  },
};

// Fallback for unmatched world types
const GENERIC_THEME: WorldTheme = THEMES['medieval-fantasy'];

// ─── Build config from theme ────────────────────────────────────────────────

function buildConfigFromTheme(theme: WorldTheme) {
  const buildingTypeConfigs: Record<string, any> = {};
  for (const typeName of ALL_BUILDING_TYPES) {
    buildingTypeConfigs[typeName] = {
      mode: 'procedural',
      styleOverrides: {},
      interiorConfig: {
        mode: 'procedural',
        ...(theme.interiorFloor ? { floorTextureId: tex(theme.interiorFloor) } : {}),
        ...(theme.interiorWall ? { wallTextureId: tex(theme.interiorWall) } : {}),
      },
    };
  }

  const categoryPresets: Record<string, any> = {};
  for (const [catName, catTheme] of Object.entries(theme.categories)) {
    categoryPresets[catName] = {
      id: `cat_${catName}`,
      name: `${catName.replace(/_/g, ' ')} style`,
      baseColors: catTheme.baseColors,
      roofColor: catTheme.roofColor,
      windowColor: catTheme.windowColor,
      doorColor: catTheme.doorColor,
      materialType: catTheme.materialType,
      architectureStyle: catTheme.architectureStyle,
      ...(catTheme.roofStyle ? { roofStyle: catTheme.roofStyle } : {}),
      ...(catTheme.hasBalcony ? { hasBalcony: true } : {}),
      ...(catTheme.hasIronworkBalcony ? { hasIronworkBalcony: true } : {}),
      ...(catTheme.hasPorch ? { hasPorch: true, porchDepth: catTheme.porchDepth ?? 3, porchSteps: catTheme.porchSteps ?? 2 } : {}),
      ...(catTheme.hasShutters ? { hasShutters: true, shutterColor: catTheme.shutterColor } : {}),
      ...(catTheme.wallTexture ? { wallTextureId: tex(catTheme.wallTexture) } : {}),
      ...(catTheme.roofTexture ? { roofTextureId: tex(catTheme.roofTexture) } : {}),
      ...(catTheme.floorTexture ? { floorTextureId: tex(catTheme.floorTexture) } : {}),
      ...(catTheme.doorTexture ? { doorTextureId: tex(catTheme.doorTexture) } : {}),
    };
  }

  const groundConfig = {
    ground: {
      mode: theme.ground.texture ? 'asset' as const : 'procedural' as const,
      color: theme.ground.color,
      ...(theme.ground.texture ? { textureId: tex(theme.ground.texture) } : {}),
      tiling: 4,
    },
    road: {
      mode: theme.road.texture ? 'asset' as const : 'procedural' as const,
      color: theme.road.color,
      ...(theme.road.texture ? { textureId: tex(theme.road.texture) } : {}),
      tiling: 4,
    },
    sidewalk: {
      mode: theme.sidewalk.texture ? 'asset' as const : 'procedural' as const,
      color: theme.sidewalk.color,
      ...(theme.sidewalk.texture ? { textureId: tex(theme.sidewalk.texture) } : {}),
      tiling: 4,
    },
  };

  const characterConfig = {
    playerModels: {
      default: { mode: 'asset' }, male: { mode: 'asset' }, female: { mode: 'asset' },
    },
    characterModels: {
      civilian_male: { mode: 'asset' }, civilian_female: { mode: 'asset' },
      guard: { mode: 'asset' }, merchant: { mode: 'asset' }, noble: { mode: 'asset' },
      elder: { mode: 'asset' }, child: { mode: 'asset' }, worker: { mode: 'asset' },
      priest: { mode: 'asset' }, scholar: { mode: 'asset' },
    },
    npcBodyModels: ['outfit_male_peasant', 'outfit_female_peasant', 'outfit_male_merchant', 'outfit_female_merchant', 'outfit_male_noble', 'outfit_female_noble', 'outfit_male_guard', 'outfit_female_worker'],
    npcHairStyles: { male: ['short', 'medium', 'long', 'bald', 'mohawk', 'ponytail'], female: ['long', 'medium', 'short', 'ponytail', 'braids', 'bun', 'curly'] },
    npcClothingPalette: theme.clothing,
    npcSkinTonePalette: theme.skinTones,
  };

  const natureConfig = {
    trees: { oak: { mode: 'asset' }, pine: { mode: 'asset' }, birch: { mode: 'asset' }, willow: { mode: 'asset' }, palm: { mode: 'asset' }, maple: { mode: 'asset' }, cypress: { mode: 'asset' }, dead_tree: { mode: 'asset' } },
    vegetation: { grass_patch: { mode: 'asset' }, bush: { mode: 'asset' }, shrub: { mode: 'asset' }, flower_bed: { mode: 'asset' }, fern: { mode: 'asset' }, ivy: { mode: 'asset' }, tall_grass: { mode: 'asset' }, moss: { mode: 'asset' } },
    water: { fountain: { mode: 'asset' }, pond: { mode: 'asset' }, stream: { mode: 'asset' }, well: { mode: 'asset' }, puddle: { mode: 'asset' } },
    rocks: { boulder: { mode: 'asset' }, rock: { mode: 'asset' }, pebbles: { mode: 'asset' }, cliff_face: { mode: 'asset' }, stone_pile: { mode: 'asset' } },
  };

  const itemConfig = {
    objects: { chair: { mode: 'asset' }, table: { mode: 'asset' }, barrel: { mode: 'asset' }, crate: { mode: 'asset' }, lantern: { mode: 'asset' }, sign: { mode: 'asset' }, cart: { mode: 'asset' }, fence: { mode: 'asset' }, bench: { mode: 'asset' }, ladder: { mode: 'asset' }, bucket: { mode: 'asset' }, basket: { mode: 'asset' }, pot: { mode: 'asset' }, candle: { mode: 'asset' }, bookshelf: { mode: 'asset' }, bed: { mode: 'asset' }, chest: { mode: 'asset' }, wardrobe: { mode: 'asset' }, anvil: { mode: 'asset' }, workbench: { mode: 'asset' }, stool: { mode: 'asset' }, rug: { mode: 'asset' }, painting: { mode: 'asset' }, mirror: { mode: 'asset' }, fireplace: { mode: 'asset' }, broom: { mode: 'asset' }, shovel: { mode: 'asset' }, axe: { mode: 'asset' }, hammer: { mode: 'asset' }, saw: { mode: 'asset' }, sword: { mode: 'asset' }, shield: { mode: 'asset' }, bow: { mode: 'asset' }, staff: { mode: 'asset' } },
    questObjects: { collectible: { mode: 'asset' }, marker: { mode: 'asset' }, container: { mode: 'asset' }, key: { mode: 'asset' }, scroll: { mode: 'asset' }, chest: { mode: 'asset' }, artifact: { mode: 'asset' }, gem: { mode: 'asset' }, potion: { mode: 'asset' }, map: { mode: 'asset' }, letter: { mode: 'asset' }, relic: { mode: 'asset' } },
  };

  return {
    buildingConfig: { buildingTypeConfigs, categoryPresets },
    groundConfig,
    characterConfig,
    natureConfig,
    itemConfig,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting...`);
  await mongoose.connect(mongoUri);

  await buildTextureMap();

  // Remove base-only collections
  const REMOVE = ['Base Furniture', 'Base Props & Objects', 'Base Weapons & Tools'];
  for (const name of REMOVE) {
    const r = await AssetCollectionModel.deleteMany({ name });
    if (r.deletedCount > 0) console.log(`Removed "${name}"`);
  }

  const collections = await AssetCollectionModel.find({});
  console.log(`\nEnhancing ${collections.length} collections...`);

  let updated = 0;
  for (const doc of collections) {
    const data = doc.toObject() as any;
    const worldType = data.worldType || 'generic';

    // Try exact match, then fallbacks
    const theme = THEMES[worldType]
      || THEMES[worldType.replace(/-/g, '_')]
      || GENERIC_THEME;

    const config = buildConfigFromTheme(theme);

    await AssetCollectionModel.updateOne(
      { _id: doc._id },
      { $set: { worldTypeConfig: config, collectionType: 'world_type_collection' } },
    );

    const texCount = Object.values(config.buildingConfig.categoryPresets)
      .filter((p: any) => p.wallTextureId || p.roofTextureId).length;

    console.log(`  → "${data.name}" (${worldType}) — ${Object.keys(config.buildingConfig.categoryPresets).length} cat presets, ${texCount} with textures`);
    updated++;
  }

  console.log(`\nDone. Enhanced ${updated} collections.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
