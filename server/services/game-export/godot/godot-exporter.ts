/**
 * Godot Exporter — Orchestrator
 *
 * Combines all Godot generators (project, GDScript, data, scene) into
 * a single export pipeline that produces a complete Godot 4.x project
 * as a ZIP buffer ready for download.
 */

import { generateProjectFiles, type GeneratedFile } from './godot-project-generator';
import { generateGDScriptFiles, generateLocalAIManagerScript } from './godot-gdscript-generator';
import { generateDataFiles } from './godot-data-generator';
import { generateSceneFiles } from './godot-scene-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, bundleAssetsFromCollection, generateAssetManifestJson, type BundledAsset, type TargetEngine } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { generateGodotTelemetryTemplate } from '../godot-telemetry-template';
import type { ExportTelemetryConfig } from '../telemetry-config';
import { TELEMETRY_DEFAULTS } from '../telemetry-config';
import { bundleGodotPlugin } from '../plugin-bundler';
import type { AIModelPaths } from '../plugin-bundler';
import { bundleAIModels, type AIBundleOptions, type AIBundleManifest } from '../ai-bundler';
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

export interface GodotExportResult {
  projectName: string;
  worldName: string;
  aiMode: string;
  files: GeneratedFile[];
  zipBuffer: Buffer | null;
  stats: {
    totalFiles: number;
    gdscriptFiles: number;
    dataFiles: number;
    configFiles: number;
    totalSizeBytes: number;
    generationTimeMs: number;
    aiBundle?: AIBundleManifest;
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
      archive.append(asset.buffer, { name: `${projectName}/${asset.exportPath}` });
    }

    archive.finalize();
  });
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

/**
 * Generate a complete Godot 4.x project from a world ID.
 */
export interface GodotExportOptions {
  telemetry?: ExportTelemetryConfig;
  /** Include local AI models (GGUF, Piper, Whisper) in the export */
  aiBundle?: AIBundleOptions;
  /** Override the project/folder name inside the ZIP (e.g., "LaLouisianeGodotCloud") */
  projectName?: string;
}

export async function exportGodotProject(worldId: string, options?: GodotExportOptions): Promise<GodotExportResult> {
  console.log('[Export] Starting Godot export for world:', worldId);
  const startTime = Date.now();

  // 1. Generate the World IR
  const ir = await generateWorldIR(worldId);
  
  // 2. Get the world's selected asset collection
  const { storage } = await import(/* webpackIgnore: true */ new URL('../../../db/storage.js', import.meta.url).href as any);
  const world = await storage.getWorld(worldId);
  const selectedCollectionId = (world as any)?.selectedAssetCollectionId;

  // 3. Run all generators
  const allFiles = generateGodotFilesFromIR(ir);

  // 3b. Always include telemetry client (with local file fallback)
  {
    const telemetryGd = generateGodotTelemetryTemplate({
      apiEndpoint: options?.telemetry?.serverUrl ?? '',
      apiKey: options?.telemetry?.apiKey ?? '',
      batchSize: options?.telemetry?.batchSize ?? TELEMETRY_DEFAULTS.batchSize,
      flushIntervalMs: options?.telemetry?.flushIntervalMs ?? TELEMETRY_DEFAULTS.flushIntervalMs,
    });
    allFiles.push({
      path: 'scripts/autoload/telemetry_client.gd',
      content: telemetryGd,
    });
    console.log('[Export] Godot telemetry client included');
  }

  // 3c. Bundle AI models if requested
  let aiBundleAssets: BundledAsset[] = [];
  let aiBundleManifest: AIBundleManifest | undefined;
  let aiModelPaths: AIModelPaths | undefined;

  if (options?.aiBundle) {
    console.log('[Export] Bundling AI models for Godot...');
    const aiResult = await bundleAIModels('godot', options.aiBundle);
    aiBundleAssets = aiResult.assets;
    aiBundleManifest = aiResult.manifest;

    // Build model paths for the plugin config (res:// prefixed for Godot)
    aiModelPaths = {};
    if (aiResult.manifest.llm) {
      aiModelPaths.llm = `res://${aiResult.manifest.llm.modelPath}`;
    }
    if (aiResult.manifest.stt) {
      aiModelPaths.stt = `res://${aiResult.manifest.stt.modelPath}`;
    }
    if (aiResult.manifest.tts) {
      aiModelPaths.voices = {};
      for (const [name, vpath] of Object.entries(aiResult.manifest.tts.voicePaths)) {
        aiModelPaths.voices[name] = `res://${vpath}`;
      }
    }
    console.log(`[Export] AI bundle: ${aiBundleAssets.length} files, ${Math.round(aiResult.totalSizeBytes / 1024 / 1024)}MB`);

    // Include the local AI manager GDScript
    allFiles.push(generateLocalAIManagerScript());
    console.log('[Export] Local AI manager script included');
  }

  // 3d. Bundle Insimul plugin (with AI model paths if available)
  console.log('[Export] Bundling Insimul Godot plugin...');
  const pluginFiles = bundleGodotPlugin(ir, aiModelPaths);
  for (const f of pluginFiles) {
    allFiles.push({ path: f.path, content: f.content });
  }

  // 4. Bundle assets from the world's selected collection
  const engine: TargetEngine = 'godot';
  let assetBundle;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId, worldId);
  } else {
    console.log('[Export] No asset collection selected, using core assets');
    assetBundle = await bundleCoreAssets(engine);
  }

  allFiles.push({
    path: 'data/asset-manifest.json',
    content: generateAssetManifestJson(assetBundle.manifest),
  });

  const projectName = options?.projectName || buildExportName(ir.meta.worldName, 'Godot', ir.aiConfig?.apiMode);

  // Merge all binary assets (game assets + AI models)
  const allBinaryAssets = [...assetBundle.assets, ...aiBundleAssets];

  let zipBuffer: Buffer | null = null;
  try {
    zipBuffer = await packageAsZip(projectName, allFiles, allBinaryAssets);
  } catch (err) {
    console.error('[GodotExporter] ZIP packaging failed:', err);
  }

  const textSizeBytes = allFiles.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
  const aiBundleSizeBytes = aiBundleAssets.reduce((sum, a) => sum + a.buffer.length, 0);
  const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes + aiBundleSizeBytes;
  const elapsed = Date.now() - startTime;

  return {
    projectName,
    worldName: ir.meta.worldName,
    aiMode: ir.aiConfig?.apiMode || 'cloud',
    files: allFiles,
    zipBuffer,
    stats: {
      totalFiles: allFiles.length,
      gdscriptFiles: countByExtension(allFiles, '.gd'),
      dataFiles: countByExtension(allFiles, '.json', '.tres'),
      configFiles: countByExtension(allFiles, '.godot', '.cfg', '.import'),
      totalSizeBytes,
      generationTimeMs: elapsed,
      aiBundle: aiBundleManifest,
    },
  };
}

/**
 * Generate all Godot project files from an already-built IR.
 */
export function generateGodotFilesFromIR(ir: WorldIR): GeneratedFile[] {
  const projectFiles = generateProjectFiles(ir);
  const gdscriptFiles = generateGDScriptFiles(ir);
  const dataFiles = generateDataFiles(ir);
  const sceneFiles = generateSceneFiles(ir);

  return [...projectFiles, ...gdscriptFiles, ...dataFiles, ...sceneFiles];
}
