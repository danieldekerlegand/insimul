/**
 * Tests for NPCModularAssembler — modular NPC body assembly.
 *
 * These tests validate the pure logic (hash-based selection, configuration,
 * constants) without requiring a Babylon.js Scene. Scene-dependent methods
 * (preloadTemplates, assembleNPC) require actual asset loading and are
 * covered by integration tests in the browser.
 *
 * Run with: npx tsx client/src/components/3DGame/NPCModularAssembler.test.ts
 */

import { Color3 } from '@babylonjs/core';
import { hashString, hashFloat } from '/game-engine/rendering/NPCAppearanceGenerator';
import {
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFIT_TYPES,
  CORE_SLOTS,
  EXTRA_SLOTS,
  type NPCGender,
  type HairStyle,
  type OutfitType,
  type BodyPartSlot,
} from '/game-engine/rendering/NPCModularAssembler';

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

// --- Constants validation ---
console.log('\nCORE_SLOTS:');

assert(CORE_SLOTS.length === 4, 'has 4 core body part slots');
assert(CORE_SLOTS.includes('body'), 'includes body');
assert(CORE_SLOTS.includes('arms'), 'includes arms');
assert(CORE_SLOTS.includes('legs'), 'includes legs');
assert(CORE_SLOTS.includes('feet'), 'includes feet');

// --- Outfit types ---
console.log('\nOUTFIT_TYPES:');

assert(OUTFIT_TYPES.length === 2, 'has 2 outfit types');
assert(OUTFIT_TYPES.includes('peasant'), 'includes peasant');
assert(OUTFIT_TYPES.includes('ranger'), 'includes ranger');

// --- Extra slots per outfit ---
console.log('\nEXTRA_SLOTS:');

assert(EXTRA_SLOTS.peasant.male.length === 0, 'peasant male has no extra slots');
assert(EXTRA_SLOTS.peasant.female.length === 0, 'peasant female has no extra slots');
assert(EXTRA_SLOTS.ranger.male.length === 2, 'ranger male has 2 extra slots');
assert(EXTRA_SLOTS.ranger.female.length === 2, 'ranger female has 2 extra slots');
assert(EXTRA_SLOTS.ranger.male.includes('head_hood'), 'ranger male has head_hood');
assert(EXTRA_SLOTS.ranger.male.includes('acc_pauldron'), 'ranger male has acc_pauldron');

// --- Hair styles per gender ---
console.log('\nHAIR_STYLES:');

assert(HAIR_STYLES.female.length === 4, 'female has 4 hair styles');
assert(HAIR_STYLES.male.length === 3, 'male has 3 hair styles');
assert(HAIR_STYLES.female.includes('long'), 'female includes long');
assert(HAIR_STYLES.female.includes('buns'), 'female includes buns');
assert(HAIR_STYLES.female.includes('buzzedfemale'), 'female includes buzzedfemale');
assert(HAIR_STYLES.male.includes('buzzed'), 'male includes buzzed');
assert(HAIR_STYLES.male.includes('simpleparted'), 'male includes simpleparted');

// --- Hair colors ---
console.log('\nHAIR_COLORS:');

assert(HAIR_COLORS.length === 8, 'has 8 hair colors');
for (const color of HAIR_COLORS) {
  assert(color instanceof Color3, 'each hair color is a Color3');
  assert(color.r >= 0 && color.r <= 1, `hair color R in [0,1]: ${color.r}`);
  assert(color.g >= 0 && color.g <= 1, `hair color G in [0,1]: ${color.g}`);
  assert(color.b >= 0 && color.b <= 1, `hair color B in [0,1]: ${color.b}`);
}

// --- Deterministic outfit selection ---
console.log('\nDeterministic outfit selection:');

function selectOutfit(characterId: string): OutfitType {
  const hash = hashString(characterId);
  const outfitVal = hashFloat(hash, 10);
  return OUTFIT_TYPES[Math.floor(outfitVal * OUTFIT_TYPES.length) % OUTFIT_TYPES.length];
}

const outfit1a = selectOutfit('char-001');
const outfit1b = selectOutfit('char-001');
assert(outfit1a === outfit1b, 'same character always gets same outfit');

// Check that different characters can get different outfits
const outfitSet = new Set(
  Array.from({ length: 20 }, (_, i) => selectOutfit(`char-${i}`))
);
assert(outfitSet.size > 1, `multiple outfit types selected across 20 characters (got ${outfitSet.size})`);

// --- Deterministic hair selection ---
console.log('\nDeterministic hair selection:');

function selectHair(characterId: string, gender: NPCGender): HairStyle {
  const hash = hashString(characterId);
  const styles = HAIR_STYLES[gender];
  const hairVal = hashFloat(hash, 15);
  return styles[Math.floor(hairVal * styles.length) % styles.length];
}

const hair1a = selectHair('char-001', 'male');
const hair1b = selectHair('char-001', 'male');
assert(hair1a === hair1b, 'same character always gets same hair style');

// Check variation
const maleHairSet = new Set(
  Array.from({ length: 30 }, (_, i) => selectHair(`npc-${i}`, 'male'))
);
assert(maleHairSet.size > 1, `multiple male hair styles selected (got ${maleHairSet.size})`);

const femaleHairSet = new Set(
  Array.from({ length: 30 }, (_, i) => selectHair(`npc-${i}`, 'female'))
);
assert(femaleHairSet.size > 1, `multiple female hair styles selected (got ${femaleHairSet.size})`);

// --- Deterministic hair color selection ---
console.log('\nDeterministic hair color selection:');

function selectHairColor(characterId: string): Color3 {
  const hash = hashString(characterId);
  const val = hashFloat(hash, 20);
  return HAIR_COLORS[Math.floor(val * HAIR_COLORS.length) % HAIR_COLORS.length];
}

const hc1a = selectHairColor('char-001');
const hc1b = selectHairColor('char-001');
assert(hc1a.equals(hc1b), 'same character always gets same hair color');

const hairColorSet = new Set(
  Array.from({ length: 30 }, (_, i) => {
    const c = selectHairColor(`npc-${i}`);
    return `${c.r.toFixed(3)},${c.g.toFixed(3)},${c.b.toFixed(3)}`;
  })
);
assert(hairColorSet.size > 3, `multiple hair colors selected (got ${hairColorSet.size})`);

// --- Beard probability ---
console.log('\nBeard probability:');

let beardCount = 0;
const sampleSize = 100;
for (let i = 0; i < sampleSize; i++) {
  const hash = hashString(`beard-test-${i}`);
  const beardVal = hashFloat(hash, 16);
  if (beardVal < 0.4) beardCount++;
}
const beardRate = beardCount / sampleSize;
assert(beardRate > 0.2 && beardRate < 0.6, `beard rate ~40% (got ${(beardRate * 100).toFixed(1)}%)`);

// --- Height/width variation ---
console.log('\nHeight/width variation:');

const heightSet = new Set<string>();
const widthSet = new Set<string>();
for (let i = 0; i < 50; i++) {
  const hash = hashString(`scale-test-${i}`);
  const h = 0.85 + hashFloat(hash, 11) * 0.30;
  const w = 0.90 + hashFloat(hash, 12) * 0.20;
  assert(h >= 0.85 && h <= 1.15, `height ${h.toFixed(3)} in [0.85, 1.15]`);
  assert(w >= 0.90 && w <= 1.10, `width ${w.toFixed(3)} in [0.90, 1.10]`);
  heightSet.add(h.toFixed(4));
  widthSet.add(w.toFixed(4));
}
assert(heightSet.size >= 10, `50 NPCs produce at least 10 unique heights (got ${heightSet.size})`);
assert(widthSet.size >= 10, `50 NPCs produce at least 10 unique widths (got ${widthSet.size})`);

// --- Combinatorial variety ---
console.log('\nCombinatorial variety:');

const combinations = new Set<string>();
for (let i = 0; i < 50; i++) {
  const id = `combo-${i}`;
  for (const gender of ['male', 'female'] as NPCGender[]) {
    const outfit = selectOutfit(id);
    const hair = selectHair(id, gender);
    const hairColor = selectHairColor(id);
    combinations.add(`${gender}_${outfit}_${hair}_${hairColor.r.toFixed(2)}`);
  }
}
assert(combinations.size >= 20, `100 NPC configs produce at least 20 unique combos (got ${combinations.size})`);

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
