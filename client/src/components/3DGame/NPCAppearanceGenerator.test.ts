/**
 * Tests for NPCAppearanceGenerator — procedural NPC appearance variation.
 *
 * Run with: npx tsx client/src/components/3DGame/NPCAppearanceGenerator.test.ts
 */

import { Color3, Vector3 } from '@babylonjs/core';
import {
  hashString,
  hashFloat,
  generateNPCAppearance,
  blendWithRoleTint,
  generateBillboardColor,
  type NPCAppearance,
} from './NPCAppearanceGenerator';

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

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  const ok = Math.abs(actual - expected) <= tolerance;
  assert(ok, `${message} (expected ~${expected}, got ${actual})`);
}

// --- hashString tests ---
console.log('\nhashString:');

assert(typeof hashString('test') === 'number', 'returns a number');
assert(hashString('test') === hashString('test'), 'same input produces same hash');
assert(hashString('abc') !== hashString('def'), 'different inputs produce different hashes');
assert(hashString('') !== undefined, 'handles empty string');
assert((hashString('test') >>> 0) === hashString('test'), 'hash is unsigned 32-bit');

// --- hashFloat tests ---
console.log('\nhashFloat:');

const hash = hashString('test-character-id');
const f0 = hashFloat(hash, 0);
const f1 = hashFloat(hash, 1);

assert(f0 >= 0 && f0 < 1, 'slot 0 returns value in [0, 1)');
assert(f1 >= 0 && f1 < 1, 'slot 1 returns value in [0, 1)');
assert(f0 !== f1, 'different slots produce different values');
assert(hashFloat(hash, 0) === f0, 'same slot is deterministic');

// All slots should be in range
for (let slot = 0; slot < 10; slot++) {
  const val = hashFloat(hash, slot);
  assert(val >= 0 && val < 1, `slot ${slot} in valid range: ${val}`);
}

// --- generateNPCAppearance determinism ---
console.log('\ngenerateNPCAppearance determinism:');

const a1 = generateNPCAppearance('char-001', 'civilian');
const a2 = generateNPCAppearance('char-001', 'civilian');

assert(a1.skinColor.equals(a2.skinColor), 'skin color is deterministic');
assert(a1.clothingColor.equals(a2.clothingColor), 'clothing color is deterministic');
assert(a1.accentColor.equals(a2.accentColor), 'accent color is deterministic');
assert(a1.scale.equals(a2.scale), 'scale is deterministic');
assertApprox(a1.roughness, a2.roughness, 0.001, 'roughness is deterministic');
assertApprox(a1.emissiveIntensity, a2.emissiveIntensity, 0.001, 'emissive intensity is deterministic');

// --- generateNPCAppearance variation ---
console.log('\ngenerateNPCAppearance variation:');

const ids = ['char-001', 'char-002', 'char-003', 'npc-alpha', 'npc-beta', 'npc-gamma'];
const appearances = ids.map(id => generateNPCAppearance(id, 'civilian'));

// Check that not all appearances are the same
const uniqueSkinR = new Set(appearances.map(a => a.skinColor.r.toFixed(4)));
assert(uniqueSkinR.size > 1, `multiple unique skin tones generated (${uniqueSkinR.size} unique)`);

const uniqueClothingR = new Set(appearances.map(a => a.clothingColor.r.toFixed(4)));
assert(uniqueClothingR.size > 1, `multiple unique clothing colors generated (${uniqueClothingR.size} unique)`);

const uniqueHeights = new Set(appearances.map(a => a.scale.y.toFixed(4)));
assert(uniqueHeights.size > 1, `multiple unique height scales generated (${uniqueHeights.size} unique)`);

// --- scale ranges ---
console.log('\nscale ranges:');

for (const app of appearances) {
  assert(app.scale.y >= 0.90 && app.scale.y <= 1.10, `height ${app.scale.y.toFixed(3)} in [0.90, 1.10]`);
  assert(app.scale.x >= 0.95 && app.scale.x <= 1.05, `width ${app.scale.x.toFixed(3)} in [0.95, 1.05]`);
  assert(app.scale.x === app.scale.z, 'width scale matches depth scale');
}

// --- color value ranges ---
console.log('\ncolor value ranges:');

for (const app of appearances) {
  assert(app.skinColor.r >= 0 && app.skinColor.r <= 1, `skin R in [0,1]: ${app.skinColor.r}`);
  assert(app.skinColor.g >= 0 && app.skinColor.g <= 1, `skin G in [0,1]: ${app.skinColor.g}`);
  assert(app.skinColor.b >= 0 && app.skinColor.b <= 1, `skin B in [0,1]: ${app.skinColor.b}`);
  assert(app.roughness >= 0.6 && app.roughness <= 0.95, `roughness in [0.6, 0.95]: ${app.roughness}`);
  assert(app.emissiveIntensity >= 0 && app.emissiveIntensity <= 0.08, `emissive in [0, 0.08]: ${app.emissiveIntensity}`);
}

// --- role tint integration ---
console.log('\nrole tint integration:');

const guardApp = generateNPCAppearance('char-001', 'guard');
const merchantApp = generateNPCAppearance('char-001', 'merchant');
const questgiverApp = generateNPCAppearance('char-001', 'questgiver');
const civilianApp = generateNPCAppearance('char-001', 'civilian');

// Role tint strength: civilians get lighter tint
assertApprox(civilianApp.roleTintStrength, 0.1, 0.001, 'civilian tint strength is 0.1');
assertApprox(guardApp.roleTintStrength, 0.2, 0.001, 'guard tint strength is 0.2');

// Different roles should have different tints
assert(!guardApp.roleTint.equals(merchantApp.roleTint), 'guard and merchant have different role tints');
assert(!guardApp.roleTint.equals(questgiverApp.roleTint), 'guard and questgiver have different role tints');

// Same character with different roles should have same base colors (skin, clothing)
assert(guardApp.skinColor.equals(merchantApp.skinColor), 'same char gets same skin regardless of role');
assert(guardApp.clothingColor.equals(merchantApp.clothingColor), 'same char gets same clothing regardless of role');

// --- blendWithRoleTint ---
console.log('\nblendWithRoleTint:');

const testColor = new Color3(0.5, 0.5, 0.5);
const blended = blendWithRoleTint(testColor, guardApp);
// With guard tint (0.85, 0.5, 0.45) at strength 0.2:
// result = lerp(0.5, 0.85, 0.2) = 0.57 for R
assertApprox(blended.r, 0.57, 0.01, 'blend R channel correct');
assert(blended.r !== testColor.r, 'blend modifies the color');

// --- generateBillboardColor ---
console.log('\ngenerateBillboardColor:');

const bbColor = generateBillboardColor(guardApp);
assert(bbColor instanceof Color3, 'returns a Color3');
// Should be a blend of clothing + role tint at 0.4
const expectedR = guardApp.clothingColor.r * 0.6 + guardApp.roleTint.r * 0.4;
assertApprox(bbColor.r, expectedR, 0.01, 'billboard color R blends clothing + role tint');

// --- large-scale uniqueness ---
console.log('\nlarge-scale uniqueness:');

const manyIds = Array.from({ length: 50 }, (_, i) => `npc-${i}`);
const manyAppearances = manyIds.map(id => generateNPCAppearance(id, 'civilian'));
const skinKeys = new Set(manyAppearances.map(a =>
  `${a.skinColor.r.toFixed(3)},${a.skinColor.g.toFixed(3)},${a.skinColor.b.toFixed(3)}`
));
assert(skinKeys.size >= 5, `50 NPCs produce at least 5 unique skin tones (got ${skinKeys.size})`);

const clothingKeys = new Set(manyAppearances.map(a =>
  `${a.clothingColor.r.toFixed(3)},${a.clothingColor.g.toFixed(3)},${a.clothingColor.b.toFixed(3)}`
));
assert(clothingKeys.size >= 8, `50 NPCs produce at least 8 unique clothing colors (got ${clothingKeys.size})`);

const scaleKeys = new Set(manyAppearances.map(a => a.scale.y.toFixed(4)));
assert(scaleKeys.size >= 10, `50 NPCs produce at least 10 unique height values (got ${scaleKeys.size})`);

// --- summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
