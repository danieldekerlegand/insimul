import { describe, it, expect } from 'vitest';
import {
  mapScoreToCEFR,
  mapScoreToLevel,
  getCEFRDescription,
  type CEFRLevel,
} from '../assessment/cefr-mapping';

describe('mapScoreToCEFR', () => {
  it('maps 0 score to A1', () => {
    const result = mapScoreToCEFR(0, 53);
    expect(result.level).toBe('A1');
    expect(result.score).toBe(0);
  });

  it('maps low score to A1', () => {
    const result = mapScoreToCEFR(10, 53);
    expect(result.level).toBe('A1');
  });

  it('maps ~25% score to A2', () => {
    const result = mapScoreToCEFR(14, 53); // ~26.4%
    expect(result.level).toBe('A2');
  });

  it('maps ~50% score to B1', () => {
    const result = mapScoreToCEFR(27, 53); // ~50.9%
    expect(result.level).toBe('B1');
  });

  it('maps ~75% score to B2', () => {
    const result = mapScoreToCEFR(40, 53); // ~75.5%
    expect(result.level).toBe('B2');
  });

  it('maps perfect score to B2', () => {
    const result = mapScoreToCEFR(53, 53);
    expect(result.level).toBe('B2');
    expect(result.score).toBe(100);
  });

  it('clamps score above maxScore to 100', () => {
    const result = mapScoreToCEFR(60, 53);
    expect(result.score).toBe(100);
    expect(result.level).toBe('B2');
  });

  it('clamps negative score to 0', () => {
    const result = mapScoreToCEFR(-5, 53);
    expect(result.score).toBe(0);
    expect(result.level).toBe('A1');
  });

  it('throws on zero maxScore', () => {
    expect(() => mapScoreToCEFR(10, 0)).toThrow('maxScore must be greater than 0');
  });

  it('throws on negative maxScore', () => {
    expect(() => mapScoreToCEFR(10, -1)).toThrow('maxScore must be greater than 0');
  });

  it('includes description in result', () => {
    const result = mapScoreToCEFR(27, 53);
    expect(result.description).toBe(getCEFRDescription('B1'));
  });

  it('rounds normalized score to 2 decimal places', () => {
    const result = mapScoreToCEFR(1, 3); // 33.333...
    expect(result.score).toBe(33.33);
  });

  // Boundary tests at exact thresholds
  it('maps exactly 25% to A2', () => {
    const result = mapScoreToCEFR(25, 100);
    expect(result.level).toBe('A2');
  });

  it('maps just below 25% to A1', () => {
    const result = mapScoreToCEFR(24.99, 100);
    expect(result.level).toBe('A1');
  });

  it('maps exactly 50% to B1', () => {
    const result = mapScoreToCEFR(50, 100);
    expect(result.level).toBe('B1');
  });

  it('maps exactly 75% to B2', () => {
    const result = mapScoreToCEFR(75, 100);
    expect(result.level).toBe('B2');
  });
});

describe('mapScoreToLevel', () => {
  it('works with custom thresholds', () => {
    const thresholds = [
      { min: 80, level: 'expert' as const },
      { min: 50, level: 'proficient' as const },
      { min: 0, level: 'novice' as const },
    ];
    expect(mapScoreToLevel(90, thresholds)).toBe('expert');
    expect(mapScoreToLevel(60, thresholds)).toBe('proficient');
    expect(mapScoreToLevel(10, thresholds)).toBe('novice');
  });

  it('returns last level for negative scores', () => {
    const thresholds = [
      { min: 50, level: 'high' as const },
      { min: 0, level: 'low' as const },
    ];
    expect(mapScoreToLevel(-1, thresholds)).toBe('low');
  });

  it('handles single threshold', () => {
    const thresholds = [{ min: 0, level: 'only' as const }];
    expect(mapScoreToLevel(50, thresholds)).toBe('only');
  });
});

describe('getCEFRDescription', () => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  for (const level of levels) {
    it(`returns a non-empty description for ${level}`, () => {
      const desc = getCEFRDescription(level);
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    });
  }

  it('A1 description mentions beginner', () => {
    expect(getCEFRDescription('A1').toLowerCase()).toContain('beginner');
  });

  it('B2 description mentions upper-intermediate', () => {
    expect(getCEFRDescription('B2').toLowerCase()).toContain('upper-intermediate');
  });
});
