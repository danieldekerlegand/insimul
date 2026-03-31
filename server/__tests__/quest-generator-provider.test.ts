import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILLMProvider, LLMRequest, LLMResponse } from '../services/llm-provider';

// Mock dependencies that quest-generator imports
vi.mock('../../shared/quest-types/index.js', () => ({
  getQuestTypeForWorld: vi.fn(() => mockQuestType),
  getQuestTypesForWorld: vi.fn(() => [mockQuestType]),
}));

vi.mock('../../shared/quest-objective-types.js', () => ({
  buildObjectiveTypePrompt: vi.fn(() => 'OBJECTIVE_TYPES_PROMPT'),
  validateAndNormalizeObjectives: vi.fn((objs: any[]) => objs),
}));

vi.mock('../../shared/quest-difficulty.js', () => ({
  getQuestDifficultyInfo: vi.fn(() => ({
    cefrLevel: 'A1',
    stars: 1,
    estimatedMinutes: 10,
  })),
}));

vi.mock('../../shared/quest-hints.js', () => ({
  buildHintGenerationPrompt: vi.fn(() => 'HINT_PROMPT'),
  buildQuestHints: vi.fn(() => ({ questId: 'temp', hints: [] })),
}));

vi.mock('../services/world-state-context.js', () => ({
  buildWorldContextPrompt: vi.fn(() => ''),
  bindQuestToWorldEntities: vi.fn((data: any) => data),
}));

// Mock createLLMProvider so default provider doesn't need real Gemini
vi.mock('../services/llm-provider.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/llm-provider')>();
  return {
    ...actual,
    createLLMProvider: vi.fn(() => fallbackProvider),
  };
});

import { generateQuestForType, generateQuestsForWorld, generateQuestFromDialogue } from '../../shared/quests/quest-generator.js';

const VALID_QUEST = {
  title: 'Market Explorer',
  description: 'Visit the local market and practice your vocabulary.',
  category: 'exploration',
  difficulty: 'easy',
  objectives: [
    { type: 'visit_location', description: 'Visit the market', target: 'market', required: 1 },
  ],
  rewards: { experience: 50, gold: 100 },
};

const mockQuestType = {
  id: 'language-learning',
  generationPrompt: vi.fn(() => 'Generate a language learning quest.'),
  questCategories: [{ id: 'exploration' }, { id: 'vocabulary' }],
  difficultyScaling: { easy: { xp: 50, multiplier: 1 } },
};

function createMockProvider(overrides?: Partial<ILLMProvider>): ILLMProvider {
  return {
    name: 'test',
    generate: vi.fn(async (): Promise<LLMResponse> => ({
      text: JSON.stringify(VALID_QUEST),
      tokensUsed: 100,
      model: 'test',
      provider: 'test',
    })),
    generateBatch: vi.fn(),
    estimateCost: vi.fn(() => 0),
    ...overrides,
  };
}

const fallbackProvider = createMockProvider();

describe('quest-generator provider migration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQuestForType', () => {
    it('generates a quest using the injected provider', async () => {
      const provider = createMockProvider();

      const quest = await generateQuestForType({
        world: { id: 'w1', targetLanguage: 'French' } as any,
        questType: mockQuestType,
        category: 'exploration',
        difficulty: 'easy',
        provider,
      });

      expect(quest.title).toBe('Market Explorer');
      expect(quest.worldId).toBe('w1');
      expect(quest.targetLanguage).toBe('French');
      expect(provider.generate).toHaveBeenCalledTimes(1);
    });

    it('passes prompt and systemPrompt to provider', async () => {
      const generateSpy = vi.fn(async (): Promise<LLMResponse> => ({
        text: JSON.stringify(VALID_QUEST),
        tokensUsed: 100,
        model: 'test',
        provider: 'test',
      }));
      const provider = createMockProvider({ generate: generateSpy });

      await generateQuestForType({
        world: { id: 'w1', targetLanguage: 'French' } as any,
        questType: mockQuestType,
        category: 'exploration',
        difficulty: 'easy',
        provider,
      });

      const call = generateSpy.mock.calls[0][0];
      expect(call.prompt).toContain('exploration');
      expect(call.systemPrompt).toContain('quest designer');
    });

    it('throws on empty LLM response', async () => {
      const provider = createMockProvider({
        generate: vi.fn(async () => ({ text: '', tokensUsed: 0, model: 'test', provider: 'test' })),
      });

      await expect(
        generateQuestForType({
          world: { id: 'w1', targetLanguage: 'French' } as any,
          questType: mockQuestType,
          category: 'exploration',
          difficulty: 'easy',
          provider,
        })
      ).rejects.toThrow('empty response');
    });
  });

  describe('generateQuestsForWorld', () => {
    it('generates multiple quests using the provider', async () => {
      const provider = createMockProvider();

      const quests = await generateQuestsForWorld(
        { id: 'w1', targetLanguage: 'French' } as any,
        3,
        { provider }
      );

      expect(quests).toHaveLength(3);
      expect(provider.generate).toHaveBeenCalledTimes(3);
    });
  });

  describe('generateQuestFromDialogue', () => {
    it('generates a dialogue-based quest via provider', async () => {
      const provider = createMockProvider();

      const quest = await generateQuestFromDialogue({
        world: { id: 'w1', targetLanguage: 'French' } as any,
        npcId: 'npc1',
        npcName: 'Pierre',
        playerId: 'p1',
        playerName: 'Player',
        conversationContext: 'Discussing the local market',
        provider,
      });

      expect(quest.title).toBe('Market Explorer');
      expect(quest.assignedBy).toBe('Pierre');
      expect(provider.generate).toHaveBeenCalledTimes(1);
    });
  });
});
