import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock LLM Provider ─────────────────────────────────────────────────────

function createMockLLMProvider(responses?: Record<string, string>) {
  return {
    name: 'mock',
    isConfigured: () => true,
    generate: vi.fn(async (req: any) => {
      const prompt = req.prompt as string;
      // Detect which namespace is being translated from the prompt
      if (responses) {
        for (const [key, val] of Object.entries(responses)) {
          if (prompt.includes(key)) return { text: val, tokensUsed: 10, model: 'mock', provider: 'mock' };
        }
      }
      // Default: return a valid JSON with all keys having "translated_" prefix
      const match = prompt.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const translated: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          translated[k] = `translated_${v}`;
        }
        return { text: JSON.stringify(translated), tokensUsed: 10, model: 'mock', provider: 'mock' };
      }
      return { text: '{}', tokensUsed: 0, model: 'mock', provider: 'mock' };
    }),
  };
}

// ── generateUITranslations ────────────────────────────────────────────────

describe('generateUITranslations', () => {
  it('should translate all non-system namespaces', async () => {
    const { generateUITranslations } = await import('../../server/services/ui-translation-generator');

    const englishSource = {
      ui: { questLog: 'Quest Log', inventory: 'Inventory' },
      actions: { talk: 'Talk', enter: 'Enter' },
      system: { saveSuccessful: 'Save successful' },
    };

    const mockProvider = createMockLLMProvider();
    const result = await generateUITranslations(englishSource, 'French', {
      provider: mockProvider as any,
    });

    // system namespace should be preserved as English
    expect(result.system).toEqual(englishSource.system);

    // Other namespaces should have been translated
    expect(result.ui).toBeDefined();
    expect(result.actions).toBeDefined();

    // generate should have been called for ui and actions (not system)
    expect(mockProvider.generate).toHaveBeenCalledTimes(2);
  });

  it('should fall back to English when LLM is not configured', async () => {
    const { generateUITranslations } = await import('../../server/services/ui-translation-generator');

    const englishSource = {
      ui: { questLog: 'Quest Log' },
      actions: { talk: 'Talk' },
    };

    const result = await generateUITranslations(englishSource, 'Spanish', {
      provider: { isConfigured: () => false, generate: vi.fn() } as any,
    });

    // Should return English unchanged
    expect(result).toEqual(englishSource);
  });

  it('should fall back to English for a namespace when LLM response is invalid JSON', async () => {
    const { generateUITranslations } = await import('../../server/services/ui-translation-generator');

    const englishSource = {
      ui: { questLog: 'Quest Log' },
      actions: { talk: 'Talk' },
    };

    const badProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: vi.fn(async () => ({ text: 'NOT VALID JSON {{{', tokensUsed: 0, model: 'mock', provider: 'mock' })),
    };

    const result = await generateUITranslations(englishSource, 'German', {
      provider: badProvider as any,
    });

    // Should fall back to English for both namespaces
    expect(result.ui).toEqual(englishSource.ui);
    expect(result.actions).toEqual(englishSource.actions);
  });

  it('should include language variant in the prompt when specified', async () => {
    const { generateUITranslations } = await import('../../server/services/ui-translation-generator');

    const englishSource = {
      ui: { questLog: 'Quest Log' },
    };

    const mockProvider = createMockLLMProvider();
    await generateUITranslations(englishSource, 'French', {
      provider: mockProvider as any,
      languageVariant: 'Louisiana French',
    });

    const prompt = mockProvider.generate.mock.calls[0][0].prompt;
    expect(prompt).toContain('Louisiana French');
  });
});

// ── languageToCode ────────────────────────────────────────────────────────

describe('languageToCode', () => {
  it('should map common language names to ISO codes', async () => {
    const { languageToCode } = await import('../../server/services/world-translation-generator');

    expect(languageToCode('French')).toBe('fr');
    expect(languageToCode('spanish')).toBe('es');
    expect(languageToCode('German')).toBe('de');
    expect(languageToCode('Italian')).toBe('it');
    expect(languageToCode('Japanese')).toBe('ja');
  });

  it('should fall back to first 2 chars for unknown languages', async () => {
    const { languageToCode } = await import('../../server/services/world-translation-generator');

    expect(languageToCode('Swahili')).toBe('sw');
    expect(languageToCode('Hindi')).toBe('hi');
  });
});

// ── loadWorldTranslations (i18n) ──────────────────────────────────────────

describe('loadWorldTranslations', () => {
  it('should add translations to the i18n resource bundle', async () => {
    const i18nModule = await import('../../client/src/i18n/index');

    const testTranslations = {
      ui: { questLog: 'Journal de quêtes' },
      actions: { talk: 'Parler' },
    };

    i18nModule.loadWorldTranslations('test-lang', testTranslations);

    // The translations should be available in the i18n instance
    const i18n = i18nModule.default;
    expect(i18n.hasResourceBundle('test-lang', 'common')).toBe(true);
    const bundle = i18n.getResourceBundle('test-lang', 'common');
    expect(bundle.ui.questLog).toBe('Journal de quêtes');
    expect(bundle.actions.talk).toBe('Parler');
  });
});

// ── setTargetLanguage / getTargetLanguage ─────────────────────────────────

describe('setTargetLanguage / getTargetLanguage', () => {
  it('should store and retrieve the target language', async () => {
    const { setTargetLanguage, getTargetLanguage } = await import('../../client/src/i18n/index');

    setTargetLanguage('es');
    expect(getTargetLanguage()).toBe('es');

    setTargetLanguage('de');
    expect(getTargetLanguage()).toBe('de');
  });
});

// ── IDataSource.fetchUITranslations ───────────────────────────────────────

describe('IDataSource fetchUITranslations implementations', () => {
  it('FileDataSource should return null', async () => {
    const { FileDataSource } = await import('../../client/src/components/3DGame/DataSource');
    const ds = new FileDataSource('/mock-base');
    const result = await ds.fetchUITranslations('world1', 'fr');
    expect(result).toBeNull();
  });
});
