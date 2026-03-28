/**
 * Shared street pattern selection logic.
 *
 * Used by both the server-side street generation (street-network-generator.ts)
 * and the client-side SVG preview (SettlementDialog.tsx) to ensure pattern
 * selection is consistent across the application.
 *
 * If pattern selection rules change, update ONLY this file — both server
 * and client will pick up the change automatically.
 *
 * Related files that must stay in sync:
 *   - server/generators/street-network-generator.ts (selectStreetPattern)
 *   - server/generators/street-generator.ts (StreetGenerator.selectStreetPattern)
 *   - client/src/components/dialogs/SettlementDialog.tsx (selectPattern)
 */

export type LayoutPattern = 'grid' | 'linear' | 'waterfront' | 'hillside' | 'organic' | 'radial';

export interface PatternSelectionInput {
  terrain: string;
  settlementType: string;
  foundedYear: number;
  population?: number;
}

/**
 * Select the street layout pattern for a settlement based on terrain,
 * settlement type, founding era, and population.
 *
 * Rules (in priority order):
 *   coast         → waterfront (curved streets along shoreline)
 *   river         → linear     (buildings along a central main road)
 *   mountains     → hillside   (terraced rows stepping up the slope)
 *   city ≥10k pop → grid       (square blocks)
 *   city <10k pop → radial     (streets radiating from central plaza)
 *   village       → organic    (winding medieval streets)
 *   pre-1800      → organic
 *   default       → grid
 */
export function selectStreetPattern(input: PatternSelectionInput): LayoutPattern {
  const { terrain, settlementType, population, foundedYear } = input;

  if (terrain === 'coast') return 'waterfront';
  if (terrain === 'river') return 'linear';
  if (terrain === 'mountains') return 'hillside';
  if (settlementType === 'city' && (population ?? 0) >= 10000) return 'grid';
  if (settlementType === 'city') return 'radial';
  if (settlementType === 'village') return 'organic';
  if (foundedYear < 1800) return 'organic';
  return 'grid';
}

/** Grid dimensions by settlement type (matches street-network-generator.ts GRID_SIZE) */
export const GRID_SIZE: Record<string, number> = {
  hamlet: 3,
  village: 4,
  town: 6,
  city: 8,
};

/** Lots per grid block (3 columns × 2 rows) */
export const LOTS_PER_BLOCK = 6;

/**
 * Compute expected lot count for a grid pattern.
 * (gridSize-1)^2 blocks, minus 1 park block, × lots-per-block
 */
export function getGridLotCount(settlementType: string): number {
  const g = GRID_SIZE[settlementType] ?? 6;
  const blocks = (g - 1) * (g - 1);
  return (blocks - 1) * LOTS_PER_BLOCK;
}
