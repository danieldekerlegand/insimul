/**
 * Tests for settlement-subtype.ts — settlement subtype inference and config.
 *
 * Run with: npx tsx server/generators/settlement-subtype.test.ts
 */

import { inferSettlementSubtype, getSubtypeConfig, SettlementSubtype } from './settlement-subtype';
import type { GeographyConfig } from './geography-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function makeConfig(overrides: Partial<GeographyConfig> = {}): GeographyConfig {
  return {
    worldId: 'w1',
    settlementId: 's1',
    settlementName: 'Testville',
    settlementType: 'town',
    population: 500,
    foundedYear: 1200,
    terrain: 'plains',
    ...overrides,
  };
}

console.log('\n=== Settlement Subtype Tests ===\n');

// ── Terrain-primary inference ──
console.log('--- Terrain-primary inference ---');
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'coast', settlementType: 'city', population: 1000 }));
  assert(result === 'port_city', `coast + city => port_city (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'coast', settlementType: 'village', population: 100 }));
  assert(result === 'fishing_village', `coast + village => fishing_village (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'coast', settlementType: 'town', population: 500 }));
  assert(result === 'port_city', `coast + town + pop>=500 => port_city (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'mountains', settlementType: 'town', population: 400 }));
  assert(result === 'mining_town', `mountains + town + pop>=300 => mining_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'mountains', settlementType: 'village', population: 50 }));
  assert(result === 'cliff_dwelling', `mountains + village + pop<100 => cliff_dwelling (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'mountains', settlementType: 'village', population: 150 }));
  assert(result === 'mountain_village', `mountains + village + pop=150 => mountain_village (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'river' }));
  assert(result === 'river_crossing', `river => river_crossing (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'desert' }));
  assert(result === 'oasis_settlement', `desert => oasis_settlement (got ${result})`);
}

// ── Hills terrain ──
console.log('--- Hills terrain ---');
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'hills', settlementType: 'village', population: 100 }));
  assert(result === 'valley_town', `hills + village => valley_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'hills', settlementType: 'city', population: 2000 }));
  assert(result === 'fortress_town', `hills + city => fortress_town (got ${result})`);
}

// ── Plains/forest population-based ──
console.log('--- Plains/forest population-based ---');
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'plains', settlementType: 'city', population: 2000 }));
  assert(result === 'university_town', `plains + city + pop>=2000 => university_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'plains', settlementType: 'city', population: 800 }));
  assert(result === 'market_town', `plains + city + pop<2000 => market_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'plains', settlementType: 'town', population: 500 }));
  assert(result === 'crossroads_town', `plains + town => crossroads_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'forest', settlementType: 'town', population: 300 }));
  assert(result === 'crossroads_town', `forest + town => crossroads_town (got ${result})`);
}
{
  const result = inferSettlementSubtype(makeConfig({ terrain: 'plains', settlementType: 'village', population: 50 }));
  assert(result === 'standard', `plains + village => standard (got ${result})`);
}

// ── SubtypeConfig structure ──
console.log('--- SubtypeConfig structure ---');

const ALL_SUBTYPES: SettlementSubtype[] = [
  'port_city', 'mountain_village', 'river_crossing', 'mining_town',
  'fortress_town', 'oasis_settlement', 'fishing_village', 'crossroads_town',
  'university_town', 'market_town', 'cliff_dwelling', 'island_settlement',
  'valley_town', 'standard',
];

for (const subtype of ALL_SUBTYPES) {
  const cfg = getSubtypeConfig(subtype);
  assert(cfg !== undefined, `getSubtypeConfig('${subtype}') returns a config`);
  assert(Array.isArray(cfg.requiredLandmarkTypes) && cfg.requiredLandmarkTypes.length > 0,
    `${subtype} has requiredLandmarkTypes`);
  assert(typeof cfg.preferredStreetPattern === 'string' && cfg.preferredStreetPattern.length > 0,
    `${subtype} has preferredStreetPattern`);
  assert(Array.isArray(cfg.buildingStyleHints) && cfg.buildingStyleHints.length > 0,
    `${subtype} has buildingStyleHints`);
  assert(Array.isArray(cfg.specialFeatures) && cfg.specialFeatures.length > 0,
    `${subtype} has specialFeatures`);
}

// ── All 14 subtypes covered ──
console.log('--- Subtype count ---');
assert(ALL_SUBTYPES.length === 14, `14 subtypes defined (got ${ALL_SUBTYPES.length})`);

// ── Summary ──
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
