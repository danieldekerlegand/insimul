import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AssessmentConversationController,
  type ConversationCallbacks,
  type ConversationControllerConfig,
} from '../assessment/AssessmentConversationController';
import {
  buildAssessmentSystemPrompt,
  parseAssessmentEvalBlock,
} from '../assessment/assessment-prompt-utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<ConversationControllerConfig> = {}): ConversationControllerConfig {
  return {
    targetLanguage: 'es',
    characterProfile: { name: 'María', role: 'shopkeeper' },
    durationSeconds: 480,
    maxDurationSeconds: 600,
    ...overrides,
  };
}

function evalBlock(scores: { v: number; g: number; f: number; p: number; c: number }): string {
  return [
    '**ASSESSMENT_EVAL**',
    `vocab: ${scores.v}`,
    `grammar: ${scores.g}`,
    `fluency: ${scores.f}`,
    `pronunciation: ${scores.p}`,
    `comprehension: ${scores.c}`,
    '**END_EVAL**',
  ].join('\n');
}

function npcReply(text: string, scores: { v: number; g: number; f: number; p: number; c: number }): string {
  return `${text}\n\n${evalBlock(scores)}`;
}

const GOOD_SCORES = { v: 4, g: 4, f: 4, p: 4, c: 4 }; // avg 4.0 > 3.5 threshold
const STRUGGLE_SCORES = { v: 1, g: 1, f: 2, p: 1, c: 1 }; // avg 1.2 < 2.0 threshold
const NEUTRAL_SCORES = { v: 3, g: 3, f: 3, p: 3, c: 3 }; // avg 3.0 — between thresholds

// ─── Tests: parseAssessmentEvalBlock ─────────────────────────────────────────

describe('parseAssessmentEvalBlock', () => {
  it('parses a valid EVAL block', () => {
    const raw = `Hola, ¿cómo estás?\n\n${evalBlock({ v: 3, g: 4, f: 2, p: 5, c: 3 })}`;
    const { dimensions, cleanedResponse } = parseAssessmentEvalBlock(raw);
    expect(dimensions).toEqual({ vocab: 3, grammar: 4, fluency: 2, pronunciation: 5, comprehension: 3 });
    expect(cleanedResponse).toBe('Hola, ¿cómo estás?');
  });

  it('returns null dimensions if no EVAL block found', () => {
    const { dimensions, cleanedResponse } = parseAssessmentEvalBlock('Just a normal reply.');
    expect(dimensions).toBeNull();
    expect(cleanedResponse).toBe('Just a normal reply.');
  });

  it('clamps scores to 1–5 range', () => {
    const block = '**ASSESSMENT_EVAL**\nvocab: 0\ngrammar: 9\nfluency: 3\npronunciation: 1\ncomprehension: 5\n**END_EVAL**';
    const { dimensions } = parseAssessmentEvalBlock(block);
    expect(dimensions).toEqual({ vocab: 1, grammar: 5, fluency: 3, pronunciation: 1, comprehension: 5 });
  });

  it('returns null dimensions if block is incomplete', () => {
    const block = '**ASSESSMENT_EVAL**\nvocab: 3\ngrammar: 4\n**END_EVAL**';
    const { dimensions } = parseAssessmentEvalBlock(block);
    expect(dimensions).toBeNull();
  });
});

// ─── Tests: buildAssessmentSystemPrompt ──────────────────────────────────────

describe('buildAssessmentSystemPrompt', () => {
  it('includes tier-specific guidelines', () => {
    const a1 = buildAssessmentSystemPrompt('A1', { name: 'Test' }, 'es');
    expect(a1).toContain('A1');
    expect(a1).toContain('basic, high-frequency');

    const b1 = buildAssessmentSystemPrompt('B1', { name: 'Test' }, 'es');
    expect(b1).toContain('B1');
    expect(b1).toContain('idiomatic');
  });

  it('includes character profile and language', () => {
    const prompt = buildAssessmentSystemPrompt('A2', { name: 'Carlos', role: 'tour guide', personality: 'cheerful' }, 'fr');
    expect(prompt).toContain('Carlos');
    expect(prompt).toContain('tour guide');
    expect(prompt).toContain('cheerful');
    expect(prompt).toContain('fr');
  });

  it('includes EVAL block instructions', () => {
    const prompt = buildAssessmentSystemPrompt('A1', { name: 'Test' }, 'es');
    expect(prompt).toContain('ASSESSMENT_EVAL');
    expect(prompt).toContain('END_EVAL');
    expect(prompt).toContain('vocab');
    expect(prompt).toContain('grammar');
  });
});

// ─── Tests: AssessmentConversationController ─────────────────────────────────

describe('AssessmentConversationController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle and transitions to active', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    expect(ctrl.status).toBe('idle');
    ctrl.start();
    expect(ctrl.status).toBe('active');
  });

  it('returns a system prompt on start', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    const prompt = ctrl.start();
    expect(prompt).toContain('María');
    expect(prompt).toContain('shopkeeper');
    expect(prompt).toContain('es');
    expect(prompt).toContain('A1');
  });

  it('throws if started twice', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    ctrl.start();
    expect(() => ctrl.start()).toThrow('Cannot start');
  });

  it('records player messages in transcript', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    ctrl.start();
    ctrl.addPlayerMessage('Hola, me llamo Juan.');
    expect(ctrl.transcript).toHaveLength(1);
    expect(ctrl.transcript[0].role).toBe('player');
    expect(ctrl.transcript[0].text).toBe('Hola, me llamo Juan.');
  });

  it('computes exchange metrics for player messages', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    ctrl.start();
    const metrics = ctrl.addPlayerMessage('Hola, me llamo Juan. Soy de los Estados Unidos.');
    expect(metrics.ttr).toBeGreaterThan(0);
    expect(metrics.mlu).toBeGreaterThan(0);
    expect(typeof metrics.repairs).toBe('number');
    expect(typeof metrics.codeSwitchCount).toBe('number');
  });

  it('parses NPC responses and stores cleaned text', () => {
    const ctrl = new AssessmentConversationController(makeConfig());
    ctrl.start();
    ctrl.addPlayerMessage('Hola');
    const { cleanedResponse, dimensions } = ctrl.addNpcResponse(
      npcReply('¡Bienvenido! ¿De dónde eres?', GOOD_SCORES),
    );
    expect(cleanedResponse).toBe('¡Bienvenido! ¿De dónde eres?');
    expect(dimensions).toEqual({ vocab: 4, grammar: 4, fluency: 4, pronunciation: 4, comprehension: 4 });
    expect(ctrl.transcript).toHaveLength(2);
    expect(ctrl.exchangeCount).toBe(1);
  });

  describe('tier tracking', () => {
    it('starts at A1 by default', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      expect(ctrl.currentTier).toBe('A1');
    });

    it('starts at custom tier', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ startingTier: 'A2' }));
      expect(ctrl.currentTier).toBe('A2');
    });

    it('advances tier after 3 consecutive good exchanges', () => {
      const onTierChange = vi.fn();
      const ctrl = new AssessmentConversationController(makeConfig(), { onTierChange });
      ctrl.start();

      for (let i = 0; i < 3; i++) {
        ctrl.addPlayerMessage('Buenas respuestas aquí.');
        ctrl.addNpcResponse(npcReply('Muy bien.', GOOD_SCORES));
      }

      expect(ctrl.currentTier).toBe('A2');
      expect(onTierChange).toHaveBeenCalledTimes(1);
      expect(onTierChange).toHaveBeenCalledWith(expect.objectContaining({
        previous: 'A1',
        current: 'A2',
        direction: 'up',
      }));
    });

    it('advances from A2 to B1 with 3 more good exchanges', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ startingTier: 'A2' }));
      ctrl.start();

      for (let i = 0; i < 3; i++) {
        ctrl.addPlayerMessage('Excelente.');
        ctrl.addNpcResponse(npcReply('Bien.', GOOD_SCORES));
      }

      expect(ctrl.currentTier).toBe('B1');
    });

    it('does not advance past B1', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ startingTier: 'B1' }));
      ctrl.start();

      for (let i = 0; i < 6; i++) {
        ctrl.addPlayerMessage('Perfecto.');
        ctrl.addNpcResponse(npcReply('Excelente.', GOOD_SCORES));
      }

      expect(ctrl.currentTier).toBe('B1');
    });

    it('drops tier on struggle', () => {
      const onTierChange = vi.fn();
      const ctrl = new AssessmentConversationController(makeConfig({ startingTier: 'A2' }), { onTierChange });
      ctrl.start();

      ctrl.addPlayerMessage('Um... the... yo no sé...');
      ctrl.addNpcResponse(npcReply('¿Puedes repetir?', STRUGGLE_SCORES));

      expect(ctrl.currentTier).toBe('A1');
      expect(onTierChange).toHaveBeenCalledWith(expect.objectContaining({
        previous: 'A2',
        current: 'A1',
        direction: 'down',
      }));
    });

    it('does not drop below A1', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ startingTier: 'A1' }));
      ctrl.start();

      ctrl.addPlayerMessage('I dont know');
      ctrl.addNpcResponse(npcReply('...', STRUGGLE_SCORES));

      expect(ctrl.currentTier).toBe('A1');
    });

    it('neutral exchanges do not reset consecutive good counter', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      // 2 good
      for (let i = 0; i < 2; i++) {
        ctrl.addPlayerMessage('Bueno.');
        ctrl.addNpcResponse(npcReply('Sí.', GOOD_SCORES));
      }
      // 1 neutral
      ctrl.addPlayerMessage('Regular.');
      ctrl.addNpcResponse(npcReply('Ok.', NEUTRAL_SCORES));
      // 1 more good — should advance (2 + 1 = 3)
      ctrl.addPlayerMessage('Muy bien.');
      ctrl.addNpcResponse(npcReply('Genial.', GOOD_SCORES));

      expect(ctrl.currentTier).toBe('A2');
    });

    it('struggle resets consecutive good counter', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      // 2 good
      for (let i = 0; i < 2; i++) {
        ctrl.addPlayerMessage('Bueno.');
        ctrl.addNpcResponse(npcReply('Sí.', GOOD_SCORES));
      }
      // 1 struggle resets
      ctrl.addPlayerMessage('Uh...');
      ctrl.addNpcResponse(npcReply('...', STRUGGLE_SCORES));
      // 2 more good — not enough for advance (need 3 consecutive after reset)
      for (let i = 0; i < 2; i++) {
        ctrl.addPlayerMessage('Bueno.');
        ctrl.addNpcResponse(npcReply('Sí.', GOOD_SCORES));
      }

      expect(ctrl.currentTier).toBe('A1');
    });

    it('updates system prompt on tier change', () => {
      const onSystemPromptUpdate = vi.fn();
      const ctrl = new AssessmentConversationController(makeConfig(), { onSystemPromptUpdate });
      ctrl.start();

      // First call is from start()
      expect(onSystemPromptUpdate).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 3; i++) {
        ctrl.addPlayerMessage('Bien.');
        ctrl.addNpcResponse(npcReply('Ok.', GOOD_SCORES));
      }

      // Should have updated with new tier prompt
      expect(onSystemPromptUpdate).toHaveBeenCalledTimes(2);
      const lastPrompt = onSystemPromptUpdate.mock.calls[1][0];
      expect(lastPrompt).toContain('A2');
    });
  });

  describe('timer', () => {
    it('times out at maxDurationSeconds', () => {
      const onComplete = vi.fn();
      const ctrl = new AssessmentConversationController(
        makeConfig({ maxDurationSeconds: 10 }),
        { onComplete },
      );
      ctrl.start();
      vi.advanceTimersByTime(10_000);

      expect(ctrl.status).toBe('timed_out');
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete.mock.calls[0][0].transcript).toEqual([]);
    });

    it('fires time warnings', () => {
      const onTimeWarning = vi.fn();
      const ctrl = new AssessmentConversationController(
        makeConfig({ maxDurationSeconds: 300, timeWarnings: [60, 30] }),
        { onTimeWarning },
      );
      ctrl.start();

      // At 240s (300-60), first warning fires
      vi.advanceTimersByTime(240_000);
      expect(onTimeWarning).toHaveBeenCalledWith(60);

      // At 270s (300-30), second warning fires
      vi.advanceTimersByTime(30_000);
      expect(onTimeWarning).toHaveBeenCalledWith(30);

      expect(onTimeWarning).toHaveBeenCalledTimes(2);
    });

    it('does not fire warnings after completion', () => {
      const onTimeWarning = vi.fn();
      const ctrl = new AssessmentConversationController(
        makeConfig({ maxDurationSeconds: 300, timeWarnings: [60] }),
        { onTimeWarning },
      );
      ctrl.start();
      ctrl.complete();
      vi.advanceTimersByTime(300_000);
      expect(onTimeWarning).not.toHaveBeenCalled();
    });
  });

  describe('pause/resume', () => {
    it('can pause and resume', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      ctrl.pause();
      expect(ctrl.status).toBe('paused');
      ctrl.resume();
      expect(ctrl.status).toBe('active');
    });

    it('throws when adding messages while paused', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      ctrl.pause();
      expect(() => ctrl.addPlayerMessage('hello')).toThrow('not active');
    });
  });

  describe('completion', () => {
    it('returns a complete ConversationResult', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      ctrl.addPlayerMessage('Hola, soy Juan.');
      ctrl.addNpcResponse(npcReply('¡Hola Juan!', GOOD_SCORES));
      ctrl.addPlayerMessage('¿Dónde está la biblioteca?');
      ctrl.addNpcResponse(npcReply('Está en la calle principal.', GOOD_SCORES));

      const result = ctrl.complete();

      expect(result.transcript).toHaveLength(4);
      expect(result.exchangeCount).toBe(2);
      expect(result.finalTier).toBe('A1'); // only 2 good, need 3
      expect(result.tierHistory).toEqual(['A1']);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.dimensionAverages.vocab).toBe(4);
      expect(result.aggregateMetrics.ttr).toBeGreaterThan(0);
    });

    it('includes tier history across changes', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      for (let i = 0; i < 3; i++) {
        ctrl.addPlayerMessage('Bien.');
        ctrl.addNpcResponse(npcReply('Ok.', GOOD_SCORES));
      }

      const result = ctrl.complete();
      expect(result.tierHistory).toEqual(['A1', 'A2']);
      expect(result.finalTier).toBe('A2');
    });

    it('throws if already completed', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      ctrl.complete();
      expect(() => ctrl.complete()).toThrow('Cannot complete');
    });
  });

  describe('aggregate metrics', () => {
    it('computes averages across exchanges', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      ctrl.addPlayerMessage('Una frase simple aquí.');
      ctrl.addNpcResponse(npcReply('Ok.', GOOD_SCORES));
      ctrl.addPlayerMessage('Otra frase más larga con más palabras diferentes.');
      ctrl.addNpcResponse(npcReply('Bien.', GOOD_SCORES));

      const metrics = ctrl.getAggregateMetrics();
      expect(metrics.ttr).toBeGreaterThan(0);
      expect(metrics.mlu).toBeGreaterThan(0);
      expect(typeof metrics.repairs).toBe('number');
      expect(typeof metrics.codeSwitchCount).toBe('number');
    });

    it('returns empty metrics with no player messages', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      const metrics = ctrl.getAggregateMetrics();
      expect(metrics).toEqual({});
    });
  });

  describe('dimension averages', () => {
    it('averages across multiple NPC evaluations', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();

      ctrl.addPlayerMessage('A');
      ctrl.addNpcResponse(npcReply('B', { v: 2, g: 4, f: 3, p: 2, c: 4 }));
      ctrl.addPlayerMessage('C');
      ctrl.addNpcResponse(npcReply('D', { v: 4, g: 2, f: 3, p: 4, c: 2 }));

      const avgs = ctrl.getDimensionAverages();
      expect(avgs.vocab).toBe(3);
      expect(avgs.grammar).toBe(3);
      expect(avgs.fluency).toBe(3);
      expect(avgs.pronunciation).toBe(3);
      expect(avgs.comprehension).toBe(3);
    });

    it('returns zeros with no evaluations', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      const avgs = ctrl.getDimensionAverages();
      expect(avgs).toEqual({ vocab: 0, grammar: 0, fluency: 0, pronunciation: 0, comprehension: 0 });
    });
  });

  describe('repair detection', () => {
    it('counts self-repair phrases', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      const metrics = ctrl.addPlayerMessage('Yo quiero, I mean, yo necesito el libro. Sorry, quiero decir, actually the other one.');
      expect(metrics.repairs).toBeGreaterThanOrEqual(3);
    });
  });

  describe('code-switch detection', () => {
    it('detects switches between English and Spanish', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ nativeLanguage: 'en', targetLanguage: 'es' }));
      ctrl.start();
      const metrics = ctrl.addPlayerMessage('yo soy the student');
      expect(metrics.codeSwitchCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('NPC response without EVAL block', () => {
    it('handles missing EVAL block gracefully', () => {
      const ctrl = new AssessmentConversationController(makeConfig());
      ctrl.start();
      ctrl.addPlayerMessage('Hola');
      const { cleanedResponse, dimensions } = ctrl.addNpcResponse('Just a normal response without eval.');
      expect(cleanedResponse).toBe('Just a normal response without eval.');
      expect(dimensions).toBeNull();
      expect(ctrl.exchangeCount).toBe(0); // no exchange counted
    });
  });

  describe('elapsed and remaining time', () => {
    it('tracks elapsed time', () => {
      const ctrl = new AssessmentConversationController(makeConfig({ maxDurationSeconds: 600 }));
      expect(ctrl.remainingMs).toBe(600_000);
      ctrl.start();
      vi.advanceTimersByTime(5000);
      expect(ctrl.elapsedMs).toBe(5000);
      expect(ctrl.remainingMs).toBe(595_000);
    });
  });
});
