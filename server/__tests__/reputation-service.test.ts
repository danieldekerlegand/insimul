import { describe, it, expect } from 'vitest';
import { calculateStanding } from '../services/reputation-service';

describe('reputation-service', () => {
  describe('calculateStanding', () => {
    it('returns revered for score >= 51', () => {
      expect(calculateStanding(51)).toBe('revered');
      expect(calculateStanding(100)).toBe('revered');
      expect(calculateStanding(75)).toBe('revered');
    });

    it('returns friendly for score 1-50', () => {
      expect(calculateStanding(1)).toBe('friendly');
      expect(calculateStanding(50)).toBe('friendly');
      expect(calculateStanding(25)).toBe('friendly');
    });

    it('returns neutral for score -49 to 0', () => {
      expect(calculateStanding(0)).toBe('neutral');
      expect(calculateStanding(-49)).toBe('neutral');
      expect(calculateStanding(-10)).toBe('neutral');
    });

    it('returns unfriendly for score -99 to -50', () => {
      expect(calculateStanding(-50)).toBe('unfriendly');
      expect(calculateStanding(-99)).toBe('unfriendly');
      expect(calculateStanding(-75)).toBe('unfriendly');
    });

    it('returns hostile for score <= -100', () => {
      expect(calculateStanding(-100)).toBe('hostile');
    });
  });
});
