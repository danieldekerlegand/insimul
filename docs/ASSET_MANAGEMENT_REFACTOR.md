# Asset Management Refactor

## Overview

This refactor centralizes asset management in Insimul by moving it from per-world management to a centralized Admin Panel system. Asset collections are now managed globally by admins and can be assigned to worlds.

**Key Change:** The `world3DConfig` field has been completely removed. All 3D configuration is now derived from asset collections, with automatic fallback to a default collection if none is selected.

## Key Changes

### 1. Schema Updates

#### `worlds` Table
- **Added**: `selected_asset_collection_id` (VARCHAR) - References the asset collection a world uses

#### `asset_collections` Table
Enhanced to support complete theme management:
- **Added**: `world_type` (TEXT) - Theme identifier (e.g., "medieval-fantasy", "cyberpunk")
- **Added**: `building_models` (JSONB) - Map of building roles to asset IDs
- **Added**: `nature_models` (JSONB) - Map of nature model roles to asset IDs
- **Added**: `character_models` (JSONB) - Map of character model roles to asset IDs
- **Added**: `object_models` (JSONB) - Map of object/prop roles to asset IDs
- **Added**: `ground_texture_id` (VARCHAR) - Ground texture asset ID
- **Added**: `road_texture_id` (VARCHAR) - Road texture asset ID
- **Added**: `created_by` (VARCHAR) - Admin user ID who created the collection
- **Updated**: `collection_type` now supports: `complete_theme`, `texture_pack`, `character_set`, `building_set`, `prop_set`, `map_atlas`

### 2. Frontend Changes

#### New Component: `AssetCollectionManager`
- Location: `/client/src/components/AssetCollectionManager.tsx`
- Features:
  - Create/edit/delete asset collections
  - Manage assets within collections
  - Set world type and collection metadata
  - Generate assets for collections
  - Browse collection assets

#### Admin Panel Simplification
- **Removed**: Geography, Characters, Rules & Actions, and Content tabs
- **Renamed**: "Base Resources" → "Base Rules & Actions"
- **Added**: New "Assets" tab with `AssetCollectionManager`
- **Simplified**: Now only 3 tabs: Worlds, Assets, Base Rules & Actions
- **Access**: Admin-only functionality

#### World Details Modal Simplification
- **Removed**: Separate "Assets", "Collections", and "3D Config" tabs
- **Added**: Simple asset collection selector in "Settings" tab
- **Behavior**: 
  - Non-admins can only select from existing collections
  - Admins must use Admin Panel to create/modify collections
  - Shows collection details when selected

#### Component Updates
- **`VisualAssetGeneratorDialog`**: Extended `entityType` to support `'collection'`
- **`AssetBrowserDialog`**: Added `collectionId` prop for browsing collection assets

### 3. Backend Services

#### New Service: `asset-collection-resolver.ts`
- Location: `/server/services/asset-collection-resolver.ts`
- Purpose: Resolves 3D configuration from asset collections
- Features:
  - `getWorld3DConfigForWorld()`: Gets 3D config for a world, with default fallback
  - `updateWorld3DConfig()`: Updates 3D config by modifying the world's asset collection
  - `getDefaultAssetCollection()`: Finds a suitable default collection
- Fallback Logic:
  1. Try to use world's `selectedAssetCollectionId`
  2. If none selected, look for a collection named "Default" or "Generic"
  3. If none found, use the first public collection
  4. If no collections exist, return empty config

#### Updated Routes
- `GET /api/worlds/:worldId/3d-config`: Now resolves from asset collections
- `PATCH /api/worlds/:worldId/3d-config`: Now updates the world's asset collection

### 4. Database Migration

Run the migration script:
```bash
psql -d insimul -f server/migrations/add-asset-collection-fields.sql
```

The migration:
- Adds new columns to `worlds` and `asset_collections` tables
- Creates indexes for performance
- Adds documentation comments

### 4. Backend Routes (To Be Implemented)

The following routes need to be verified/implemented:

```typescript
// Global asset collections (admin only)
GET    /api/asset-collections?global=true
POST   /api/asset-collections
PATCH  /api/asset-collections/:id
DELETE /api/asset-collections/:id

// Collection assets
GET    /api/asset-collections/:id/assets
POST   /api/asset-collections/:id/assets

// World collection assignment
PATCH  /api/worlds/:id { selectedAssetCollectionId: string }
```

## Migration Guide

### For Existing Worlds

1. **Run Database Migration**
   ```bash
   psql -d insimul -f server/migrations/add-asset-collection-fields.sql
   ```

2. **Create Default Collections**
   - Log in as admin
   - Navigate to Admin Panel > Assets tab
   - Create collections for common themes:
     - Medieval Fantasy
     - Cyberpunk
     - Sci-Fi Space
     - Historical
     - Modern
     - Generic

3. **Migrate Existing World Assets** (Required)
   - **Important:** The old `world3DConfig` is no longer used
   - For each world:
     - If it has custom 3D assets, create a dedicated collection for it
     - Otherwise, assign it to an appropriate theme collection
     - Or leave it unassigned to use the default collection
   - Old `world3DConfig` data is ignored but not deleted (for rollback safety)

4. **Assign Collections to Worlds**
   - Open World Details for each world
   - Go to Settings tab
   - Select appropriate asset collection
   - Save changes

### For New Worlds

1. Admins create asset collections in Admin Panel
2. Users select a collection when creating/editing worlds
3. The 3D game automatically uses assets from the selected collection

## Benefits

### For Admins
- **Centralized Management**: All asset collections in one place
- **Reusability**: Create once, use across multiple worlds
- **Consistency**: Ensure themed worlds use matching assets
- **Efficiency**: Batch generate assets for themes

### For Users
- **Simplicity**: Just select a collection, no complex asset management
- **Quality**: Curated collections by admins
- **Focus**: Spend time on world building, not asset hunting

### For Developers
- **Cleaner Code**: Separation of concerns
- **Better UX**: Simplified World Details modal
- **Scalability**: Easy to add new collection types
- **Maintainability**: Centralized asset logic

## Asset Collection Structure

### Complete Theme Collection
```json
{
  "id": "uuid",
  "name": "Medieval Fantasy Pack",
  "collectionType": "complete_theme",
  "worldType": "medieval-fantasy",
  "description": "Complete set of medieval fantasy assets",
  "assetIds": ["asset-1", "asset-2", "..."],
  "buildingModels": {
    "default": "asset-id",
    "smallResidence": "asset-id",
    "largeResidence": "asset-id"
  },
  "natureModels": {
    "defaultTree": "asset-id"
  },
  "characterModels": {
    "npcDefault": "asset-id",
    "civilian": "asset-id",
    "guard": "asset-id"
  },
  "objectModels": {
    "chest": "asset-id",
    "sword": "asset-id",
    "shield": "asset-id"
  },
  "groundTextureId": "asset-id",
  "roadTextureId": "asset-id",
  "isPublic": true,
  "isActive": true
}
```

## World Types

Supported world types for collections:
- `medieval-fantasy`
- `high-fantasy`
- `low-fantasy`
- `dark-fantasy`
- `cyberpunk`
- `sci-fi-space`
- `post-apocalyptic`
- `solarpunk`
- `steampunk`
- `dieselpunk`
- `historical-ancient`
- `historical-medieval`
- `historical-renaissance`
- `historical-victorian`
- `wild-west`
- `modern`
- `generic`

## Future Enhancements

1. **Collection Templates**: Pre-built templates for common themes
2. **Asset Marketplace**: Share collections between users
3. **Version Control**: Track collection changes over time
4. **Bulk Import**: Import entire asset packs at once
5. **AI Generation**: Auto-generate complete themed collections
6. **Collection Inheritance**: Base collections with overrides
7. **Asset Variants**: Multiple style variants per collection

## World3DConfig Removal

### What Changed
- **Before**: Worlds stored 3D config directly in `config.world3DConfig`
- **After**: Worlds reference an asset collection via `selectedAssetCollectionId`
- **Benefit**: Single source of truth, no duplication, easier management

### How It Works Now
1. World has `selectedAssetCollectionId` (optional)
2. Backend resolver service:
   - Looks up the selected collection
   - If none, finds a default collection
   - Converts collection to `World3DConfig` format
3. Frontend/3D game receives the same format as before
4. Updates modify the collection, not the world directly

### Compatibility
- The `/api/worlds/:worldId/3d-config` endpoints still work
- They now read from/write to asset collections
- Old `world3DConfig` data is preserved but ignored
- This allows for easy rollback if needed

## Rollback Plan

If issues arise, you can rollback:

1. **Database**: 
   ```sql
   ALTER TABLE worlds DROP COLUMN IF EXISTS selected_asset_collection_id;
   ALTER TABLE asset_collections 
     DROP COLUMN IF EXISTS world_type,
     DROP COLUMN IF EXISTS building_models,
     DROP COLUMN IF EXISTS nature_models,
     DROP COLUMN IF EXISTS character_models,
     DROP COLUMN IF EXISTS object_models,
     DROP COLUMN IF EXISTS ground_texture_id,
     DROP COLUMN IF EXISTS road_texture_id,
     DROP COLUMN IF EXISTS created_by;
   ```

2. **Frontend**: Revert commits to restore old World Details tabs

3. **Worlds**: Will continue using their existing `config.world3DConfig`

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Admin can create asset collections
- [ ] Admin can edit asset collections
- [ ] Admin can delete asset collections
- [ ] Admin can generate assets for collections
- [ ] Admin can browse collection assets
- [ ] User can view available collections
- [ ] User can assign collection to world
- [ ] World uses collection assets in 3D game
- [ ] Non-admin cannot create collections
- [ ] Collection selector shows correct metadata
- [ ] World Details modal simplified correctly
- [ ] Admin Panel Assets tab works properly

## Support

For questions or issues:
1. Check this documentation
2. Review the migration script
3. Inspect the AssetCollectionManager component
4. Test in development environment first
