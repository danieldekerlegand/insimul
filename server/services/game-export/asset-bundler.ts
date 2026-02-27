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
  { sourcePath: 'characters/generic/player_default.glb', exportPath: 'assets/characters/player_default.glb', category: 'character', role: 'player_default' },
  { sourcePath: 'characters/generic/player_male.glb', exportPath: 'assets/characters/player_male.glb', category: 'character', role: 'player_male' },
  { sourcePath: 'characters/generic/player_female.glb', exportPath: 'assets/characters/player_female.glb', category: 'character', role: 'player_female' },
  { sourcePath: 'characters/generic/npc_guard.glb', exportPath: 'assets/characters/npc_guard.glb', category: 'character', role: 'npc_guard' },
  { sourcePath: 'characters/generic/npc_merchant.glb', exportPath: 'assets/characters/npc_merchant.glb', category: 'character', role: 'npc_merchant' },
  { sourcePath: 'characters/generic/npc_civilian_male.glb', exportPath: 'assets/characters/npc_civilian_male.glb', category: 'character', role: 'npc_civilian_male' },
  { sourcePath: 'characters/generic/npc_civilian_female.glb', exportPath: 'assets/characters/npc_civilian_female.glb', category: 'character', role: 'npc_civilian_female' },
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
  return defs;
}

// ─────────────────────────────────────────────
// Resolve base path to client/public/assets/
// ─────────────────────────────────────────────

function getAssetsBasePath(): string {
  // Walk up from this file to the project root
  // This file: server/services/game-export/asset-bundler.ts
  // Project root: ../../../../
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  const projectRoot = path.resolve(thisDir, '..', '..', '..');
  return path.join(projectRoot, 'client', 'public', 'assets');
}

// ─────────────────────────────────────────────
// Bundle core assets
// ─────────────────────────────────────────────

/**
 * Bundle all core (Base Collection) assets from disk.
 * Returns binary buffers ready to be added to a ZIP archive.
 */
export async function bundleCoreAssets(): Promise<BundleResult> {
  const basePath = getAssetsBasePath();
  const allDefs: AssetDef[] = [
    ...CORE_CHARACTERS,
    ...CORE_GROUND,
    ...CORE_QUEST_OBJECTS,
    ...CORE_AUDIO,
    ...getKayKitBuildings(),
  ];

  const assets: BundledAsset[] = [];
  const manifest: AssetManifestEntry[] = [];
  let totalSizeBytes = 0;

  for (const def of allDefs) {
    const fullPath = path.join(basePath, def.sourcePath);
    try {
      if (!fs.existsSync(fullPath)) {
        console.warn(`[AssetBundler] Skipping missing file: ${def.sourcePath}`);
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
