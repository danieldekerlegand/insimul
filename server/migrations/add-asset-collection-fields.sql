-- Migration: Add asset collection fields and centralize asset management
-- Date: 2024-12-21
-- Description: Adds selectedAssetCollectionId to worlds table and enhances asset_collections table
-- to support centralized asset management in Admin Panel

-- Add selectedAssetCollectionId to worlds table
ALTER TABLE worlds 
ADD COLUMN IF NOT EXISTS selected_asset_collection_id VARCHAR;

-- Add new fields to asset_collections table for centralized management
ALTER TABLE asset_collections
ADD COLUMN IF NOT EXISTS world_type TEXT,
ADD COLUMN IF NOT EXISTS building_models JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nature_models JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS character_models JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS object_models JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ground_texture_id VARCHAR,
ADD COLUMN IF NOT EXISTS road_texture_id VARCHAR,
ADD COLUMN IF NOT EXISTS created_by VARCHAR;

-- Update collection_type enum to include new types
-- Note: PostgreSQL doesn't easily allow enum modification, so we use TEXT type
-- Ensure collection_type accepts: complete_theme, texture_pack, character_set, building_set, prop_set, map_atlas

-- Create index on selected_asset_collection_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_worlds_selected_asset_collection 
ON worlds(selected_asset_collection_id);

-- Create index on world_type for filtering collections by theme
CREATE INDEX IF NOT EXISTS idx_asset_collections_world_type 
ON asset_collections(world_type);

-- Create index on is_public for filtering global collections
CREATE INDEX IF NOT EXISTS idx_asset_collections_is_public 
ON asset_collections(is_public);

-- Add comment to document the new field
COMMENT ON COLUMN worlds.selected_asset_collection_id IS 
'Reference to the asset collection this world uses for 3D models, textures, and props';

COMMENT ON COLUMN asset_collections.world_type IS 
'Theme/world type this collection is designed for (e.g., medieval-fantasy, cyberpunk, sci-fi-space)';

COMMENT ON COLUMN asset_collections.building_models IS 
'Map of building model roles to visual asset IDs (e.g., {"default": "asset-id", "smallResidence": "asset-id"})';

COMMENT ON COLUMN asset_collections.nature_models IS 
'Map of nature model roles to visual asset IDs (e.g., {"defaultTree": "asset-id"})';

COMMENT ON COLUMN asset_collections.character_models IS 
'Map of character model roles to visual asset IDs (e.g., {"npcDefault": "asset-id", "civilian": "asset-id"})';

COMMENT ON COLUMN asset_collections.object_models IS 
'Map of object/prop model roles to visual asset IDs (e.g., {"chest": "asset-id", "lantern": "asset-id"})';

COMMENT ON COLUMN asset_collections.ground_texture_id IS 
'Visual asset ID for the ground texture used in 3D game';

COMMENT ON COLUMN asset_collections.road_texture_id IS 
'Visual asset ID for the road texture used in 3D game';

COMMENT ON COLUMN asset_collections.created_by IS 
'User ID of the admin who created this collection';
