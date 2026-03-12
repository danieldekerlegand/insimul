/**
 * Building & Business Lifecycle System (US-3.04)
 *
 * Manages business founding, operation, and closure during historical simulation.
 * Based on Talk of the Town's economic model where:
 *   - Business types have minimum population thresholds
 *   - Entrepreneurial characters (high openness + conscientiousness) found businesses
 *   - Businesses close when owners die/retire or population drops below viability
 *   - Multiple businesses of the same type compete, excess closes
 */

import { SeededRNG } from './historical-simulation';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export interface BusinessType {
  id: string;
  name: string;
  /** Minimum settlement population to support one instance of this business */
  minPopulation: number;
  /** Maximum instances per settlement (0 = unlimited, scaled by population) */
  maxInstances: number;
  /** Number of employees a typical instance needs (excluding owner) */
  typicalEmployees: number;
  /** Minimum personality openness for owner (0-1 scale) */
  minOwnerOpenness: number;
  /** Minimum personality conscientiousness for owner (0-1 scale) */
  minOwnerConscientiousness: number;
  /** Era availability — empty array means all eras */
  availableEras: string[];
  /** Economic sector for categorization */
  sector: 'agriculture' | 'manufacturing' | 'retail' | 'services' | 'professional' | 'hospitality' | 'civic';
}

export interface BusinessInstance {
  id: string;
  typeId: string;
  name: string;
  ownerId: string;
  ownerName: string;
  employeeIds: string[];
  foundedYear: number;
  closedYear?: number;
  settlementId: string;
  locationId?: string;
  isActive: boolean;
  /** Revenue multiplier based on competition and population (0-2) */
  healthScore: number;
}

export interface BusinessEvent {
  type: 'business_founding' | 'business_closure' | 'hiring' | 'retirement' | 'ownership_transfer';
  year: number;
  month: number;
  day: number;
  timestep: number;
  businessId: string;
  businessType: string;
  businessName: string;
  characterIds: string[];
  description: string;
  importance: number;
  historicalSignificance: 'settlement' | 'family' | 'personal';
  metadata: Record<string, unknown>;
}

export interface CharacterProfile {
  id: string;
  name: string;
  age: number;
  occupation?: string;
  employedAt?: string;
  isAlive: boolean;
  isRetired: boolean;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Default Business Types (based on TotT)
// ───────────────────────────────────────────────────────────────────────────

export const DEFAULT_BUSINESS_TYPES: BusinessType[] = [
  // Agriculture / Primary
  { id: 'farm', name: 'Farm', minPopulation: 0, maxInstances: 0, typicalEmployees: 2, minOwnerOpenness: 0.2, minOwnerConscientiousness: 0.4, availableEras: [], sector: 'agriculture' },

  // Retail
  { id: 'general_store', name: 'General Store', minPopulation: 50, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.5, availableEras: [], sector: 'retail' },
  { id: 'grocery', name: 'Grocery Store', minPopulation: 100, maxInstances: 2, typicalEmployees: 2, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.4, availableEras: [], sector: 'retail' },
  { id: 'clothing_store', name: 'Clothing Store', minPopulation: 150, maxInstances: 2, typicalEmployees: 1, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.4, availableEras: [], sector: 'retail' },
  { id: 'bookstore', name: 'Bookstore', minPopulation: 200, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.6, minOwnerConscientiousness: 0.5, availableEras: [], sector: 'retail' },
  { id: 'hardware_store', name: 'Hardware Store', minPopulation: 200, maxInstances: 1, typicalEmployees: 2, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.5, availableEras: [], sector: 'retail' },

  // Hospitality
  { id: 'tavern', name: 'Tavern', minPopulation: 50, maxInstances: 2, typicalEmployees: 2, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.3, availableEras: [], sector: 'hospitality' },
  { id: 'inn', name: 'Inn', minPopulation: 100, maxInstances: 1, typicalEmployees: 3, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.5, availableEras: [], sector: 'hospitality' },
  { id: 'restaurant', name: 'Restaurant', minPopulation: 200, maxInstances: 2, typicalEmployees: 3, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.4, availableEras: [], sector: 'hospitality' },
  { id: 'bakery', name: 'Bakery', minPopulation: 150, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.6, availableEras: [], sector: 'hospitality' },

  // Services
  { id: 'blacksmith', name: 'Blacksmith', minPopulation: 50, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.6, availableEras: ['pre_industrial', 'civil_war', 'reconstruction', 'gilded_age'], sector: 'manufacturing' },
  { id: 'barbershop', name: 'Barbershop', minPopulation: 100, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.4, availableEras: [], sector: 'services' },
  { id: 'tailor', name: 'Tailor', minPopulation: 100, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.6, availableEras: [], sector: 'services' },
  { id: 'bank', name: 'Bank', minPopulation: 300, maxInstances: 1, typicalEmployees: 3, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.7, availableEras: [], sector: 'professional' },

  // Professional
  { id: 'doctor_office', name: "Doctor's Office", minPopulation: 150, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.7, availableEras: [], sector: 'professional' },
  { id: 'law_office', name: 'Law Office', minPopulation: 250, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.7, availableEras: [], sector: 'professional' },
  { id: 'school', name: 'School', minPopulation: 100, maxInstances: 1, typicalEmployees: 2, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.6, availableEras: [], sector: 'civic' },
  { id: 'church', name: 'Church', minPopulation: 50, maxInstances: 1, typicalEmployees: 1, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.5, availableEras: [], sector: 'civic' },

  // Manufacturing (era-specific)
  { id: 'mill', name: 'Mill', minPopulation: 100, maxInstances: 1, typicalEmployees: 3, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.5, availableEras: ['pre_industrial', 'civil_war', 'reconstruction', 'gilded_age', 'progressive'], sector: 'manufacturing' },
  { id: 'factory', name: 'Factory', minPopulation: 500, maxInstances: 0, typicalEmployees: 10, minOwnerOpenness: 0.4, minOwnerConscientiousness: 0.6, availableEras: ['gilded_age', 'progressive', 'roaring_twenties', 'great_depression', 'world_war_ii', 'post_war', 'civil_rights', 'modern', 'contemporary'], sector: 'manufacturing' },

  // Modern
  { id: 'gas_station', name: 'Gas Station', minPopulation: 200, maxInstances: 2, typicalEmployees: 2, minOwnerOpenness: 0.3, minOwnerConscientiousness: 0.4, availableEras: ['roaring_twenties', 'great_depression', 'world_war_ii', 'post_war', 'civil_rights', 'modern', 'contemporary'], sector: 'services' },
  { id: 'movie_theater', name: 'Movie Theater', minPopulation: 500, maxInstances: 1, typicalEmployees: 4, minOwnerOpenness: 0.5, minOwnerConscientiousness: 0.4, availableEras: ['roaring_twenties', 'great_depression', 'world_war_ii', 'post_war', 'civil_rights', 'modern', 'contemporary'], sector: 'hospitality' },
];

// ───────────────────────────────────────────────────────────────────────────
// BusinessLifecycleEngine
// ───────────────────────────────────────────────────────────────────────────

export class BusinessLifecycleEngine {
  private businesses: Map<string, BusinessInstance> = new Map();
  private businessTypes: BusinessType[];
  private nextId = 1;

  constructor(businessTypes?: BusinessType[]) {
    this.businessTypes = businessTypes ?? DEFAULT_BUSINESS_TYPES;
  }

  /** Get all active businesses */
  getActiveBusinesses(): BusinessInstance[] {
    return Array.from(this.businesses.values()).filter(b => b.isActive);
  }

  /** Get all businesses (including closed) */
  getAllBusinesses(): BusinessInstance[] {
    return Array.from(this.businesses.values());
  }

  /** Get businesses by type */
  getBusinessesByType(typeId: string): BusinessInstance[] {
    return Array.from(this.businesses.values()).filter(b => b.typeId === typeId && b.isActive);
  }

  /**
   * Evaluate which business types are viable given current population and era.
   * Returns types that could be founded (demand > supply).
   */
  getViableBusinessTypes(population: number, era: string): BusinessType[] {
    return this.businessTypes.filter(bt => {
      // Check population threshold
      if (population < bt.minPopulation) return false;

      // Check era availability
      if (bt.availableEras.length > 0 && !bt.availableEras.includes(era)) return false;

      // Check if there's room for another instance
      const existing = this.getBusinessesByType(bt.id);
      if (bt.maxInstances > 0 && existing.length >= bt.maxInstances) return false;

      // For unlimited types, scale by population
      if (bt.maxInstances === 0) {
        const maxByPop = Math.floor(population / (bt.minPopulation || 100));
        if (existing.length >= maxByPop) return false;
      }

      return true;
    });
  }

  /**
   * Check for business opportunities and return founding events.
   * Called once per sampled timestep.
   */
  checkBusinessFoundings(
    population: number,
    era: string,
    availableEntrepreneurs: CharacterProfile[],
    settlementId: string,
    year: number,
    month: number,
    day: number,
    timestep: number,
    rng: SeededRNG,
    baseProbability: number,
  ): BusinessEvent[] {
    const events: BusinessEvent[] = [];
    const viable = this.getViableBusinessTypes(population, era);

    if (viable.length === 0 || availableEntrepreneurs.length === 0) return events;

    for (const bt of viable) {
      // Base founding probability modified by demand
      if (!rng.chance(baseProbability)) continue;

      // Find a suitable entrepreneur
      const candidates = availableEntrepreneurs.filter(c =>
        c.personality.openness >= bt.minOwnerOpenness &&
        c.personality.conscientiousness >= bt.minOwnerConscientiousness &&
        !c.employedAt // not already running a business
      );

      if (candidates.length === 0) continue;

      // Pick the most entrepreneurial candidate
      const sorted = [...candidates].sort((a, b) => {
        const scoreA = a.personality.openness * 0.6 + a.personality.conscientiousness * 0.4;
        const scoreB = b.personality.openness * 0.6 + b.personality.conscientiousness * 0.4;
        return scoreB - scoreA;
      });

      const owner = sorted[0];
      const businessId = `biz_${this.nextId++}`;
      const businessName = generateBusinessName(bt, owner.name, rng);

      const business: BusinessInstance = {
        id: businessId,
        typeId: bt.id,
        name: businessName,
        ownerId: owner.id,
        ownerName: owner.name,
        employeeIds: [],
        foundedYear: year,
        settlementId,
        isActive: true,
        healthScore: 1.0,
      };

      this.businesses.set(businessId, business);

      events.push({
        type: 'business_founding',
        year, month, day, timestep,
        businessId,
        businessType: bt.id,
        businessName,
        characterIds: [owner.id],
        description: `${owner.name} founded ${businessName} (${bt.name})`,
        importance: population < 200 ? 7 : 5,
        historicalSignificance: 'settlement',
        metadata: {
          businessTypeId: bt.id,
          ownerOpenness: owner.personality.openness,
          ownerConscientiousness: owner.personality.conscientiousness,
          populationAtFounding: population,
        },
      });

      // Remove from available pool
      const idx = availableEntrepreneurs.indexOf(owner);
      if (idx >= 0) availableEntrepreneurs.splice(idx, 1);
    }

    return events;
  }

  /**
   * Check for business closures due to owner death/retirement or economic conditions.
   */
  checkBusinessClosures(
    population: number,
    era: string,
    deceasedCharacterIds: Set<string>,
    retiredCharacterIds: Set<string>,
    year: number,
    month: number,
    day: number,
    timestep: number,
    rng: SeededRNG,
    baseClosureProbability: number,
  ): BusinessEvent[] {
    const events: BusinessEvent[] = [];

    for (const business of this.getActiveBusinesses()) {
      let shouldClose = false;
      let reason = '';

      // Owner died
      if (deceasedCharacterIds.has(business.ownerId)) {
        shouldClose = true;
        reason = `owner ${business.ownerName} passed away`;
      }

      // Owner retired
      if (!shouldClose && retiredCharacterIds.has(business.ownerId)) {
        // 70% chance of closing on retirement, 30% chance of finding successor
        if (rng.chance(0.7)) {
          shouldClose = true;
          reason = `owner ${business.ownerName} retired`;
        }
      }

      // Economic pressure — population dropped below viability
      if (!shouldClose) {
        const bt = this.businessTypes.find(t => t.id === business.typeId);
        if (bt && population < bt.minPopulation * 0.8) {
          if (rng.chance(baseClosureProbability * 2)) {
            shouldClose = true;
            reason = 'insufficient demand';
          }
        }
      }

      // Competition — too many of this type
      if (!shouldClose) {
        const bt = this.businessTypes.find(t => t.id === business.typeId);
        if (bt) {
          const competitors = this.getBusinessesByType(bt.id);
          const maxSupported = bt.maxInstances > 0
            ? bt.maxInstances
            : Math.max(1, Math.floor(population / (bt.minPopulation || 100)));

          if (competitors.length > maxSupported) {
            // Weakest business closes
            const weakest = [...competitors].sort((a, b) => a.healthScore - b.healthScore)[0];
            if (weakest.id === business.id && rng.chance(baseClosureProbability)) {
              shouldClose = true;
              reason = 'competition';
            }
          }
        }
      }

      if (shouldClose) {
        business.isActive = false;
        business.closedYear = year;

        events.push({
          type: 'business_closure',
          year, month, day, timestep,
          businessId: business.id,
          businessType: business.typeId,
          businessName: business.name,
          characterIds: [business.ownerId, ...business.employeeIds],
          description: `${business.name} closed (${reason})`,
          importance: business.employeeIds.length > 3 ? 6 : 4,
          historicalSignificance: 'settlement',
          metadata: {
            reason,
            yearsInOperation: year - business.foundedYear,
            employeesDisplaced: business.employeeIds.length,
          },
        });
      }
    }

    return events;
  }

  /**
   * Update business health scores based on competition and economic conditions.
   * Called once per simulated year.
   */
  updateHealthScores(population: number): void {
    for (const business of this.getActiveBusinesses()) {
      const bt = this.businessTypes.find(t => t.id === business.typeId);
      if (!bt) continue;

      const competitors = this.getBusinessesByType(bt.id).length;
      const maxSupported = bt.maxInstances > 0
        ? bt.maxInstances
        : Math.max(1, Math.floor(population / (bt.minPopulation || 100)));

      // Health based on supply/demand ratio
      const ratio = maxSupported / Math.max(1, competitors);
      business.healthScore = Math.min(2, Math.max(0.1, ratio));
    }
  }

  /** Serialize state for persistence */
  serialize(): { businesses: BusinessInstance[]; nextId: number } {
    return {
      businesses: Array.from(this.businesses.values()),
      nextId: this.nextId,
    };
  }

  /** Restore from serialized state */
  deserialize(data: { businesses: BusinessInstance[]; nextId: number }): void {
    this.businesses.clear();
    for (const b of data.businesses) {
      this.businesses.set(b.id, b);
    }
    this.nextId = data.nextId;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function generateBusinessName(bt: BusinessType, ownerName: string, rng: SeededRNG): string {
  const lastName = ownerName.split(' ').pop() ?? ownerName;

  const patterns = [
    `${lastName}'s ${bt.name}`,
    `The ${lastName} ${bt.name}`,
    `${lastName} & Sons ${bt.name}`,
    `${lastName} ${bt.name} Co.`,
  ];

  return rng.pick(patterns) ?? `${lastName}'s ${bt.name}`;
}

/**
 * Create a BusinessLifecycleEngine with default configuration.
 */
export function createBusinessLifecycleEngine(customTypes?: BusinessType[]): BusinessLifecycleEngine {
  return new BusinessLifecycleEngine(customTypes);
}
