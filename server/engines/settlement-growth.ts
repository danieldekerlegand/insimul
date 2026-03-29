/**
 * Settlement Growth Mechanics (US-063)
 *
 * Manages settlement tier progression, infrastructure growth, and district
 * expansion based on population changes. Integrates with the historical
 * simulation engine to generate growth milestone events.
 *
 * Settlement tiers:
 *   hamlet   → village  → town     → city      → metropolis
 *   (< 50)    (50-199)   (200-999)  (1000-4999)  (5000+)
 *
 * As population crosses tier thresholds, the engine emits tier_change events
 * and tracks infrastructure milestones (new districts, streets, landmarks).
 */

import { SeededRNG } from './historical-simulation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Settlement size tiers based on population thresholds. */
export type SettlementTier = 'dwelling' | 'roadhouse' | 'homestead' | 'hamlet' | 'village' | 'town' | 'city' | 'metropolis';

/** Population thresholds for each tier (minimum population to qualify). */
export const TIER_THRESHOLDS: Record<SettlementTier, number> = {
  dwelling: 0,
  roadhouse: 0,
  homestead: 0,
  hamlet: 15,
  village: 50,
  town: 200,
  city: 1000,
  metropolis: 5000,
};

/** Ordered list of tiers from smallest to largest. */
const TIER_ORDER: SettlementTier[] = ['dwelling', 'roadhouse', 'homestead', 'hamlet', 'village', 'town', 'city', 'metropolis'];

/** Infrastructure capacities by tier. */
export const TIER_INFRASTRUCTURE: Record<SettlementTier, {
  maxDistricts: number;
  maxStreetsPerDistrict: number;
  maxLandmarks: number;
  infrastructureLevel: number;
}> = {
  dwelling: { maxDistricts: 1, maxStreetsPerDistrict: 1, maxLandmarks: 0, infrastructureLevel: 0 },
  roadhouse: { maxDistricts: 1, maxStreetsPerDistrict: 1, maxLandmarks: 0, infrastructureLevel: 0 },
  homestead: { maxDistricts: 1, maxStreetsPerDistrict: 1, maxLandmarks: 0, infrastructureLevel: 0 },
  hamlet: { maxDistricts: 1, maxStreetsPerDistrict: 2, maxLandmarks: 1, infrastructureLevel: 1 },
  village: { maxDistricts: 2, maxStreetsPerDistrict: 4, maxLandmarks: 2, infrastructureLevel: 2 },
  town: { maxDistricts: 4, maxStreetsPerDistrict: 6, maxLandmarks: 4, infrastructureLevel: 3 },
  city: { maxDistricts: 8, maxStreetsPerDistrict: 10, maxLandmarks: 8, infrastructureLevel: 4 },
  metropolis: { maxDistricts: 16, maxStreetsPerDistrict: 15, maxLandmarks: 16, infrastructureLevel: 5 },
};

/** A district within a settlement. */
export interface District {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'civic' | 'mixed';
  foundedYear: number;
  streets: string[];
}

/** A snapshot of settlement growth state at a point in time. */
export interface GrowthSnapshot {
  year: number;
  population: number;
  tier: SettlementTier;
  districts: number;
  businesses: number;
  infrastructureLevel: number;
}

/** An event emitted when a growth milestone is reached. */
export interface GrowthEvent {
  type: 'tier_change' | 'new_district' | 'infrastructure_milestone' | 'population_milestone';
  year: number;
  month: number;
  day: number;
  timestep: number;
  description: string;
  importance: number;
  historicalSignificance: 'settlement';
  metadata: Record<string, unknown>;
}

/** Configuration for the settlement growth engine. */
export interface SettlementGrowthConfig {
  /** Settlement identifier. */
  settlementId: string;
  /** Initial population (used to determine starting tier). */
  initialPopulation: number;
  /** Initial number of businesses. */
  initialBusinesses?: number;
  /** Custom tier thresholds (overrides defaults). */
  tierThresholds?: Partial<Record<SettlementTier, number>>;
}

/** Mutable growth state tracked by the engine. */
export interface SettlementGrowthState {
  settlementId: string;
  population: number;
  tier: SettlementTier;
  previousTier: SettlementTier;
  districts: District[];
  businesses: number;
  infrastructureLevel: number;
  populationHistory: GrowthSnapshot[];
  /** Population milestones already triggered (to avoid duplicates). */
  triggeredMilestones: number[];
}

// ---------------------------------------------------------------------------
// District name generation
// ---------------------------------------------------------------------------

const DISTRICT_NAME_PREFIXES: Record<District['type'], string[]> = {
  residential: ['Oak', 'Maple', 'Cedar', 'Elm', 'Pine', 'Willow', 'Birch', 'Laurel'],
  commercial: ['Market', 'Exchange', 'Trade', 'Commerce', 'Merchant', 'Plaza'],
  industrial: ['Mill', 'Foundry', 'Iron', 'Steel', 'Factory', 'Forge'],
  civic: ['Capitol', 'Court', 'Town', 'Center', 'Liberty', 'Union'],
  mixed: ['Main', 'Central', 'Cross', 'Bridge', 'Spring', 'Lake'],
};

const DISTRICT_NAME_SUFFIXES = ['District', 'Quarter', 'Ward', 'Heights', 'Hill', 'Green'];

function generateDistrictName(type: District['type'], existingNames: string[], rng: SeededRNG): string {
  const prefixes = DISTRICT_NAME_PREFIXES[type];
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const prefix = rng.pick(prefixes) ?? prefixes[0];
    const suffix = rng.pick(DISTRICT_NAME_SUFFIXES) ?? 'District';
    const name = `${prefix} ${suffix}`;
    if (!existingNames.includes(name)) return name;
  }

  return `District ${existingNames.length + 1}`;
}

// ---------------------------------------------------------------------------
// Core engine
// ---------------------------------------------------------------------------

/**
 * Determine the settlement tier for a given population.
 */
export function getTierForPopulation(
  population: number,
  thresholds: Record<SettlementTier, number> = TIER_THRESHOLDS,
): SettlementTier {
  // Walk tiers from largest to smallest, return first that fits
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (population >= thresholds[TIER_ORDER[i]]) {
      return TIER_ORDER[i];
    }
  }
  return 'hamlet';
}

/**
 * Get the index of a tier in the ordered tier list.
 */
export function getTierIndex(tier: SettlementTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Population milestones that trigger events (every 100 up to 1000, then every 500).
 */
function getPopulationMilestones(): number[] {
  const milestones: number[] = [];
  for (let p = 100; p <= 1000; p += 100) milestones.push(p);
  for (let p = 1500; p <= 10000; p += 500) milestones.push(p);
  return milestones;
}

const POPULATION_MILESTONES = getPopulationMilestones();

/**
 * Settlement Growth Engine
 *
 * Tracks settlement growth state and emits events when milestones are
 * reached. Call `update()` each simulation timestep with the current
 * population to check for tier changes, new districts, and milestones.
 */
export class SettlementGrowthEngine {
  private state: SettlementGrowthState;
  private thresholds: Record<SettlementTier, number>;

  constructor(config: SettlementGrowthConfig) {
    const thresholds = { ...TIER_THRESHOLDS, ...config.tierThresholds };
    const initialTier = getTierForPopulation(config.initialPopulation, thresholds);

    this.thresholds = thresholds;
    this.state = {
      settlementId: config.settlementId,
      population: config.initialPopulation,
      tier: initialTier,
      previousTier: initialTier,
      districts: [{
        id: 'district_1',
        name: 'Town Center',
        type: 'mixed',
        foundedYear: 0,
        streets: ['Main Street'],
      }],
      businesses: config.initialBusinesses ?? 0,
      infrastructureLevel: TIER_INFRASTRUCTURE[initialTier].infrastructureLevel,
      populationHistory: [],
      triggeredMilestones: [],
    };
  }

  /** Get the current growth state (read-only snapshot). */
  getState(): Readonly<SettlementGrowthState> {
    return this.state;
  }

  /** Get the current tier. */
  getTier(): SettlementTier {
    return this.state.tier;
  }

  /** Get the current population. */
  getPopulation(): number {
    return this.state.population;
  }

  /** Get all districts. */
  getDistricts(): readonly District[] {
    return this.state.districts;
  }

  /**
   * Update the growth engine with current population and check for milestones.
   *
   * @param population - Current settlement population
   * @param businesses - Current number of active businesses
   * @param year       - Current simulation year
   * @param month      - Current month (1-12)
   * @param day        - Current day
   * @param timestep   - Current timestep counter
   * @param rng        - Seeded RNG for deterministic district generation
   * @returns Array of growth events triggered by this update
   */
  update(
    population: number,
    businesses: number,
    year: number,
    month: number,
    day: number,
    timestep: number,
    rng: SeededRNG,
  ): GrowthEvent[] {
    const events: GrowthEvent[] = [];
    const oldPopulation = this.state.population;
    const oldTier = this.state.tier;

    this.state.population = population;
    this.state.businesses = businesses;

    // Check tier change
    const newTier = getTierForPopulation(population, this.thresholds);
    if (newTier !== oldTier) {
      this.state.previousTier = oldTier;
      this.state.tier = newTier;
      this.state.infrastructureLevel = TIER_INFRASTRUCTURE[newTier].infrastructureLevel;

      const grew = getTierIndex(newTier) > getTierIndex(oldTier);
      events.push({
        type: 'tier_change',
        year, month, day, timestep,
        description: grew
          ? `The settlement has grown from a ${oldTier} to a ${newTier} (pop. ${population}).`
          : `The settlement has shrunk from a ${oldTier} to a ${newTier} (pop. ${population}).`,
        importance: 8,
        historicalSignificance: 'settlement',
        metadata: {
          oldTier,
          newTier,
          population,
          direction: grew ? 'growth' : 'decline',
        },
      });

      // On growth, check if new districts should be added
      if (grew) {
        const districtEvents = this.checkDistrictGrowth(year, month, day, timestep, rng);
        events.push(...districtEvents);
      }
    }

    // Check population milestones (only on growth)
    if (population > oldPopulation) {
      for (const milestone of POPULATION_MILESTONES) {
        if (
          oldPopulation < milestone &&
          population >= milestone &&
          !this.state.triggeredMilestones.includes(milestone)
        ) {
          this.state.triggeredMilestones.push(milestone);
          events.push({
            type: 'population_milestone',
            year, month, day, timestep,
            description: `The settlement reaches a population of ${milestone}.`,
            importance: milestone >= 1000 ? 7 : 5,
            historicalSignificance: 'settlement',
            metadata: { milestone, population },
          });
        }
      }
    }

    return events;
  }

  /**
   * Record a population history snapshot. Call once per simulated year.
   */
  recordSnapshot(year: number): void {
    this.state.populationHistory.push({
      year,
      population: this.state.population,
      tier: this.state.tier,
      districts: this.state.districts.length,
      businesses: this.state.businesses,
      infrastructureLevel: this.state.infrastructureLevel,
    });
  }

  /**
   * Get the population growth rate over the last N years.
   * Returns a value like 0.05 for 5% annual growth.
   */
  getGrowthRate(windowYears: number = 10): number {
    const history = this.state.populationHistory;
    if (history.length < 2) return 0;

    const recent = history[history.length - 1];
    const windowStart = history.find(
      s => s.year >= recent.year - windowYears,
    ) ?? history[0];

    if (windowStart.population <= 0) return 0;

    const yearSpan = recent.year - windowStart.year;
    if (yearSpan <= 0) return 0;

    // Compound annual growth rate
    return Math.pow(recent.population / windowStart.population, 1 / yearSpan) - 1;
  }

  /**
   * Check if new districts should be added based on current tier capacity.
   */
  private checkDistrictGrowth(
    year: number,
    month: number,
    day: number,
    timestep: number,
    rng: SeededRNG,
  ): GrowthEvent[] {
    const events: GrowthEvent[] = [];
    const infra = TIER_INFRASTRUCTURE[this.state.tier];
    const currentCount = this.state.districts.length;

    if (currentCount >= infra.maxDistricts) return events;

    // Add one new district per tier change
    const existingNames = this.state.districts.map(d => d.name);
    const type = this.pickDistrictType(rng);
    const name = generateDistrictName(type, existingNames, rng);
    const districtId = `district_${currentCount + 1}`;

    const district: District = {
      id: districtId,
      name,
      type,
      foundedYear: year,
      streets: [],
    };

    this.state.districts.push(district);

    events.push({
      type: 'new_district',
      year, month, day, timestep,
      description: `A new ${type} district "${name}" is established.`,
      importance: 6,
      historicalSignificance: 'settlement',
      metadata: {
        districtId,
        districtName: name,
        districtType: type,
        totalDistricts: this.state.districts.length,
      },
    });

    return events;
  }

  /**
   * Pick a district type based on current settlement composition.
   * Favors types that are underrepresented.
   */
  private pickDistrictType(rng: SeededRNG): District['type'] {
    const typeCounts: Record<District['type'], number> = {
      residential: 0,
      commercial: 0,
      industrial: 0,
      civic: 0,
      mixed: 0,
    };

    for (const d of this.state.districts) {
      typeCounts[d.type]++;
    }

    // Weight toward underrepresented types
    // Residential should be most common, then commercial, then others
    const weights: [District['type'], number][] = [
      ['residential', 3 / (1 + typeCounts.residential)],
      ['commercial', 2 / (1 + typeCounts.commercial)],
      ['industrial', 1 / (1 + typeCounts.industrial)],
      ['civic', 1 / (1 + typeCounts.civic)],
      ['mixed', 1.5 / (1 + typeCounts.mixed)],
    ];

    const totalWeight = weights.reduce((sum, [, w]) => sum + w, 0);
    let roll = rng.random() * totalWeight;

    for (const [type, weight] of weights) {
      roll -= weight;
      if (roll <= 0) return type;
    }

    return 'residential';
  }

  /** Serialize the growth state for persistence. */
  serialize(): SettlementGrowthState {
    return { ...this.state };
  }

  /** Restore from serialized state. */
  deserialize(data: SettlementGrowthState): void {
    this.state = { ...data };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a SettlementGrowthEngine with the given configuration.
 */
export function createSettlementGrowthEngine(config: SettlementGrowthConfig): SettlementGrowthEngine {
  return new SettlementGrowthEngine(config);
}
