# Asset Categories Dataset Usage Guide

## Overview

The `data/asset-categories-by-world-type.json` file contains a comprehensive categorization of 3D assets organized by world type. This dataset was extracted from the hardcoded logic in `polyhaven-models.js` and `world-3d-defaults.ts` before their removal, preserving all asset categorization knowledge for the collection-based system.

**The hardcoded files have been removed.** Assets are now fetched dynamically from Polyhaven via the **Auto-Select Assets** feature in the asset management UI.

## File Location

```
/data/asset-categories-by-world-type.json
```

## How to Use

### Via UI (Recommended)

1. Navigate to your world's asset collection management
2. Click **"Browse Polyhaven Assets"**
3. Switch to the **"Auto-Select"** tab
4. Click **"Auto-Select Assets"** - this will automatically fetch the top 15 most popular assets from Polyhaven based on your world type
5. Review the selected assets in the **"Browse Assets"** tab
6. Click **"Add Assets to Collection"** to import them

The Auto-Select feature uses the JSON dataset to determine which Polyhaven categories to search for based on your world type.

### Via API

```bash
# Auto-select assets for a world type
curl -X POST http://localhost:5000/api/polyhaven/auto-select \
  -H "Content-Type: application/json" \
  -d '{"worldType": "medieval-fantasy", "collectionType": "complete"}'
```

## Structure

### World Types

The dataset defines asset categories for 18 world types:

1. **medieval-fantasy** - Includes high-fantasy, low-fantasy, dark-fantasy, historical-medieval, mythological
2. **sci-fi-space** - Includes cyberpunk, post-apocalyptic, solarpunk, dieselpunk
3. **historical** - Includes historical-ancient, historical-renaissance, historical-victorian, wild-west
4. **generic** - Fallback for unspecified or custom world types

### Asset Categories

Each world type defines 14 asset categories:

- **publicBuilding** - Town halls, churches, public structures
- **business** - Shops, taverns, commercial buildings
- **residence** - Houses, apartments, living spaces
- **tree** - Various tree types appropriate for the world
- **shrub** - Bushes and shrubs
- **plant** - Flowers, grass, vegetation
- **furniture** - Tables, chairs, beds
- **storage** - Chests, boxes, containers, shelves
- **weapon** - Swords, guns, combat items
- **prop** - Miscellaneous items (goblets, crowns, data pads)
- **decoration** - Signs, posters, banners
- **npcMale** - Male NPC character models
- **npcFemale** - Female NPC character models
- **playerMale** - Male player character models
- **playerFemale** - Female player character models

### Category Properties

Each category contains:

```json
{
  "polyhavenCategories": ["category1", "category2"],
  "tags": ["3d", "type", "theme"],
  "examples": ["example 1", "example 2"]
}
```

- **polyhavenCategories**: Search terms for Polyhaven API queries
- **tags**: Tags to apply when creating VisualAsset database entries
- **examples**: Example asset names or descriptions

## Usage Workflows

### 1. Fetching Assets from Polyhaven

```typescript
import assetCategories from '../data/asset-categories-by-world-type.json';

async function fetchAssetsForWorldType(worldType: string, category: string) {
  // Get world type config (handles aliases)
  const worldConfig = assetCategories.worldTypes[worldType] || 
                      assetCategories.worldTypes['generic'];
  
  const categoryConfig = worldConfig.assetCategories[category];
  if (!categoryConfig) {
    throw new Error(`Unknown category: ${category}`);
  }
  
  // Build Polyhaven API query
  const categories = categoryConfig.polyhavenCategories.join(',');
  const url = `https://api.polyhaven.com/assets?type=models&categories=${categories}`;
  
  const response = await fetch(url);
  const assets = await response.json();
  
  return assets;
}

// Example: Fetch medieval buildings
const buildings = await fetchAssetsForWorldType('medieval-fantasy', 'publicBuilding');
```

### 2. Creating VisualAsset Entries

```typescript
import assetCategories from '../data/asset-categories-by-world-type.json';

async function createVisualAssetFromPolyhaven(
  worldId: string,
  worldType: string,
  category: string,
  polyhavenAssetId: string,
  filePath: string
) {
  const worldConfig = assetCategories.worldTypes[worldType] || 
                      assetCategories.worldTypes['generic'];
  
  const categoryConfig = worldConfig.assetCategories[category];
  
  // Use tags from the dataset
  const tags = [...categoryConfig.tags, `polyhaven:${polyhavenAssetId}`];
  
  // Determine asset type
  let assetType = 'model_prop';
  if (category === 'publicBuilding' || category === 'business' || category === 'residence') {
    assetType = 'model_building';
  } else if (category === 'tree' || category === 'shrub' || category === 'plant') {
    assetType = 'model_nature';
  } else if (category.includes('npc') || category.includes('player')) {
    assetType = 'model_character';
  }
  
  const asset = await storage.createVisualAsset({
    worldId,
    name: `${category} from Polyhaven`,
    assetType,
    filePath,
    tags,
    // ... other properties
  });
  
  return asset;
}
```

### 3. Populating Asset Collections

```typescript
import assetCategories from '../data/asset-categories-by-world-type.json';

async function populateCollectionForWorldType(
  collectionId: string,
  worldType: string
) {
  const worldConfig = assetCategories.worldTypes[worldType] || 
                      assetCategories.worldTypes['generic'];
  
  const buildingModels: Record<string, string> = {};
  const natureModels: Record<string, string> = {};
  const characterModels: Record<string, string> = {};
  const objectModels: Record<string, string> = {};
  
  // Fetch and create assets for each category
  for (const [category, config] of Object.entries(worldConfig.assetCategories)) {
    // Fetch from Polyhaven
    const polyhavenAssets = await fetchAssetsForWorldType(worldType, category);
    
    // Download and create first suitable asset
    const assetId = await downloadAndCreateAsset(polyhavenAssets, config);
    
    // Assign to appropriate model map
    if (category === 'publicBuilding') {
      buildingModels.default = assetId;
    } else if (category === 'residence') {
      buildingModels.smallResidence = assetId;
    } else if (category === 'tree') {
      natureModels.defaultTree = assetId;
    } else if (category === 'npcMale' || category === 'npcFemale') {
      characterModels.npcDefault = assetId;
    } else {
      objectModels[category] = assetId;
    }
  }
  
  // Update collection
  await storage.updateAssetCollection(collectionId, {
    buildingModels,
    natureModels,
    characterModels,
    objectModels
  });
}
```

### 4. Direct World Type Lookup

```typescript
function getWorldTypeConfig(worldType: string) {
  const config = assetCategories.worldTypes[worldType];
  
  if (!config) {
    console.warn(`World type ${worldType} not found, falling back to generic`);
    return assetCategories.worldTypes['generic'];
  }
  
  return config;
}

// Example - each world type has its own section
const medievalConfig = getWorldTypeConfig('medieval-fantasy');
const highFantasyConfig = getWorldTypeConfig('high-fantasy'); // Has its own unique config
const cyberpunkConfig = getWorldTypeConfig('cyberpunk'); // Has its own unique config
```

## Integration with Asset Collection System

### Creating Default Collections

Use this dataset to create default collections for each world type:

```typescript
import assetCategories from '../data/asset-categories-by-world-type.json';

async function createDefaultCollections() {
  for (const [worldType, config] of Object.entries(assetCategories.worldTypes)) {
    const collectionName = worldType
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    const collection = await storage.createAssetCollection({
      name: collectionName,
      description: `Default asset collection for ${collectionName.toLowerCase()} worlds`,
      collectionType: 'complete',
      worldType,
      isPublic: true,
      tags: ['default', worldType],
      buildingModels: {},
      natureModels: {},
      characterModels: {},
      objectModels: {}
    });
    
    // Populate collection with assets
    await populateCollectionForWorldType(collection.id, worldType);
  }
}
```

### Automatic Asset Discovery

Use the dataset to automatically discover and download missing assets:

```typescript
async function discoverMissingAssets(collectionId: string, worldType: string) {
  const collection = await storage.getAssetCollection(collectionId);
  const worldConfig = assetCategories.worldTypes[worldType] || 
                      assetCategories.worldTypes['generic'];
  
  const missingCategories: string[] = [];
  
  // Check which categories are missing
  for (const category of Object.keys(worldConfig.assetCategories)) {
    const hasAsset = checkIfCategoryHasAsset(collection, category);
    if (!hasAsset) {
      missingCategories.push(category);
    }
  }
  
  // Fetch and add missing assets
  for (const category of missingCategories) {
    console.log(`Discovering assets for missing category: ${category}`);
    const assets = await fetchAssetsForWorldType(worldType, category);
    // Download and add to collection...
  }
}
```

## Polyhaven API Integration

### Query Construction

The `polyhavenCategories` array is designed to be used directly with the Polyhaven API:

```javascript
const categories = categoryConfig.polyhavenCategories.join(',');
const url = `https://api.polyhaven.com/assets?type=models&categories=${encodeURIComponent(categories)}`;
```

### Fallback Strategy

If no assets are found with the specified categories, fall back to broader searches:

```typescript
async function fetchWithFallback(worldType: string, category: string) {
  const config = assetCategories.worldTypes[worldType].assetCategories[category];
  
  // Try with all categories
  let assets = await queryPolyhaven(config.polyhavenCategories);
  
  if (Object.keys(assets).length === 0) {
    // Try with just the first category
    assets = await queryPolyhaven([config.polyhavenCategories[0]]);
  }
  
  if (Object.keys(assets).length === 0) {
    // Fall back to generic search
    assets = await queryPolyhaven(['object']);
  }
  
  return assets;
}
```

## Migration from Hardcoded System

### Before (Hardcoded)

```typescript
// Old way - hardcoded paths and world type checks
if (worldType.includes('medieval')) {
  buildingPath = 'assets/models/buildings/medieval/house_small.glb';
  tags = ['3d', 'building', 'medieval', 'fantasy'];
}
```

### After (Collection-Based)

```typescript
// New way - data-driven from JSON
const worldConfig = assetCategories.worldTypes[worldType];
const categoryConfig = worldConfig.assetCategories['publicBuilding'];
const tags = categoryConfig.tags;
const polyhavenCategories = categoryConfig.polyhavenCategories;
```

## Best Practices

1. **Always resolve aliases**: Use `resolveWorldType()` to handle world type aliases
2. **Use fallbacks**: Always fall back to 'generic' if world type not found
3. **Tag consistently**: Use the tags from the dataset for consistency
4. **Cache results**: Cache Polyhaven API results to avoid rate limiting
5. **Validate assets**: Check that downloaded assets are valid GLB/GLTF files
6. **Update collections**: Keep asset collections up-to-date with new discoveries

## Example: Complete Asset Population Script

```typescript
import assetCategories from '../data/asset-categories-by-world-type.json';

async function populateWorldAssets(worldId: string) {
  const world = await storage.getWorld(worldId);
  const worldType = resolveWorldType(world.config?.worldType || 'generic');
  
  // Get or create collection for this world type
  let collection = await findCollectionForWorldType(worldType);
  if (!collection) {
    collection = await createDefaultCollectionForWorldType(worldType);
  }
  
  // Assign collection to world
  await storage.updateWorld(worldId, {
    selectedAssetCollectionId: collection.id
  });
  
  // Populate collection if empty
  const isEmpty = !collection.buildingModels?.default;
  if (isEmpty) {
    await populateCollectionForWorldType(collection.id, worldType);
  }
  
  console.log(`World ${worldId} now uses collection ${collection.id} (${collection.name})`);
}
```

## Related Files

- **Dataset**: `/data/asset-categories-by-world-type.json`
- **Loader Service**: `/client/src/services/AssetCollectionLoader.ts`
- **Default Collections**: `/server/services/default-asset-collection.ts`
- **Collection Resolver**: `/server/services/asset-collection-resolver.ts`

## Notes

- This dataset replaces the hardcoded logic previously in `polyhaven-models.js` and `world-3d-defaults.ts`
- The dataset is version-controlled and can be updated independently of code
- New world types or categories can be added by editing the JSON file
- The dataset is designed to be extensible for other asset sources beyond Polyhaven
