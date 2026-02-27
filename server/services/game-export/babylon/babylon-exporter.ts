/**
 * Babylon.js Exporter — Orchestrator
 *
 * Combines all Babylon.js generators (project, code, data, scene) into
 * a single export pipeline that produces a complete standalone web app
 * as a ZIP buffer ready for download. Includes Base Collection assets
 * (GLB models, textures, audio) in the archive.
 */

import { generateProjectFiles, type GeneratedFile } from './babylon-project-generator';
import { generateCodeFiles } from './babylon-code-generator';
import { generateDataFiles } from './babylon-data-generator';
import { generateSceneFiles } from './babylon-scene-generator';
import { generateWorldIR } from '../ir-generator';
import { bundleCoreAssets, generateAssetManifestJson, type BundledAsset } from '../asset-bundler';
import type { WorldIR } from '@shared/game-engine/ir-types';
import { createRequire } from 'node:module';

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
// ZIP packaging (text + binary assets)
// ─────────────────────────────────────────────

async function packageAsZip(
  projectName: string,
  files: GeneratedFile[],
  binaryAssets: BundledAsset[],
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

    archive.finalize();
  });
}

// ─────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────

export async function exportBabylonProject(worldId: string): Promise<BabylonExportResult> {
  const startTime = Date.now();

  // Generate IR
  const ir = await generateWorldIR(worldId, 'babylon');

  const worldSafe = sanitiseName(ir.meta.worldName || 'InsimulWorld');
  const projectName = `InsimulExport_${worldSafe}_Babylon`;

  // Run all generators
  const projectFiles = generateProjectFiles(ir);
  const codeFiles = generateCodeFiles(ir);
  const dataFiles = generateDataFiles(ir);
  const sceneFiles = generateSceneFiles(ir);

  // Bundle core assets from disk
  const assetBundle = await bundleCoreAssets();

  // Add asset manifest — in public/ for runtime fetch, in src/data/ for static import
  const manifestJson = generateAssetManifestJson(assetBundle.manifest);

  const files: GeneratedFile[] = [
    ...projectFiles,
    ...codeFiles,
    ...dataFiles,
    ...sceneFiles,
    { path: 'public/asset-manifest.json', content: manifestJson },
    { path: 'src/data/asset-manifest.json', content: manifestJson },
  ];

  const textSizeBytes = files.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf8'), 0);
  const totalSizeBytes = textSizeBytes + assetBundle.totalSizeBytes;
  const elapsed = Date.now() - startTime;

  // Package as ZIP (text files + binary assets)
  const zipBuffer = await packageAsZip(projectName, files, assetBundle.assets);

  const tsFiles = countByExtension(files, '.ts');
  const jsonFiles = countByExtension(files, '.json');
  const configFiles = countByExtension(files, '.html', '.gitignore', '.md');

  console.log(`[Export] Babylon.js project generated: ${files.length} text files + ${assetBundle.fileCount} assets, ${tsFiles} TS, ${jsonFiles} data, ${Math.round(totalSizeBytes / 1024 / 1024)}MB in ${elapsed}ms, ZIP: ${zipBuffer ? Math.round(zipBuffer.length / 1024 / 1024) + 'MB' : 'null (archiver unavailable)'}`);

  return {
    projectName,
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
}
