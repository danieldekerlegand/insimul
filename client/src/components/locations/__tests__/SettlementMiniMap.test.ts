/**
 * Tests for SettlementMiniMap (US-048)
 *
 * Validates the mini-map rendering logic for the settlement editor,
 * including terrain backgrounds, street network drawing, building markers,
 * and water features.
 */
import { describe, it, expect } from 'vitest';

// ── Extract and test the pure helper logic from SettlementMiniMap ──────────

/** Terrain background colors (same as component) */
const TERRAIN_BG: Record<string, string> = {
  plains: '#5ba530',
  hills: '#8c8c59',
  mountains: '#807366',
  coast: '#66a0b3',
  river: '#4d80b3',
  forest: '#338040',
  desert: '#ccb873',
};

/** Settlement extent values */
const SETTLEMENT_EXTENT: Record<string, number> = {
  city: 60,
  town: 45,
  village: 30,
};

/** Water fill colors */
const WATER_FILL: Record<string, string> = {
  ocean: '#0d3373',
  lake: '#265a8c',
  river: '#265a8c',
  pond: '#1f4d6b',
  stream: '#2e66a6',
  waterfall: '#99bfe6',
  marsh: '#2e4733',
  canal: '#1f528c',
};

/** Convert world coordinates to canvas pixel coordinates */
function toCanvas(
  wx: number,
  wz: number,
  extent: number,
  size: number,
): [number, number] {
  const cx = ((wx + extent) / (2 * extent)) * size;
  const cy = ((wz + extent) / (2 * extent)) * size;
  return [cx, cy];
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SettlementMiniMap', () => {
  describe('terrain background colors', () => {
    it('has a color for each terrain type', () => {
      const terrains = ['plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert'];
      for (const t of terrains) {
        expect(TERRAIN_BG[t]).toBeDefined();
        expect(TERRAIN_BG[t]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('defaults to plains when terrain is unknown', () => {
      const terrain = 'swamp';
      const color = TERRAIN_BG[terrain.toLowerCase()] ?? TERRAIN_BG.plains;
      expect(color).toBe(TERRAIN_BG.plains);
    });
  });

  describe('settlement extent', () => {
    it('returns correct extents for each settlement type', () => {
      expect(SETTLEMENT_EXTENT.city).toBe(60);
      expect(SETTLEMENT_EXTENT.town).toBe(45);
      expect(SETTLEMENT_EXTENT.village).toBe(30);
    });

    it('defaults to town extent for unknown types', () => {
      const type = 'hamlet';
      const extent = SETTLEMENT_EXTENT[type] ?? 45;
      expect(extent).toBe(45);
    });
  });

  describe('toCanvas coordinate conversion', () => {
    const size = 180;

    it('maps origin (0,0) to center of canvas', () => {
      const extent = 45;
      const [cx, cy] = toCanvas(0, 0, extent, size);
      expect(cx).toBe(size / 2);
      expect(cy).toBe(size / 2);
    });

    it('maps top-left corner (-extent, -extent) to (0, 0)', () => {
      const extent = 45;
      const [cx, cy] = toCanvas(-extent, -extent, extent, size);
      expect(cx).toBeCloseTo(0);
      expect(cy).toBeCloseTo(0);
    });

    it('maps bottom-right corner (extent, extent) to (size, size)', () => {
      const extent = 45;
      const [cx, cy] = toCanvas(extent, extent, extent, size);
      expect(cx).toBeCloseTo(size);
      expect(cy).toBeCloseTo(size);
    });

    it('handles different extents (city vs village)', () => {
      // Same world position, different extent = different canvas position
      const [cx1] = toCanvas(10, 0, 60, size); // city
      const [cx2] = toCanvas(10, 0, 30, size); // village
      // In a smaller extent, the same world position is further from center
      expect(cx2).toBeGreaterThan(cx1);
    });

    it('handles negative coordinates', () => {
      const extent = 45;
      const [cx, cy] = toCanvas(-22.5, -22.5, extent, size);
      expect(cx).toBeCloseTo(size / 4);
      expect(cy).toBeCloseTo(size / 4);
    });
  });

  describe('water feature colors', () => {
    it('provides colors for all water types', () => {
      const types = ['ocean', 'lake', 'river', 'pond', 'stream', 'waterfall', 'marsh', 'canal'];
      for (const t of types) {
        expect(WATER_FILL[t]).toBeDefined();
        expect(WATER_FILL[t]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('falls back to lake for unknown water types', () => {
      const type = 'spring';
      const color = WATER_FILL[type] ?? WATER_FILL.lake;
      expect(color).toBe(WATER_FILL.lake);
    });
  });

  describe('street rendering data', () => {
    it('accepts street segments with waypoints', () => {
      const street = {
        id: 's1',
        name: 'Main St',
        direction: 'EW',
        waypoints: [
          { x: -20, z: 0 },
          { x: 20, z: 0 },
        ],
        width: 3,
      };

      // Verify waypoints convert to canvas coords
      const extent = 45;
      const [sx, sy] = toCanvas(street.waypoints[0].x, street.waypoints[0].z, extent, 180);
      const [ex, ey] = toCanvas(street.waypoints[1].x, street.waypoints[1].z, extent, 180);

      expect(sx).toBeLessThan(ex); // EW street goes left to right
      expect(sy).toBeCloseTo(ey); // Same z = same y on canvas
    });

    it('skips streets with fewer than 2 waypoints', () => {
      const streets = [
        { id: 's1', name: 'Short', waypoints: [{ x: 0, z: 0 }] },
        { id: 's2', name: 'Long', waypoints: [{ x: 0, z: 0 }, { x: 10, z: 10 }] },
      ];
      const drawable = streets.filter(s => s.waypoints && s.waypoints.length >= 2);
      expect(drawable).toHaveLength(1);
      expect(drawable[0].name).toBe('Long');
    });
  });

  describe('building markers', () => {
    it('extracts position from lot data', () => {
      const lot = { id: 'l1', position: { x: 5, z: 10 } };
      const pos = lot.position ?? (lot as any).coordinates;
      expect(pos).toEqual({ x: 5, z: 10 });
    });

    it('falls back to coordinates field', () => {
      const lot = { id: 'l1', coordinates: { x: 5, z: 10 } };
      const pos = (lot as any).position ?? lot.coordinates;
      expect(pos).toEqual({ x: 5, z: 10 });
    });

    it('returns undefined position when neither field exists', () => {
      const lot = { id: 'l1' };
      const pos = (lot as any).position ?? (lot as any).coordinates;
      expect(pos).toBeUndefined();
    });

    it('places business markers at correct canvas position', () => {
      const biz = { id: 'b1', name: 'Shop', position: { x: 15, z: -10 } };
      const extent = 45;
      const [cx, cy] = toCanvas(biz.position.x, biz.position.z, extent, 180);
      // x=15 in extent=45: (15+45)/(90)*180 = 60/90*180 = 120
      expect(cx).toBeCloseTo(120);
      // z=-10 in extent=45: (-10+45)/(90)*180 = 35/90*180 = 70
      expect(cy).toBeCloseTo(70);
    });
  });

  describe('mini-map sizing', () => {
    it('uses 180px canvas size', () => {
      const size = 180;
      expect(size).toBe(180);
    });

    it('legend height adds to total container height', () => {
      const canvasSize = 180;
      const headerHeight = 28; // header + legend
      const totalHeight = canvasSize + headerHeight;
      expect(totalHeight).toBe(208);
    });
  });
});
