/**
 * Agricultural Zone Generator
 * Generates farmland, orchards, and pastures near settlements
 * based on terrain, settlement size, and surrounding geography.
 */

export type AgriculturalZoneType = 'farmland' | 'orchard' | 'pasture';

export interface AgriculturalZone {
  id: string;
  name: string;
  type: AgriculturalZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    crop?: string;
    livestock?: string;
    soilQuality: number; // 0-100
    yield: number; // 0-100 productivity rating
    irrigated: boolean;
    established: number; // year
  };
}

export interface AgriculturalZoneConfig {
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  foundedYear: number;
  mapSize: number; // from settlement map size
  centerX: number;
  centerY: number;
  seed?: number;
}

// Terrain suitability: which zone types each terrain supports and how well (0-1)
const TERRAIN_SUITABILITY: Record<string, Record<AgriculturalZoneType, number>> = {
  plains:    { farmland: 1.0, orchard: 0.8, pasture: 0.9 },
  hills:     { farmland: 0.4, orchard: 0.7, pasture: 1.0 },
  mountains: { farmland: 0.0, orchard: 0.2, pasture: 0.5 },
  coast:     { farmland: 0.6, orchard: 0.5, pasture: 0.7 },
  river:     { farmland: 0.9, orchard: 0.7, pasture: 0.8 },
  forest:    { farmland: 0.3, orchard: 0.6, pasture: 0.4 },
  desert:    { farmland: 0.1, orchard: 0.1, pasture: 0.2 },
};

const CROPS_BY_TERRAIN: Record<string, string[]> = {
  plains: ['wheat', 'corn', 'barley', 'oats', 'soybeans', 'sunflowers'],
  hills: ['rye', 'potatoes', 'buckwheat'],
  mountains: ['potatoes'],
  coast: ['rice', 'salt hay', 'barley'],
  river: ['rice', 'wheat', 'corn', 'vegetables', 'flax'],
  forest: ['rye', 'mushrooms', 'herbs'],
  desert: ['dates'],
};

const ORCHARD_TYPES_BY_TERRAIN: Record<string, string[]> = {
  plains: ['apple', 'pear', 'cherry', 'peach'],
  hills: ['apple', 'grape', 'olive', 'walnut'],
  mountains: ['cherry', 'walnut'],
  coast: ['citrus', 'fig', 'olive'],
  river: ['apple', 'pear', 'plum', 'peach'],
  forest: ['chestnut', 'hazelnut', 'elderberry'],
  desert: ['date palm'],
};

const LIVESTOCK_BY_TERRAIN: Record<string, string[]> = {
  plains: ['cattle', 'sheep', 'horses', 'goats'],
  hills: ['sheep', 'goats', 'cattle'],
  mountains: ['goats', 'sheep', 'llamas'],
  coast: ['sheep', 'cattle'],
  river: ['cattle', 'horses', 'ducks'],
  forest: ['pigs', 'goats'],
  desert: ['goats', 'camels'],
};

const FARMLAND_NAMES = [
  'North Field', 'South Field', 'East Field', 'West Field',
  'Upper Field', 'Lower Field', 'Mill Field', 'Church Field',
  'Long Acre', 'Broad Field', 'Home Field', 'Far Field',
];

const ORCHARD_NAMES = [
  'Old Orchard', 'Hill Orchard', 'Valley Orchard', 'Manor Orchard',
  'Spring Orchard', 'Sunny Grove', 'Hillside Grove', 'Brook Orchard',
];

const PASTURE_NAMES = [
  'Common Pasture', 'North Meadow', 'South Meadow', 'River Meadow',
  'Hill Pasture', 'Green Pasture', 'Open Range', 'West Grazing',
];

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class AgriculturalZoneGenerator {
  /**
   * Generate agricultural zones around a settlement.
   */
  generate(config: AgriculturalZoneConfig): AgriculturalZone[] {
    const rand = seededRandom(config.seed ?? Date.now());
    const suitability = TERRAIN_SUITABILITY[config.terrain] || TERRAIN_SUITABILITY.plains;
    const zones: AgriculturalZone[] = [];

    const counts = this.getZoneCounts(config.settlementType, suitability);
    const outerRadius = config.mapSize * 0.6; // zones start just outside settlement

    let zoneIndex = 0;

    for (const [zoneType, count] of Object.entries(counts) as [AgriculturalZoneType, number][]) {
      for (let i = 0; i < count; i++) {
        const zone = this.generateZone(
          zoneType,
          zoneIndex,
          config,
          suitability[zoneType],
          outerRadius,
          rand,
        );
        if (zone) {
          zones.push(zone);
          zoneIndex++;
        }
      }
    }

    return zones;
  }

  /**
   * Determine how many of each zone type to generate based on settlement size and terrain.
   */
  private getZoneCounts(
    settlementType: string,
    suitability: Record<AgriculturalZoneType, number>,
  ): Record<AgriculturalZoneType, number> {
    const baseCount = this.getBaseZoneCount(settlementType);

    return {
      farmland: Math.round(baseCount.farmland * suitability.farmland),
      orchard: Math.round(baseCount.orchard * suitability.orchard),
      pasture: Math.round(baseCount.pasture * suitability.pasture),
    };
  }

  private getBaseZoneCount(settlementType: string): Record<AgriculturalZoneType, number> {
    switch (settlementType) {
      case 'village': return { farmland: 4, orchard: 2, pasture: 3 };
      case 'town':    return { farmland: 6, orchard: 3, pasture: 4 };
      case 'city':    return { farmland: 8, orchard: 4, pasture: 5 };
      default:        return { farmland: 4, orchard: 2, pasture: 3 };
    }
  }

  private generateZone(
    type: AgriculturalZoneType,
    index: number,
    config: AgriculturalZoneConfig,
    suitabilityScore: number,
    outerRadius: number,
    rand: () => number,
  ): AgriculturalZone | null {
    if (suitabilityScore <= 0) return null;

    // Place zones in a ring around the settlement
    const angle = rand() * 2 * Math.PI;
    const distance = outerRadius + rand() * outerRadius * 0.8;
    const x = config.centerX + Math.cos(angle) * distance;
    const y = config.centerY + Math.sin(angle) * distance;

    const size = this.getZoneSize(type, config.settlementType, rand);
    const name = this.getZoneName(type, index, rand);
    const soilQuality = Math.round(suitabilityScore * 60 + rand() * 40);
    const yieldRating = Math.round(soilQuality * (0.6 + rand() * 0.4));

    const zone: AgriculturalZone = {
      id: `agri-${type}-${index}`,
      name,
      type,
      x,
      y,
      width: size.width,
      height: size.height,
      properties: {
        soilQuality,
        yield: yieldRating,
        irrigated: config.terrain === 'river' || rand() > 0.7,
        established: config.foundedYear + Math.floor(rand() * 50),
      },
    };

    // Assign type-specific properties
    switch (type) {
      case 'farmland': {
        const crops = CROPS_BY_TERRAIN[config.terrain] || CROPS_BY_TERRAIN.plains;
        zone.properties.crop = crops[Math.floor(rand() * crops.length)];
        break;
      }
      case 'orchard': {
        const orchards = ORCHARD_TYPES_BY_TERRAIN[config.terrain] || ORCHARD_TYPES_BY_TERRAIN.plains;
        zone.properties.crop = orchards[Math.floor(rand() * orchards.length)];
        break;
      }
      case 'pasture': {
        const livestock = LIVESTOCK_BY_TERRAIN[config.terrain] || LIVESTOCK_BY_TERRAIN.plains;
        zone.properties.livestock = livestock[Math.floor(rand() * livestock.length)];
        break;
      }
    }

    return zone;
  }

  private getZoneSize(
    type: AgriculturalZoneType,
    settlementType: string,
    rand: () => number,
  ): { width: number; height: number } {
    const scale = settlementType === 'city' ? 1.5 : settlementType === 'town' ? 1.2 : 1.0;
    const baseSize = type === 'farmland' ? 120 : type === 'orchard' ? 80 : 100;
    const variation = 0.7 + rand() * 0.6; // 0.7x to 1.3x

    const width = Math.round(baseSize * scale * variation);
    const height = Math.round(baseSize * scale * (0.7 + rand() * 0.6));

    return { width, height };
  }

  private getZoneName(type: AgriculturalZoneType, index: number, rand: () => number): string {
    const names = type === 'farmland' ? FARMLAND_NAMES
      : type === 'orchard' ? ORCHARD_NAMES
      : PASTURE_NAMES;

    return names[index % names.length];
  }
}
