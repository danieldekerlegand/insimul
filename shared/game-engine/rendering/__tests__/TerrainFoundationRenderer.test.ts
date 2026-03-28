import { describe, it, expect } from 'vitest';
import {
  computeFoundationData,
  type FoundationType,
  type FoundationData,
} from '../TerrainFoundationRenderer';

// --- Height sampler helpers ---

/** Flat terrain at a constant Y */
const flatSampler = (y: number) => (_x: number, _z: number) => y;

/** Linear slope in the X direction: Y = baseY + x * slope */
const xSlopeSampler = (baseY: number, slope: number) => (x: number, _z: number) => baseY + x * slope;

/** Linear slope in the Z direction */
const zSlopeSampler = (baseY: number, slope: number) => (_x: number, z: number) => baseY + z * slope;

describe('computeFoundationData', () => {
  describe('foundation type classification', () => {
    it('returns flat for level terrain (delta < 0.3)', () => {
      const result = computeFoundationData(0, 0, 10, 10, flatSampler(5));
      expect(result.type).toBe('flat');
      expect(result.foundationHeight).toBe(0);
    });

    it('returns raised for gentle slope (delta 0.3–1.0)', () => {
      // Width=10, half=5. Slope of 0.1 → delta = 5*0.1 - (-5)*0.1 = 1.0
      // Need delta in [0.3, 1.0), so use slope = 0.05 → delta = 0.5
      const result = computeFoundationData(0, 0, 10, 10, xSlopeSampler(5, 0.05));
      expect(result.type).toBe('raised');
      expect(result.foundationHeight).toBeGreaterThanOrEqual(0.3);
      expect(result.foundationHeight).toBeLessThan(1.0);
    });

    it('returns stilted for moderate slope (delta 1.0–2.5)', () => {
      // Width=10, half=5. Slope of 0.2 → delta = 10*0.2 = 2.0
      const result = computeFoundationData(0, 0, 10, 10, xSlopeSampler(5, 0.2));
      expect(result.type).toBe('stilted');
      expect(result.foundationHeight).toBeGreaterThanOrEqual(1.0);
      expect(result.foundationHeight).toBeLessThan(2.5);
    });

    it('returns terraced for steep slope (delta >= 2.5)', () => {
      // Width=10, half=5. Slope of 0.5 → delta = 10*0.5 = 5.0
      const result = computeFoundationData(0, 0, 10, 10, xSlopeSampler(5, 0.5));
      expect(result.type).toBe('terraced');
      expect(result.foundationHeight).toBeGreaterThanOrEqual(2.5);
    });
  });

  describe('elevation tracking', () => {
    it('baseElevation equals the lowest corner', () => {
      // Slope in X: left side lower than right
      const result = computeFoundationData(0, 0, 10, 10, xSlopeSampler(10, 0.3));
      // Left corners at x=-5 → Y = 10 + (-5)*0.3 = 8.5
      // Right corners at x=+5 → Y = 10 + 5*0.3 = 11.5
      expect(result.baseElevation).toBeCloseTo(8.5, 5);
    });

    it('cornerElevations has 4 entries matching sampled heights', () => {
      const sampler = xSlopeSampler(10, 0.2);
      const result = computeFoundationData(0, 0, 10, 8, sampler);
      // frontLeft:  sampler(-5, +4) = 10 + (-5)*0.2 = 9
      // frontRight: sampler(+5, +4) = 10 + 5*0.2 = 11
      // backLeft:   sampler(-5, -4) = 9
      // backRight:  sampler(+5, -4) = 11
      expect(result.cornerElevations).toHaveLength(4);
      expect(result.cornerElevations[0]).toBeCloseTo(9, 5);   // front-left
      expect(result.cornerElevations[1]).toBeCloseTo(11, 5);  // front-right
      expect(result.cornerElevations[2]).toBeCloseTo(9, 5);   // back-left
      expect(result.cornerElevations[3]).toBeCloseTo(11, 5);  // back-right
    });

    it('foundationHeight equals max minus min elevation', () => {
      const result = computeFoundationData(0, 0, 20, 10, xSlopeSampler(0, 0.1));
      // Left at x=-10 → -1, right at x=+10 → +1, delta = 2
      expect(result.foundationHeight).toBeCloseTo(2.0, 5);
    });
  });

  describe('slope direction independence', () => {
    it('detects Z-direction slopes', () => {
      // Depth=10, half=5. Slope of 0.3 → delta = 10*0.3 = 3.0 → terraced
      const result = computeFoundationData(0, 0, 10, 10, zSlopeSampler(5, 0.3));
      expect(result.type).toBe('terraced');
    });

    it('detects diagonal slopes', () => {
      // Both X and Z contribute to elevation
      const diagonalSampler = (x: number, z: number) => 5 + x * 0.15 + z * 0.15;
      const result = computeFoundationData(0, 0, 10, 10, diagonalSampler);
      // Corners: (-5,-5)→5-0.75-0.75=3.5, (+5,+5)→5+0.75+0.75=6.5 → delta=3.0
      expect(result.type).toBe('terraced');
      expect(result.foundationHeight).toBeCloseTo(3.0, 5);
    });
  });

  describe('edge cases', () => {
    it('handles zero-size building', () => {
      const result = computeFoundationData(0, 0, 0, 0, xSlopeSampler(5, 1.0));
      // All corners sample at (0,0) → same elevation → flat
      expect(result.type).toBe('flat');
      expect(result.foundationHeight).toBe(0);
    });

    it('handles offset position correctly', () => {
      // Building at (100, 200) with slope
      const sampler = (x: number, _z: number) => x * 0.1;
      const result = computeFoundationData(100, 200, 10, 10, sampler);
      // Corners at x=95 and x=105 → elevations 9.5 and 10.5 → delta = 1.0
      expect(result.type).toBe('stilted');
      expect(result.cornerElevations[0]).toBeCloseTo(9.5, 5); // x=95
      expect(result.cornerElevations[1]).toBeCloseTo(10.5, 5); // x=105
    });

    it('boundary: delta exactly 0.3 is raised', () => {
      // Width=6, slope=0.05 → delta = 6*0.05 = 0.3
      const result = computeFoundationData(0, 0, 6, 2, xSlopeSampler(0, 0.05));
      expect(result.type).toBe('raised');
    });

    it('boundary: delta exactly 1.0 is stilted', () => {
      // Width=10, slope=0.1 → delta = 10*0.1 = 1.0
      const result = computeFoundationData(0, 0, 10, 2, xSlopeSampler(0, 0.1));
      expect(result.type).toBe('stilted');
    });

    it('boundary: delta exactly 2.5 is terraced', () => {
      // Width=10, slope=0.25 → delta = 10*0.25 = 2.5
      const result = computeFoundationData(0, 0, 10, 2, xSlopeSampler(0, 0.25));
      expect(result.type).toBe('terraced');
    });
  });
});
