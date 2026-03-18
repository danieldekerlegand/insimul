/**
 * Relationship Utilities for Insimul
 * Enhances the existing relationship system with directional support.
 * Supports playthrough-scoped overlays: when a playthroughId is provided,
 * reads/writes go to the overlay; otherwise they hit the base world data.
 */

import { storage } from '../../db/storage';
import type { Character, PlaythroughRelationship } from '@shared/schema';

export interface DirectionalRelationship {
  type: string; // romantic, friendship, rivalry, etc.
  strength: number; // -1.0 to 1.0
  reciprocal?: number; // Strength in opposite direction
  lastModified: number;
}

/**
 * Get the effective relationship between two characters.
 * If playthroughId is provided, checks the overlay first, then falls back to base world.
 */
export async function getEffectiveRelationship(
  fromCharacterId: string,
  toCharacterId: string,
  playthroughId?: string
): Promise<DirectionalRelationship | null> {
  // Check playthrough overlay first
  if (playthroughId) {
    const overlay = await storage.getPlaythroughRelationship(playthroughId, fromCharacterId, toCharacterId);
    if (overlay) {
      return {
        type: overlay.type,
        strength: overlay.strength,
        reciprocal: overlay.reciprocal ?? undefined,
        lastModified: overlay.lastModified
      };
    }
  }

  // Fall back to base world relationship
  const character = await storage.getCharacter(fromCharacterId);
  if (!character?.relationships?.[toCharacterId]) return null;
  return character.relationships[toCharacterId];
}

/**
 * Set a directional relationship.
 * If playthroughId is provided, writes to the overlay instead of mutating the base world.
 */
export async function setRelationship(
  fromCharacterId: string,
  toCharacterId: string,
  type: string,
  strength: number,
  reciprocal?: number,
  playthroughId?: string
): Promise<void> {
  const clampedStrength = Math.max(-1, Math.min(1, strength));
  const clampedReciprocal = reciprocal !== undefined ? Math.max(-1, Math.min(1, reciprocal)) : undefined;

  if (playthroughId) {
    // Write to playthrough overlay
    await storage.upsertPlaythroughRelationship({
      playthroughId,
      fromCharacterId,
      toCharacterId,
      type,
      strength: clampedStrength,
      reciprocal: clampedReciprocal,
      lastModified: Date.now()
    });

    if (clampedReciprocal !== undefined) {
      await storage.upsertPlaythroughRelationship({
        playthroughId,
        fromCharacterId: toCharacterId,
        toCharacterId: fromCharacterId,
        type,
        strength: clampedReciprocal,
        reciprocal: clampedStrength,
        lastModified: Date.now()
      });
    }
    return;
  }

  // Base world mutation (original behavior)
  const fromChar = await storage.getCharacter(fromCharacterId);
  if (!fromChar) return;

  const relationships = fromChar.relationships || {};
  relationships[toCharacterId] = {
    type,
    strength: clampedStrength,
    reciprocal: clampedReciprocal,
    lastModified: Date.now()
  };
  await storage.updateCharacter(fromCharacterId, { relationships });

  if (clampedReciprocal !== undefined) {
    const toChar = await storage.getCharacter(toCharacterId);
    if (toChar) {
      const toRelationships = toChar.relationships || {};
      toRelationships[fromCharacterId] = {
        type,
        strength: clampedReciprocal,
        reciprocal: clampedStrength,
        lastModified: Date.now()
      };
      await storage.updateCharacter(toCharacterId, { relationships: toRelationships });
    }
  }
}

/**
 * Get relationship strength between characters.
 * If playthroughId is provided, checks overlay first.
 */
export async function getRelationshipStrength(
  fromCharacterId: string,
  toCharacterId: string,
  playthroughId?: string
): Promise<number> {
  const rel = await getEffectiveRelationship(fromCharacterId, toCharacterId, playthroughId);
  return rel?.strength || 0;
}

/**
 * Check directional relationship condition for rules.
 * Supports >Self (forward), <Other (backward), <>Both (mutual).
 */
export async function checkDirectionalRelationship(
  selfId: string,
  otherId: string,
  operator: string,
  type?: string,
  minStrength?: number,
  playthroughId?: string
): Promise<boolean> {
  switch (operator) {
    case '>':
    case '>Self': {
      const forward = await getRelationshipStrength(selfId, otherId, playthroughId);
      if (minStrength !== undefined && forward < minStrength) return false;
      if (type) {
        const rel = await getEffectiveRelationship(selfId, otherId, playthroughId);
        if (rel?.type !== type) return false;
      }
      return true;
    }

    case '<':
    case '<Other': {
      const backward = await getRelationshipStrength(otherId, selfId, playthroughId);
      if (minStrength !== undefined && backward < minStrength) return false;
      if (type) {
        const rel = await getEffectiveRelationship(otherId, selfId, playthroughId);
        if (rel?.type !== type) return false;
      }
      return true;
    }

    case '<>':
    case '<>Both': {
      const rel1 = await getRelationshipStrength(selfId, otherId, playthroughId);
      const rel2 = await getRelationshipStrength(otherId, selfId, playthroughId);
      if (minStrength !== undefined && (rel1 < minStrength || rel2 < minStrength)) return false;
      if (Math.abs(rel1 - rel2) > 0.3) return false;
      if (type) {
        const r1 = await getEffectiveRelationship(selfId, otherId, playthroughId);
        const r2 = await getEffectiveRelationship(otherId, selfId, playthroughId);
        if (r1?.type !== type) return false;
        if (r2?.type !== type) return false;
      }
      return true;
    }

    default:
      return false;
  }
}

/**
 * Modify relationship strength.
 * If playthroughId is provided, reads effective state and writes to overlay.
 */
export async function modifyRelationship(
  fromCharacterId: string,
  toCharacterId: string,
  change: number,
  cause?: string,
  playthroughId?: string
): Promise<void> {
  const currentRel = await getEffectiveRelationship(fromCharacterId, toCharacterId, playthroughId);
  const current: DirectionalRelationship = currentRel || {
    type: 'acquaintance',
    strength: 0,
    lastModified: Date.now()
  };

  const newStrength = Math.max(-1, Math.min(1, current.strength + change));

  if (playthroughId) {
    await storage.upsertPlaythroughRelationship({
      playthroughId,
      fromCharacterId,
      toCharacterId,
      type: current.type,
      strength: newStrength,
      lastModified: Date.now(),
      metadata: cause ? { cause } : undefined
    });
    return;
  }

  // Base world mutation (original behavior)
  const character = await storage.getCharacter(fromCharacterId);
  if (!character) return;

  const relationships = character.relationships || {};
  relationships[toCharacterId] = {
    ...current,
    strength: newStrength,
    lastModified: Date.now()
  };

  const thoughts = character.thoughts || [];
  thoughts.push({
    timestamp: Date.now(),
    content: `Relationship with ${toCharacterId} changed by ${change} (${cause || 'unknown'})`
  });

  await storage.updateCharacter(fromCharacterId, {
    relationships,
    thoughts: thoughts.slice(-100)
  });
}

/**
 * Get all relationships for a character.
 * If playthroughId is provided, merges overlay on top of base world relationships.
 */
export async function getCharacterRelationships(
  characterId: string,
  playthroughId?: string
): Promise<Record<string, DirectionalRelationship>> {
  const character = await storage.getCharacter(characterId);
  const base: Record<string, DirectionalRelationship> = character?.relationships || {};

  if (!playthroughId) return base;

  // Merge overlay on top of base
  const overlays = await storage.getPlaythroughRelationshipsForCharacter(playthroughId, characterId);
  const merged = { ...base };
  for (const overlay of overlays) {
    if (overlay.fromCharacterId === characterId) {
      merged[overlay.toCharacterId] = {
        type: overlay.type,
        strength: overlay.strength,
        reciprocal: overlay.reciprocal ?? undefined,
        lastModified: overlay.lastModified
      };
    }
  }
  return merged;
}

/**
 * Query relationships across world.
 * If playthroughId is provided, merges overlays on top of base relationships.
 */
export async function queryRelationships(
  worldId: string,
  filter?: {
    type?: string;
    minStrength?: number;
    maxStrength?: number;
  },
  playthroughId?: string
): Promise<Array<{ from: string; to: string; relationship: DirectionalRelationship }>> {
  const characters = await storage.getCharactersByWorld(worldId);

  // Build overlay lookup if playthrough-scoped
  const overlayMap = new Map<string, PlaythroughRelationship>();
  if (playthroughId) {
    const overlays = await storage.getPlaythroughRelationshipsByPlaythrough(playthroughId);
    for (const o of overlays) {
      overlayMap.set(`${o.fromCharacterId}:${o.toCharacterId}`, o);
    }
  }

  const results: Array<{ from: string; to: string; relationship: DirectionalRelationship }> = [];
  const seen = new Set<string>();

  for (const character of characters) {
    if (character.relationships) {
      for (const [targetId, baseRel] of Object.entries(character.relationships)) {
        const key = `${character.id}:${targetId}`;
        seen.add(key);

        // Use overlay if available
        const overlay = overlayMap.get(key);
        const rel: DirectionalRelationship = overlay
          ? { type: overlay.type, strength: overlay.strength, reciprocal: overlay.reciprocal ?? undefined, lastModified: overlay.lastModified }
          : baseRel;

        if (filter) {
          if (filter.type && rel.type !== filter.type) continue;
          if (filter.minStrength !== undefined && rel.strength < filter.minStrength) continue;
          if (filter.maxStrength !== undefined && rel.strength > filter.maxStrength) continue;
        }
        results.push({ from: character.id, to: targetId, relationship: rel });
      }
    }
  }

  // Add overlay-only relationships (new relationships created during playthrough)
  for (const [key, overlay] of overlayMap) {
    if (seen.has(key)) continue;
    const rel: DirectionalRelationship = {
      type: overlay.type,
      strength: overlay.strength,
      reciprocal: overlay.reciprocal ?? undefined,
      lastModified: overlay.lastModified
    };
    if (filter) {
      if (filter.type && rel.type !== filter.type) continue;
      if (filter.minStrength !== undefined && rel.strength < filter.minStrength) continue;
      if (filter.maxStrength !== undefined && rel.strength > filter.maxStrength) continue;
    }
    results.push({ from: overlay.fromCharacterId, to: overlay.toCharacterId, relationship: rel });
  }

  return results;
}
