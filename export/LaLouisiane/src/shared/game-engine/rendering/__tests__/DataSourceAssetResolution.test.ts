/**
 * Tests for DataSource asset resolution methods (resolveAssetById, resolveAssetUrl).
 * Pure-logic tests — no Babylon.js needed.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiDataSource, FileDataSource } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('ApiDataSource asset resolution', () => {
  let ds: ApiDataSource;

  beforeEach(() => {
    ds = new ApiDataSource('test-token', '');
    vi.restoreAllMocks();
  });

  describe('resolveAssetById', () => {
    it('returns asset data on successful fetch', async () => {
      const mockAsset = {
        id: 'asset-123',
        name: 'ground_texture',
        assetType: 'texture_ground',
        filePath: '/uploads/textures/ground.png',
        fileName: 'ground.png',
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAsset,
      } as Response);

      const result = await ds.resolveAssetById('asset-123');
      expect(result).toEqual(mockAsset);
      expect(fetch).toHaveBeenCalledWith('/api/assets/asset-123', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }));
    });

    it('returns null when asset not found', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await ds.resolveAssetById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const result = await ds.resolveAssetById('asset-123');
      expect(result).toBeNull();
    });
  });

  describe('resolveAssetUrl', () => {
    it('returns API URL for the asset', () => {
      const url = ds.resolveAssetUrl('asset-456');
      expect(url).toBe('/api/assets/asset-456');
    });

    it('includes baseUrl when set', () => {
      const dsWithBase = new ApiDataSource('token', 'https://api.example.com');
      const url = dsWithBase.resolveAssetUrl('asset-789');
      expect(url).toBe('https://api.example.com/api/assets/asset-789');
    });
  });
});

describe('FileDataSource asset resolution', () => {
  let storage: MemoryStorage;

  // Helper to create a FileDataSource with mocked world IR data
  function createFileDataSource(assetIdToPath?: Record<string, string>): FileDataSource {
    const ds = new FileDataSource(storage);
    // Inject world IR data directly for testing
    const worldIR: any = {
      meta: {
        worldName: 'Test World',
        assetIdToPath: assetIdToPath || {},
      },
    };
    (ds as any).worldIR = worldIR;
    (ds as any).worldData = {
      world: worldIR.meta,
      assetManifest: { assets: [] },
    };
    return ds;
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  describe('resolveAssetById', () => {
    it('resolves asset from assetIdToPath map for PNG', async () => {
      const ds = createFileDataSource({
        'mongo-id-123': 'assets/textures/wall.png',
      });

      const result = await ds.resolveAssetById('mongo-id-123');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('mongo-id-123');
      expect(result!.filePath).toBe('./assets/textures/wall.png');
      expect(result!.mimeType).toBe('image/png');
      expect((result as any).assetType).toBe('texture_wall');
    });

    it('resolves asset from assetIdToPath map for JPG', async () => {
      const ds = createFileDataSource({
        'mongo-id-456': './assets/textures/ground.jpg',
      });

      const result = await ds.resolveAssetById('mongo-id-456');
      expect(result).not.toBeNull();
      expect(result!.filePath).toBe('./assets/textures/ground.jpg');
      expect(result!.mimeType).toBe('image/jpeg');
    });

    it('resolves non-texture asset as model', async () => {
      const ds = createFileDataSource({
        'mongo-id-789': 'assets/models/house.glb',
      });

      const result = await ds.resolveAssetById('mongo-id-789');
      expect(result).not.toBeNull();
      expect((result as any).assetType).toBe('model');
      expect(result!.mimeType).toBe('model/gltf-binary');
    });

    it('returns null when asset not in map or loaded assets', async () => {
      const ds = createFileDataSource({});

      const result = await ds.resolveAssetById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('falls back to loaded assets when not in assetIdToPath', async () => {
      const ds = createFileDataSource({});
      // Inject an asset into the manifest
      (ds as any).worldData.assetManifest = {
        assets: [{
          role: 'test-asset-id',
          category: 'ground',
          exportPath: 'assets/ground.png',
          fileSize: 1024,
        }],
      };

      const result = await ds.resolveAssetById('test-asset-id');
      expect(result).not.toBeNull();
      expect((result as any).id).toBe('test-asset-id');
    });
  });

  describe('resolveAssetUrl', () => {
    it('returns local path from assetIdToPath', () => {
      const ds = createFileDataSource({
        'mongo-id-123': 'assets/textures/wall.png',
      });

      const url = ds.resolveAssetUrl('mongo-id-123');
      expect(url).toBe('./assets/textures/wall.png');
    });

    it('preserves leading ./ in paths', () => {
      const ds = createFileDataSource({
        'mongo-id-456': './assets/textures/ground.jpg',
      });

      const url = ds.resolveAssetUrl('mongo-id-456');
      expect(url).toBe('./assets/textures/ground.jpg');
    });

    it('returns null for unknown asset', () => {
      const ds = createFileDataSource({});

      const url = ds.resolveAssetUrl('nonexistent');
      expect(url).toBeNull();
    });
  });
});
