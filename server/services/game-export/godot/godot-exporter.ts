/**
 * Godot Exporter — Orchestrator
 *
 * Combines all Godot generators (project, GDScript, data, scene) into
 * a single export pipeline that produces a complete Godot 4.x project
 * as a ZIP buffer ready for download.
 */

import { generateProjectFiles, type GeneratedFile } from './godot-project-generator';
import { generateGDScriptFiles } from './godot-gdscript-generator';
import { generateDataFiles } from './godot-data-generator';
import { generateSceneFiles } from './godot-scene-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, generateAssetManifestJson, type BundledAsset } from '../asset-bundler';
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

export interface GodotExportResult {
  projectName: string;
  files: GeneratedFile[];
  zipBuffer: Buffer | null;
  stats: {
    totalFiles: number;
    gdscriptFiles: number;
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
export async function exportGodotProject(worldId: string): Promise<GodotExportResult> {
  const startTime = Date.now();

  // 1. Generate IR with Godot-specific asset resolution
  const ir = await generateWorldIR(worldId, 'godot');

  // 2. Run all generators
  const allFiles = generateGodotFilesFromIR(ir);

  // 3. Bundle core assets
  const assetBundle = await bundleCoreAssets();
  allFiles.push({
    path: 'data/asset-manifest.json',
    content: generateAssetManifestJson(assetBundle.manifest),
  });

  // 4. Package
  const worldSafe = sanitiseName(ir.meta.worldName) || 'InsimulWorld';
  const projectName = `InsimulExport_${worldSafe}`;

  let zipBuffer: Buffer | null = null;
  try {
    zipBuffer = await packageAsZip(projectName, allFiles, assetBundle.assets);
  } catch (err) {
    console.error('[GodotExporter] ZIP packaging failed:', err);
  }

  const textSizeBytes = allFiles.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
  const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes;
  const elapsed = Date.now() - startTime;

  return {
    projectName,
    files: allFiles,
    zipBuffer,
    stats: {
      totalFiles: allFiles.length + assetBundle.fileCount,
      gdscriptFiles: countByExtension(allFiles, '.gd'),
      dataFiles: countByExtension(allFiles, '.json'),
      configFiles: countByExtension(allFiles, '.godot', '.cfg', '.tres', '.tscn', '.svg', '.md', '.gitignore', '.gitattributes'),
      totalSizeBytes,
      generationTimeMs: elapsed,
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
