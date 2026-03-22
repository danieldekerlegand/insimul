import { describe, it, expect } from 'vitest';
import type { VisualAsset } from '@shared/schema';

/**
 * Tests for asset resolution logic used by ConfigDetailPanel to pass
 * model paths to ConfigPreviewScene for character, nature, and item previews.
 */

// Mirror the helpers from ConfigDetailPanel
function resolveAssetPath(assets: Pick<VisualAsset, 'id' | 'filePath'>[], assetId?: string): string | undefined {
  if (!assetId) return undefined;
  return assets.find(a => a.id === assetId)?.filePath;
}

function resolveAssetName(assets: Pick<VisualAsset, 'id' | 'name'>[], assetId?: string): string | undefined {
  if (!assetId) return undefined;
  return assets.find(a => a.id === assetId)?.name || `${assetId.slice(0, 12)}...`;
}

// Mirror the path splitting logic from ConfigPreviewScene
function splitModelPath(modelPath: string): { rootUrl: string; fileName: string } {
  const fullPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
  const pathParts = fullPath.split('/');
  const fileName = pathParts.pop() || '';
  const rootUrl = pathParts.join('/') + '/';
  return { rootUrl, fileName };
}

const mockAssets: Pick<VisualAsset, 'id' | 'name' | 'filePath'>[] = [
  { id: 'asset-chair-001', name: 'Wooden Chair', filePath: 'models/furniture/chair.glb' },
  { id: 'asset-tree-002', name: 'Oak Tree', filePath: 'models/nature/oak_tree.glb' },
  { id: 'asset-npc-003', name: 'Villager Model', filePath: '/models/characters/villager.glb' },
  { id: 'asset-key-004', name: 'Golden Key', filePath: 'models/quest/golden_key.glb' },
];

describe('resolveAssetPath', () => {
  it('returns filePath for a matching asset ID', () => {
    expect(resolveAssetPath(mockAssets, 'asset-chair-001')).toBe('models/furniture/chair.glb');
  });

  it('returns undefined for non-existent asset ID', () => {
    expect(resolveAssetPath(mockAssets, 'nonexistent-id')).toBeUndefined();
  });

  it('returns undefined when assetId is undefined', () => {
    expect(resolveAssetPath(mockAssets, undefined)).toBeUndefined();
  });

  it('returns undefined when assets list is empty', () => {
    expect(resolveAssetPath([], 'asset-chair-001')).toBeUndefined();
  });

  it('resolves quest item assets', () => {
    expect(resolveAssetPath(mockAssets, 'asset-key-004')).toBe('models/quest/golden_key.glb');
  });

  it('resolves character model assets', () => {
    expect(resolveAssetPath(mockAssets, 'asset-npc-003')).toBe('/models/characters/villager.glb');
  });

  it('resolves nature assets', () => {
    expect(resolveAssetPath(mockAssets, 'asset-tree-002')).toBe('models/nature/oak_tree.glb');
  });
});

describe('resolveAssetName', () => {
  it('returns the asset name for a matching ID', () => {
    expect(resolveAssetName(mockAssets, 'asset-chair-001')).toBe('Wooden Chair');
  });

  it('returns truncated ID when asset not found', () => {
    expect(resolveAssetName(mockAssets, 'abcdef123456789')).toBe('abcdef123456...');
  });

  it('returns undefined when assetId is undefined', () => {
    expect(resolveAssetName(mockAssets, undefined)).toBeUndefined();
  });

  it('returns asset name for quest items', () => {
    expect(resolveAssetName(mockAssets, 'asset-key-004')).toBe('Golden Key');
  });
});

describe('splitModelPath (ConfigPreviewScene path splitting)', () => {
  it('splits a relative path into rootUrl and fileName', () => {
    const { rootUrl, fileName } = splitModelPath('models/furniture/chair.glb');
    expect(rootUrl).toBe('/models/furniture/');
    expect(fileName).toBe('chair.glb');
  });

  it('splits an absolute path into rootUrl and fileName', () => {
    const { rootUrl, fileName } = splitModelPath('/models/characters/villager.glb');
    expect(rootUrl).toBe('/models/characters/');
    expect(fileName).toBe('villager.glb');
  });

  it('handles a path with no directory', () => {
    const { rootUrl, fileName } = splitModelPath('model.glb');
    expect(rootUrl).toBe('/');
    expect(fileName).toBe('model.glb');
  });

  it('handles deeply nested paths', () => {
    const { rootUrl, fileName } = splitModelPath('assets/models/quest/items/key.glb');
    expect(rootUrl).toBe('/assets/models/quest/items/');
    expect(fileName).toBe('key.glb');
  });
});

describe('end-to-end: asset ID to split model path', () => {
  it('resolves an item asset ID to a valid split path for SceneLoader', () => {
    const filePath = resolveAssetPath(mockAssets, 'asset-chair-001');
    expect(filePath).toBeDefined();
    const { rootUrl, fileName } = splitModelPath(filePath!);
    expect(rootUrl).toBe('/models/furniture/');
    expect(fileName).toBe('chair.glb');
  });

  it('resolves a nature asset ID to a valid split path', () => {
    const filePath = resolveAssetPath(mockAssets, 'asset-tree-002');
    expect(filePath).toBeDefined();
    const { rootUrl, fileName } = splitModelPath(filePath!);
    expect(rootUrl).toBe('/models/nature/');
    expect(fileName).toBe('oak_tree.glb');
  });

  it('resolves a character asset and preserves leading slash', () => {
    const filePath = resolveAssetPath(mockAssets, 'asset-npc-003');
    expect(filePath).toBeDefined();
    const { rootUrl, fileName } = splitModelPath(filePath!);
    expect(rootUrl).toBe('/models/characters/');
    expect(fileName).toBe('villager.glb');
  });

  it('returns undefined for unassigned asset, preventing model load', () => {
    const filePath = resolveAssetPath(mockAssets, undefined);
    expect(filePath).toBeUndefined();
    // ConfigPreviewScene checks `if (modelPath && !buildProcedural)` — undefined skips loading
  });
});
