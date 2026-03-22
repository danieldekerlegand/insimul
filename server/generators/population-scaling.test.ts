/**
 * Tests for population-scaling.ts — population proportional to building count.
 *
 * Run with: npx tsx server/generators/population-scaling.test.ts
 */

import {
  countBuildings,
  calculatePopulationTarget,
  RESIDENTS_PER_RESIDENCE,
  WORKERS_PER_BUSINESS,
  MIN_RESIDENTS_PER_RESIDENCE,
  MIN_OWNER_PER_BUSINESS,
} from './population-scaling';

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

// ── countBuildings ──

console.log('\ncountBuildings:');

{
  const result = countBuildings([]);
  assert(result.residences === 0 && result.businesses === 0, 'empty list returns zeros');
}

{
  const buildings = [
    { properties: { buildingType: 'residence' } },
    { properties: { buildingType: 'residence' } },
    { properties: { buildingType: 'business' } },
  ];
  const result = countBuildings(buildings);
  assert(result.residences === 2, 'counts 2 residences');
  assert(result.businesses === 1, 'counts 1 business');
}

{
  const buildings = [
    { properties: { buildingType: 'landmark' } },
    { properties: {} },
    {},
  ];
  const result = countBuildings(buildings);
  assert(result.residences === 0 && result.businesses === 0, 'ignores non-residence/business types');
}

// ── calculatePopulationTarget ──

console.log('\ncalculatePopulationTarget:');

{
  // 30 residences + 10 businesses → target = 30*4.5 + 10*2.5 = 135 + 25 = 160
  const result = calculatePopulationTarget({ residences: 30, businesses: 10 }, 15);
  assert(result.target === 160, `target is 160 for 30 res + 10 biz (got ${result.target})`);
  assert(result.deficit === 145, `deficit is 145 when pop=15 (got ${result.deficit})`);
}

{
  // Minimum floor: 5 residences * 2 + 3 businesses * 1 = 13
  // Target: 5*4.5 + 3*2.5 = 22.5 + 7.5 = 30
  // Target (30) > minimum (13), so effective target = 30
  const result = calculatePopulationTarget({ residences: 5, businesses: 3 }, 30);
  assert(result.deficit === 0, `no deficit when population meets target (got ${result.deficit})`);
}

{
  // Population exceeds target → no deficit
  const result = calculatePopulationTarget({ residences: 2, businesses: 1 }, 100);
  assert(result.deficit === 0, `no deficit when population exceeds target (got ${result.deficit})`);
}

{
  // Zero buildings → zero target, zero deficit
  const result = calculatePopulationTarget({ residences: 0, businesses: 0 }, 10);
  assert(result.target === 0, `target is 0 with no buildings (got ${result.target})`);
  assert(result.deficit === 0, `no deficit with no buildings (got ${result.deficit})`);
}

{
  // Only residences: 10 * 4.5 = 45
  const result = calculatePopulationTarget({ residences: 10, businesses: 0 }, 20);
  assert(result.target === 45, `target is 45 for 10 residences only (got ${result.target})`);
  assert(result.deficit === 25, `deficit is 25 (got ${result.deficit})`);
}

{
  // Only businesses: 10 * 2.5 = 25
  const result = calculatePopulationTarget({ residences: 0, businesses: 10 }, 5);
  assert(result.target === 25, `target is 25 for 10 businesses only (got ${result.target})`);
  assert(result.deficit === 20, `deficit is 20 (got ${result.deficit})`);
}

{
  // Minimum floor kicks in when target is lower (shouldn't happen with current multipliers,
  // but verify minimum is always enforced)
  const result = calculatePopulationTarget({ residences: 1, businesses: 0 }, 0);
  // target = round(1*4.5) = 5, minimum = 1*2 = 2, effective = max(5,2) = 5
  assert(result.target >= result.minimum, `target >= minimum floor (target=${result.target}, min=${result.minimum})`);
  assert(result.deficit === result.target, `deficit equals target when pop=0 (got ${result.deficit})`);
}

// ── Constants sanity checks ──

console.log('\nConstants:');
assert(RESIDENTS_PER_RESIDENCE === 4.5, 'RESIDENTS_PER_RESIDENCE is 4.5');
assert(WORKERS_PER_BUSINESS === 2.5, 'WORKERS_PER_BUSINESS is 2.5');
assert(MIN_RESIDENTS_PER_RESIDENCE === 2, 'MIN_RESIDENTS_PER_RESIDENCE is 2');
assert(MIN_OWNER_PER_BUSINESS === 1, 'MIN_OWNER_PER_BUSINESS is 1');

// ── Summary ──

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
