import { describe, it, expect } from 'vitest';
import { getWorldTypeDefaults, getRegisteredWorldTypes } from '../engines/world-type-defaults';

describe('Rate Distribution Verification', () => {
  describe('Bernoulli trial distribution', () => {
    it('birthRate=0.18 produces expected count over 10000 trials', () => {
      const rate = 0.18;
      const trials = 10000;
      const expected = trials * rate; // 1800
      const stddev = Math.sqrt(trials * rate * (1 - rate)); // ~38.4

      // Use seeded PRNG for reproducibility
      let seed = 12345;
      const seededRandom = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0x100000000;
      };

      let count = 0;
      for (let i = 0; i < trials; i++) {
        if (seededRandom() < rate) count++;
      }

      // Within 2 standard deviations (~95% CI)
      expect(count).toBeGreaterThan(expected - 2 * stddev);
      expect(count).toBeLessThan(expected + 2 * stddev);
    });
  });

  describe('deathRateMultiplier comparison', () => {
    it('medieval-fantasy (1.4) produces ~40% more deaths than default (1.0)', () => {
      const medieval = getWorldTypeDefaults('medieval-fantasy');
      const defaultRates = getWorldTypeDefaults(null);

      expect(medieval.deathRateMultiplier).toBe(1.4);
      expect(defaultRates.deathRateMultiplier).toBe(1.0);

      // Simulate deaths over a population with a base death probability
      const baseDeathProb = 0.01;
      const population = 10000;
      const trials = 50; // 50 timesteps

      let seed = 42;
      const seededRandom = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0x100000000;
      };

      let defaultDeaths = 0;
      for (let t = 0; t < trials; t++) {
        for (let i = 0; i < population; i++) {
          if (seededRandom() < baseDeathProb * defaultRates.deathRateMultiplier) defaultDeaths++;
        }
      }

      // Reset seed for identical random sequence
      seed = 42;
      let medievalDeaths = 0;
      for (let t = 0; t < trials; t++) {
        for (let i = 0; i < population; i++) {
          if (seededRandom() < baseDeathProb * medieval.deathRateMultiplier) medievalDeaths++;
        }
      }

      // Medieval should have approximately 40% more deaths
      const ratio = medievalDeaths / defaultDeaths;
      expect(ratio).toBeGreaterThan(1.25); // at least 25% more
      expect(ratio).toBeLessThan(1.55);    // at most 55% more
    });
  });

  describe('getWorldTypeDefaults returns correct rates', () => {
    it('returns correct rates for medieval-fantasy', () => {
      const rates = getWorldTypeDefaults('medieval-fantasy');
      expect(rates.label).toBe('Medieval Fantasy');
      expect(rates.birthRate).toBe(0.18);
      expect(rates.deathRateMultiplier).toBe(1.4);
      expect(rates.marriageRate).toBe(0.008);
    });

    it('returns correct rates for modern-realistic', () => {
      const rates = getWorldTypeDefaults('modern-realistic');
      expect(rates.label).toBe('Modern Realistic');
      expect(rates.birthRate).toBe(0.10);
      expect(rates.deathRateMultiplier).toBe(0.7);
    });

    it('returns correct rates for sci-fi', () => {
      const rates = getWorldTypeDefaults('sci-fi');
      expect(rates.label).toBe('Science Fiction');
      expect(rates.birthRate).toBe(0.06);
      expect(rates.deathRateMultiplier).toBe(0.4);
    });

    it('returns correct rates for historical', () => {
      const rates = getWorldTypeDefaults('historical');
      expect(rates.label).toBe('Historical');
      expect(rates.birthRate).toBe(0.20);
      expect(rates.deathRateMultiplier).toBe(1.6);
    });

    it('returns default rates for null/undefined', () => {
      const nullRates = getWorldTypeDefaults(null);
      const undefinedRates = getWorldTypeDefaults(undefined);
      expect(nullRates.label).toBe('Default');
      expect(nullRates.deathRateMultiplier).toBe(1.0);
      expect(undefinedRates.label).toBe('Default');
    });

    it('returns default rates for unknown world type', () => {
      const rates = getWorldTypeDefaults('unknown-world-type');
      expect(rates.label).toBe('Default');
    });

    it('returns copies (not references) of rate tables', () => {
      const rates1 = getWorldTypeDefaults('sci-fi');
      const rates2 = getWorldTypeDefaults('sci-fi');
      expect(rates1).toEqual(rates2);
      expect(rates1).not.toBe(rates2);
    });
  });

  describe('fuzzy matching', () => {
    it('cyberpunk maps to sci-fi rates', () => {
      const rates = getWorldTypeDefaults('cyberpunk');
      expect(rates.label).toBe('Science Fiction');
      expect(rates.birthRate).toBe(0.06);
    });

    it('space maps to sci-fi rates', () => {
      const rates = getWorldTypeDefaults('space');
      expect(rates.label).toBe('Science Fiction');
    });

    it('fantasy maps to medieval-fantasy rates', () => {
      const rates = getWorldTypeDefaults('fantasy');
      expect(rates.label).toBe('Medieval Fantasy');
    });

    it('contemporary maps to modern-realistic rates', () => {
      const rates = getWorldTypeDefaults('contemporary');
      expect(rates.label).toBe('Modern Realistic');
    });

    it('ancient maps to historical rates', () => {
      const rates = getWorldTypeDefaults('ancient');
      expect(rates.label).toBe('Historical');
    });

    it('colonial maps to historical rates', () => {
      const rates = getWorldTypeDefaults('colonial');
      expect(rates.label).toBe('Historical');
    });

    it('handles case-insensitive input', () => {
      const rates = getWorldTypeDefaults('MEDIEVAL-FANTASY');
      expect(rates.label).toBe('Medieval Fantasy');
    });

    it('handles whitespace-padded input', () => {
      const rates = getWorldTypeDefaults('  sci-fi  ');
      expect(rates.label).toBe('Science Fiction');
    });
  });

  describe('getRegisteredWorldTypes', () => {
    it('returns all 4 world types', () => {
      const types = getRegisteredWorldTypes();
      expect(types).toHaveLength(4);
      expect(types).toContain('medieval-fantasy');
      expect(types).toContain('modern-realistic');
      expect(types).toContain('sci-fi');
      expect(types).toContain('historical');
    });
  });
});
