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
  assetId: string,
  companionFiles?: Record<string, string>
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

  // Determine local directory — models go under models/{inferred-category}/polyhaven/{assetId}/
  // textures go under textures/environment/
  const projectRoot = path.join(__dirname, '../..');
  let localDir: string;
  let relativePath: string;

  if (isTexture) {
    localDir = path.join(projectRoot, 'client/public/assets/textures/environment');
    relativePath = `assets/textures/environment/${fileName}`;
  } else {
    // Models get their own subdirectory so companion files (bin, textures) stay co-located
    localDir = path.join(projectRoot, `client/public/assets/models/props/polyhaven/${assetId}`);
    relativePath = `assets/models/props/polyhaven/${assetId}/${fileName}`;
  }

  // Ensure directory exists
  await fs.mkdir(localDir, { recursive: true });

  // Full local path
  const absolutePath = path.join(localDir, fileName);

  // Check if file already exists
  try {
    await fs.access(absolutePath);
    console.log(`  Asset already exists locally: ${relativePath}`);

    // Get file stats
    const stats = await fs.stat(absolutePath);

    // Still download companions if they're missing (fixes incomplete previous downloads)
    if (companionFiles && Object.keys(companionFiles).length > 0) {
      await downloadCompanionFiles(companionFiles, localDir, assetId);
    }

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

    // Download companion files (.bin, textures) for model assets
    if (companionFiles && Object.keys(companionFiles).length > 0) {
      await downloadCompanionFiles(companionFiles, localDir, assetId);
    }

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
 * Download companion files (.bin geometry, textures) for a glTF model asset.
 * Companion file keys are relative paths like "textures/bark_diff_1k.jpg" or "model.bin".
 * We remap them so the .gltf references resolve correctly.
 */
async function downloadCompanionFiles(
  companionFiles: Record<string, string>,
  localDir: string,
  assetId: string
): Promise<void> {
  for (const [relPath, url] of Object.entries(companionFiles)) {
    // The .gltf file references companions by relative path.
    // e.g., "fir_tree_01.bin" or "textures/bark_diff_8k.jpg"
    // We need to place them relative to the .gltf file in localDir.
    const destPath = path.join(localDir, relPath);
    const destDir = path.dirname(destPath);

    // Ensure subdirectory exists (e.g., localDir/textures/)
    await fs.mkdir(destDir, { recursive: true });

    // Skip if already downloaded
    try {
      await fs.access(destPath);
      continue;
    } catch {
      // Doesn't exist, download it
    }

    try {
      console.log(`    Companion: ${relPath}`);
      await downloadFile(url, destPath);
      const stats = await fs.stat(destPath);
      console.log(`    ✅ ${relPath} (${(stats.size / 1024).toFixed(0)} KB)`);
    } catch (error: any) {
      console.warn(`    ⚠️ Failed to download companion ${relPath}: ${error.message}`);
    }
  }
}

/**
 * Download and preprocess a Sketchfab model asset.
 *
 * Sketchfab downloads are ZIP archives containing:
 *   scene.gltf, scene.bin, textures/
 *
 * We extract the archive into a per-model directory so the relative
 * references inside scene.gltf resolve correctly.
 *
 * @param gltfZipUrl  - Time-limited signed URL from Sketchfab download API
 * @param assetType   - The asset type (model_building, model_nature, etc.)
 * @param modelUid    - The Sketchfab model UID
 * @param modelName   - Human-readable model name (used for folder naming)
 */
export async function preprocessSketchfabAsset(
  gltfZipUrl: string,
  assetType: string,
  modelUid: string,
  modelName?: string
): Promise<{ localPath: string; absolutePath: string; metadata: any }> {
  const safeName = (modelName || modelUid)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 60);

  // Each Sketchfab model gets its own directory so scene.gltf can reference
  // scene.bin and textures/ via relative paths.
  const projectRoot = path.join(__dirname, '../..');
  const modelDir = path.join(
    projectRoot,
    'client/public/assets/models/buildings/sketchfab',
    `${modelUid}_${safeName}`
  );
  const gltfPath = path.join(modelDir, 'scene.gltf');
  const relativePath = `assets/models/buildings/sketchfab/${modelUid}_${safeName}/scene.gltf`;

  // If already extracted, return cached result
  try {
    await fs.access(gltfPath);
    const stats = await fs.stat(gltfPath);
    console.log(`  Sketchfab model already exists locally: ${relativePath}`);
    return {
      localPath: relativePath,
      absolutePath: gltfPath,
      metadata: {
        sketchfabUid: modelUid,
        originalUrl: gltfZipUrl,
        fileSize: stats.size,
        cached: true,
        cachedAt: stats.mtime.toISOString(),
      },
    };
  } catch {
    // Not cached — download and extract
  }

  await fs.mkdir(modelDir, { recursive: true });

  // Download the ZIP archive to a temp file
  const zipPath = path.join(modelDir, '_download.zip');
  console.log(`  Downloading Sketchfab model: ${modelUid}`);

  try {
    await downloadFile(gltfZipUrl, zipPath);
    const zipStats = await fs.stat(zipPath);
    console.log(`  ✅ Downloaded ZIP (${(zipStats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Extract ZIP using Node's built-in zlib + a simple unzip approach
    // We use the 'unzipper' pattern with streaming, but since we may not
    // have that dependency, fall back to spawning `unzip` CLI.
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`unzip -o -q "${zipPath}" -d "${modelDir}"`);
    console.log(`  ✅ Extracted to ${modelDir}`);

    // Clean up the ZIP
    await fs.unlink(zipPath).catch(() => {});

    // Verify scene.gltf exists
    try {
      await fs.access(gltfPath);
    } catch {
      // Some Sketchfab models use scene.glb instead of scene.gltf
      const glbPath = path.join(modelDir, 'scene.glb');
      try {
        await fs.access(glbPath);
        // Return the .glb path instead
        const glbRelative = `assets/models/buildings/sketchfab/${modelUid}_${safeName}/scene.glb`;
        const glbStats = await fs.stat(glbPath);
        return {
          localPath: glbRelative,
          absolutePath: glbPath,
          metadata: {
            sketchfabUid: modelUid,
            originalUrl: gltfZipUrl,
            fileSize: glbStats.size,
            format: 'glb',
            cached: false,
            downloadedAt: new Date().toISOString(),
          },
        };
      } catch {
        throw new Error(
          `Extracted archive for ${modelUid} contains neither scene.gltf nor scene.glb`
        );
      }
    }

    const gltfStats = await fs.stat(gltfPath);
    return {
      localPath: relativePath,
      absolutePath: gltfPath,
      metadata: {
        sketchfabUid: modelUid,
        originalUrl: gltfZipUrl,
        fileSize: gltfStats.size,
        format: 'gltf',
        cached: false,
        downloadedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    // Clean up on failure
    await fs.rm(modelDir, { recursive: true, force: true }).catch(() => {});
    console.error(`  ❌ Sketchfab download/extract failed: ${error.message}`);
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
  // Map audio categories to new structure
  const audioCat = category === 'interact' ? 'effects' : category;
  const localDir = path.join(projectRoot, 'client/public/assets/audio', audioCat);

  // Ensure directory exists
  await fs.mkdir(localDir, { recursive: true });

  // Full local path
  const absolutePath = path.join(localDir, fileName);

  // Relative path for storing in database (served by Express static)
  const relativePath = `assets/audio/${audioCat}/${fileName}`;

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
  const modelsDir = path.join(projectRoot, 'client/public/assets/models');

  let deleted = 0;
  const errors: string[] = [];

  try {
    // Scan all model categories for polyhaven assets
    const categories = ['furniture', 'nature', 'props', 'buildings'];

    for (const category of categories) {
      const categoryPath = path.join(modelsDir, category, 'polyhaven');
      try {
        await fs.access(categoryPath);
      } catch { continue; }

      const modelDirs = await fs.readdir(categoryPath);

      for (const file of modelDirs) {
        const relativePath = `assets/models/${category}/polyhaven/${file}`;

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
