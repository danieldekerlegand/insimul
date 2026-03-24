/**
 * Unreal Asset Converter
 *
 * Routes bundled assets into Unreal-appropriate paths and formats:
 *   - GLB files with skeletal animations → converted to FBX → Content/Characters/
 *   - Static GLB/GLTF files → Content/Models/
 *   - Audio files → Content/Audio/
 *   - Textures/ground → Content/Textures/
 *
 * Integrates the GLB-to-FBX converter for animated character models.
 */

import type { BundledAsset } from '../asset-bundler';
import { convertGlbBufferToFbx } from './glb-to-fbx';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ConvertedAsset {
  exportPath: string;
  buffer: Buffer;
  category: BundledAsset['category'];
  role: string;
  /** Whether this asset was converted from GLB to FBX */
  convertedToFbx: boolean;
}

export interface AssetConversionResult {
  assets: ConvertedAsset[];
  stats: {
    totalAssets: number;
    convertedToFbx: number;
    staticModels: number;
    textures: number;
    audio: number;
  };
}

// ─────────────────────────────────────────────
// GLB animation detection
// ─────────────────────────────────────────────

/** GLB magic number: "glTF" in little-endian */
const GLB_MAGIC = 0x46546c67;

/**
 * Check if a GLB buffer contains skeletal animations by reading
 * the embedded JSON chunk for skins or animations arrays.
 */
export function glbHasSkeletalAnimation(buffer: Buffer): boolean {
  if (buffer.length < 20) return false;

  // Verify GLB magic
  const magic = buffer.readUInt32LE(0);
  if (magic !== GLB_MAGIC) return false;

  // Read JSON chunk length (starts at offset 12)
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);

  // Chunk type 0x4E4F534A = "JSON"
  if (chunkType !== 0x4e4f534a) return false;

  try {
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const gltf = JSON.parse(jsonStr);
    const hasSkins = Array.isArray(gltf.skins) && gltf.skins.length > 0;
    const hasAnimations = Array.isArray(gltf.animations) && gltf.animations.length > 0;
    return hasSkins || hasAnimations;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Path routing
// ─────────────────────────────────────────────

function getUnrealContentPath(asset: BundledAsset, isAnimated: boolean): string {
  const filename = asset.exportPath.split('/').pop() || 'asset';

  switch (asset.category) {
    case 'character':
      return `Content/Characters/${filename}`;
    case 'building':
    case 'container':
    case 'marker':
    case 'prop':
      return `Content/Models/${filename}`;
    case 'ground':
      return `Content/Textures/${filename}`;
    case 'audio':
      return `Content/Audio/${filename}`;
    default:
      return isAnimated
        ? `Content/Characters/${filename}`
        : `Content/Models/${filename}`;
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Convert bundled assets for Unreal Engine import.
 *
 * - Detects animated GLB files and converts them to FBX
 * - Routes all assets to Unreal Content/ subdirectories
 * - Preserves non-GLB assets as-is (textures, audio, GLTF+BIN pairs)
 */
export function convertAssetsForUnreal(assets: BundledAsset[]): AssetConversionResult {
  const converted: ConvertedAsset[] = [];
  let convertedToFbx = 0;
  let staticModels = 0;
  let textures = 0;
  let audio = 0;

  for (const asset of assets) {
    const ext = asset.exportPath.split('.').pop()?.toLowerCase() || '';
    const isGlb = ext === 'glb';
    let isAnimated = false;

    if (isGlb) {
      isAnimated = glbHasSkeletalAnimation(asset.buffer);
    }

    if (isGlb && isAnimated) {
      // Convert animated GLB → FBX for skeletal mesh import
      try {
        const { fbxBuffer } = convertGlbBufferToFbx(asset.buffer, {
          scaleFactor: 1.0,
          includeAnimations: true,
          includeSkeleton: true,
        });
        const fbxFilename = (asset.exportPath.split('/').pop() || 'asset')
          .replace(/\.glb$/i, '.fbx');
        converted.push({
          exportPath: `Content/Characters/${fbxFilename}`,
          buffer: fbxBuffer,
          category: asset.category,
          role: asset.role,
          convertedToFbx: true,
        });
        convertedToFbx++;
        console.log(`[AssetConverter] GLB→FBX: ${asset.exportPath} → Content/Characters/${fbxFilename}`);
      } catch (err) {
        // Fallback: keep as GLB if conversion fails
        console.warn(`[AssetConverter] FBX conversion failed for ${asset.exportPath}, keeping GLB:`, (err as Error).message);
        const contentPath = getUnrealContentPath(asset, false);
        converted.push({
          exportPath: contentPath,
          buffer: asset.buffer,
          category: asset.category,
          role: asset.role,
          convertedToFbx: false,
        });
        staticModels++;
      }
    } else if (isGlb || ext === 'gltf' || ext === 'bin') {
      // Static model — route to Content/Models/ (or category-specific path)
      const contentPath = getUnrealContentPath(asset, false);
      converted.push({
        exportPath: contentPath,
        buffer: asset.buffer,
        category: asset.category,
        role: asset.role,
        convertedToFbx: false,
      });
      staticModels++;
    } else if (['jpg', 'jpeg', 'png', 'tga', 'bmp'].includes(ext)) {
      textures++;
      converted.push({
        exportPath: getUnrealContentPath(asset, false),
        buffer: asset.buffer,
        category: asset.category,
        role: asset.role,
        convertedToFbx: false,
      });
    } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
      audio++;
      converted.push({
        exportPath: getUnrealContentPath(asset, false),
        buffer: asset.buffer,
        category: asset.category,
        role: asset.role,
        convertedToFbx: false,
      });
    } else {
      // Pass through anything else (e.g. .babylon legacy files)
      converted.push({
        exportPath: getUnrealContentPath(asset, false),
        buffer: asset.buffer,
        category: asset.category,
        role: asset.role,
        convertedToFbx: false,
      });
    }
  }

  return {
    assets: converted,
    stats: {
      totalAssets: converted.length,
      convertedToFbx,
      staticModels,
      textures,
      audio,
    },
  };
}
