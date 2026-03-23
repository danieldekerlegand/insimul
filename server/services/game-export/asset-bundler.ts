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
 *   - Containers, markers, and props (GLB/GLTF)
 *   - Audio files (ambient, footstep, interact)
 *
 * In the future, this can be extended to pull world-specific assets
 * from the DB-backed asset collection system.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { KAYKIT_BUILDINGS_BASE } from '@shared/asset-paths';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BundledAsset {
  /** Relative path inside the export (e.g. "assets/characters/player_default.glb") */
  exportPath: string;
  /** Binary content */
  buffer: Buffer;
  /** Semantic category */
  category: 'character' | 'building' | 'ground' | 'nature' | 'container' | 'marker' | 'audio' | 'prop';
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
  // PLAYER_MODEL_URL and NPC_MODEL_URL constants in shared/asset-paths.ts
  { sourcePath: 'models/characters/legacy/Vincent-frontFacing.babylon', exportPath: 'assets/player/Vincent-frontFacing.babylon', category: 'character', role: 'player_default' },
  { sourcePath: 'models/characters/legacy/Vincent_texture_image.jpg', exportPath: 'assets/player/Vincent_texture_image.jpg', category: 'character', role: 'player_texture' },
  { sourcePath: 'models/characters/legacy/starterAvatars.babylon', exportPath: 'assets/npc/starterAvatars.babylon', category: 'character', role: 'npc_default' },
];

const CORE_GROUND: AssetDef[] = [
  { sourcePath: 'textures/environment/ground.jpg', exportPath: 'assets/ground/ground.jpg', category: 'ground', role: 'ground_diffuse' },
  { sourcePath: 'textures/environment/ground-normal.png', exportPath: 'assets/ground/ground-normal.png', category: 'ground', role: 'ground_normal' },
  { sourcePath: 'textures/environment/ground_heightMap.png', exportPath: 'assets/ground/ground_heightMap.png', category: 'ground', role: 'ground_heightmap' },
];

const CORE_CONTAINERS: AssetDef[] = [
  { sourcePath: 'models/containers/chest.glb', exportPath: 'assets/containers/chest.glb', category: 'container', role: 'chest' },
  { sourcePath: 'models/containers/treasure_chest.gltf', exportPath: 'assets/containers/treasure_chest.gltf', category: 'container', role: 'treasure_chest' },
];

const CORE_MARKERS: AssetDef[] = [
  { sourcePath: 'models/markers/quest_marker.glb', exportPath: 'assets/markers/quest_marker.glb', category: 'marker', role: 'quest_marker' },
  { sourcePath: 'models/markers/lantern_marker.gltf', exportPath: 'assets/markers/lantern_marker.gltf', category: 'marker', role: 'lantern_marker' },
];

const CORE_QUEST_PROPS: AssetDef[] = [
  { sourcePath: 'models/props/collectible_gem.glb', exportPath: 'assets/props/collectible_gem.glb', category: 'prop', role: 'collectible_gem' },
  { sourcePath: 'models/props/water_bottle.glb', exportPath: 'assets/props/water_bottle.glb', category: 'prop', role: 'water_bottle' },
  { sourcePath: 'models/props/avocado_collectible.glb', exportPath: 'assets/props/avocado_collectible.glb', category: 'prop', role: 'avocado_collectible' },
  { sourcePath: 'models/props/brass_lamp.gltf', exportPath: 'assets/props/brass_lamp.gltf', category: 'prop', role: 'brass_lamp' },
];

const CORE_AUDIO: AssetDef[] = [
  { sourcePath: 'audio/ambient/medieval_village_atmosphere_wav_578072.mp3', exportPath: 'assets/audio/ambient/medieval_village.mp3', category: 'audio', role: 'ambient_medieval' },
  { sourcePath: 'audio/ambient/soft_wind_459977.mp3', exportPath: 'assets/audio/ambient/wind.mp3', category: 'audio', role: 'ambient_wind' },
  { sourcePath: 'audio/footstep/footstep_on_stone_197778.mp3', exportPath: 'assets/audio/footstep/stone.mp3', category: 'audio', role: 'footstep_stone' },
  { sourcePath: 'audio/effects/door_creak_wav_219499.mp3', exportPath: 'assets/audio/interact/door.mp3', category: 'audio', role: 'interact_door' },
  { sourcePath: 'audio/effects/open_button_2_264447.mp3', exportPath: 'assets/audio/interact/button.mp3', category: 'audio', role: 'interact_button' },
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
      sourcePath: `${KAYKIT_BUILDINGS_BASE.replace('assets/', '')}/${b.file}.gltf`,
      exportPath: `assets/buildings/${b.file}.gltf`,
      category: 'building',
      role: b.role,
    });
    defs.push({
      sourcePath: `${KAYKIT_BUILDINGS_BASE.replace('assets/', '')}/${b.file}.bin`,
      exportPath: `assets/buildings/${b.file}.bin`,
      category: 'building',
      role: `${b.role}_bin`,
    });
  }

  // All KayKit building GTLFs reference this shared texture by relative URI —
  // it must be in the same directory as the .gltf files.
  defs.push({
    sourcePath: `${KAYKIT_BUILDINGS_BASE.replace('assets/', '')}/hexagons_medieval.png`,
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
  addFromMap((collection as any).questObjectModels as Record<string, string>, 'container');
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
  const hasContainers = bundledAssets.some(a => a.category === 'container');
  const hasMarkers = bundledAssets.some(a => a.category === 'marker');
  const hasProps = bundledAssets.some(a => a.category === 'prop');
  const hasAudio = bundledAssets.some(a => a.category === 'audio');

  const coreSupplements: AssetDef[] = [
    ...CORE_GROUND,
    ...(!hasCharacters ? CORE_CHARACTERS : []),
    ...(!hasContainers ? CORE_CONTAINERS : []),
    ...(!hasMarkers ? CORE_MARKERS : []),
    ...(!hasProps ? CORE_QUEST_PROPS : []),
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
  console.log(`[AssetBundler] Supplemented with core ground + (chars=${!hasCharacters}, containers=${!hasContainers}, markers=${!hasMarkers}, props=${!hasProps}, audio=${!hasAudio})`);

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
    ...CORE_CONTAINERS,
    ...CORE_MARKERS,
    ...CORE_QUEST_PROPS,
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

      // For .gltf files, also bundle companion .bin files referenced in the buffers array
      if (def.sourcePath.endsWith('.gltf')) {
        try {
          const gltfJson = JSON.parse(buffer.toString('utf8'));
          let gltfModified = false;
          for (const buf of gltfJson.buffers || []) {
            if (buf.uri && !buf.uri.startsWith('data:')) {
              // Search for .bin: 1) next to the .gltf, 2) in polyhaven source dirs, 3) recursive search
              const binName = buf.uri;
              const binNextToGltf = path.join(path.dirname(fullPath), binName);
              let binSourcePath: string | null = null;

              if (fs.existsSync(binNextToGltf)) {
                binSourcePath = binNextToGltf;
              } else {
                // Search polyhaven directories for the .bin file
                const searchDirs = [
                  path.join(basePath, 'models', 'props', 'polyhaven'),
                  path.join(basePath, 'models', 'furniture', 'polyhaven'),
                  path.join(basePath, 'models', 'containers'),
                  path.join(basePath, 'models', 'markers'),
                ];
                for (const searchDir of searchDirs) {
                  if (!fs.existsSync(searchDir)) continue;
                  // Recursive find
                  const findBin = (dir: string): string | null => {
                    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                      if (entry.isDirectory()) {
                        const found = findBin(path.join(dir, entry.name));
                        if (found) return found;
                      } else if (entry.name === binName) {
                        return path.join(dir, entry.name);
                      }
                    }
                    return null;
                  };
                  const found = findBin(searchDir);
                  if (found) { binSourcePath = found; break; }
                }
              }

              if (binSourcePath) {
                const binBuffer = fs.readFileSync(binSourcePath);
                const binExportPath = path.join(path.dirname(def.exportPath), binName);
                assets.push({ exportPath: binExportPath, buffer: binBuffer, category: def.category, role: def.role + '_bin' });
                totalSizeBytes += binBuffer.length;
                console.log(`[AssetBundler] Bundled companion: ${binName} (${binBuffer.length} bytes)`);
              } else {
                // Last resort: embed the buffer as base64 data URI in the .gltf itself
                console.warn(`[AssetBundler] .bin not found for ${def.sourcePath}: ${binName} — searching failed, embedding would require the file to exist`);
              }
            }
          }
          // Also bundle companion textures referenced in the images array
          // Downscale references from 8k/4k to 1k for smaller export size
          for (const img of gltfJson.images || []) {
            if (img.uri && !img.uri.startsWith('data:')) {
              const uri1k = img.uri.replace(/_\d+k\.jpg$/, '_1k.jpg');
              const origFilename = path.basename(img.uri);
              const filename1k = path.basename(uri1k);

              // Search for texture: next to gltf, then in polyhaven subdirs
              const searchLocations = [
                // Next to the .gltf file
                path.join(path.dirname(fullPath), uri1k),
                path.join(path.dirname(fullPath), img.uri),
              ];

              // Also search polyhaven directories recursively for the texture file
              const polyhavenDirs = [
                path.join(basePath, 'models', 'props', 'polyhaven'),
                path.join(basePath, 'models', 'furniture', 'polyhaven'),
              ];
              const findTexture = (dir: string, name: string): string | null => {
                if (!fs.existsSync(dir)) return null;
                for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                  if (entry.isDirectory()) {
                    const found = findTexture(path.join(dir, entry.name), name);
                    if (found) return found;
                  } else if (entry.name === name) {
                    return path.join(dir, entry.name);
                  }
                }
                return null;
              };

              let texSource: string | null = null;
              // Try direct paths first
              for (const loc of searchLocations) {
                if (fs.existsSync(loc)) { texSource = loc; break; }
              }
              // If not found, search polyhaven dirs for 1k version first, then original
              if (!texSource) {
                for (const phDir of polyhavenDirs) {
                  texSource = findTexture(phDir, filename1k);
                  if (texSource) break;
                  texSource = findTexture(phDir, origFilename);
                  if (texSource) break;
                }
              }

              if (texSource) {
                const texBuffer = fs.readFileSync(texSource);
                const usedFilename = path.basename(texSource);
                // Determine the URI to use in the gltf (preserve textures/ subdir if present)
                const texSubdir = img.uri.includes('/') ? img.uri.substring(0, img.uri.lastIndexOf('/') + 1) : '';
                const usedUri = texSubdir + usedFilename;
                const texExportPath = path.join(path.dirname(def.exportPath), usedUri);
                assets.push({ exportPath: texExportPath, buffer: texBuffer, category: def.category, role: def.role + '_tex' });
                totalSizeBytes += texBuffer.length;
                // Rewrite the gltf to reference the found version
                if (usedUri !== img.uri) {
                  img.uri = usedUri;
                  gltfModified = true;
                }
                console.log(`[AssetBundler] Bundled texture: ${usedUri} (${texBuffer.length} bytes)`);
              } else {
                console.warn(`[AssetBundler] Missing texture for ${def.sourcePath}: ${img.uri}`);
              }
            }
          }
          // If any image URIs were rewritten, update the gltf buffer in the asset list
          const updatedGltf = JSON.stringify(gltfJson);
          const idx = assets.findIndex(a => a.exportPath === def.exportPath);
          if (idx >= 0) assets[idx].buffer = Buffer.from(updatedGltf, 'utf8');
        } catch { /* not valid JSON or no buffers — skip */ }
      }
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
