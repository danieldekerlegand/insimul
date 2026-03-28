/**
 * Tests for LocalAIClient and LocalNpcConversation
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/LocalNpcConversation.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalAIClient } from '../LocalAIClient';
import {
  buildNpcConversationPrompt,
  parseNpcConversationResponse,
  generateLocalNpcConversation,
} from '../../logic/LocalNpcConversation';

// ── Test data ───────────────────────────────────────────────────────────

function makeNpc(overrides?: Record<string, any>) {
  return {
    id: 'npc-1',
    firstName: 'Alice',
    lastName: 'Smith',
    occupation: 'baker',
    personality: {
      openness: 0.7,
      conscientiousness: 0.5,
      extroversion: 0.6,
      agreeableness: 0.8,
      neuroticism: 0.2,
    },
    relationships: {},
    ...overrides,
  };
}

const npc1 = makeNpc();
const npc2 = makeNpc({
  id: 'npc-2',
  firstName: 'Bob',
  lastName: 'Jones',
  occupation: 'blacksmith',
  personality: {
    openness: 0.3,
    conscientiousness: 0.7,
    extroversion: 0.4,
    agreeableness: 0.5,
    neuroticism: 0.6,
  },
});

// ── LocalAIClient ───────────────────────────────────────────────────────

describe('LocalAIClient', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    // Restore window
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it('isAvailable returns false when not in Electron', () => {
    // In vitest, window exists but has no electronAPI
    expect(LocalAIClient.isAvailable()).toBe(false);
  });

  it('isAvailable returns true when electronAPI is present with aiAvailable', () => {
    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: vi.fn().mockResolvedValue('response'),
      },
    };
    expect(LocalAIClient.isAvailable()).toBe(true);
  });

  it('isAvailable returns false when aiAvailable is false', () => {
    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: false,
        aiGenerate: vi.fn(),
      },
    };
    expect(LocalAIClient.isAvailable()).toBe(false);
  });

  it('generate calls electronAPI.aiGenerate', async () => {
    const mockGenerate = vi.fn().mockResolvedValue('Hello world');
    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await LocalAIClient.generate('prompt', 'system', { temperature: 0.5 });
    expect(result).toBe('Hello world');
    expect(mockGenerate).toHaveBeenCalledWith('prompt', 'system', { temperature: 0.5 });
  });

  it('generate throws when not available', async () => {
    (globalThis as any).window = { electronAPI: {} };
    await expect(LocalAIClient.generate('test')).rejects.toThrow('Local AI is not available');
  });

  it('generateStream falls back to generate when aiGenerateStream missing', async () => {
    const mockGenerate = vi.fn().mockResolvedValue('full response');
    const onToken = vi.fn();
    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await LocalAIClient.generateStream('prompt', 'system', {}, onToken);
    expect(result).toBe('full response');
    expect(onToken).toHaveBeenCalledWith('full response');
  });
});

// ── buildNpcConversationPrompt ──────────────────────────────────────────

describe('buildNpcConversationPrompt', () => {
  it('includes both NPC names and occupations', () => {
    const prompt = buildNpcConversationPrompt(npc1, npc2);
    expect(prompt).toContain('Alice Smith (baker)');
    expect(prompt).toContain('Bob Jones (blacksmith)');
  });

  it('includes personality traits', () => {
    const prompt = buildNpcConversationPrompt(npc1, npc2);
    expect(prompt).toContain('openness=0.7');
    expect(prompt).toContain('extroversion=0.4');
  });

  it('includes topic when provided', () => {
    const prompt = buildNpcConversationPrompt(npc1, npc2, 'weather');
    expect(prompt).toContain('Topic: weather');
  });

  it('uses relationship label based on strength', () => {
    const npc1WithRel = makeNpc({
      relationships: { 'npc-2': { strength: 0.7 } },
    });
    const prompt = buildNpcConversationPrompt(npc1WithRel, npc2);
    expect(prompt).toContain('close friends');
  });

  it('labels negative relationships as rivals', () => {
    const npc1WithRel = makeNpc({
      relationships: { 'npc-2': { strength: -0.5 } },
    });
    const prompt = buildNpcConversationPrompt(npc1WithRel, npc2);
    expect(prompt).toContain('rivals');
  });
});

// ── parseNpcConversationResponse ────────────────────────────────────────

describe('parseNpcConversationResponse', () => {
  it('parses alternating speaker lines', () => {
    const text = `Alice: Hello there, how are you?
Bob: I'm doing well, thanks for asking.
Alice: That's great to hear!
Bob: Indeed it is.`;

    const exchanges = parseNpcConversationResponse(text, npc1, npc2);
    expect(exchanges).toHaveLength(4);
    expect(exchanges[0].speakerId).toBe('npc-1');
    expect(exchanges[0].speakerName).toBe('Alice Smith');
    expect(exchanges[0].text).toBe('Hello there, how are you?');
    expect(exchanges[1].speakerId).toBe('npc-2');
    expect(exchanges[1].speakerName).toBe('Bob Jones');
  });

  it('strips surrounding quotes', () => {
    const text = 'Alice: "Good morning!"';
    const exchanges = parseNpcConversationResponse(text, npc1, npc2);
    expect(exchanges[0].text).toBe('Good morning!');
  });

  it('skips lines without recognized speakers', () => {
    const text = `Alice: Hello!
*waves hand*
Bob: Hi there!
[narrator: they smiled]`;

    const exchanges = parseNpcConversationResponse(text, npc1, npc2);
    expect(exchanges).toHaveLength(2);
  });

  it('skips empty dialogue lines', () => {
    const text = `Alice:
Bob: Something meaningful.`;

    const exchanges = parseNpcConversationResponse(text, npc1, npc2);
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].speakerId).toBe('npc-2');
  });

  it('returns empty array for garbage input', () => {
    const exchanges = parseNpcConversationResponse('random gibberish', npc1, npc2);
    expect(exchanges).toHaveLength(0);
  });
});

// ── generateLocalNpcConversation ────────────────────────────────────────

describe('generateLocalNpcConversation', () => {
  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('returns null when local AI is not available', async () => {
    (globalThis as any).window = {};
    const result = await generateLocalNpcConversation(npc1, npc2);
    expect(result).toBeNull();
  });

  it('returns ConversationResult when AI generates valid dialogue', async () => {
    const mockGenerate = vi.fn().mockResolvedValue(
      `Alice: Beautiful day today, isn't it?
Bob: It sure is. Perfect for working at the forge.
Alice: I just finished a fresh batch of bread. Want some?
Bob: That sounds wonderful, thank you!`
    );

    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await generateLocalNpcConversation(npc1, npc2, 'food');
    expect(result).not.toBeNull();
    expect(result!.exchanges).toHaveLength(4);
    expect(result!.topic).toBe('food');
    expect(result!.relationshipDelta.friendshipChange).toBeGreaterThan(0);
    expect(result!.languageUsed).toBe('English');
  });

  it('returns null when AI generates less than 2 exchanges', async () => {
    const mockGenerate = vi.fn().mockResolvedValue('Alice: Just one line.');

    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await generateLocalNpcConversation(npc1, npc2);
    expect(result).toBeNull();
  });

  it('returns null when AI call fails', async () => {
    const mockGenerate = vi.fn().mockRejectedValue(new Error('Model crashed'));

    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await generateLocalNpcConversation(npc1, npc2);
    expect(result).toBeNull();
  });

  it('calculates romance spark for romance topic', async () => {
    const mockGenerate = vi.fn().mockResolvedValue(
      `Alice: I've been thinking about you lately.
Bob: Really? I've been thinking about you too.`
    );

    (globalThis as any).window = {
      electronAPI: {
        aiAvailable: true,
        aiGenerate: mockGenerate,
      },
    };

    const result = await generateLocalNpcConversation(npc1, npc2, 'romance');
    expect(result).not.toBeNull();
    expect(result!.relationshipDelta.romanceSpark).toBeGreaterThan(0);
  });
});
