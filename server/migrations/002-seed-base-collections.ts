#!/usr/bin/env tsx
/**
 * Migration script to seed base asset collections from data/base-asset-collections.json
 *
 * This script:
 * 1. Reads the base collections JSON file
 * 2. For each collection, fetches Polyhaven assets and creates VisualAsset records
 * 3. Resolves ${polyhavenId:...} placeholders in 3D config
 * 4. Creates AssetCollection records with isBase=true
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/002-seed-base-collections.ts
 */

// CRITICAL: Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });
console.log('MONGO_URL loaded:', process.env.MONGO_URL ? 'Yes' : 'No (using default)');

import { storage } from '../db/storage.js';
import { getPolyhavenModelUrl, getPolyhavenAssetFiles } from '../services/polyhaven-api.js';
import { preprocessPolyhavenAsset } from '../services/asset-downloader.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface BaseCollectionAsset {
  polyhavenId: string;
  semanticRole: string;
  assetType: string;
  priority: number;
  description?: string;
}

interface BaseCollectionDef {
  name: string;
  description: string;
  collectionType: string;
  worldType: string;
  isBase: boolean;
  isPublic: boolean;
  tags: string[];
  purpose: string;
  assets: {
    buildings?: BaseCollectionAsset[];
    nature?: BaseCollectionAsset[];
    textures?: BaseCollectionAsset[];
    objects?: BaseCollectionAsset[];
  };
  config3D: {
    buildingModels?: Record<string, string>;
    natureModels?: Record<string, string>;
    characterModels?: Record<string, string>;
    objectModels?: Record<string, string>;
    questObjectModels?: Record<string, string>;
    groundTextureId?: string;
    roadTextureId?: string;
    wallTextureId?: string;
    roofTextureId?: string;
  };
}

interface BaseCollectionsData {
  collections: Record<string, BaseCollectionDef>;
  metadata?: any;
}

/**
 * Get texture URL from Polyhaven asset
 */
async function getPolyhavenTextureUrl(assetId: string): Promise<{ url: string; resolution: string }> {
  try {
    const files = await getPolyhavenAssetFiles(assetId);

    // Try to find diffuse/albedo texture in common resolutions
    const preferredFormats = ['Diffuse-JPG', 'diff', 'albedo'];
    const preferredResolutions = ['1k', '2k', '4k'];

    for (const format of preferredFormats) {
      if (files[format]) {
        for (const res of preferredResolutions) {
          if (files[format][res]) {
            const entry = files[format][res];
            if (entry.jpg?.url) {
              return { url: entry.jpg.url, resolution: res };
            }
            if (entry.png?.url) {
              return { url: entry.png.url, resolution: res };
            }
          }
        }
      }
    }

    // Fallback: return first available URL
    for (const [format, resolutions] of Object.entries(files)) {
      if (typeof resolutions === 'object' && resolutions !== null) {
        for (const [res, data] of Object.entries(resolutions as Record<string, any>)) {
          if (data?.jpg?.url) return { url: data.jpg.url, resolution: res };
          if (data?.png?.url) return { url: data.png.url, resolution: res };
        }
      }
    }

    throw new Error(`No texture URL found for ${assetId}`);
  } catch (error) {
    console.error(`Failed to get texture URL for ${assetId}:`, error);
    throw error;
  }
}

/**
 * Main seeding function
 */
export async function seedBaseCollections() {
  console.log('🌱 Starting base collection seeding...\n');

  try {
    // Load base collections JSON
    const jsonPath = join(__dirname, '../../data/base-asset-collections.json');
    const jsonContent = await readFile(jsonPath, 'utf-8');
    const baseData: BaseCollectionsData = JSON.parse(jsonContent);

    console.log(`📖 Loaded ${Object.keys(baseData.collections).length} base collection definitions\n`);

    const createdCollections = [];
    const errors: string[] = [];

    // Global deduplication map: polyhavenId -> visualAssetId
    // This ensures each unique Polyhaven asset is only created once as a VisualAsset,
    // and shared across all collections that reference it.
    const globalAssetMap = new Map<string, string>();

    for (const [worldType, collectionDef] of Object.entries(baseData.collections)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing: ${worldType}`);
      console.log(`${'='.repeat(60)}`);

      // Check if base collection already exists
      const allCollections = await storage.getAllAssetCollections();
      const existingBase = allCollections.find(c =>
        c.worldType === worldType && c.isBase === true
      );

      if (existingBase) {
        console.log(`✅ Base collection already exists: ${existingBase.name} (${existingBase.id})`);

        // Populate globalAssetMap from existing collection's assets for deduplication
        const existingAssetIds: string[] = existingBase.assetIds as string[] || [];
        if (existingAssetIds.length > 0) {
          for (const assetId of existingAssetIds) {
            try {
              const va = await storage.getVisualAsset(assetId);
              if (va && va.metadata && (va.metadata as any).polyhavenId) {
                globalAssetMap.set((va.metadata as any).polyhavenId, va.id);
              }
            } catch { /* skip */ }
          }
        }

        // Patch missing wallTextureId / roofTextureId on existing collections
        const patchFields: Record<string, string | null> = {};

        // Build a quick polyhavenId -> assetId map from existing visual assets
        if (!existingBase.wallTextureId || !existingBase.roofTextureId) {
          console.log(`  🔧 Patching missing texture IDs on existing collection...`);

          const resolveExisting = (placeholder: string): string | null => {
            const match = placeholder.match(/\$\{polyhavenId:([^}]+)\}/);
            if (match) {
              return globalAssetMap.get(match[1]) || null;
            }
            return placeholder;
          };

          if (!existingBase.wallTextureId && collectionDef.config3D.wallTextureId) {
            const resolved = resolveExisting(collectionDef.config3D.wallTextureId);
            if (resolved) patchFields.wallTextureId = resolved;
          }
          if (!existingBase.roofTextureId && collectionDef.config3D.roofTextureId) {
            const resolved = resolveExisting(collectionDef.config3D.roofTextureId);
            if (resolved) patchFields.roofTextureId = resolved;
          }

          if (Object.keys(patchFields).length > 0) {
            await storage.updateAssetCollection(existingBase.id, patchFields as any);
            console.log(`  ✅ Patched: ${Object.keys(patchFields).join(', ')}`);
          } else {
            console.log(`  ℹ️  No texture patches needed (or assets not found)`);
          }
        }

        createdCollections.push(existingBase);
        continue;
      }

      // Create asset mapping (polyhavenId -> visualAssetId)
      const assetIdMap = new Map<string, string>();
      let successCount = 0;
      let failCount = 0;

      // Process all asset categories
      for (const [category, assets] of Object.entries(collectionDef.assets)) {
        if (!assets || !Array.isArray(assets)) continue;

        console.log(`\n📦 Processing ${category} (${assets.length} assets)...`);

        for (const assetDef of assets as BaseCollectionAsset[]) {
          try {
            // Check if this polyhavenId was already created for a previous collection
            const existingAssetId = globalAssetMap.get(assetDef.polyhavenId);
            if (existingAssetId) {
              assetIdMap.set(assetDef.polyhavenId, existingAssetId);
              successCount++;
              console.log(`  ♻️  ${assetDef.polyhavenId} -> reusing ${existingAssetId.substring(0, 8)}...`);
              continue;
            }

            let assetUrl: string;
            let resolution: string;

            // Fetch from Polyhaven based on asset type
            let companionFiles: Record<string, string> | undefined;
            if (category === 'textures' || assetDef.assetType.startsWith('texture_')) {
              const result = await getPolyhavenTextureUrl(assetDef.polyhavenId);
              assetUrl = result.url;
              resolution = result.resolution;
            } else {
              const result = await getPolyhavenModelUrl(assetDef.polyhavenId);
              assetUrl = result.url;
              resolution = result.resolution;
              companionFiles = result.companionFiles;
            }

            // Download asset locally (including companion files for models)
            const downloadResult = await preprocessPolyhavenAsset(
              assetUrl,
              assetDef.assetType,
              assetDef.polyhavenId,
              companionFiles
            );

            // Determine file extension from local path
            const extension = downloadResult.localPath.split('.').pop() || 'glb';

            // Create VisualAsset record with LOCAL path (collection-agnostic)
            const visualAsset = await storage.createVisualAsset({
              name: `${assetDef.polyhavenId} (${assetDef.semanticRole})`,
              description: assetDef.description || `Polyhaven asset - ${assetDef.semanticRole}`,
              assetType: assetDef.assetType as any,
              filePath: downloadResult.localPath, // ✅ Store local path instead of URL
              fileName: `${assetDef.polyhavenId}.${extension}`,
              generationProvider: 'polyhaven' as any,
              generationPrompt: assetDef.polyhavenId,
              purpose: 'base-collection',
              tags: ['base', category, assetDef.semanticRole],
              status: 'completed',
              metadata: {
                polyhavenId: assetDef.polyhavenId,
                polyhavenOriginalUrl: assetUrl, // Keep original URL for reference
                semanticRole: assetDef.semanticRole,
                priority: assetDef.priority,
                resolution: resolution,
                ...downloadResult.metadata
              }
            });

            globalAssetMap.set(assetDef.polyhavenId, visualAsset.id);
            assetIdMap.set(assetDef.polyhavenId, visualAsset.id);
            successCount++;
            console.log(`  ✅ ${assetDef.polyhavenId} -> ${visualAsset.id.substring(0, 8)}... (new)`);

          } catch (error: any) {
            failCount++;
            const errorMsg = `Failed to fetch ${assetDef.polyhavenId}: ${error.message}`;
            console.error(`  ❌ ${errorMsg}`);
            errors.push(`${worldType}/${category}/${assetDef.polyhavenId}: ${error.message}`);
            // Continue with other assets
          }
        }
      }

      console.log(`\n📊 Category summary: ${successCount} succeeded, ${failCount} failed`);

      if (assetIdMap.size === 0) {
        console.warn(`⚠️  No assets created for ${worldType}, skipping collection creation`);
        continue;
      }

      // Resolve placeholders in config3D
      console.log(`\n🔧 Resolving placeholders in 3D config...`);
      const config3D = JSON.parse(JSON.stringify(collectionDef.config3D));

      const resolvePlaceholder = (value: string): string | null => {
        const match = value.match(/\$\{polyhavenId:([^}]+)\}/);
        if (match) {
          const polyhavenId = match[1];
          const resolved = assetIdMap.get(polyhavenId);
          if (resolved) {
            console.log(`  ${polyhavenId} -> ${resolved.substring(0, 8)}...`);
            return resolved;
          } else {
            console.warn(`  ⚠️  Could not resolve placeholder: ${polyhavenId}`);
            return null;
          }
        }
        return value;
      };

      // Resolve all config fields
      for (const [group, models] of Object.entries(config3D)) {
        if (typeof models === 'object' && models !== null && !Array.isArray(models)) {
          // It's a Record<string, string>
          for (const [key, value] of Object.entries(models)) {
            if (typeof value === 'string') {
              (models as any)[key] = resolvePlaceholder(value);
            }
          }
        } else if (typeof models === 'string') {
          // It's a direct string reference
          (config3D as any)[group] = resolvePlaceholder(models);
        }
      }

      // Create AssetCollection
      console.log(`\n🎨 Creating asset collection...`);

      const collection = await storage.createAssetCollection({
        name: collectionDef.name,
        description: collectionDef.description,
        collectionType: collectionDef.collectionType,
        worldType: collectionDef.worldType,
        isBase: true,
        isPublic: true,
        assetIds: Array.from(assetIdMap.values()),
        buildingModels: config3D.buildingModels || {},
        natureModels: config3D.natureModels || {},
        characterModels: config3D.characterModels || {},
        objectModels: config3D.objectModels || {},
        questObjectModels: config3D.questObjectModels || {},
        groundTextureId: config3D.groundTextureId || null,
        roadTextureId: config3D.roadTextureId || null,
        wallTextureId: config3D.wallTextureId || null,
        roofTextureId: config3D.roofTextureId || null,
        tags: collectionDef.tags,
        purpose: collectionDef.purpose
      });

      console.log(`✅ Created collection: ${collection.name} (${collection.id})`);
      console.log(`   Assets: ${collection.assetIds?.length || 0}`);
      console.log(`   Building models: ${Object.keys(collection.buildingModels || {}).length}`);
      console.log(`   Nature models: ${Object.keys(collection.natureModels || {}).length}`);
      console.log(`   Object models: ${Object.keys(collection.objectModels || {}).length}`);
      console.log(`   Quest object models: ${Object.keys((collection as any).questObjectModels || {}).length}`);

      createdCollections.push(collection);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Seeding complete!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Created ${createdCollections.length} base collections`);

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors occurred:`);
      errors.forEach(err => console.log(`   - ${err}`));
      console.log(`\nNote: Collections were created with available assets despite errors.`);
    }

    return createdCollections;

  } catch (error: any) {
    console.error(`\n❌ Fatal error during seeding:`, error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBaseCollections()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
