/**
 * Spending Sinks Service — recurring gold drains that create economic pressure.
 *
 * Characters lose gold each tick to housing, food, equipment maintenance,
 * and wealth-based taxes. This makes gold a meaningful resource that
 * players must actively manage.
 */

import { adjustGold, getGold } from './mercantile';

// ── Configuration ──────────────────────────────────────────────────────────

export interface SpendingSinkConfig {
  /** Base rent per tick. Scaled by residence quality (0-1). */
  baseRent: number;
  /** Base food cost per tick. Every character must eat. */
  baseFoodCost: number;
  /** Maintenance cost per equipped item per tick. Scaled by item value. */
  maintenanceRate: number;
  /** Progressive tax brackets: [threshold, rate] pairs (ascending). */
  taxBrackets: Array<{ threshold: number; rate: number }>;
  /** Characters below this gold amount are exempt from rent and tax. */
  povertyExemption: number;
}

const DEFAULT_CONFIG: SpendingSinkConfig = {
  baseRent: 5,
  baseFoodCost: 3,
  maintenanceRate: 0.02,
  taxBrackets: [
    { threshold: 500, rate: 0.02 },
    { threshold: 2000, rate: 0.05 },
    { threshold: 10000, rate: 0.08 },
  ],
  povertyExemption: 50,
};

// ── Sink Calculation ───────────────────────────────────────────────────────

export interface SpendingSinkBreakdown {
  housing: number;
  food: number;
  maintenance: number;
  tax: number;
  total: number;
}

export interface SpendingSinkResult {
  entityId: string;
  breakdown: SpendingSinkBreakdown;
  goldBefore: number;
  goldAfter: number;
  /** True if the character couldn't fully pay (went to 0). */
  inDebt: boolean;
}

/**
 * Calculate how much housing costs for this tick.
 * Quality ranges 0..1 (e.g., 0.3 for a shack, 1.0 for a mansion).
 */
export function calculateHousingCost(
  residenceQuality: number,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): number {
  return Math.max(0, Math.round(config.baseRent * Math.max(0.2, residenceQuality)));
}

/**
 * Calculate food cost for this tick. Flat cost — everyone eats.
 */
export function calculateFoodCost(
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): number {
  return config.baseFoodCost;
}

/**
 * Calculate equipment maintenance based on total equipped item value.
 */
export function calculateMaintenanceCost(
  equippedItemsTotalValue: number,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): number {
  return Math.max(0, Math.round(equippedItemsTotalValue * config.maintenanceRate));
}

/**
 * Calculate progressive wealth tax based on current gold.
 */
export function calculateTax(
  currentGold: number,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): number {
  if (currentGold <= config.povertyExemption) return 0;

  let tax = 0;
  const brackets = config.taxBrackets;

  for (let i = brackets.length - 1; i >= 0; i--) {
    if (currentGold > brackets[i].threshold) {
      tax = Math.round(currentGold * brackets[i].rate);
      break;
    }
  }

  return tax;
}

/**
 * Calculate the full spending sink breakdown for a character.
 */
export function calculateSpendingSinks(
  currentGold: number,
  residenceQuality: number,
  equippedItemsTotalValue: number,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): SpendingSinkBreakdown {
  const isPoor = currentGold <= config.povertyExemption;

  const housing = isPoor ? 0 : calculateHousingCost(residenceQuality, config);
  const food = calculateFoodCost(config);
  const maintenance = calculateMaintenanceCost(equippedItemsTotalValue, config);
  const tax = calculateTax(currentGold, config);

  return {
    housing,
    food,
    maintenance,
    tax,
    total: housing + food + maintenance + tax,
  };
}

// ── Processing ─────────────────────────────────────────────────────────────

export interface CharacterEconomicContext {
  entityId: string;
  worldId: string;
  residenceQuality: number;
  equippedItemsTotalValue: number;
  playthroughId?: string;
}

/**
 * Apply spending sinks for a single character, deducting gold.
 * If the character can't afford the full amount, they go to 0 gold (debt flag set).
 */
export async function applySpendingSinks(
  ctx: CharacterEconomicContext,
  timestep: number = 0,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): Promise<SpendingSinkResult> {
  const goldBefore = await getGold(ctx.worldId, ctx.entityId, ctx.playthroughId);
  const breakdown = calculateSpendingSinks(
    goldBefore,
    ctx.residenceQuality,
    ctx.equippedItemsTotalValue,
    config,
  );

  if (breakdown.total <= 0) {
    return {
      entityId: ctx.entityId,
      breakdown,
      goldBefore,
      goldAfter: goldBefore,
      inDebt: false,
    };
  }

  const deduction = Math.min(breakdown.total, goldBefore);
  const result = await adjustGold(
    ctx.worldId,
    ctx.entityId,
    -deduction,
    ctx.playthroughId,
    timestep,
  );

  const goldAfter = 'newBalance' in result ? result.newBalance : 0;

  return {
    entityId: ctx.entityId,
    breakdown,
    goldBefore,
    goldAfter,
    inDebt: goldBefore < breakdown.total,
  };
}

/**
 * Process spending sinks for multiple characters in a world.
 * Returns per-character results and aggregate totals.
 */
export async function processWorldSpendingSinks(
  worldId: string,
  characters: CharacterEconomicContext[],
  timestep: number = 0,
  config: SpendingSinkConfig = DEFAULT_CONFIG,
): Promise<{
  results: SpendingSinkResult[];
  totalDrained: number;
  charactersInDebt: number;
}> {
  const results: SpendingSinkResult[] = [];
  let totalDrained = 0;
  let charactersInDebt = 0;

  for (const ctx of characters) {
    const result = await applySpendingSinks(
      { ...ctx, worldId },
      timestep,
      config,
    );
    results.push(result);
    totalDrained += result.goldBefore - result.goldAfter;
    if (result.inDebt) charactersInDebt++;
  }

  return { results, totalDrained, charactersInDebt };
}

export { DEFAULT_CONFIG };
