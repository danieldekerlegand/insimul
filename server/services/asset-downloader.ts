/**
 * Asset Downloader Service
 *
 * Downloads and caches external assets (primarily from Polyhaven) to local storage.
 * Ensures assets are served from the local server instead of external URLs.
 */

import https from 'https';
import http from 'http';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Download a file from a URL to a local path
 */
export async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`  Redirecting to: ${redirectUrl}`);
          return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const file = createWriteStream(destPath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(destPath).catch(() => {}); // Clean up on error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destPath).catch(() => {}); // Clean up on error
      reject(err);
    });
  });
}

/**
 * Download and preprocess a Polyhaven asset
 *
 * @param polyhavenUrl - The Polyhaven download URL
 * @param assetType - The asset type (model_building, texture_ground, etc.)
 * @param assetId - The Polyhaven asset ID
 * @returns Object containing local path and metadata
 */
export async function preprocessPolyhavenAsset(
  polyhavenUrl: string,
  assetType: string,
  assetId: string
): Promise<{ localPath: string; absolutePath: string; metadata: any }> {
  // Determine category and file extension
  const isTexture = assetType.startsWith('texture_');
  const category = isTexture ? 'textures' : 'models';

  // Extract extension from URL
  const urlObj = new URL(polyhavenUrl);
  const urlPath = urlObj.pathname;
  const extension = path.extname(urlPath) || (isTexture ? '.jpg' : '.glb');

  // Generate filename
  const fileName = `${assetId}${extension}`;

  // Determine local directory (relative to project root)
  const projectRoot = path.join(__dirname, '../..');
  const localDir = path.join(projectRoot, 'client/public/assets/polyhaven', category);

  // Ensure directory exists
  await fs.mkdir(localDir, { recursive: true });

  // Full local path
  const absolutePath = path.join(localDir, fileName);

  // Relative path for storing in database (served by Express static)
  const relativePath = `assets/polyhaven/${category}/${fileName}`;

  // Check if file already exists
  try {
    await fs.access(absolutePath);
    console.log(`  Asset already exists locally: ${relativePath}`);

    // Get file stats
    const stats = await fs.stat(absolutePath);

    return {
      localPath: relativePath,
      absolutePath,
      metadata: {
        originalUrl: polyhavenUrl,
        fileSize: stats.size,
        cached: true,
        cachedAt: stats.mtime.toISOString()
      }
    };
  } catch {
    // File doesn't exist, download it
  }

  // Download the file
  console.log(`  Downloading ${category}: ${polyhavenUrl}`);
  console.log(`  → ${relativePath}`);

  try {
    await downloadFile(polyhavenUrl, absolutePath);

    // Get file stats
    const stats = await fs.stat(absolutePath);

    console.log(`  ✅ Downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    return {
      localPath: relativePath,
      absolutePath,
      metadata: {
        originalUrl: polyhavenUrl,
        fileSize: stats.size,
        cached: false,
        downloadedAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error(`  ❌ Download failed: ${error.message}`);
    throw error;
  }
}

/**
 * Download and preprocess a Freesound audio asset
 *
 * @param freesoundUrl - The Freesound preview URL
 * @param assetType - The asset type (audio_footstep, audio_ambient, etc.)
 * @param soundId - The Freesound sound ID
 * @param soundName - The sound name for the filename
 * @returns Object containing local path and metadata
 */
export async function preprocessFreesoundAsset(
  freesoundUrl: string,
  assetType: string,
  soundId: string | number,
  soundName?: string
): Promise<{ localPath: string; absolutePath: string; metadata: any }> {
  // Determine category based on asset type
  const category = assetType.replace('audio_', '') || 'general';

  // Extract extension from URL
  const urlObj = new URL(freesoundUrl);
  const urlPath = urlObj.pathname;
  let extension = path.extname(urlPath);
  
  // Default to .mp3 if no extension found
  if (!extension || extension === '') {
    extension = '.mp3';
  }

  // Generate filename (sanitize sound name)
  const safeName = soundName 
    ? soundName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50)
    : `sound_${soundId}`;
  const fileName = `${soundId}_${safeName}${extension}`;

  // Determine local directory (relative to project root)
  const projectRoot = path.join(__dirname, '../..');
  const localDir = path.join(projectRoot, 'client/public/assets/freesound', category);

  // Ensure directory exists
  await fs.mkdir(localDir, { recursive: true });

  // Full local path
  const absolutePath = path.join(localDir, fileName);

  // Relative path for storing in database (served by Express static)
  const relativePath = `assets/freesound/${category}/${fileName}`;

  // Check if file already exists
  try {
    await fs.access(absolutePath);
    console.log(`  Audio asset already exists locally: ${relativePath}`);

    // Get file stats
    const stats = await fs.stat(absolutePath);

    return {
      localPath: relativePath,
      absolutePath,
      metadata: {
        originalUrl: freesoundUrl,
        freesoundId: soundId,
        fileSize: stats.size,
        cached: true,
        cachedAt: stats.mtime.toISOString()
      }
    };
  } catch {
    // File doesn't exist, download it
  }

  // Download the file
  console.log(`  Downloading audio (${category}): ${freesoundUrl}`);
  console.log(`  → ${relativePath}`);

  try {
    await downloadFile(freesoundUrl, absolutePath);

    // Get file stats
    const stats = await fs.stat(absolutePath);

    console.log(`  ✅ Downloaded audio (${(stats.size / 1024).toFixed(2)} KB)`);

    return {
      localPath: relativePath,
      absolutePath,
      metadata: {
        originalUrl: freesoundUrl,
        freesoundId: soundId,
        fileSize: stats.size,
        cached: false,
        downloadedAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error(`  ❌ Audio download failed: ${error.message}`);
    throw error;
  }
}

/**
 * Download multiple assets with retry logic
 */
export async function downloadAssetsWithRetry(
  assets: Array<{ url: string; assetType: string; assetId: string }>,
  maxRetries: number = 3
): Promise<Array<{ success: boolean; assetId: string; localPath?: string; error?: string }>> {
  const results = [];

  for (const asset of assets) {
    let lastError: Error | null = null;
    let success = false;
    let localPath: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await preprocessPolyhavenAsset(
          asset.url,
          asset.assetType,
          asset.assetId
        );
        localPath = result.localPath;
        success = true;
        break;
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries) {
          console.warn(`  Retry ${attempt}/${maxRetries - 1} for ${asset.assetId}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    results.push({
      success,
      assetId: asset.assetId,
      localPath,
      error: lastError?.message
    });
  }

  return results;
}

/**
 * Clean up old/unused downloaded assets
 */
export async function cleanupUnusedAssets(
  usedPaths: Set<string>
): Promise<{ deleted: number; errors: string[] }> {
  const projectRoot = path.join(__dirname, '../..');
  const polyhavenDir = path.join(projectRoot, 'client/public/assets/polyhaven');

  let deleted = 0;
  const errors: string[] = [];

  try {
    const categories = await fs.readdir(polyhavenDir);

    for (const category of categories) {
      const categoryPath = path.join(polyhavenDir, category);
      const stats = await fs.stat(categoryPath);

      if (!stats.isDirectory()) continue;

      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        const relativePath = `assets/polyhaven/${category}/${file}`;

        if (!usedPaths.has(relativePath)) {
          const absolutePath = path.join(categoryPath, file);
          try {
            await fs.unlink(absolutePath);
            console.log(`Deleted unused asset: ${relativePath}`);
            deleted++;
          } catch (error: any) {
            errors.push(`Failed to delete ${relativePath}: ${error.message}`);
          }
        }
      }
    }
  } catch (error: any) {
    errors.push(`Failed to cleanup assets: ${error.message}`);
  }

  return { deleted, errors };
}
