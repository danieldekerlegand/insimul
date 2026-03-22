/**
 * Default style presets for each building category.
 * When no asset collection preset is configured, the generator picks
 * randomly from these to give visual variety across building categories.
 */
import type { ProceduralStylePreset, MaterialType, ArchitectureStyle, RoofStyle } from './types';
import type { BuildingCategory } from './building-categories';

/** Shorthand color constructor (plain object, not Babylon Color3) */
function c3(r: number, g: number, b: number) { return { r, g, b }; }

function preset(
  id: string,
  name: string,
  opts: {
    baseColors: { r: number; g: number; b: number }[];
    roofColor: { r: number; g: number; b: number };
    windowColor: { r: number; g: number; b: number };
    doorColor: { r: number; g: number; b: number };
    materialType: MaterialType;
    architectureStyle: ArchitectureStyle;
    roofStyle?: RoofStyle;
    hasBalcony?: boolean;
    hasIronworkBalcony?: boolean;
    hasPorch?: boolean;
    hasShutters?: boolean;
    shutterColor?: { r: number; g: number; b: number };
  },
): ProceduralStylePreset {
  return { id, name, ...opts };
}

// ─── Commercial: Food & Drink ────────────────────────────────────────────────
const commercialFood: ProceduralStylePreset[] = [
  preset('cf_warm_brick', 'Warm Brick Eatery', {
    baseColors: [c3(0.65, 0.35, 0.25), c3(0.7, 0.4, 0.28), c3(0.6, 0.32, 0.22)],
    roofColor: c3(0.3, 0.18, 0.12),
    windowColor: c3(0.95, 0.9, 0.7),
    doorColor: c3(0.5, 0.28, 0.15),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
    hasPorch: true,
  }),
  preset('cf_stucco_bistro', 'Stucco Bistro', {
    baseColors: [c3(0.9, 0.85, 0.7), c3(0.88, 0.8, 0.65), c3(0.92, 0.87, 0.75)],
    roofColor: c3(0.6, 0.35, 0.2),
    windowColor: c3(0.85, 0.9, 0.95),
    doorColor: c3(0.45, 0.25, 0.12),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
    hasShutters: true,
    shutterColor: c3(0.2, 0.35, 0.2),
  }),
  preset('cf_creole_kitchen', 'Creole Kitchen', {
    baseColors: [c3(0.85, 0.75, 0.5), c3(0.8, 0.65, 0.4), c3(0.9, 0.8, 0.55)],
    roofColor: c3(0.25, 0.25, 0.3),
    windowColor: c3(0.9, 0.92, 0.85),
    doorColor: c3(0.35, 0.2, 0.15),
    materialType: 'wood',
    architectureStyle: 'creole',
    roofStyle: 'hipped_dormers',
    hasBalcony: true,
    hasIronworkBalcony: true,
  }),
  preset('cf_rustic_tavern', 'Rustic Tavern', {
    baseColors: [c3(0.5, 0.35, 0.2), c3(0.55, 0.38, 0.22), c3(0.48, 0.32, 0.18)],
    roofColor: c3(0.35, 0.25, 0.15),
    windowColor: c3(0.9, 0.85, 0.6),
    doorColor: c3(0.4, 0.25, 0.12),
    materialType: 'wood',
    architectureStyle: 'rustic',
    roofStyle: 'gable',
  }),
];

// ─── Commercial: Retail ──────────────────────────────────────────────────────
const commercialRetail: ProceduralStylePreset[] = [
  preset('cr_shopfront_wood', 'Wooden Shopfront', {
    baseColors: [c3(0.6, 0.45, 0.3), c3(0.55, 0.4, 0.25), c3(0.65, 0.48, 0.32)],
    roofColor: c3(0.3, 0.22, 0.15),
    windowColor: c3(0.8, 0.85, 0.9),
    doorColor: c3(0.45, 0.3, 0.18),
    materialType: 'wood',
    architectureStyle: 'colonial',
    roofStyle: 'gable',
    hasPorch: true,
  }),
  preset('cr_brick_storefront', 'Brick Storefront', {
    baseColors: [c3(0.6, 0.3, 0.2), c3(0.55, 0.28, 0.18), c3(0.65, 0.33, 0.22)],
    roofColor: c3(0.25, 0.2, 0.18),
    windowColor: c3(0.85, 0.88, 0.92),
    doorColor: c3(0.3, 0.18, 0.1),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'flat',
  }),
  preset('cr_painted_merchant', 'Painted Merchant', {
    baseColors: [c3(0.4, 0.5, 0.45), c3(0.5, 0.42, 0.35), c3(0.45, 0.48, 0.55)],
    roofColor: c3(0.28, 0.28, 0.3),
    windowColor: c3(0.9, 0.9, 0.85),
    doorColor: c3(0.55, 0.35, 0.2),
    materialType: 'wood',
    architectureStyle: 'medieval',
    roofStyle: 'side_gable',
    hasShutters: true,
    shutterColor: c3(0.3, 0.2, 0.12),
  }),
  preset('cr_stucco_market', 'Stucco Market', {
    baseColors: [c3(0.88, 0.82, 0.7), c3(0.92, 0.86, 0.74), c3(0.85, 0.78, 0.66)],
    roofColor: c3(0.55, 0.3, 0.18),
    windowColor: c3(0.8, 0.85, 0.9),
    doorColor: c3(0.5, 0.3, 0.15),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
  }),
];

// ─── Commercial: Service ─────────────────────────────────────────────────────
const commercialService: ProceduralStylePreset[] = [
  preset('cs_professional_brick', 'Professional Brick', {
    baseColors: [c3(0.55, 0.3, 0.2), c3(0.5, 0.28, 0.18), c3(0.58, 0.32, 0.22)],
    roofColor: c3(0.2, 0.2, 0.22),
    windowColor: c3(0.75, 0.8, 0.88),
    doorColor: c3(0.25, 0.15, 0.1),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
  }),
  preset('cs_formal_stone', 'Formal Stone', {
    baseColors: [c3(0.65, 0.63, 0.58), c3(0.6, 0.58, 0.55), c3(0.7, 0.68, 0.62)],
    roofColor: c3(0.3, 0.3, 0.32),
    windowColor: c3(0.7, 0.75, 0.82),
    doorColor: c3(0.3, 0.22, 0.15),
    materialType: 'stone',
    architectureStyle: 'colonial',
    roofStyle: 'flat',
  }),
  preset('cs_muted_stucco', 'Muted Stucco Office', {
    baseColors: [c3(0.78, 0.75, 0.68), c3(0.82, 0.78, 0.72), c3(0.75, 0.72, 0.65)],
    roofColor: c3(0.35, 0.32, 0.3),
    windowColor: c3(0.8, 0.84, 0.9),
    doorColor: c3(0.4, 0.3, 0.22),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'flat',
  }),
  preset('cs_creole_office', 'Creole Office', {
    baseColors: [c3(0.82, 0.72, 0.5), c3(0.78, 0.68, 0.45), c3(0.85, 0.75, 0.55)],
    roofColor: c3(0.22, 0.22, 0.28),
    windowColor: c3(0.88, 0.9, 0.85),
    doorColor: c3(0.32, 0.2, 0.12),
    materialType: 'wood',
    architectureStyle: 'creole',
    roofStyle: 'hipped_dormers',
    hasBalcony: true,
    hasIronworkBalcony: true,
  }),
];

// ─── Civic ───────────────────────────────────────────────────────────────────
const civic: ProceduralStylePreset[] = [
  preset('cv_grand_stone', 'Grand Stone', {
    baseColors: [c3(0.7, 0.68, 0.62), c3(0.72, 0.7, 0.65), c3(0.68, 0.66, 0.6)],
    roofColor: c3(0.25, 0.25, 0.28),
    windowColor: c3(0.7, 0.75, 0.85),
    doorColor: c3(0.35, 0.25, 0.18),
    materialType: 'stone',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
  }),
  preset('cv_red_brick_civic', 'Red Brick Civic', {
    baseColors: [c3(0.6, 0.28, 0.18), c3(0.58, 0.26, 0.16), c3(0.62, 0.3, 0.2)],
    roofColor: c3(0.2, 0.2, 0.22),
    windowColor: c3(0.78, 0.82, 0.9),
    doorColor: c3(0.28, 0.18, 0.1),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'hipped_dormers',
  }),
  preset('cv_whitewash_formal', 'Whitewash Formal', {
    baseColors: [c3(0.92, 0.9, 0.88), c3(0.9, 0.88, 0.85), c3(0.88, 0.86, 0.83)],
    roofColor: c3(0.3, 0.3, 0.32),
    windowColor: c3(0.7, 0.75, 0.82),
    doorColor: c3(0.3, 0.2, 0.12),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
  }),
  preset('cv_medieval_civic', 'Medieval Civic', {
    baseColors: [c3(0.6, 0.58, 0.52), c3(0.62, 0.6, 0.55), c3(0.58, 0.56, 0.5)],
    roofColor: c3(0.32, 0.22, 0.15),
    windowColor: c3(0.85, 0.88, 0.8),
    doorColor: c3(0.4, 0.28, 0.18),
    materialType: 'stone',
    architectureStyle: 'medieval',
    roofStyle: 'gable',
  }),
];

// ─── Industrial ──────────────────────────────────────────────────────────────
const industrial: ProceduralStylePreset[] = [
  preset('in_brick_workshop', 'Brick Workshop', {
    baseColors: [c3(0.55, 0.3, 0.2), c3(0.5, 0.28, 0.18), c3(0.52, 0.3, 0.22)],
    roofColor: c3(0.3, 0.28, 0.25),
    windowColor: c3(0.7, 0.72, 0.68),
    doorColor: c3(0.35, 0.25, 0.18),
    materialType: 'brick',
    architectureStyle: 'industrial',
    roofStyle: 'gable',
  }),
  preset('in_metal_warehouse', 'Metal Warehouse', {
    baseColors: [c3(0.5, 0.5, 0.52), c3(0.48, 0.48, 0.5), c3(0.52, 0.52, 0.55)],
    roofColor: c3(0.35, 0.35, 0.38),
    windowColor: c3(0.6, 0.65, 0.7),
    doorColor: c3(0.4, 0.4, 0.42),
    materialType: 'metal',
    architectureStyle: 'industrial',
    roofStyle: 'flat',
  }),
  preset('in_rustic_barn', 'Rustic Barn', {
    baseColors: [c3(0.5, 0.35, 0.2), c3(0.55, 0.38, 0.22), c3(0.52, 0.36, 0.21)],
    roofColor: c3(0.35, 0.25, 0.15),
    windowColor: c3(0.75, 0.75, 0.65),
    doorColor: c3(0.45, 0.3, 0.18),
    materialType: 'wood',
    architectureStyle: 'rustic',
    roofStyle: 'gable',
  }),
  preset('in_stone_forge', 'Stone Forge', {
    baseColors: [c3(0.45, 0.43, 0.4), c3(0.48, 0.46, 0.42), c3(0.42, 0.4, 0.38)],
    roofColor: c3(0.25, 0.22, 0.2),
    windowColor: c3(0.65, 0.6, 0.5),
    doorColor: c3(0.35, 0.28, 0.2),
    materialType: 'stone',
    architectureStyle: 'medieval',
    roofStyle: 'side_gable',
  }),
];

// ─── Maritime ────────────────────────────────────────────────────────────────
const maritime: ProceduralStylePreset[] = [
  preset('ma_weathered_wood', 'Weathered Dockside', {
    baseColors: [c3(0.55, 0.5, 0.42), c3(0.52, 0.48, 0.4), c3(0.58, 0.52, 0.44)],
    roofColor: c3(0.3, 0.28, 0.25),
    windowColor: c3(0.75, 0.8, 0.85),
    doorColor: c3(0.4, 0.35, 0.28),
    materialType: 'wood',
    architectureStyle: 'rustic',
    roofStyle: 'gable',
  }),
  preset('ma_coastal_white', 'Coastal Whitewash', {
    baseColors: [c3(0.9, 0.9, 0.88), c3(0.88, 0.88, 0.85), c3(0.85, 0.86, 0.82)],
    roofColor: c3(0.2, 0.3, 0.45),
    windowColor: c3(0.7, 0.78, 0.88),
    doorColor: c3(0.2, 0.35, 0.5),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
    hasShutters: true,
    shutterColor: c3(0.15, 0.3, 0.5),
  }),
  preset('ma_brick_customs', 'Brick Port Authority', {
    baseColors: [c3(0.58, 0.32, 0.2), c3(0.55, 0.3, 0.18), c3(0.6, 0.34, 0.22)],
    roofColor: c3(0.22, 0.22, 0.25),
    windowColor: c3(0.75, 0.8, 0.85),
    doorColor: c3(0.3, 0.2, 0.12),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'flat',
  }),
];

// ─── Residential ─────────────────────────────────────────────────────────────
const residential: ProceduralStylePreset[] = [
  preset('re_clapboard_cottage', 'Clapboard Cottage', {
    baseColors: [c3(0.8, 0.78, 0.7), c3(0.75, 0.72, 0.65), c3(0.85, 0.82, 0.75)],
    roofColor: c3(0.3, 0.25, 0.2),
    windowColor: c3(0.85, 0.88, 0.92),
    doorColor: c3(0.45, 0.28, 0.15),
    materialType: 'wood',
    architectureStyle: 'colonial',
    roofStyle: 'gable',
    hasPorch: true,
    hasShutters: true,
    shutterColor: c3(0.15, 0.25, 0.15),
  }),
  preset('re_brick_townhouse', 'Brick Townhouse', {
    baseColors: [c3(0.6, 0.32, 0.2), c3(0.55, 0.3, 0.18), c3(0.58, 0.34, 0.22)],
    roofColor: c3(0.25, 0.22, 0.2),
    windowColor: c3(0.8, 0.82, 0.88),
    doorColor: c3(0.3, 0.18, 0.1),
    materialType: 'brick',
    architectureStyle: 'colonial',
    roofStyle: 'side_gable',
  }),
  preset('re_creole_house', 'Creole House', {
    baseColors: [c3(0.82, 0.72, 0.48), c3(0.78, 0.68, 0.44), c3(0.85, 0.75, 0.52)],
    roofColor: c3(0.22, 0.22, 0.28),
    windowColor: c3(0.88, 0.9, 0.85),
    doorColor: c3(0.32, 0.2, 0.12),
    materialType: 'wood',
    architectureStyle: 'creole',
    roofStyle: 'hipped_dormers',
    hasBalcony: true,
    hasIronworkBalcony: true,
    hasShutters: true,
    shutterColor: c3(0.18, 0.3, 0.18),
  }),
  preset('re_painted_victorian', 'Painted Victorian', {
    baseColors: [c3(0.55, 0.6, 0.55), c3(0.7, 0.65, 0.55), c3(0.6, 0.55, 0.65)],
    roofColor: c3(0.28, 0.25, 0.3),
    windowColor: c3(0.85, 0.88, 0.9),
    doorColor: c3(0.4, 0.25, 0.3),
    materialType: 'wood',
    architectureStyle: 'colonial',
    roofStyle: 'gable',
    hasPorch: true,
  }),
  preset('re_stucco_villa', 'Stucco Villa', {
    baseColors: [c3(0.9, 0.85, 0.72), c3(0.88, 0.82, 0.68), c3(0.92, 0.88, 0.76)],
    roofColor: c3(0.6, 0.35, 0.2),
    windowColor: c3(0.8, 0.85, 0.9),
    doorColor: c3(0.5, 0.3, 0.15),
    materialType: 'stucco',
    architectureStyle: 'colonial',
    roofStyle: 'hip',
    hasBalcony: true,
  }),
];

/**
 * Default style presets keyed by building category.
 * Each category has 3–5 visually distinct presets.
 */
export const CATEGORY_STYLE_PRESETS: Record<BuildingCategory, ProceduralStylePreset[]> = {
  commercial_food: commercialFood,
  commercial_retail: commercialRetail,
  commercial_service: commercialService,
  civic,
  industrial,
  maritime,
  residential,
};

/**
 * Pick a category preset for a building using a deterministic hash.
 * Returns undefined if the category is unknown.
 */
export function getCategoryPreset(
  category: BuildingCategory,
  seed: string,
): ProceduralStylePreset | undefined {
  const presets = CATEGORY_STYLE_PRESETS[category];
  if (!presets || presets.length === 0) return undefined;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  return presets[Math.abs(hash) % presets.length];
}
