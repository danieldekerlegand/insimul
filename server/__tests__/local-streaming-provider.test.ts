/**
 * Tests for local streaming provider registration and NPC conversation wiring.
 *
 * Run with: npx vitest run server/__tests__/local-streaming-provider.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node-llama-cpp to avoid loading native modules in tests
vi.mock('node-llama-cpp', () => ({
  getLlama: vi.fn(),
  LlamaModel: class {},
  LlamaContext: class {},
  LlamaChatSession: class {},
}));

import {
  listProviders,
  getProvider,
  registerProvider,
} from '../services/conversation/providers/provider-registry';

describe('provider-registry with local provider', () => {
  it('registers both gemini and local providers', () => {
    const providers = listProviders();
    expect(providers).toContain('gemini');
    expect(providers).toContain('local');
  });

  it('getProvider("local") returns a LocalStreamingProvider', () => {
    const provider = getProvider('local');
    expect(provider.name).toBe('local');
  });

  it('getProvider("local") has streamCompletion method', () => {
    const provider = getProvider('local');
    expect(typeof provider.streamCompletion).toBe('function');
  });

  it('throws for unregistered provider', () => {
    expect(() => getProvider('nonexistent')).toThrow(/not registered/);
  });
});

describe('NPC conversation engine accepts llmProvider option', () => {
  it('initiateConversation uses provided llmProvider for streaming', async () => {
    const {
      initiateConversation,
      resetRateLimiting,
    } = await import('../services/conversation/npc-conversation-engine');

    resetRateLimiting();

    // Create a mock streaming provider
    const mockProvider = {
      name: 'test-local',
      async *streamCompletion() {
        yield 'Alice: How are you doing today?\n';
        yield 'Bob: Pretty well, thanks.\n';
        yield 'Alice: That is great to hear.\n';
        yield 'Bob: Yeah, not bad at all.\n';
      },
    };

    // Mock storage
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        Promise.resolve({
          id,
          firstName: id === 'npc-1' ? 'Alice' : 'Bob',
          lastName: id === 'npc-1' ? 'Smith' : 'Jones',
          worldId: 'world-1',
          personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.3 },
          occupation: 'Worker',
          relationships: {},
        }),
      ),
      getWorld: vi.fn().mockResolvedValue({
        id: 'world-1',
        name: 'Test Town',
        userId: 'user-1',
      }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([]),
    };

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: mockProvider as any,
      storageOverride: mockStorage as any,
      topic: 'daily_greeting',
    });

    expect(result.exchanges.length).toBeGreaterThanOrEqual(2);
    expect(result.exchanges[0].speakerName).toContain('Alice');
    expect(result.topic).toBe('daily_greeting');
    expect(result.relationshipDelta).toBeDefined();
  });
});
