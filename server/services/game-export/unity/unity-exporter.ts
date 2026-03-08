/**
 * Unity Exporter — Orchestrator
 *
 * Combines all Unity generators (project, C#, data, scene) into
 * a single export pipeline that produces a complete Unity project
 * as a ZIP buffer ready for download.
 */

import { generateProjectFiles, type GeneratedFile } from './unity-project-generator';
import { generateCSharpFiles } from './unity-csharp-generator';
import { generateDataFiles } from './unity-data-generator';
import { generateSceneFiles } from './unity-scene-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, bundleAssetsFromCollection, generateAssetManifestJson, type BundledAsset, type TargetEngine } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { createRequire } from 'node:module';

// createRequire needed for ESM projects.
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

export interface UnityExportResult {
  projectName: string;
  files: GeneratedFile[];
  zipBuffer: Buffer | null;
  stats: {
    totalFiles: number;
    csharpFiles: number;
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
      // Place assets inside Resources/ so Unity's Resources.Load<GameObject>() can find them
      // after the editor auto-imports GLTF/GLB files on project open.
      archive.append(asset.buffer, { name: `${projectName}/Assets/Resources/${asset.exportPath}` });
    }

    archive.finalize();
  });
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

/**
 * Generate a complete Unity project from a world ID.
 */
export async function exportUnityProject(worldId: string): Promise<UnityExportResult> {
  console.log('[Export] Starting Unity export for world:', worldId);
  const startTime = Date.now();

  // 1. Generate the World IR
  const ir = await generateWorldIR(worldId);
  
  // 2. Get the world's selected asset collection
  const { storage } = await import(/* webpackIgnore: true */ new URL('../../../db/storage.js', import.meta.url).href as any);
  const world = await storage.getWorld(worldId);
  const selectedCollectionId = (world as any)?.selectedAssetCollectionId;

  // 3. Run all generators
  const allFiles = generateUnityFilesFromIR(ir);

  // 4. Bundle assets from the world's selected collection
  const engine: TargetEngine = 'unity';
  let assetBundle;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId);
  } else {
    console.log('[Export] No asset collection selected, using core assets');
    assetBundle = await bundleCoreAssets(engine);
  }

  allFiles.push({
    path: 'Assets/Resources/Data/asset-manifest.json',
    content: generateAssetManifestJson(assetBundle.manifest),
  });

  const worldSafe = sanitiseName(ir.meta.worldName) || 'InsimulWorld';
  const projectName = `InsimulExport_${worldSafe}`;

  let zipBuffer: Buffer | null = null;
  try {
    zipBuffer = await packageAsZip(projectName, allFiles, assetBundle.assets);
  } catch (err) {
    console.error('[UnityExporter] ZIP packaging failed:', err);
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
      csharpFiles: countByExtension(allFiles, '.cs'),
      dataFiles: countByExtension(allFiles, '.json', '.asset'),
      configFiles: countByExtension(allFiles, '.asmdef', '.meta', '.csproj'),
      totalSizeBytes,
      generationTimeMs: elapsed,
    },
  };
}

/**
 * Generate all Unity project files from an already-built IR.
 */
export function generateUnityFilesFromIR(ir: WorldIR): GeneratedFile[] {
  const projectFiles = generateProjectFiles(ir);
  const csharpFiles = generateCSharpFiles(ir);
  const dataFiles = generateDataFiles(ir);
  const sceneFiles = generateSceneFiles(ir);

  return [...projectFiles, ...csharpFiles, ...dataFiles, ...sceneFiles];
}
