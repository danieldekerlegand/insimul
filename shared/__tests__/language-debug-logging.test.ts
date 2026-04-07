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

describe('Language Debug Logging (US-015)', () => {
  let logEvalScores: any;
  let logGrammarFeedback: any;
  let logVocabBatch: any;
  let logCEFRCheck: any;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    _emittedEvents.length = 0;
    _debugEnabled = false;

    vi.resetModules();

    consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const mod = await import('../game-engine/rendering/LanguageDebugLogger');
    logEvalScores = mod.logEvalScores;
    logGrammarFeedback = mod.logGrammarFeedback;
    logVocabBatch = mod.logVocabBatch;
    logCEFRCheck = mod.logCEFRCheck;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ── Test 1: EVAL scores logged to Language tab with correct dimension averages ──

  it('logs EVAL scores to Language tab with correct dimension averages', () => {
    _debugEnabled = true;

    logEvalScores({
      scores: { vocabulary: 4, grammar: 3, fluency: 4, comprehension: 5, taskCompletion: 4 },
      cefrLevel: 'A2',
      advancementProgress: 0.67,
    });

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];

    // Emitted with correct category and tag
    expect(event.category).toBe('language');
    expect(event.tag).toBe('EVAL');
    expect(event.source).toBe('client');

    // Summary contains dimension scores and average
    expect(event.summary).toContain('vocab:4');
    expect(event.summary).toContain('gram:3');
    expect(event.summary).toContain('flu:4');
    expect(event.summary).toContain('comp:5');
    expect(event.summary).toContain('task:4');
    expect(event.summary).toContain('avg: 4.0');

    // Detail contains per-dimension breakdown
    expect(event.detail).toContain('Vocabulary:       4/5');
    expect(event.detail).toContain('Grammar:          3/5');
    expect(event.detail).toContain('CEFR Level: A2');
    expect(event.detail).toContain('67%');
  });

  // ── Test 2: EVAL scores with trends show trend arrows ──

  it('includes dimension trends in EVAL expanded detail', () => {
    _debugEnabled = true;

    logEvalScores({
      scores: { vocabulary: 4, grammar: 3, fluency: 4, comprehension: 5, taskCompletion: 4 },
      trends: {
        vocabulary: 'improving',
        grammar: 'declining',
        fluency: 'stable',
        comprehension: 'improving',
        taskCompletion: 'stable',
      },
      cefrLevel: 'B1',
      advancementProgress: 0.5,
    });

    const detail = _emittedEvents[0].detail;
    expect(detail).toContain('vocabulary: ↑ improving');
    expect(detail).toContain('grammar: ↓ declining');
    expect(detail).toContain('fluency: → stable');
  });

  // ── Test 3: No logging when debug is disabled ──

  it('does not log when debug is disabled', () => {
    _debugEnabled = false;

    logEvalScores({
      scores: { vocabulary: 4, grammar: 3, fluency: 4, comprehension: 5, taskCompletion: 4 },
      cefrLevel: 'A2',
      advancementProgress: 0.67,
    });

    logGrammarFeedback({
      status: 'corrected',
      errors: [{ pattern: 'verb conjugation', incorrect: 'je suis allé', corrected: 'je suis allée', explanation: 'gender agreement' }],
      errorCount: 1,
      timestamp: Date.now(),
    });

    logVocabBatch({
      newWords: [{ word: 'maison', translation: 'house', source: 'active_use' }],
      reinforcedWords: [],
      totalMastered: 5,
      totalVocabulary: 20,
    });

    logCEFRCheck({
      currentLevel: 'A2',
      result: { shouldAdvance: false, nextLevel: 'B1', progress: 0.5, metrics: { wordsProgress: 0.6, conversationsProgress: 0.4, textsProgress: 0.3 } },
      didAdvance: false,
    });

    expect(_emittedEvents).toHaveLength(0);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // ── Test 4: Grammar feedback logged with corrections ──

  it('logs grammar feedback with pattern names and correction text', () => {
    _debugEnabled = true;

    logGrammarFeedback({
      status: 'corrected',
      errors: [
        { pattern: 'verb conjugation', incorrect: 'je mangé', corrected: 'j\'ai mangé', explanation: 'passé composé requires auxiliary' },
        { pattern: 'article agreement', incorrect: 'le maison', corrected: 'la maison', explanation: 'feminine noun requires la' },
      ],
      errorCount: 2,
      timestamp: Date.now(),
    });

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];

    expect(event.category).toBe('language');
    expect(event.tag).toBe('Grammar');
    expect(event.summary).toContain('2 corrections');
    expect(event.summary).toContain('verb conjugation');
    expect(event.summary).toContain('article agreement');

    // Detail contains full correction text
    expect(event.detail).toContain('Incorrect: "je mangé"');
    expect(event.detail).toContain('Corrected: "j\'ai mangé"');
    expect(event.detail).toContain('passé composé requires auxiliary');
  });

  // ── Test 5: Vocab batch logged with source breakdown ──

  it('logs vocabulary batch with new words, sources, and mastery count', () => {
    _debugEnabled = true;

    logVocabBatch({
      newWords: [
        { word: 'bonjour', translation: 'hello', source: 'passive_hover' },
        { word: 'maison', translation: 'house', source: 'passive_hover' },
        { word: 'manger', translation: 'to eat', source: 'active_use' },
      ],
      reinforcedWords: ['merci', 'au revoir'],
      totalMastered: 12,
      totalVocabulary: 47,
    });

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];

    expect(event.category).toBe('language');
    expect(event.tag).toBe('Vocab');
    expect(event.summary).toContain('+3 words');
    expect(event.summary).toContain('2 passive_hover');
    expect(event.summary).toContain('1 active_use');
    expect(event.summary).toContain('12 total mastered');

    // Detail has word list
    expect(event.detail).toContain('bonjour → hello (passive_hover)');
    expect(event.detail).toContain('merci');
  });

  // ── Test 6: CEFR advancement shows "ADVANCED" with old and new levels ──

  it('logs CEFR advancement with ADVANCED and old/new levels', () => {
    _debugEnabled = true;

    logCEFRCheck({
      currentLevel: 'A2',
      result: {
        shouldAdvance: true,
        nextLevel: 'B1',
        progress: 1.0,
        metrics: { wordsProgress: 1.0, conversationsProgress: 1.0, textsProgress: 1.0 },
      },
      didAdvance: true,
      newLevel: 'B1',
    });

    expect(_emittedEvents).toHaveLength(1);
    const event = _emittedEvents[0];

    expect(event.category).toBe('language');
    expect(event.tag).toBe('CEFR');
    expect(event.summary).toContain('A2 -> B1 ADVANCED!');

    // Detail contains per-metric progress
    expect(event.detail).toContain('ADVANCED: A2 → B1');
    expect(event.detail).toContain('Words:');
    expect(event.detail).toContain('100.0%');
  });

  // ── Test 7: CEFR non-advancement shows progress percentage ──

  it('logs CEFR non-advancement with progress percentages', () => {
    _debugEnabled = true;

    logCEFRCheck({
      currentLevel: 'A2',
      result: {
        shouldAdvance: false,
        nextLevel: 'B1',
        progress: 0.67,
        metrics: { wordsProgress: 0.8, conversationsProgress: 0.6, textsProgress: 0.4 },
      },
      didAdvance: false,
    });

    const event = _emittedEvents[0];

    expect(event.summary).toContain('A2: 67% ready');
    expect(event.summary).toContain('words: 80%');
    expect(event.summary).toContain('convos: 60%');
    expect(event.summary).toContain('texts: 40%');
  });
});
