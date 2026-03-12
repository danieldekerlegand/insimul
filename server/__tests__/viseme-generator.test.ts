import { describe, it, expect } from 'vitest';
import {
  VisemeGenerator,
  FallbackVisemeGenerator,
  createVisemeGenerator,
  textToPhonemeTokens,
  OVR_VISEMES,
  SIMPLIFIED_VISEMES,
} from '../services/conversation/viseme/viseme-generator.js';

// ── textToPhonemeTokens ───────────────────────────────────────────────

describe('textToPhonemeTokens', () => {
  it('converts simple text to phoneme tokens', () => {
    const tokens = textToPhonemeTokens('hello');
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((t) => typeof t.viseme === 'string' && typeof t.weight === 'number')).toBe(true);
  });

  it('maps vowels to vowel visemes', () => {
    const tokens = textToPhonemeTokens('a');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].viseme).toBe('aa');
  });

  it('maps consonants to consonant visemes', () => {
    const tokens = textToPhonemeTokens('p');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].viseme).toBe('PP');
  });

  it('handles digraphs (th, ch, sh)', () => {
    const tokens = textToPhonemeTokens('the');
    expect(tokens[0].viseme).toBe('TH');

    const ch = textToPhonemeTokens('ch');
    expect(ch[0].viseme).toBe('CH');

    const sh = textToPhonemeTokens('sh');
    expect(sh[0].viseme).toBe('CH');
  });

  it('inserts silence for spaces', () => {
    const tokens = textToPhonemeTokens('hi there');
    const silences = tokens.filter((t) => t.viseme === 'sil');
    expect(silences.length).toBeGreaterThan(0);
  });

  it('inserts silence for punctuation', () => {
    const tokens = textToPhonemeTokens('hello, world!');
    const silences = tokens.filter((t) => t.viseme === 'sil');
    expect(silences.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty string', () => {
    expect(textToPhonemeTokens('')).toHaveLength(0);
  });

  it('assigns higher weight to vowels than consonants', () => {
    const tokens = textToPhonemeTokens('ab');
    const vowelToken = tokens.find((t) => t.viseme === 'aa');
    const consToken = tokens.find((t) => t.viseme === 'PP');
    expect(vowelToken!.weight).toBeGreaterThan(consToken!.weight);
  });

  it('does not produce consecutive silences', () => {
    const tokens = textToPhonemeTokens('a   b');
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i].viseme === 'sil') {
        expect(tokens[i - 1].viseme).not.toBe('sil');
      }
    }
  });
});

// ── VisemeGenerator ───────────────────────────────────────────────────

describe('VisemeGenerator', () => {
  const gen = new VisemeGenerator();

  it('generates visemes from text with correct timing', () => {
    const result = gen.generateVisemes('Hello world', 1000);
    expect(result.visemes.length).toBeGreaterThan(0);

    // Total duration should match audio duration
    const totalMs = result.visemes.reduce((sum, v) => sum + v.durationMs, 0);
    expect(totalMs).toBe(1000);
  });

  it('uses only OVR viseme phonemes in full quality', () => {
    const result = gen.generateVisemes('The quick brown fox jumps', 2000, 'full');
    const validPhonemes = new Set<string>(OVR_VISEMES);
    for (const v of result.visemes) {
      expect(validPhonemes.has(v.phoneme)).toBe(true);
    }
  });

  it('uses simplified viseme set in simplified quality', () => {
    const result = gen.generateVisemes('Hello world', 1000, 'simplified');
    const validPhonemes = new Set<string>(SIMPLIFIED_VISEMES);
    for (const v of result.visemes) {
      expect(validPhonemes.has(v.phoneme)).toBe(true);
    }
  });

  it('returns empty visemes when quality is disabled', () => {
    const result = gen.generateVisemes('Hello world', 1000, 'disabled');
    expect(result.visemes).toHaveLength(0);
  });

  it('returns empty visemes for empty text', () => {
    const result = gen.generateVisemes('', 1000);
    expect(result.visemes).toHaveLength(0);
  });

  it('returns empty visemes for zero duration', () => {
    const result = gen.generateVisemes('Hello', 0);
    expect(result.visemes).toHaveLength(0);
  });

  it('returns empty visemes for negative duration', () => {
    const result = gen.generateVisemes('Hello', -100);
    expect(result.visemes).toHaveLength(0);
  });

  it('sets weight to 0.0 for silence visemes', () => {
    const result = gen.generateVisemes('Hello world', 1000);
    const silenceVisemes = result.visemes.filter((v) => v.phoneme === 'sil');
    for (const v of silenceVisemes) {
      expect(v.weight).toBe(0.0);
    }
  });

  it('sets weight to 1.0 for non-silence visemes', () => {
    const result = gen.generateVisemes('Hello', 500);
    const nonSilence = result.visemes.filter((v) => v.phoneme !== 'sil');
    for (const v of nonSilence) {
      expect(v.weight).toBe(1.0);
    }
  });

  it('all durations are at least 1ms', () => {
    const result = gen.generateVisemes('The quick brown fox jumps over the lazy dog', 100);
    for (const v of result.visemes) {
      expect(v.durationMs).toBeGreaterThanOrEqual(1);
    }
  });

  it('merges consecutive identical visemes', () => {
    // 'pp' should produce a single merged PP viseme, not two separate ones
    const result = gen.generateVisemes('pp', 500);
    const ppVisemes = result.visemes.filter((v) => v.phoneme === 'PP');
    expect(ppVisemes).toHaveLength(1);
  });

  it('handles long text with proportional timing', () => {
    const short = gen.generateVisemes('Hi', 500);
    const long = gen.generateVisemes('Hello there, how are you doing today?', 5000);
    expect(long.visemes.length).toBeGreaterThan(short.visemes.length);
  });

  it('handles only punctuation/spaces', () => {
    const result = gen.generateVisemes('... !!!', 200);
    // Should produce some silence visemes or empty
    const totalMs = result.visemes.reduce((sum, v) => sum + v.durationMs, 0);
    if (result.visemes.length > 0) {
      expect(totalMs).toBe(200);
    }
  });
});

// ── FallbackVisemeGenerator ──────────────────────────────────────────

describe('FallbackVisemeGenerator', () => {
  const gen = new FallbackVisemeGenerator();

  it('generates simple open/close mouth pattern', () => {
    const result = gen.generateVisemes('Hello world', 1000);
    expect(result.visemes.length).toBeGreaterThan(0);

    // Should alternate between open (aa) and closed (sil)
    const phonemes = result.visemes.map((v) => v.phoneme);
    expect(phonemes).toContain('aa');
    expect(phonemes).toContain('sil');
  });

  it('total duration matches audio duration', () => {
    const result = gen.generateVisemes('Hello world', 1500);
    const totalMs = result.visemes.reduce((sum, v) => sum + v.durationMs, 0);
    expect(totalMs).toBe(1500);
  });

  it('returns empty for disabled quality', () => {
    const result = gen.generateVisemes('Hello', 1000, 'disabled');
    expect(result.visemes).toHaveLength(0);
  });

  it('returns empty for empty text', () => {
    const result = gen.generateVisemes('', 1000);
    expect(result.visemes).toHaveLength(0);
  });

  it('more syllables for longer text', () => {
    const short = gen.generateVisemes('Hi', 500);
    const long = gen.generateVisemes('Supercalifragilisticexpialidocious', 5000);
    expect(long.visemes.length).toBeGreaterThan(short.visemes.length);
  });
});

// ── createVisemeGenerator ─────────────────────────────────────────────

describe('createVisemeGenerator', () => {
  it('returns VisemeGenerator by default', () => {
    const gen = createVisemeGenerator();
    expect(gen).toBeInstanceOf(VisemeGenerator);
  });

  it('returns FallbackVisemeGenerator when requested', () => {
    const gen = createVisemeGenerator(true);
    expect(gen).toBeInstanceOf(FallbackVisemeGenerator);
  });

  it('both generators implement IVisemeGenerator interface', () => {
    const full = createVisemeGenerator(false);
    const fallback = createVisemeGenerator(true);

    // Both should have generateVisemes method
    expect(typeof full.generateVisemes).toBe('function');
    expect(typeof fallback.generateVisemes).toBe('function');

    // Both should produce valid output
    const r1 = full.generateVisemes('test', 500);
    const r2 = fallback.generateVisemes('test', 500);
    expect(r1.visemes).toBeDefined();
    expect(r2.visemes).toBeDefined();
  });
});

// ── Timing accuracy ──────────────────────────────────────────────────

describe('timing accuracy', () => {
  const gen = new VisemeGenerator();

  it('exact timing for various durations', () => {
    for (const duration of [100, 250, 500, 1000, 2000, 5000]) {
      const result = gen.generateVisemes('Hello world, this is a test sentence.', duration);
      if (result.visemes.length > 0) {
        const total = result.visemes.reduce((sum, v) => sum + v.durationMs, 0);
        expect(total).toBe(duration);
      }
    }
  });

  it('short audio duration still produces valid output', () => {
    const result = gen.generateVisemes('Hello', 10);
    if (result.visemes.length > 0) {
      const total = result.visemes.reduce((sum, v) => sum + v.durationMs, 0);
      expect(total).toBe(10);
    }
  });
});
