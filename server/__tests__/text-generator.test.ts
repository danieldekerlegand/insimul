import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TextGenerationParams, GeneratedTextResult } from '../services/text-generator';
import type { ILLMProvider, LLMRequest, LLMResponse } from '../services/llm-provider';

// Mock createLLMProvider so the default provider path doesn't need real Gemini
vi.mock('../services/llm-provider.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/llm-provider')>();
  return {
    ...actual,
    createLLMProvider: vi.fn(() => mockProvider),
  };
});

import {
  generateText,
  generateTextBatch,
  generatedTextToInsertText,
  buildStarterSetParams,
} from '../services/text-generator.js';

const VALID_RESULT: GeneratedTextResult = {
  title: 'Le Chat du Village',
  titleTranslation: 'The Village Cat',
  pages: [
    {
      content: 'Il y a un chat dans le village. Le chat est petit et noir.',
      contentTranslation: 'There is a cat in the village. The cat is small and black.',
    },
    {
      content: 'Le chat aime le soleil. Il dort sur le mur.',
      contentTranslation: 'The cat likes the sun. It sleeps on the wall.',
    },
  ],
  vocabularyHighlights: [
    { word: 'chat', translation: 'cat', partOfSpeech: 'noun' },
    { word: 'village', translation: 'village', partOfSpeech: 'noun' },
    { word: 'petit', translation: 'small', partOfSpeech: 'adjective' },
    { word: 'noir', translation: 'black', partOfSpeech: 'adjective' },
    { word: 'soleil', translation: 'sun', partOfSpeech: 'noun' },
    { word: 'dort', translation: 'sleeps', partOfSpeech: 'verb' },
    { word: 'mur', translation: 'wall', partOfSpeech: 'noun' },
  ],
  comprehensionQuestions: [
    {
      question: 'De quelle couleur est le chat?',
      questionTranslation: 'What color is the cat?',
      options: ['Blanc', 'Noir', 'Gris', 'Roux'],
      correctIndex: 1,
    },
    {
      question: "Où dort le chat?",
      questionTranslation: 'Where does the cat sleep?',
      options: ['Sur le lit', 'Sur le mur', 'Dans la maison', 'Sous la table'],
      correctIndex: 1,
    },
    {
      question: "Qu'aime le chat?",
      questionTranslation: 'What does the cat like?',
      options: ['La pluie', 'Le soleil', 'La neige', 'Le vent'],
      correctIndex: 1,
    },
  ],
};

function createMockProvider(generateFn?: (req: LLMRequest) => Promise<LLMResponse>): ILLMProvider {
  const defaultGenerate = async (req: LLMRequest): Promise<LLMResponse> => ({
    text: JSON.stringify(VALID_RESULT),
    tokensUsed: 100,
    model: 'test-model',
    provider: 'test',
  });

  return {
    name: 'test',
    generate: generateFn ?? defaultGenerate,
    generateBatch: vi.fn(),
    estimateCost: vi.fn(() => 0),
  };
}

const mockProvider = createMockProvider();

describe('text-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock provider generate to default
    (mockProvider as any).generate = async () => ({
      text: JSON.stringify(VALID_RESULT),
      tokensUsed: 100,
      model: 'test-model',
      provider: 'test',
    });
  });

  describe('generateText', () => {
    it('generates a valid text via provider', async () => {
      const provider = createMockProvider();

      const params: TextGenerationParams = {
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A1',
        theme: 'The village cat',
        pageCount: 2,
      };

      const result = await generateText(params, provider);

      expect(result.title).toBe('Le Chat du Village');
      expect(result.pages).toHaveLength(2);
      expect(result.vocabularyHighlights.length).toBeGreaterThanOrEqual(5);
      expect(result.comprehensionQuestions.length).toBeGreaterThanOrEqual(3);
    });

    it('strips code fences from response', async () => {
      const provider = createMockProvider(async () => ({
        text: '```json\n' + JSON.stringify(VALID_RESULT) + '\n```',
        tokensUsed: 100,
        model: 'test',
        provider: 'test',
      }));

      const result = await generateText({
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A1',
        pageCount: 2,
      }, provider);

      expect(result.title).toBe('Le Chat du Village');
    });

    it('throws on empty response', async () => {
      const provider = createMockProvider(async () => ({
        text: '',
        tokensUsed: 0,
        model: 'test',
        provider: 'test',
      }));

      await expect(
        generateText({
          worldId: 'world-1',
          targetLanguage: 'French',
          category: 'book',
          cefrLevel: 'A1',
        }, provider)
      ).rejects.toThrow('empty response');
    });

    it('retries on invalid JSON and succeeds on second attempt', async () => {
      let callCount = 0;
      const provider = createMockProvider(async () => {
        callCount++;
        return {
          text: callCount === 1 ? 'not valid json' : JSON.stringify(VALID_RESULT),
          tokensUsed: 100,
          model: 'test',
          provider: 'test',
        };
      });

      const result = await generateText({
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A1',
        pageCount: 2,
      }, provider);

      expect(result.title).toBe('Le Chat du Village');
      expect(callCount).toBe(2);
    });

    it('passes clueText into the prompt sent to provider', async () => {
      const generateSpy = vi.fn(async (req: LLMRequest): Promise<LLMResponse> => ({
        text: JSON.stringify(VALID_RESULT),
        tokensUsed: 100,
        model: 'test',
        provider: 'test',
      }));
      const provider = createMockProvider(generateSpy);

      await generateText({
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A2',
        clueText: 'The writer visited a secret garden',
        pageCount: 2,
      }, provider);

      expect(generateSpy).toHaveBeenCalledTimes(1);
      expect(generateSpy.mock.calls[0][0].prompt).toContain('secret garden');
    });

    it('uses default provider when none is passed', async () => {
      const result = await generateText({
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A1',
        pageCount: 2,
      });

      expect(result.title).toBe('Le Chat du Village');
    });
  });

  describe('generatedTextToInsertText', () => {
    it('converts generated result to InsertText format', () => {
      const params: TextGenerationParams = {
        worldId: 'world-1',
        targetLanguage: 'French',
        category: 'book',
        cefrLevel: 'A1',
        theme: 'Village life',
      };

      const insert = generatedTextToInsertText(VALID_RESULT, params);

      expect(insert.worldId).toBe('world-1');
      expect(insert.title).toBe('Le Chat du Village');
      expect(insert.textType).toBe('book');
      expect(insert.language).toBe('French');
      expect(insert.difficulty).toBe('beginner');
      expect(insert.vocabularyWords).toContain('chat');
      expect(insert.vocabularyWords).toContain('village');
      expect(insert.tags).toContain('A1');
      expect(insert.tags).toContain('book');
      expect(insert.body).toContain('Il y a un chat');
      expect(insert.translation).toContain('There is a cat');
      expect(insert.metadata).toHaveProperty('cefrLevel', 'A1');
      expect(insert.metadata).toHaveProperty('isGenerated', true);
      expect(insert.metadata).toHaveProperty('pages');
      expect(insert.metadata).toHaveProperty('vocabularyHighlights');
      expect(insert.metadata).toHaveProperty('comprehensionQuestions');
    });

    it('maps CEFR levels to difficulty correctly', () => {
      const params = (level: 'A1' | 'A2' | 'B1' | 'B2') => ({
        worldId: 'w',
        targetLanguage: 'French',
        category: 'book' as const,
        cefrLevel: level,
      });

      expect(generatedTextToInsertText(VALID_RESULT, params('A1')).difficulty).toBe('beginner');
      expect(generatedTextToInsertText(VALID_RESULT, params('A2')).difficulty).toBe('beginner');
      expect(generatedTextToInsertText(VALID_RESULT, params('B1')).difficulty).toBe('intermediate');
      expect(generatedTextToInsertText(VALID_RESULT, params('B2')).difficulty).toBe('advanced');
    });

    it('joins pages with separator', () => {
      const insert = generatedTextToInsertText(VALID_RESULT, {
        worldId: 'w',
        targetLanguage: 'French',
        category: 'journal',
        cefrLevel: 'A1',
      });

      expect(insert.body).toContain('---');
      expect(insert.translation).toContain('---');
    });
  });

  describe('buildStarterSetParams', () => {
    it('generates 28 params for the starter set', () => {
      const params = buildStarterSetParams('world-1', 'French');
      expect(params).toHaveLength(28);
    });

    it('includes 12 books across all CEFR levels', () => {
      const params = buildStarterSetParams('world-1', 'French');
      const books = params.filter((p) => p.category === 'book');
      expect(books).toHaveLength(12);
      expect(books.filter((b) => b.cefrLevel === 'A1')).toHaveLength(3);
      expect(books.filter((b) => b.cefrLevel === 'A2')).toHaveLength(3);
      expect(books.filter((b) => b.cefrLevel === 'B1')).toHaveLength(3);
      expect(books.filter((b) => b.cefrLevel === 'B2')).toHaveLength(3);
    });

    it('includes 4 of each non-book category', () => {
      const params = buildStarterSetParams('world-1', 'French');
      for (const cat of ['journal', 'letter', 'flyer', 'recipe']) {
        const items = params.filter((p) => p.category === cat);
        expect(items).toHaveLength(4);
        const levels = new Set(items.map((i) => i.cefrLevel));
        expect(levels.size).toBe(4);
      }
    });

    it('sets correct worldId and language on all params', () => {
      const params = buildStarterSetParams('world-42', 'Spanish');
      for (const p of params) {
        expect(p.worldId).toBe('world-42');
        expect(p.targetLanguage).toBe('Spanish');
      }
    });
  });

  describe('generateTextBatch', () => {
    it('generates multiple texts in batch via provider', async () => {
      const provider = createMockProvider();

      const params: TextGenerationParams[] = [
        { worldId: 'w', targetLanguage: 'French', category: 'book', cefrLevel: 'A1', pageCount: 2 },
        { worldId: 'w', targetLanguage: 'French', category: 'letter', cefrLevel: 'A2', pageCount: 2 },
      ];

      const results = await generateTextBatch(params, provider);
      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Le Chat du Village');
    });
  });
});
