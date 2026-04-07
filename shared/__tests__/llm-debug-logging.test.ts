import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock isDebugLabelsEnabled ──────────────────────────────────────────────

let _debugEnabled = false;
vi.mock('../game-engine/rendering/DebugLabelUtils', () => ({
  isDebugLabelsEnabled: () => _debugEnabled,
}));

// ── Capture DebugEventBus.emit() calls ────────────────────────────────────

const _emittedEvents: any[] = [];
vi.mock('../game-engine/debug-event-bus', () => ({
  getDebugEventBus: () => ({
    emit: (event: any) => { _emittedEvents.push(event); },
  }),
}));

describe('LLM Debug Logging (US-014)', () => {
  let logLLMChatExchange: any;
  let logLLMError: any;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    _emittedEvents.length = 0;
    _debugEnabled = false;

    vi.resetModules();

    consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const mod = await import('../game-engine/rendering/LLMDebugLogger');
    logLLMChatExchange = mod.logLLMChatExchange;
    logLLMError = mod.logLLMError;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ── Test 1: Verify LLM tab entry with NPC name, token estimate, and latency ──

  it('logs chat exchange to LLM tab with NPC name, token estimate, and latency', () => {
    _debugEnabled = true;

    logLLMChatExchange({
      npcName: 'Marie Dupont',
      systemPrompt: 'You are Marie, a friendly baker in a French village. CEFR: A2. Use language mode: simplified. Use only words ranked 1-500 in frequency.',
      userMessage: 'Bonjour Marie, comment allez-vous?',
      fullResponse: 'Bonjour! Je vais bien, merci. Vous voulez du pain frais?',
      timeToFirstChunk: 450,
      totalTimeMs: 1200,
    });

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];

    // Emitted with correct category and tag
    expect(event.category).toBe('llm');
    expect(event.tag).toBe('LLM');
    expect(event.source).toBe('client');
    expect(event.level).toBe('info');

    // Summary contains NPC name
    expect(event.summary).toContain('Marie Dupont');
    // Summary contains token estimate (response is 56 chars → ceil(56/4) = 14 tokens)
    expect(event.summary).toContain('est. 14 tok');
    // Summary contains total latency
    expect(event.summary).toContain('1.2s');

    // Detail contains TTFC
    expect(event.detail).toContain('TTFC 0.5s');
    // Detail contains user message
    expect(event.detail).toContain('Bonjour Marie, comment allez-vous?');
  });

  // ── Test 2: Response with GRAMMAR_FEEDBACK marker appears in expanded detail ──

  it('detects GRAMMAR_FEEDBACK marker in expanded detail', () => {
    _debugEnabled = true;

    const responseWithMarker =
      'Bonjour! Je suis contente de vous voir.\n' +
      '**GRAMMAR_FEEDBACK**\n' +
      'Correction: "Comment allez-vous" is formal.\n' +
      '**END_GRAMMAR**';

    logLLMChatExchange({
      npcName: 'Marie',
      systemPrompt: 'You are Marie.',
      userMessage: 'Hello',
      fullResponse: responseWithMarker,
      timeToFirstChunk: 300,
      totalTimeMs: 800,
    });

    expect(_emittedEvents).toHaveLength(1);
    const detail = _emittedEvents[0].detail;
    expect(detail).toContain('GRAMMAR_FEEDBACK');
    expect(detail).toContain('Parsed markers: GRAMMAR_FEEDBACK');
  });

  // ── Test 3: No logging when debug is disabled ──

  it('does not log when debug mode is off', () => {
    _debugEnabled = false;

    logLLMChatExchange({
      npcName: 'Marie',
      systemPrompt: 'You are Marie.',
      userMessage: 'Hello',
      fullResponse: 'Bonjour!',
      timeToFirstChunk: 100,
      totalTimeMs: 500,
    });

    expect(_emittedEvents).toHaveLength(0);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // ── Test 4: Unabridged console.debug contains full data ──

  it('logs unabridged data to console.debug', () => {
    _debugEnabled = true;

    logLLMChatExchange({
      npcName: 'Pierre',
      systemPrompt: 'You are Pierre, a fisherman.',
      userMessage: 'Where can I fish?',
      fullResponse: 'The river is good for fishing today!',
      timeToFirstChunk: 200,
      totalTimeMs: 600,
    });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const args = consoleSpy.mock.calls[0];
    expect(args[0]).toBe('[LLMDebug] chat exchange:');
    const payload = args[1];
    expect(payload.npc).toBe('Pierre');
    expect(payload.systemPrompt).toBe('You are Pierre, a fisherman.');
    expect(payload.userMessage).toBe('Where can I fish?');
    expect(payload.fullResponse).toBe('The river is good for fishing today!');
    expect(payload.latency.ttfcMs).toBe(200);
    expect(payload.latency.totalMs).toBe(600);
  });

  // ── Test 5: Detects system prompt directives (CEFR, language mode, frequency) ──

  it('detects directives in system prompt', () => {
    _debugEnabled = true;

    logLLMChatExchange({
      npcName: 'Luc',
      systemPrompt: 'You are Luc. CEFR: B1. Use language mode: natural. Use only words ranked 501-1500 in frequency. SCAFFOLDING directive active.',
      userMessage: 'Hello',
      fullResponse: 'Salut!',
      timeToFirstChunk: 100,
      totalTimeMs: 400,
    });

    const detail = _emittedEvents[0].detail;
    expect(detail).toContain('CEFR: B1');
    expect(detail).toContain('mode: natural');
    expect(detail).toContain('freq: 501-1500');
    expect(detail).toContain('scaffolding');
  });

  // ── Test 6: Multiple markers detected ──

  it('detects multiple response markers', () => {
    _debugEnabled = true;

    const multiMarkerResponse =
      'Hello!\n' +
      '**GRAMMAR_FEEDBACK**\ncorrection\n**END_GRAMMAR**\n' +
      '**VOCAB_HINTS**\nhints\n**END_VOCAB**\n' +
      '**EVAL**\nscores\n**END_EVAL**';

    logLLMChatExchange({
      npcName: 'Jean',
      systemPrompt: 'You are Jean.',
      userMessage: 'Bonjour',
      fullResponse: multiMarkerResponse,
      timeToFirstChunk: 150,
      totalTimeMs: 700,
    });

    const detail = _emittedEvents[0].detail;
    expect(detail).toContain('GRAMMAR_FEEDBACK');
    expect(detail).toContain('VOCAB_HINTS');
    expect(detail).toContain('EVAL');
  });

  // ── Test 7: Error logging ──

  it('logs errors to LLM tab with error category', () => {
    _debugEnabled = true;

    logLLMError('Marie', 'Bonjour', 'Connection timeout after 60s');

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];
    expect(event.category).toBe('llm');
    expect(event.level).toBe('error');
    expect(event.summary).toContain('Marie');
    expect(event.summary).toContain('Connection timeout');
    expect(event.detail).toContain('Connection timeout after 60s');
  });
});
