/**
 * Asset Bundler — Server-Side
 *
 * Reads physical asset files (GLB models, textures, audio) from
 * client/public/assets/ and returns them as binary buffers for
 * inclusion in engine export ZIP archives.
 *
 * Uses the "Base Collection" of assets that ship with Insimul:
 *   - Character GLB models (player + NPC roles)
 *   - KayKit medieval buildings (GLTF + BIN)
 *   - Ground textures (diffuse, normal, heightmap)
 *   - Quest objects (GLB)
 *   - Audio files (ambient, footstep, interact)
 *
 * In the future, this can be extended to pull world-specific assets
 * from the DB-backed asset collection system.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BundledAsset {
  /** Relative path inside the export (e.g. "assets/characters/player_default.glb") */
  exportPath: string;
  /** Binary content */
  buffer: Buffer;
  /** Semantic category */
  category: 'character' | 'building' | 'ground' | 'nature' | 'quest_object' | 'audio' | 'prop';
  /** Semantic role (e.g. "player_default", "npc_guard", "ground_diffuse") */
  role: string;
}

export interface AssetManifestEntry {
  exportPath: string;
  category: string;
  role: string;
  fileSize: number;
}

export interface BundleResult {
  assets: BundledAsset[];
  manifest: AssetManifestEntry[];
  totalSizeBytes: number;
  fileCount: number;
}

// ─────────────────────────────────────────────
// Core asset definitions
// ─────────────────────────────────────────────

interface AssetDef {
  /** Path relative to client/public/assets/ */
  sourcePath: string;
  /** Path inside the export ZIP */
  exportPath: string;
  category: BundledAsset['category'];
  role: string;
}

const CORE_CHARACTERS: AssetDef[] = [
  // Same models used by the in-app BabylonGame: hardcoded fallback paths must match
  // PLAYER_MODEL_URL and NPC_MODEL_URL constants in BabylonGame.ts
  { sourcePath: 'player/Vincent-frontFacing.babylon', exportPath: 'assets/player/Vincent-frontFacing.babylon', category: 'character', role: 'player_default' },
  { sourcePath: 'player/Vincent_texture_image.jpg', exportPath: 'assets/player/Vincent_texture_image.jpg', category: 'character', role: 'player_texture' },
  { sourcePath: 'npc/starterAvatars.babylon', exportPath: 'assets/npc/starterAvatars.babylon', category: 'character', role: 'npc_default' },
];

const CORE_GROUND: AssetDef[] = [
  { sourcePath: 'ground/ground.jpg', exportPath: 'assets/ground/ground.jpg', category: 'ground', role: 'ground_diffuse' },
  { sourcePath: 'ground/ground-normal.png', exportPath: 'assets/ground/ground-normal.png', category: 'ground', role: 'ground_normal' },
  { sourcePath: 'ground/ground_heightMap.png', exportPath: 'assets/ground/ground_heightMap.png', category: 'ground', role: 'ground_heightmap' },
];

const CORE_QUEST_OBJECTS: AssetDef[] = [
  { sourcePath: 'quest-objects/chest.glb', exportPath: 'assets/quest-objects/chest.glb', category: 'quest_object', role: 'chest' },
  { sourcePath: 'quest-objects/quest_marker.glb', exportPath: 'assets/quest-objects/quest_marker.glb', category: 'quest_object', role: 'quest_marker' },
  { sourcePath: 'quest-objects/collectible_gem.glb', exportPath: 'assets/quest-objects/collectible_gem.glb', category: 'quest_object', role: 'collectible_gem' },
  { sourcePath: 'quest-objects/water_bottle.glb', exportPath: 'assets/quest-objects/water_bottle.glb', category: 'quest_object', role: 'water_bottle' },
];

const CORE_AUDIO: AssetDef[] = [
  { sourcePath: 'freesound/ambient/medieval_village_atmosphere_wav_578072.mp3', exportPath: 'assets/audio/ambient/medieval_village.mp3', category: 'audio', role: 'ambient_medieval' },
  { sourcePath: 'freesound/ambient/soft_wind_459977.mp3', exportPath: 'assets/audio/ambient/wind.mp3', category: 'audio', role: 'ambient_wind' },
  { sourcePath: 'freesound/footstep/footstep_on_stone_197778.mp3', exportPath: 'assets/audio/footstep/stone.mp3', category: 'audio', role: 'footstep_stone' },
  { sourcePath: 'freesound/interact/door_creak_wav_219499.mp3', exportPath: 'assets/audio/interact/door.mp3', category: 'audio', role: 'interact_door' },
  { sourcePath: 'freesound/interact/open_button_2_264447.mp3', exportPath: 'assets/audio/interact/button.mp3', category: 'audio', role: 'interact_button' },
];

// ─────────────────────────────────────────────
// KayKit buildings (GLTF + BIN pairs)
// ─────────────────────────────────────────────

function getKayKitBuildings(): AssetDef[] {
  const buildings = [
    { file: 'building_home_A_blue', role: 'house' },
    { file: 'building_blacksmith_blue', role: 'blacksmith' },
    { file: 'building_church_blue', role: 'church' },
    { file: 'building_barracks_blue', role: 'barracks' },
    { file: 'building_castle_blue', role: 'castle' },
  ];

  const defs: AssetDef[] = [];
  for (const b of buildings) {
    defs.push({
      sourcePath: `kaykit/models/medieval-buildings/${b.file}.gltf`,
      exportPath: `assets/buildings/${b.file}.gltf`,
      category: 'building',
      role: b.role,
    });
    defs.push({
      sourcePath: `kaykit/models/medieval-buildings/${b.file}.bin`,
      exportPath: `assets/buildings/${b.file}.bin`,
      category: 'building',
      role: `${b.role}_bin`,
    });
  }

  // All KayKit building GTLFs reference this shared texture by relative URI —
  // it must be in the same directory as the .gltf files.
  defs.push({
    sourcePath: 'kaykit/models/medieval-buildings/hexagons_medieval.png',
    exportPath: 'assets/buildings/hexagons_medieval.png',
    category: 'building',
    role: 'building_texture',
  });

  return defs;
}

// ─────────────────────────────────────────────
// Resolve base path to client/public/assets/
// ─────────────────────────────────────────────

function getAssetsBasePath(): string {
  // Use the known absolute path to the assets directory
  // In development, this is relative to the project root
  // In production, this might need to be configured differently
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  let projectRoot: string;
  
  // Check if we're in development (file:// URL) or production
  if (process.env.NODE_ENV === 'production') {
    // In production, use the environment variable or default path
    projectRoot = process.env.INSIMUL_ROOT || path.resolve(thisDir, '..', '..', '..');
  } else {
    // In development, walk up from this file
    // This file: server/services/game-export/asset-bundler.ts
    // Project root: ../../../../
    projectRoot = path.resolve(thisDir, '..', '..', '..');
  }
  
  const assetsPath = path.join(projectRoot, 'client', 'public', 'assets');
  console.log(`[AssetBundler] Using assets path: ${assetsPath}`);
  console.log(`[AssetBundler] Project root: ${projectRoot}`);
  console.log(`[AssetBundler] This dir: ${thisDir}`);
  
  return assetsPath;
}

// ─────────────────────────────────────────────
// Bundle core assets
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Bundle assets from a specific collection
// ─────────────────────────────────────────────

/**
 * Bundle assets from a specific asset collection.
 *
 * Uses the collection's model maps (buildingModels, characterModels, etc.)
 * to resolve role → asset record → file on disk. Preserves directory
 * structure so GLTF relative references (companion .bin + textures/) work.
 *
 * Returns binary buffers ready to be added to a ZIP archive.
 */
export async function bundleAssetsFromCollection(collectionId: string): Promise<BundleResult> {
  const { storage } = await import(/* webpackIgnore: true */ new URL('../../db/storage.js', import.meta.url).href as any);

  const collection = await storage.getAssetCollection(collectionId);
  if (!collection) {
    throw new Error(`Asset collection not found: ${collectionId}`);
  }

  // ── Build role → { assetId, category } lookup from all model maps ──
  type RoleEntry = { role: string; assetId: string; category: BundledAsset['category'] };
  const roleEntries: RoleEntry[] = [];

  function addFromMap(map: Record<string, string> | null | undefined, category: BundledAsset['category']) {
    if (!map) return;
    for (const [role, assetId] of Object.entries(map)) {
      if (assetId) roleEntries.push({ role, assetId, category });
    }
  }

  addFromMap(collection.buildingModels as Record<string, string>, 'building');
  addFromMap(collection.natureModels as Record<string, string>, 'nature' as any);
  addFromMap((collection as any).objectModels as Record<string, string>, 'prop');
  addFromMap(collection.characterModels as Record<string, string>, 'character');
  addFromMap((collection as any).playerModels as Record<string, string>, 'character');
  addFromMap((collection as any).questObjectModels as Record<string, string>, 'quest_object');
  addFromMap((collection as any).audioAssets as Record<string, string>, 'audio');

  // Named texture IDs get bundled under the 'ground' category with well-known roles
  const namedTextureEntries: Array<{ role: string; assetId: string }> = [];
  if (collection.groundTextureId) namedTextureEntries.push({ role: 'ground_diffuse', assetId: collection.groundTextureId });
  if (collection.roadTextureId)   namedTextureEntries.push({ role: 'ground_road',    assetId: collection.roadTextureId });
  if (collection.wallTextureId)   namedTextureEntries.push({ role: 'building_texture', assetId: collection.wallTextureId });
  if (collection.roofTextureId)   namedTextureEntries.push({ role: 'roof_texture',   assetId: collection.roofTextureId });

  if (roleEntries.length === 0 && namedTextureEntries.length === 0) {
    console.warn(`[AssetBundler] Collection "${collection.name}" has no model map entries, falling back to core assets`);
    return bundleCoreAssets();
  }

  // ── Fetch all referenced VisualAsset records ──
  const allAssetIds = new Set<string>([
    ...roleEntries.map(e => e.assetId),
    ...namedTextureEntries.map(e => e.assetId),
  ]);
  const assetRecords: any[] = await storage.getVisualAssetsByIds(Array.from(allAssetIds));
  const assetById = new Map<string, any>(assetRecords.map((a: any) => [a.id, a]));

  const basePath = getAssetsBasePath();
  const bundledAssets: BundledAsset[] = [];
  const manifest: AssetManifestEntry[] = [];
  let totalSizeBytes = 0;

  // Track which source paths have already been bundled to avoid duplicates
  const bundledSourcePaths = new Set<string>();

  /**
   * Bundle a single file and add it to the archive.
   * Returns the added buffer length, or 0 if skipped.
   */
  function bundleFile(
    sourcePath: string,
    exportPath: string,
    category: BundledAsset['category'],
    role: string,
    addToManifest = true
  ): number {
    if (bundledSourcePaths.has(sourcePath)) return 0;
    const fullPath = path.join(basePath, sourcePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[AssetBundler] Missing: ${sourcePath}`);
      return 0;
    }
    const buffer = fs.readFileSync(fullPath);
    bundledAssets.push({ exportPath, buffer, category, role });
    if (addToManifest) {
      manifest.push({ exportPath, category, role, fileSize: buffer.length });
    }
    totalSizeBytes += buffer.length;
    bundledSourcePaths.add(sourcePath);
    return buffer.length;
  }

  /**
   * For GLTF files, also bundle the companion .bin and entire textures/ directory.
   * The export preserves the source directory structure so relative paths work.
   */
  function bundleGltfDirectory(gltfSourcePath: string, gltfExportPath: string, category: BundledAsset['category'], role: string) {
    const sourceDir = path.dirname(gltfSourcePath);
    const exportDir = path.dirname(gltfExportPath);

    // Companion .bin (same base name)
    const binSource = gltfSourcePath.replace(/\.gltf$/i, '.bin');
    const binExport = gltfExportPath.replace(/\.gltf$/i, '.bin');
    bundleFile(binSource, binExport, category, `${role}_bin`, false);

    // textures/ subdirectory
    const texturesSourceDir = path.join(path.dirname(path.join(basePath, gltfSourcePath)), 'textures');
    if (fs.existsSync(texturesSourceDir)) {
      for (const texFile of fs.readdirSync(texturesSourceDir)) {
        const texSource = `${sourceDir}/textures/${texFile}`;
        const texExport = `${exportDir}/textures/${texFile}`;
        bundleFile(texSource, texExport, category, `${role}_tex_${texFile}`, false);
      }
    }
  }

  // ── Process model map entries ──
  for (const { role, assetId, category } of roleEntries) {
    const asset = assetById.get(assetId);
    if (!asset?.filePath) {
      console.warn(`[AssetBundler] Asset ${assetId} (role: ${role}) not found or has no filePath`);
      continue;
    }

    const dbFilePath = asset.filePath as string;
    // DB filePath already includes 'assets/' prefix (e.g. 'assets/sketchfab/models/.../scene.gltf')
    // but basePath already points to client/public/assets/ — strip prefix for disk reads.
    const sourcePath = dbFilePath.replace(/^assets\//, '');
    const ext = sourcePath.split('.').pop()?.toLowerCase() || '';
    // Export path keeps the original format so the in-game fetch resolves correctly.
    const exportPath = dbFilePath.startsWith('assets/') ? dbFilePath : `assets/${dbFilePath}`;

    const added = bundleFile(sourcePath, exportPath, category, role);
    if (added > 0 && ext === 'gltf') {
      bundleGltfDirectory(sourcePath, exportPath, category, role);
    }
  }

  // ── Process named texture entries ──
  for (const { role, assetId } of namedTextureEntries) {
    const asset = assetById.get(assetId);
    if (!asset?.filePath) continue;

    const dbFilePath = asset.filePath as string;
    const sourcePath = dbFilePath.replace(/^assets\//, '');
    const exportPath = dbFilePath.startsWith('assets/') ? dbFilePath : `assets/${dbFilePath}`;
    bundleFile(sourcePath, exportPath, 'ground', role);
  }

  console.log(`[AssetBundler] Bundled ${bundledAssets.length} files from collection "${collection.name}" (${roleEntries.length} roles)`);

  if (bundledAssets.length === 0) {
    console.warn('[AssetBundler] No assets bundled from collection, falling back to core assets');
    return bundleCoreAssets();
  }

  // ── Always supplement with core ground + conditionally supplement characters/audio/quests ──
  // CORE_GROUND must always be included: createGround() hardcodes /assets/ground/ground_heightMap.png
  // for terrain generation regardless of the collection's ground texture override.
  const hasCharacters = bundledAssets.some(a => a.category === 'character');
  const hasQuestObjects = bundledAssets.some(a => a.category === 'quest_object');
  const hasAudio = bundledAssets.some(a => a.category === 'audio');

  const coreSupplements: AssetDef[] = [
    ...CORE_GROUND,
    ...(!hasCharacters ? CORE_CHARACTERS : []),
    ...(!hasQuestObjects ? CORE_QUEST_OBJECTS : []),
    ...(!hasAudio ? CORE_AUDIO : []),
  ];
  for (const def of coreSupplements) {
    const fullPath = path.join(basePath, def.sourcePath);
    if (!fs.existsSync(fullPath)) continue;
    if (bundledSourcePaths.has(def.sourcePath)) continue;
    const buffer = fs.readFileSync(fullPath);
    bundledAssets.push({ exportPath: def.exportPath, buffer, category: def.category, role: def.role });
    manifest.push({ exportPath: def.exportPath, category: def.category, role: def.role, fileSize: buffer.length });
    totalSizeBytes += buffer.length;
    bundledSourcePaths.add(def.sourcePath);
  }
  console.log(`[AssetBundler] Supplemented with core ground + (chars=${!hasCharacters}, quests=${!hasQuestObjects}, audio=${!hasAudio})`);

  return { assets: bundledAssets, manifest, totalSizeBytes, fileCount: bundledAssets.length };
}

// ─────────────────────────────────────────────
// Bundle all core (Base Collection) assets from disk.
// Returns binary buffers ready to be added to a ZIP archive.
// ─────────────────────────────────────────────

export type TargetEngine = 'babylon' | 'unreal' | 'unity' | 'godot';

export async function bundleCoreAssets(engine: TargetEngine = 'babylon'): Promise<BundleResult> {
  const basePath = getAssetsBasePath();
  console.log(`[AssetBundler] bundleCoreAssets: basePath=${basePath}, engine=${engine}`);

  // Core character assets use .babylon format which is Babylon.js-only.
  // For other engines, skip them — users must supply GLB/GLTF character models
  // via a world asset collection.
  const includeCharacters = engine === 'babylon';
  if (!includeCharacters) {
    console.warn(
      `[AssetBundler] Skipping core character assets for engine="${engine}" — ` +
      `.babylon format is not importable by ${engine}. ` +
      'Assign a world asset collection with GLB character models instead.'
    );
  }

  const allDefs: AssetDef[] = [
    ...(includeCharacters ? CORE_CHARACTERS : []),
    ...CORE_GROUND,
    ...CORE_QUEST_OBJECTS,
    ...CORE_AUDIO,
    ...getKayKitBuildings(),
  ];
  
  console.log(`[AssetBundler] bundleCoreAssets: processing ${allDefs.length} asset definitions`);

  const assets: BundledAsset[] = [];
  const manifest: AssetManifestEntry[] = [];
  let totalSizeBytes = 0;

  for (const def of allDefs) {
    const fullPath = path.join(basePath, def.sourcePath);
    console.log(`[AssetBundler] Checking: ${fullPath}`);
    try {
      if (!fs.existsSync(fullPath)) {
        console.warn(`[AssetBundler] Skipping missing file: ${def.sourcePath} (full path: ${fullPath})`);
        continue;
      }

      const buffer = fs.readFileSync(fullPath);
      assets.push({
        exportPath: def.exportPath,
        buffer,
        category: def.category,
        role: def.role,
      });
      manifest.push({
        exportPath: def.exportPath,
        category: def.category,
        role: def.role,
        fileSize: buffer.length,
      });
      totalSizeBytes += buffer.length;
      console.log(`[AssetBundler] Bundled: ${def.sourcePath} (${buffer.length} bytes)`);
    } catch (err) {
      console.warn(`[AssetBundler] Failed to read ${def.sourcePath}:`, (err as Error).message);
    }
  }

  console.log(`[AssetBundler] Bundled ${assets.length}/${allDefs.length} core assets, total ${Math.round(totalSizeBytes / 1024 / 1024)}MB`);

  return { assets, manifest, totalSizeBytes, fileCount: assets.length };
}

/**
 * Generate an asset-manifest.json that the exported game can use
 * to know which assets are available and how to load them.
 */
export function generateAssetManifestJson(manifest: AssetManifestEntry[]): string {
  const byCategory: Record<string, AssetManifestEntry[]> = {};
  for (const entry of manifest) {
    if (!byCategory[entry.category]) byCategory[entry.category] = [];
    byCategory[entry.category].push(entry);
  }

  return JSON.stringify({
    version: '1.0.0',
    description: 'Insimul Base Collection — bundled assets',
    totalFiles: manifest.length,
    totalSizeBytes: manifest.reduce((sum, e) => sum + e.fileSize, 0),
    categories: byCategory,
    assets: manifest,
  }, null, 2);
}
