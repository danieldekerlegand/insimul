/**
 * Download Audio Assets Script
 * 
 * Downloads CC0-licensed audio files from Freesound.org for each world type.
 * Uses the audio-categories-by-world-type.json configuration.
 * 
 * Usage: npx tsx server/scripts/download-audio-assets.ts
 * 
 * Requires FREESOUND_API_KEY environment variable.
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'client/public/assets/freesound');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

const API_BASE = 'https://freesound.org/apiv2';

interface FreesoundSound {
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

interface FreesoundSearchResult {
  count: number;
  results: FreesoundSound[];
}

interface AudioConfig {
  queries: string[];
  tags: string[];
  preferredDuration: { min: number; max: number };
}

interface WorldTypeConfig {
  footstep?: AudioConfig;
  ambient?: AudioConfig;
  combat?: AudioConfig;
  interact?: AudioConfig;
  music?: AudioConfig;
}

interface AudioCategoriesData {
  worldTypes: Record<string, WorldTypeConfig>;
}

// Audio roles to download
const AUDIO_ROLES = ['footstep', 'ambient', 'interact'] as const;

// World types to download for
const WORLD_TYPES = ['medieval-fantasy', 'sci-fi-space', 'cyberpunk', 'generic'] as const;

function getApiKey(): string {
  const apiKey = process.env.FREESOUND_API_KEY;
  if (!apiKey) {
    throw new Error('FREESOUND_API_KEY environment variable is not set');
  }
  return apiKey;
}

async function freesoundRequest<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();
    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}token=${apiKey}`;

    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Freesound API request failed: HTTP ${res.statusCode}`));
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

async function searchSounds(
  query: string,
  minDuration?: number,
  maxDuration?: number
): Promise<FreesoundSearchResult> {
  const filters: string[] = ['license:"Creative Commons 0"'];
  
  if (minDuration !== undefined) {
    filters.push(`duration:[${minDuration} TO *]`);
  }
  if (maxDuration !== undefined) {
    filters.push(`duration:[* TO ${maxDuration}]`);
  }

  const filterParam = `&filter=${encodeURIComponent(filters.join(' '))}`;
  const fieldsParam = '&fields=id,name,description,tags,license,duration,username,previews,download,avg_rating,num_downloads';
  
  const path = `/search/text/?query=${encodeURIComponent(query)}${filterParam}${fieldsParam}&sort=downloads_desc&page_size=5`;

  return freesoundRequest<FreesoundSearchResult>(path);
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath).catch(() => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

function getBestPreviewUrl(sound: FreesoundSound): string {
  const previews = sound.previews;
  return previews['preview-hq-mp3'] || 
         previews['preview-hq-ogg'] || 
         previews['preview-lq-mp3'] || 
         previews['preview-lq-ogg'];
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

async function downloadAudioForRole(
  worldType: string,
  role: string,
  config: AudioConfig
): Promise<{ success: boolean; filePath?: string; soundId?: number; error?: string }> {
  const query = config.queries[0];
  const { min: minDuration, max: maxDuration } = config.preferredDuration;

  console.log(`    Searching: "${query}" (${minDuration}-${maxDuration}s)`);

  try {
    const results = await searchSounds(query, minDuration, maxDuration);
    
    if (results.results.length === 0) {
      // Try without duration filter
      const fallbackResults = await searchSounds(query);
      if (fallbackResults.results.length === 0) {
        return { success: false, error: 'No CC0 sounds found' };
      }
      results.results = fallbackResults.results;
    }

    // Pick the most popular sound
    const sound = results.results[0];
    const previewUrl = getBestPreviewUrl(sound);
    
    if (!previewUrl) {
      return { success: false, error: 'No preview URL available' };
    }

    // Determine file extension from URL
    const ext = previewUrl.includes('.ogg') ? 'ogg' : 'mp3';
    const filename = `${sanitizeFilename(sound.name)}_${sound.id}.${ext}`;
    const destDir = path.join(ASSETS_DIR, role);
    const destPath = path.join(destDir, filename);

    // Check if already downloaded
    try {
      await fs.access(destPath);
      console.log(`    ✅ Already exists: ${filename}`);
      return { success: true, filePath: `assets/freesound/${role}/${filename}`, soundId: sound.id };
    } catch {
      // File doesn't exist, download it
    }

    console.log(`    ⬇️  Downloading: ${sound.name} (${sound.duration.toFixed(1)}s)`);
    await downloadFile(previewUrl, destPath);
    
    const stats = await fs.stat(destPath);
    console.log(`    ✅ Downloaded: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    
    return { 
      success: true, 
      filePath: `assets/freesound/${role}/${filename}`,
      soundId: sound.id 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

interface DownloadedAudio {
  worldType: string;
  role: string;
  filePath: string;
  soundId: number;
}

async function main(): Promise<void> {
  console.log('🎵 Freesound Audio Downloader\n');
  console.log(`Assets will be saved to: ${ASSETS_DIR}\n`);

  // Check for API key
  try {
    getApiKey();
  } catch (error) {
    console.error('❌ Error: FREESOUND_API_KEY environment variable is not set');
    console.log('\nTo set it, run:');
    console.log('  export FREESOUND_API_KEY=your_api_key_here');
    console.log('\nGet an API key at: https://freesound.org/apiv2/apply/');
    process.exit(1);
  }

  // Load audio categories config
  const configPath = path.join(DATA_DIR, 'audio-categories-by-world-type.json');
  const configContent = await fs.readFile(configPath, 'utf-8');
  const audioConfig: AudioCategoriesData = JSON.parse(configContent);

  // Create output directories
  for (const role of AUDIO_ROLES) {
    await fs.mkdir(path.join(ASSETS_DIR, role), { recursive: true });
  }

  const downloadedAudios: DownloadedAudio[] = [];
  const errors: string[] = [];

  // Download audio for each world type and role
  for (const worldType of WORLD_TYPES) {
    console.log(`\n📦 Processing: ${worldType}`);
    console.log('='.repeat(50));

    const worldConfig = audioConfig.worldTypes[worldType];
    if (!worldConfig) {
      console.log(`  ⚠️ No config found for ${worldType}`);
      continue;
    }

    for (const role of AUDIO_ROLES) {
      const roleConfig = worldConfig[role as keyof WorldTypeConfig];
      if (!roleConfig) {
        console.log(`  ⚠️ No ${role} config for ${worldType}`);
        continue;
      }

      console.log(`\n  🎧 ${role}:`);
      const result = await downloadAudioForRole(worldType, role, roleConfig);

      if (result.success && result.filePath && result.soundId) {
        downloadedAudios.push({
          worldType,
          role,
          filePath: result.filePath,
          soundId: result.soundId
        });
      } else {
        errors.push(`${worldType}/${role}: ${result.error}`);
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limit: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`✅ Downloaded: ${downloadedAudios.length} audio files`);
  console.log(`❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // Save manifest of downloaded files
  const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify({
    downloadedAt: new Date().toISOString(),
    files: downloadedAudios
  }, null, 2));
  console.log(`\n📝 Manifest saved to: ${manifestPath}`);

  console.log('\n✅ Audio download complete!\n');
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
