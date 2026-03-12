/**
 * World-Type-Aware Probability Defaults
 *
 * Defines per-world-type rate tables for demographic and economic events.
 * These rates are used by the simulation engine when no custom rates are provided.
 *
 * Rates are expressed as probabilities per simulation timestep (one day).
 */

export interface WorldTypeRates {
  /** Label for the world type */
  label: string;

  // Demographic rates (per eligible character per timestep)
  birthRate: number;            // probability of conception for eligible couples
  deathRateMultiplier: number;  // multiplier applied to base age-dependent death probability
  marriageRate: number;         // probability an eligible couple gets engaged per timestep
  divorceRate: number;          // probability a married couple divorces per timestep
  immigrationRate: number;      // probability a new character immigrates per timestep (per settlement)

  // Economic rates (per settlement per timestep)
  businessFoundingRate: number; // probability a new business is founded per timestep
  businessClosureRate: number;  // probability an existing business closes per timestep

  // Knowledge / social decay
  knowledgeDecayRate: number;       // how fast beliefs lose confidence (0-1 per timestep)
  mentalModelDecayRate: number;     // how fast mental models deteriorate without contact
  salienceDecayRate: number;        // how fast salience fades without interaction
}

const WORLD_TYPE_DEFAULTS: Record<string, WorldTypeRates> = {
  'medieval-fantasy': {
    label: 'Medieval Fantasy',
    birthRate: 0.18,
    deathRateMultiplier: 1.4,
    marriageRate: 0.008,
    divorceRate: 0.0005,
    immigrationRate: 0.002,
    businessFoundingRate: 0.003,
    businessClosureRate: 0.002,
    knowledgeDecayRate: 0.02,
    mentalModelDecayRate: 0.015,
    salienceDecayRate: 0.01,
  },

  'modern-realistic': {
    label: 'Modern Realistic',
    birthRate: 0.10,
    deathRateMultiplier: 0.7,
    marriageRate: 0.005,
    divorceRate: 0.003,
    immigrationRate: 0.008,
    businessFoundingRate: 0.006,
    businessClosureRate: 0.004,
    knowledgeDecayRate: 0.005,
    mentalModelDecayRate: 0.008,
    salienceDecayRate: 0.006,
  },

  'sci-fi': {
    label: 'Science Fiction',
    birthRate: 0.06,
    deathRateMultiplier: 0.4,
    marriageRate: 0.004,
    divorceRate: 0.004,
    immigrationRate: 0.012,
    businessFoundingRate: 0.008,
    businessClosureRate: 0.005,
    knowledgeDecayRate: 0.002,
    mentalModelDecayRate: 0.004,
    salienceDecayRate: 0.003,
  },

  'historical': {
    label: 'Historical',
    birthRate: 0.20,
    deathRateMultiplier: 1.6,
    marriageRate: 0.010,
    divorceRate: 0.0002,
    immigrationRate: 0.003,
    businessFoundingRate: 0.002,
    businessClosureRate: 0.003,
    knowledgeDecayRate: 0.025,
    mentalModelDecayRate: 0.020,
    salienceDecayRate: 0.012,
  },
};

/** Fallback rates used when the world type is unknown or unset */
const DEFAULT_RATES: WorldTypeRates = {
  label: 'Default',
  birthRate: 0.15,
  deathRateMultiplier: 1.0,
  marriageRate: 0.006,
  divorceRate: 0.002,
  immigrationRate: 0.005,
  businessFoundingRate: 0.005,
  businessClosureRate: 0.003,
  knowledgeDecayRate: 0.01,
  mentalModelDecayRate: 0.01,
  salienceDecayRate: 0.008,
};

/**
 * Get the probability rate table for a given world type.
 *
 * @param worldType - The world type string (e.g. "medieval-fantasy", "sci-fi").
 *                    Falls back to sensible defaults if the type is unknown.
 * @returns The rate table for the world type.
 */
export function getWorldTypeDefaults(worldType: string | null | undefined): WorldTypeRates {
  if (!worldType) return { ...DEFAULT_RATES };

  const normalized = worldType.toLowerCase().trim();

  // Direct match
  if (WORLD_TYPE_DEFAULTS[normalized]) {
    return { ...WORLD_TYPE_DEFAULTS[normalized] };
  }

  // Fuzzy match: check if the world type contains a known key
  for (const [key, rates] of Object.entries(WORLD_TYPE_DEFAULTS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...rates };
    }
  }

  // Additional aliases
  if (normalized.includes('fantasy') || normalized.includes('medieval')) {
    return { ...WORLD_TYPE_DEFAULTS['medieval-fantasy'] };
  }
  if (normalized.includes('modern') || normalized.includes('contemporary') || normalized.includes('realistic')) {
    return { ...WORLD_TYPE_DEFAULTS['modern-realistic'] };
  }
  if (normalized.includes('sci-fi') || normalized.includes('scifi') || normalized.includes('space') || normalized.includes('cyberpunk')) {
    return { ...WORLD_TYPE_DEFAULTS['sci-fi'] };
  }
  if (normalized.includes('histor') || normalized.includes('ancient') || normalized.includes('colonial')) {
    return { ...WORLD_TYPE_DEFAULTS['historical'] };
  }

  return { ...DEFAULT_RATES };
}

/**
 * List all registered world type keys.
 */
export function getRegisteredWorldTypes(): string[] {
  return Object.keys(WORLD_TYPE_DEFAULTS);
}
