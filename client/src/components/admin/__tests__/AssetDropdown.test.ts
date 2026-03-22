import { describe, it, expect } from 'vitest';
import type { VisualAsset } from '@shared/schema';

/**
 * Tests for the AssetDropdown component's filtering logic.
 *
 * The component itself relies on Radix UI Select, so we test the pure
 * filtering functions that drive which assets appear in the dropdown.
 */

// Mirror the filter helpers from AssetDropdown.tsx
function isModelAsset(a: Pick<VisualAsset, 'assetType' | 'filePath' | 'mimeType'>): boolean {
  const type = a.assetType || '';
  const path = (a.filePath || '').toLowerCase();
  return (
    type.startsWith('model_') ||
    a.mimeType === 'model/gltf-binary' ||
    path.endsWith('.glb') ||
    path.endsWith('.gltf')
  );
}

function isTextureAsset(a: Pick<VisualAsset, 'assetType' | 'filePath'>): boolean {
  const type = a.assetType || '';
  const path = (a.filePath || '').toLowerCase();
  return (
    type.startsWith('texture_') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.webp')
  );
}

type AssetFilter = 'model' | 'texture' | 'all';

function filterAssets<T extends Pick<VisualAsset, 'assetType' | 'filePath' | 'mimeType'>>(
  assets: T[],
  filter: AssetFilter,
): T[] {
  if (filter === 'model') return assets.filter(isModelAsset);
  if (filter === 'texture') return assets.filter(isTextureAsset);
  return assets;
}

// Test data
const modelGlb = { id: '1', name: 'Character', assetType: 'model_character', filePath: 'char.glb', mimeType: 'model/gltf-binary' };
const modelGltf = { id: '2', name: 'Tree', assetType: 'other', filePath: 'tree.gltf', mimeType: 'application/octet-stream' };
const texturePng = { id: '3', name: 'Cobblestone', assetType: 'texture_ground', filePath: 'cobblestone.png', mimeType: 'image/png' };
const textureJpg = { id: '4', name: 'Wall', assetType: 'other', filePath: 'wall.jpg', mimeType: 'image/jpeg' };
const textureWebp = { id: '5', name: 'Roof', assetType: 'other', filePath: 'roof.webp', mimeType: 'image/webp' };
const audioAsset = { id: '6', name: 'Ambient', assetType: 'audio_sfx', filePath: 'ambient.mp3', mimeType: 'audio/mpeg' };

const allAssets = [modelGlb, modelGltf, texturePng, textureJpg, textureWebp, audioAsset];

describe('AssetDropdown filter logic', () => {
  describe('isModelAsset', () => {
    it('matches assets with model_ assetType prefix', () => {
      expect(isModelAsset(modelGlb)).toBe(true);
    });

    it('matches .glb files', () => {
      expect(isModelAsset({ assetType: '', filePath: 'building.glb', mimeType: '' })).toBe(true);
    });

    it('matches .gltf files', () => {
      expect(isModelAsset(modelGltf)).toBe(true);
    });

    it('matches model/gltf-binary mime type', () => {
      expect(isModelAsset({ assetType: '', filePath: 'unknown', mimeType: 'model/gltf-binary' })).toBe(true);
    });

    it('does not match texture assets', () => {
      expect(isModelAsset(texturePng)).toBe(false);
    });

    it('does not match audio assets', () => {
      expect(isModelAsset(audioAsset)).toBe(false);
    });
  });

  describe('isTextureAsset', () => {
    it('matches assets with texture_ assetType prefix', () => {
      expect(isTextureAsset(texturePng)).toBe(true);
    });

    it('matches .png files', () => {
      expect(isTextureAsset({ assetType: '', filePath: 'tile.png' })).toBe(true);
    });

    it('matches .jpg files', () => {
      expect(isTextureAsset(textureJpg)).toBe(true);
    });

    it('matches .jpeg files', () => {
      expect(isTextureAsset({ assetType: '', filePath: 'photo.jpeg' })).toBe(true);
    });

    it('matches .webp files', () => {
      expect(isTextureAsset(textureWebp)).toBe(true);
    });

    it('does not match model assets', () => {
      expect(isTextureAsset(modelGlb)).toBe(false);
    });

    it('does not match audio assets', () => {
      expect(isTextureAsset(audioAsset)).toBe(false);
    });
  });

  describe('filterAssets', () => {
    it('returns only model assets when filter is "model"', () => {
      const result = filterAssets(allAssets, 'model');
      expect(result).toHaveLength(2);
      expect(result.map(a => a.id)).toEqual(['1', '2']);
    });

    it('returns only texture assets when filter is "texture"', () => {
      const result = filterAssets(allAssets, 'texture');
      expect(result).toHaveLength(3);
      expect(result.map(a => a.id)).toEqual(['3', '4', '5']);
    });

    it('returns all assets when filter is "all"', () => {
      const result = filterAssets(allAssets, 'all');
      expect(result).toHaveLength(6);
    });

    it('returns empty array when no assets match', () => {
      const result = filterAssets([audioAsset], 'model');
      expect(result).toHaveLength(0);
    });

    it('handles empty asset array', () => {
      expect(filterAssets([], 'model')).toHaveLength(0);
      expect(filterAssets([], 'texture')).toHaveLength(0);
      expect(filterAssets([], 'all')).toHaveLength(0);
    });
  });

  describe('value mapping (none sentinel)', () => {
    it('uses _none as sentinel value for undefined', () => {
      // This validates the convention used in AssetDropdown:
      // value={value || "_none"} and onChange maps "_none" back to undefined
      const value: string | undefined = undefined;
      const selectValue = value || '_none';
      expect(selectValue).toBe('_none');

      const selectedNone = '_none';
      const result = selectedNone === '_none' ? undefined : selectedNone;
      expect(result).toBeUndefined();

      const selectedAsset = 'asset-123';
      const assetResult = selectedAsset === '_none' ? undefined : selectedAsset;
      expect(assetResult).toBe('asset-123');
    });
  });
});
