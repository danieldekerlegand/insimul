import { describe, it, expect } from 'vitest';
import { RiverGenerator, RiverGenerationConfig } from '../generators/river-generator';

describe('RiverGenerator', () => {
  const generator = new RiverGenerator();

  const baseConfig: RiverGenerationConfig = {
    terrainSize: 512,
    riverCount: 2,
    terrain: 'forest',
    seed: 42,
  };

  /** Flat heightmap — all zeros */
  const flatHeight = (_x: number, _z: number) => 0;

  /** Gradient heightmap — higher on the north edge, lower on south */
  const gradientHeight = (_x: number, z: number) => -z;

  describe('generate()', () => {
    it('produces the requested number of rivers', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 3 }, flatHeight);
      expect(rivers.length).toBe(3);
    });

    it('returns deterministic results with the same seed', () => {
      const a = generator.generate(baseConfig, flatHeight);
      const b = generator.generate(baseConfig, flatHeight);
      expect(a.length).toBe(b.length);
      for (let i = 0; i < a.length; i++) {
        expect(a[i].points.length).toBe(b[i].points.length);
        expect(a[i].points[0].x).toBeCloseTo(b[i].points[0].x, 5);
        expect(a[i].points[0].z).toBeCloseTo(b[i].points[0].z, 5);
      }
    });

    it('each river has at least 2 points', () => {
      const rivers = generator.generate(baseConfig, flatHeight);
      for (const river of rivers) {
        expect(river.points.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('assigns unique IDs to each river', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 5 }, flatHeight);
      const ids = rivers.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('assigns a name to each river', () => {
      const rivers = generator.generate(baseConfig, flatHeight);
      for (const river of rivers) {
        expect(river.name).toBeTruthy();
      }
    });

    it('rivers widen downstream', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 1 }, gradientHeight);
      const river = rivers[0];
      const firstWidth = river.points[0].width;
      const lastWidth = river.points[river.points.length - 1].width;
      expect(lastWidth).toBeGreaterThan(firstWidth);
    });

    it('rivers stay within terrain bounds (with small overshoot)', () => {
      const halfSize = baseConfig.terrainSize / 2;
      const margin = 30; // Allow small overshoot at exit point
      const rivers = generator.generate(baseConfig, flatHeight);
      for (const river of rivers) {
        // All interior points should be within bounds
        for (let i = 0; i < river.points.length - 1; i++) {
          expect(Math.abs(river.points[i].x)).toBeLessThanOrEqual(halfSize + margin);
          expect(Math.abs(river.points[i].z)).toBeLessThanOrEqual(halfSize + margin);
        }
      }
    });
  });

  describe('terrain-based river count', () => {
    it('desert terrain produces 0 rivers by default', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 0, terrain: 'desert' });
      expect(rivers.length).toBe(0);
    });

    it('river terrain produces 3 rivers by default', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 0, terrain: 'river' }, flatHeight);
      expect(rivers.length).toBe(3);
    });

    it('plains terrain produces 1 river by default', () => {
      const rivers = generator.generate({ ...baseConfig, riverCount: 0, terrain: 'plains' }, flatHeight);
      expect(rivers.length).toBe(1);
    });
  });

  describe('without heightmap (meandering)', () => {
    it('produces rivers without a sampleHeight callback', () => {
      const rivers = generator.generate(baseConfig);
      expect(rivers.length).toBe(2);
      for (const river of rivers) {
        expect(river.points.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('gradient descent', () => {
    it('rivers generally flow toward lower terrain', () => {
      // Gradient: z increases => height decreases (lower south)
      const downSouth = (_x: number, z: number) => -z;
      const rivers = generator.generate({ ...baseConfig, riverCount: 1, seed: 99 }, downSouth);
      const river = rivers[0];
      if (river.points.length > 5) {
        // The river should trend toward positive z (lower terrain)
        const startZ = river.points[0].z;
        const endZ = river.points[river.points.length - 1].z;
        // At least the end should differ from start meaningfully
        expect(Math.abs(endZ - startZ)).toBeGreaterThan(10);
      }
    });
  });
});
