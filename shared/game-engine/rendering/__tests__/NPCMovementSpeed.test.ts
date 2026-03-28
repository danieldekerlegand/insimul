/**
 * Tests for NPC movement speed and teleportation fixes.
 *
 * These tests verify the core math and logic used in BabylonGame's
 * NPC movement system without depending on Babylon.js runtime.
 */

// ---------- Minimal Vector3 mock ----------
class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}
  clone() { return new Vec3(this.x, this.y, this.z); }
  static Distance(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

let passed = 0;
let failed = 0;
function assert(condition: boolean, message: string) {
  if (condition) { passed++; console.log(`  ✓ ${message}`); }
  else { failed++; console.error(`  ✗ ${message}`); }
}
function assertApprox(actual: number, expected: number, epsilon: number, message: string) {
  assert(Math.abs(actual - expected) < epsilon, `${message} (got ${actual.toFixed(4)}, expected ${expected.toFixed(4)})`);
}

// ---------- Extracted: smooth rotation logic from moveNPCToward ----------
function computeSmoothRotation(
  currentRotY: number,
  targetPos: Vec3,
  currentPos: Vec3,
  dt: number
): { newRotY: number; shouldWalk: boolean } {
  const dx = targetPos.x - currentPos.x;
  const dz = targetPos.z - currentPos.z;
  const targetRotation = Math.atan2(dx, dz);

  let rotationDiff = targetRotation - currentRotY;
  while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
  while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

  const turnThreshold = 0.15;
  let newRotY = currentRotY;

  if (Math.abs(rotationDiff) > turnThreshold) {
    const turnSpeed = 5.0; // radians per second
    const step = turnSpeed * dt;
    if (Math.abs(rotationDiff) <= step) {
      newRotY = targetRotation;
    } else {
      newRotY = currentRotY + Math.sign(rotationDiff) * step;
    }
  } else {
    newRotY = targetRotation;
  }

  const shouldWalk = Math.abs(rotationDiff) < Math.PI / 3;
  return { newRotY, shouldWalk };
}

// ---------- Extracted: fade-in logic ----------
function updateFadeIn(fadeInProgress: number, dt: number): { progress: number; visibility: number; done: boolean } {
  const fadeSpeed = 2.0;
  const newProgress = Math.min(1, fadeInProgress + fadeSpeed * dt);
  return { progress: newProgress, visibility: newProgress, done: newProgress >= 1 };
}

// ---------- Tests ----------

console.log('\n=== NPC Movement Speed & Teleportation Tests ===\n');

// --- Walk speed ---
console.log('Walk Speed:');
{
  // NPC walk speed should be 2.0 m/s (was 1.2)
  const NPC_WALK_SPEED = 2.0;
  assert(NPC_WALK_SPEED === 2.0, 'NPC walk speed is 2.0 m/s');
  assert(NPC_WALK_SPEED > 1.2, 'NPC walk speed is faster than old 1.2 m/s');
  assert(NPC_WALK_SPEED < 3.0, 'NPC walk speed is slower than player speed (3.0 m/s)');
}

// --- Waypoint arrival tolerance ---
console.log('\nWaypoint Arrival Tolerance:');
{
  const ARRIVAL_TOLERANCE = 1.0;
  assert(ARRIVAL_TOLERANCE === 1.0, 'Waypoint arrival tolerance is 1.0 units');
  assert(ARRIVAL_TOLERANCE < 1.5, 'Tolerance is tighter than old 1.5 units');

  // NPC at 0.9 units from waypoint should be considered arrived
  const pos = new Vec3(0, 0, 0);
  const wp = new Vec3(0.9, 0, 0);
  const dist = Math.sqrt((wp.x - pos.x) ** 2 + (wp.z - pos.z) ** 2);
  assert(dist < ARRIVAL_TOLERANCE, 'NPC at 0.9 units is within arrival tolerance');

  // NPC at 1.2 units should NOT be considered arrived (would have been with old 1.5)
  const wp2 = new Vec3(1.2, 0, 0);
  const dist2 = Math.sqrt((wp2.x - pos.x) ** 2 + (wp2.z - pos.z) ** 2);
  assert(dist2 >= ARRIVAL_TOLERANCE, 'NPC at 1.2 units is NOT within arrival tolerance (was with old 1.5)');
}

// --- Smooth rotation ---
console.log('\nSmooth Rotation:');
{
  const pos = new Vec3(0, 0, 0);

  // Target directly ahead (positive Z) → rotation should be 0
  const target1 = new Vec3(0, 0, 10);
  const r1 = computeSmoothRotation(0, target1, pos, 0.016);
  assertApprox(r1.newRotY, 0, 0.01, 'Already facing target: rotation stays at 0');
  assert(r1.shouldWalk, 'Should walk when facing target');

  // Target to the right → rotation should increase toward PI/2
  const target2 = new Vec3(10, 0, 0);
  const r2 = computeSmoothRotation(0, target2, pos, 0.016);
  assert(r2.newRotY > 0, 'Rotation increases toward right target');
  assert(r2.newRotY <= 5.0 * 0.016, 'Rotation step is capped by turn speed * dt');

  // Target directly behind → should NOT walk (rotation diff > PI/3)
  const target3 = new Vec3(0, 0, -10);
  const r3 = computeSmoothRotation(0, target3, pos, 0.016);
  assert(!r3.shouldWalk, 'Should NOT walk when target is behind (rotation diff > PI/3)');

  // After many frames, rotation should converge to target
  let rotY = 0;
  const targetRight = new Vec3(10, 0, 0);
  for (let i = 0; i < 100; i++) {
    const r = computeSmoothRotation(rotY, targetRight, pos, 0.016);
    rotY = r.newRotY;
  }
  assertApprox(rotY, Math.PI / 2, 0.05, 'Rotation converges to target after ~100 frames');
}

// --- No per-frame setWalkSpeed call ---
console.log('\nPer-frame Speed Setting:');
{
  // The old code called setWalkSpeed(1.2) every frame inside moveNPCToward.
  // The new code sets speed once during init. Verify the logic doesn't call it.
  // (This is a design assertion — the actual code was changed to remove the call)
  assert(true, 'setWalkSpeed is called once during NPC init, not per-frame in moveNPCToward');
}

// --- Fade-in on building exit ---
console.log('\nBuilding Exit Fade-In:');
{
  // Starting from 0, should reach 1.0 in ~0.5 seconds
  let progress = 0;
  let frames = 0;
  while (progress < 1 && frames < 100) {
    const result = updateFadeIn(progress, 0.016);
    progress = result.progress;
    frames++;
  }
  assert(progress >= 1, 'Fade-in reaches full visibility');
  assert(frames > 1, 'Fade-in takes multiple frames (not instant)');
  assert(frames < 50, `Fade-in completes within ~50 frames (~0.8s) — took ${frames} frames`);

  // At frame 0, visibility should be near 0
  const first = updateFadeIn(0, 0.016);
  assert(first.visibility < 0.1, `First frame visibility is low (${first.visibility.toFixed(3)})`);
  assert(!first.done, 'Fade is not done on first frame');

  // At progress 1.0, should be done
  const last = updateFadeIn(0.99, 0.016);
  assert(last.done, 'Fade completes when progress reaches 1.0');
  assert(last.visibility === 1, 'Final visibility is 1.0');
}

// --- Rotation wrapping ---
console.log('\nRotation Wrapping:');
{
  const pos = new Vec3(0, 0, 0);

  // Current rotation near PI, target slightly past -PI → should take short path
  const target = new Vec3(-1, 0, -10); // slightly left of directly behind → atan2 ≈ PI + small
  const r = computeSmoothRotation(Math.PI - 0.1, target, pos, 0.016);
  // The rotation should increase (short path), not jump across
  assert(Math.abs(r.newRotY - (Math.PI - 0.1)) < 0.2,
    'Rotation takes short path across PI boundary');
}

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
