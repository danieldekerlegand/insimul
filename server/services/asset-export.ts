/**
 * Asset Export Service
 *
 * Handles bulk export of visual assets with metadata and format conversion
 */

import archiver from 'archiver';
import sharp from 'sharp';
import { storage } from '../db/storage.js';
import type { VisualAsset, AssetCollection } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExportOptions {
  assetIds: string[];
  format?: 'png' | 'webp' | 'jpeg' | 'original';
  quality?: number; // 1-100 for jpeg/webp
  includeMetadata?: boolean;
  zipName?: string;
}

export interface ExportManifest {
  exportDate: string;
  totalAssets: number;
  format: string;
  assets: AssetMetadata[];
}

export interface AssetMetadata {
  id: string;
  name: string;
  description?: string | null;
  assetType: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  generationProvider?: string | null;
  generationPrompt?: string | null;
  generationParams?: Record<string, any>;
  tags?: string[];
  createdAt: Date | null;
  metadata?: Record<string, any>;
}

/**
 * Export assets as a ZIP archive with optional format conversion and metadata
 */
export async function exportAssetsAsZip(
  options: ExportOptions,
  outputStream: NodeJS.WritableStream
): Promise<void> {
  const {
    assetIds,
    format = 'original',
    quality = 90,
    includeMetadata = true,
    zipName = `asset-export-${Date.now()}`
  } = options;

  // Create ZIP archive
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  archive.pipe(outputStream);

  // Fetch asset metadata from database
  const assets = await storage.getVisualAssetsByIds(assetIds);

  if (assets.length === 0) {
    throw new Error('No assets found with the provided IDs');
  }

  const manifest: ExportManifest = {
    exportDate: new Date().toISOString(),
    totalAssets: assets.length,
    format: format,
    assets: []
  };

  // Get the public assets directory path
  const publicDir = path.resolve(__dirname, '../../client/public');

  // Process each asset
  for (const asset of assets) {
    try {
      const assetPath = path.join(publicDir, asset.filePath);

      // Check if file exists
      if (!fs.existsSync(assetPath)) {
        console.warn(`Asset file not found: ${assetPath}`);
        continue;
      }

      let fileBuffer: Buffer;
      let fileName: string;
      let mimeType: string;

      if (format === 'original') {
        // Use original file
        fileBuffer = fs.readFileSync(assetPath);
        fileName = asset.fileName;
        mimeType = asset.mimeType || 'image/png';
      } else {
        // Convert to requested format
        const conversion = await convertImageFormat(assetPath, format, quality);
        fileBuffer = conversion.buffer;
        fileName = `${path.parse(asset.fileName).name}.${format}`;
        mimeType = conversion.mimeType;
      }

      // Add file to archive
      archive.append(fileBuffer, {
        name: `assets/${fileName}`,
        date: asset.createdAt ? new Date(asset.createdAt) : undefined
      });

      // Add to manifest
      manifest.assets.push({
        id: asset.id,
        name: asset.name,
        description: asset.description,
        assetType: asset.assetType,
        fileName: fileName,
        originalFileName: asset.fileName,
        fileSize: fileBuffer.length,
        mimeType: mimeType,
        width: asset.width,
        height: asset.height,
        generationProvider: asset.generationProvider,
        generationPrompt: asset.generationPrompt,
        generationParams: asset.generationParams,
        tags: asset.tags || [],
        createdAt: asset.createdAt,
        metadata: asset.metadata
      });
    } catch (error) {
      console.error(`Error processing asset ${asset.id}:`, error);
    }
  }

  // Add manifest if requested
  if (includeMetadata) {
    const manifestJson = JSON.stringify(manifest, null, 2);
    archive.append(manifestJson, { name: 'manifest.json' });
  }

  // Finalize the archive
  await archive.finalize();
}

/**
 * Convert an image to a different format
 */
export async function convertImageFormat(
  inputPath: string,
  format: 'png' | 'webp' | 'jpeg',
  quality: number = 90
): Promise<{ buffer: Buffer; mimeType: string }> {
  let image = sharp(inputPath);

  let buffer: Buffer;
  let mimeType: string;

  switch (format) {
    case 'png':
      buffer = await image.png({ compressionLevel: 9 }).toBuffer();
      mimeType = 'image/png';
      break;
    case 'webp':
      buffer = await image.webp({ quality }).toBuffer();
      mimeType = 'image/webp';
      break;
    case 'jpeg':
      buffer = await image.jpeg({ quality }).toBuffer();
      mimeType = 'image/jpeg';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return { buffer, mimeType };
}

/**
 * Get a single asset file with optional format conversion
 */
export async function getAssetFile(
  assetId: string,
  format?: 'png' | 'webp' | 'jpeg' | 'original',
  quality: number = 90
): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null> {
  const asset = await storage.getVisualAsset(assetId);

  if (!asset) {
    return null;
  }

  const publicDir = path.resolve(__dirname, '../../client/public');
  const assetPath = path.join(publicDir, asset.filePath);

  if (!fs.existsSync(assetPath)) {
    return null;
  }

  if (!format || format === 'original') {
    const buffer = fs.readFileSync(assetPath);
    return {
      buffer,
      fileName: asset.fileName,
      mimeType: asset.mimeType || 'image/png'
    };
  }

  const conversion = await convertImageFormat(assetPath, format, quality);
  const fileName = `${path.parse(asset.fileName).name}.${format}`;

  return {
    buffer: conversion.buffer,
    fileName,
    mimeType: conversion.mimeType
  };
}

/**
 * Export an asset collection as ZIP
 */
export async function exportCollectionAsZip(
  collectionId: string,
  options: Omit<ExportOptions, 'assetIds'>,
  outputStream: NodeJS.WritableStream
): Promise<void> {
  const collection = await storage.getAssetCollection(collectionId);

  if (!collection || !collection.assetIds) {
    throw new Error('Collection not found or has no assets');
  }

  await exportAssetsAsZip(
    {
      ...options,
      assetIds: collection.assetIds,
      zipName: options.zipName || `collection-${collection.name}-${Date.now()}`
    },
    outputStream
  );
}

/**
 * Get export metadata for preview (without generating the actual export)
 */
export async function getExportPreview(assetIds: string[]): Promise<{
  totalAssets: number;
  totalSize: number;
  assetTypes: Record<string, number>;
  assets: Array<{ id: string; name: string; assetType: string; fileSize: number | null }>;
}> {
  const assets = await storage.getVisualAssetsByIds(assetIds);

  let totalSize = 0;
  const assetTypes: Record<string, number> = {};

  const assetPreview = assets.map(asset => {
    totalSize += asset.fileSize || 0;
    assetTypes[asset.assetType] = (assetTypes[asset.assetType] || 0) + 1;

    return {
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType,
      fileSize: asset.fileSize
    };
  });

  return {
    totalAssets: assets.length,
    totalSize,
    assetTypes,
    assets: assetPreview
  };
}

/**
 * Cleanup old or unused assets
 */
export async function cleanupAssets(options: {
  worldId?: string;
  olderThanDays?: number;
  status?: 'failed' | 'archived';
  dryRun?: boolean;
}): Promise<{ deletedCount: number; freedSpace: number; assets: string[] }> {
  const { worldId, olderThanDays, status, dryRun = true } = options;

  // Build filter criteria
  const cutoffDate = olderThanDays
    ? new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    : null;

  const assetsToDelete = await storage.getVisualAssetsForCleanup({
    worldId,
    status,
    olderThan: cutoffDate
  });

  let freedSpace = 0;
  const assetIds: string[] = [];

  for (const asset of assetsToDelete) {
    freedSpace += asset.fileSize || 0;
    assetIds.push(asset.id);

    if (!dryRun) {
      // Delete from filesystem
      const publicDir = path.resolve(__dirname, '../../client/public');
      const assetPath = path.join(publicDir, asset.filePath);

      if (fs.existsSync(assetPath)) {
        fs.unlinkSync(assetPath);
      }

      // Delete from database
      await storage.deleteVisualAsset(asset.id);
    }
  }

  return {
    deletedCount: assetIds.length,
    freedSpace,
    assets: assetIds
  };
}
