/**
 * Item Placement Generator
 *
 * TODO: Refactor to use a lightweight placement model instead of duplicating
 * entire item records. The new approach should:
 *   - Reference base items by ID (containerId + itemId)
 *   - Store placement locations (businessId, residenceId, lotId, position)
 *   - Not create world-specific item copies in the database
 *
 * The ContainerSpawnSystem already handles runtime item instantiation
 * correctly — this module should only persist placement references.
 */

import type { Lot } from '../../shared/schema';

// ── Exported types (kept for compatibility with callers) ─────────────────────

export interface ItemRuleSet {
  /** Item tags to match (OR logic — any tag matches) */
  tags: string[];
  /** Item types to match (OR logic) */
  itemTypes: string[];
  /** Min / max items to place */
  min: number;
  max: number;
}

// ── Placement result ─────────────────────────────────────────────────────────

export interface ItemPlacementResult {
  totalPlaced: number;
  businessItems: number;
  residenceItems: number;
  exteriorItems: number;
}

/**
 * TODO: Refactor to create lightweight placement references (containerId + itemId)
 * instead of duplicating item records. For now this is a no-op stub.
 *
 * The new implementation should:
 *   1. Load base items for the world type
 *   2. For each business/residence/lot, decide which base items belong there
 *   3. Write placement records (not item copies) referencing base item IDs
 *   4. The ContainerSpawnSystem and InteriorItemManager read these placements
 *      at runtime to instantiate items in the 3D world
 */
export async function placeItemsInWorld(
  _worldId: string,
  _worldType?: string,
): Promise<ItemPlacementResult> {
  // No-op until refactored to use placement references
  return { totalPlaced: 0, businessItems: 0, residenceItems: 0, exteriorItems: 0 };
}

// ── Exterior placement helpers (still used by other systems) ─────────────────

/**
 * Filter lots to those that are exterior (vacant — no building).
 */
export function getExteriorLots(lots: Lot[], buildings?: any[]): Lot[] {
  if (buildings) {
    const lotsWithBuildings = new Set(buildings.map((b: any) => b.lotId));
    return lots.filter(lot => !lotsWithBuildings.has(lot.id));
  }
  return lots;
}

/**
 * Generate a world-space position near a lot for an exterior item spawn.
 */
export function generateExteriorPosition(lot: Lot): { x: number; z: number } {
  const baseX = lot.positionX ?? 0;
  const baseZ = lot.positionZ ?? 0;
  const halfWidth = (lot.lotWidth ?? 12) / 2;
  const halfDepth = (lot.lotDepth ?? 16) / 2;
  const x = baseX + (Math.random() * 2 - 1) * halfWidth;
  const z = baseZ + (Math.random() * 2 - 1) * halfDepth;
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
}
