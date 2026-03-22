import { storage } from '../db/storage.js';
import type { AssetCollection } from '@shared/schema';
import type { ProceduralBuildingConfig } from '@shared/game-engine/types';

/**
 * World3DConfig type - represents the 3D configuration for a world
 * This is now derived from AssetCollections instead of stored directly on worlds
 */
export type World3DConfig = {
  buildingModels?: Record<string, string>;
  natureModels?: Record<string, string>;
  characterModels?: Record<string, string>;
  objectModels?: Record<string, string>;
  groundTextureId?: string;
  roadTextureId?: string;
  wallTextureId?: string;
  roofTextureId?: string;
  playerModels?: Record<string, string>;
  questObjectModels?: Record<string, string>;
  audioAssets?: Record<string, string>;
  modelScaling?: Record<string, { x: number; y: number; z: number }>;
  proceduralBuildings?: ProceduralBuildingConfig | null;
};

/**
 * Get the 3D configuration for a world by resolving its asset collection
 * Ensures world has a collection assigned, auto-assigning if necessary
 */
export async function getWorld3DConfigForWorld(worldId: string): Promise<World3DConfig> {
  const world = await storage.getWorld(worldId);
  if (!world) {
    throw new Error(`World not found: ${worldId}`);
  }

  let collection: AssetCollection | null = null;
  let selectedCollectionId = (world as any).selectedAssetCollectionId;

  // If no collection is assigned, auto-assign one now
  if (!selectedCollectionId) {
    console.log(`World ${worldId} has no asset collection, auto-assigning default...`);
    const { ensureWorldHasAssetCollection } = await import('./default-asset-collection.js');
    selectedCollectionId = await ensureWorldHasAssetCollection(worldId);
  }

  // Try to get the selected collection
  if (selectedCollectionId) {
    const found = await storage.getAssetCollection(selectedCollectionId);
    collection = found || null;
  }

  // If collection was deleted or not found, assign a new default
  if (!collection) {
    console.warn(`Collection ${selectedCollectionId} not found for world ${worldId}, assigning new default...`);
    const { ensureWorldHasAssetCollection } = await import('./default-asset-collection.js');
    const newCollectionId = await ensureWorldHasAssetCollection(worldId);
    const newCollection = await storage.getAssetCollection(newCollectionId);
    collection = newCollection || null;
  }

  // If still no collection (should be impossible), return empty config
  if (!collection) {
    console.error(`Failed to assign asset collection to world ${worldId}, returning empty config`);
    return {};
  }

  // Convert collection to World3DConfig format
  return {
    buildingModels: collection.buildingModels as Record<string, string> || {},
    natureModels: collection.natureModels as Record<string, string> || {},
    characterModels: collection.characterModels as Record<string, string> || {},
    objectModels: collection.objectModels as Record<string, string> || {},
    groundTextureId: collection.groundTextureId || undefined,
    roadTextureId: collection.roadTextureId || undefined,
    wallTextureId: collection.wallTextureId || undefined,
    roofTextureId: collection.roofTextureId || undefined,
    playerModels: (collection as any).playerModels as Record<string, string> || {},
    questObjectModels: (collection as any).questObjectModels as Record<string, string> || {},
    audioAssets: (collection as any).audioAssets as Record<string, string> || {},
    modelScaling: (collection as any).modelScaling as Record<string, { x: number; y: number; z: number }> || {},
    proceduralBuildings: (collection as any).proceduralBuildings || null,
  };
}

/**
 * Get the default asset collection
 * Looks for a collection marked as default, or returns the first public collection
 */
async function getDefaultAssetCollection(): Promise<AssetCollection | null> {
  try {
    // For now, we'll need to fetch all collections and filter
    // TODO: Add a more efficient query method to storage interface
    const allCollections = await storage.getAssetCollectionsByWorld('');
    
    // Filter for public collections
    const publicCollections = allCollections.filter(
      (c: AssetCollection) => c.isPublic === true
    );
    
    if (publicCollections.length === 0) {
      return null;
    }

    // Look for a collection with name "Default" or "Generic"
    const defaultCollection = publicCollections.find(
      (c: AssetCollection) => c.name.toLowerCase() === 'default' || 
           c.name.toLowerCase() === 'generic' ||
           c.worldType === 'generic'
    );

    if (defaultCollection) {
      return defaultCollection;
    }

    // Return the first public collection as fallback
    return publicCollections[0];
  } catch (error) {
    console.error('Error getting default asset collection:', error);
    return null;
  }
}

/**
 * Update the 3D configuration for a world by updating its asset collection
 * This is a compatibility layer for the old world3DConfig approach
 */
export async function updateWorld3DConfig(
  worldId: string,
  config: Partial<World3DConfig>
): Promise<World3DConfig> {
  const world = await storage.getWorld(worldId);
  if (!world) {
    throw new Error(`World not found: ${worldId}`);
  }

  const selectedCollectionId = (world as any).selectedAssetCollectionId;
  
  if (!selectedCollectionId) {
    throw new Error(
      'Cannot update 3D config: world has no selected asset collection. ' +
      'Please select an asset collection in the World Details modal first.'
    );
  }

  const collection = await storage.getAssetCollection(selectedCollectionId);
  if (!collection) {
    throw new Error(`Asset collection not found: ${selectedCollectionId}`);
  }

  // Update the collection with the new config
  const updates: any = {};
  
  if (config.buildingModels !== undefined) {
    updates.buildingModels = config.buildingModels;
  }
  if (config.natureModels !== undefined) {
    updates.natureModels = config.natureModels;
  }
  if (config.characterModels !== undefined) {
    updates.characterModels = config.characterModels;
  }
  if (config.objectModels !== undefined) {
    updates.objectModels = config.objectModels;
  }
  if (config.groundTextureId !== undefined) {
    updates.groundTextureId = config.groundTextureId;
  }
  if (config.roadTextureId !== undefined) {
    updates.roadTextureId = config.roadTextureId;
  }
  if (config.wallTextureId !== undefined) {
    updates.wallTextureId = config.wallTextureId;
  }
  if (config.roofTextureId !== undefined) {
    updates.roofTextureId = config.roofTextureId;
  }
  if (config.playerModels !== undefined) {
    updates.playerModels = config.playerModels;
  }
  if (config.questObjectModels !== undefined) {
    updates.questObjectModels = config.questObjectModels;
  }
  if (config.audioAssets !== undefined) {
    updates.audioAssets = config.audioAssets;
  }
  if (config.modelScaling !== undefined) {
    updates.modelScaling = config.modelScaling;
  }
  if (config.proceduralBuildings !== undefined) {
    updates.proceduralBuildings = config.proceduralBuildings;
  }

  await storage.updateAssetCollection(selectedCollectionId, updates);

  // Return the updated config
  return getWorld3DConfigForWorld(worldId);
}
