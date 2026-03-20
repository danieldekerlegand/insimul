/**
 * Asset Scraper Service
 *
 * Scrapes Polyhaven and Sketchfab for downloadable prop, furniture,
 * and container 3D assets. Returns a unified catalog with source metadata.
 */

import { queryPolyhavenAssets, getPolyhavenModelUrl } from './polyhaven-api.js';
import {
  searchModels as sketchfabSearch,
  isConfigured as sketchfabIsConfigured,
  type SketchfabSearchResult,
} from './sketchfab-api.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AssetCategory = 'prop' | 'furniture' | 'container';
export type AssetSource = 'polyhaven' | 'sketchfab';

export interface ScrapedAsset {
  /** Unique id: `{source}:{sourceId}` */
  id: string;
  source: AssetSource;
  sourceId: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  license: string | null;
  author: string | null;
  downloadCount: number;
  /** Thumbnail URL (Sketchfab only) */
  thumbnailUrl: string | null;
  /** Whether a direct download URL can be obtained */
  downloadable: boolean;
}

export interface ScrapeResult {
  assets: ScrapedAsset[];
  sources: {
    polyhaven: { count: number; errors: string[] };
    sketchfab: { count: number; errors: string[]; configured: boolean };
  };
  scrapedAt: string;
}

// ─── Category mapping ────────────────────────────────────────────────────────

/** Polyhaven categories that map to our asset categories */
const POLYHAVEN_CATEGORY_MAP: Record<string, AssetCategory[]> = {
  furniture: ['furniture'],
  'food and drink': ['prop'],
  electronics: ['prop'],
  tool: ['prop'],
  container: ['container'],
  'storage container': ['container'],
  decoration: ['prop'],
  kitchenware: ['prop', 'container'],
  lamp: ['furniture'],
  industrial: ['prop'],
  sports: ['prop'],
  instrument: ['prop'],
  toy: ['prop'],
};

/** Polyhaven tags that hint at category */
const POLYHAVEN_TAG_CATEGORY: Record<string, AssetCategory> = {
  chair: 'furniture',
  table: 'furniture',
  desk: 'furniture',
  shelf: 'furniture',
  shelves: 'furniture',
  bench: 'furniture',
  sofa: 'furniture',
  couch: 'furniture',
  bed: 'furniture',
  cabinet: 'furniture',
  wardrobe: 'furniture',
  stool: 'furniture',
  bookshelf: 'furniture',
  drawer: 'furniture',
  dresser: 'furniture',
  chest: 'container',
  crate: 'container',
  box: 'container',
  barrel: 'container',
  basket: 'container',
  bucket: 'container',
  jar: 'container',
  pot: 'container',
  vase: 'container',
  trunk: 'container',
  sack: 'container',
  bag: 'container',
  bin: 'container',
};

/** Sketchfab search queries per category */
const SKETCHFAB_QUERIES: Record<AssetCategory, string[]> = {
  prop: ['game prop low poly', 'medieval prop', 'interior prop'],
  furniture: ['furniture low poly', 'medieval furniture', 'wooden furniture game'],
  container: ['treasure chest low poly', 'wooden crate game', 'barrel container game'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyPolyhavenAsset(
  categories: string[],
  tags: string[],
): AssetCategory {
  // Check tags first (more specific)
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (POLYHAVEN_TAG_CATEGORY[lower]) {
      return POLYHAVEN_TAG_CATEGORY[lower];
    }
  }

  // Then check Polyhaven categories
  for (const cat of categories) {
    const lower = cat.toLowerCase();
    const mapped = POLYHAVEN_CATEGORY_MAP[lower];
    if (mapped) {
      return mapped[0];
    }
  }

  return 'prop'; // default
}

function matchesPropFurnitureContainer(
  categories: string[],
  tags: string[],
): boolean {
  const relevantPolyhavenCategories = Object.keys(POLYHAVEN_CATEGORY_MAP);
  const relevantTags = Object.keys(POLYHAVEN_TAG_CATEGORY);

  const lowerCats = categories.map((c) => c.toLowerCase());
  const lowerTags = tags.map((t) => t.toLowerCase());

  if (lowerCats.some((c) => relevantPolyhavenCategories.includes(c))) return true;
  if (lowerTags.some((t) => relevantTags.includes(t))) return true;

  return false;
}

// ─── Scraper functions ───────────────────────────────────────────────────────

/**
 * Scrape Polyhaven for prop/furniture/container models.
 */
export async function scrapePolyhaven(): Promise<{
  assets: ScrapedAsset[];
  errors: string[];
}> {
  const errors: string[] = [];
  const assets: ScrapedAsset[] = [];

  try {
    const allModels = await queryPolyhavenAssets('models');

    for (const model of allModels) {
      if (!matchesPropFurnitureContainer(model.categories, model.tags)) {
        continue;
      }

      const category = classifyPolyhavenAsset(model.categories, model.tags);

      assets.push({
        id: `polyhaven:${model.id}`,
        source: 'polyhaven',
        sourceId: model.id,
        name: model.name,
        category,
        tags: model.tags,
        license: 'CC0',
        author: null,
        downloadCount: model.download_count,
        thumbnailUrl: null,
        downloadable: true,
      });
    }
  } catch (err: any) {
    errors.push(`Polyhaven scrape failed: ${err.message}`);
  }

  return { assets, errors };
}

/**
 * Scrape Sketchfab for prop/furniture/container models.
 */
export async function scrapeSketchfab(): Promise<{
  assets: ScrapedAsset[];
  errors: string[];
  configured: boolean;
}> {
  const configured = sketchfabIsConfigured();
  const errors: string[] = [];
  const assets: ScrapedAsset[] = [];
  const seen = new Set<string>();

  for (const [category, queries] of Object.entries(SKETCHFAB_QUERIES) as [AssetCategory, string[]][]) {
    for (const query of queries) {
      try {
        const response = await sketchfabSearch(query, {
          downloadable: true,
          sort_by: 'likeCount',
          maxFaceCount: 50000,
          count: 24,
        });

        for (const model of response.results) {
          if (seen.has(model.uid)) continue;
          seen.add(model.uid);

          assets.push({
            id: `sketchfab:${model.uid}`,
            source: 'sketchfab',
            sourceId: model.uid,
            name: model.name,
            category,
            tags: model.tags,
            license: model.license,
            author: model.user,
            downloadCount: model.downloadCount,
            thumbnailUrl: model.thumbnailUrl,
            downloadable: model.isDownloadable && configured,
          });
        }
      } catch (err: any) {
        errors.push(`Sketchfab query "${query}" failed: ${err.message}`);
      }
    }
  }

  return { assets, errors, configured };
}

/**
 * Scrape both Polyhaven and Sketchfab, returning a unified catalog.
 *
 * @param categories Optional filter — only return assets matching these categories
 */
export async function scrapeAllSources(
  categories?: AssetCategory[],
): Promise<ScrapeResult> {
  const [polyhaven, sketchfab] = await Promise.all([
    scrapePolyhaven(),
    scrapeSketchfab(),
  ]);

  let allAssets = [...polyhaven.assets, ...sketchfab.assets];

  if (categories && categories.length > 0) {
    const categorySet = new Set(categories);
    allAssets = allAssets.filter((a) => categorySet.has(a.category));
  }

  // Sort by download count descending
  allAssets.sort((a, b) => b.downloadCount - a.downloadCount);

  return {
    assets: allAssets,
    sources: {
      polyhaven: { count: polyhaven.assets.length, errors: polyhaven.errors },
      sketchfab: {
        count: sketchfab.assets.length,
        errors: sketchfab.errors,
        configured: sketchfab.configured,
      },
    },
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Get download info for a scraped asset.
 * For Polyhaven returns the GLB URL; for Sketchfab returns a note about auth.
 */
export async function getAssetDownloadInfo(
  source: AssetSource,
  sourceId: string,
): Promise<{ url: string; resolution?: string; companionFiles?: Record<string, string> } | { requiresAuth: true; message: string }> {
  if (source === 'polyhaven') {
    const info = await getPolyhavenModelUrl(sourceId, '1k');
    return {
      url: info.url,
      resolution: info.resolution,
      companionFiles: info.companionFiles,
    };
  }

  // Sketchfab downloads require auth — delegate to existing download-and-register endpoint
  if (!sketchfabIsConfigured()) {
    return {
      requiresAuth: true,
      message: 'SKETCHFAB_API_TOKEN is required for Sketchfab downloads. Use POST /api/sketchfab/download-and-register with a valid token.',
    };
  }

  // For Sketchfab, the download URL is time-limited and requires the download-and-register flow
  return {
    requiresAuth: true,
    message: `Use POST /api/sketchfab/download-and-register with sketchfabUid="${sourceId}" to download this asset.`,
  };
}
