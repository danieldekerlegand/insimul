/**
 * Playthrough-scoped truth merge logic.
 *
 * Base truths (playthroughId == null) represent the canonical world state.
 * Gameplay truths (playthroughId != null) are created during a playthrough.
 * Deleted truth IDs track base truths that have been consumed/removed in a playthrough.
 */

export interface TruthLike {
  id: string;
  playthroughId?: string | null;
  [key: string]: any;
}

/**
 * Merge base truths with playthrough-specific truths, excluding soft-deleted IDs.
 *
 * @param baseTruths    - Truths with no playthroughId (world-level)
 * @param gameplayTruths - Truths created during this playthrough
 * @param deletedTruthIds - IDs of base truths soft-deleted during this playthrough
 * @returns Merged array: base truths (minus deleted) + gameplay truths
 */
export function mergeTruths<T extends TruthLike>(
  baseTruths: T[],
  gameplayTruths: T[],
  deletedTruthIds: Set<string> | string[] = [],
): T[] {
  const deletedSet = deletedTruthIds instanceof Set
    ? deletedTruthIds
    : new Set(deletedTruthIds);

  const filtered = baseTruths.filter((t) => !deletedSet.has(t.id));
  return [...filtered, ...gameplayTruths];
}

/**
 * Partition a mixed truth array into base truths and gameplay truths.
 */
export function partitionTruths<T extends TruthLike>(
  truths: T[],
): { base: T[]; gameplay: T[] } {
  const base: T[] = [];
  const gameplay: T[] = [];
  for (const t of truths) {
    if (t.playthroughId) {
      gameplay.push(t);
    } else {
      base.push(t);
    }
  }
  return { base, gameplay };
}

/**
 * Check if a truth is a base (world-level) truth.
 */
export function isBaseTruth(truth: TruthLike): boolean {
  return !truth.playthroughId;
}

/**
 * Check if a truth belongs to a specific playthrough.
 */
export function isPlaythroughTruth(truth: TruthLike, playthroughId: string): boolean {
  return truth.playthroughId === playthroughId;
}
