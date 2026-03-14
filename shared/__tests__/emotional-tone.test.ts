import { describe, it, expect } from 'vitest';
import {
  getProsodyForEmotion,
  isValidEmotionalTone,
  wrapWithEmotionalProsody,
  EMOTIONAL_TONES,
} from '../emotional-tone';

describe('emotional-tone', () => {
  describe('getProsodyForEmotion', () => {
    it('returns neutral params for undefined tone', () => {
      const params = getProsodyForEmotion(undefined);
      expect(params.pitch).toBe('+0%');
      expect(params.rate).toBe('100%');
      expect(params.volume).toBe('+0dB');
    });

    it('returns neutral params for unrecognized tone', () => {
      const params = getProsodyForEmotion('flabbergasted');
      expect(params.pitch).toBe('+0%');
    });

    it('returns correct params for happy tone', () => {
      const params = getProsodyForEmotion('happy');
      expect(params.pitch).toBe('+10%');
      expect(params.rate).toBe('105%');
      expect(params.volume).toBe('+1dB');
    });

    it('returns correct params for sad tone', () => {
      const params = getProsodyForEmotion('sad');
      expect(params.pitch).toBe('-8%');
      expect(params.rate).toBe('85%');
      expect(params.volume).toBe('-2dB');
    });

    it('returns correct params for angry tone', () => {
      const params = getProsodyForEmotion('angry');
      expect(params.pitch).toBe('+15%');
      expect(params.rate).toBe('110%');
      expect(params.volume).toBe('+4dB');
    });

    it('is case-insensitive', () => {
      const params = getProsodyForEmotion('HAPPY');
      expect(params.pitch).toBe('+10%');
    });

    it('trims whitespace', () => {
      const params = getProsodyForEmotion('  sad  ');
      expect(params.pitch).toBe('-8%');
    });
  });

  describe('isValidEmotionalTone', () => {
    it('returns true for all defined tones', () => {
      for (const tone of EMOTIONAL_TONES) {
        expect(isValidEmotionalTone(tone)).toBe(true);
      }
    });

    it('returns false for unrecognized tones', () => {
      expect(isValidEmotionalTone('ecstatic')).toBe(false);
      expect(isValidEmotionalTone('')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isValidEmotionalTone('Happy')).toBe(true);
      expect(isValidEmotionalTone('ANGRY')).toBe(true);
    });
  });

  describe('wrapWithEmotionalProsody', () => {
    it('returns plain text for undefined tone', () => {
      const result = wrapWithEmotionalProsody('Hello world', undefined);
      expect(result.isSSML).toBe(false);
      expect(result.ssml).toBe('Hello world');
    });

    it('returns plain text for neutral tone', () => {
      const result = wrapWithEmotionalProsody('Hello world', 'neutral');
      expect(result.isSSML).toBe(false);
      expect(result.ssml).toBe('Hello world');
    });

    it('returns plain text for unrecognized tone', () => {
      const result = wrapWithEmotionalProsody('Hello world', 'baffled');
      expect(result.isSSML).toBe(false);
      expect(result.ssml).toBe('Hello world');
    });

    it('wraps text in SSML prosody for happy tone', () => {
      const result = wrapWithEmotionalProsody('Hello world', 'happy');
      expect(result.isSSML).toBe(true);
      expect(result.ssml).toContain('<speak>');
      expect(result.ssml).toContain('<prosody');
      expect(result.ssml).toContain('pitch="+10%"');
      expect(result.ssml).toContain('rate="105%"');
      expect(result.ssml).toContain('volume="+1dB"');
      expect(result.ssml).toContain('Hello world');
      expect(result.ssml).toContain('</prosody>');
      expect(result.ssml).toContain('</speak>');
    });

    it('escapes XML special characters', () => {
      const result = wrapWithEmotionalProsody('Tom & Jerry said "hi" <test>', 'angry');
      expect(result.isSSML).toBe(true);
      expect(result.ssml).toContain('Tom &amp; Jerry said &quot;hi&quot; &lt;test&gt;');
    });

    it('wraps text in SSML for all non-neutral tones', () => {
      for (const tone of EMOTIONAL_TONES) {
        const result = wrapWithEmotionalProsody('Test', tone);
        if (tone === 'neutral') {
          expect(result.isSSML).toBe(false);
        } else {
          expect(result.isSSML).toBe(true);
          expect(result.ssml).toMatch(/^<speak><prosody.*<\/prosody><\/speak>$/);
        }
      }
    });
  });

  describe('EMOTIONAL_TONES', () => {
    it('contains all expected tones', () => {
      expect(EMOTIONAL_TONES).toContain('happy');
      expect(EMOTIONAL_TONES).toContain('sad');
      expect(EMOTIONAL_TONES).toContain('angry');
      expect(EMOTIONAL_TONES).toContain('fearful');
      expect(EMOTIONAL_TONES).toContain('excited');
      expect(EMOTIONAL_TONES).toContain('calm');
      expect(EMOTIONAL_TONES).toContain('nervous');
      expect(EMOTIONAL_TONES).toContain('disgusted');
      expect(EMOTIONAL_TONES).toContain('surprised');
      expect(EMOTIONAL_TONES).toContain('neutral');
    });

    it('has 10 tones', () => {
      expect(EMOTIONAL_TONES).toHaveLength(10);
    });
  });
});
