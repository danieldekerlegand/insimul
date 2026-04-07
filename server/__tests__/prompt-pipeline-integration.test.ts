/**
 * Integration tests verifying the full prompt pipeline (US-008).
 *
 * 1. Player-NPC via SSE with client systemPrompt — LLM receives it
 * 2. Player-NPC via SSE without systemPrompt — server builds prompt with LANGUAGE LEARNING MODE
 * 3. NPC-NPC conversation — prompt contains target language directive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mocks ────────────────────────────────────────────────────

const mockSessions = new Map<string, any>();
vi.mock('../services/conversation/grpc-server.js', () => ({
  getSession: (id: string) => mockSessions.get(id),
  createSession: (sessionId: string, characterId: string, worldId: string, playerId: string, languageCode: string) => {
    const session = {
      sessionId, characterId, worldId, playerId, languageCode,
      conversationContext: null,
      history: [],
      active: true,
      lastActivity: Date.now(),
    };
    mockSessions.set(sessionId, session);
    return session;
  },
  endSession: (id: string) => mockSessions.delete(id),
}));

const mockBuildContext = vi.fn();
vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: (...args: any[]) => mockBuildContext(...args),
}));

let capturedContext: any = null;
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: () => ({
    name: 'mock',
    streamCompletion: (_text: string, ctx: any) => {
      capturedContext = ctx;
      return (async function* () { yield 'Bonjour!'; })();
    },
  }),
}));

vi.mock('../services/conversation/tts/tts-provider.js', () => ({
  getTTSProvider: () => { throw new Error('no TTS'); },
  splitAtSentenceBoundaries: (s: string) => [s],
  assignVoiceProfile: () => ({ name: 'default', languageCode: 'en-US' }),
}));
vi.mock('../services/conversation/tts/google-tts-provider.js', () => ({}));
vi.mock('../services/conversation/viseme/viseme-generator.js', () => ({
  createVisemeGenerator: () => null,
}));
vi.mock('../services/conversation/conversation-metrics.js', () => ({
  PipelineTimer: class { stop() {} },
  getConversationMetrics: () => ({
    isDegraded: false,
    getStageStats: () => null,
    getSnapshot: () => ({}),
  }),
}));
vi.mock('../services/conversation/quest-trigger-analyzer.js', () => ({
  analyzeConversation: () => ({ triggers: [], markerContent: '' }),
}));

// ── Helpers ─────────────────────────────────────────────────────────

async function simulateStreamRequest(body: Record<string, any>) {
  const { registerConversationRoutes } = await import('../services/conversation/http-bridge');
  const handlers: Record<string, Function> = {};
  const fakeApp = {
    post: (path: string, handler: Function) => { handlers[path] = handler; },
    get: (path: string, handler: Function) => { handlers[path] = handler; },
  };
  registerConversationRoutes(fakeApp as any);

  const sseEvents: any[] = [];
  const fakeRes = {
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn((data: string) => {
      if (data.startsWith('data: ') && !data.includes('[DONE]')) {
        try { sseEvents.push(JSON.parse(data.replace('data: ', '').trim())); } catch {}
      }
    }),
    end: vi.fn(),
    writableEnded: false,
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  const handler = handlers['/api/conversation/stream'];
  expect(handler).toBeDefined();
  await handler({ body }, fakeRes);

  return { sseEvents, capturedContext, fakeRes };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('Prompt Pipeline Integration (US-008)', () => {
  beforeEach(() => {
    mockSessions.clear();
    capturedContext = null;
    mockBuildContext.mockReset();
  });

  // ── Test 1: Client systemPrompt reaches LLM ─────────────────────

  it('player-NPC chat with client systemPrompt — LLM receives it with language directives', async () => {
    mockBuildContext.mockResolvedValue({
      conversationContext: {
        systemPrompt: 'Server-built fallback',
        characterName: 'Pierre',
        worldContext: 'French Village',
        characterGender: 'male',
      },
    });

    const clientPrompt = [
      'You are Pierre, a baker in a French village.',
      'LANGUAGE LEARNING MODE: Target Language: French, CEFR Level: A1',
      'LANGUAGE MODE — SIMPLIFIED: Use 5-7 word sentences, high-frequency vocabulary only.',
      'CRITICAL LANGUAGE RULE: Your ENTIRE response must be in French. Do NOT use English.',
    ].join('\n');

    const result = await simulateStreamRequest({
      sessionId: 'int-1',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour!',
      languageCode: 'fr',
      systemPrompt: clientPrompt,
    });

    expect(result.capturedContext).toBeDefined();
    expect(result.capturedContext.systemPrompt).toBe(clientPrompt);
    expect(result.capturedContext.systemPrompt).toContain('LANGUAGE LEARNING MODE');
    expect(result.capturedContext.systemPrompt).toContain('CRITICAL LANGUAGE RULE');
    // Server-built prompt should NOT have been used
    expect(result.capturedContext.systemPrompt).not.toContain('Server-built fallback');
  });

  // ── Test 2: Server builds prompt with LANGUAGE LEARNING MODE ────

  it('player-NPC chat without systemPrompt — server builds prompt with LANGUAGE LEARNING MODE', async () => {
    // Simulate buildContext returning a prompt with CEFR directives (as US-003 wired)
    const serverPrompt = [
      'You are Pierre, a baker in a French village.',
      '## LANGUAGE LEARNING MODE',
      'Target Language: French',
      'CEFR Level: A1',
      'LANGUAGE MODE — SIMPLIFIED: Use 5-7 word sentences.',
      'Vocabulary Frequency Constraint: Use only words ranked 1-200.',
      'CRITICAL LANGUAGE RULE: Your ENTIRE response must be in French.',
    ].join('\n');

    mockBuildContext.mockResolvedValue({
      conversationContext: {
        systemPrompt: serverPrompt,
        characterName: 'Pierre',
        worldContext: 'French Village',
        characterGender: 'male',
      },
    });

    const result = await simulateStreamRequest({
      sessionId: 'int-2',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Hello!',
      languageCode: 'fr',
      // No systemPrompt — server should build its own
    });

    // buildContext should have been called
    expect(mockBuildContext).toHaveBeenCalled();

    // LLM should receive the server-built prompt with language directives
    expect(result.capturedContext).toBeDefined();
    expect(result.capturedContext.systemPrompt).toContain('LANGUAGE LEARNING MODE');
    expect(result.capturedContext.systemPrompt).toContain('CEFR Level: A1');
    expect(result.capturedContext.systemPrompt).toContain('CRITICAL LANGUAGE RULE');
    expect(result.capturedContext.systemPrompt).toContain('SIMPLIFIED');
  });

  // ── Test 3: NPC-NPC prompt contains target language directive ───

  it('NPC-NPC conversation includes target language directive when world has target language', async () => {
    const { buildNpcNpcSystemPrompt } = await import('../services/conversation/npc-conversation-engine');

    const npc1 = {
      id: 'npc-1', firstName: 'Jean', lastName: 'Dupont', occupation: 'baker',
      worldId: 'world-1', personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    } as any;
    const npc2 = {
      id: 'npc-2', firstName: 'Marie', lastName: 'Leclerc', occupation: 'teacher',
      worldId: 'world-1', personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    } as any;
    const personality = { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 };

    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, personality, personality,
      'daily routine', 'French Village', ['French', 'English'],
      4, 0.5, undefined,
      'French', // target language
    );

    expect(prompt).toContain('LANGUAGE: This conversation must be entirely in French');
    expect(prompt).toContain('Both NPCs are native speakers');
    expect(prompt).toContain('no English');
    // Should NOT have the vague generic instruction
    expect(prompt).not.toContain('Use this language naturally in dialogue');
  });

  it('NPC-NPC conversation has no language directive when world has no target language', async () => {
    const { buildNpcNpcSystemPrompt } = await import('../services/conversation/npc-conversation-engine');

    const npc1 = {
      id: 'npc-1', firstName: 'John', lastName: 'Smith', occupation: 'farmer',
      worldId: 'world-1',
    } as any;
    const npc2 = {
      id: 'npc-2', firstName: 'Jane', lastName: 'Doe', occupation: 'teacher',
      worldId: 'world-1',
    } as any;
    const personality = { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 };

    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, personality, personality,
      'town news', 'Anytown', ['English'],
      4, 0.5, undefined,
      null, // no target language
    );

    expect(prompt).not.toContain('LANGUAGE: This conversation must be entirely in');
    expect(prompt).toContain('They speak English');
  });
});
