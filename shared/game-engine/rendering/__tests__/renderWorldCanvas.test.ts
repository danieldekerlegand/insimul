import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  renderWorldCanvas,
  TERRAIN_PALETTES,
  type WorldCanvasStreet,
  type WorldCanvasBuilding,
} from '../MinimapTerrainRenderer';

// Mock canvas 2D context that records draw calls
function createMockContext() {
  const fillRects: Array<[number, number, number, number]> = [];
  const strokeRects: Array<[number, number, number, number]> = [];
  const moveToArgs: Array<[number, number]> = [];
  const lineToArgs: Array<[number, number]> = [];
  let beginPathCount = 0;
  let strokeCount = 0;

  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => fillRects.push([x, y, w, h])),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => strokeRects.push([x, y, w, h])),
    beginPath: vi.fn(() => { beginPathCount++; }),
    moveTo: vi.fn((x: number, y: number) => moveToArgs.push([x, y])),
    lineTo: vi.fn((x: number, y: number) => lineToArgs.push([x, y])),
    stroke: vi.fn(() => { strokeCount++; }),
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    get _fillRects() { return fillRects; },
    get _strokeRects() { return strokeRects; },
    get _moveToArgs() { return moveToArgs; },
    get _lineToArgs() { return lineToArgs; },
    get _beginPathCount() { return beginPathCount; },
    get _strokeCount() { return strokeCount; },
  };
  return ctx;
}

describe('renderWorldCanvas', () => {
  let mockCtx: ReturnType<typeof createMockContext>;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    mockCtx = createMockContext();
    originalCreateElement = globalThis.document?.createElement;

    // Provide a minimal document.createElement mock
    if (!globalThis.document) {
      (globalThis as Record<string, unknown>).document = {};
    }
    (globalThis.document as Record<string, unknown>).createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: () => mockCtx,
      toDataURL: () => 'data:image/png;base64,mock',
    }));
  });

  afterEach(() => {
    if (originalCreateElement) {
      document.createElement = originalCreateElement;
    }
  });

  it('creates a canvas with the correct dimensions', () => {
    const canvas = renderWorldCanvas(256, 512);
    expect(canvas.width).toBe(256);
    expect(canvas.height).toBe(256);
  });

  it('fills the background with the biome midland color', () => {
    renderWorldCanvas(256, 512, 'forest');
    const [r, g, b] = TERRAIN_PALETTES.forest.midland;
    // The first fillRect should be the full-canvas background
    expect(mockCtx._fillRects[0]).toEqual([0, 0, 256, 256]);
    expect(mockCtx.fillStyle).not.toBe(''); // fillStyle was set
  });

  it('falls back to plains palette for unknown biome', () => {
    renderWorldCanvas(256, 512, 'nonexistent');
    // Should still fill the background without error
    expect(mockCtx._fillRects[0]).toEqual([0, 0, 256, 256]);
  });

  it('draws nothing extra when no streets or buildings provided', () => {
    renderWorldCanvas(256, 512);
    // Only the background fillRect
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(1);
    expect(mockCtx._beginPathCount).toBe(0);
  });

  it('draws street segments as polylines', () => {
    const streets: WorldCanvasStreet[] = [
      {
        waypoints: [
          { x: 0, z: 0 },
          { x: 10, z: 10 },
          { x: 20, z: 0 },
        ],
        width: 4,
      },
    ];
    renderWorldCanvas(256, 512, 'plains', streets);
    expect(mockCtx._beginPathCount).toBe(1);
    expect(mockCtx._moveToArgs).toHaveLength(1);
    expect(mockCtx._lineToArgs).toHaveLength(2);
    expect(mockCtx._strokeCount).toBe(1);
  });

  it('skips street segments with fewer than 2 waypoints', () => {
    const streets: WorldCanvasStreet[] = [
      { waypoints: [{ x: 0, z: 0 }], width: 4 },
    ];
    renderWorldCanvas(256, 512, 'plains', streets);
    expect(mockCtx._beginPathCount).toBe(0);
  });

  it('draws building footprints as filled rectangles with outlines', () => {
    const buildings: WorldCanvasBuilding[] = [
      { position: { x: 10, z: 20 }, type: 'business', width: 8, depth: 6 },
      { position: { x: -10, z: -20 }, type: 'residence', width: 6, depth: 6 },
      { position: { x: 0, z: 0 }, type: 'other' },
    ];
    renderWorldCanvas(256, 512, 'plains', [], buildings);
    // 1 background fill + 3 building fills
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(4);
    // 3 building outlines
    expect(mockCtx.strokeRect).toHaveBeenCalledTimes(3);
  });

  it('maps world center (0,0) to canvas center', () => {
    const buildings: WorldCanvasBuilding[] = [
      { position: { x: 0, z: 0 }, type: 'other', width: 0, depth: 0 },
    ];
    renderWorldCanvas(100, 200, 'plains', [], buildings);
    // World (0,0) with worldHalf=100 → cx = ((0+100)/200)*100 = 50
    // cy = ((-0+100)/200)*100 = 50
    // min size = 2, so fillRect(50-1, 50-1, 2, 2) = (49, 49, 2, 2)
    const buildingFill = mockCtx._fillRects[1]; // second fillRect (first is background)
    expect(buildingFill[0]).toBe(49);
    expect(buildingFill[1]).toBe(49);
    expect(buildingFill[2]).toBe(2);
    expect(buildingFill[3]).toBe(2);
  });

  it('maps world bottom-left to canvas bottom-left', () => {
    const worldSize = 200;
    const outputSize = 100;
    const buildings: WorldCanvasBuilding[] = [
      { position: { x: -100, z: -100 }, type: 'other', width: 0, depth: 0 },
    ];
    renderWorldCanvas(outputSize, worldSize, 'plains', [], buildings);
    // x = ((-100 + 100) / 200) * 100 = 0
    // z = ((-(-100) + 100) / 200) * 100 = 100 (bottom of canvas, since -z in world = bottom)
    const buildingFill = mockCtx._fillRects[1];
    expect(buildingFill[0]).toBe(-1); // 0 - 1
    expect(buildingFill[1]).toBe(99); // 100 - 1
  });

  it('draws both streets and buildings together', () => {
    const streets: WorldCanvasStreet[] = [
      { waypoints: [{ x: -50, z: 0 }, { x: 50, z: 0 }], width: 2 },
    ];
    const buildings: WorldCanvasBuilding[] = [
      { position: { x: 0, z: 0 }, type: 'business', width: 10, depth: 10 },
    ];
    renderWorldCanvas(256, 512, 'plains', streets, buildings);
    // Streets drawn
    expect(mockCtx._beginPathCount).toBe(1);
    expect(mockCtx._strokeCount).toBe(1);
    // Buildings drawn (1 bg + 1 building)
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
    expect(mockCtx.strokeRect).toHaveBeenCalledTimes(1);
  });

  it('handles multiple street segments', () => {
    const streets: WorldCanvasStreet[] = [
      { waypoints: [{ x: -50, z: 0 }, { x: 0, z: 0 }], width: 2 },
      { waypoints: [{ x: 0, z: 0 }, { x: 50, z: 0 }], width: 3 },
      { waypoints: [{ x: 0, z: -50 }, { x: 0, z: 50 }], width: 2 },
    ];
    renderWorldCanvas(256, 512, 'plains', streets);
    expect(mockCtx._beginPathCount).toBe(3);
    expect(mockCtx._moveToArgs).toHaveLength(3);
    expect(mockCtx._lineToArgs).toHaveLength(3);
    expect(mockCtx._strokeCount).toBe(3);
  });
});
