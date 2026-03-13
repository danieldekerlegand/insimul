import { describe, it, expect } from 'vitest';
import {
  computeElevationProfile,
  sampleHeightmap,
  type SettlementElevationInput,
} from '../generators/settlement-elevation';

/** Create a flat heightmap where every cell has the same value */
function flatHeightmap(resolution: number, value: number): number[][] {
  return Array.from({ length: resolution }, () => new Array(resolution).fill(value));
}

/** Create a heightmap with a linear gradient left-to-right (low→high) */
function gradientHeightmap(resolution: number, low: number, high: number): number[][] {
  return Array.from({ length: resolution }, () =>
    Array.from({ length: resolution }, (_, col) =>
      low + (col / (resolution - 1)) * (high - low)
    )
  );
}

/** Radial heightmap: peak at center, zero at edges */
function radialHeightmap(resolution: number): number[][] {
  const center = (resolution - 1) / 2;
  return Array.from({ length: resolution }, (_, row) =>
    Array.from({ length: resolution }, (_, col) => {
      const dx = (col - center) / center;
      const dz = (row - center) / center;
      return Math.max(0, 1 - Math.sqrt(dx * dx + dz * dz));
    })
  );
}

describe('sampleHeightmap', () => {
  it('returns the value at the center of a flat heightmap', () => {
    const hm = flatHeightmap(16, 0.5);
    expect(sampleHeightmap(hm, 0, 0, 100)).toBe(0.5);
  });

  it('clamps to edge for out-of-bounds coordinates', () => {
    const hm = flatHeightmap(8, 0.3);
    // Far outside the map extent
    expect(sampleHeightmap(hm, 999, 999, 100)).toBe(0.3);
  });

  it('returns 0 for empty heightmap', () => {
    expect(sampleHeightmap([], 0, 0, 100)).toBe(0);
  });

  it('samples gradient correctly', () => {
    const hm = gradientHeightmap(64, 0, 1);
    // Left edge (worldX = -mapExtent) should be near 0
    const left = sampleHeightmap(hm, -100, 0, 100);
    // Right edge (worldX = +mapExtent) should be near 1
    const right = sampleHeightmap(hm, 99, 0, 100);
    expect(left).toBeLessThan(0.1);
    expect(right).toBeGreaterThan(0.9);
  });
});

describe('computeElevationProfile', () => {
  const centered: SettlementElevationInput = { centerX: 0, centerZ: 0, radius: 20 };

  it('returns flat profile for flat terrain', () => {
    const hm = flatHeightmap(32, 0.5);
    const profile = computeElevationProfile(centered, hm, 100, 20);

    expect(profile.slopeClass).toBe('flat');
    expect(profile.elevationRange).toBe(0);
    expect(profile.minElevation).toBe(10); // 0.5 * 20
    expect(profile.maxElevation).toBe(10);
    expect(profile.meanElevation).toBe(10);
  });

  it('detects gentle slope on gradient terrain', () => {
    // Gradient from 0.4 to 0.6 across the map
    const hm = gradientHeightmap(64, 0.4, 0.6);
    // Settlement centered, radius 10, mapExtent 100
    const small: SettlementElevationInput = { centerX: 0, centerZ: 0, radius: 10 };
    const profile = computeElevationProfile(small, hm, 100, 20);

    // With small radius relative to map, gradient across settlement is small
    expect(profile.elevationRange).toBeGreaterThan(0);
    expect(profile.minElevation).toBeLessThan(profile.maxElevation);
    expect(['flat', 'gentle']).toContain(profile.slopeClass);
  });

  it('detects steep slope on extreme gradient', () => {
    // Full 0-to-1 gradient, small map extent so settlement covers large portion
    const hm = gradientHeightmap(64, 0, 1);
    const large: SettlementElevationInput = { centerX: 0, centerZ: 0, radius: 40 };
    const profile = computeElevationProfile(large, hm, 50, 20);

    expect(profile.elevationRange).toBeGreaterThan(0);
    expect(profile.minElevation).toBeLessThan(profile.maxElevation);
    expect(['moderate', 'steep', 'extreme']).toContain(profile.slopeClass);
  });

  it('handles settlement at map edge', () => {
    const hm = flatHeightmap(32, 0.7);
    const edge: SettlementElevationInput = { centerX: 90, centerZ: 90, radius: 15 };
    const profile = computeElevationProfile(edge, hm, 100, 20);

    // Should still work, clamping to edge values
    expect(profile.minElevation).toBe(14); // 0.7 * 20
    expect(profile.slopeClass).toBe('flat');
  });

  it('handles very small radius (single sample fallback)', () => {
    const hm = flatHeightmap(16, 0.25);
    const tiny: SettlementElevationInput = { centerX: 0, centerZ: 0, radius: 0.1 };
    const profile = computeElevationProfile(tiny, hm, 100, 20);

    expect(profile.minElevation).toBe(5); // 0.25 * 20
    expect(profile.slopeClass).toBe('flat');
  });

  it('computes correct mean on radial heightmap', () => {
    const hm = radialHeightmap(64);
    const profile = computeElevationProfile(centered, hm, 50, 10);

    // Peak at center, lower at edges — mean should be between min and max
    expect(profile.meanElevation).toBeGreaterThan(profile.minElevation);
    expect(profile.meanElevation).toBeLessThan(profile.maxElevation);
    expect(profile.elevationRange).toBeGreaterThan(0);
  });

  it('respects custom elevationScale', () => {
    const hm = flatHeightmap(16, 0.5);
    const profile = computeElevationProfile(centered, hm, 100, 100);

    expect(profile.minElevation).toBe(50); // 0.5 * 100
    expect(profile.maxElevation).toBe(50);
  });

  it('rounds values to 2 decimal places', () => {
    const hm = gradientHeightmap(64, 0.333, 0.667);
    const profile = computeElevationProfile(centered, hm, 100, 10);

    // Check that all numeric values have at most 2 decimal places
    const check = (n: number) => expect(Math.round(n * 100) / 100).toBe(n);
    check(profile.minElevation);
    check(profile.maxElevation);
    check(profile.meanElevation);
    check(profile.elevationRange);
  });
});
