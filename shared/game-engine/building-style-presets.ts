/**
 * Subtype-specific style overrides for building exteriors.
 *
 * These partial presets layer on top of the collection's category presets
 * to give each building subtype a distinctive look while remaining
 * cohesive within a settlement's overall style.
 */

import type { ProceduralStylePreset, MaterialType, ArchitectureStyle, RoofStyle } from './types';

/**
 * A partial style override that can be merged on top of a base preset.
 * Only the fields that should differ from the category default are set.
 */
export type SubtypeStyleOverride = Partial<
  Pick<
    ProceduralStylePreset,
    | 'materialType'
    | 'roofStyle'
    | 'hasBalcony'
    | 'hasIronworkBalcony'
    | 'hasPorch'
    | 'porchDepth'
    | 'porchSteps'
    | 'hasShutters'
  >
> & {
  /** Color tint multiplier applied to baseColor (r,g,b each 0-2 range).
   *  Values > 1 brighten, < 1 darken that channel. */
  colorTint?: { r: number; g: number; b: number };
  /** Preferred material types — first available match wins */
  preferredMaterials?: MaterialType[];
  /** Preferred architecture styles — first available match wins */
  preferredArchStyles?: ArchitectureStyle[];
  /** Preferred roof styles — first available match wins */
  preferredRoofStyles?: RoofStyle[];
};

// ── Commercial: Food & Drink ─────────────────────────────────────────────────

const BAKERY_STYLE: SubtypeStyleOverride = {
  // Warm tones, chimney is handled by building defaults
  colorTint: { r: 1.15, g: 1.0, b: 0.85 },
  preferredMaterials: ['brick', 'stucco'],
  hasPorch: false,
  hasShutters: true,
};

const RESTAURANT_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.1, g: 0.95, b: 0.85 },
  preferredMaterials: ['brick', 'stucco', 'wood'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 2,
  hasShutters: true,
};

const BAR_STYLE: SubtypeStyleOverride = {
  // Darker, moodier tones
  colorTint: { r: 0.8, g: 0.75, b: 0.7 },
  preferredMaterials: ['wood', 'brick'],
  preferredRoofStyles: ['flat', 'gable'],
  hasPorch: false,
  hasShutters: false,
};

const BREWERY_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.9, g: 0.85, b: 0.75 },
  preferredMaterials: ['brick', 'stone'],
  preferredRoofStyles: ['gable', 'side_gable'],
};

// ── Commercial: Retail ───────────────────────────────────────────────────────

const SHOP_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.05, g: 1.05, b: 1.0 },
  preferredMaterials: ['wood', 'brick', 'stucco'],
  hasPorch: true,
  porchDepth: 1.5,
  porchSteps: 1,
};

const GROCERY_STORE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 1.1, b: 0.95 },
  preferredMaterials: ['brick', 'stucco'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 1,
};

const JEWELRY_STORE_STYLE: SubtypeStyleOverride = {
  // Elegant, slightly cooler tones
  colorTint: { r: 0.95, g: 0.95, b: 1.1 },
  preferredMaterials: ['stone', 'brick'],
  hasShutters: true,
};

const BOOK_STORE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 0.95, b: 0.85 },
  preferredMaterials: ['wood', 'brick'],
  hasShutters: true,
};

const PAWN_SHOP_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.9, g: 0.85, b: 0.8 },
  preferredMaterials: ['wood', 'brick'],
};

const HERB_SHOP_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.9, g: 1.1, b: 0.85 },
  preferredMaterials: ['wood', 'stucco'],
  hasPorch: true,
  porchDepth: 1.5,
  porchSteps: 1,
};

// ── Commercial: Services ─────────────────────────────────────────────────────

const BANK_STYLE: SubtypeStyleOverride = {
  // Grand, formal — stone or brick
  colorTint: { r: 0.95, g: 0.95, b: 0.95 },
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  preferredRoofStyles: ['hip', 'flat'],
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 4,
  hasShutters: false,
};

const HOTEL_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.05, g: 1.0, b: 0.95 },
  preferredMaterials: ['brick', 'stucco', 'stone'],
  hasBalcony: true,
  hasShutters: true,
};

const BARBERSHOP_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 1.0, b: 1.05 },
  preferredMaterials: ['brick', 'wood'],
  preferredRoofStyles: ['flat', 'gable'],
};

const TAILOR_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.05, g: 0.95, b: 1.05 },
  preferredMaterials: ['wood', 'stucco'],
  hasShutters: true,
};

const BATHHOUSE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.95, g: 1.0, b: 1.1 },
  preferredMaterials: ['stone', 'stucco'],
  preferredRoofStyles: ['hip', 'flat'],
};

const PHARMACY_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 1.05, b: 1.05 },
  preferredMaterials: ['brick', 'stucco'],
  hasShutters: true,
};

const LAW_FIRM_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.9, g: 0.9, b: 0.9 },
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 3,
};

// ── Civic ────────────────────────────────────────────────────────────────────

const CHURCH_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial', 'medieval'],
  preferredRoofStyles: ['gable', 'side_gable'],
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 5,
};

const TOWN_HALL_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  preferredRoofStyles: ['hip', 'hipped_dormers'],
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 4,
  hasBalcony: true,
};

const SCHOOL_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 0.95, b: 0.9 },
  preferredMaterials: ['brick', 'stone'],
  preferredRoofStyles: ['hip', 'gable'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 3,
};

const UNIVERSITY_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial', 'medieval'],
  preferredRoofStyles: ['hip', 'hipped_dormers'],
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 5,
};

const HOSPITAL_STYLE: SubtypeStyleOverride = {
  // Clean, bright whites
  colorTint: { r: 1.15, g: 1.15, b: 1.15 },
  preferredMaterials: ['stucco', 'brick'],
  preferredRoofStyles: ['flat', 'hip'],
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 2,
};

const POLICE_STATION_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.85, g: 0.85, b: 0.9 },
  preferredMaterials: ['brick', 'stone'],
  preferredRoofStyles: ['flat', 'hip'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 3,
};

const FIRE_STATION_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.1, g: 0.85, b: 0.8 },
  preferredMaterials: ['brick', 'stone'],
  preferredRoofStyles: ['gable', 'flat'],
};

// ── Industrial ───────────────────────────────────────────────────────────────

const FACTORY_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.85, g: 0.8, b: 0.75 },
  preferredMaterials: ['metal', 'brick'],
  preferredRoofStyles: ['gable', 'flat'],
};

const FARM_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.1, g: 1.0, b: 0.85 },
  preferredMaterials: ['wood'],
  preferredRoofStyles: ['gable', 'side_gable'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 2,
};

const WAREHOUSE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.8, g: 0.8, b: 0.8 },
  preferredMaterials: ['metal', 'brick'],
  preferredRoofStyles: ['flat', 'gable'],
};

const BLACKSMITH_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.75, g: 0.7, b: 0.65 },
  preferredMaterials: ['stone', 'brick'],
  preferredRoofStyles: ['gable'],
};

const CARPENTER_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.05, g: 0.95, b: 0.8 },
  preferredMaterials: ['wood'],
  preferredRoofStyles: ['gable', 'side_gable'],
};

const BUTCHER_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 0.9, b: 0.85 },
  preferredMaterials: ['brick', 'wood'],
};

// ── Maritime ─────────────────────────────────────────────────────────────────

const HARBOR_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.9, g: 0.95, b: 1.0 },
  preferredMaterials: ['wood', 'stone'],
  preferredRoofStyles: ['gable', 'hip'],
};

const BOATYARD_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.85, g: 0.9, b: 0.95 },
  preferredMaterials: ['wood', 'metal'],
  preferredRoofStyles: ['gable', 'flat'],
};

const FISH_MARKET_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.95, g: 1.0, b: 1.05 },
  preferredMaterials: ['wood'],
  preferredRoofStyles: ['gable'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 1,
};

const CUSTOMS_HOUSE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 0.95, g: 0.95, b: 0.95 },
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  preferredRoofStyles: ['hip'],
};

const LIGHTHOUSE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.1, g: 1.1, b: 1.1 },
  preferredMaterials: ['stone', 'brick'],
};

// ── Residential ──────────────────────────────────────────────────────────────

const HOUSE_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['wood', 'brick'],
  preferredRoofStyles: ['gable', 'hip'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 2,
  hasShutters: true,
};

const APARTMENT_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['brick', 'stucco'],
  preferredRoofStyles: ['flat', 'hip'],
  hasBalcony: true,
};

const MANSION_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  preferredRoofStyles: ['hip', 'hipped_dormers'],
  hasBalcony: true,
  hasPorch: true,
  porchDepth: 3,
  porchSteps: 4,
  hasShutters: true,
};

const COTTAGE_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.1, g: 1.05, b: 0.95 },
  preferredMaterials: ['wood', 'stone'],
  preferredRoofStyles: ['gable'],
  hasPorch: true,
  porchDepth: 1.5,
  porchSteps: 1,
  hasShutters: true,
};

const TOWNHOUSE_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['brick', 'stucco'],
  preferredRoofStyles: ['side_gable', 'gable'],
  hasShutters: true,
};

const MOBILE_HOME_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['metal', 'wood'],
  preferredRoofStyles: ['flat', 'gable'],
};

// ── Other/Legacy ─────────────────────────────────────────────────────────────

const TAVERN_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.0, g: 0.9, b: 0.8 },
  preferredMaterials: ['wood', 'stone'],
  hasBalcony: true,
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 2,
};

const INN_STYLE: SubtypeStyleOverride = {
  colorTint: { r: 1.05, g: 1.0, b: 0.9 },
  preferredMaterials: ['wood', 'brick'],
  hasBalcony: true,
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 3,
  hasShutters: true,
};

const LIBRARY_STYLE: SubtypeStyleOverride = {
  preferredMaterials: ['stone', 'brick'],
  preferredArchStyles: ['colonial'],
  preferredRoofStyles: ['hip', 'hipped_dormers'],
  hasPorch: true,
  porchDepth: 2,
  porchSteps: 4,
};

// ── Lookup Table ─────────────────────────────────────────────────────────────

const SUBTYPE_STYLE_OVERRIDES: Record<string, SubtypeStyleOverride> = {
  // Commercial: Food
  Bakery: BAKERY_STYLE,
  Restaurant: RESTAURANT_STYLE,
  Bar: BAR_STYLE,
  Brewery: BREWERY_STYLE,
  // Commercial: Retail
  Shop: SHOP_STYLE,
  GroceryStore: GROCERY_STORE_STYLE,
  JewelryStore: JEWELRY_STORE_STYLE,
  BookStore: BOOK_STORE_STYLE,
  PawnShop: PAWN_SHOP_STYLE,
  HerbShop: HERB_SHOP_STYLE,
  // Commercial: Services
  Bank: BANK_STYLE,
  Hotel: HOTEL_STYLE,
  Barbershop: BARBERSHOP_STYLE,
  Tailor: TAILOR_STYLE,
  Bathhouse: BATHHOUSE_STYLE,
  Pharmacy: PHARMACY_STYLE,
  LawFirm: LAW_FIRM_STYLE,
  // Civic
  Church: CHURCH_STYLE,
  TownHall: TOWN_HALL_STYLE,
  School: SCHOOL_STYLE,
  University: UNIVERSITY_STYLE,
  Hospital: HOSPITAL_STYLE,
  PoliceStation: POLICE_STATION_STYLE,
  FireStation: FIRE_STATION_STYLE,
  // Industrial
  Factory: FACTORY_STYLE,
  Farm: FARM_STYLE,
  Warehouse: WAREHOUSE_STYLE,
  Blacksmith: BLACKSMITH_STYLE,
  Carpenter: CARPENTER_STYLE,
  Butcher: BUTCHER_STYLE,
  // Maritime
  Harbor: HARBOR_STYLE,
  Boatyard: BOATYARD_STYLE,
  FishMarket: FISH_MARKET_STYLE,
  CustomsHouse: CUSTOMS_HOUSE_STYLE,
  Lighthouse: LIGHTHOUSE_STYLE,
  // Residential
  house: HOUSE_STYLE,
  apartment: APARTMENT_STYLE,
  mansion: MANSION_STYLE,
  cottage: COTTAGE_STYLE,
  townhouse: TOWNHOUSE_STYLE,
  mobile_home: MOBILE_HOME_STYLE,
  // Other/Legacy
  Tavern: TAVERN_STYLE,
  Inn: INN_STYLE,
  Library: LIBRARY_STYLE,
};

/**
 * Returns the subtype-specific style overrides for a building type,
 * or undefined if no overrides are defined.
 */
export function getSubtypeStyleOverride(subtype: string): SubtypeStyleOverride | undefined {
  return SUBTYPE_STYLE_OVERRIDES[subtype];
}

/**
 * Apply subtype style overrides on top of a base preset, producing a new preset.
 * Only fields present in the override replace the base; everything else is kept.
 *
 * - `preferredMaterials` replaces `materialType` only if the base material is
 *   not already in the preferred list (preserves collection-level choices).
 * - `preferredArchStyles` / `preferredRoofStyles` work the same way.
 * - `colorTint` multiplies each channel of every baseColor.
 * - Boolean feature flags from the override always win.
 */
export function applySubtypeOverride(
  base: ProceduralStylePreset,
  override: SubtypeStyleOverride,
): ProceduralStylePreset {
  const result = { ...base };

  // Apply color tint to base colors
  if (override.colorTint) {
    const t = override.colorTint;
    result.baseColors = base.baseColors.map(c => ({
      r: Math.min(1, c.r * t.r),
      g: Math.min(1, c.g * t.g),
      b: Math.min(1, c.b * t.b),
    }));
  }

  // Material preference: use first preferred if base isn't already preferred
  if (override.preferredMaterials && override.preferredMaterials.length > 0) {
    if (!override.preferredMaterials.includes(base.materialType)) {
      result.materialType = override.preferredMaterials[0];
    }
  }

  // Architecture style preference
  if (override.preferredArchStyles && override.preferredArchStyles.length > 0) {
    if (!override.preferredArchStyles.includes(base.architectureStyle)) {
      result.architectureStyle = override.preferredArchStyles[0];
    }
  }

  // Roof style preference
  if (override.preferredRoofStyles && override.preferredRoofStyles.length > 0) {
    if (!base.roofStyle || !override.preferredRoofStyles.includes(base.roofStyle)) {
      result.roofStyle = override.preferredRoofStyles[0];
    }
  }

  // Boolean/numeric feature overrides — always win when present
  if (override.hasBalcony !== undefined) result.hasBalcony = override.hasBalcony;
  if (override.hasIronworkBalcony !== undefined) result.hasIronworkBalcony = override.hasIronworkBalcony;
  if (override.hasPorch !== undefined) result.hasPorch = override.hasPorch;
  if (override.porchDepth !== undefined) result.porchDepth = override.porchDepth;
  if (override.porchSteps !== undefined) result.porchSteps = override.porchSteps;
  if (override.hasShutters !== undefined) result.hasShutters = override.hasShutters;

  return result;
}
