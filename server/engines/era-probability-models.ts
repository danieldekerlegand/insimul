/**
 * Era-Appropriate Event Probability Models (US-3.02)
 *
 * Provides historically grounded probability multipliers for demographic and
 * economic events across 11 distinct eras spanning 1839 to the present.
 *
 * All base rates are expressed as probabilities per half-year timestep (the
 * lo-fi simulation's tick granularity). Multipliers are calibrated against
 * approximate US Census Bureau demographic data, CDC vital statistics, and
 * Bureau of Labor Statistics historical series.
 *
 * Every probability is tunable: call {@link createCustomConfig} to override
 * base rates or era multipliers without touching the defaults.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** All event-type probability channels available for era-based modulation. */
export interface EraProbabilities {
  /** Per-eligible-couple conception probability per half-year. */
  birthRate: number;
  /** Per-person mortality probability per half-year (before age adjustment). */
  deathRate: number;
  /** Per-eligible-single marriage probability per half-year. */
  marriageRate: number;
  /** Per-married-couple divorce probability per half-year. */
  divorceRate: number;
  /** Per-person probability of migrating into the settlement per half-year. */
  migrationInRate: number;
  /** Per-person probability of migrating out of the settlement per half-year. */
  migrationOutRate: number;
  /** Per-capita probability of a new business founding per half-year. */
  businessFoundingRate: number;
  /** Per-business probability of closure per half-year. */
  businessClosureRate: number;
  /** Per-settlement probability of new construction per half-year. */
  constructionRate: number;
  /** Per-capita probability of adopting a new technology per half-year. */
  technologyAdoptionRate: number;
  /** Per-capita probability of education-level change per half-year. */
  educationChangeRate: number;
  /** Per-settlement probability of a cultural event per half-year. */
  culturalEventRate: number;
}

/** Descriptor for a single historical era. */
export interface EraDefinition {
  /** Machine-readable identifier. */
  id: string;
  /** Human-readable era name. */
  name: string;
  /** Narrative description of the era's character. */
  description: string;
  /** First year of the era (inclusive). */
  startYear: number;
  /** Last year of the era (inclusive). */
  endYear: number;
  /** Multipliers applied to base rates during this era. */
  multipliers: EraProbabilities;
  /** Economic condition label, used by {@link adjustForEconomicConditions}. */
  economicCondition: EconomicCondition;
}

/** Economic-condition categories that modify business and migration rates. */
export type EconomicCondition =
  | 'depression'
  | 'recession'
  | 'stagnant'
  | 'stable'
  | 'growing'
  | 'boom';

/** Full configuration object — base rates + era overrides. */
export interface EraProbabilityConfig {
  /** Baseline probabilities (era multipliers scale these). */
  baseRates: EraProbabilities;
  /** Ordered list of era definitions. */
  eras: EraDefinition[];
}

// ---------------------------------------------------------------------------
// Default base rates (per half-year timestep)
// ---------------------------------------------------------------------------

/**
 * Baseline probabilities calibrated so that the *median* era (stable economy,
 * mid-20th-century medicine) produces demographically plausible results for a
 * small American town of ~500–2 000 residents.
 *
 * These are intentionally conservative; the era multipliers amplify or dampen
 * them to match historical trends.
 */
const DEFAULT_BASE_RATES: EraProbabilities = {
  birthRate:              0.075,   // ~15 % annual for eligible couples (halved for half-year tick)
  deathRate:              0.006,   // ~1.2 % annual base (age multipliers applied separately)
  marriageRate:           0.040,   // ~8 % annual for eligible singles
  divorceRate:            0.005,   // ~1 % annual for married couples (pre-modern baseline)
  migrationInRate:        0.010,   // ~2 % annual per-capita in-migration
  migrationOutRate:       0.008,   // ~1.6 % annual per-capita out-migration
  businessFoundingRate:   0.003,   // ~0.6 % annual per-capita new business
  businessClosureRate:    0.015,   // ~3 % annual per-business closure
  constructionRate:       0.020,   // ~4 % annual per-settlement new building
  technologyAdoptionRate: 0.005,   // ~1 % annual per-capita tech adoption
  educationChangeRate:    0.004,   // ~0.8 % annual per-capita education shift
  culturalEventRate:      0.030,   // ~6 % annual per-settlement cultural event
};

// ---------------------------------------------------------------------------
// Era definitions
// ---------------------------------------------------------------------------

/**
 * Eleven eras from 1839 to the present, each with historically motivated
 * multipliers.
 *
 * Multiplier rationale (selected highlights):
 *   - Birth rate peaks in pre-industrial and post-war boom (baby boom).
 *   - Death rate is highest pre-industrial and drops steadily with medicine.
 *   - Divorce rate is negligible before 1900, spikes after no-fault laws (1970s).
 *   - Business founding surges in Gilded Age and post-war boom.
 *   - Technology adoption accelerates exponentially into contemporary era.
 */
const DEFAULT_ERAS: EraDefinition[] = [
  {
    id: 'pre_industrial',
    name: 'Pre-Industrial',
    description: 'The antebellum period. Agrarian economy, limited medicine, high fertility and mortality. Westward expansion drives migration.',
    startYear: 1839,
    endYear: 1860,
    economicCondition: 'stable',
    multipliers: {
      birthRate:              1.60,  // large families, agrarian need for labor
      deathRate:              1.80,  // no antibiotics, high infant mortality
      marriageRate:           1.30,  // early marriage common
      divorceRate:            0.10,  // socially unacceptable, legally difficult
      migrationInRate:        1.40,  // westward expansion, immigrants
      migrationOutRate:       0.80,  // people settling, less leaving
      businessFoundingRate:   0.70,  // mostly agrarian, few formal businesses
      businessClosureRate:    0.90,  // businesses that exist are fairly stable
      constructionRate:       1.00,  // baseline building
      technologyAdoptionRate: 0.30,  // pre-telegraph, slow adoption
      educationChangeRate:    0.40,  // limited formal education
      culturalEventRate:      0.60,  // church socials, barn raisings
    },
  },
  {
    id: 'civil_war_reconstruction',
    name: 'Civil War / Reconstruction',
    description: 'National trauma of civil war followed by rebuilding. Elevated mortality for young men, economic disruption, and large-scale migration of freed people.',
    startYear: 1861,
    endYear: 1880,
    economicCondition: 'recession',
    multipliers: {
      birthRate:              1.20,  // suppressed by war, recovers in reconstruction
      deathRate:              2.00,  // war casualties + disease
      marriageRate:           0.90,  // disrupted by war
      divorceRate:            0.15,  // still rare
      migrationInRate:        1.20,  // refugees, freed people moving north
      migrationOutRate:       1.30,  // fleeing war zones
      businessFoundingRate:   0.60,  // economic disruption
      businessClosureRate:    1.40,  // war destroys commerce
      constructionRate:       0.80,  // rebuilding starts late in period
      technologyAdoptionRate: 0.40,  // railroad expansion despite war
      educationChangeRate:    0.50,  // Freedmen's Bureau schools
      culturalEventRate:      0.50,  // subdued
    },
  },
  {
    id: 'gilded_age',
    name: 'Gilded Age',
    description: 'Rapid industrialization, railroad expansion, and massive immigration from Europe. Growing inequality, labor unrest, and the birth of modern corporations.',
    startYear: 1881,
    endYear: 1900,
    economicCondition: 'growing',
    multipliers: {
      birthRate:              1.40,  // still high, immigrant families large
      deathRate:              1.40,  // improving but still pre-antibiotic
      marriageRate:           1.10,  // stable
      divorceRate:            0.20,  // slowly becoming possible
      migrationInRate:        1.80,  // massive immigration wave
      migrationOutRate:       0.70,  // people arriving, not leaving
      businessFoundingRate:   1.50,  // industrial boom, entrepreneurship
      businessClosureRate:    1.00,  // Panic of 1893 causes some closures
      constructionRate:       1.40,  // rapid urbanization
      technologyAdoptionRate: 0.60,  // telephone, electric light
      educationChangeRate:    0.60,  // compulsory education laws spreading
      culturalEventRate:      0.80,  // vaudeville, world fairs
    },
  },
  {
    id: 'progressive_era',
    name: 'Progressive Era',
    description: 'Reform movements, trust-busting, women\'s suffrage, and WWI. Public health improvements begin reducing mortality. Immigration continues.',
    startYear: 1901,
    endYear: 1920,
    economicCondition: 'growing',
    multipliers: {
      birthRate:              1.30,  // beginning to decline from peak
      deathRate:              1.20,  // 1918 flu spike, but overall improving
      marriageRate:           1.10,  // stable
      divorceRate:            0.30,  // slowly rising
      migrationInRate:        1.60,  // Ellis Island peak years
      migrationOutRate:       0.80,  // some return migration
      businessFoundingRate:   1.30,  // progressive reforms encourage small business
      businessClosureRate:    0.90,  // trust-busting, but economy strong
      constructionRate:       1.30,  // skyscrapers, suburbs beginning
      technologyAdoptionRate: 0.80,  // automobile, radio emerging
      educationChangeRate:    0.80,  // high school movement
      culturalEventRate:      0.90,  // ragtime, early cinema
    },
  },
  {
    id: 'roaring_twenties',
    name: 'Roaring Twenties',
    description: 'Post-WWI economic boom, jazz age, prohibition, and rapid modernization. Birth rates begin secular decline as urbanization increases.',
    startYear: 1921,
    endYear: 1930,
    economicCondition: 'boom',
    multipliers: {
      birthRate:              1.10,  // declining with urbanization
      deathRate:              1.00,  // modern medicine improving
      marriageRate:           1.20,  // prosperity encourages marriage
      divorceRate:            0.40,  // rising but still stigmatized
      migrationInRate:        1.20,  // immigration quotas (1924) slow influx
      migrationOutRate:       0.90,  // urbanization pull
      businessFoundingRate:   1.60,  // boom economy, speculation
      businessClosureRate:    0.70,  // low failure rate in boom
      constructionRate:       1.60,  // building boom
      technologyAdoptionRate: 1.00,  // radio, automobile, electricity
      educationChangeRate:    0.90,  // high school becomes normative
      culturalEventRate:      1.40,  // jazz, speakeasies, cinema
    },
  },
  {
    id: 'great_depression',
    name: 'Great Depression',
    description: 'Economic collapse, mass unemployment, Dust Bowl migration. Birth and marriage rates plummet. New Deal programs create some construction.',
    startYear: 1931,
    endYear: 1940,
    economicCondition: 'depression',
    multipliers: {
      birthRate:              0.70,  // couples delay childbearing
      deathRate:              1.10,  // malnutrition, suicide, but medicine improving
      marriageRate:           0.70,  // can\'t afford to marry
      divorceRate:            0.50,  // can\'t afford to divorce either
      migrationInRate:        0.60,  // immigration nearly stops
      migrationOutRate:       1.40,  // Dust Bowl exodus, seeking work
      businessFoundingRate:   0.40,  // no capital available
      businessClosureRate:    2.00,  // mass business failures
      constructionRate:       0.50,  // private construction collapses
      technologyAdoptionRate: 0.60,  // slowed but radio spreads
      educationChangeRate:    0.70,  // some stay in school longer (no jobs)
      culturalEventRate:      0.80,  // movies as escapism, WPA arts
    },
  },
  {
    id: 'world_war_ii',
    name: 'World War II',
    description: 'Total war mobilization. Young men overseas, women enter workforce. Wartime economy ends depression but redirects all production.',
    startYear: 1941,
    endYear: 1945,
    economicCondition: 'growing',
    multipliers: {
      birthRate:              0.80,  // men at war, but some "goodbye babies"
      deathRate:              1.50,  // combat deaths for young men
      marriageRate:           1.30,  // hasty wartime marriages
      divorceRate:            0.60,  // wartime strain, but separation prevents it
      migrationInRate:        0.50,  // immigration nearly impossible
      migrationOutRate:       1.50,  // men leaving for service
      businessFoundingRate:   0.50,  // wartime rationing, materials scarce
      businessClosureRate:    1.20,  // owners at war
      constructionRate:       0.40,  // all materials to war effort
      technologyAdoptionRate: 0.90,  // military tech spinoffs
      educationChangeRate:    0.60,  // education interrupted by service
      culturalEventRate:      0.70,  // USO shows, war bond drives
    },
  },
  {
    id: 'post_war_boom',
    name: 'Post-War Boom',
    description: 'Baby boom, suburbanization, GI Bill, interstate highways. Unprecedented prosperity and optimism. Nuclear family ideal.',
    startYear: 1946,
    endYear: 1960,
    economicCondition: 'boom',
    multipliers: {
      birthRate:              1.80,  // baby boom peak
      deathRate:              0.80,  // antibiotics, vaccines, prosperity
      marriageRate:           1.40,  // everyone getting married young
      divorceRate:            0.50,  // social pressure to stay married
      migrationInRate:        1.00,  // moderate immigration
      migrationOutRate:       1.10,  // suburbanization movement
      businessFoundingRate:   1.40,  // GI Bill loans, consumer economy
      businessClosureRate:    0.60,  // strong economy, low failure rate
      constructionRate:       2.00,  // Levittown, suburban explosion
      technologyAdoptionRate: 1.20,  // television, appliances
      educationChangeRate:    1.30,  // GI Bill, college expansion
      culturalEventRate:      1.20,  // rock and roll, drive-ins
    },
  },
  {
    id: 'civil_rights_counterculture',
    name: 'Civil Rights / Counterculture',
    description: 'Social upheaval, Vietnam War, civil rights movement, women\'s liberation, no-fault divorce laws. Birth rate drops as the Pill spreads.',
    startYear: 1961,
    endYear: 1975,
    economicCondition: 'stagnant',
    multipliers: {
      birthRate:              0.90,  // the Pill, women entering workforce
      deathRate:              0.70,  // continued medical advances
      marriageRate:           1.00,  // stable but beginning to decline
      divorceRate:            2.00,  // no-fault divorce revolution
      migrationInRate:        1.10,  // 1965 Immigration Act opens doors
      migrationOutRate:       1.00,  // stable
      businessFoundingRate:   1.00,  // mixed economy
      businessClosureRate:    1.00,  // stable
      constructionRate:       1.10,  // continued suburban growth
      technologyAdoptionRate: 1.30,  // space age, early computing
      educationChangeRate:    1.40,  // college attendance surges
      culturalEventRate:      1.60,  // protests, festivals, social movements
    },
  },
  {
    id: 'modern_era',
    name: 'Modern Era',
    description: 'Stagflation gives way to Reagan-era growth, then dot-com boom. Divorce rate stabilizes at high level. Immigration increases. Computing revolution.',
    startYear: 1976,
    endYear: 2000,
    economicCondition: 'growing',
    multipliers: {
      birthRate:              0.85,  // below replacement for some groups
      deathRate:              0.60,  // modern medicine, but AIDS epidemic
      marriageRate:           0.85,  // declining, cohabitation rises
      divorceRate:            2.50,  // peak divorce rate (late 1970s-1980s)
      migrationInRate:        1.30,  // renewed immigration wave
      migrationOutRate:       0.90,  // stable
      businessFoundingRate:   1.30,  // entrepreneurship boom, tech startups
      businessClosureRate:    1.00,  // dot-com bust at end
      constructionRate:       1.20,  // McMansions, commercial development
      technologyAdoptionRate: 1.80,  // personal computers, internet
      educationChangeRate:    1.20,  // college as expectation
      culturalEventRate:      1.30,  // MTV, blockbuster culture
    },
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: '9/11, War on Terror, Great Recession, smartphone revolution, social media. Delayed marriage and childbearing. Gig economy. Remote work.',
    startYear: 2001,
    endYear: 2100,  // effectively "present and beyond"
    economicCondition: 'stable',
    multipliers: {
      birthRate:              0.70,  // lowest in history, delayed childbearing
      deathRate:              0.50,  // best medicine ever (COVID spike temporary)
      marriageRate:           0.70,  // delayed marriage, cohabitation normative
      divorceRate:            2.00,  // stabilized from peak, still high
      migrationInRate:        1.20,  // continued immigration
      migrationOutRate:       1.00,  // stable
      businessFoundingRate:   1.20,  // gig economy, tech startups
      businessClosureRate:    1.10,  // Great Recession, retail apocalypse
      constructionRate:       1.00,  // moderate, housing crises
      technologyAdoptionRate: 2.50,  // smartphones, AI, rapid adoption
      educationChangeRate:    1.10,  // online education, student debt
      culturalEventRate:      1.50,  // social media events, streaming
    },
  },
];

// ---------------------------------------------------------------------------
// Economic condition adjustments
// ---------------------------------------------------------------------------

/** Multipliers applied on top of era multipliers based on economic condition. */
const ECONOMIC_ADJUSTMENTS: Record<EconomicCondition, Partial<EraProbabilities>> = {
  depression: {
    businessFoundingRate:  0.50,
    businessClosureRate:   1.80,
    migrationOutRate:      1.40,
    migrationInRate:       0.50,
    constructionRate:      0.40,
    birthRate:             0.80,
    marriageRate:          0.70,
  },
  recession: {
    businessFoundingRate:  0.70,
    businessClosureRate:   1.40,
    migrationOutRate:      1.20,
    migrationInRate:       0.80,
    constructionRate:      0.70,
    birthRate:             0.90,
    marriageRate:          0.85,
  },
  stagnant: {
    businessFoundingRate:  0.90,
    businessClosureRate:   1.10,
    constructionRate:      0.90,
  },
  stable: {
    // No adjustments — 1.0 across the board
  },
  growing: {
    businessFoundingRate:  1.20,
    businessClosureRate:   0.80,
    migrationInRate:       1.15,
    constructionRate:      1.20,
    birthRate:             1.05,
  },
  boom: {
    businessFoundingRate:  1.40,
    businessClosureRate:   0.60,
    migrationInRate:       1.30,
    constructionRate:      1.50,
    birthRate:             1.10,
    marriageRate:          1.15,
  },
};

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: EraProbabilityConfig = {
  baseRates: DEFAULT_BASE_RATES,
  eras: DEFAULT_ERAS,
};

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Find the era definition that covers the given year.
 *
 * Falls back to the first era for years before 1839 and the last era for
 * years beyond the final era's end.
 */
function findEra(year: number, config: EraProbabilityConfig = DEFAULT_CONFIG): EraDefinition {
  for (const era of config.eras) {
    if (year >= era.startYear && year <= era.endYear) {
      return era;
    }
  }
  // Clamp to boundary eras
  if (year < config.eras[0].startYear) {
    return config.eras[0];
  }
  return config.eras[config.eras.length - 1];
}

/**
 * Get the fully resolved probabilities for a given year.
 *
 * Computes: `baseRate × eraMultiplier` for each probability channel.
 */
export function getEraProbabilities(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): EraProbabilities {
  const era = findEra(year, config);
  const base = config.baseRates;
  const mult = era.multipliers;

  return {
    birthRate:              base.birthRate * mult.birthRate,
    deathRate:              base.deathRate * mult.deathRate,
    marriageRate:           base.marriageRate * mult.marriageRate,
    divorceRate:            base.divorceRate * mult.divorceRate,
    migrationInRate:        base.migrationInRate * mult.migrationInRate,
    migrationOutRate:       base.migrationOutRate * mult.migrationOutRate,
    businessFoundingRate:   base.businessFoundingRate * mult.businessFoundingRate,
    businessClosureRate:    base.businessClosureRate * mult.businessClosureRate,
    constructionRate:       base.constructionRate * mult.constructionRate,
    technologyAdoptionRate: base.technologyAdoptionRate * mult.technologyAdoptionRate,
    educationChangeRate:    base.educationChangeRate * mult.educationChangeRate,
    culturalEventRate:      base.culturalEventRate * mult.culturalEventRate,
  };
}

/**
 * Get the human-readable era name for a given year.
 */
export function getEraName(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): string {
  return findEra(year, config).name;
}

/**
 * Get the narrative description of the era for a given year.
 */
export function getEraDescription(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): string {
  return findEra(year, config).description;
}

/**
 * Get the era ID for a given year.
 */
export function getEraId(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): string {
  return findEra(year, config).id;
}

/**
 * Get the full era definition for a given year.
 */
export function getEra(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): EraDefinition {
  return findEra(year, config);
}

/**
 * Adjust a base probability for settlement population size.
 *
 * Small towns (< 200) get a boost to prevent extinction; large towns (> 5000)
 * get diminishing returns to prevent exponential blowout. The adjustment
 * follows a logistic-inspired curve centered at 500 residents.
 *
 * @param baseProbability - The probability to adjust (0–1 scale).
 * @param population      - Current settlement population.
 * @returns Adjusted probability, clamped to [0, 1].
 */
export function adjustForPopulation(baseProbability: number, population: number): number {
  if (population <= 0) return 0;

  // Logistic modifier centered at 500 population
  // Below 200: boost up to 1.5x to prevent extinction
  // 200-1000: near 1.0x (normal range for a small town)
  // Above 1000: diminish toward 0.7x to prevent exponential growth
  const CENTER = 500;
  const STEEPNESS = 0.005;

  // Sigmoid produces values in (0, 1); we map it to a multiplier range
  const sigmoid = 1 / (1 + Math.exp(-STEEPNESS * (population - CENTER)));

  // Map sigmoid (0→1) to multiplier (1.5→0.7)
  const multiplier = 1.5 - (sigmoid * 0.8);

  const adjusted = baseProbability * multiplier;
  return Math.max(0, Math.min(1, adjusted));
}

/**
 * Adjust a base probability based on the economic condition of the given era.
 *
 * This applies the economic-condition multipliers on top of the era
 * multipliers. Useful when you want to model specific economic shocks or
 * booms beyond what the era definition already encodes.
 *
 * @param baseProbability - The probability to adjust.
 * @param eraId           - The era identifier (e.g. 'great_depression').
 * @param channel         - Which probability channel is being adjusted.
 * @param config          - Optional custom configuration.
 * @returns Adjusted probability, clamped to [0, 1].
 */
export function adjustForEconomicConditions(
  baseProbability: number,
  eraId: string,
  channel: keyof EraProbabilities,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): number {
  const era = config.eras.find(e => e.id === eraId);
  if (!era) return baseProbability;

  const adjustments = ECONOMIC_ADJUSTMENTS[era.economicCondition];
  const multiplier = adjustments[channel] ?? 1.0;

  return Math.max(0, Math.min(1, baseProbability * multiplier));
}

/**
 * Convenience overload: adjust for economic conditions by year instead of era ID.
 */
export function adjustForEconomicConditionsByYear(
  baseProbability: number,
  year: number,
  channel: keyof EraProbabilities,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): number {
  const era = findEra(year, config);
  return adjustForEconomicConditions(baseProbability, era.id, channel, config);
}

// ---------------------------------------------------------------------------
// Configuration factory
// ---------------------------------------------------------------------------

/**
 * Create a custom probability configuration by merging overrides with defaults.
 *
 * @param overrides - Partial overrides for base rates and/or era definitions.
 * @returns A complete configuration with overrides applied.
 *
 * @example
 * ```ts
 * // Double the birth rate across all eras
 * const config = createCustomConfig({
 *   baseRates: { birthRate: 0.15 },
 * });
 *
 * // Override a specific era's multipliers
 * const config2 = createCustomConfig({
 *   eraOverrides: {
 *     great_depression: { birthRate: 0.50 },
 *   },
 * });
 * ```
 */
export function createCustomConfig(overrides: {
  baseRates?: Partial<EraProbabilities>;
  eraOverrides?: Record<string, Partial<EraProbabilities>>;
}): EraProbabilityConfig {
  const baseRates: EraProbabilities = {
    ...DEFAULT_BASE_RATES,
    ...overrides.baseRates,
  };

  const eras: EraDefinition[] = DEFAULT_ERAS.map(era => {
    const eraOverride = overrides.eraOverrides?.[era.id];
    if (!eraOverride) return { ...era };

    return {
      ...era,
      multipliers: {
        ...era.multipliers,
        ...eraOverride,
      },
    };
  });

  return { baseRates, eras };
}

// ---------------------------------------------------------------------------
// Accessors for external inspection / tooling
// ---------------------------------------------------------------------------

/** Return the list of all default era definitions (read-only). */
export function getAllEras(
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): readonly EraDefinition[] {
  return config.eras;
}

/** Return all default base rates (read-only). */
export function getBaseRates(
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): Readonly<EraProbabilities> {
  return config.baseRates;
}

/** Return the economic condition for a given year. */
export function getEconomicCondition(
  year: number,
  config: EraProbabilityConfig = DEFAULT_CONFIG,
): EconomicCondition {
  return findEra(year, config).economicCondition;
}

// ---------------------------------------------------------------------------
// Re-export types for consumer convenience
// ---------------------------------------------------------------------------
export type { EraProbabilityConfig as Config };
