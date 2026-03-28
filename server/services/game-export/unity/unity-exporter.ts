/**
 * Unity Exporter — Orchestrator
 *
 * Combines all Unity generators (project, C#, data, scene) into
 * a single export pipeline that produces a complete Unity project
 * as a ZIP buffer ready for download.
 */

import { generateProjectFiles, type GeneratedFile, type UnityProjectOptions } from './unity-project-generator';
import { generateCSharpFiles } from './unity-csharp-generator';
import { generateDataFiles } from './unity-data-generator';
import { generateSceneFiles } from './unity-scene-generator';
import { GuidRegistry, generateMetaFiles } from './unity-guid-manager';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, bundleAssetsFromCollection, generateAssetManifestJson, type BundledAsset, type TargetEngine } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { generateUnityTelemetryTemplate } from '../unity-telemetry-template';
import type { ExportTelemetryConfig } from '../telemetry-config';
import { TELEMETRY_DEFAULTS } from '../telemetry-config';
import { bundleUnityPlugin } from '../plugin-bundler';
import { bundleAIModels, generateAIManifestJson, type AIProvider, type AIBundleResult } from '../ai-bundler';
import { buildExportName } from '../export-naming';
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
  worldName: string;
  aiMode: string;
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
  aiBundle?: AIBundleResult | null,
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

    // AI model files go into StreamingAssets so they're accessible at runtime via File.IO
    if (aiBundle) {
      for (const asset of aiBundle.assets) {
        archive.append(asset.buffer, { name: `${projectName}/Assets/StreamingAssets/${asset.exportPath}` });
      }
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
export interface UnityExportOptions {
  telemetry?: ExportTelemetryConfig;
  /** AI provider mode: 'local' bundles model files, 'cloud' uses remote API (default: 'cloud') */
  aiProvider?: AIProvider;
  /** Override the project/folder name inside the ZIP (e.g., "LaLouisianeUnityCloud") */
  projectName?: string;
  /** Unity editor version string, e.g. "6000.0.38f1" or "2022.3.18f1" (default: "6000.0.38f1") */
  unityVersion?: string;
}

export async function exportUnityProject(worldId: string, options?: UnityExportOptions): Promise<UnityExportResult> {
  console.log('[Export] Starting Unity export for world:', worldId);
  const startTime = Date.now();

  // 1. Generate the World IR
  const ir = await generateWorldIR(worldId);
  
  // 2. Get the world's selected asset collection
  const { storage } = await import(/* webpackIgnore: true */ new URL('../../../db/storage.js', import.meta.url).href as any);
  const world = await storage.getWorld(worldId);
  const selectedCollectionId = (world as any)?.selectedAssetCollectionId;

  // 3. Run all generators
  const allFiles = generateUnityFilesFromIR(ir, { unityVersion: options?.unityVersion });

  // 3b. Always include telemetry client (with local file fallback)
  {
    const telemetryCs = generateUnityTelemetryTemplate({
      apiEndpoint: options?.telemetry?.serverUrl ?? '',
      apiKey: options?.telemetry?.apiKey ?? '',
      batchSize: options?.telemetry?.batchSize ?? TELEMETRY_DEFAULTS.batchSize,
      flushIntervalMs: options?.telemetry?.flushIntervalMs ?? TELEMETRY_DEFAULTS.flushIntervalMs,
    });
    allFiles.push({
      path: 'Assets/Scripts/Insimul/TelemetryManager.cs',
      content: telemetryCs,
    });
    console.log('[Export] Unity telemetry client included');
  }

  // 3c. Bundle Insimul plugin
  console.log('[Export] Bundling Insimul Unity plugin...');
  const pluginFiles = bundleUnityPlugin(ir);
  for (const f of pluginFiles) {
    allFiles.push({ path: f.path, content: f.content });
  }

  // 3d. Bundle AI models when local provider is requested
  const aiProvider = options?.aiProvider ?? 'cloud';
  let aiBundle: AIBundleResult | null = null;
  if (aiProvider === 'local') {
    console.log('[Export] Bundling local AI models for Unity...');
    aiBundle = await bundleAIModels('unity');
    allFiles.push({
      path: 'Assets/StreamingAssets/ai/ai-manifest.json',
      content: generateAIManifestJson(aiBundle.manifest),
    });
    console.log(`[Export] AI bundle: ${aiBundle.assets.length} files, ${(aiBundle.totalSizeBytes / 1024 / 1024).toFixed(1)} MB`);
  }

  // 4. Bundle assets from the world's selected collection
  const engine: TargetEngine = 'unity';
  let assetBundle;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId, worldId);
  } else {
    console.log('[Export] No asset collection selected, using core assets');
    assetBundle = await bundleCoreAssets(engine);
  }

  allFiles.push({
    path: 'Assets/Resources/Data/asset-manifest.json',
    content: generateAssetManifestJson(assetBundle.manifest),
  });

  const projectName = options?.projectName || buildExportName(ir.meta.worldName, 'Unity', ir.aiConfig?.apiMode);

  let zipBuffer: Buffer | null = null;
  try {
    zipBuffer = await packageAsZip(projectName, allFiles, assetBundle.assets, aiBundle);
  } catch (err) {
    console.error('[UnityExporter] ZIP packaging failed:', err);
  }

  const textSizeBytes = allFiles.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
  const aiSizeBytes = aiBundle?.totalSizeBytes ?? 0;
  const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes + aiSizeBytes;
  const elapsed = Date.now() - startTime;

  return {
    projectName,
    worldName: ir.meta.worldName,
    aiMode: ir.aiConfig?.apiMode || 'cloud',
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
export function generateUnityFilesFromIR(ir: WorldIR, projectOptions?: UnityProjectOptions): GeneratedFile[] {
  const registry = new GuidRegistry();

  const projectFiles = generateProjectFiles(ir, projectOptions);
  const csharpFiles = generateCSharpFiles(ir);
  const dataFiles = generateDataFiles(ir);
  const sceneFiles = generateSceneFiles(ir, registry);

  const allFiles = [...projectFiles, ...csharpFiles, ...dataFiles, ...sceneFiles];

  // Generate .meta files for all Assets/ files
  const metaFiles = generateMetaFiles(allFiles, registry);
  allFiles.push(...metaFiles);

  return allFiles;
}
