/**
 * Tests for minimap zoom and interaction (US-042)
 *
 * Verifies zoom level calculations, view radius scaling, and
 * click-to-navigate coordinate transforms without Babylon.js.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/MinimapZoomInteraction.test.ts
 */

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
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message} (expected ~${expected}, got ${actual})`);
  }
}

// ── Mirror the zoom logic from BabylonGUIManager ──

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4.0;
const ZOOM_STEP = 0.5;

function clampZoom(level: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(level * 10) / 10));
}

function computeViewRadius(worldSize: number, zoomLevel: number): number {
  const baseViewRadius = worldSize * 0.2;
  return baseViewRadius / zoomLevel;
}

// ── Mirror the coordinate transform used in updateMinimap ──

function toMap(
  wx: number, wz: number,
  playerX: number, playerZ: number,
  viewRadius: number, mapSize: number
): [number, number] {
  const vpSize = viewRadius * 2;
  const mx = ((wx - playerX) / vpSize) * mapSize;
  const mz = (-(wz - playerZ) / vpSize) * mapSize;
  return [mx, mz];
}

// ── Mirror the click-to-navigate inverse transform ──

function clickToWorld(
  localX: number, localY: number,
  playerX: number, playerZ: number,
  viewRadius: number, mapSize: number
): { worldX: number; worldZ: number } {
  const vpSize = viewRadius * 2;
  const worldX = playerX + (localX / mapSize) * vpSize;
  const worldZ = playerZ - (localY / mapSize) * vpSize;
  return { worldX, worldZ };
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== Zoom level clamping ===');

{
  assertApprox(clampZoom(1.0), 1.0, 0.001, 'default zoom level stays at 1.0');
  assertApprox(clampZoom(1.0 + ZOOM_STEP), 1.5, 0.001, 'zoom in one step = 1.5');
  assertApprox(clampZoom(1.0 - ZOOM_STEP), 0.5, 0.001, 'zoom out one step = 0.5');
  assertApprox(clampZoom(0.0), ZOOM_MIN, 0.001, 'zoom clamped to minimum');
  assertApprox(clampZoom(10.0), ZOOM_MAX, 0.001, 'zoom clamped to maximum');
  assertApprox(clampZoom(ZOOM_MIN), ZOOM_MIN, 0.001, 'zoom at min boundary stays');
  assertApprox(clampZoom(ZOOM_MAX), ZOOM_MAX, 0.001, 'zoom at max boundary stays');
}

console.log('\n=== View radius scaling with zoom ===');

{
  const worldSize = 512;
  const baseRadius = worldSize * 0.2; // 102.4

  assertApprox(computeViewRadius(worldSize, 1.0), baseRadius, 0.01, 'zoom 1.0 = base radius');
  assertApprox(computeViewRadius(worldSize, 2.0), baseRadius / 2, 0.01, 'zoom 2.0 = half radius (more zoomed in)');
  assertApprox(computeViewRadius(worldSize, 0.5), baseRadius * 2, 0.01, 'zoom 0.5 = double radius (zoomed out)');
  assertApprox(computeViewRadius(worldSize, 4.0), baseRadius / 4, 0.01, 'zoom 4.0 = quarter radius (max zoom in)');
}

console.log('\n=== Marker positioning at different zoom levels ===');

{
  const MAP_SIZE = 200;
  const worldSize = 512;

  // At zoom 1.0, a point 50 units east of player
  const vr1 = computeViewRadius(worldSize, 1.0);
  const [mx1] = toMap(50, 0, 0, 0, vr1, MAP_SIZE);

  // At zoom 2.0, same point should appear twice as far from center (more zoomed in)
  const vr2 = computeViewRadius(worldSize, 2.0);
  const [mx2] = toMap(50, 0, 0, 0, vr2, MAP_SIZE);

  assertApprox(mx2, mx1 * 2, 0.01, 'marker moves 2x further from center at 2x zoom');

  // At zoom 0.5, same point should be half as far (zoomed out)
  const vr05 = computeViewRadius(worldSize, 0.5);
  const [mx05] = toMap(50, 0, 0, 0, vr05, MAP_SIZE);

  assertApprox(mx05, mx1 / 2, 0.01, 'marker moves half as far at 0.5x zoom');
}

console.log('\n=== Click-to-navigate: center click ===');

{
  const MAP_SIZE = 200;
  const worldSize = 512;
  const playerX = 100;
  const playerZ = -50;
  const vr = computeViewRadius(worldSize, 1.0);

  // Click at center of map (localX=0, localY=0 relative to center)
  const { worldX, worldZ } = clickToWorld(0, 0, playerX, playerZ, vr, MAP_SIZE);
  assertApprox(worldX, playerX, 0.01, 'center click X = player X');
  assertApprox(worldZ, playerZ, 0.01, 'center click Z = player Z');
}

console.log('\n=== Click-to-navigate: offset clicks ===');

{
  const MAP_SIZE = 200;
  const worldSize = 512;
  const vr = computeViewRadius(worldSize, 1.0); // 102.4
  const vpSize = vr * 2; // 204.8

  // Click at right edge of map (localX = MAP_SIZE/2 = 100, localY = 0)
  const { worldX: rightX } = clickToWorld(100, 0, 0, 0, vr, MAP_SIZE);
  assertApprox(rightX, vpSize / 2, 0.01, 'right edge click maps to east world boundary');

  // Click at top of map (localX = 0, localY = -100)
  const { worldZ: topZ } = clickToWorld(0, -100, 0, 0, vr, MAP_SIZE);
  assertApprox(topZ, vpSize / 2, 0.01, 'top edge click maps to north world boundary');
}

console.log('\n=== Click-to-navigate: zoom affects click range ===');

{
  const MAP_SIZE = 200;
  const worldSize = 512;

  // At zoom 1.0, clicking at map edge
  const vr1 = computeViewRadius(worldSize, 1.0);
  const { worldX: x1 } = clickToWorld(100, 0, 0, 0, vr1, MAP_SIZE);

  // At zoom 2.0, clicking at map edge should reach half the distance
  const vr2 = computeViewRadius(worldSize, 2.0);
  const { worldX: x2 } = clickToWorld(100, 0, 0, 0, vr2, MAP_SIZE);

  assertApprox(x2, x1 / 2, 0.01, 'zoom 2x halves click range');

  // At zoom 0.5, clicking at map edge should reach double the distance
  const vr05 = computeViewRadius(worldSize, 0.5);
  const { worldX: x05 } = clickToWorld(100, 0, 0, 0, vr05, MAP_SIZE);

  assertApprox(x05, x1 * 2, 0.01, 'zoom 0.5x doubles click range');
}

console.log('\n=== Click-to-navigate roundtrip (toMap ↔ clickToWorld) ===');

{
  const MAP_SIZE = 200;
  const worldSize = 512;
  const playerX = 30;
  const playerZ = -20;

  for (const zoom of [0.5, 1.0, 2.0, 4.0]) {
    const vr = computeViewRadius(worldSize, zoom);
    const testX = 75;
    const testZ = -40;

    // World → minimap pixel offset
    const [mx, mz] = toMap(testX, testZ, playerX, playerZ, vr, MAP_SIZE);

    // Minimap pixel offset → world (inverse)
    const { worldX, worldZ } = clickToWorld(mx, mz, playerX, playerZ, vr, MAP_SIZE);

    assertApprox(worldX, testX, 0.01, `roundtrip X at zoom ${zoom}`);
    assertApprox(worldZ, testZ, 0.01, `roundtrip Z at zoom ${zoom}`);
  }
}

console.log('\n=== Zoom step sequence ===');

{
  let zoom = 1.0;
  // Zoom in 6 steps (should max out at 4.0)
  for (let i = 0; i < 6; i++) {
    zoom = clampZoom(zoom + ZOOM_STEP);
  }
  assertApprox(zoom, ZOOM_MAX, 0.001, 'zoom in 6 steps hits max at 4.0');

  // Zoom out 8 steps from 4.0 (should min out at 0.5)
  for (let i = 0; i < 8; i++) {
    zoom = clampZoom(zoom - ZOOM_STEP);
  }
  assertApprox(zoom, ZOOM_MIN, 0.001, 'zoom out 8 steps from max hits min at 0.5');
}

// ── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
