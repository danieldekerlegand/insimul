-- Remove worldId field from asset_collections table
-- Asset collections should be reusable across multiple worlds

-- For PostgreSQL (if using Drizzle with PostgreSQL)
ALTER TABLE asset_collections DROP COLUMN IF EXISTS world_id;

-- Note: For MongoDB, this migration is handled by the application layer
-- The field will simply be ignored when querying/creating collections
