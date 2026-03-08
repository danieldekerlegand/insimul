/**
 * Unreal Exporter — Orchestrator
 *
 * Combines all Unreal generators (project, C++, DataTable, level) into
 * a single export pipeline that produces a complete UE5 project as a
 * ZIP buffer ready for download.
 */

import { generateProjectFiles, type GeneratedFile } from './unreal-project-generator';
import { generateCppFiles } from './unreal-cpp-generator';
import { generateDataTableFiles } from './unreal-datatable-generator';
import { generateLevelFiles } from './unreal-level-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, bundleAssetsFromCollection, generateAssetManifestJson, type BundledAsset, type TargetEngine } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// We use archiver for ZIP — createRequire needed for ESM projects.
const require = createRequire(import.meta.url);
let archiver: any;
try {
  archiver = require('archiver');
} catch {
  archiver = null;
}

// ─────────────────────────────────────────────
// Export result types
// ─────────────────────────────────────────────

export interface UnrealExportResult {
  /** The world name (sanitised) */
  projectName: string;
  /** All generated files with relative paths */
  files: GeneratedFile[];
  /** ZIP buffer if archiver is available, null otherwise */
  zipBuffer: Buffer | null;
  /** Stats */
  stats: {
    totalFiles: number;
    cppFiles: number;
    dataFiles: number;
    configFiles: number;
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
// ZIP packaging
// ─────────────────────────────────────────────

async function packageAsZip(
  projectName: string,
  files: GeneratedFile[],
  binaryAssets: BundledAsset[] = [],
): Promise<Buffer | null> {
  if (!archiver) return null;

  return new Promise<Buffer>((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', (err: Error) => reject(err));

    for (const file of files) {
      archive.append(file.content, { name: `${projectName}/${file.path}` });
    }

    for (const asset of binaryAssets) {
      archive.append(asset.buffer, { name: `${projectName}/Content/${asset.exportPath}` });
    }

    archive.finalize();
  });
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

/**
 * Generate a complete Unreal Engine 5 project from a world ID.
 *
 * 1. Generates the WorldIR with engine='unreal'
 * 2. Runs all UE5 generators (project, C++, DataTable, level)
 * 3. Bundles Base Collection assets
 * 4. Packages everything into a ZIP buffer
 */
export async function exportUnrealProject(worldId: string): Promise<UnrealExportResult> {
  console.log('[Export] Starting Unreal export for world:', worldId);
  const startTime = Date.now();

  // 1. Generate the World IR
  const ir = await generateWorldIR(worldId);
  
  // 2. Get the world's selected asset collection
  const { storage } = await import(/* webpackIgnore: true */ new URL('../../../db/storage.js', import.meta.url).href as any);
  const world = await storage.getWorld(worldId);
  const selectedCollectionId = (world as any)?.selectedAssetCollectionId;

  // 3. Run all generators
  const allFiles = generateUnrealFilesFromIR(ir);

  // 4. Bundle assets from the world's selected collection
  const engine: TargetEngine = 'unreal';
  let assetBundle;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId);
  } else {
    console.log('[Export] No asset collection selected, using core assets');
    assetBundle = await bundleCoreAssets(engine);
  }

  allFiles.push({
    path: 'Content/Data/asset-manifest.json',
    content: generateAssetManifestJson(assetBundle.manifest),
  });

  // Do NOT bundle template .umap files — they have wrong internal package names.

  // 4. Package
  const worldSafe = sanitiseName(ir.meta.worldName) || 'InsimulWorld';
  const projectName = `InsimulExport_${worldSafe}`;

  let zipBuffer: Buffer | null = null;
  try {
    zipBuffer = await packageAsZip(projectName, allFiles, assetBundle.assets);
  } catch (err) {
    console.error('[UnrealExporter] ZIP packaging failed:', err);
  }

  const textSizeBytes = allFiles.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
  const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes;
  const elapsed = Date.now() - startTime;

  return {
    projectName,
    files: allFiles,
    zipBuffer,
    stats: {
      totalFiles: allFiles.length,
      cppFiles: countByExtension(allFiles, '.cpp', '.h'),
      dataFiles: countByExtension(allFiles, '.json', '.csv'),
      configFiles: countByExtension(allFiles, '.ini', '.uproject', '.Build.cs'),
      totalSizeBytes,
      generationTimeMs: elapsed,
    },
  };
}

/**
 * Try to locate the UE5 Template_Default.umap from known engine install paths.
 */
function findUE5TemplateMap(): Buffer | null {
  const candidates = [
    // macOS
    '/Users/Shared/Epic Games/UE_5.5/Engine/Content/Maps/Templates/Template_Default.umap',
    '/Users/Shared/Epic Games/UE_5.4/Engine/Content/Maps/Templates/Template_Default.umap',
    // Windows
    'C:/Program Files/Epic Games/UE_5.5/Engine/Content/Maps/Templates/Template_Default.umap',
    'C:/Program Files/Epic Games/UE_5.4/Engine/Content/Maps/Templates/Template_Default.umap',
    // Linux
    '/opt/unreal-engine/Engine/Content/Maps/Templates/Template_Default.umap',
  ];

  // Also check UE_ENGINE_DIR env variable
  const envDir = process.env.UE_ENGINE_DIR;
  if (envDir) {
    candidates.unshift(join(envDir, 'Content/Maps/Templates/Template_Default.umap'));
  }

  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        return readFileSync(p);
      }
    } catch { /* skip */ }
  }
  return null;
}

export function generateUnrealFilesFromIR(ir: WorldIR): GeneratedFile[] {
  const projectFiles = generateProjectFiles(ir);
  const cppFiles = generateCppFiles(ir);
  const dataFiles = generateDataTableFiles(ir);
  const levelFiles = generateLevelFiles(ir);

  return [...projectFiles, ...cppFiles, ...dataFiles, ...levelFiles];
}
