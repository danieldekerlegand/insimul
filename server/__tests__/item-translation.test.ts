/**
 * Tests for item translation service with provider interface.
 */
import { describe, it, expect, vi } from 'vitest';
import type { ILLMProvider, LLMRequest } from '../services/llm-provider.js';
import { batchTranslateItems } from '../services/item-translation.js';

function createMockProvider(text: string): ILLMProvider {
  return {
    name: 'mock',
    isConfigured: () => true,
    generate: vi.fn().mockResolvedValue({
      text,
      tokensUsed: 50,
      model: 'mock',
      provider: 'mock',
    }),
    generateBatch: vi.fn(),
    estimateCost: () => 0,
  };
}

describe('batchTranslateItems', () => {
  const items = [
    { id: '1', name: 'Sword', category: 'weapon' },
    { id: '2', name: 'Shield', category: 'armor' },
    { id: '3', name: 'Potion', category: 'consumable' },
  ];

  it('translates items using provider', async () => {
    const provider = createMockProvider(JSON.stringify([
      { index: 0, targetWord: 'Épée', pronunciation: 'ay-pay' },
      { index: 1, targetWord: 'Bouclier', pronunciation: 'boo-klee-ay' },
      { index: 2, targetWord: 'Potion', pronunciation: 'po-see-on' },
    ]));

    const result = await batchTranslateItems(items, 'French', 50, provider);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: '1',
      targetWord: 'Épée',
      pronunciation: 'ay-pay',
      category: 'weapon',
    });
    expect(result[1].targetWord).toBe('Bouclier');
    expect(result[2].targetWord).toBe('Potion');
  });

  it('passes responseMimeType and temperature to provider', async () => {
    const generateFn = vi.fn().mockResolvedValue({
      text: JSON.stringify([{ index: 0, targetWord: 'Épée', pronunciation: 'ay-pay' }]),
      tokensUsed: 20,
      model: 'mock',
      provider: 'mock',
    });
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: generateFn,
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    await batchTranslateItems([items[0]], 'French', 50, provider);

    const req = generateFn.mock.calls[0][0] as LLMRequest;
    expect(req.responseMimeType).toBe('application/json');
    expect(req.temperature).toBe(0.2);
    expect(req.prompt).toContain('French');
    expect(req.prompt).toContain('Sword');
  });

  it('returns empty array when provider is not configured', async () => {
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => false,
      generate: vi.fn(),
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    const result = await batchTranslateItems(items, 'French', 50, provider);

    expect(result).toEqual([]);
    expect(provider.generate).not.toHaveBeenCalled();
  });

  it('returns empty array on provider error', async () => {
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: vi.fn().mockRejectedValue(new Error('API error')),
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    const result = await batchTranslateItems(items, 'French', 50, provider);

    expect(result).toEqual([]);
  });

  it('returns empty array on invalid JSON response', async () => {
    const provider = createMockProvider('not valid json');

    const result = await batchTranslateItems(items, 'French', 50, provider);

    expect(result).toEqual([]);
  });

  it('processes items in batches', async () => {
    const generateFn = vi.fn()
      .mockResolvedValueOnce({
        text: JSON.stringify([
          { index: 0, targetWord: 'A', pronunciation: 'a' },
          { index: 1, targetWord: 'B', pronunciation: 'b' },
        ]),
        tokensUsed: 20,
        model: 'mock',
        provider: 'mock',
      })
      .mockResolvedValueOnce({
        text: JSON.stringify([
          { index: 0, targetWord: 'C', pronunciation: 'c' },
        ]),
        tokensUsed: 10,
        model: 'mock',
        provider: 'mock',
      });

    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: generateFn,
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    const result = await batchTranslateItems(items, 'French', 2, provider);

    expect(generateFn).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(3);
  });
});
