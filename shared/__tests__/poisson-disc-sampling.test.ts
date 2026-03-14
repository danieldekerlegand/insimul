import { describe, it, expect } from 'vitest';
import { poissonDiscSampling, createSeededRng, type PoissonDiscOptions } from '../procedural/poisson-disc-sampling';

describe('poissonDiscSampling', () => {
  const defaults: PoissonDiscOptions = {
    width: 100,
    height: 100,
    minDistance: 10,
    rng: createSeededRng(42),
  };

  it('generates points within bounds', () => {
    const points = poissonDiscSampling(defaults);
    expect(points.length).toBeGreaterThan(0);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(100);
    }
  });

  it('maintains minimum distance between all points', () => {
    const points = poissonDiscSampling(defaults);
    const minDistSq = defaults.minDistance * defaults.minDistance;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distSq = dx * dx + dy * dy;
        expect(distSq).toBeGreaterThanOrEqual(minDistSq - 1e-9);
      }
    }
  });

  it('produces deterministic output with seeded RNG', () => {
    const a = poissonDiscSampling({ ...defaults, rng: createSeededRng(123) });
    const b = poissonDiscSampling({ ...defaults, rng: createSeededRng(123) });
    expect(a).toEqual(b);
  });

  it('produces different output with different seeds', () => {
    const a = poissonDiscSampling({ ...defaults, rng: createSeededRng(1) });
    const b = poissonDiscSampling({ ...defaults, rng: createSeededRng(2) });
    expect(a).not.toEqual(b);
  });

  it('generates reasonable point count for given area and distance', () => {
    const points = poissonDiscSampling(defaults);
    // Theoretical max for Poisson disc in 100x100 with minDist 10 is ~115
    // Practical range is roughly 50-115
    expect(points.length).toBeGreaterThan(30);
    expect(points.length).toBeLessThan(150);
  });

  it('returns empty array for invalid dimensions', () => {
    expect(poissonDiscSampling({ ...defaults, width: 0 })).toEqual([]);
    expect(poissonDiscSampling({ ...defaults, height: -1 })).toEqual([]);
    expect(poissonDiscSampling({ ...defaults, minDistance: 0 })).toEqual([]);
  });

  it('works with large minDistance relative to area', () => {
    const points = poissonDiscSampling({
      width: 10,
      height: 10,
      minDistance: 8,
      rng: createSeededRng(42),
    });
    // Should produce very few points (1-2)
    expect(points.length).toBeGreaterThanOrEqual(1);
    expect(points.length).toBeLessThanOrEqual(3);
  });

  it('respects maxAttempts parameter', () => {
    // With very few attempts and tight spacing, we get fewer points
    const few = poissonDiscSampling({ ...defaults, maxAttempts: 1, rng: createSeededRng(42) });
    const many = poissonDiscSampling({ ...defaults, maxAttempts: 50, rng: createSeededRng(42) });
    expect(few.length).toBeLessThanOrEqual(many.length);
  });

  it('handles rectangular areas', () => {
    const points = poissonDiscSampling({
      width: 200,
      height: 50,
      minDistance: 10,
      rng: createSeededRng(42),
    });
    expect(points.length).toBeGreaterThan(0);
    for (const p of points) {
      expect(p.x).toBeLessThan(200);
      expect(p.y).toBeLessThan(50);
    }
  });
});

describe('createSeededRng', () => {
  it('produces values in [0, 1)', () => {
    const rng = createSeededRng(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('is deterministic', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = createSeededRng(1);
    const b = createSeededRng(2);
    // At least one of the first 10 values should differ
    let allEqual = true;
    for (let i = 0; i < 10; i++) {
      if (a() !== b()) allEqual = false;
    }
    expect(allEqual).toBe(false);
  });
});
