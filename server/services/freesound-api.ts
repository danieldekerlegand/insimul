/**
 * Freesound API Service
 * 
 * Provides integration with the Freesound.org API for fetching CC0-licensed audio assets.
 * Supports searching for sounds by query, filtering by license, and downloading previews.
 */

import https from 'https';

const API_BASE = 'https://freesound.org/apiv2';

// Get API key from environment
const getApiKey = (): string => {
  const apiKey = process.env.FREESOUND_API_KEY;
  if (!apiKey) {
    throw new Error('FREESOUND_API_KEY environment variable is not set');
  }
  return apiKey;
};

export interface FreesoundSound {
  id: number;
  name: string;
  description: string;
  tags: string[];
  license: string;
  duration: number;
  username: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
    'preview-hq-ogg': string;
    'preview-lq-ogg': string;
  };
  download: string;
  avg_rating: number;
  num_downloads: number;
}

export interface FreesoundSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: FreesoundSound[];
}

export interface FreesoundSearchOptions {
  query: string;
  license?: 'cc0' | 'Attribution' | 'Attribution Noncommercial';
  minDuration?: number;
  maxDuration?: number;
  sort?: 'score' | 'duration_desc' | 'duration_asc' | 'created_desc' | 'created_asc' | 'downloads_desc' | 'downloads_asc' | 'rating_desc' | 'rating_asc';
  pageSize?: number;
  page?: number;
}

/**
 * Make an authenticated request to the Freesound API
 */
function freesoundRequest<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();
    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}token=${apiKey}`;

    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Freesound API request failed: HTTP ${res.statusCode} for ${path}`));
        res.resume();
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (err) {
          reject(new Error(`Failed to parse Freesound API response: ${err}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search for sounds on Freesound
 * @param options - Search options including query, license filter, duration range, etc.
 * @returns Search results with sound metadata
 */
export async function searchSounds(options: FreesoundSearchOptions): Promise<FreesoundSearchResult> {
  const {
    query,
    license = 'cc0',
    minDuration,
    maxDuration,
    sort = 'downloads_desc',
    pageSize = 15,
    page = 1
  } = options;

  // Build filter string
  const filters: string[] = [];
  
  // License filter - Freesound uses specific license strings
  if (license === 'cc0') {
    filters.push('license:"Creative Commons 0"');
  } else if (license === 'Attribution') {
    filters.push('license:"Attribution"');
  } else if (license === 'Attribution Noncommercial') {
    filters.push('license:"Attribution Noncommercial"');
  }

  // Duration filter
  if (minDuration !== undefined) {
    filters.push(`duration:[${minDuration} TO *]`);
  }
  if (maxDuration !== undefined) {
    filters.push(`duration:[* TO ${maxDuration}]`);
  }

  const filterParam = filters.length > 0 ? `&filter=${encodeURIComponent(filters.join(' '))}` : '';
  const fieldsParam = '&fields=id,name,description,tags,license,duration,username,previews,download,avg_rating,num_downloads';
  
  const path = `/search/text/?query=${encodeURIComponent(query)}${filterParam}${fieldsParam}&sort=${sort}&page_size=${pageSize}&page=${page}`;

  return freesoundRequest<FreesoundSearchResult>(path);
}

/**
 * Get detailed information about a specific sound
 * @param soundId - The Freesound sound ID
 * @returns Sound metadata including preview URLs
 */
export async function getSoundInfo(soundId: number): Promise<FreesoundSound> {
  const path = `/sounds/${soundId}/?fields=id,name,description,tags,license,duration,username,previews,download,avg_rating,num_downloads`;
  return freesoundRequest<FreesoundSound>(path);
}

/**
 * Get the best preview URL for a sound
 * Prefers HQ OGG, falls back to HQ MP3, then LQ versions
 * @param sound - The sound object with preview URLs
 * @returns The best available preview URL
 */
export function getBestPreviewUrl(sound: FreesoundSound): string {
  const previews = sound.previews;
  return previews['preview-hq-ogg'] || 
         previews['preview-hq-mp3'] || 
         previews['preview-lq-ogg'] || 
         previews['preview-lq-mp3'];
}

/**
 * Auto-select sounds based on audio role and world type
 * Uses the audio-categories-by-world-type.json dataset
 * @param audioRole - The audio role (footstep, ambient, combat, interact, music)
 * @param worldType - The world type (medieval-fantasy, sci-fi-space, etc.)
 * @returns Array of matching sounds sorted by popularity
 */
export async function autoSelectAudioAssets(
  audioRole: string,
  worldType: string
): Promise<FreesoundSound[]> {
  try {
    // Load audio categories dataset
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataPath = path.join(__dirname, '../../data/audio-categories-by-world-type.json');
    
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    const audioData = JSON.parse(dataContent);
    
    // Get world type config, fallback to generic
    const worldConfig = audioData.worldTypes[worldType] || audioData.worldTypes['generic'];
    
    if (!worldConfig || !worldConfig[audioRole]) {
      console.warn(`Audio role ${audioRole} not found for world type ${worldType}`);
      return [];
    }
    
    const roleConfig = worldConfig[audioRole];
    const queries = roleConfig.queries || [];
    const preferredDuration = roleConfig.preferredDuration || {};
    
    // Search using the first query (most relevant)
    if (queries.length === 0) {
      return [];
    }
    
    const searchOptions: FreesoundSearchOptions = {
      query: queries[0],
      license: 'cc0',
      minDuration: preferredDuration.min,
      maxDuration: preferredDuration.max,
      sort: 'downloads_desc',
      pageSize: 10
    };
    
    console.log(`[FreesoundAPI] Auto-selecting ${audioRole} sounds for ${worldType} with query: "${queries[0]}"`);
    
    const result = await searchSounds(searchOptions);
    return result.results;
  } catch (error) {
    console.error('Error auto-selecting audio assets:', error);
    return [];
  }
}

/**
 * Search for sounds by multiple queries and combine results
 * Useful for finding a variety of sounds for a single role
 * @param queries - Array of search queries
 * @param options - Common search options to apply
 * @returns Combined and deduplicated results
 */
export async function searchMultipleQueries(
  queries: string[],
  options: Omit<FreesoundSearchOptions, 'query'>
): Promise<FreesoundSound[]> {
  const allResults: FreesoundSound[] = [];
  const seenIds = new Set<number>();
  
  for (const query of queries) {
    try {
      const result = await searchSounds({ ...options, query });
      for (const sound of result.results) {
        if (!seenIds.has(sound.id)) {
          seenIds.add(sound.id);
          allResults.push(sound);
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }
  
  // Sort by downloads (popularity)
  return allResults.sort((a, b) => b.num_downloads - a.num_downloads);
}
