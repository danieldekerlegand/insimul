/**
 * Tests for minimap building footprint layer (US-041)
 *
 * Verifies that building footprint data flows correctly to the minimap and
 * that the building drawing logic produces correct canvas coordinates and colors.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/MinimapBuildingFootprint.test.ts
 */

import type { MinimapData, MinimapBuilding } from '../BabylonGUIManager';

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

// ── Coordinate transform logic (mirrors BabylonGUIManager.drawMinimapBuildings) ──

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

interface FillRectCall {
  type: 'fillRect';
  x: number;
  y: number;
  w: number;
  h: number;
  fillStyle: string;
}

interface StrokeRectCall {
  type: 'strokeRect';
  x: number;
  y: number;
  w: number;
  h: number;
}

function createMockContext() {
  const fillRects: FillRectCall[] = [];
  const strokeRects: StrokeRectCall[] = [];
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 0;

  return {
    fillRects,
    strokeRects,
    get fillStyle() { return currentFillStyle; },
    set fillStyle(v: string) { currentFillStyle = v; },
    get strokeStyle() { return currentStrokeStyle; },
    set strokeStyle(v: string) { currentStrokeStyle = v; },
    get lineWidth() { return currentLineWidth; },
    set lineWidth(v: number) { currentLineWidth = v; },
    save() {},
    restore() {},
    fillRect(x: number, y: number, w: number, h: number) {
      fillRects.push({ type: 'fillRect', x, y, w, h, fillStyle: currentFillStyle });
    },
    strokeRect(x: number, y: number, w: number, h: number) {
      strokeRects.push({ type: 'strokeRect', x, y, w, h });
    },
  };
}

/**
 * Simulate the drawMinimapBuildings logic (extracted from BabylonGUIManager)
 * so we can test without Babylon.js dependencies.
 */
function drawMinimapBuildings(
  ctx: ReturnType<typeof createMockContext>,
  buildings: MinimapBuilding[],
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

  for (const building of buildings) {
    const [cx, cy] = toCanvasLocal(building.position.x, building.position.z);
    const w = Math.max(2, ((building.width ?? 6) / vpSize) * mapSize);
    const h = Math.max(2, ((building.depth ?? 6) / vpSize) * mapSize);

    // Skip buildings entirely outside the viewport
    if (cx + w / 2 < 0 || cx - w / 2 > mapSize || cy + h / 2 < 0 || cy - h / 2 > mapSize) continue;

    switch (building.type) {
      case 'business':
        ctx.fillStyle = 'rgba(100, 149, 237, 0.7)';
        break;
      case 'residence':
        ctx.fillStyle = 'rgba(210, 180, 140, 0.7)';
        break;
      default:
        ctx.fillStyle = 'rgba(169, 169, 169, 0.7)';
        break;
    }

    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  }

  ctx.restore();
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== MinimapData buildings field ===');

{
  const data: MinimapData = {
    settlements: [],
    buildings: [
      { position: { x: 10, z: 20 }, type: 'business', width: 8, depth: 10 },
    ],
    playerPosition: { x: 0, z: 0 },
    playerRotationY: 0,
    worldSize: 512,
  };
  assert(data.buildings !== undefined, 'MinimapData accepts buildings field');
  assert(data.buildings!.length === 1, 'buildings array has one entry');
  assert(data.buildings![0].type === 'business', 'building type is business');
  assert(data.buildings![0].width === 8, 'building width is stored');
  assert(data.buildings![0].depth === 10, 'building depth is stored');
}

{
  const data: MinimapData = {
    settlements: [],
    playerPosition: { x: 0, z: 0 },
    playerRotationY: 0,
    worldSize: 512,
  };
  assert(data.buildings === undefined, 'buildings field is optional');
}

{
  // Width/depth are optional with defaults
  const b: MinimapBuilding = { position: { x: 0, z: 0 }, type: 'residence' };
  assert(b.width === undefined, 'width is optional');
  assert(b.depth === undefined, 'depth is optional');
}

console.log('\n=== Coordinate transform: toCanvas ===');

{
  const [cx, cy] = toCanvas(0, 0, 0, 0, 100, 200);
  assertApprox(cx, 100, 0.01, 'origin maps to center X');
  assertApprox(cy, 100, 0.01, 'origin maps to center Y');
}

{
  const [cx, cy] = toCanvas(50, 0, 0, 0, 100, 200);
  assertApprox(cx, 150, 0.01, 'positive X offset maps right');
}

{
  const [cx, cy] = toCanvas(0, 50, 0, 0, 100, 200);
  assertApprox(cy, 50, 0.01, 'positive Z maps upward (lower canvas Y)');
}

console.log('\n=== drawMinimapBuildings rendering ===');

{
  // Single building at origin
  const ctx = createMockContext();
  const buildings: MinimapBuilding[] = [
    { position: { x: 0, z: 0 }, type: 'business', width: 10, depth: 10 },
  ];
  drawMinimapBuildings(ctx, buildings, 100, { x: 0, z: 0 }, 200);

  assert(ctx.fillRects.length === 1, 'one fillRect for one building');
  assert(ctx.strokeRects.length === 1, 'one strokeRect for outline');

  // Building at origin → canvas center (100, 100); size = (10/200)*200 = 10px
  const fr = ctx.fillRects[0];
  assertApprox(fr.x, 95, 0.01, 'fillRect x is center - w/2');
  assertApprox(fr.y, 95, 0.01, 'fillRect y is center - h/2');
  assertApprox(fr.w, 10, 0.01, 'fillRect width scales correctly');
  assertApprox(fr.h, 10, 0.01, 'fillRect height scales correctly');
}

{
  // Color by type: business
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 0, z: 0 }, type: 'business' }], 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects[0].fillStyle === 'rgba(100, 149, 237, 0.7)', 'business uses cornflower blue');
}

{
  // Color by type: residence
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 0, z: 0 }, type: 'residence' }], 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects[0].fillStyle === 'rgba(210, 180, 140, 0.7)', 'residence uses tan');
}

{
  // Color by type: other
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 0, z: 0 }, type: 'other' }], 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects[0].fillStyle === 'rgba(169, 169, 169, 0.7)', 'other uses dark gray');
}

{
  // Multiple buildings
  const ctx = createMockContext();
  const buildings: MinimapBuilding[] = [
    { position: { x: -20, z: 0 }, type: 'business', width: 8, depth: 6 },
    { position: { x: 20, z: 0 }, type: 'residence', width: 6, depth: 8 },
    { position: { x: 0, z: 30 }, type: 'other', width: 10, depth: 10 },
  ];
  drawMinimapBuildings(ctx, buildings, 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects.length === 3, 'three fillRects for three buildings');
  assert(ctx.strokeRects.length === 3, 'three strokeRects for three buildings');
}

{
  // Default footprint size when width/depth not specified
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 0, z: 0 }, type: 'business' }], 100, { x: 0, z: 0 }, 200);
  // Default width=6, depth=6; size = (6/200)*200 = 6px
  assertApprox(ctx.fillRects[0].w, 6, 0.01, 'default width is 6 world units');
  assertApprox(ctx.fillRects[0].h, 6, 0.01, 'default depth is 6 world units');
}

{
  // Minimum footprint size is 2px
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 0, z: 0 }, type: 'business', width: 0.1, depth: 0.1 }], 100, { x: 0, z: 0 }, 200);
  assertApprox(ctx.fillRects[0].w, 2, 0.01, 'minimum footprint width is 2px');
  assertApprox(ctx.fillRects[0].h, 2, 0.01, 'minimum footprint height is 2px');
}

{
  // Building outside viewport is culled
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 500, z: 500 }, type: 'business', width: 6, depth: 6 }], 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects.length === 0, 'building far outside viewport is not drawn');
}

{
  // Empty buildings array → no drawing
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [], 100, { x: 0, z: 0 }, 200);
  assert(ctx.fillRects.length === 0, 'no rects for empty buildings');
  assert(ctx.strokeRects.length === 0, 'no outlines for empty buildings');
}

{
  // Player offset: building relative to player
  const ctx = createMockContext();
  drawMinimapBuildings(ctx, [{ position: { x: 110, z: 100 }, type: 'residence', width: 10, depth: 10 }], 100, { x: 100, z: 100 }, 200);
  const fr = ctx.fillRects[0];
  // building at +10x from player → canvas (110, 100)
  assertApprox(fr.x + fr.w / 2, 110, 0.01, 'player-relative X offset correct');
  assertApprox(fr.y + fr.h / 2, 100, 0.01, 'player-relative Z maps to center Y');
}

// ── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
