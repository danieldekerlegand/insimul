/**
 * Babylon.js Exporter — Orchestrator
 *
 * Combines all Babylon.js generators (project, code, data, scene) into
 * a single export pipeline that produces a complete standalone app
 * as a ZIP buffer ready for download. Supports both web and Electron modes.
 * Includes Base Collection assets (GLB models, textures, audio) in the archive.
 */

import { generateProjectFiles, type GeneratedFile, type BabylonExportOptions } from './babylon-project-generator';
import { generateCodeFiles } from './babylon-code-generator';
import { generateDataFiles } from './babylon-data-generator';
import { generateSceneFiles } from './babylon-scene-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, generateAssetManifestJson, type BundledAsset } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';

// createRequire needed for ESM projects.
const require = createRequire(import.meta.url);
let archiver: any;
try {
  archiver = require('archiver');
} catch (e) {
  console.warn('[Export] archiver not available:', (e as Error).message);
  archiver = null;
}

// ─────────────────────────────────────────────
// Export result types
// ─────────────────────────────────────────────

export interface BabylonExportResult {
  projectName: string;
  mode: 'web' | 'electron';
  files: GeneratedFile[];
  zipBuffer: Buffer | null;
  stats: {
    totalFiles: number;
    tsFiles: number;
    dataFiles: number;
    configFiles: number;
    assetFiles: number;
    totalSizeBytes: number;
    generationTimeMs: number;
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

function countByExtension(files: GeneratedFile[], ...exts: string[]): number {
  return files.filter(f => exts.some(e => f.path.endsWith(e))).length;
}

// ─────────────────────────────────────────────
// Build Electron app (only for Electron mode)
// ─────────────────────────────────────────────

async function buildElectronApp(projectDir: string, projectName: string): Promise<void> {
  console.log('[Export] Building Electron app...');
  
  try {
    // Check if electron-builder is available
    try {
      execSync('electron-builder --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('[Export] electron-builder not found globally, using npx...');
    }
    
    // Install dependencies
    console.log('[Export] Installing npm dependencies...');
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
    
    // Build the Electron app
    console.log('[Export] Building Electron app...');
    
    // The Electron files are already JavaScript, no compilation needed!
    // Just run electron-builder
    try {
      execSync('npx electron-builder --publish=never', { cwd: projectDir, stdio: 'inherit' });
      console.log('[Export] Electron app built successfully');
    } catch (error) {
      console.error('[Export] electron-builder failed:', error);
      // Try with npm script
      try {
        execSync('npm run build:electron', { cwd: projectDir, stdio: 'inherit' });
        console.log('[Export] Electron app built successfully');
      } catch (e2) {
        console.error('[Export] Both electron-builder attempts failed');
        throw error;
      }
    }
  } catch (error) {
    console.error('[Export] Failed to build Electron app:', error);
    // Don't throw error, just warn - the export can continue without the built app
    console.warn('[Export] Continuing export without built Electron app');
  }
}

// ─────────────────────────────────────────────
// ZIP packaging (text + binary assets)
// ─────────────────────────────────────────────

async function packageAsZip(
  projectName: string,
  files: GeneratedFile[],
  binaryAssets: BundledAsset[],
  projectDir?: string,
  includeBuiltApp?: boolean,
): Promise<Buffer | null> {
  if (!archiver) return null;

  return new Promise<Buffer>((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', (err: Error) => reject(err));

    // Text files (generated code, data, configs)
    for (const file of files) {
      archive.append(file.content, { name: `${projectName}/${file.path}` });
    }

    // Binary assets (GLB, textures, audio)
    for (const asset of binaryAssets) {
      archive.append(asset.buffer, { name: `${projectName}/public/${asset.exportPath}` });
    }
    
    // Include built Electron app if available
    if (includeBuiltApp && projectDir) {
      const releaseDir = join(projectDir, 'release');
      try {
        const fs = require('fs');
        if (fs.existsSync(releaseDir)) {
          console.log('[Export] Including built Electron app in ZIP...');
          archive.directory(releaseDir, `${projectName}/release`);
        }
      } catch (error) {
        console.warn('[Export] Could not include built Electron app:', error);
      }
    }

    archive.finalize();
  });
}

// ─────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────

export async function exportBabylonProject(worldId: string, options: BabylonExportOptions = { mode: 'web' }): Promise<BabylonExportResult> {
  const startTime = Date.now();
  
  // Add retry logic for MongoDB timeouts
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Export] Attempt ${attempt}/${maxRetries} for Babylon.js ${options.mode} export...`);
      
      // Generate IR
      const ir = await generateWorldIR(worldId, 'babylon');

      const worldSafe = sanitiseName(ir.meta.worldName || 'InsimulWorld');
      const modeSuffix = options.mode === 'electron' ? 'Electron' : 'Babylon';
      const projectName = `InsimulExport_${worldSafe}_${modeSuffix}`;

      // Run all generators
      const projectFiles = generateProjectFiles(ir, options);
      const codeFiles = generateCodeFiles(ir);
      const dataFiles = generateDataFiles(ir);
      const sceneFiles = generateSceneFiles(ir);

      // Bundle core assets from disk
      const assetBundle = await bundleCoreAssets();

      // Add asset manifest — in public/ for runtime fetch, in src/data for static import
      const manifestJson = generateAssetManifestJson(assetBundle.manifest);

      const files: GeneratedFile[] = [
        ...projectFiles,
        ...codeFiles,
        ...dataFiles,
        ...sceneFiles,
        { path: 'public/asset-manifest.json', content: manifestJson },
        { path: 'src/data/asset-manifest.json', content: manifestJson },
      ];

      // For Electron mode, create temp directory and build the app
      let projectDir: string | undefined;
      let builtAppIncluded = false;
      
      if (options.mode === 'electron') {
        console.log('[Export] Creating temporary directory for Electron build...');
        projectDir = await mkdtemp(join(tmpdir(), 'insimul-export-'));
        
        // Write all files to temp directory
        const fs = require('fs/promises');
        const path = require('path');
        
        for (const file of files) {
          const filePath = path.join(projectDir, file.path);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content, 'utf8');
        }
        
        // Write binary assets
        for (const asset of assetBundle.assets) {
          const assetPath = path.join(projectDir, 'public', asset.exportPath);
          await fs.mkdir(path.dirname(assetPath), { recursive: true });
          await fs.writeFile(assetPath, asset.buffer);
        }
        
        // Create a simple icon file for Electron
        if (options.mode === 'electron') {
          const iconPath = path.join(projectDir, 'public', 'icon.png');
          await fs.mkdir(path.dirname(iconPath), { recursive: true });
          // Create a simple 256x256 PNG icon (transparent with simple design)
          const iconBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // 256x256
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // 8-bit RGBA
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
            0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00, // Minimal image data
            0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // 
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
            0xAE, 0x42, 0x60, 0x82 // PNG end
          ]);
          await fs.writeFile(iconPath, iconBuffer);
        }
        
        // Build the Electron app
        await buildElectronApp(projectDir, projectName);
        builtAppIncluded = true;
        
        console.log('[Export] Electron build completed, including in ZIP...');
      }

      const textSizeBytes = files.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
      const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes;
      const elapsed = Date.now() - startTime;

      // Package as ZIP (text files + binary assets + built app for Electron)
      const zipBuffer = await packageAsZip(projectName, files, assetBundle.assets, projectDir, builtAppIncluded);
      
      // Clean up temporary directory
      if (projectDir) {
        try {
          await rm(projectDir, { recursive: true, force: true });
          console.log('[Export] Cleaned up temporary directory');
        } catch (error) {
          console.warn('[Export] Could not clean up temporary directory:', error);
        }
      }

      const tsFiles = countByExtension(files, '.ts');
      const jsonFiles = countByExtension(files, '.json');
      const configFiles = countByExtension(files, '.html', '.gitignore', '.md');

      console.log(`[Export] Babylon.js ${options.mode} project generated: ${files.length} text files + ${assetBundle.fileCount} assets, ${tsFiles} TS, ${jsonFiles} data, ${Math.round(totalSizeBytes / 1024 / 1024)}MB in ${elapsed}ms, ZIP: ${zipBuffer ? Math.round(zipBuffer.length / 1024 / 1024) + 'MB' : 'null (archiver unavailable)'}`);

      return {
        projectName,
        mode: options.mode,
        files,
        zipBuffer,
        stats: {
          totalFiles: files.length + assetBundle.fileCount,
          tsFiles,
          dataFiles: jsonFiles,
          configFiles,
          assetFiles: assetBundle.fileCount,
          totalSizeBytes,
          generationTimeMs: elapsed,
        },
      };
      
    } catch (error: any) {
      lastError = error;
      
      // If it's a MongoDB timeout and we have retries left, try again
      if (error.message?.includes('MongoNetworkTimeoutError') && attempt < maxRetries) {
        console.log(`[Export] MongoDB timeout on attempt ${attempt}, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // For other errors or no retries left, throw
      throw error;
    }
  }
  
  // Should never reach here, but just in case
  throw lastError;
}
