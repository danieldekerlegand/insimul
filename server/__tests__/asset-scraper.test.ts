/**
 * Tests for the Asset Scraper Service
 *
 * Tests the Polyhaven/Sketchfab scraper logic including category classification,
 * filtering, deduplication, and unified catalog generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the external API modules before importing the scraper
vi.mock('../services/polyhaven-api.js', () => ({
  queryPolyhavenAssets: vi.fn(),
  getPolyhavenModelUrl: vi.fn(),
}));

vi.mock('../services/sketchfab-api.js', () => ({
  searchModels: vi.fn(),
  isConfigured: vi.fn(),
}));

import {
  scrapePolyhaven,
  scrapeSketchfab,
  scrapeAllSources,
  getAssetDownloadInfo,
  type ScrapedAsset,
  type AssetCategory,
} from '../services/asset-scraper.js';

import { queryPolyhavenAssets, getPolyhavenModelUrl } from '../services/polyhaven-api.js';
import { searchModels, isConfigured } from '../services/sketchfab-api.js';

const mockQueryPolyhaven = vi.mocked(queryPolyhavenAssets);
const mockGetModelUrl = vi.mocked(getPolyhavenModelUrl);
const mockSketchfabSearch = vi.mocked(searchModels);
const mockSketchfabConfigured = vi.mocked(isConfigured);

// ─── Fixtures ────────────────────────────────────────────────────────────────

const polyhavenFixtures = [
  { id: 'wooden_chair', name: 'Wooden Chair', categories: ['furniture'], tags: ['chair', 'wood'], download_count: 500, type: 'models' as const },
  { id: 'old_barrel', name: 'Old Barrel', categories: ['container'], tags: ['barrel', 'wood'], download_count: 300, type: 'models' as const },
  { id: 'ceramic_vase', name: 'Ceramic Vase', categories: ['decoration'], tags: ['vase', 'ceramic'], download_count: 200, type: 'models' as const },
  { id: 'pine_tree', name: 'Pine Tree', categories: ['nature'], tags: ['tree', 'pine'], download_count: 1000, type: 'models' as const },
  { id: 'kitchen_knife', name: 'Kitchen Knife', categories: ['kitchenware'], tags: ['knife'], download_count: 150, type: 'models' as const },
  { id: 'treasure_chest', name: 'Treasure Chest', categories: ['decoration'], tags: ['chest', 'treasure'], download_count: 400, type: 'models' as const },
  { id: 'office_desk', name: 'Office Desk', categories: ['furniture'], tags: ['desk', 'office'], download_count: 600, type: 'models' as const },
];

function makeSketchfabResult(uid: string, name: string, overrides: Partial<any> = {}) {
  return {
    uid,
    name,
    description: '',
    tags: [],
    categories: [],
    viewCount: 100,
    likeCount: 50,
    downloadCount: 200,
    faceCount: 5000,
    vertexCount: 3000,
    isDownloadable: true,
    license: 'cc-by-4.0',
    user: 'TestUser',
    thumbnailUrl: `https://example.com/${uid}.jpg`,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Asset Scraper - scrapePolyhaven', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should scrape and classify Polyhaven models', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);

    const result = await scrapePolyhaven();

    expect(result.errors).toHaveLength(0);
    // pine_tree should be excluded (nature, no relevant tags)
    expect(result.assets.find(a => a.sourceId === 'pine_tree')).toBeUndefined();
    // furniture items included
    expect(result.assets.find(a => a.sourceId === 'wooden_chair')).toBeDefined();
    expect(result.assets.find(a => a.sourceId === 'office_desk')).toBeDefined();
  });

  it('should classify furniture assets correctly', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);

    const result = await scrapePolyhaven();

    const chair = result.assets.find(a => a.sourceId === 'wooden_chair')!;
    expect(chair.category).toBe('furniture');

    const desk = result.assets.find(a => a.sourceId === 'office_desk')!;
    expect(desk.category).toBe('furniture');
  });

  it('should classify container assets correctly', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);

    const result = await scrapePolyhaven();

    const barrel = result.assets.find(a => a.sourceId === 'old_barrel')!;
    expect(barrel.category).toBe('container');

    const chest = result.assets.find(a => a.sourceId === 'treasure_chest')!;
    expect(chest.category).toBe('container');
  });

  it('should classify prop assets correctly', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);

    const result = await scrapePolyhaven();

    // vase is in POLYHAVEN_TAG_CATEGORY as container
    const vase = result.assets.find(a => a.sourceId === 'ceramic_vase')!;
    expect(vase.category).toBe('container');

    // knife's category is kitchenware → maps to prop
    const knife = result.assets.find(a => a.sourceId === 'kitchen_knife')!;
    expect(knife.category).toBe('prop');
  });

  it('should set Polyhaven assets as CC0 licensed and downloadable', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);

    const result = await scrapePolyhaven();

    for (const asset of result.assets) {
      expect(asset.license).toBe('CC0');
      expect(asset.downloadable).toBe(true);
      expect(asset.source).toBe('polyhaven');
    }
  });

  it('should handle Polyhaven API errors gracefully', async () => {
    mockQueryPolyhaven.mockRejectedValue(new Error('Network timeout'));

    const result = await scrapePolyhaven();

    expect(result.assets).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Network timeout');
  });
});

describe('Asset Scraper - scrapeSketchfab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should scrape Sketchfab across all category queries', async () => {
    mockSketchfabConfigured.mockReturnValue(true);
    mockSketchfabSearch.mockResolvedValue({
      results: [makeSketchfabResult('uid1', 'Medieval Table')],
      cursors: { next: null, previous: null },
      totalCount: 1,
    });

    const result = await scrapeSketchfab();

    // 9 queries (3 categories × 3 queries each)
    expect(mockSketchfabSearch).toHaveBeenCalledTimes(9);
    expect(result.configured).toBe(true);
  });

  it('should deduplicate models across queries', async () => {
    mockSketchfabConfigured.mockReturnValue(true);
    const duplicateModel = makeSketchfabResult('dup1', 'Wooden Crate');
    mockSketchfabSearch.mockResolvedValue({
      results: [duplicateModel],
      cursors: { next: null, previous: null },
      totalCount: 1,
    });

    const result = await scrapeSketchfab();

    // Same uid should only appear once even though it appeared in multiple queries
    const matches = result.assets.filter(a => a.sourceId === 'dup1');
    expect(matches).toHaveLength(1);
  });

  it('should mark downloadable=false when Sketchfab is not configured', async () => {
    mockSketchfabConfigured.mockReturnValue(false);
    mockSketchfabSearch.mockResolvedValue({
      results: [makeSketchfabResult('uid2', 'Chest', { isDownloadable: true })],
      cursors: { next: null, previous: null },
      totalCount: 1,
    });

    const result = await scrapeSketchfab();

    expect(result.configured).toBe(false);
    for (const asset of result.assets) {
      expect(asset.downloadable).toBe(false);
    }
  });

  it('should handle individual query errors without failing the whole scrape', async () => {
    mockSketchfabConfigured.mockReturnValue(true);
    let callCount = 0;
    mockSketchfabSearch.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Rate limited');
      }
      return {
        results: [makeSketchfabResult(`uid-${callCount}`, `Model ${callCount}`)],
        cursors: { next: null, previous: null },
        totalCount: 1,
      };
    });

    const result = await scrapeSketchfab();

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.assets.length).toBeGreaterThan(0);
  });
});

describe('Asset Scraper - scrapeAllSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should merge results from both sources', async () => {
    mockQueryPolyhaven.mockResolvedValue([polyhavenFixtures[0]]); // wooden_chair
    mockSketchfabConfigured.mockReturnValue(true);
    mockSketchfabSearch.mockResolvedValue({
      results: [makeSketchfabResult('sf1', 'Fantasy Barrel')],
      cursors: { next: null, previous: null },
      totalCount: 1,
    });

    const result = await scrapeAllSources();

    const sources = result.assets.map(a => a.source);
    expect(sources).toContain('polyhaven');
    expect(sources).toContain('sketchfab');
    expect(result.scrapedAt).toBeDefined();
  });

  it('should filter by category when specified', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);
    mockSketchfabConfigured.mockReturnValue(false);
    mockSketchfabSearch.mockResolvedValue({
      results: [],
      cursors: { next: null, previous: null },
      totalCount: 0,
    });

    const result = await scrapeAllSources(['container']);

    for (const asset of result.assets) {
      expect(asset.category).toBe('container');
    }
  });

  it('should sort results by download count descending', async () => {
    mockQueryPolyhaven.mockResolvedValue(polyhavenFixtures);
    mockSketchfabConfigured.mockReturnValue(false);
    mockSketchfabSearch.mockResolvedValue({
      results: [],
      cursors: { next: null, previous: null },
      totalCount: 0,
    });

    const result = await scrapeAllSources();

    for (let i = 1; i < result.assets.length; i++) {
      expect(result.assets[i].downloadCount).toBeLessThanOrEqual(result.assets[i - 1].downloadCount);
    }
  });

  it('should include source metadata in the result', async () => {
    mockQueryPolyhaven.mockResolvedValue([]);
    mockSketchfabConfigured.mockReturnValue(false);
    mockSketchfabSearch.mockResolvedValue({
      results: [],
      cursors: { next: null, previous: null },
      totalCount: 0,
    });

    const result = await scrapeAllSources();

    expect(result.sources.polyhaven).toHaveProperty('count');
    expect(result.sources.polyhaven).toHaveProperty('errors');
    expect(result.sources.sketchfab).toHaveProperty('count');
    expect(result.sources.sketchfab).toHaveProperty('errors');
    expect(result.sources.sketchfab).toHaveProperty('configured');
  });
});

describe('Asset Scraper - getAssetDownloadInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return Polyhaven GLB URL with companion files', async () => {
    mockGetModelUrl.mockResolvedValue({
      url: 'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/wooden_chair.gltf',
      resolution: '1k',
      companionFiles: { 'wooden_chair.bin': 'https://dl.polyhaven.org/bin' },
    });

    const info = await getAssetDownloadInfo('polyhaven', 'wooden_chair');

    expect(info).toHaveProperty('url');
    expect(info).toHaveProperty('resolution', '1k');
    expect(info).toHaveProperty('companionFiles');
  });

  it('should indicate auth required for Sketchfab when not configured', async () => {
    mockSketchfabConfigured.mockReturnValue(false);

    const info = await getAssetDownloadInfo('sketchfab', 'some-uid');

    expect(info).toHaveProperty('requiresAuth', true);
    expect(info).toHaveProperty('message');
  });

  it('should return auth info for Sketchfab even when configured (time-limited URLs)', async () => {
    mockSketchfabConfigured.mockReturnValue(true);

    const info = await getAssetDownloadInfo('sketchfab', 'some-uid');

    expect(info).toHaveProperty('requiresAuth', true);
  });
});
