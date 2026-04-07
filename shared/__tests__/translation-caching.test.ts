import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HoverTranslationSystem } from '../game-engine/rendering/HoverTranslationSystem';
import type { VocabHint } from '../game-engine/rendering/HoverTranslationSystem';

// Hoisted mock for storage — used by preGenerateWorldTranslations tests
const { mockBulkUpsert } = vi.hoisted(() => ({
  mockBulkUpsert: vi.fn<any>().mockResolvedValue(1),
}));
vi.mock('../../server/db/storage', async (importOriginal) => {
  const orig = await importOriginal() as any;
  // Wrap the storage proxy so bulkUpsertTranslations is always mockable
  const storageProxy = new Proxy(orig.storage, {
    get(target: any, prop: string) {
      if (prop === 'bulkUpsertTranslations') return mockBulkUpsert;
      return target[prop];
    },
  });
  return { ...orig, storage: storageProxy };
});

// ── HoverTranslationSystem In-Memory Cache ────────────────────────────────

describe('HoverTranslationSystem', () => {
  let system: HoverTranslationSystem;

  beforeEach(() => {
    system = new HoverTranslationSystem();
    system.setTargetLanguage('French');
  });

  describe('addVocabHints / getTranslation', () => {
    it('stores and retrieves vocab hints by normalized key', () => {
      system.addVocabHints([
        { word: 'Bonjour', translation: 'Hello' },
        { word: 'merci', translation: 'thank you', partOfSpeech: 'interjection' },
      ]);
      expect(system.getTranslation('bonjour')?.translation).toBe('Hello');
      expect(system.getTranslation('MERCI')?.translation).toBe('thank you');
    });

    it('returns null for unknown words', () => {
      expect(system.getTranslation('inconnu')).toBeNull();
    });

    it('skips hints missing word or translation', () => {
      system.addVocabHints([
        { word: '', translation: 'empty word' },
        { word: 'test', translation: '' },
        { word: 'valid', translation: 'valid translation' },
      ]);
      expect(system.size).toBe(1);
      expect(system.getTranslation('valid')).not.toBeNull();
    });

    it('overwrites duplicate keys with latest hint', () => {
      system.addVocabHints([{ word: 'oui', translation: 'yes (old)' }]);
      system.addVocabHints([{ word: 'oui', translation: 'yes' }]);
      expect(system.getTranslation('oui')?.translation).toBe('yes');
      expect(system.size).toBe(1);
    });
  });

  describe('getAllTranslations', () => {
    it('returns a copy of all cached translations', () => {
      system.addVocabHints([
        { word: 'un', translation: 'one' },
        { word: 'deux', translation: 'two' },
      ]);
      const all = system.getAllTranslations();
      expect(all.size).toBe(2);
      // Mutating the returned map doesn't affect the internal cache
      all.clear();
      expect(system.size).toBe(2);
    });
  });

  describe('clear', () => {
    it('removes all cached translations and encounter data', () => {
      system.addVocabHints([{ word: 'test', translation: 'test' }]);
      system.recordWordEncounter('test');
      expect(system.size).toBe(1);
      system.clear();
      expect(system.size).toBe(0);
    });
  });

  describe('fetchTranslation — cache hit path', () => {
    it('returns cached result with source "cache" on hit', async () => {
      system.addVocabHints([{ word: 'maison', translation: 'house', context: 'noun' }]);
      const result = await system.fetchTranslation('maison');
      expect(result).not.toBeNull();
      expect(result!.source).toBe('cache');
      expect(result!.translation).toBe('house');
    });

    it('returns cached result even with different casing', async () => {
      system.addVocabHints([{ word: 'Château', translation: 'castle' }]);
      const result = await system.fetchTranslation('château');
      expect(result).not.toBeNull();
      expect(result!.translation).toBe('castle');
    });
  });

  describe('fetchTranslation — API path', () => {
    it('calls translateFn on cache miss and caches the result', async () => {
      const mockTranslateFn = vi.fn().mockResolvedValue({
        word: 'chien',
        translation: 'dog',
        context: 'animal',
      });
      system.setTranslateFn(mockTranslateFn);

      const result = await system.fetchTranslation('chien');
      expect(result).not.toBeNull();
      expect(result!.source).toBe('api');
      expect(result!.translation).toBe('dog');
      expect(mockTranslateFn).toHaveBeenCalledWith('chien', 'French');

      // Second fetch should hit cache
      const cached = await system.fetchTranslation('chien');
      expect(cached!.source).toBe('cache');
      expect(mockTranslateFn).toHaveBeenCalledTimes(1);
    });

    it('returns null when translateFn returns null', async () => {
      system.setTranslateFn(vi.fn().mockResolvedValue(null));
      const result = await system.fetchTranslation('zzz');
      expect(result).toBeNull();
    });

    it('returns null when no targetLanguage set', async () => {
      system.setTargetLanguage(null as any);
      const result = await system.fetchTranslation('test');
      expect(result).toBeNull();
    });

    it('deduplicates concurrent requests for the same word', async () => {
      let resolveTranslation: (v: any) => void;
      const slowFn = vi.fn().mockImplementation(() => new Promise(resolve => {
        resolveTranslation = resolve;
      }));
      system.setTranslateFn(slowFn);

      const p1 = system.fetchTranslation('lent');
      const p2 = system.fetchTranslation('lent');
      // Both requests should be the same promise
      resolveTranslation!({ word: 'lent', translation: 'slow' });
      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1!.translation).toBe('slow');
      expect(r2!.translation).toBe('slow');
      expect(slowFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('word encounter tracking', () => {
    it('fires onWordEncounter callback on cache hit', async () => {
      const callback = vi.fn();
      system.setOnWordEncounter(callback);
      system.addVocabHints([{ word: 'livre', translation: 'book' }]);
      await system.fetchTranslation('livre');
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        word: 'livre',
        translation: 'book',
        source: 'passive_hover',
      }));
    });

    it('tracks encounter count via getWordEncounterCount', async () => {
      system.addVocabHints([{ word: 'eau', translation: 'water' }]);
      expect(system.getWordEncounterCount('eau')).toBe(0);
      await system.fetchTranslation('eau');
      expect(system.getWordEncounterCount('eau')).toBe(1);
      await system.fetchTranslation('eau');
      expect(system.getWordEncounterCount('eau')).toBe(2);
    });
  });

  describe('isLikelyTargetLanguage', () => {
    it('recognizes cached words as target language', () => {
      system.addVocabHints([{ word: 'boulangerie', translation: 'bakery' }]);
      expect(system.isLikelyTargetLanguage('boulangerie')).toBe(true);
    });

    it('recognizes non-ASCII words as likely target language', () => {
      expect(system.isLikelyTargetLanguage('café')).toBe(true);
      expect(system.isLikelyTargetLanguage('naïve')).toBe(true);
    });

    it('excludes common English words', () => {
      expect(system.isLikelyTargetLanguage('the')).toBe(false);
      expect(system.isLikelyTargetLanguage('hello')).toBe(false);
    });

    it('excludes single characters and empty strings', () => {
      expect(system.isLikelyTargetLanguage('a')).toBe(false);
      expect(system.isLikelyTargetLanguage('')).toBe(false);
    });
  });

  describe('tokenize', () => {
    it('splits text into word and non-word tokens', () => {
      const tokens = system.tokenize('Bonjour le monde!');
      const words = tokens.filter(t => t.isWord);
      expect(words.length).toBe(3);
      expect(words[0].text).toBe('Bonjour');
    });

    it('preserves whitespace tokens', () => {
      const tokens = system.tokenize('un  deux');
      expect(tokens.some(t => t.text === '  ')).toBe(true);
    });
  });

  describe('stripPunctuation', () => {
    it('strips leading/trailing punctuation preserving accented chars', () => {
      expect(system.stripPunctuation('"bonjour"')).toBe('bonjour');
      expect(system.stripPunctuation('café!')).toBe('café');
      expect(system.stripPunctuation('...test...')).toBe('test');
    });
  });

  describe('CEFR-aware hint behavior', () => {
    it('returns hint behavior config based on CEFR level', () => {
      system.setCEFRLevel('A1');
      const behavior = system.getHintBehavior();
      expect(behavior).toBeDefined();
      expect(behavior.translationMode).toBeDefined();
    });

    it('tracks word mastery (8+ correct uses + encounters)', () => {
      system.updateWordMastery('bonjour', 10, 8);
      expect(system.isWordMastered('bonjour')).toBe(true);
    });

    it('non-mastered words are not flagged', () => {
      system.updateWordMastery('nouveau', 3, 1);
      expect(system.isWordMastered('nouveau')).toBe(false);
    });
  });
});

// ── Translation Cache Integration (IStorage contract) ────────────────────

describe('Translation Cache Storage Contract', () => {
  // These tests verify the expected API contract for the word translation cache.
  // They test the interface shape without requiring a real MongoDB connection.

  it('IStorage interface includes translation cache methods', async () => {
    // Dynamically import to verify the interface compiles correctly
    const { storage } = await import('../../server/db/storage');
    // The storage proxy should have these methods available
    // (they delegate to MongoStorage which implements them)
    expect(typeof (storage as any).findTranslation).toBe('function');
    expect(typeof (storage as any).upsertTranslation).toBe('function');
    expect(typeof (storage as any).incrementTranslationLookup).toBe('function');
    expect(typeof (storage as any).bulkUpsertTranslations).toBe('function');
    expect(typeof (storage as any).getTranslationCacheStats).toBe('function');
  });
});

// ── World Translation Pre-Generation ────────────────────────────────────

describe('preGenerateWorldTranslations', () => {
  beforeEach(() => {
    mockBulkUpsert.mockClear();
    mockBulkUpsert.mockResolvedValue(1);
  });

  it('exports the pre-generation function', async () => {
    const mod = await import('../../server/services/world-translation-generator');
    expect(typeof mod.preGenerateWorldTranslations).toBe('function');
  });

  it('exports GAME_TERMS constant', async () => {
    const { GAME_TERMS } = await import('../../server/services/world-translation-generator');
    expect(Array.isArray(GAME_TERMS)).toBe(true);
    expect(GAME_TERMS.length).toBeGreaterThan(30);
    expect(GAME_TERMS).toContain('quest');
    expect(GAME_TERMS).toContain('inventory');
  });

  it('returns zero counts when LLM is not configured', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    const mockProvider = {
      isConfigured: () => false,
      generate: vi.fn(),
    };
    const result = await preGenerateWorldTranslations('test-world', 'French', {
      provider: mockProvider as any,
    });
    expect(result.translated).toBe(0);
    expect(result.errors).toBe(0);
    expect(mockProvider.generate).not.toHaveBeenCalled();
  });

  it('calls LLM with game terms when configured', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    mockBulkUpsert.mockResolvedValue(2);
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: JSON.stringify([
        { word: 'quest', translation: 'quête', partOfSpeech: 'noun' },
        { word: 'reward', translation: 'récompense', partOfSpeech: 'noun' },
      ]), tokensUsed: 100, model: 'test', provider: 'test' }),
    };

    const result = await preGenerateWorldTranslations('test-world', 'French', {
      provider: mockProvider as any,
    });
    expect(mockProvider.generate).toHaveBeenCalled();
    expect(mockBulkUpsert).toHaveBeenCalledWith('test-world', 'French', expect.any(Array));
    expect(result.translated).toBeGreaterThanOrEqual(2);
  });

  it('translates location names when provided', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: JSON.stringify([
        { word: 'quest', translation: 'quête', partOfSpeech: 'noun' },
      ]), tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    await preGenerateWorldTranslations('test-world', 'French', {
      locationNames: ['Town Hall', 'Market Square'],
      provider: mockProvider as any,
    });
    // Should be called at least twice: once for game terms, once for locations
    expect(mockBulkUpsert.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('translates NPC titles when provided', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: JSON.stringify([
        { word: 'baker', translation: 'boulanger', partOfSpeech: 'noun' },
      ]), tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    await preGenerateWorldTranslations('test-world', 'French', {
      npcTitles: ['baker', 'blacksmith'],
      provider: mockProvider as any,
    });
    // Game terms + NPC titles
    expect(mockBulkUpsert.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('translates custom words when provided', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: JSON.stringify([
        { word: 'hello', translation: 'bonjour', partOfSpeech: 'interjection' },
      ]), tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    await preGenerateWorldTranslations('test-world', 'French', {
      customWords: ['hello', 'goodbye'],
      provider: mockProvider as any,
    });
    // Game terms + custom words
    expect(mockBulkUpsert.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('handles LLM returning markdown-wrapped JSON', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: '```json\n[{"word":"quest","translation":"quête","partOfSpeech":"noun"}]\n```', tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    const result = await preGenerateWorldTranslations('test-world', 'French', {
      provider: mockProvider as any,
    });
    expect(result.translated).toBeGreaterThanOrEqual(1);
  });

  it('handles LLM returning invalid JSON gracefully', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    mockBulkUpsert.mockResolvedValue(0);
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: 'This is not JSON at all', tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    const result = await preGenerateWorldTranslations('test-world', 'French', {
      provider: mockProvider as any,
    });
    // Should not throw, just return 0
    expect(result.translated).toBe(0);
  });

  it('filters out entries missing word or translation', async () => {
    const { preGenerateWorldTranslations } = await import('../../server/services/world-translation-generator');
    mockBulkUpsert.mockImplementation(async (_wid: any, _lang: any, entries: any[]) => entries.length);
    const mockProvider = {
      isConfigured: () => true,
      generate: vi.fn().mockResolvedValue({ text: JSON.stringify([
        { word: 'quest', translation: 'quête' },
        { word: '', translation: 'empty' },
        { word: 'noTranslation', translation: '' },
        { word: null, translation: 'null word' },
      ]), tokensUsed: 50, model: 'test', provider: 'test' }),
    };

    await preGenerateWorldTranslations('test-world', 'French', {
      provider: mockProvider as any,
    });
    // Only the valid entry should be stored
    const storedEntries = mockBulkUpsert.mock.calls[0]?.[2] || [];
    expect(storedEntries.length).toBe(1);
    expect(storedEntries[0].word).toBe('quest');
  });
});

// ── CEFR Vocabulary Extraction ──────────────────────────────────────────

describe('getCEFRVocabularyWords', () => {
  it('exports the CEFR vocabulary function', async () => {
    const { getCEFRVocabularyWords } = await import('../../server/services/world-translation-generator');
    expect(typeof getCEFRVocabularyWords).toBe('function');
  });

  it('returns A1 words for French', async () => {
    const { getCEFRVocabularyWords } = await import('../../server/services/world-translation-generator');
    const words = getCEFRVocabularyWords('fr', 'A1');
    expect(words.length).toBeGreaterThan(0);
    expect(words).toContain('bonjour');
    expect(words).toContain('merci');
  });

  it('returns A1+A2 words for A2 level', async () => {
    const { getCEFRVocabularyWords } = await import('../../server/services/world-translation-generator');
    const a1Words = getCEFRVocabularyWords('fr', 'A1');
    const a2Words = getCEFRVocabularyWords('fr', 'A2');
    expect(a2Words.length).toBeGreaterThan(a1Words.length);
    // A2 should include all A1 words
    for (const w of a1Words) {
      expect(a2Words).toContain(w);
    }
  });

  it('returns empty array for unknown language', async () => {
    const { getCEFRVocabularyWords } = await import('../../server/services/world-translation-generator');
    const words = getCEFRVocabularyWords('xx', 'A1');
    expect(words).toEqual([]);
  });

  it('returns empty array for invalid CEFR level', async () => {
    const { getCEFRVocabularyWords } = await import('../../server/services/world-translation-generator');
    const words = getCEFRVocabularyWords('fr', 'Z9');
    expect(words).toEqual([]);
  });
});
