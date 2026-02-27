/**
 * Default Asset Collection Service
 * 
 * Ensures every world has an asset collection assigned.
 * Creates and manages default collections based on world type.
 */

import { storage } from '../db/storage.js';
import type { AssetCollection, World } from '@shared/schema';
import { getTemplateForWorldType, type CollectionTemplate } from './asset-collection-templates.js';
import { getGenreConfig } from '@shared/game-genres/index';

/**
 * Build config3D-compatible model maps from a CollectionTemplate.
 * This pre-populates the collection with slot keys from template assets
 * so the collection isn't completely empty when first created.
 * Note: Values are polyhavenId strings — these act as placeholder references
 * that will be resolved to actual asset IDs when Polyhaven assets are downloaded.
 */
function buildConfig3DFromTemplate(template: CollectionTemplate): {
  objectModels: Record<string, string>;
  natureModels: Record<string, string>;
} {
  const objectModels: Record<string, string> = {};
  const natureModels: Record<string, string> = {};

  for (const asset of template.assets) {
    if (asset.slotCategory === 'objectModels' || asset.slotCategory === 'questObjectModels') {
      objectModels[asset.slotKey] = asset.polyhavenId;
    } else if (asset.slotCategory === 'natureModels') {
      natureModels[asset.slotKey] = asset.polyhavenId;
    }
  }

  return { objectModels, natureModels };
}

/**
 * Resolve a world type from a game type using genre default mappings.
 * Falls back to 'generic' if no mapping exists.
 */
export function resolveWorldTypeFromGameType(gameType: string | null | undefined): string {
  if (!gameType) return 'generic';
  const genre = getGenreConfig(gameType);
  return genre?.defaultWorldType || 'generic';
}

/**
 * Get or create a default asset collection for a given world type
 */
export async function getOrCreateDefaultCollectionForWorldType(
  worldType: string | null | undefined
): Promise<AssetCollection> {
  const normalizedType = (worldType || 'generic').toLowerCase();

  // FIRST: Try to find a base collection for this world type
  const allCollections = await storage.getAllAssetCollections();
  const baseCollection = allCollections.find(
    (c: AssetCollection) =>
      c.worldType === normalizedType &&
      (c as any).isBase === true &&
      c.isPublic === true
  );

  if (baseCollection) {
    console.log(`Using base collection "${baseCollection.name}" for world type: ${normalizedType}`);
    return baseCollection;
  }

  // FALLBACK: Map world types to collection names (legacy logic)
  const collectionMapping: Record<string, string> = {
    'medieval-fantasy': 'Medieval Fantasy',
    'high-fantasy': 'Medieval Fantasy',
    'low-fantasy': 'Medieval Fantasy',
    'dark-fantasy': 'Medieval Fantasy',
    'historical-medieval': 'Medieval Fantasy',
    'mythological': 'Medieval Fantasy',

    'sci-fi-space': 'Sci-Fi City',
    'cyberpunk': 'Sci-Fi City',
    'solarpunk': 'Sci-Fi City',
    'dieselpunk': 'Sci-Fi City',

    'post-apocalyptic': 'Post-Apocalyptic',
    'steampunk': 'Steampunk',
    'western-frontier': 'Western Frontier',
    'wild-west': 'Western Frontier',
    'tropical-pirate': 'Tropical Pirate',

    'historical': 'Historical',
    'historical-ancient': 'Historical',
    'historical-renaissance': 'Historical',
    'historical-victorian': 'Historical',

    'generic': 'Generic Default',
  };

  const collectionName = collectionMapping[normalizedType] || 'Generic Default';

  console.warn(`No base collection found for ${normalizedType}, falling back to legacy collection: ${collectionName}`);

  // Try to find existing collection by name
  const existing = allCollections.find(
    (c: AssetCollection) => c.name === collectionName && c.isPublic === true
  );

  if (existing) {
    return existing;
  }

  // Create a new collection, pre-populated from templates if available
  console.log(`Creating default asset collection: ${collectionName} for world type: ${normalizedType}`);

  // Try to pre-populate from template
  const template = getTemplateForWorldType(normalizedType);
  const prePopulated = template ? buildConfig3DFromTemplate(template) : { objectModels: {}, natureModels: {} };

  const collection = await storage.createAssetCollection({
    name: collectionName,
    description: `Default asset collection for ${collectionName.toLowerCase()} worlds`,
    collectionType: 'complete_theme',
    worldType: normalizedType,
    isPublic: true,
    isBase: false,
    tags: ['default', normalizedType],
    buildingModels: {},
    natureModels: prePopulated.natureModels || {},
    characterModels: {},
    objectModels: prePopulated.objectModels || {},
  });

  if (template) {
    console.log(`Pre-populated collection "${collectionName}" with ${template.assets.length} asset slots from template "${template.name}"`);
  }

  return collection;
}

/**
 * Get the global default/fallback collection
 * This is used when no world-type-specific collection exists
 */
export async function getGlobalDefaultCollection(): Promise<AssetCollection> {
  const allCollections = await storage.getAllAssetCollections();

  // FIRST: Try to find a base collection for generic world type
  let defaultCollection = allCollections.find(
    (c: AssetCollection) =>
      c.worldType === 'generic' &&
      (c as any).isBase === true &&
      c.isPublic === true
  );

  if (defaultCollection) {
    console.log('Using generic base collection as global default');
    return defaultCollection;
  }

  // FALLBACK: Try to find a collection named "Generic Default" or "Default"
  defaultCollection = allCollections.find(
    (c: AssetCollection) =>
      c.isPublic === true &&
      (c.name === 'Generic Default' || c.name === 'Default')
  );

  if (defaultCollection) {
    return defaultCollection;
  }

  // If no default exists, create one (empty, will be populated manually)
  console.log('Creating global default asset collection');

  defaultCollection = await storage.createAssetCollection({
    name: 'Generic Default',
    description: 'Global default asset collection for all worlds',
    collectionType: 'complete_theme',
    worldType: 'generic',
    isPublic: true,
    isBase: false,
    tags: ['default', 'generic'],
    buildingModels: {},
    natureModels: {},
    characterModels: {},
    objectModels: {},
  });

  return defaultCollection;
}

/**
 * Ensure a world has an asset collection assigned
 * If none is assigned, assigns the appropriate default based on world type
 */
export async function ensureWorldHasAssetCollection(worldId: string): Promise<string> {
  const world = await storage.getWorld(worldId);
  if (!world) {
    throw new Error(`World not found: ${worldId}`);
  }
  
  // Check if world already has a collection
  const existingCollectionId = (world as any).selectedAssetCollectionId;
  if (existingCollectionId) {
    // Verify the collection still exists
    const collection = await storage.getAssetCollection(existingCollectionId);
    if (collection) {
      return existingCollectionId;
    }
    // If collection was deleted, fall through to assign a new one
    console.warn(`World ${worldId} had collection ${existingCollectionId} but it no longer exists`);
  }
  
  // Get world type from config, falling back to game type default
  const config = (world as any).config || {};
  let worldType = config.worldType;
  
  // If no explicit worldType, infer from gameType via genre defaults
  if (!worldType && config.gameType) {
    worldType = resolveWorldTypeFromGameType(config.gameType);
    console.log(`Inferred worldType "${worldType}" from gameType "${config.gameType}"`);
  }
  
  // Get or create appropriate default collection
  let collection: AssetCollection;
  try {
    collection = await getOrCreateDefaultCollectionForWorldType(worldType);
  } catch (error) {
    console.error('Failed to get world-type-specific collection, falling back to global default:', error);
    collection = await getGlobalDefaultCollection();
  }
  
  // Assign the collection to the world
  await storage.updateWorld(worldId, {
    selectedAssetCollectionId: collection.id,
  });
  
  console.log(`Assigned asset collection "${collection.name}" (${collection.id}) to world ${worldId}`);
  
  return collection.id;
}

/**
 * Assign default collections to all worlds that don't have one
 * Useful for migration or maintenance
 */
export async function assignDefaultCollectionsToAllWorlds(): Promise<{
  updated: number;
  errors: string[];
}> {
  const worlds = await storage.getWorlds();
  let updated = 0;
  const errors: string[] = [];
  
  for (const world of worlds) {
    try {
      const existingCollectionId = (world as any).selectedAssetCollectionId;
      if (!existingCollectionId) {
        await ensureWorldHasAssetCollection(world.id);
        updated++;
      }
    } catch (error) {
      const errorMsg = `Failed to assign collection to world ${world.id}: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  return { updated, errors };
}
