/**
 * Babylon.js Exporter - Updated to use actual 3DGame files
 */

import * as fsSync from 'fs';
import * as path from 'path';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join as joinPath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';
import { execSync } from 'node:child_process';

const TEMPLATES_DIR = joinPath(dirname(fileURLToPath(import.meta.url)), 'templates');

function loadTemplate(name: string, vars: Record<string, string> = {}): string {
  const content = readFileSync(joinPath(TEMPLATES_DIR, name), 'utf8');
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './babylon-project-generator';
import { generateDataFiles } from './babylon-data-generator';
import { generateSceneFiles } from './babylon-scene-generator';
import { generateProjectFiles } from './babylon-project-generator';
import { GameFileCopier } from './game-file-copier';
import { bundleAssetsFromCollection, bundleCoreAssets, type TargetEngine } from '../asset-bundler';
import { generateWorldIR } from '../ir-generator';
import { generateBabylonTelemetryIntegration } from '../babylon-telemetry-integration';
import { TELEMETRY_DEFAULTS } from '../telemetry-config';
import { bundleBabylonPlugin } from '../plugin-bundler';
import { bundleAIModels, type AIBundleResult } from '../ai-bundler';
import type { BabylonExportOptions } from './types';
import { buildExportName } from '../export-naming';

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

  // Rewrite asset-paths.ts for export: absolute paths → relative (./assets/...)
  // In-app paths like '/assets/models/characters/legacy/...' become './assets/player/...'
  // to match the export's bundled asset layout
  const assetPathsIdx = files.findIndex(f => f.path.endsWith('shared/asset-paths.ts'));
  console.log(`[Export] asset-paths.ts rewrite: found at index ${assetPathsIdx} (searched ${files.length} shared files)`);
  if (assetPathsIdx >= 0) {
    let content = files[assetPathsIdx].content;
    // Ground textures: /assets/textures/environment/ → ./assets/ground/
    content = content.replace(/['"]\/assets\/textures\/environment\/ground\.jpg['"]/g, "'./assets/ground/ground.jpg'");
    content = content.replace(/['"]\/assets\/textures\/environment\/ground-normal\.png['"]/g, "'./assets/ground/ground-normal.png'");
    content = content.replace(/['"]\/assets\/textures\/environment\/ground_heightMap\.png['"]/g, "'./assets/ground/ground_heightMap.png'");
    // Player model: /assets/models/characters/legacy/ → ./assets/player/
    content = content.replace(/['"]\/assets\/models\/characters\/legacy\/Vincent-frontFacing\.babylon['"]/g, "'./assets/player/Vincent-frontFacing.babylon'");
    // NPC model: /assets/models/characters/legacy/ → ./assets/npc/
    content = content.replace(/['"]\/assets\/models\/characters\/legacy\/starterAvatars\.babylon['"]/g, "'./assets/npc/starterAvatars.babylon'");
    // Footstep sound
    content = content.replace(/['"]\/assets\/audio\/effects\/footstep_carpet_000\.ogg['"]/g, "'./assets/audio/footstep/stone.mp3'");
    // Make all remaining /assets/ paths relative
    content = content.replace(/['"]\/assets\//g, "'./assets/");
    files[assetPathsIdx].content = content;
  }

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

function generateMainEntry(ir: WorldIR, apiUrl?: string): string {
  return loadTemplate('main.ts', {
    WORLD_ID:   ir.meta.worldId,
    WORLD_NAME: ir.meta.worldName,
    WORLD_TYPE: ir.meta.worldType || 'fantasy',
    API_URL:    apiUrl || '',
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
  const ir = await generateWorldIR(worldId, 'babylon', { aiProvider: options.aiProvider });
  
  // 2. Generate data files
  console.log('[Export] Generating data files...');
  const dataFiles = generateDataFiles(ir);

  // 2b. Generate scene files (scene-builder, world-generator, npc-spawner)
  console.log('[Export] Generating scene files...');
  const sceneFiles = generateSceneFiles(ir);
  
  // 3. Copy actual game files from 3DGame directory
  console.log('[Export] Copying game files from 3DGame...');
  const gameFileCopier = new GameFileCopier(
    get3DGamePath(),
    '/tmp/export'
  );
  const gameFiles = await gameFileCopier.copyAllFiles();

  // 4. Copy client/src/lib/ utility files (used by VR and audio systems)
  const libDir = path.join(get3DGamePath(), '..', '..', 'lib');
  const libFiles: GeneratedFile[] = [];
  if (fsSync.existsSync(libDir)) {
    for (const entry of fsSync.readdirSync(libDir)) {
      if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('.test.ts')) {
        const content = fsSync.readFileSync(path.join(libDir, entry), 'utf-8');
        libFiles.push({ path: `src/lib/${entry}`, content });
      }
    }
  }

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
    content: generateMainEntry(ir, options.apiUrl)
  };
  
  // 10. Bundle assets from the world's selected collection
  console.log('[Export] Bundling assets...');
  const engine: TargetEngine = 'babylon';
  let assetBundle;
  const selectedCollectionId = (ir.meta as any).selectedAssetCollectionId;
  if (selectedCollectionId) {
    console.log(`[Export] Using asset collection: ${selectedCollectionId}`);
    assetBundle = await bundleAssetsFromCollection(selectedCollectionId, ir.meta.worldId);

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
  
  // Always include telemetry integration (with localStorage fallback)
  const telemetryFiles: GeneratedFile[] = [];
  {
    const telemetryTs = generateBabylonTelemetryIntegration({
      apiEndpoint: options.telemetry?.serverUrl ?? '',
      apiKey: options.telemetry?.apiKey ?? '',
      batchSize: options.telemetry?.batchSize ?? TELEMETRY_DEFAULTS.batchSize,
      flushIntervalMs: options.telemetry?.flushIntervalMs ?? TELEMETRY_DEFAULTS.flushIntervalMs,
    });
    telemetryFiles.push({
      path: 'src/telemetry-integration.ts',
      content: telemetryTs,
    });
    console.log('[Export] Babylon.js telemetry integration included');
  }

  // Bundle AI models when local AI is selected
  let aiBundleResult: AIBundleResult | null = null;
  if (options.aiProvider === 'local') {
    console.log('[Export] Bundling local AI models...');
    aiBundleResult = await bundleAIModels('babylon');
    console.log(`[Export] AI bundle: ${aiBundleResult.assets.length} files, ${Math.round(aiBundleResult.totalSizeBytes / 1024 / 1024)}MB`);
  }

  // Bundle Insimul SDK plugin
  console.log('[Export] Bundling Insimul SDK...');
  const pluginFiles: GeneratedFile[] = bundleBabylonPlugin(ir).map(f => ({ path: f.path, content: f.content }));

  // Combine all files
  const allFiles: GeneratedFile[] = [
    ...dataFiles,
    ...sceneFiles,
    ...gameFiles,
    ...libFiles,
    ...sharedTypesFiles,
    ...telemetryFiles,
    ...pluginFiles,
    mainEntryFile,
    ...projectFiles,
    { path: 'public/data/asset-manifest.json', content: manifestJson },
  ];

  // Rewrite asset paths for export: absolute → relative in ALL source files.
  // In Electron (file:// protocol), absolute /assets/ paths resolve to file system root,
  // not the app directory. Convert them all to relative ./assets/.
  for (const file of allFiles) {
    if (typeof file.content !== 'string') continue;
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx') && !file.path.endsWith('.json') && !file.path.endsWith('.js')) continue;
    if (!file.content.includes('/assets/')) continue;

    let c = file.content;
    // Specific remaps for known relocated assets
    if (file.path.endsWith('asset-paths.ts')) {
      console.log(`[Export] Rewriting asset paths in ${file.path}`);
      c = c.replace(/['"]\/assets\/textures\/environment\/ground\.jpg['"]/g, "'./assets/ground/ground.jpg'");
      c = c.replace(/['"]\/assets\/textures\/environment\/ground-normal\.png['"]/g, "'./assets/ground/ground-normal.png'");
      c = c.replace(/['"]\/assets\/textures\/environment\/ground_heightMap\.png['"]/g, "'./assets/ground/ground_heightMap.png'");
      c = c.replace(/['"]\/assets\/models\/characters\/legacy\/Vincent-frontFacing\.babylon['"]/g, "'./assets/player/Vincent-frontFacing.babylon'");
      c = c.replace(/['"]\/assets\/models\/characters\/legacy\/starterAvatars\.babylon['"]/g, "'./assets/npc/starterAvatars.babylon'");
      c = c.replace(/['"]\/assets\/audio\/effects\/footstep_carpet_000\.ogg['"]/g, "'./assets/audio/footstep/stone.mp3'");
    }
    // Convert all remaining absolute /assets/ paths to relative ./assets/
    c = c.replace(/(["'`])\/assets\//g, '$1./assets/');
    if (c !== file.content) file.content = c;
  }
  
  // Compute the project folder name for the ZIP archive
  const projectName = buildExportName(
    ir.meta.worldName,
    'Babylon',
    options.aiProvider,
    options.mode,
  );

  // ── Build step (optional): write to disk, npm install, vite build, electron-builder ──
  if (options.buildExecutable) {
    const tmpDir = joinPath(require('os').tmpdir(), `insimul-export-${Date.now()}`);
    console.log(`[Export] Writing project to ${tmpDir}...`);

    // Write all source files
    for (const file of allFiles) {
      const filePath = joinPath(tmpDir, file.path);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, file.content, 'utf8');
    }

    // Write binary assets
    for (const asset of assetBundle.assets) {
      const assetPath = joinPath(tmpDir, 'public', asset.exportPath);
      mkdirSync(dirname(assetPath), { recursive: true });
      writeFileSync(assetPath, asset.buffer);
    }

    // Write AI model assets
    if (aiBundleResult) {
      for (const asset of aiBundleResult.assets) {
        const assetPath = joinPath(tmpDir, 'public', asset.exportPath);
        mkdirSync(dirname(assetPath), { recursive: true });
        writeFileSync(assetPath, asset.buffer);
      }
    }

    // Install dependencies
    console.log('[Export] Running npm install...');
    try {
      execSync('npm install --prefer-offline', { cwd: tmpDir, stdio: 'pipe', timeout: 120_000 });
    } catch (installErr: any) {
      console.error('[Export] npm install failed:', installErr.stderr?.toString().slice(-500));
      throw new Error(`Export build failed during npm install: ${installErr.message}`);
    }

    // Vite build
    console.log('[Export] Running vite build...');
    try {
      execSync('npx vite build', { cwd: tmpDir, stdio: 'pipe', timeout: 120_000 });
    } catch (buildErr: any) {
      const stderr = buildErr.stderr?.toString() || '';
      const stdout = buildErr.stdout?.toString() || '';
      console.error('[Export] vite build failed:', stderr.slice(-1000) || stdout.slice(-1000));
      throw new Error(`Export build failed during vite build: ${stderr.slice(-500) || stdout.slice(-500)}`);
    }
    console.log('[Export] vite build succeeded');

    // Electron-builder (electron mode only)
    if (options.mode === 'electron') {
      console.log('[Export] Running electron-builder...');
      try {
        execSync('npx electron-builder --dir', { cwd: tmpDir, stdio: 'pipe', timeout: 300_000 });
      } catch (ebErr: any) {
        console.warn('[Export] electron-builder failed (non-fatal, falling back to source ZIP):', ebErr.message?.slice(0, 200));
        // Fall through to ZIP the built project instead
      }
    }

    console.log('[Export] Build complete, creating ZIP from built project...');

    // ZIP the entire project directory (including dist/ and release/)
    if (!archiver) archiver = require('archiver');
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const archive = archiver('zip');
      const chunks: Buffer[] = [];
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
      archive.directory(tmpDir, projectName);
      archive.finalize();
    });

    // Clean up temp directory
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }

    return zipBuffer;
  }

  // ── Standard path: create ZIP archive from in-memory files ──
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

    // Add all files to archive under the project folder
    for (const file of allFiles) {
      archive.append(file.content, { name: `${projectName}/${file.path}` });
    }

    // Add assets - include for both web and electron modes
    for (const asset of assetBundle.assets) {
      archive.append(asset.buffer, { name: `${projectName}/public/${asset.exportPath}` });
    }

    // Add AI model assets
    if (aiBundleResult) {
      for (const asset of aiBundleResult.assets) {
        archive.append(asset.buffer, { name: `${projectName}/public/${asset.exportPath}` });
      }
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

/**
 * Export the project to a directory on disk, writing files directly
 * without creating an in-memory ZIP (avoids the 2GB buffer limit).
 * Returns the output directory path.
 */
export async function exportBabylonProjectToDirectory(
  worldId: string,
  options: BabylonExportOptions,
  outputDir?: string
): Promise<string> {
  console.log('[Export] Generating project files for directory export...');
  const ir = await generateWorldIR(worldId, 'babylon', { aiProvider: options.aiProvider });

  const dataFiles = generateDataFiles(ir);
  const sceneFiles = generateSceneFiles(ir);
  const gameFileCopier = new GameFileCopier(get3DGamePath(), '/tmp/export');
  const gameFiles = await gameFileCopier.copyAllFiles();

  const libDir = path.join(get3DGamePath(), '..', '..', 'lib');
  const libFiles: GeneratedFile[] = [];
  if (fsSync.existsSync(libDir)) {
    for (const entry of fsSync.readdirSync(libDir)) {
      if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('.test.ts')) {
        libFiles.push({ path: `src/lib/${entry}`, content: fsSync.readFileSync(path.join(libDir, entry), 'utf-8') });
      }
    }
  }

  const sharedTypesFiles = await copySharedTypes();
  const projectFiles = generateProjectFiles(ir, options);
  const mainEntryFile: GeneratedFile = { path: 'src/main.ts', content: generateMainEntry(ir, options.apiUrl) };

  // Assets
  const engine: TargetEngine = 'babylon';
  const selectedCollectionId = (ir.meta as any).selectedAssetCollectionId;
  let assetBundle = selectedCollectionId
    ? await bundleAssetsFromCollection(selectedCollectionId, ir.meta.worldId)
    : await bundleCoreAssets(engine);
  if (assetBundle.assets.length === 0) assetBundle = await bundleCoreAssets(engine);

  const manifestJson = generateAssetManifestJson(assetBundle.manifest);

  const telemetryFiles: GeneratedFile[] = [{
    path: 'src/telemetry-integration.ts',
    content: generateBabylonTelemetryIntegration({
      apiEndpoint: options.telemetry?.serverUrl ?? '',
      apiKey: options.telemetry?.apiKey ?? '',
      batchSize: options.telemetry?.batchSize ?? TELEMETRY_DEFAULTS.batchSize,
      flushIntervalMs: options.telemetry?.flushIntervalMs ?? TELEMETRY_DEFAULTS.flushIntervalMs,
    }),
  }];

  let aiBundleResult: AIBundleResult | null = null;
  if (options.aiProvider === 'local') {
    aiBundleResult = await bundleAIModels('babylon');
  }

  const pluginFiles: GeneratedFile[] = bundleBabylonPlugin(ir).map(f => ({ path: f.path, content: f.content }));

  const allFiles: GeneratedFile[] = [
    ...dataFiles, ...sceneFiles, ...gameFiles, ...libFiles,
    ...sharedTypesFiles, ...telemetryFiles, ...pluginFiles,
    mainEntryFile, ...projectFiles,
    { path: 'public/data/asset-manifest.json', content: manifestJson },
  ];

  // Rewrite asset paths: absolute /assets/ → relative ./assets/ in ALL source files
  for (const file of allFiles) {
    if (typeof file.content !== 'string') continue;
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx') && !file.path.endsWith('.json') && !file.path.endsWith('.js')) continue;
    if (!(file.content as string).includes('/assets/')) continue;
    let c = file.content as string;
    if (file.path.endsWith('asset-paths.ts')) {
      c = c.replace(/['"]\/assets\/textures\/environment\/ground\.jpg['"]/g, "'./assets/ground/ground.jpg'");
      c = c.replace(/['"]\/assets\/textures\/environment\/ground-normal\.png['"]/g, "'./assets/ground/ground-normal.png'");
      c = c.replace(/['"]\/assets\/textures\/environment\/ground_heightMap\.png['"]/g, "'./assets/ground/ground_heightMap.png'");
      c = c.replace(/['"]\/assets\/models\/characters\/legacy\/Vincent-frontFacing\.babylon['"]/g, "'./assets/player/Vincent-frontFacing.babylon'");
      c = c.replace(/['"]\/assets\/models\/characters\/legacy\/starterAvatars\.babylon['"]/g, "'./assets/npc/starterAvatars.babylon'");
      c = c.replace(/['"]\/assets\/audio\/effects\/footstep_carpet_000\.ogg['"]/g, "'./assets/audio/footstep/stone.mp3'");
    }
    c = c.replace(/(["'`])\/assets\//g, '$1./assets/');
    if (c !== file.content) file.content = c;
  }

  const projectName = buildExportName(ir.meta.worldName, 'Babylon', options.aiProvider, options.mode);
  const destDir = outputDir || joinPath(process.cwd(), 'exports', projectName);

  console.log(`[Export] Writing ${allFiles.length} source files to ${destDir}...`);
  for (const file of allFiles) {
    const filePath = joinPath(destDir, file.path);
    mkdirSync(dirname(filePath), { recursive: true });
    const content = typeof file.content === 'string' ? file.content : file.content;
    writeFileSync(filePath, content);
  }

  console.log(`[Export] Writing ${assetBundle.assets.length} assets...`);
  for (const asset of assetBundle.assets) {
    const assetPath = joinPath(destDir, 'public', asset.exportPath);
    mkdirSync(dirname(assetPath), { recursive: true });
    writeFileSync(assetPath, asset.buffer);
  }

  if (aiBundleResult) {
    console.log(`[Export] Writing ${aiBundleResult.assets.length} AI model files...`);
    for (const asset of aiBundleResult.assets) {
      const assetPath = joinPath(destDir, 'public', asset.exportPath);
      mkdirSync(dirname(assetPath), { recursive: true });
      writeFileSync(assetPath, asset.buffer);
    }
  }

  console.log(`[Export] Directory export complete: ${destDir}`);
  return destDir;
}
