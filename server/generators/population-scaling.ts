/**
 * Population Scaling — Ensures population is proportional to building count.
 *
 * After geography generation determines the number of residences and businesses,
 * this module calculates a target population and determines how many additional
 * immigrant characters need to be generated to fill the gap.
 */

/** Multipliers for target population calculation */
export const RESIDENTS_PER_RESIDENCE = 4.5;
export const WORKERS_PER_BUSINESS = 2.5;

/** Minimum population floor multipliers */
export const MIN_RESIDENTS_PER_RESIDENCE = 2;
export const MIN_OWNER_PER_BUSINESS = 1;

export interface BuildingCounts {
  residences: number;
  businesses: number;
}

export interface PopulationTarget {
  target: number;
  minimum: number;
  deficit: number;
}

/**
 * Count residences and businesses from a list of building Location objects.
 */
export function countBuildings(buildings: Array<{ properties?: { buildingType?: string } }>): BuildingCounts {
  let residences = 0;
  let businesses = 0;
  for (const b of buildings) {
    if (b.properties?.buildingType === 'residence') {
      residences++;
    } else if (b.properties?.buildingType === 'business') {
      businesses++;
    }
  }
  return { residences, businesses };
}

/**
 * Calculate the target population based on building counts.
 *
 * Target: (num_residences * 4.5) + (num_businesses * 2.5)
 * Minimum floor: (num_residences * 2) + (num_businesses * 1)
 */
export function calculatePopulationTarget(
  counts: BuildingCounts,
  currentPopulation: number
): PopulationTarget {
  const target = Math.round(
    counts.residences * RESIDENTS_PER_RESIDENCE +
    counts.businesses * WORKERS_PER_BUSINESS
  );
  const minimum = counts.residences * MIN_RESIDENTS_PER_RESIDENCE +
    counts.businesses * MIN_OWNER_PER_BUSINESS;

  const effectiveTarget = Math.max(target, minimum);
  const deficit = Math.max(0, effectiveTarget - currentPopulation);

  return { target: effectiveTarget, minimum, deficit };
}
