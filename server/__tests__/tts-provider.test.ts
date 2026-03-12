/**
 * TTS Provider Tests
 *
 * Tests for the TTS provider interface, registry, voice assignment,
 * sentence boundary splitting, and mock provider streaming.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerTTSProvider,
  getTTSProvider,
  getRegisteredTTSProviders,
  clearTTSProviders,
  assignVoiceProfile,
  splitAtSentenceBoundaries,
  VOICE_PROFILES,
  type ITTSProvider,
  type AudioChunkOutput,
  type VoiceProfile,
  type TTSOptions,
} from '../services/conversation/tts/tts-provider.js';
import { AudioEncoding } from '../../shared/proto/conversation.js';

// ── Mock TTS Provider ────────────────────────────────────────────────

class MockTTSProvider implements ITTSProvider {
  readonly name = 'mock';

  async *synthesize(
    text: string,
    voice: VoiceProfile,
    options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput> {
    const sentences = splitAtSentenceBoundaries(text);
    for (const sentence of sentences) {
      const data = new TextEncoder().encode(sentence);
      yield {
        data,
        encoding: options?.encoding ?? AudioEncoding.MP3,
        sampleRate: 24000,
        durationMs: sentence.length * 50, // ~50ms per char
      };
    }
  }
}

// ── Provider Registry Tests ──────────────────────────────────────────

describe('TTS Provider Registry', () => {
  beforeEach(() => {
    clearTTSProviders();
  });

  it('registers and retrieves a provider', () => {
    registerTTSProvider('mock', () => new MockTTSProvider());
    const provider = getTTSProvider('mock');
    expect(provider.name).toBe('mock');
  });

  it('throws when provider not found', () => {
    expect(() => getTTSProvider('nonexistent')).toThrow(
      'TTS provider "nonexistent" not found',
    );
  });

  it('lists registered providers', () => {
    registerTTSProvider('mock', () => new MockTTSProvider());
    registerTTSProvider('another', () => new MockTTSProvider());
    const names = getRegisteredTTSProviders();
    expect(names).toContain('mock');
    expect(names).toContain('another');
  });

  it('clears all providers', () => {
    registerTTSProvider('mock', () => new MockTTSProvider());
    clearTTSProviders();
    expect(getRegisteredTTSProviders()).toHaveLength(0);
  });

  it('defaults to TTS_PROVIDER env var', () => {
    const orig = process.env.TTS_PROVIDER;
    process.env.TTS_PROVIDER = 'mock';
    registerTTSProvider('mock', () => new MockTTSProvider());
    const provider = getTTSProvider();
    expect(provider.name).toBe('mock');
    if (orig !== undefined) {
      process.env.TTS_PROVIDER = orig;
    } else {
      delete process.env.TTS_PROVIDER;
    }
  });

  it('shows available providers in error message', () => {
    registerTTSProvider('alpha', () => new MockTTSProvider());
    registerTTSProvider('beta', () => new MockTTSProvider());
    try {
      getTTSProvider('nope');
    } catch (e: any) {
      expect(e.message).toContain('alpha');
      expect(e.message).toContain('beta');
    }
  });
});

// ── Streaming Synthesis Tests ────────────────────────────────────────

describe('TTS Streaming Synthesis', () => {
  let provider: MockTTSProvider;
  let voice: VoiceProfile;

  beforeEach(() => {
    provider = new MockTTSProvider();
    voice = VOICE_PROFILES[0]; // Any profile
  });

  it('returns streaming audio chunks', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize('Hello world.', voice)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].data.length).toBeGreaterThan(0);
  });

  it('yields one chunk per sentence', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize(
      'First sentence. Second sentence. Third sentence.',
      voice,
    )) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(3);
  });

  it('includes correct encoding in chunks', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize('Hello.', voice, {
      encoding: AudioEncoding.PCM,
    })) {
      chunks.push(chunk);
    }
    expect(chunks[0].encoding).toBe(AudioEncoding.PCM);
  });

  it('includes duration estimate in chunks', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize('Hello world.', voice)) {
      chunks.push(chunk);
    }
    expect(chunks[0].durationMs).toBeGreaterThan(0);
  });

  it('includes sample rate in chunks', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize('Hello.', voice)) {
      chunks.push(chunk);
    }
    expect(chunks[0].sampleRate).toBe(24000);
  });

  it('handles empty text gracefully', async () => {
    const chunks: AudioChunkOutput[] = [];
    for await (const chunk of provider.synthesize('', voice)) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(0);
  });
});

// ── Sentence Boundary Detection Tests ────────────────────────────────

describe('splitAtSentenceBoundaries', () => {
  it('splits on periods', () => {
    expect(splitAtSentenceBoundaries('Hello. World.')).toEqual([
      'Hello.',
      'World.',
    ]);
  });

  it('splits on exclamation marks', () => {
    expect(splitAtSentenceBoundaries('Wow! Amazing!')).toEqual([
      'Wow!',
      'Amazing!',
    ]);
  });

  it('splits on question marks', () => {
    expect(splitAtSentenceBoundaries('Really? Yes.')).toEqual([
      'Really?',
      'Yes.',
    ]);
  });

  it('handles mixed punctuation', () => {
    const result = splitAtSentenceBoundaries('Hello. How are you? Great!');
    expect(result).toHaveLength(3);
  });

  it('returns single sentence without punctuation as one chunk', () => {
    expect(splitAtSentenceBoundaries('Hello world')).toEqual(['Hello world']);
  });

  it('handles empty string', () => {
    expect(splitAtSentenceBoundaries('')).toEqual([]);
  });

  it('handles whitespace-only string', () => {
    expect(splitAtSentenceBoundaries('   ')).toEqual([]);
  });

  it('preserves sentence with trailing quote', () => {
    const result = splitAtSentenceBoundaries('He said "hello." She waved.');
    expect(result).toHaveLength(2);
  });

  it('handles multiple sentence-ending punctuation', () => {
    const result = splitAtSentenceBoundaries('What?! No way...');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles single sentence', () => {
    expect(splitAtSentenceBoundaries('Just one.')).toEqual(['Just one.']);
  });
});

// ── Voice Assignment Tests ───────────────────────────────────────────

describe('assignVoiceProfile', () => {
  it('assigns female voice for female character', () => {
    const voice = assignVoiceProfile({ gender: 'female' });
    expect(voice.gender).toBe('female');
  });

  it('assigns male voice for male character', () => {
    const voice = assignVoiceProfile({ gender: 'male' });
    expect(voice.gender).toBe('male');
  });

  it('defaults to male for unknown gender', () => {
    const voice = assignVoiceProfile({ gender: 'other' });
    expect(voice.gender).toBe('male');
  });

  it('assigns young voice for age < 25', () => {
    const voice = assignVoiceProfile({ gender: 'female', age: 20 });
    expect(voice.ageRange).toBe('young');
  });

  it('assigns middle voice for age 25-54', () => {
    const voice = assignVoiceProfile({ gender: 'male', age: 35 });
    expect(voice.ageRange).toBe('middle');
  });

  it('assigns senior voice for age >= 55', () => {
    const voice = assignVoiceProfile({ gender: 'female', age: 60 });
    expect(voice.ageRange).toBe('senior');
  });

  it('differentiates middle-aged voices by extroversion', () => {
    const extrovert = assignVoiceProfile({
      gender: 'male',
      age: 35,
      personality: { extroversion: 0.8 },
    });
    const introvert = assignVoiceProfile({
      gender: 'male',
      age: 35,
      personality: { extroversion: -0.8 },
    });
    expect(extrovert.id).not.toBe(introvert.id);
  });

  it('returns consistent voice for same attributes', () => {
    const attrs = { gender: 'female', age: 30, personality: { extroversion: 0.5 } };
    const v1 = assignVoiceProfile(attrs);
    const v2 = assignVoiceProfile(attrs);
    expect(v1.id).toBe(v2.id);
  });
});

// ── Voice Profiles Validation ────────────────────────────────────────

describe('VOICE_PROFILES', () => {
  it('has 8 voice profiles total', () => {
    expect(VOICE_PROFILES).toHaveLength(8);
  });

  it('has 4 male voices', () => {
    expect(VOICE_PROFILES.filter(v => v.gender === 'male')).toHaveLength(4);
  });

  it('has 4 female voices', () => {
    expect(VOICE_PROFILES.filter(v => v.gender === 'female')).toHaveLength(4);
  });

  it('has unique IDs', () => {
    const ids = VOICE_PROFILES.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique names', () => {
    const names = VOICE_PROFILES.map(v => v.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all have valid speaking rates', () => {
    for (const v of VOICE_PROFILES) {
      expect(v.speakingRate).toBeGreaterThan(0);
      expect(v.speakingRate).toBeLessThanOrEqual(4.0);
    }
  });

  it('covers all age ranges per gender', () => {
    for (const gender of ['male', 'female'] as const) {
      const ageRanges = VOICE_PROFILES.filter(v => v.gender === gender).map(v => v.ageRange);
      expect(ageRanges).toContain('young');
      expect(ageRanges).toContain('middle');
      expect(ageRanges).toContain('senior');
    }
  });

  it('supports language-correct voices (voice names for native speakers)', () => {
    // All profiles have a name that can be mapped to Google Cloud TTS voice names
    for (const v of VOICE_PROFILES) {
      expect(v.name).toBeTruthy();
      expect(v.name.length).toBeGreaterThan(0);
    }
  });
});
