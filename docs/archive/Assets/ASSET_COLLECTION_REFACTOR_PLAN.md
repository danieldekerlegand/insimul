# Asset Collection Refactor Plan

## Overview

This document outlines the refactoring of the 3D asset loading system from hardcoded paths to collection-based asset management.

## Current State Analysis

### Files with Hardcoded Asset References

1. **`client/scripts/polyhaven-models.js`**
   - Downloads models to hardcoded paths organized by world type
   - Example: `public/assets/models/buildings/medieval/house_small.glb`
   - **Issue**: Assets organized by world type subdirectories

2. **`server/services/world-3d-defaults.ts`**
   - Hardcoded constants: `DEFAULT_BUILDING_MODEL_PATH`, `FUTURISTIC_BUILDING_MODEL_PATH`
   - `getWorldTypePreset()` maps world types to specific file paths
   - Creates visual assets with hardcoded `filePath` values
   - **Issue**: World type logic baked into asset selection

3. **`client/src/components/3DGame/ProceduralBuildingGenerator.ts`**
   - `initializeAssets()` checks world type and loads from type-specific paths
   - Example: `/assets/models/buildings/medieval/` or `/futuristic/`
   - **Issue**: Direct path construction based on world type

4. **`client/src/components/3DGame/ProceduralNatureGenerator.ts`**
   - Similar hardcoded paths for trees: `/assets/models/nature/trees/oak_tree.glb`
   - Biome presets with `treeAssetSetId` but paths are hardcoded
   - **Issue**: Asset paths tied to biome/world type

5. **`client/src/components/3DGame/BabylonGame.ts`**
   - **Good**: Already uses `world3DConfig` with asset IDs
   - `applyWorld3DConfig()` loads models from visual assets by ID
   - **Status**: Mostly collection-ready, needs generator integration

## Target Architecture

### Asset Organization

**Before** (world type subdirectories):
```
public/assets/
├── models/
│   ├── buildings/
│   │   ├── medieval/
│   │   │   └── house_small.glb
│   │   └── futuristic/
│   │       └── futuristic_building.glb
│   ├── nature/
│   │   └── trees/
│   │       ├── oak_tree.glb
│   │       └── futuristic/
│   │           └── alien_tree.glb
│   └── props/
│       ├── fantasy/
│       ├── futuristic/
│       └── historical/
```

**After** (collection-based):
```
public/assets/
├── collections/
│   ├── medieval-fantasy/
│   │   ├── buildings/
│   │   │   ├── house_small.glb
│   │   │   └── tavern.glb
│   │   ├── nature/
│   │   │   └── oak_tree.glb
│   │   └── props/
│   │       ├── chest.glb
│   │       └── sword.glb
│   ├── sci-fi-city/
│   │   ├── buildings/
│   │   │   └── futuristic_building.glb
│   │   ├── nature/
│   │   │   └── alien_tree.glb
│   │   └── props/
│   │       └── data_pad.glb
│   └── generic/
│       ├── buildings/
│       ├── nature/
│       └── props/
```

### Data Flow

1. **World Creation**
   - World type preset determines initial `selectedAssetCollectionId`
   - Fallback to "generic" or first public collection if none matches

2. **Asset Loading**
   - `AssetCollectionLoader` fetches world's selected collection
   - Resolves asset IDs from `world3DConfig` to actual `VisualAsset` objects
   - Generators receive resolved assets, not hardcoded paths

3. **Runtime**
   - Generators load models from collection assets
   - No world type checks or path construction
   - All assets referenced by ID through collection

## Implementation Steps

### Phase 1: Create Collection Loader Service ✅

- [x] Create `client/src/services/AssetCollectionLoader.ts`
- [x] Implement asset resolution by role (building, nature, character, object)
- [x] Support fallback to default assets when specific roles not found

### Phase 2: Update World Generation

- [ ] Modify `server/services/world-3d-defaults.ts`:
  - Remove hardcoded path constants
  - Update `getWorldTypePreset()` to return collection name instead of paths
  - Create/assign asset collection based on world type
  - Populate collection with appropriate assets

- [ ] Create default asset collections:
  - Medieval Fantasy Collection
  - Sci-Fi/Futuristic Collection
  - Historical Collection
  - Generic/Default Collection

### Phase 3: Refactor Procedural Generators

- [ ] Update `ProceduralBuildingGenerator.ts`:
  - Remove `initializeAssets()` world type checks
  - Add `loadFromCollection(assets: CollectionAssets)` method
  - Use collection assets instead of hardcoded paths
  - Remove `assetSetId` and path construction logic

- [ ] Update `ProceduralNatureGenerator.ts`:
  - Remove `initializeAssets()` world type checks
  - Add `loadFromCollection(assets: CollectionAssets)` method
  - Use collection assets for trees and vegetation
  - Remove hardcoded biome asset paths

### Phase 4: Update BabylonGame Integration

- [ ] Modify `BabylonGame.ts`:
  - Integrate `AssetCollectionLoader`
  - Pass resolved assets to generators
  - Remove direct `initializeAssets()` calls
  - Use collection loader for all asset resolution

### Phase 5: Reorganize Asset Files

- [ ] Create migration script to reorganize assets:
  - Move files from world-type subdirectories to collection folders
  - Update database `filePath` values
  - Create symlinks for backward compatibility (temporary)

- [ ] Update `polyhaven-models.js`:
  - Download to collection-based paths
  - Remove world type subdirectories
  - Support collection parameter

### Phase 6: Database Seeding

- [ ] Create asset collection seed data:
  - Define collections with metadata
  - Associate assets with collections
  - Set up default collection for each world type

- [ ] Update world seeding:
  - Assign `selectedAssetCollectionId` on world creation
  - Use collection resolver for 3D config

## Migration Guide

### For Existing Worlds

1. **Automatic Migration**:
   - Script identifies world type from `config.worldType`
   - Finds or creates matching asset collection
   - Updates `selectedAssetCollectionId`
   - Migrates `config.world3DConfig` to collection

2. **Manual Override**:
   - Admin can reassign collection via World Management UI
   - Collection change immediately affects 3D game assets

### For New Assets

1. **Upload to Collection**:
   - Assets uploaded via Asset Collection Manager
   - Organized by collection, not world type
   - Assigned semantic roles (e.g., "smallResidence", "defaultTree")

2. **Reference in Config**:
   - Collection's 3D config maps roles to asset IDs
   - Generators use roles to find appropriate assets
   - No hardcoded paths anywhere

## Fallback Strategy

### When No Collection Selected

1. Try to find collection matching world type
2. Look for collection named "Default" or "Generic"
3. Use first public collection
4. Fall back to procedural generation (primitives)

### When Asset Missing from Collection

1. Try default role (e.g., "default" building instead of "tavern")
2. Fall back to procedural generation
3. Log warning for admin to add missing asset

## Benefits

1. **Single Source of Truth**: Assets managed in one place
2. **Flexible Assignment**: Change world's entire asset set by switching collection
3. **Easier Management**: Admin UI for collection management
4. **No Duplication**: Same assets reused across worlds
5. **Cleaner Code**: No world type conditionals in generators
6. **Better Organization**: Assets grouped by theme/collection, not scattered by type
7. **Extensibility**: Easy to add new collections without code changes

## Testing Plan

1. **Unit Tests**:
   - AssetCollectionLoader resolution logic
   - Fallback behavior
   - Role mapping

2. **Integration Tests**:
   - World creation with collection assignment
   - Asset loading in 3D game
   - Collection switching

3. **Manual Testing**:
   - Create world with each preset type
   - Verify correct assets load
   - Switch collections and verify changes
   - Test fallback scenarios

## Rollout Plan

1. **Phase 1**: Create loader service (non-breaking)
2. **Phase 2**: Update world generation (backward compatible)
3. **Phase 3**: Refactor generators (feature flag)
4. **Phase 4**: Migrate existing worlds
5. **Phase 5**: Remove old code paths
6. **Phase 6**: Reorganize asset files

## Success Criteria

- [ ] No hardcoded asset paths in generator code
- [ ] All worlds have assigned asset collection
- [ ] 3D game loads assets from collection
- [ ] Admin can switch collections via UI
- [ ] Asset folder organized by collection
- [ ] Fallback logic works correctly
- [ ] Documentation updated
- [ ] Tests passing
