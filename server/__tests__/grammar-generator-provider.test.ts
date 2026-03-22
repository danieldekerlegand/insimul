import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILLMProvider, LLMResponse } from '../services/llm-provider';
import { GrammarGenerator } from '../services/grammar-generator.js';

const VALID_GRAMMAR = {
  origin: ['#greeting# #name#!'],
  greeting: ['Hello', 'Hi', 'Greetings'],
  name: ['World', 'Friend', 'Traveler'],
};

const VALID_NAME_GRAMMAR = {
  origin: ['#maleFirst# #surname#', '#femaleFirst# #surname#'],
  maleFirst: ['Jean', 'Pierre', 'Louis'],
  femaleFirst: ['Marie', 'Claire', 'Sophie'],
  surname: ['Dupont', 'Martin', 'Bernard'],
};

function createMockProvider(responseText?: string): ILLMProvider {
  return {
    name: 'test',
    generate: vi.fn(async (): Promise<LLMResponse> => ({
      text: responseText ?? JSON.stringify(VALID_GRAMMAR),
      tokensUsed: 100,
      model: 'test',
      provider: 'test',
    })),
    generateBatch: vi.fn(),
    estimateCost: vi.fn(() => 0),
  };
}

describe('GrammarGenerator with provider', () => {
  describe('constructor', () => {
    it('accepts a custom provider', () => {
      const provider = createMockProvider();
      const gen = new GrammarGenerator(provider);
      expect(gen).toBeDefined();
    });
  });

  describe('generateGrammar', () => {
    it('generates a grammar via the provider', async () => {
      const provider = createMockProvider();
      const gen = new GrammarGenerator(provider);

      const result = await gen.generateGrammar({
        description: 'greeting messages',
        theme: 'friendly',
        complexity: 'simple',
      });

      expect(result.grammar).toEqual(VALID_GRAMMAR);
      expect(result.tags).toContain('generated');
      expect(provider.generate).toHaveBeenCalledTimes(1);
    });

    it('passes the prompt to the provider', async () => {
      const provider = createMockProvider();
      const gen = new GrammarGenerator(provider);

      await gen.generateGrammar({
        description: 'fantasy weapon names',
        theme: 'medieval',
      });

      const call = (provider.generate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.prompt).toContain('fantasy weapon names');
      expect(call.prompt).toContain('medieval');
    });

    it('throws when response is not valid JSON', async () => {
      const provider = createMockProvider('not valid json at all');
      const gen = new GrammarGenerator(provider);

      await expect(
        gen.generateGrammar({ description: 'test' })
      ).rejects.toThrow('Failed to generate grammar');
    });

    it('throws when grammar has no origin symbol', async () => {
      const noOrigin = { greeting: ['Hello'], name: ['World'] };
      const provider = createMockProvider(JSON.stringify(noOrigin));
      const gen = new GrammarGenerator(provider);

      await expect(
        gen.generateGrammar({ description: 'test' })
      ).rejects.toThrow('origin');
    });
  });

  describe('extendGrammar', () => {
    it('extends an existing grammar via the provider', async () => {
      const extended = {
        ...VALID_GRAMMAR,
        farewell: ['Goodbye', 'See you', 'Farewell'],
      };
      const provider = createMockProvider(JSON.stringify(extended));
      const gen = new GrammarGenerator(provider);

      const result = await gen.extendGrammar(VALID_GRAMMAR, 'farewells', 3);

      expect(result).toHaveProperty('farewell');
      expect(result.origin).toEqual(VALID_GRAMMAR.origin);
      expect(provider.generate).toHaveBeenCalledTimes(1);
    });
  });

  describe('grammarFromExamples', () => {
    it('generates a grammar from example outputs', async () => {
      const provider = createMockProvider();
      const gen = new GrammarGenerator(provider);

      const result = await gen.grammarFromExamples(
        ['Hello World!', 'Hi Friend!', 'Greetings Traveler!'],
        'origin'
      );

      expect(result).toHaveProperty('origin');
      expect(provider.generate).toHaveBeenCalledTimes(1);

      const call = (provider.generate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.prompt).toContain('Hello World!');
    });
  });

  describe('generateCustomGrammars', () => {
    it('generates grammars for all 8 categories', async () => {
      const provider = createMockProvider(JSON.stringify(VALID_NAME_GRAMMAR));
      const gen = new GrammarGenerator(provider);

      const results = await gen.generateCustomGrammars(
        'French Village',
        'A quaint French village setting',
        'French',
      );

      expect(results.length).toBe(8);
      expect(results.map(r => r.tags)).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['character']),
          expect.arrayContaining(['settlement']),
          expect.arrayContaining(['business']),
        ])
      );
      // 8 categories = 8 generate calls
      expect(provider.generate).toHaveBeenCalledTimes(8);
    });

    it('reports progress via callback', async () => {
      const provider = createMockProvider(JSON.stringify(VALID_NAME_GRAMMAR));
      const gen = new GrammarGenerator(provider);
      const progressCalls: string[] = [];

      await gen.generateCustomGrammars(
        'Test',
        'test prompt',
        undefined,
        undefined,
        (message) => progressCalls.push(message),
      );

      expect(progressCalls.length).toBeGreaterThanOrEqual(1);
      expect(progressCalls[0]).toContain('Generating batch');
    });
  });
});
