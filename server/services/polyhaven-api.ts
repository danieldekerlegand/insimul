import https from 'https';

const API_BASE = 'https://api.polyhaven.com';

interface PolyhavenAsset {
  id: string;
  name: string;
  categories: string[];
  tags: string[];
  download_count: number;
  type: 'models' | 'hdris' | 'textures';
}

interface PolyhavenFileInfo {
  url: string;
  size: number;
  include?: Record<string, { url: string; size: number }>;
}

function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Request failed ${res.statusCode} for ${url}`));
        res.resume();
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

/**
 * Query Polyhaven assets by type and optional categories
 */
export async function queryPolyhavenAssets(
  type: 'models' | 'hdris' | 'textures',
  categories?: string[]
): Promise<PolyhavenAsset[]> {
  let url = `${API_BASE}/assets?type=${encodeURIComponent(type)}`;
  if (categories && categories.length > 0) {
    url += `&categories=${encodeURIComponent(categories.join(','))}`;
  }

  const assets = await httpsGet(url);
  const entries = Object.entries(assets);

  return entries.map(([id, data]: [string, any]) => ({
    id,
    name: data.name || id,
    categories: data.categories || [],
    tags: data.tags || [],
    download_count: data.download_count || 0,
    type,
  }));
}

/**
 * Get file information for a specific Polyhaven asset
 */
export async function getPolyhavenAssetFiles(
  assetId: string
): Promise<Record<string, any>> {
  const url = `${API_BASE}/files/${encodeURIComponent(assetId)}`;
  return httpsGet(url);
}

/**
 * Get the best GLB file URL for a model asset
 */
export async function getPolyhavenModelUrl(
  assetId: string,
  preferredResolution?: string
): Promise<{ url: string; resolution: string }> {
  const files = await getPolyhavenAssetFiles(assetId);
  const group = files.gltf;

  if (!group) {
    throw new Error(`Asset ${assetId} has no gltf group`);
  }

  const resolutions = Object.keys(group);
  if (!resolutions.length) {
    throw new Error(`Asset ${assetId} has no resolutions in gltf group`);
  }

  let chosenKey: string;
  if (preferredResolution && resolutions.includes(preferredResolution)) {
    chosenKey = preferredResolution;
  } else {
    // Fall back to highest resolution
    resolutions.sort((a, b) => {
      const na = parseInt(a, 10) || 0;
      const nb = parseInt(b, 10) || 0;
      return nb - na;
    });
    chosenKey = resolutions[0];
  }

  const entry = group[chosenKey];
  if (!entry || !entry.gltf) {
    throw new Error(`Unexpected gltf entry structure for asset ${assetId}`);
  }

  const fileInfo = entry.gltf;
  if (!fileInfo.url) {
    throw new Error(`No URL for asset ${assetId}`);
  }

  return { url: fileInfo.url, resolution: chosenKey };
}

/**
 * Auto-select Polyhaven assets based on collection type and world type
 * Uses the asset-categories-by-world-type.json dataset
 */
export async function autoSelectPolyhavenAssets(
  collectionType: string,
  worldType: string
): Promise<PolyhavenAsset[]> {
  try {
    // Load asset categories dataset
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataPath = path.join(__dirname, '../../data/asset-categories-by-world-type.json');
    
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    const assetData = JSON.parse(dataContent);
    
    // Get world type config, fallback to generic
    const worldConfig = assetData.worldTypes[worldType] || assetData.worldTypes['generic'];
    
    if (!worldConfig) {
      console.warn(`World type ${worldType} not found, using generic`);
      return [];
    }
    
    // Collect all Polyhaven categories from all asset categories
    const allCategories = new Set<string>();
    const assetCategories = worldConfig.assetCategories;
    
    // Prioritize key categories for better results
    const priorityCategories = [
      'publicBuilding',
      'residence', 
      'tree',
      'furniture',
      'weapon',
      'prop'
    ];
    
    // Add categories from priority list first
    for (const categoryKey of priorityCategories) {
      if (assetCategories[categoryKey]) {
        const polyhavenCats = assetCategories[categoryKey].polyhavenCategories;
        polyhavenCats.forEach((cat: string) => allCategories.add(cat));
      }
    }
    
    // Convert to array and limit to top categories to avoid too broad search
    const categories = Array.from(allCategories).slice(0, 8);
    
    console.log(`Auto-selecting assets for ${worldType} with categories:`, categories);
    
    const assets = await queryPolyhavenAssets('models', categories);
    
    // Sort by download count and return top 15
    return assets
      .sort((a, b) => b.download_count - a.download_count)
      .slice(0, 15);
  } catch (error) {
    console.error('Error auto-selecting Polyhaven assets:', error);
    return [];
  }
}
