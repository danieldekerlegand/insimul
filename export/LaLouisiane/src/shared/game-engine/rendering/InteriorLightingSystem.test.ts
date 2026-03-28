/**
 * Tests for InteriorLightingSystem — time-of-day interior lighting logic
 *
 * Run with: npx tsx client/src/components/3DGame/InteriorLightingSystem.test.ts
 *
 * Tests the pure computation functions without Babylon.js scene dependencies.
 */

import { computeDaylightFactor, computeNightFactor } from '/game-engine/rendering/InteriorLightingSystem';

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

function assertApprox(actual: number, expected: number, message: string, epsilon = 0.01) {
  const ok = Math.abs(actual - expected) < epsilon;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message} (expected ~${expected}, got ${actual})`);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

console.log("\n=== InteriorLightingSystem Tests ===\n");

// --- computeDaylightFactor ---

console.log("computeDaylightFactor:");

// Full daytime
assertApprox(computeDaylightFactor(12), 1.0, "noon = 1.0 (full day)");
assertApprox(computeDaylightFactor(6), 1.0, "6:00 = 1.0 (day start)");
assertApprox(computeDaylightFactor(10), 1.0, "10:00 = 1.0 (midmorning)");
assertApprox(computeDaylightFactor(17.9), 1.0, "17:54 = 1.0 (just before dusk)");

// Full night
assertApprox(computeDaylightFactor(0), 0.0, "midnight = 0.0 (full night)");
assertApprox(computeDaylightFactor(3), 0.0, "3:00 = 0.0 (deep night)");
assertApprox(computeDaylightFactor(22), 0.0, "22:00 = 0.0 (late night)");
assertApprox(computeDaylightFactor(4.9), 0.0, "4:54 = 0.0 (before dawn)");

// Dawn transition (5:00 - 6:00)
assertApprox(computeDaylightFactor(5.0), 0.0, "5:00 = 0.0 (dawn start)");
assertApprox(computeDaylightFactor(5.5), 0.5, "5:30 = 0.5 (mid-dawn)");
assertApprox(computeDaylightFactor(5.75), 0.75, "5:45 = 0.75 (late dawn)");

// Dusk transition (18:00 - 20:00)
assertApprox(computeDaylightFactor(18.0), 1.0, "18:00 = 1.0 (dusk start)");
assertApprox(computeDaylightFactor(19.0), 0.5, "19:00 = 0.5 (mid-dusk)");
assertApprox(computeDaylightFactor(20.0), 0.0, "20:00 = 0.0 (dusk end / night)");

// --- computeNightFactor ---

console.log("\ncomputeNightFactor:");

assertApprox(computeNightFactor(12), 0.0, "noon night factor = 0.0");
assertApprox(computeNightFactor(0), 1.0, "midnight night factor = 1.0");
assertApprox(computeNightFactor(19.0), 0.5, "19:00 night factor = 0.5 (mid-dusk)");
assertApprox(computeNightFactor(5.5), 0.5, "5:30 night factor = 0.5 (mid-dawn)");

// --- Inverse relationship ---

console.log("\nday + night = 1.0:");

for (const h of [0, 3, 5, 5.5, 6, 12, 17, 18, 19, 20, 23]) {
  const sum = computeDaylightFactor(h) + computeNightFactor(h);
  assertApprox(sum, 1.0, `hour ${h}: dayFactor + nightFactor = 1.0`);
}

// --- Hour normalization ---

console.log("\nHour normalization:");

assertApprox(computeDaylightFactor(36), computeDaylightFactor(12), "hour 36 = hour 12");
assertApprox(computeDaylightFactor(-6), computeDaylightFactor(18), "hour -6 = hour 18");
assertApprox(computeDaylightFactor(24), computeDaylightFactor(0), "hour 24 = hour 0");
assertApprox(computeDaylightFactor(48), computeDaylightFactor(0), "hour 48 = hour 0");

// --- Boundary precision ---

console.log("\nBoundary values:");

// Dawn boundaries
assert(computeDaylightFactor(4.99) === 0.0, "4:59 is still full night");
assert(computeDaylightFactor(6.0) === 1.0, "6:00 is full day");

// Dusk boundaries
const dusk18 = computeDaylightFactor(18.0);
assert(dusk18 >= 0.99, "18:00 is still essentially full day");
const dusk20 = computeDaylightFactor(20.0);
assert(dusk20 <= 0.01, "20:00 is essentially full night");

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
