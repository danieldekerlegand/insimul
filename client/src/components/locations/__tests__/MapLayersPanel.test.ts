/**
 * Tests for MapLayersPanel layer configuration and filtering.
 *
 * Run with: npx tsx client/src/components/locations/__tests__/MapLayersPanel.test.ts
 */

import { ALL_LAYERS, type MapLayer } from '../MapLayersPanel';

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

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('\n=== MapLayersPanel ===\n');

// Test 1: ALL_LAYERS contains expected layers
console.log('-- ALL_LAYERS constant --');
{
  const expected: MapLayer[] = ['terrain', 'streets', 'buildings', 'water', 'labels', 'districts'];
  assert(ALL_LAYERS.length === expected.length, `ALL_LAYERS has ${expected.length} entries`);
  for (const layer of expected) {
    assert(ALL_LAYERS.includes(layer), `ALL_LAYERS includes '${layer}'`);
  }
}

// Test 2: Set toggle logic (simulates onToggleLayer)
console.log('\n-- Layer toggle logic --');
{
  const visibleLayers = new Set<MapLayer>(ALL_LAYERS);
  assert(visibleLayers.size === ALL_LAYERS.length, 'All layers visible initially');

  // Toggle off 'streets'
  visibleLayers.delete('streets');
  assert(!visibleLayers.has('streets'), 'Streets layer hidden after toggle off');
  assert(visibleLayers.has('buildings'), 'Buildings layer still visible');

  // Toggle 'streets' back on
  visibleLayers.add('streets');
  assert(visibleLayers.has('streets'), 'Streets layer visible after toggle on');

  // Toggle off multiple layers
  visibleLayers.delete('water');
  visibleLayers.delete('labels');
  assert(visibleLayers.size === ALL_LAYERS.length - 2, 'Two layers hidden');
  assert(!visibleLayers.has('water'), 'Water hidden');
  assert(!visibleLayers.has('labels'), 'Labels hidden');
}

// Test 3: Layer availability per view level
console.log('\n-- Layer availability by view level --');
{
  // Mimics LAYER_META filtering logic from the component
  const LAYER_VIEWS: Record<MapLayer, string[]> = {
    terrain:   ['world', 'country', 'settlement'],
    districts: ['world', 'country'],
    streets:   ['settlement'],
    buildings: ['country', 'settlement'],
    water:     ['world', 'country', 'settlement'],
    labels:    ['world', 'country', 'settlement'],
  };

  const worldLayers = ALL_LAYERS.filter(l => LAYER_VIEWS[l].includes('world'));
  assert(worldLayers.includes('terrain'), 'World view has terrain');
  assert(worldLayers.includes('districts'), 'World view has districts');
  assert(worldLayers.includes('water'), 'World view has water');
  assert(worldLayers.includes('labels'), 'World view has labels');
  assert(!worldLayers.includes('streets'), 'World view does NOT have streets');
  assert(!worldLayers.includes('buildings'), 'World view does NOT have buildings');

  const settlementLayers = ALL_LAYERS.filter(l => LAYER_VIEWS[l].includes('settlement'));
  assert(settlementLayers.includes('streets'), 'Settlement view has streets');
  assert(settlementLayers.includes('buildings'), 'Settlement view has buildings');
  assert(settlementLayers.includes('terrain'), 'Settlement view has terrain');
  assert(settlementLayers.includes('water'), 'Settlement view has water');
  assert(settlementLayers.includes('labels'), 'Settlement view has labels');
  assert(!settlementLayers.includes('districts'), 'Settlement view does NOT have districts');

  const countryLayers = ALL_LAYERS.filter(l => LAYER_VIEWS[l].includes('country'));
  assert(countryLayers.includes('buildings'), 'Country view has buildings');
  assert(countryLayers.includes('districts'), 'Country view has districts');
  assert(!countryLayers.includes('streets'), 'Country view does NOT have streets');
}

// Test 4: MapLayer type is a union of specific strings
console.log('\n-- Type safety --');
{
  const validLayers: MapLayer[] = ['terrain', 'streets', 'buildings', 'water', 'labels', 'districts'];
  for (const layer of validLayers) {
    assert(typeof layer === 'string', `'${layer}' is a valid MapLayer string`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
