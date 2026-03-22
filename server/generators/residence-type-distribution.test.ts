/**
 * Tests for diverse residence type generation during settlement creation.
 *
 * Run: npx tsx server/generators/residence-type-distribution.test.ts
 */

import { GeographyGenerator } from './geography-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ✓ ${msg}`);
    passed++;
  }
}

const gen = new GeographyGenerator();
const validTypes = new Set(['house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home']);

// --- Determinism ---
console.log('\n=== Determinism ===');
{
  const a = gen.getResidenceType('town', 42);
  const b = gen.getResidenceType('town', 42);
  assert(a === b, 'Same seed produces same result');
  assert(validTypes.has(a), `Result "${a}" is a valid residence type`);
}

// --- All types produced for each settlement type ---
for (const settlementType of ['village', 'town', 'city']) {
  console.log(`\n=== Distribution for ${settlementType} ===`);
  const counts: Record<string, number> = {};
  const sampleSize = 1000;

  for (let i = 0; i < sampleSize; i++) {
    const t = gen.getResidenceType(settlementType, i);
    assert(validTypes.has(t), `Seed ${i}: "${t}" is valid (skipping further logs)`);
    counts[t] = (counts[t] || 0) + 1;
    // Only log first few to avoid noise
    if (i >= 2) {
      // still counting, just suppress assert logs
      passed--; // undo the passed++ from assert to avoid inflating count
    }
  }
  passed++; // count the whole batch as one pass

  console.log(`  Distribution (n=${sampleSize}):`);
  for (const [type, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / sampleSize) * 100).toFixed(1);
    console.log(`    ${type}: ${count} (${pct}%)`);
  }

  // Every type should appear at least once in 1000 samples
  for (const type of validTypes) {
    assert((counts[type] || 0) > 0, `${settlementType} produces "${type}" residences`);
  }
}

// --- Settlement-type-specific distribution characteristics ---
console.log('\n=== Distribution characteristics ===');
{
  function getDistribution(settlementType: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      const t = gen.getResidenceType(settlementType, i);
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }

  const city = getDistribution('city');
  const village = getDistribution('village');

  // Cities should have more apartments than villages
  assert(
    (city['apartment'] || 0) > (village['apartment'] || 0),
    'Cities produce more apartments than villages'
  );

  // Villages should have more cottages than cities
  assert(
    (village['cottage'] || 0) > (city['cottage'] || 0),
    'Villages produce more cottages than cities'
  );

  // Villages should have more mobile homes than cities
  assert(
    (village['mobile_home'] || 0) > (city['mobile_home'] || 0),
    'Villages produce more mobile homes than cities'
  );

  // Cities should have more townhouses than villages
  assert(
    (city['townhouse'] || 0) > (village['townhouse'] || 0),
    'Cities produce more townhouses than villages'
  );
}

// --- Unknown settlement type falls back to town weights ---
console.log('\n=== Fallback behavior ===');
{
  const result = gen.getResidenceType('unknown_type', 7);
  assert(validTypes.has(result), `Unknown settlement type falls back gracefully: "${result}"`);
}

// --- Different seeds produce variety ---
console.log('\n=== Variety across seeds ===');
{
  const types = new Set<string>();
  for (let i = 0; i < 50; i++) {
    types.add(gen.getResidenceType('town', i));
  }
  assert(types.size >= 4, `50 seeds produce at least 4 distinct types (got ${types.size})`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
