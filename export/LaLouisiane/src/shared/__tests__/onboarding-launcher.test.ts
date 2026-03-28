import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isLanguageLearningWorld,
  getTargetLanguage,
  isFirstPlaythrough,
} from '@/components/3DGame/OnboardingLauncher.ts';

describe('OnboardingLauncher', () => {
  describe('isLanguageLearningWorld', () => {
    it('returns false for null/undefined world data', () => {
      expect(isLanguageLearningWorld(null)).toBe(false);
      expect(isLanguageLearningWorld(undefined)).toBe(false);
    });

    it('returns true when gameType is "language-learning"', () => {
      expect(isLanguageLearningWorld({ gameType: 'language-learning' })).toBe(true);
    });

    it('returns true when gameType contains "language"', () => {
      expect(isLanguageLearningWorld({ gameType: 'language_immersion' })).toBe(true);
    });

    it('returns true when worldType contains "language"', () => {
      expect(isLanguageLearningWorld({ worldType: 'language-town' })).toBe(true);
    });

    it('returns true when targetLanguage is set', () => {
      expect(isLanguageLearningWorld({ targetLanguage: 'French' })).toBe(true);
    });

    it('returns false for non-language worlds', () => {
      expect(isLanguageLearningWorld({ gameType: 'rpg', worldType: 'fantasy' })).toBe(false);
    });

    it('returns false for empty world data', () => {
      expect(isLanguageLearningWorld({})).toBe(false);
    });
  });

  describe('getTargetLanguage', () => {
    it('returns the target language from world data', () => {
      expect(getTargetLanguage({ targetLanguage: 'French' })).toBe('French');
    });

    it('defaults to Spanish when no target language', () => {
      expect(getTargetLanguage({})).toBe('Spanish');
      expect(getTargetLanguage(null)).toBe('Spanish');
    });
  });

  describe('isFirstPlaythrough', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns true when no prior assessments exist', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await isFirstPlaythrough('world-1', 'player-1', 'token');
      expect(result).toBe(true);
    });

    it('returns false when a completed arrival assessment exists', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [
          { assessmentType: 'arrival', status: 'complete' },
        ],
      } as Response);

      const result = await isFirstPlaythrough('world-1', 'player-1', 'token');
      expect(result).toBe(false);
    });

    it('returns true when assessments exist but none are completed arrival', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [
          { assessmentType: 'arrival', status: 'in_progress' },
          { assessmentType: 'periodic', status: 'complete' },
        ],
      } as Response);

      const result = await isFirstPlaythrough('world-1', 'player-1', 'token');
      expect(result).toBe(true);
    });

    it('returns true when API returns non-OK response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as Response);

      const result = await isFirstPlaythrough('world-1', 'player-1', 'token');
      expect(result).toBe(true);
    });

    it('returns true when fetch throws (network error)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await isFirstPlaythrough('world-1', 'player-1', 'token');
      expect(result).toBe(true);
    });

    it('sends correct URL and auth header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await isFirstPlaythrough('world-42', 'player-7', 'my-token');

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/assessments/player/player-7?worldId=world-42',
        { headers: { Authorization: 'Bearer my-token' } },
      );
    });
  });
});
