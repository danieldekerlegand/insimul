-- Remove entity-specific fields and unused flags from visual_assets table
-- Assets are now organized through asset collections, not directly linked to entities

-- For PostgreSQL (if using Drizzle with PostgreSQL)
ALTER TABLE visual_assets DROP COLUMN IF EXISTS character_id;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS business_id;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS settlement_id;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS country_id;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS state_id;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS is_public;
ALTER TABLE visual_assets DROP COLUMN IF EXISTS is_active;

-- Note: For MongoDB, these fields will simply be ignored when querying/creating assets
-- The application layer handles the schema changes
