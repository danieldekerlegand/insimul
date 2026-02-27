#!/usr/bin/env tsx
/**
 * Verify Polyhaven texture IDs are valid by checking the API.
 * Usage: npx tsx server/migrations/verify-texture-ids.ts
 */
import https from 'https';

function checkTextureId(id: string): Promise<{ id: string; valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const url = `https://api.polyhaven.com/files/${id}`;
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        resolve({ id, valid: false, error: `HTTP ${res.statusCode}` });
      } else {
        resolve({ id, valid: true });
      }
      res.resume();
    }).on('error', (err) => {
      resolve({ id, valid: false, error: err.message });
    });
  });
}

async function main() {
  // IDs currently in use (already known to work from migration)
  const existingIds = [
    'forest_floor', 'cobblestone_floor_01', 'asphalt_01', 'metal_grate_rusty',
    'metal_plate', 'concrete_floor', 'gravel_floor', 'cobblestone_floor_01',
    'old_wood_floor', 'dirt', 'forrest_ground_01', 'cobblestone_floor_02',
    'castle_brick_01', 'medieval_blocks_02', 'mossy_cobblestone', 'old_stone_wall',
    'mossy_brick_floor', 'brown_mud', 'marble_01'
  ];

  // Candidate wall textures
  const wallCandidates = [
    'brick_wall_001', 'brick_wall_003', 'brick_wall_006',
    'castle_brick_01', 'old_stone_wall',
    'concrete_wall_001', 'concrete_wall_003', 'concrete_wall_004',
    'plaster_wall_001', 'plaster_wall_01',
    'stone_wall', 'stone_wall_02', 'stone_wall_04',
    'medieval_wall_01', 'medieval_blocks_02',
    'wood_planks_01', 'old_planks_02', 'old_planks_01',
    'rusty_metal', 'rusty_metal_01',
    'metal_plate', 'corrugated_iron',
    'wooden_planks', 'wooden_planks_01',
    'half_timbered_wall_01',
  ];

  // Candidate roof textures
  const roofCandidates = [
    'roof_tiles', 'roof_tiles_01', 'roof_tiles_02',
    'clay_roof_tiles', 'roof_slates',
    'wooden_planks', 'old_wood_floor',
    'rusty_metal', 'corrugated_iron',
    'thatch', 'thatch_01', 'thatch_roof',
    'slate_floor', 'slate_tiles',
    'terracotta_tiles', 'terracotta_floor',
    'copper_01', 'patina_01',
    'metal_roof_01',
  ];

  // Candidate ground/road replacements
  const groundReplacements = [
    'forest_floor', 'grass_01', 'grass_field',
    'forrest_ground_01', 'mud_01', 'brown_mud',
    'rocky_terrain', 'rocky_trail', 'rock_ground',
    'snow_01', 'snow_field_aerial',
    'sand_01', 'beach_sand',
    'dark_soil', 'dark_ground',
    'dry_ground', 'dried_clay_mud',
    'mossy_ground', 'moss_01',
  ];

  const allIds = Array.from(new Set([...existingIds, ...wallCandidates, ...roofCandidates, ...groundReplacements]));

  console.log(`Checking ${allIds.length} texture IDs against Polyhaven API...\n`);

  // Check in batches of 5 to avoid overwhelming the API
  const results: { id: string; valid: boolean; error?: string }[] = [];
  for (let i = 0; i < allIds.length; i += 5) {
    const batch = allIds.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(checkTextureId));
    results.push(...batchResults);
    // Small delay between batches
    await new Promise(r => setTimeout(r, 200));
  }

  const valid = results.filter(r => r.valid).map(r => r.id);
  const invalid = results.filter(r => !r.valid).map(r => r.id);

  console.log('=== VALID TEXTURE IDS ===');
  valid.forEach(id => console.log(`  ✅ ${id}`));

  console.log(`\n=== INVALID TEXTURE IDS (${invalid.length}) ===`);
  invalid.forEach(id => console.log(`  ❌ ${id}`));

  // Categorize valid IDs
  console.log('\n=== VALID WALL TEXTURES ===');
  wallCandidates.filter(id => valid.includes(id)).forEach(id => console.log(`  ${id}`));

  console.log('\n=== VALID ROOF TEXTURES ===');
  roofCandidates.filter(id => valid.includes(id)).forEach(id => console.log(`  ${id}`));

  console.log('\n=== VALID GROUND REPLACEMENTS ===');
  groundReplacements.filter(id => valid.includes(id)).forEach(id => console.log(`  ${id}`));
}

main().catch(console.error);
