/**
 * Tests for inferBusinessType weighted random fallback.
 *
 * Run: npx tsx server/generators/infer-business-type.test.ts
 */

import {
  hashString,
  weightedRandomBusinessType,
  BUSINESS_TYPE_WEIGHTS,
} from './geography-generator';

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

// ── hashString tests ──

console.log('\n── hashString ──');

assert(typeof hashString('test') === 'number', 'returns a number');
assert(hashString('test') >= 0, 'returns non-negative');
assert(hashString('abc') === hashString('abc'), 'deterministic for same input');
assert(hashString('abc') !== hashString('xyz'), 'different for different inputs');

// ── weightedRandomBusinessType tests ──

console.log('\n── weightedRandomBusinessType ──');

const validTypes = BUSINESS_TYPE_WEIGHTS.map(([t]) => t);

// Deterministic: same name always returns same type
const result1 = weightedRandomBusinessType('Ellington Trading Co.');
const result2 = weightedRandomBusinessType('Ellington Trading Co.');
assert(result1 === result2, 'deterministic: same name gives same result');

// Returns a valid business type
assert(validTypes.includes(result1), `returns valid business type (got: ${result1})`);

// Different names can produce different types (test with many names)
const typesProduced = new Set<string>();
const testNames = [
  'Acme Enterprises',
  'Sunset Holdings',
  'Mountain View LLC',
  'Riverside Corp',
  'Golden Gate Partners',
  'Pine Valley Associates',
  'Blue Ridge Trading',
  'Silver Creek Industries',
  'Oakwood Ventures',
  'Cedar Point Group',
  'Maple Street Co',
  'Willow Branch Ltd',
  'Stone Hill Capital',
  'Iron Bridge Works',
  'Coral Bay Imports',
  'Redwood Alliance',
  'Summit Peak LLC',
  'Prairie Wind Co',
  'Harbor Lights Inc',   // Note: this would match 'harbor' keyword in inferBusinessType, but weightedRandomBusinessType is called directly
  'Crystal Springs Ltd',
];
for (const n of testNames) {
  typesProduced.add(weightedRandomBusinessType(n));
}
assert(
  typesProduced.size > 1,
  `produces variety: ${typesProduced.size} distinct types from ${testNames.length} names (${[...typesProduced].join(', ')})`,
);

// All returned types are valid
for (const n of testNames) {
  const t = weightedRandomBusinessType(n);
  assert(validTypes.includes(t), `"${n}" → "${t}" is a valid type`);
}

// ── Weight distribution sanity check ──

console.log('\n── weight distribution ──');

const totalWeight = BUSINESS_TYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
assert(totalWeight === 100, `total weight is 100 (got: ${totalWeight})`);
assert(BUSINESS_TYPE_WEIGHTS.length > 5, `has enough business types (got: ${BUSINESS_TYPE_WEIGHTS.length})`);

// Shop should have the highest weight
const shopWeight = BUSINESS_TYPE_WEIGHTS.find(([t]) => t === 'Shop')?.[1] ?? 0;
const maxWeight = Math.max(...BUSINESS_TYPE_WEIGHTS.map(([, w]) => w));
assert(shopWeight === maxWeight, `Shop has highest weight (${shopWeight})`);

// ── Summary ──

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
