import { storage } from '../db/storage';
import type { Truth, PlaythroughDelta } from '@shared/schema';

/**
 * Applies playthrough deltas on top of base world truths using copy-on-write.
 * When a playthroughId is provided, reads combine base truths with deltas;
 * writes create deltas instead of modifying base data.
 */

export async function getTruthsWithOverlay(worldId: string, playthroughId: string): Promise<Truth[]> {
  const [baseTruths, deltas] = await Promise.all([
    storage.getTruthsByWorld(worldId),
    storage.getDeltasByEntityType(playthroughId, 'truth'),
  ]);

  return applyTruthDeltas(baseTruths, deltas);
}

export async function getTruthsByCharacterWithOverlay(
  characterId: string,
  playthroughId: string,
  worldId: string,
): Promise<Truth[]> {
  const allTruths = await getTruthsWithOverlay(worldId, playthroughId);
  return allTruths.filter(t => (t as any).characterId === characterId);
}

export async function getTruthWithOverlay(
  truthId: string,
  playthroughId: string,
): Promise<Truth | undefined> {
  const deltas = await storage.getDeltasByEntityType(playthroughId, 'truth');

  // Check for delete delta
  const deleteDelta = deltas.find(d => d.entityId === truthId && d.operation === 'delete');
  if (deleteDelta) return undefined;

  // Check for create delta (truth exists only in playthrough)
  const createDelta = deltas.find(d => d.entityId === truthId && d.operation === 'create');
  if (createDelta) {
    return { ...createDelta.fullData, id: createDelta.entityId } as unknown as Truth;
  }

  // Get base truth and apply update deltas
  const baseTruth = await storage.getTruth(truthId);
  if (!baseTruth) return undefined;

  const updateDeltas = deltas
    .filter(d => d.entityId === truthId && d.operation === 'update')
    .sort((a, b) => a.timestep - b.timestep);

  if (updateDeltas.length === 0) return baseTruth;

  let merged = { ...baseTruth } as any;
  for (const delta of updateDeltas) {
    if (delta.deltaData) {
      merged = { ...merged, ...delta.deltaData };
    }
  }
  return merged as Truth;
}

export async function createTruthInPlaythrough(
  playthroughId: string,
  truthData: Record<string, any>,
  timestep: number,
): Promise<Truth> {
  const entityId = generateId();

  const fullData = { ...truthData, id: entityId };

  await storage.createPlaythroughDelta({
    playthroughId,
    entityType: 'truth',
    entityId,
    operation: 'create',
    fullData,
    timestep,
    description: `Created truth: ${truthData.title || 'untitled'}`,
    tags: truthData.tags || [],
  });

  return fullData as unknown as Truth;
}

export async function updateTruthInPlaythrough(
  playthroughId: string,
  truthId: string,
  updates: Record<string, any>,
  timestep: number,
): Promise<Truth | undefined> {
  // Verify truth exists (either base or created in this playthrough)
  const existing = await getTruthWithOverlay(truthId, playthroughId);
  if (!existing) return undefined;

  await storage.createPlaythroughDelta({
    playthroughId,
    entityType: 'truth',
    entityId: truthId,
    operation: 'update',
    deltaData: updates,
    timestep,
    description: `Updated truth: ${(existing as any).title || truthId}`,
  });

  return { ...existing, ...updates } as Truth;
}

export async function deleteTruthInPlaythrough(
  playthroughId: string,
  truthId: string,
  timestep: number,
): Promise<boolean> {
  const existing = await getTruthWithOverlay(truthId, playthroughId);
  if (!existing) return false;

  await storage.createPlaythroughDelta({
    playthroughId,
    entityType: 'truth',
    entityId: truthId,
    operation: 'delete',
    timestep,
    description: `Deleted truth: ${(existing as any).title || truthId}`,
  });

  return true;
}

function applyTruthDeltas(baseTruths: Truth[], deltas: PlaythroughDelta[]): Truth[] {
  const deleteIds = new Set<string>();
  const creates: Truth[] = [];
  const updatesByEntity = new Map<string, PlaythroughDelta[]>();

  for (const delta of deltas) {
    switch (delta.operation) {
      case 'delete':
        deleteIds.add(delta.entityId);
        break;
      case 'create':
        creates.push({ ...delta.fullData, id: delta.entityId } as unknown as Truth);
        break;
      case 'update': {
        const existing = updatesByEntity.get(delta.entityId) || [];
        existing.push(delta);
        updatesByEntity.set(delta.entityId, existing);
        break;
      }
    }
  }

  const result: Truth[] = [];

  for (const truth of baseTruths) {
    if (deleteIds.has(truth.id)) continue;

    const updates = updatesByEntity.get(truth.id);
    if (updates) {
      let merged = { ...truth } as any;
      for (const delta of updates.sort((a, b) => a.timestep - b.timestep)) {
        if (delta.deltaData) {
          merged = { ...merged, ...delta.deltaData };
        }
      }
      result.push(merged as Truth);
    } else {
      result.push(truth);
    }
  }

  result.push(...creates);
  return result;
}

// ── Generic Entity Overlay ──────────────────────────────────────────────
// Extends the copy-on-write pattern to any entity type (characters, businesses, residences, etc.)

/**
 * Read entities with playthrough deltas applied.
 * Works for any entity type that has an `id` field.
 */
export async function getEntitiesWithOverlay<T extends { id: string }>(
  baseEntities: T[],
  playthroughId: string,
  entityType: string,
): Promise<T[]> {
  const deltas = await storage.getDeltasByEntityType(playthroughId, entityType);
  return applyEntityDeltas(baseEntities, deltas);
}

/**
 * Read a single entity with playthrough deltas applied.
 */
export async function getEntityWithOverlay<T extends { id: string }>(
  baseEntity: T | undefined,
  playthroughId: string,
  entityType: string,
  entityId: string,
): Promise<T | undefined> {
  const deltas = await storage.getDeltasByEntityType(playthroughId, entityType);

  const deleteDelta = deltas.find(d => d.entityId === entityId && d.operation === 'delete');
  if (deleteDelta) return undefined;

  const createDelta = deltas.find(d => d.entityId === entityId && d.operation === 'create');
  if (createDelta) {
    return { ...createDelta.fullData, id: createDelta.entityId } as unknown as T;
  }

  if (!baseEntity) return undefined;

  const updateDeltas = deltas
    .filter(d => d.entityId === entityId && d.operation === 'update')
    .sort((a, b) => a.timestep - b.timestep);

  if (updateDeltas.length === 0) return baseEntity;

  let merged = { ...baseEntity } as any;
  for (const delta of updateDeltas) {
    if (delta.deltaData) {
      merged = { ...merged, ...delta.deltaData };
    }
  }
  return merged as T;
}

/**
 * Update an entity through the overlay (creates an update delta).
 */
export async function updateEntityInPlaythrough(
  playthroughId: string,
  entityType: string,
  entityId: string,
  updates: Record<string, any>,
  timestep: number,
  description?: string,
): Promise<void> {
  await storage.createPlaythroughDelta({
    playthroughId,
    entityType,
    entityId,
    operation: 'update',
    deltaData: updates,
    timestep,
    description: description || `Updated ${entityType}: ${entityId}`,
  });
}

/**
 * Create a new entity through the overlay.
 */
export async function createEntityInPlaythrough(
  playthroughId: string,
  entityType: string,
  entityData: Record<string, any>,
  timestep: number,
  description?: string,
): Promise<{ id: string }> {
  const entityId = entityData.id || generateId();
  const fullData = { ...entityData, id: entityId };

  await storage.createPlaythroughDelta({
    playthroughId,
    entityType,
    entityId,
    operation: 'create',
    fullData,
    timestep,
    description: description || `Created ${entityType}: ${entityId}`,
  });

  return { id: entityId };
}

/**
 * Generic delta applicator — works for any entity type with an `id` field.
 */
function applyEntityDeltas<T extends { id: string }>(baseEntities: T[], deltas: PlaythroughDelta[]): T[] {
  const deleteIds = new Set<string>();
  const creates: T[] = [];
  const updatesByEntity = new Map<string, PlaythroughDelta[]>();

  for (const delta of deltas) {
    switch (delta.operation) {
      case 'delete':
        deleteIds.add(delta.entityId);
        break;
      case 'create':
        creates.push({ ...delta.fullData, id: delta.entityId } as unknown as T);
        break;
      case 'update': {
        const existing = updatesByEntity.get(delta.entityId) || [];
        existing.push(delta);
        updatesByEntity.set(delta.entityId, existing);
        break;
      }
    }
  }

  const result: T[] = [];
  for (const entity of baseEntities) {
    if (deleteIds.has(entity.id)) continue;

    const updates = updatesByEntity.get(entity.id);
    if (updates) {
      let merged = { ...entity } as any;
      for (const delta of updates.sort((a, b) => a.timestep - b.timestep)) {
        if (delta.deltaData) {
          merged = { ...merged, ...delta.deltaData };
        }
      }
      result.push(merged as T);
    } else {
      result.push(entity);
    }
  }

  result.push(...creates);
  return result;
}

/**
 * Creates a storage proxy that intercepts write operations and routes them
 * through the playthrough overlay. This is used during simulation and gameplay
 * so that TotT effect handlers (which call storage.updateCharacter() directly)
 * don't modify the base world state.
 *
 * Usage:
 *   const isolatedStorage = createPlaythroughStorageProxy(storage, playthroughId, timestep);
 *   // Pass isolatedStorage to any system that needs to write during a playthrough
 */
export function createPlaythroughStorageProxy(
  baseStorage: typeof storage,
  playthroughId: string,
  getCurrentTimestep: () => number,
): typeof storage {
  return new Proxy(baseStorage, {
    get(target, prop, receiver) {
      // Intercept character writes
      if (prop === 'updateCharacter') {
        return async (characterId: string, updates: Record<string, any>) => {
          await updateEntityInPlaythrough(
            playthroughId, 'character', characterId, updates,
            getCurrentTimestep(), `Updated character: ${characterId}`
          );
        };
      }

      // Intercept business writes
      if (prop === 'updateBusiness') {
        return async (businessId: string, updates: Record<string, any>) => {
          await updateEntityInPlaythrough(
            playthroughId, 'business', businessId, updates,
            getCurrentTimestep(), `Updated business: ${businessId}`
          );
        };
      }

      // Intercept residence writes
      if (prop === 'updateResidence') {
        return async (residenceId: string, updates: Record<string, any>) => {
          await updateEntityInPlaythrough(
            playthroughId, 'residence', residenceId, updates,
            getCurrentTimestep(), `Updated residence: ${residenceId}`
          );
        };
      }

      // Intercept new character creation (births during simulation)
      if (prop === 'createCharacter') {
        return async (data: Record<string, any>) => {
          const result = await createEntityInPlaythrough(
            playthroughId, 'character', data,
            getCurrentTimestep(), `Created character: ${data.firstName} ${data.lastName}`
          );
          // Return a minimal character-like object so callers can use the ID
          return { ...data, id: result.id };
        };
      }

      // All other methods pass through to base storage (reads are fine)
      return Reflect.get(target, prop, receiver);
    }
  });
}

function generateId(): string {
  return `pt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
