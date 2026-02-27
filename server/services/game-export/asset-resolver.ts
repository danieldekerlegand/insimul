/**
 * Asset Resolver — Server-Side
 *
 * Resolves asset references for IR generation by reading from the
 * AssetCollection and applying the 3-tier fallback strategy.
 *
 * Used by the IR generator to populate asset paths in BuildingIR,
 * NatureObjectIR, CharacterIR, etc.
 */

import { storage } from '../../db/storage';
import type { AssetReferenceIR } from '@shared/game-engine/ir-types';
import {
  type TargetEngine,
  type AssetCollectionSnapshot,
  type AssetManifest,
  type ResolvedAsset,
  buildAssetManifest,
  resolveAsset,
  resolveNamedTexture,
} from '@shared/game-engine/asset-pipeline';

/**
 * Load an AssetCollection from the database and normalise it
 * into the snapshot shape used by the resolver.
 */
export async function loadCollectionSnapshot(
  collectionId: string
): Promise<AssetCollectionSnapshot | null> {
  const collection = await storage.getAssetCollection(collectionId);
  if (!collection) return null;

  return {
    id: collection.id,
    buildingModels: (collection.buildingModels as Record<string, string>) || {},
    natureModels: (collection.natureModels as Record<string, string>) || {},
    characterModels: (collection.characterModels as Record<string, string>) || {},
    objectModels: (collection.objectModels as Record<string, string>) || {},
    playerModels: (collection.playerModels as Record<string, string>) || {},
    questObjectModels: (collection.questObjectModels as Record<string, string>) || {},
    groundTextureId: collection.groundTextureId || null,
    roadTextureId: collection.roadTextureId || null,
    wallTextureId: collection.wallTextureId || null,
    roofTextureId: collection.roofTextureId || null,
    audioAssets: (collection.audioAssets as Record<string, string>) || {},
    unrealAssets: (collection as any).unrealAssets || {},
    unityAssets: (collection as any).unityAssets || {},
    godotAssets: (collection as any).godotAssets || {},
  };
}

/**
 * Resolve a building's model asset for the target engine.
 * Returns the asset key/path or null if procedural generation should be used.
 */
export function resolveBuildingModel(
  engine: TargetEngine,
  snapshot: AssetCollectionSnapshot | null,
  buildingRole: string
): string | null {
  const resolved = resolveAsset(engine, snapshot, 'building_model', buildingRole);
  return resolved.source !== 'procedural' ? resolved.path : null;
}

/**
 * Resolve a nature object's model asset.
 */
export function resolveNatureModel(
  engine: TargetEngine,
  snapshot: AssetCollectionSnapshot | null,
  natureRole: string
): string | null {
  const resolved = resolveAsset(engine, snapshot, 'nature_model', natureRole);
  return resolved.source !== 'procedural' ? resolved.path : null;
}

/**
 * Resolve the player character model.
 */
export function resolvePlayerModel(
  engine: TargetEngine,
  snapshot: AssetCollectionSnapshot | null,
  playerRole: string = 'default'
): string | null {
  const resolved = resolveAsset(engine, snapshot, 'player_model', playerRole);
  return resolved.source !== 'procedural' ? resolved.path : null;
}

/**
 * Resolve a character/NPC model.
 */
export function resolveCharacterModel(
  engine: TargetEngine,
  snapshot: AssetCollectionSnapshot | null,
  characterRole: string
): string | null {
  const resolved = resolveAsset(engine, snapshot, 'character_model', characterRole);
  return resolved.source !== 'procedural' ? resolved.path : null;
}

/**
 * Convert a ResolvedAsset into the IR's AssetReferenceIR format.
 */
export function toAssetReferenceIR(
  resolved: ResolvedAsset,
  id: string
): AssetReferenceIR {
  return {
    id,
    role: resolved.role,
    babylonPath: resolved.babylonPath || '',
    unrealPath: undefined,
    unityPath: undefined,
    godotPath: undefined,
    assetType: categoryToAssetType(resolved.category),
    tags: [resolved.category, resolved.role],
  };
}

function categoryToAssetType(category: string): string {
  if (category.includes('model') || category.includes('prefab') || category.includes('scene')) {
    return 'model';
  }
  if (category.includes('texture')) return 'texture';
  if (category.includes('material')) return 'material';
  if (category.includes('audio')) return 'audio';
  return 'unknown';
}

/**
 * Build a full asset manifest for a world export.
 *
 * @param worldId      The world being exported
 * @param engine       Target engine
 * @returns            The resolved asset manifest + collection snapshot
 */
export async function buildWorldAssetManifest(
  worldId: string,
  engine: TargetEngine
): Promise<{ manifest: AssetManifest; snapshot: AssetCollectionSnapshot | null }> {
  const world = await storage.getWorld(worldId);
  if (!world) {
    throw new Error(`World ${worldId} not found`);
  }

  let snapshot: AssetCollectionSnapshot | null = null;
  if (world.selectedAssetCollectionId) {
    snapshot = await loadCollectionSnapshot(world.selectedAssetCollectionId);
  }

  const manifest = buildAssetManifest(engine, snapshot);
  return { manifest, snapshot };
}
