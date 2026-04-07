# Asset Loading System Analysis

## Executive Summary

The current 3D asset loading system uses **hardcoded file paths** organized by **world type subdirectories**. This analysis documents all locations where assets are referenced and provides a roadmap for refactoring to a **collection-based system**.

## Current Asset References

### 1. `client/scripts/polyhaven-models.js`

**Purpose**: Downloads 3D models from Poly Haven API

**Hardcoded Paths**:
```javascript
// Line 96: Medieval house
destRel: 'public/assets/models/buildings/medieval/house_small.glb'

// Line 103: Oak tree
destRel: 'public/assets/models/nature/trees/oak_tree.glb'

// Line 110: Futuristic building
destRel: 'public/assets/models/buildings/futuristic/futuristic_building.glb'

// Line 117: Futuristic tree
destRel: 'public/assets/models/nature/trees/futuristic/alien_tree.glb'

// Lines 125-226: Props organized by fantasy/futuristic/historical
```

**World Type Logic**: Assets organized into subdirectories by world theme (medieval, futuristic, fantasy, historical)

**Refactor Needed**: 
- Change destination paths to collection-based structure
- Remove world type subdirectories
- Support collection parameter for download target

---

### 2. `server/services/world-3d-defaults.ts`

**Purpose**: Seeds default 3D assets for new worlds based on world type

**Hardcoded Constants** (Lines 5-9):
```typescript
const DEFAULT_BUILDING_MODEL_PATH = "assets/models/buildings/medieval/house_small.glb";
const DEFAULT_TREE_MODEL_PATH = "assets/models/nature/trees/oak_tree.glb";
const FUTURISTIC_BUILDING_MODEL_PATH = "assets/models/buildings/futuristic/futuristic_building.glb";
const FUTURISTIC_TREE_MODEL_PATH = "assets/models/nature/trees/futuristic/alien_tree.glb";
const DEFAULT_NPC_MODEL_PATH = "assets/npc/starterAvatars.babylon";
```

**World Type Mapping** (Lines 31-160):
- `getWorldTypePreset()` function maps world types to specific asset paths
- Medieval types → medieval paths
- Futuristic types → futuristic paths
- Historical types → historical paths
- Generic fallback

**Asset Creation** (Lines 179-220):
- `findOrCreateModelAsset()` creates visual assets with hardcoded `filePath`
- Assets stored per-world with world-specific IDs

**Refactor Needed**:
- Replace path constants with collection references
- Change `getWorldTypePreset()` to return collection name/ID
- Create/assign asset collection instead of individual assets
- Remove per-world asset duplication

---

### 3. `client/src/components/3DGame/ProceduralBuildingGenerator.ts`

**Purpose**: Generates procedural buildings and loads 3D models

**World Type Logic** (Lines 135-166):
```typescript
public async initializeAssets(worldType?: string): Promise<void> {
  const type = (worldType || '').toLowerCase();
  
  if (type.includes('medieval') || type.includes('fantasy')) {
    await this.loadBuildingModel(
      'medieval_village',
      'residence_small',
      '/assets/models/buildings/medieval/',
      'house_small.glb'
    );
  } else if (type.includes('cyberpunk') || type.includes('sci-fi') || ...) {
    await this.loadBuildingModel(
      'futuristic_city',
      'residence_small',
      '/assets/models/buildings/futuristic/',
      'futuristic_building.glb'
    );
  }
}
```

**Asset Set System** (Lines 80-128):
- Uses `assetSetId` concept (e.g., 'medieval_village', 'futuristic_city')
- Maps building styles to asset sets
- Still constructs paths manually

**Refactor Needed**:
- Remove `initializeAssets()` world type checks
- Add `loadFromCollection(assets: CollectionAssets)` method
- Accept resolved `VisualAsset` objects instead of paths
- Remove path construction logic

---

### 4. `client/src/components/3DGame/ProceduralNatureGenerator.ts`

**Purpose**: Generates trees, vegetation, and natural elements

**World Type Logic** (Lines 113-129):
```typescript
public async initializeAssets(worldType?: string): Promise<void> {
  const type = (worldType || '').toLowerCase();
  
  if (type.includes('medieval') || type.includes('fantasy') || type.includes('modern')) {
    await this.loadTreeModel(
      'temperate_forest',
      'oak',
      '/assets/models/nature/trees/',
      'oak_tree.glb'
    );
  }
}
```

**Biome Presets** (Lines 33-100):
- Each biome has `treeAssetSetId` (e.g., 'temperate_forest', 'desert')
- Asset set IDs used for lookup but paths still hardcoded

**Refactor Needed**:
- Remove `initializeAssets()` world type checks
- Add `loadFromCollection(assets: CollectionAssets)` method
- Use collection assets for tree models
- Remove hardcoded tree paths

---

### 5. `client/src/components/3DGame/BabylonGame.ts`

**Purpose**: Main game class that orchestrates all 3D systems

**Current State**: ✅ **Already Collection-Ready**

**Good Patterns** (Lines 314-321, 794-877):
```typescript
// Stores world 3D config with asset IDs
private world3DConfig: {
  buildingModels?: Record<string, string>;  // role → asset ID
  natureModels?: Record<string, string>;
  characterModels?: Record<string, string>;
  objectModels?: Record<string, string>;
} | null = null;

// Loads models from visual assets by ID
private async applyWorld3DConfig(worldAssets, config3D) {
  // Resolves asset IDs to actual VisualAsset objects
  // Loads models via SceneLoader from asset.filePath
  // Registers models with generators
}
```

**Integration Points** (Lines 668-673):
```typescript
// Currently calls generator initialization with world type
await this.buildingGenerator.initializeAssets(this.config.worldType);
await this.natureGenerator.initializeAssets(this.config.worldType);
```

**Refactor Needed**:
- Replace generator `initializeAssets()` calls with collection loader
- Pass resolved collection assets to generators
- Remove world type parameter from initialization

---

## Proposed Solution

### New Service: `AssetCollectionLoader`

**Location**: `client/src/services/AssetCollectionLoader.ts` ✅ Created

**Responsibilities**:
1. Fetch world's selected asset collection
2. Fetch world's 3D config (asset ID mappings)
3. Resolve asset IDs to `VisualAsset` objects
4. Organize assets by category (building, nature, character, object)
5. Provide role-based asset lookup (e.g., "smallResidence", "defaultTree")

**Usage**:
```typescript
const loader = new AssetCollectionLoader(worldId, collectionId);
const assets = await loader.load();

// Get specific assets by role
const smallHouse = loader.getBuildingModel('smallResidence', assets);
const tree = loader.getNatureModel('defaultTree', assets);
const npc = loader.getCharacterModel('npcDefault', assets);
const chest = loader.getObjectModel('chest', assets);
```

---

## Refactor Sequence

### Step 1: Update World Generation ⏳

**File**: `server/services/world-3d-defaults.ts`

**Changes**:
1. Create default asset collections for each world type preset
2. Assign `selectedAssetCollectionId` on world creation
3. Remove hardcoded path constants
4. Use collection resolver instead of creating per-world assets

**New Flow**:
```typescript
// Instead of creating assets with hardcoded paths:
const buildingAsset = await findOrCreateModelAsset(world, {
  filePath: "assets/models/buildings/medieval/house_small.glb",
  // ...
});

// Use collection assignment:
const collection = await findOrCreateCollection('medieval-fantasy');
await storage.updateWorld(worldId, {
  selectedAssetCollectionId: collection.id
});
```

---

### Step 2: Refactor Building Generator ⏳

**File**: `client/src/components/3DGame/ProceduralBuildingGenerator.ts`

**Changes**:
1. Remove `initializeAssets(worldType)` method
2. Add `loadFromCollection(assets: CollectionAssets)` method
3. Remove world type conditionals
4. Accept `VisualAsset` objects instead of constructing paths

**New API**:
```typescript
// Old:
await buildingGenerator.initializeAssets(worldType);

// New:
const collectionAssets = await assetLoader.load();
await buildingGenerator.loadFromCollection(collectionAssets);
```

---

### Step 3: Refactor Nature Generator ⏳

**File**: `client/src/components/3DGame/ProceduralNatureGenerator.ts`

**Changes**: Same pattern as building generator

---

### Step 4: Update BabylonGame Integration ⏳

**File**: `client/src/components/3DGame/BabylonGame.ts`

**Changes**:
1. Import and use `AssetCollectionLoader`
2. Replace generator initialization calls
3. Pass collection assets to generators

**New Flow**:
```typescript
// In loadWorldData():
const collectionId = (world as any).selectedAssetCollectionId;
const assetLoader = new AssetCollectionLoader(worldId, collectionId);
const collectionAssets = await assetLoader.load();

// Pass to generators:
await this.buildingGenerator.loadFromCollection(collectionAssets);
await this.natureGenerator.loadFromCollection(collectionAssets);
```

---

### Step 5: Reorganize Asset Files ⏳

**Current Structure**:
```
public/assets/models/
├── buildings/
│   ├── medieval/
│   └── futuristic/
├── nature/
│   └── trees/
│       ├── oak_tree.glb
│       └── futuristic/
└── props/
    ├── fantasy/
    ├── futuristic/
    └── historical/
```

**Target Structure**:
```
public/assets/collections/
├── medieval-fantasy/
│   ├── buildings/
│   ├── nature/
│   └── props/
├── sci-fi-city/
│   ├── buildings/
│   ├── nature/
│   └── props/
└── generic/
    ├── buildings/
    ├── nature/
    └── props/
```

**Migration Script Needed**:
- Move files to collection folders
- Update database `filePath` values
- Create temporary symlinks for backward compatibility

---

### Step 6: Update Polyhaven Downloader ⏳

**File**: `client/scripts/polyhaven-models.js`

**Changes**:
1. Accept collection name parameter
2. Download to collection-based paths
3. Remove world type subdirectories

**New Usage**:
```bash
# Old:
node scripts/polyhaven-models.js

# New:
node scripts/polyhaven-models.js --collection medieval-fantasy
node scripts/polyhaven-models.js --collection sci-fi-city
```

---

## Benefits of Refactor

1. **No Hardcoded Paths**: All assets referenced by ID through collections
2. **Flexible Assignment**: Change world's assets by switching collection
3. **No Duplication**: Assets shared across worlds via collections
4. **Easier Management**: Admin UI for collection management
5. **Cleaner Code**: No world type conditionals in generators
6. **Better Organization**: Assets grouped by theme, not scattered by type
7. **Extensibility**: Add new collections without code changes

---

## Next Steps

1. ✅ Create `AssetCollectionLoader` service
2. ✅ Document refactor plan
3. ⏳ Update world generation to assign collections
4. ⏳ Refactor building generator
5. ⏳ Refactor nature generator
6. ⏳ Update BabylonGame integration
7. ⏳ Create asset reorganization migration script
8. ⏳ Update polyhaven downloader

---

## Related Files

- **Plan**: `/docs/ASSET_COLLECTION_REFACTOR_PLAN.md`
- **Loader**: `/client/src/services/AssetCollectionLoader.ts`
- **Schema**: `/shared/schema.ts` (World.selectedAssetCollectionId)
- **Resolver**: `/server/services/asset-collection-resolver.ts`
- **Migration**: `/server/migrations/add-asset-collection-fields.sql`
