/**
 * Settlement Subtype System
 * Infers settlement subtypes from terrain, population, and settlement type,
 * and provides per-subtype configuration for landmarks, street patterns, and building styles.
 */

import type { GeographyConfig } from './geography-generator';
import type { StreetPatternType } from './street-generator';

export type SettlementSubtype =
  | 'port_city'
  | 'mountain_village'
  | 'river_crossing'
  | 'mining_town'
  | 'fortress_town'
  | 'oasis_settlement'
  | 'fishing_village'
  | 'crossroads_town'
  | 'university_town'
  | 'market_town'
  | 'cliff_dwelling'
  | 'island_settlement'
  | 'valley_town'
  | 'standard';

export interface SubtypeConfig {
  requiredLandmarkTypes: string[];
  preferredStreetPattern: StreetPatternType;
  buildingStyleHints: string[];
  specialFeatures: string[];
}

const SUBTYPE_CONFIGS: Record<SettlementSubtype, SubtypeConfig> = {
  port_city: {
    requiredLandmarkTypes: ['harbor', 'lighthouse', 'shipyard'],
    preferredStreetPattern: 'waterfront',
    buildingStyleHints: ['maritime', 'warehouse', 'dockside'],
    specialFeatures: ['harbor_district', 'fish_market', 'naval_yard'],
  },
  mountain_village: {
    requiredLandmarkTypes: ['mine_entrance', 'mountain_shrine', 'watchtower'],
    preferredStreetPattern: 'hillside',
    buildingStyleHints: ['stone', 'timber', 'alpine'],
    specialFeatures: ['terraced_fields', 'mountain_pass', 'avalanche_wall'],
  },
  river_crossing: {
    requiredLandmarkTypes: ['bridge', 'toll_gate', 'ferry_dock'],
    preferredStreetPattern: 'linear',
    buildingStyleHints: ['riverside', 'timber_frame', 'stone_bridge'],
    specialFeatures: ['bridge_market', 'ford', 'river_wall'],
  },
  mining_town: {
    requiredLandmarkTypes: ['mine_entrance', 'smelter', 'assay_office'],
    preferredStreetPattern: 'linear',
    buildingStyleHints: ['industrial', 'timber', 'utilitarian'],
    specialFeatures: ['mine_shaft', 'tailings_pile', 'ore_cart_tracks'],
  },
  fortress_town: {
    requiredLandmarkTypes: ['fortress', 'gatehouse', 'barracks'],
    preferredStreetPattern: 'radial',
    buildingStyleHints: ['fortified', 'stone', 'military'],
    specialFeatures: ['city_wall', 'moat', 'parade_ground'],
  },
  oasis_settlement: {
    requiredLandmarkTypes: ['oasis_pool', 'caravanserai', 'palm_grove'],
    preferredStreetPattern: 'radial',
    buildingStyleHints: ['adobe', 'sandstone', 'courtyard'],
    specialFeatures: ['water_cistern', 'shade_market', 'caravan_route'],
  },
  fishing_village: {
    requiredLandmarkTypes: ['dock', 'fish_market', 'net_sheds'],
    preferredStreetPattern: 'waterfront',
    buildingStyleHints: ['coastal', 'weathered_timber', 'boat_shed'],
    specialFeatures: ['tide_pools', 'smoking_house', 'boat_ramp'],
  },
  crossroads_town: {
    requiredLandmarkTypes: ['inn', 'market_square', 'milestone'],
    preferredStreetPattern: 'grid',
    buildingStyleHints: ['commercial', 'mixed_use', 'traveler_friendly'],
    specialFeatures: ['crossroads_plaza', 'stables', 'waystation'],
  },
  university_town: {
    requiredLandmarkTypes: ['university', 'library', 'observatory'],
    preferredStreetPattern: 'grid',
    buildingStyleHints: ['academic', 'gothic', 'collegiate'],
    specialFeatures: ['campus_quad', 'botanical_garden', 'lecture_hall'],
  },
  market_town: {
    requiredLandmarkTypes: ['market_square', 'guild_hall', 'warehouse'],
    preferredStreetPattern: 'radial',
    buildingStyleHints: ['mercantile', 'timber_frame', 'shop_front'],
    specialFeatures: ['market_day_ground', 'merchant_quarter', 'trade_road'],
  },
  cliff_dwelling: {
    requiredLandmarkTypes: ['cliff_face', 'rope_bridge', 'cave_shrine'],
    preferredStreetPattern: 'hillside',
    buildingStyleHints: ['carved_stone', 'terraced', 'cliff_face'],
    specialFeatures: ['cliff_stairs', 'lookout_point', 'cave_storage'],
  },
  island_settlement: {
    requiredLandmarkTypes: ['dock', 'lighthouse', 'seawall'],
    preferredStreetPattern: 'organic',
    buildingStyleHints: ['coastal', 'compact', 'elevated'],
    specialFeatures: ['tidal_causeway', 'sea_wall', 'signal_tower'],
  },
  valley_town: {
    requiredLandmarkTypes: ['mill', 'granary', 'valley_overlook'],
    preferredStreetPattern: 'linear',
    buildingStyleHints: ['pastoral', 'stone_and_timber', 'farmstead'],
    specialFeatures: ['irrigation_canal', 'terraced_farms', 'windmill'],
  },
  standard: {
    requiredLandmarkTypes: ['town_hall', 'market_square', 'temple'],
    preferredStreetPattern: 'grid',
    buildingStyleHints: ['mixed', 'regional', 'traditional'],
    specialFeatures: ['town_square', 'commons', 'well'],
  },
};

/**
 * Infers the settlement subtype from geography config.
 * Selection is based on terrain type, population, and settlement type.
 */
export function inferSettlementSubtype(config: GeographyConfig): SettlementSubtype {
  const { terrain, population, settlementType } = config;

  // Terrain-primary rules
  if (terrain === 'coast') {
    if (settlementType === 'city' || population >= 500) return 'port_city';
    return 'fishing_village';
  }

  if (terrain === 'mountains') {
    if (population >= 300 && settlementType !== 'village') return 'mining_town';
    if (population < 100) return 'cliff_dwelling';
    return 'mountain_village';
  }

  if (terrain === 'river') {
    return 'river_crossing';
  }

  if (terrain === 'desert') {
    return 'oasis_settlement';
  }

  if (terrain === 'hills') {
    if (population < 200) return 'valley_town';
    if (settlementType === 'city') return 'fortress_town';
    return 'valley_town';
  }

  // Plains and forest — population-based
  if (terrain === 'plains' || terrain === 'forest') {
    if (settlementType === 'city') {
      if (population >= 2000) return 'university_town';
      return 'market_town';
    }
    if (settlementType === 'town') {
      return 'crossroads_town';
    }
  }

  return 'standard';
}

/**
 * Returns the SubtypeConfig for a given settlement subtype.
 */
export function getSubtypeConfig(subtype: SettlementSubtype): SubtypeConfig {
  return SUBTYPE_CONFIGS[subtype];
}
