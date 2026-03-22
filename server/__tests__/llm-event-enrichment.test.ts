/**
 * Tests for LLM event enrichment service with provider interface.
 */
import { describe, it, expect, vi } from 'vitest';
import type { ILLMProvider, LLMRequest } from '../services/llm-provider.js';
import {
  enrichHistoricalEvents,
  enrichTier2Events,
  enrichTier3Event,
  type WorldContext,
} from '../services/llm-event-enrichment.js';
import type { Truth } from '../../shared/schema.js';

function makeTruth(overrides: Partial<Truth> = {}): Truth {
  return {
    id: 'truth-1',
    worldId: 'world-1',
    title: 'Test Event',
    content: 'Something happened.',
    category: 'event',
    isActive: true,
    scope: 'settlement',
    historicalSignificance: 'settlement',
    historicalEra: 'medieval',
    timeDescription: null,
    yearOccurred: null,
    relatedCharacterIds: null,
    relatedTruthIds: null,
    metadata: null,
    createdAt: new Date(),
    ...overrides,
  } as Truth;
}

const worldContext: WorldContext = {
  worldName: 'Testopia',
  worldDescription: 'A test world',
  era: 'modern',
  settlements: [{ name: 'Townsville' }],
};

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

describe('enrichHistoricalEvents', () => {
  it('routes events to correct tiers', async () => {
    const events = [
      makeTruth({ id: 't1', historicalSignificance: 'personal' }),
      makeTruth({ id: 't2', historicalSignificance: 'settlement' }),
      makeTruth({ id: 't3', historicalSignificance: 'world' }),
    ];

    const provider = createMockProvider(JSON.stringify([{ index: 1, text: 'Enriched settlement event.' }]));
    // Override for tier 3
    (provider.generate as any)
      .mockResolvedValueOnce({
        text: JSON.stringify([{ index: 1, text: 'Enriched settlement event.' }]),
        tokensUsed: 50, model: 'mock', provider: 'mock',
      })
      .mockResolvedValueOnce({
        text: 'A vivid narrative about the world event.',
        tokensUsed: 100, model: 'mock', provider: 'mock',
      });

    const results = await enrichHistoricalEvents(events, worldContext, undefined, provider);

    expect(results).toHaveLength(3);
    const tier1 = results.find(r => r.id === 't1');
    expect(tier1!.tier).toBe(1);
    expect(tier1!.enrichedContent).toBe(tier1!.originalContent);
  });

  it('applies tier override', async () => {
    const events = [
      makeTruth({ id: 't1', historicalSignificance: 'personal' }),
    ];

    const provider = createMockProvider('A tier-3 enriched narrative.');

    const results = await enrichHistoricalEvents(events, worldContext, 3, provider);

    expect(results).toHaveLength(1);
    expect(results[0].tier).toBe(3);
    expect(results[0].enrichedContent).toBe('A tier-3 enriched narrative.');
  });
});

describe('enrichTier2Events', () => {
  it('enriches events via provider', async () => {
    const events = [
      makeTruth({ id: 't1', title: 'Event 1', content: 'Content 1' }),
      makeTruth({ id: 't2', title: 'Event 2', content: 'Content 2' }),
    ];

    const provider = createMockProvider(JSON.stringify([
      { index: 1, text: 'Enriched content 1.' },
      { index: 2, text: 'Enriched content 2.' },
    ]));

    const results = await enrichTier2Events(events, worldContext, provider);

    expect(results).toHaveLength(2);
    expect(results[0].enrichedContent).toBe('Enriched content 1.');
    expect(results[1].enrichedContent).toBe('Enriched content 2.');
    expect(results[0].tier).toBe(2);
  });

  it('passes system prompt with world context', async () => {
    const generateFn = vi.fn().mockResolvedValue({
      text: JSON.stringify([{ index: 1, text: 'Enriched.' }]),
      tokensUsed: 20, model: 'mock', provider: 'mock',
    });
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: generateFn,
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    await enrichTier2Events([makeTruth()], worldContext, provider);

    const req = generateFn.mock.calls[0][0] as LLMRequest;
    expect(req.systemPrompt).toContain('Testopia');
    expect(req.systemPrompt).toContain('Townsville');
  });

  it('falls back to original content on parse error', async () => {
    const provider = createMockProvider('not json');

    const results = await enrichTier2Events(
      [makeTruth({ id: 't1', content: 'Original' })],
      worldContext,
      provider,
    );

    expect(results[0].enrichedContent).toBe('Original');
  });

  it('throws when provider is not configured', async () => {
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => false,
      generate: vi.fn(),
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    await expect(enrichTier2Events([makeTruth()], worldContext, provider))
      .rejects.toThrow('not configured');
  });
});

describe('enrichTier3Event', () => {
  it('enriches single event via provider', async () => {
    const provider = createMockProvider('A vivid narrative about the founding.');

    const result = await enrichTier3Event(makeTruth({ title: 'Founding' }), worldContext, provider);

    expect(result.enrichedContent).toBe('A vivid narrative about the founding.');
    expect(result.tier).toBe(3);
  });

  it('falls back to original on provider error', async () => {
    const provider: ILLMProvider = {
      name: 'mock',
      isConfigured: () => true,
      generate: vi.fn().mockRejectedValue(new Error('API error')),
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    const result = await enrichTier3Event(
      makeTruth({ id: 't1', content: 'Original content' }),
      worldContext,
      provider,
    );

    expect(result.enrichedContent).toBe('Original content');
  });
});
