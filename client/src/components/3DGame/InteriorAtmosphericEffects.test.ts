/**
 * Tests for InteriorAtmosphericEffects — effect classification logic
 *
 * Run with: npx tsx client/src/components/3DGame/InteriorAtmosphericEffects.test.ts
 *
 * Tests the pure classifyEffects function without Babylon.js scene dependencies.
 */

import { classifyEffects, type EffectPlacement } from './InteriorAtmosphericEffects';

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

// ── Tests ─────────────────────────────────────────────────────────────────

console.log("\n=== InteriorAtmosphericEffects Tests ===\n");

// --- Fireplace classification ---

console.log("Fireplace classification:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'fireplace' },
  ];
  const result = classifyEffects('residence', undefined, placements);
  assert(result.fireplaces.length === 1, "fireplace furniture type classified as fireplace");
  assert(result.forges.length === 0, "no forges in residence");
}

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'hearth' },
  ];
  const result = classifyEffects('residence', undefined, placements);
  assert(result.fireplaces.length === 1, "hearth furniture type classified as fireplace");
}

// --- Forge vs fireplace depending on building type ---

console.log("\nForge vs fireplace by building type:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
  ];
  const result = classifyEffects('commercial', 'blacksmith', placements);
  assert(result.forges.length === 1, "forge in blacksmith classified as forge");
  assert(result.fireplaces.length === 0, "forge in blacksmith NOT classified as fireplace");
}

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
  ];
  const result = classifyEffects('commercial', 'tavern', placements);
  assert(result.fireplaces.length === 1, "forge in tavern classified as fireplace (hearth)");
  assert(result.forges.length === 0, "forge in tavern NOT classified as forge");
}

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
  ];
  const result = classifyEffects('residence', undefined, placements);
  assert(result.fireplaces.length === 1, "forge in residence classified as fireplace");
}

// --- Anvil classification ---

console.log("\nAnvil classification:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'anvil' },
  ];
  const result = classifyEffects('commercial', 'blacksmith', placements);
  assert(result.anvils.length === 1, "anvil in blacksmith classified as anvil");
}

// --- Kitchen steam ---

console.log("\nKitchen steam:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'oven' },
  ];
  const result = classifyEffects('commercial', 'bakery', placements);
  assert(result.kitchenSteam.length === 1, "oven in bakery gets kitchen steam");
}

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'stove' },
  ];
  const result = classifyEffects('commercial', 'restaurant', placements);
  assert(result.kitchenSteam.length === 1, "stove in restaurant gets kitchen steam");
}

{
  // Kitchen business with no oven/stove but has counter -> falls back to counter steam
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'counter' },
    { x: 2, y: 1, z: 0, furnitureType: 'table' },
  ];
  const result = classifyEffects('commercial', 'restaurant', placements);
  assert(result.kitchenSteam.length === 1, "restaurant with only counter gets counter steam");
  assert(result.kitchenSteam[0].furnitureType === 'counter', "steam source is the counter");
}

{
  // Non-kitchen business with counter -> no steam
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'counter' },
  ];
  const result = classifyEffects('commercial', 'shop', placements);
  assert(result.kitchenSteam.length === 0, "shop counter does not get steam");
}

// --- Candle classification ---

console.log("\nCandle classification:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'candle' },
    { x: 2, y: 1, z: 0, furnitureType: 'lantern' },
    { x: 4, y: 1, z: 0, furnitureType: 'candlestick' },
  ];
  const result = classifyEffects('residence', undefined, placements);
  assert(result.candles.length === 3, "candle, lantern, candlestick all classified as candles");
}

// --- Dust motes ---

console.log("\nDust motes:");

{
  const result = classifyEffects('commercial', 'warehouse', []);
  assert(result.hasDustMotes === true, "warehouse gets dust motes");
}

{
  const result = classifyEffects('commercial', 'library', []);
  assert(result.hasDustMotes === true, "library gets dust motes");
}

{
  const result = classifyEffects('commercial', 'bookstore', []);
  assert(result.hasDustMotes === true, "bookstore gets dust motes");
}

{
  const result = classifyEffects('warehouse', undefined, []);
  assert(result.hasDustMotes === true, "warehouse building type gets dust motes");
}

{
  const result = classifyEffects('commercial', 'tavern', []);
  assert(result.hasDustMotes === false, "tavern does NOT get dust motes");
}

{
  const result = classifyEffects('residence', undefined, []);
  assert(result.hasDustMotes === false, "residence does NOT get dust motes");
}

// --- Tavern fireplace fallback ---

console.log("\nTavern fireplace fallback:");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
  ];
  const result = classifyEffects('commercial', 'tavern', placements);
  assert(result.fireplaces.length === 1, "tavern with forge gets fireplace from forge");
  assert(result.forges.length === 0, "tavern forge reassigned to fireplace");
}

{
  // Inn also gets the fallback
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
  ];
  const result = classifyEffects('entertainment', 'inn', placements);
  assert(result.fireplaces.length === 1, "inn with forge gets fireplace from forge");
}

// --- Mixed building ---

console.log("\nMixed building (blacksmith with multiple furniture):");

{
  const placements: EffectPlacement[] = [
    { x: 0, y: 1, z: 0, furnitureType: 'forge' },
    { x: 2, y: 1, z: 0, furnitureType: 'anvil' },
    { x: 4, y: 1, z: 0, furnitureType: 'candle' },
    { x: 6, y: 1, z: 0, furnitureType: 'counter' },
  ];
  const result = classifyEffects('industrial', 'blacksmith', placements);
  assert(result.forges.length === 1, "blacksmith forge classified correctly");
  assert(result.anvils.length === 1, "blacksmith anvil classified correctly");
  assert(result.candles.length === 1, "blacksmith candle classified correctly");
  assert(result.kitchenSteam.length === 0, "blacksmith counter does not get steam");
  assert(result.hasDustMotes === false, "blacksmith does not get dust motes");
}

// --- Empty placements ---

console.log("\nEmpty placements:");

{
  const result = classifyEffects('residence', undefined, []);
  assert(result.fireplaces.length === 0, "no fireplaces with empty placements");
  assert(result.forges.length === 0, "no forges with empty placements");
  assert(result.anvils.length === 0, "no anvils with empty placements");
  assert(result.kitchenSteam.length === 0, "no steam with empty placements");
  assert(result.candles.length === 0, "no candles with empty placements");
  assert(result.hasDustMotes === false, "no dust motes for residence");
}

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
