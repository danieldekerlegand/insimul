/**
 * Sketchfab API Service
 *
 * Provides search, model info, and download URL retrieval from Sketchfab's
 * Data API v3. Mirrors the Polyhaven integration pattern.
 *
 * Authentication:
 *   - Search / browse: works without auth (public endpoints)
 *   - Download: requires a Sketchfab API token (env: SKETCHFAB_API_TOKEN)
 *
 * Docs: https://sketchfab.com/developers/data-api/v3
 */

import https from 'https';

const API_BASE = 'https://api.sketchfab.com/v3';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SketchfabModel {
  uid: string;
  name: string;
  description: string;
  tags: { name: string }[];
  categories: { name: string }[];
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  faceCount: number;
  vertexCount: number;
  isDownloadable: boolean;
  license: { slug: string; label: string } | null;
  user: { username: string; displayName: string };
  thumbnails: { images: SketchfabThumbnail[] };
}

export interface SketchfabThumbnail {
  url: string;
  width: number;
  height: number;
  uid: string;
}

export interface SketchfabSearchResult {
  uid: string;
  name: string;
  description: string;
  tags: string[];
  categories: string[];
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  faceCount: number;
  vertexCount: number;
  isDownloadable: boolean;
  license: string | null;
  user: string;
  thumbnailUrl: string | null;
}

export interface SketchfabSearchResponse {
  results: SketchfabSearchResult[];
  cursors: { next: string | null; previous: string | null };
  totalCount: number;
}

export interface SketchfabDownloadInfo {
  gltfUrl: string;
  gltfSize: number;
  usdzUrl?: string;
  usdzSize?: number;
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function httpsGetJson(url: string, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
      },
    };

    https.get(options, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          reject(new Error(`Sketchfab API ${res.statusCode}: ${body.substring(0, 200)}`));
        });
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function getToken(): string | null {
  return process.env.SKETCHFAB_API_TOKEN || null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Search Sketchfab models.
 * Public endpoint — no auth required for search.
 *
 * @param query       Free-text search query
 * @param options     Additional filters
 */
export async function searchModels(
  query: string,
  options: {
    downloadable?: boolean;
    sort_by?: 'relevance' | 'likeCount' | 'viewCount' | 'publishedAt';
    categories?: string[];
    maxFaceCount?: number;
    cursor?: string;
    count?: number;
  } = {}
): Promise<SketchfabSearchResponse> {
  const params = new URLSearchParams();
  params.set('type', 'models');
  params.set('q', query);
  if (options.downloadable !== false) {
    params.set('downloadable', 'true');
  }
  if (options.sort_by) {
    params.set('sort_by', `-${options.sort_by}`);
  }
  if (options.categories && options.categories.length > 0) {
    // Sketchfab expects categories as separate params or comma-separated
    params.set('categories', options.categories.join(','));
  }
  if (options.maxFaceCount) {
    params.set('face_count', `0-${options.maxFaceCount}`);
  }
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  params.set('count', String(options.count || 24));

  const url = `${API_BASE}/search?${params.toString()}`;
  const raw = await httpsGetJson(url);

  const results: SketchfabSearchResult[] = (raw.results || []).map((m: any) => {
    // Pick best thumbnail (prefer ~200px wide)
    let thumbnailUrl: string | null = null;
    if (m.thumbnails?.images?.length) {
      const sorted = [...m.thumbnails.images].sort(
        (a: any, b: any) => Math.abs(a.width - 200) - Math.abs(b.width - 200)
      );
      thumbnailUrl = sorted[0]?.url || null;
    }

    return {
      uid: m.uid,
      name: m.name,
      description: (m.description || '').substring(0, 200),
      tags: (m.tags || []).map((t: any) => t.name || t),
      categories: (m.categories || []).map((c: any) => c.name || c),
      viewCount: m.viewCount || 0,
      likeCount: m.likeCount || 0,
      downloadCount: m.downloadCount || 0,
      faceCount: m.faceCount || 0,
      vertexCount: m.vertexCount || 0,
      isDownloadable: m.isDownloadable ?? false,
      license: m.license?.slug || null,
      user: m.user?.displayName || m.user?.username || 'Unknown',
      thumbnailUrl,
    };
  });

  return {
    results,
    cursors: {
      next: raw.cursors?.next || null,
      previous: raw.cursors?.previous || null,
    },
    totalCount: raw.totalCount ?? results.length,
  };
}

/**
 * Get detailed model info by UID.
 * Public endpoint.
 */
export async function getModel(uid: string): Promise<SketchfabModel> {
  const url = `${API_BASE}/models/${encodeURIComponent(uid)}`;
  return httpsGetJson(url);
}

/**
 * Request a download link for a model.
 * Requires authentication (SKETCHFAB_API_TOKEN).
 *
 * Returns time-limited signed URLs for glTF (zip) and optionally USDZ.
 */
export async function getDownloadUrl(uid: string): Promise<SketchfabDownloadInfo> {
  const token = getToken();
  if (!token) {
    throw new Error(
      'SKETCHFAB_API_TOKEN is not set. Add it to your .env file to enable Sketchfab downloads. ' +
      'Get a token at https://sketchfab.com/settings/password'
    );
  }

  const url = `${API_BASE}/models/${encodeURIComponent(uid)}/download`;
  const raw = await httpsGetJson(url, token);

  if (!raw.gltf?.url) {
    throw new Error(`Model ${uid} has no glTF download available`);
  }

  return {
    gltfUrl: raw.gltf.url,
    gltfSize: raw.gltf.size || 0,
    usdzUrl: raw.usdz?.url,
    usdzSize: raw.usdz?.size,
  };
}

/**
 * Auto-select Sketchfab models for a given world type.
 * Searches for downloadable, game-ready models using world-type-specific queries.
 */
export async function autoSelectModels(
  worldType: string
): Promise<SketchfabSearchResult[]> {
  const wt = (worldType || '').toLowerCase();

  // Build search queries appropriate to the world type
  let queries: string[];
  if (wt.includes('medieval') || wt.includes('fantasy')) {
    queries = ['medieval building', 'fantasy castle', 'medieval tavern', 'fantasy tree', 'medieval props'];
  } else if (wt.includes('cyberpunk') || wt.includes('sci-fi')) {
    queries = ['scifi building', 'cyberpunk city', 'futuristic props', 'neon signs'];
  } else if (wt.includes('western') || wt.includes('frontier')) {
    queries = ['western saloon', 'old west building', 'desert props'];
  } else if (wt.includes('pirate') || wt.includes('tropical')) {
    queries = ['pirate ship', 'tropical hut', 'beach props', 'treasure chest'];
  } else if (wt.includes('steampunk')) {
    queries = ['steampunk building', 'victorian house', 'steampunk props'];
  } else if (wt.includes('post-apocal')) {
    queries = ['post apocalyptic building', 'abandoned house', 'survival props'];
  } else {
    queries = ['medieval building', 'fantasy props', 'game building'];
  }

  // Run searches in parallel (limit to first 2 queries to avoid rate limits)
  const searchPromises = queries.slice(0, 2).map((q) =>
    searchModels(q, {
      downloadable: true,
      sort_by: 'likeCount',
      maxFaceCount: 50000,
      count: 12,
    }).catch((err) => {
      console.warn(`[Sketchfab] Auto-select search failed for "${q}":`, err.message);
      return { results: [], cursors: { next: null, previous: null }, totalCount: 0 } as SketchfabSearchResponse;
    })
  );

  const responses = await Promise.all(searchPromises);

  // Merge, deduplicate, sort by likes
  const seen = new Set<string>();
  const merged: SketchfabSearchResult[] = [];
  for (const resp of responses) {
    for (const model of resp.results) {
      if (!seen.has(model.uid)) {
        seen.add(model.uid);
        merged.push(model);
      }
    }
  }

  return merged
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 15);
}

/**
 * Check whether the Sketchfab API token is configured.
 */
export function isConfigured(): boolean {
  return !!getToken();
}
