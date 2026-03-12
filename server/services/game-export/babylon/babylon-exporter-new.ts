/**
 * Babylon.js Exporter - Updated to use actual 3DGame files
 */

import * as fsSync from 'fs';
import * as path from 'path';
import { readFileSync } from 'node:fs';
import { join as joinPath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';

const TEMPLATES_DIR = joinPath(dirname(fileURLToPath(import.meta.url)), 'templates');

function loadTemplate(name: string, vars: Record<string, string> = {}): string {
  const content = readFileSync(joinPath(TEMPLATES_DIR, name), 'utf8');
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './babylon-project-generator';
import { generateDataFiles } from './babylon-data-generator';
import { generateProjectFiles } from './babylon-project-generator';
import { GameFileCopier } from './game-file-copier';
import { bundleAssetsFromCollection, bundleCoreAssets, type TargetEngine } from '../asset-bundler';
import { generateWorldIR } from '../ir-generator';
import { generateBabylonTelemetryIntegration } from '../babylon-telemetry-integration';
import { TELEMETRY_DEFAULTS } from '../telemetry-config';
import type { BabylonExportOptions } from './types';

// createRequire needed for ESM projects.
const require = createRequire(import.meta.url);
let archiver: any;

// ============================================================================
// SHARED TYPES COPY FUNCTION
// ============================================================================

async function copySharedTypes(): Promise<GeneratedFile[]> {
  const sharedDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..', 'shared');
  const files: GeneratedFile[] = [];

  if (!fsSync.existsSync(sharedDir)) {
    console.warn(`[Export] Shared directory not found: ${sharedDir}`);
    return files;
  }

  function walkDir(absDir: string, relPrefix: string): void {
    const entries = fsSync.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(absDir, entry.name);
      const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walkDir(absPath, relPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        files.push({ path: `src/shared/${relPath}`, content: fsSync.readFileSync(absPath, 'utf8') });
      }
    }
  }

  walkDir(sharedDir, '');
  console.log(`[Export] Copied ${files.length} files from shared`);
  return files;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateAssetManifestJson(manifest: any[]): string {
  const categories: Record<string, any[]> = {};
  
  for (const asset of manifest) {
    if (!categories[asset.category]) {
      categories[asset.category] = [];
    }
    categories[asset.category].push(asset);
  }
  
  return JSON.stringify({
    version: "1.0.0",
    description: "Insimul Base Collection — bundled assets",
    totalFiles: manifest.length,
    totalSizeBytes: manifest.reduce((sum, asset) => sum + asset.fileSize, 0),
    categories,
    assets: manifest
  }, null, 2);
}


function get3DGamePath(): string {
  // Get the path to the 3DGame directory
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  return path.join(currentDir, '..', '..', '..', '..', 'client', 'src', 'components', '3DGame');
}

function generateMainEntry(ir: WorldIR): string {
  return loadTemplate('main.ts', {
    WORLD_ID:   ir.meta.worldId,
    WORLD_NAME: ir.meta.worldName,
    WORLD_TYPE: ir.meta.worldType || 'fantasy',
  });
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function exportBabylonProject(
  worldId: string,
  options: BabylonExportOptions
): Promise<Buffer> {
  console.log('[Export] Generating Babylon.js electron project for world', worldId);
  
  // 1. Generate the World IR
  console.log('[Export] Starting Babylon.js export for world:', worldId);
  const ir = await generateWorldIR(worldId);
  
  // 2. Generate data files
  console.log('[Export] Generating data files...');
  const dataFiles = generateDataFiles(ir);
  
  // 3. Copy actual game files from 3DGame directory
  console.log('[Export] Copying game files from 3DGame...');
  const gameFileCopier = new GameFileCopier(
    get3DGamePath(),
    '/tmp/export'
  );
  const gameFiles = await gameFileCopier.copyAllFiles();
  
  // 5. Copy shared types
  console.log('[Export] Copying shared types...');
  const sharedTypesFiles = await copySharedTypes();
  
  // 6. Generate project configuration files
  console.log('[Export] Generating project files...');
  const projectFiles = generateProjectFiles(ir, options);
  
  // 7. Create the main entry file that uses the real game
  // DataSource.ts and index.ts are provided by game-file-copier from the 3DGame source
  const mainEntryFile: GeneratedFile = {
    path: 'src/main.ts',
    content: generateMainEntry(ir)
  };
  
  // 10. Bundle assets from the world's selected collection
  console.log('[Export] Bundling assets...');
  const engine: TargetEngine = 'babylon';
  let assetBundle;
  const selectedCollectionId = (ir.meta as any).selectedAssetCollectionId;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId);

    // If no assets were bundled from the collection, fall back to core assets
    if (assetBundle.assets.length === 0) {
      console.log('[Export] Collection had no assets, falling back to core assets');
      assetBundle = await bundleCoreAssets(engine);
    }
  } else {
    console.log('[Export] No asset collection selected, using core assets');
    assetBundle = await bundleCoreAssets(engine);
  }
  
  // 10. Generate asset manifest
  const manifestJson = generateAssetManifestJson(assetBundle.manifest);
  
  // Include telemetry integration if enabled
  const telemetryFiles: GeneratedFile[] = [];
  if (options.telemetry?.enabled) {
    const telemetryTs = generateBabylonTelemetryIntegration({
      apiEndpoint: options.telemetry.serverUrl,
      apiKey: options.telemetry.apiKey,
      batchSize: options.telemetry.batchSize ?? TELEMETRY_DEFAULTS.batchSize,
      flushIntervalMs: options.telemetry.flushIntervalMs ?? TELEMETRY_DEFAULTS.flushIntervalMs,
    });
    telemetryFiles.push({
      path: 'src/telemetry-integration.ts',
      content: telemetryTs,
    });
    console.log('[Export] Babylon.js telemetry integration included');
  }

  // Combine all files
  const allFiles: GeneratedFile[] = [
    ...dataFiles,
    ...gameFiles,
    ...sharedTypesFiles,
    ...telemetryFiles,
    mainEntryFile,
    ...projectFiles,
    { path: 'public/data/asset-manifest.json', content: manifestJson },
  ];
  
  // Create ZIP archive
  console.log('[Export] Creating ZIP archive...');
  if (!archiver) {
    archiver = require('archiver');
  }
  
  return new Promise((resolve, reject) => {
    const archive = archiver('zip');
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    archive.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    archive.on('error', (err: Error) => {
      reject(err);
    });
    
    // Add all files to archive
    for (const file of allFiles) {
      if (file.isBinary) {
        archive.append(file.content, { name: file.path });
      } else {
        archive.append(file.content, { name: file.path });
      }
    }
    
    // Add assets - include for both web and electron modes
    for (const asset of assetBundle.assets) {
      archive.append(asset.buffer, { name: `public/${asset.exportPath}` });
    }
    
    archive.finalize();
  });
}

// Export the project as a ZIP buffer (alias for compatibility)
export async function exportBabylonProjectAsZip(
  worldId: string,
  options: BabylonExportOptions
): Promise<Buffer> {
  return exportBabylonProject(worldId, options);
}
