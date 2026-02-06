-- Migration: Remove unused fields from worlds table
-- Date: 2024-12-21
-- Description: Removes sourceFormats, worldData, and historicalEvents fields that are no longer used

-- Drop the unused columns from worlds table
ALTER TABLE worlds 
  DROP COLUMN IF EXISTS world_data,
  DROP COLUMN IF EXISTS historical_events;

-- Note: sourceFormats was not found in the current schema, so no action needed for it

-- Add comment to document the change
COMMENT ON TABLE worlds IS 'Enhanced worlds with procedural generation capabilities. Removed unused world_data and historical_events fields on 2024-12-21.';
