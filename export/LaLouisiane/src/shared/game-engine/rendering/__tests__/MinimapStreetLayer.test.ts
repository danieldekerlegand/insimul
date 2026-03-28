/**
 * Tests for minimap street network layer (US-040)
 *
 * Verifies that street network data flows correctly to the minimap and
 * that the street drawing logic produces correct canvas coordinates.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/MinimapStreetLayer.test.ts
 */

import type { MinimapData } from '../BabylonGUIManager';

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

// ── Coordinate transform logic (mirrors BabylonGUIManager.drawMinimapStreets) ──

function toCanvas(
  wx: number, wz: number,
  playerX: number, playerZ: number,
  viewRadius: number, mapSize: number
): [number, number] {
  const vpSize = viewRadius * 2;
  const half = mapSize / 2;
  const cx = ((wx - playerX) / vpSize) * mapSize + half;
  const cy = (-(wz - playerZ) / vpSize) * mapSize + half;
  return [cx, cy];
}

// ── Mock canvas context to verify drawing calls ──

interface DrawCall {
  type: 'moveTo' | 'lineTo';
  x: number;
  y: number;
}

function createMockContext() {
  const calls: DrawCall[] = [];
  let beginPathCount = 0;
  let strokeCount = 0;
  let savedLineWidth = 0;

  return {
    calls,
    get beginPathCount() { return beginPathCount; },
    get strokeCount() { return strokeCount; },
    get lineWidth() { return savedLineWidth; },
    set lineWidth(v: number) { savedLineWidth = v; },
    strokeStyle: '',
    lineCap: '' as CanvasLineCap,
    lineJoin: '' as CanvasLineJoin,
    save() {},
    restore() {},
    beginPath() { beginPathCount++; },
    moveTo(x: number, y: number) { calls.push({ type: 'moveTo', x, y }); },
    lineTo(x: number, y: number) { calls.push({ type: 'lineTo', x, y }); },
    stroke() { strokeCount++; },
  };
}

/**
 * Simulate the drawMinimapStreets logic (extracted from BabylonGUIManager)
 * so we can test without Babylon.js dependencies.
 */
function drawMinimapStreets(
  ctx: ReturnType<typeof createMockContext>,
  streets: NonNullable<MinimapData['streets']>,
  viewRadius: number,
  playerPos: { x: number; z: number },
  mapSize: number
): void {
  const vpSize = viewRadius * 2;
  const half = mapSize / 2;

  const toCanvasLocal = (wx: number, wz: number): [number, number] => {
    const cx = ((wx - playerPos.x) / vpSize) * mapSize + half;
    const cy = (-(wz - playerPos.z) / vpSize) * mapSize + half;
    return [cx, cy];
  };

  ctx.save();
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const street of streets) {
    if (street.waypoints.length < 2) continue;

    const lineWidth = Math.max(1, (street.width / vpSize) * mapSize);
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    const [sx, sy] = toCanvasLocal(street.waypoints[0].x, street.waypoints[0].z);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < street.waypoints.length; i++) {
      const [px, py] = toCanvasLocal(street.waypoints[i].x, street.waypoints[i].z);
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== MinimapData streets field ===');

{
  const data: MinimapData = {
    settlements: [],
    streets: [
      { waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }], width: 4 },
    ],
    playerPosition: { x: 0, z: 0 },
    playerRotationY: 0,
    worldSize: 512,
  };
  assert(data.streets !== undefined, 'MinimapData accepts streets field');
  assert(data.streets!.length === 1, 'streets array has one segment');
  assert(data.streets![0].waypoints.length === 2, 'segment has two waypoints');
}

{
  const data: MinimapData = {
    settlements: [],
    playerPosition: { x: 0, z: 0 },
    playerRotationY: 0,
    worldSize: 512,
  };
  assert(data.streets === undefined, 'streets field is optional');
}

console.log('\n=== Coordinate transform: toCanvas ===');

{
  // Player at origin, world point at origin → center of map
  const [cx, cy] = toCanvas(0, 0, 0, 0, 100, 200);
  assertApprox(cx, 100, 0.01, 'origin maps to center X');
  assertApprox(cy, 100, 0.01, 'origin maps to center Y');
}

{
  // Point to the right of player (positive X) → right on minimap
  const [cx, cy] = toCanvas(50, 0, 0, 0, 100, 200);
  assertApprox(cx, 150, 0.01, 'positive X offset maps right');
  assertApprox(cy, 100, 0.01, 'same Z stays at center Y');
}

{
  // Point above player (positive Z in world) → up on minimap (lower cy)
  const [cx, cy] = toCanvas(0, 50, 0, 0, 100, 200);
  assertApprox(cx, 100, 0.01, 'same X stays at center X');
  assertApprox(cy, 50, 0.01, 'positive Z maps upward (lower canvas Y)');
}

{
  // Player offset: player at (100, 100), point at (100, 100) → center
  const [cx, cy] = toCanvas(100, 100, 100, 100, 100, 200);
  assertApprox(cx, 100, 0.01, 'player-relative origin maps to center X');
  assertApprox(cy, 100, 0.01, 'player-relative origin maps to center Y');
}

{
  // Point at edge of view radius → edge of map
  const [cx, cy] = toCanvas(100, 0, 0, 0, 100, 200);
  assertApprox(cx, 200, 0.01, 'point at view radius maps to map edge');
}

console.log('\n=== drawMinimapStreets rendering ===');

{
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    {
      waypoints: [{ x: -10, z: 0 }, { x: 10, z: 0 }],
      width: 4,
    },
  ];
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);

  assert(ctx.beginPathCount === 1, 'one beginPath call for one street');
  assert(ctx.strokeCount === 1, 'one stroke call for one street');
  assert(ctx.calls.length === 2, 'one moveTo + one lineTo for two-point street');
  assert(ctx.calls[0].type === 'moveTo', 'first call is moveTo');
  assert(ctx.calls[1].type === 'lineTo', 'second call is lineTo');

  // Verify coordinates: (-10, 0) → canvas (90, 100), (10, 0) → canvas (110, 100)
  assertApprox(ctx.calls[0].x, 90, 0.01, 'moveTo X correct');
  assertApprox(ctx.calls[0].y, 100, 0.01, 'moveTo Y correct');
  assertApprox(ctx.calls[1].x, 110, 0.01, 'lineTo X correct');
  assertApprox(ctx.calls[1].y, 100, 0.01, 'lineTo Y correct');
}

{
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    {
      waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }],
      width: 2,
    },
  ];
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);

  assert(ctx.calls.length === 3, 'three calls for three-point polyline');
  assert(ctx.calls[0].type === 'moveTo', 'starts with moveTo');
  assert(ctx.calls[1].type === 'lineTo', 'second is lineTo');
  assert(ctx.calls[2].type === 'lineTo', 'third is lineTo');
}

{
  // Multiple streets
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    { waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }], width: 4 },
    { waypoints: [{ x: 0, z: 0 }, { x: 0, z: 10 }], width: 4 },
  ];
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);

  assert(ctx.beginPathCount === 2, 'two beginPath calls for two streets');
  assert(ctx.strokeCount === 2, 'two stroke calls for two streets');
  assert(ctx.calls.length === 4, 'two moveTo + two lineTo');
}

{
  // Skip segments with fewer than 2 waypoints
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    { waypoints: [{ x: 0, z: 0 }], width: 4 }, // should be skipped
    { waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }], width: 4 },
  ];
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);

  assert(ctx.beginPathCount === 1, 'single-point segment is skipped');
  assert(ctx.strokeCount === 1, 'only valid segment is stroked');
}

{
  // Line width scaling
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    { waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }], width: 20 },
  ];
  // viewRadius=100, vpSize=200, mapSize=200 → lineWidth = (20/200)*200 = 20
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);
  assertApprox(ctx.lineWidth, 20, 0.01, 'line width scales with road width');
}

{
  // Minimum line width of 1px
  const ctx = createMockContext();
  const streets: NonNullable<MinimapData['streets']> = [
    { waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }], width: 0.1 },
  ];
  drawMinimapStreets(ctx, streets, 100, { x: 0, z: 0 }, 200);
  assertApprox(ctx.lineWidth, 1, 0.01, 'minimum line width is 1px');
}

{
  // Empty streets array → no drawing
  const ctx = createMockContext();
  drawMinimapStreets(ctx, [], 100, { x: 0, z: 0 }, 200);
  assert(ctx.beginPathCount === 0, 'no paths for empty streets');
  assert(ctx.strokeCount === 0, 'no strokes for empty streets');
}

// ── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
