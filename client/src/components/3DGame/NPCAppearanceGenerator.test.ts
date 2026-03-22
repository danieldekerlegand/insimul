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
  shiftColor,
  getClothingColorForMesh,
  type NPCAppearance,
  type BodyType,
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

// All slots should be in range (now using 12 slots)
for (let slot = 0; slot < 12; slot++) {
  const val = hashFloat(hash, slot);
  assert(val >= 0 && val < 1, `slot ${slot} in valid range: ${val}`);
}

// --- generateNPCAppearance determinism ---
console.log('\ngenerateNPCAppearance determinism:');

const a1 = generateNPCAppearance('char-001', 'civilian');
const a2 = generateNPCAppearance('char-001', 'civilian');

assert(a1.skinColor.equals(a2.skinColor), 'skin color is deterministic');
assert(a1.clothingColor.equals(a2.clothingColor), 'clothing color is deterministic');
assert(a1.secondaryClothingColor.equals(a2.secondaryClothingColor), 'secondary clothing color is deterministic');
assert(a1.accentColor.equals(a2.accentColor), 'accent color is deterministic');
assert(a1.scale.equals(a2.scale), 'scale is deterministic');
assert(a1.bodyType === a2.bodyType, 'body type is deterministic');
assertApprox(a1.shoulderScale, a2.shoulderScale, 0.001, 'shoulder scale is deterministic');
assertApprox(a1.headScale, a2.headScale, 0.001, 'head scale is deterministic');
assertApprox(a1.clothingHueShift, a2.clothingHueShift, 0.001, 'clothing hue shift is deterministic');
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

// --- secondary clothing differs from primary ---
console.log('\nclothing color variation:');

for (const app of appearances) {
  assert(!app.clothingColor.equals(app.secondaryClothingColor),
    'secondary clothing color differs from primary');
}

// Hue shift should be in valid range
for (const app of appearances) {
  assert(app.clothingHueShift >= -0.075 && app.clothingHueShift <= 0.075,
    `hue shift ${app.clothingHueShift.toFixed(4)} in [-0.075, 0.075]`);
}

// --- body type and proportions ---
console.log('\nbody type and proportions:');

const validBodyTypes: BodyType[] = ['average', 'stocky', 'lean', 'heavyset', 'athletic'];
for (const app of appearances) {
  assert(validBodyTypes.includes(app.bodyType), `body type "${app.bodyType}" is valid`);
}

// Check that body types have appropriate proportion ranges
const manyIds = Array.from({ length: 100 }, (_, i) => `npc-body-${i}`);
const manyApps = manyIds.map(id => generateNPCAppearance(id, 'civilian'));

const bodyTypesFound = new Set(manyApps.map(a => a.bodyType));
assert(bodyTypesFound.size >= 3, `at least 3 body types across 100 NPCs (got ${bodyTypesFound.size})`);

// Stocky NPCs should be wider and shorter than lean NPCs on average
const stockyApps = manyApps.filter(a => a.bodyType === 'stocky');
const leanApps = manyApps.filter(a => a.bodyType === 'lean');
if (stockyApps.length > 0 && leanApps.length > 0) {
  const avgStockyWidth = stockyApps.reduce((s, a) => s + a.scale.x, 0) / stockyApps.length;
  const avgLeanWidth = leanApps.reduce((s, a) => s + a.scale.x, 0) / leanApps.length;
  assert(avgStockyWidth > avgLeanWidth, `stocky NPCs wider than lean (${avgStockyWidth.toFixed(3)} > ${avgLeanWidth.toFixed(3)})`);

  const avgStockyHeight = stockyApps.reduce((s, a) => s + a.scale.y, 0) / stockyApps.length;
  const avgLeanHeight = leanApps.reduce((s, a) => s + a.scale.y, 0) / leanApps.length;
  assert(avgStockyHeight < avgLeanHeight, `stocky NPCs shorter than lean (${avgStockyHeight.toFixed(3)} < ${avgLeanHeight.toFixed(3)})`);
}

// Shoulder and head scales should be within valid ranges
for (const app of manyApps) {
  assert(app.shoulderScale >= 0.85 && app.shoulderScale <= 1.20,
    `shoulder scale ${app.shoulderScale.toFixed(3)} in valid range`);
  assert(app.headScale >= 0.92 && app.headScale <= 1.12,
    `head scale ${app.headScale.toFixed(3)} in valid range`);
}

// Width scale matches depth scale
for (const app of appearances) {
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
assert(guardApp.secondaryClothingColor.equals(merchantApp.secondaryClothingColor), 'same char gets same secondary clothing regardless of role');
assert(guardApp.bodyType === merchantApp.bodyType, 'same char gets same body type regardless of role');

// --- shiftColor ---
console.log('\nshiftColor:');

const baseShiftColor = new Color3(0.5, 0.5, 0.5);
const shifted0 = shiftColor(baseShiftColor, 0.05, 0);
const shifted1 = shiftColor(baseShiftColor, 0.05, 1);
assert(!shifted0.equals(shifted1), 'different mesh indices produce different shifts');
assert(shifted0.r >= 0 && shifted0.r <= 1, 'shifted R in valid range');
assert(shifted0.g >= 0 && shifted0.g <= 1, 'shifted G in valid range');
assert(shifted0.b >= 0 && shifted0.b <= 1, 'shifted B in valid range');

// Zero shift should return original color
const noShift = shiftColor(baseShiftColor, 0, 0);
assert(noShift.equals(baseShiftColor), 'zero shift returns original color');

// --- getClothingColorForMesh ---
console.log('\ngetClothingColorForMesh:');

const testApp = generateNPCAppearance('clothing-test', 'civilian');
const clothMesh0 = getClothingColorForMesh(testApp, 0);
const clothMesh1 = getClothingColorForMesh(testApp, 1);
const clothMesh2 = getClothingColorForMesh(testApp, 2);

// Even indices use primary, odd use secondary (before hue shift)
assert(!clothMesh0.equals(clothMesh1), 'mesh 0 and mesh 1 get different clothing colors');
// Mesh 0 and mesh 2 use same base (primary) but different hue shifts
assert(!clothMesh0.equals(clothMesh2), 'mesh 0 and mesh 2 differ due to hue shift');
// All should be valid colors
for (const c of [clothMesh0, clothMesh1, clothMesh2]) {
  assert(c.r >= 0 && c.r <= 1, `clothing mesh R in range: ${c.r.toFixed(3)}`);
  assert(c.g >= 0 && c.g <= 1, `clothing mesh G in range: ${c.g.toFixed(3)}`);
  assert(c.b >= 0 && c.b <= 1, `clothing mesh B in range: ${c.b.toFixed(3)}`);
}

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

const largeIds = Array.from({ length: 50 }, (_, i) => `npc-${i}`);
const largeAppearances = largeIds.map(id => generateNPCAppearance(id, 'civilian'));
const skinKeys = new Set(largeAppearances.map(a =>
  `${a.skinColor.r.toFixed(3)},${a.skinColor.g.toFixed(3)},${a.skinColor.b.toFixed(3)}`
));
assert(skinKeys.size >= 5, `50 NPCs produce at least 5 unique skin tones (got ${skinKeys.size})`);

const clothingKeys = new Set(largeAppearances.map(a =>
  `${a.clothingColor.r.toFixed(3)},${a.clothingColor.g.toFixed(3)},${a.clothingColor.b.toFixed(3)}`
));
assert(clothingKeys.size >= 8, `50 NPCs produce at least 8 unique clothing colors (got ${clothingKeys.size})`);

const secondaryKeys = new Set(largeAppearances.map(a =>
  `${a.secondaryClothingColor.r.toFixed(3)},${a.secondaryClothingColor.g.toFixed(3)},${a.secondaryClothingColor.b.toFixed(3)}`
));
assert(secondaryKeys.size >= 5, `50 NPCs produce at least 5 unique secondary clothing colors (got ${secondaryKeys.size})`);

const scaleKeys = new Set(largeAppearances.map(a => a.scale.y.toFixed(4)));
assert(scaleKeys.size >= 10, `50 NPCs produce at least 10 unique height values (got ${scaleKeys.size})`);

const bodyTypeKeys = new Set(largeAppearances.map(a => a.bodyType));
assert(bodyTypeKeys.size >= 3, `50 NPCs produce at least 3 body types (got ${bodyTypeKeys.size})`);

// --- summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
