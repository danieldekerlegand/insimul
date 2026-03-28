/**
 * Tests for DayNightCycle — keyframe interpolation and time-based lighting
 *
 * Run with: npx tsx client/src/components/3DGame/DayNightCycle.test.ts
 *
 * Tests the pure interpolation logic without Babylon.js scene dependencies.
 */

import { Color3 } from "@babylonjs/core/Maths/math";
import {
  findKeyframePair,
  interpolateKeyframes,
  type LightingKeyframe,
} from "/game-engine/rendering/DayNightCycle";
import { GameTimeManager } from "/game-engine/logic/GameTimeManager";

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

// ── Test keyframes ────────────────────────────────────────────────────────

function makeTestKeyframes(): LightingKeyframe[] {
  return [
    {
      hour: 0,
      sunAltitude: -0.8,
      sunAzimuth: Math.PI,
      sunIntensity: 0,
      sunColor: new Color3(0.1, 0.1, 0.2),
      hemiIntensity: 0.15,
      hemiSkyColor: new Color3(0.05, 0.05, 0.12),
      hemiGroundColor: new Color3(0.02, 0.02, 0.05),
      skyZenith: new Color3(0.02, 0.02, 0.06),
      skyHorizon: new Color3(0.05, 0.05, 0.1),
      skyGround: new Color3(0.02, 0.02, 0.04),
      fogDensity: 0.003,
    },
    {
      hour: 6,
      sunAltitude: 0.2,
      sunAzimuth: -Math.PI * 0.5,
      sunIntensity: 0.6,
      sunColor: new Color3(1.0, 0.6, 0.3),
      hemiIntensity: 0.5,
      hemiSkyColor: new Color3(0.4, 0.4, 0.6),
      hemiGroundColor: new Color3(0.15, 0.1, 0.08),
      skyZenith: new Color3(0.2, 0.3, 0.6),
      skyHorizon: new Color3(0.8, 0.5, 0.3),
      skyGround: new Color3(0.2, 0.15, 0.1),
      fogDensity: 0.002,
    },
    {
      hour: 12,
      sunAltitude: 1.2,
      sunAzimuth: 0,
      sunIntensity: 1.1,
      sunColor: new Color3(1.0, 1.0, 0.9),
      hemiIntensity: 0.7,
      hemiSkyColor: new Color3(0.6, 0.65, 0.8),
      hemiGroundColor: new Color3(0.25, 0.22, 0.15),
      skyZenith: new Color3(0.3, 0.4, 0.9),
      skyHorizon: new Color3(0.7, 0.75, 0.85),
      skyGround: new Color3(0.35, 0.35, 0.3),
      fogDensity: 0.0005,
    },
    {
      hour: 18,
      sunAltitude: 0.1,
      sunAzimuth: Math.PI * 0.5,
      sunIntensity: 0.5,
      sunColor: new Color3(1.0, 0.4, 0.15),
      hemiIntensity: 0.35,
      hemiSkyColor: new Color3(0.3, 0.2, 0.35),
      hemiGroundColor: new Color3(0.1, 0.08, 0.06),
      skyZenith: new Color3(0.15, 0.12, 0.4),
      skyHorizon: new Color3(0.9, 0.4, 0.15),
      skyGround: new Color3(0.2, 0.1, 0.06),
      fogDensity: 0.002,
    },
  ];
}

// ── Tests ─────────────────────────────────────────────────────────────────

console.log("\n=== DayNightCycle Tests ===\n");

// --- findKeyframePair ---

console.log("findKeyframePair:");

{
  const kfs = makeTestKeyframes();

  // Exactly on a keyframe
  const { a, b, t } = findKeyframePair(kfs, 6);
  assert(a.hour === 6, "at hour 6: a.hour = 6");
  assert(b.hour === 12, "at hour 6: b.hour = 12");
  assertApprox(t, 0, "at hour 6: t = 0");
}

{
  const kfs = makeTestKeyframes();
  // Midway between keyframes
  const { a, b, t } = findKeyframePair(kfs, 9);
  assert(a.hour === 6, "at hour 9: a.hour = 6");
  assert(b.hour === 12, "at hour 9: b.hour = 12");
  assertApprox(t, 0.5, "at hour 9: t = 0.5");
}

{
  const kfs = makeTestKeyframes();
  // Wrap-around: hour 21 is between 18 and 0 (next day)
  const { a, b, t } = findKeyframePair(kfs, 21);
  assert(a.hour === 18, "at hour 21: a.hour = 18");
  assert(b.hour === 0, "at hour 21: b.hour = 0");
  assertApprox(t, 0.5, "at hour 21: t = 0.5");
}

{
  const kfs = makeTestKeyframes();
  // Hour 0 should be at start of midnight→sunrise span
  const { a, b, t } = findKeyframePair(kfs, 0);
  assert(a.hour === 0, "at hour 0: a.hour = 0");
  assert(b.hour === 6, "at hour 0: b.hour = 6");
  assertApprox(t, 0, "at hour 0: t = 0");
}

{
  const kfs = makeTestKeyframes();
  // Hour 3 should be midway 0→6
  const { a, b, t } = findKeyframePair(kfs, 3);
  assert(a.hour === 0, "at hour 3: a.hour = 0");
  assert(b.hour === 6, "at hour 3: b.hour = 6");
  assertApprox(t, 0.5, "at hour 3: t = 0.5");
}

// --- interpolateKeyframes ---

console.log("\ninterpolateKeyframes:");

{
  const kfs = makeTestKeyframes();
  const result = interpolateKeyframes(kfs[0], kfs[1], 0.5);

  assertApprox(result.sunIntensity, 0.3, "midpoint sun intensity = 0.3");
  assertApprox(result.hemiIntensity, 0.325, "midpoint hemi intensity = 0.325");
  assertApprox(result.fogDensity, 0.0025, "midpoint fog density");

  // Color interpolation
  assertApprox(result.sunColor.r, 0.55, "midpoint sun color R");
  assertApprox(result.sunColor.g, 0.35, "midpoint sun color G");
  assertApprox(result.sunColor.b, 0.25, "midpoint sun color B");
}

{
  // At t=0, should match keyframe A exactly
  const kfs = makeTestKeyframes();
  const result = interpolateKeyframes(kfs[2], kfs[3], 0);
  assertApprox(result.sunIntensity, 1.1, "t=0: matches keyframe A intensity");
  assertApprox(result.sunAltitude, 1.2, "t=0: matches keyframe A altitude");
}

{
  // At t=1, should match keyframe B exactly
  const kfs = makeTestKeyframes();
  const result = interpolateKeyframes(kfs[2], kfs[3], 1);
  assertApprox(result.sunIntensity, 0.5, "t=1: matches keyframe B intensity");
  assertApprox(result.sunAltitude, 0.1, "t=1: matches keyframe B altitude");
}

// --- GameTimeManager.fractionalHour ---

console.log("\nGameTimeManager.fractionalHour:");

{
  const tm = new GameTimeManager({ startHour: 8, startMinute: 0 });
  assertApprox(tm.fractionalHour, 8.0, "8:00 → 8.0");
}

{
  const tm = new GameTimeManager({ startHour: 14, startMinute: 30 });
  assertApprox(tm.fractionalHour, 14.5, "14:30 → 14.5");
}

{
  const tm = new GameTimeManager({ startHour: 0, startMinute: 15 });
  assertApprox(tm.fractionalHour, 0.25, "0:15 → 0.25");
}

{
  const tm = new GameTimeManager({ startHour: 23, startMinute: 45 });
  assertApprox(tm.fractionalHour, 23.75, "23:45 → 23.75");
}

// --- Edge cases ---

console.log("\nEdge cases:");

{
  const kfs = makeTestKeyframes();
  // Negative hour (should normalize)
  const { a } = findKeyframePair(kfs, -3);
  assert(a.hour === 18, "hour -3 normalizes to 21 range (a.hour = 18)");
}

{
  const kfs = makeTestKeyframes();
  // Hour > 24 (should normalize)
  const { a, b, t } = findKeyframePair(kfs, 27);
  assert(a.hour === 0, "hour 27 normalizes to 3 (a.hour = 0)");
  assert(b.hour === 6, "hour 27: b.hour = 6");
  assertApprox(t, 0.5, "hour 27: t = 0.5");
}

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
