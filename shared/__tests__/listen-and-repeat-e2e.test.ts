/**
 * Listen-and-Repeat E2E Integration Tests
 *
 * Verifies the full pipeline:
 *   ListenAndRepeatController → BabylonGame callback → QuestCompletionEngine
 *
 * Tests that:
 *   1. Controller detects target-language phrases
 *   2. Controller scores pronunciation and emits events
 *   3. BabylonGame callback emits listen_and_repeat_passed to the event bus
 *   4. QuestCompletionEngine tracks and completes listen_and_repeat objectives
 *   5. Text fallback works when STT is unavailable
 *   6. Failed attempts do not advance quest progress
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ListenAndRepeatController,
  detectTargetLanguagePhrases,
  type RepeatAttemptResult,
} from '../game-engine/rendering/ListenAndRepeatController';
import type { ListenAndRepeatCallbacks } from '../game-engine/rendering/ListenAndRepeatController';
import type { ListenAndRepeatPhrase } from '../game-engine/logic/actions/ListenAndRepeatAction';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockCallbacks(
  sttResponse = 'Bonjour comment allez-vous',
): ListenAndRepeatCallbacks {
  return {
    playTTS: vi.fn().mockResolvedValue(undefined),
    startSTT: vi.fn().mockResolvedValue(sttResponse),
    showNotification: vi.fn(),
    emitEvent: vi.fn(),
    getTargetLanguage: vi.fn().mockReturnValue('French'),
  };
}

const TEST_PHRASE: ListenAndRepeatPhrase = {
  phraseId: 'phrase_1',
  targetPhrase: 'Bonjour comment allez-vous',
  nativeTranslation: 'Hello how are you',
  language: 'French',
  npcId: 'npc_baker',
  npcName: 'Pierre',
};

function makeObjective(overrides: Partial<CompletionObjective> & { type: string }): CompletionObjective {
  return {
    id: `obj_${Math.random().toString(36).slice(2, 8)}`,
    questId: 'test-quest',
    description: `Test ${overrides.type} objective`,
    completed: false,
    ...overrides,
  };
}

function makeQuest(objectives: CompletionObjective[], id = 'test-quest'): CompletionQuest {
  for (const o of objectives) o.questId = id;
  return { id, objectives };
}

/**
 * Simulates BabylonGame.ts setOnListenAndRepeat callback logic.
 * This mirrors the actual code in BabylonGame.ts to test the wiring.
 */
function simulateBabylonGameCallback(
  result: any,
  eventBus: { emit: (event: any) => void },
): void {
  // Skip individual controller events
  if (
    result.type === 'utterance_evaluated' ||
    result.type === 'action_executed' ||
    result.type === 'pronunciation_attempt'
  ) {
    return;
  }
  // RepeatAttemptResult — emit events for quest tracking
  eventBus.emit({
    type: 'utterance_evaluated',
    objectiveId: result.phrase?.phraseId || '',
    input: result.playerSpoken || '',
    score: result.score || 0,
    passed: result.passed || false,
    feedback: result.feedback || '',
  });
  eventBus.emit({
    type: 'action_executed',
    actionName: 'listen_and_repeat',
    actorId: 'player',
    targetId: result.phrase?.npcId || '',
    targetName: result.phrase?.npcName || '',
    category: 'language',
    result: result.passed ? 'success' : 'failure',
    xpGained: result.xpAwarded || 0,
  });
  // Emit listen_and_repeat_passed for QuestCompletionEngine
  eventBus.emit({
    type: 'listen_and_repeat_passed',
    passed: result.passed || false,
    phrase: result.phrase?.targetPhrase || '',
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Listen-and-Repeat E2E Pipeline', () => {
  let controller: ListenAndRepeatController;
  let callbacks: ListenAndRepeatCallbacks;
  let qce: QuestCompletionEngine;
  let emittedEvents: any[];

  beforeEach(() => {
    callbacks = createMockCallbacks();
    controller = new ListenAndRepeatController(callbacks);
    qce = new QuestCompletionEngine();
    emittedEvents = [];
  });

  function wireControllerToQCE(): void {
    // Wire: controller emitEvent → BabylonGame callback simulation → QCE
    const originalEmitEvent = callbacks.emitEvent!;
    (callbacks as any).emitEvent = (event: any) => {
      originalEmitEvent(event);
      simulateBabylonGameCallback(event, {
        emit: (e: any) => {
          emittedEvents.push(e);
          qce.trackEvent(e);
        },
      });
    };
  }

  describe('Full pipeline: controller → callback → QCE', () => {
    it('completes a listen_and_repeat quest objective after passing attempts', async () => {
      const obj = makeObjective({ type: 'listen_and_repeat', requiredCount: 2 });
      const quest = makeQuest([obj]);
      qce.addQuest(quest);

      // Attempt via controller and manually pass RepeatAttemptResult through BabylonGame callback
      const result1 = await controller.attempt(TEST_PHRASE);
      expect(result1.passed).toBe(true);
      simulateBabylonGameCallback(result1, {
        emit: (e: any) => { emittedEvents.push(e); qce.trackEvent(e); },
      });

      expect(obj.completed).toBe(false);
      expect(obj.currentCount).toBe(1);

      const result2 = await controller.attempt(TEST_PHRASE);
      simulateBabylonGameCallback(result2, {
        emit: (e: any) => { emittedEvents.push(e); qce.trackEvent(e); },
      });

      expect(obj.completed).toBe(true);
      expect(obj.currentCount).toBe(2);
    });

    it('emits listen_and_repeat_passed event with correct fields', async () => {
      const result = await controller.attempt(TEST_PHRASE);
      simulateBabylonGameCallback(result, {
        emit: (e: any) => emittedEvents.push(e),
      });

      const lrEvent = emittedEvents.find(e => e.type === 'listen_and_repeat_passed');
      expect(lrEvent).toBeDefined();
      expect(lrEvent.passed).toBe(true);
      expect(lrEvent.phrase).toBe('Bonjour comment allez-vous');
    });

    it('emits utterance_evaluated and action_executed alongside listen_and_repeat_passed', async () => {
      const result = await controller.attempt(TEST_PHRASE);
      simulateBabylonGameCallback(result, {
        emit: (e: any) => emittedEvents.push(e),
      });

      const types = emittedEvents.map(e => e.type);
      expect(types).toContain('utterance_evaluated');
      expect(types).toContain('action_executed');
      expect(types).toContain('listen_and_repeat_passed');
      // Exactly 3 events, no duplicates
      expect(emittedEvents.length).toBe(3);
    });

    it('does NOT forward individual controller events as RepeatAttemptResults', async () => {
      // Simulate what BabylonChatPanel does: emitEvent callback fires for each controller event
      const controllerEvents: any[] = [];
      const gameEvents: any[] = [];

      callbacks.emitEvent = (event: any) => {
        controllerEvents.push(event);
        // BabylonGame callback should skip these
        simulateBabylonGameCallback(event, {
          emit: (e: any) => gameEvents.push(e),
        });
      };
      controller = new ListenAndRepeatController(callbacks);

      await controller.attempt(TEST_PHRASE);

      // Controller emits 3 individual events
      expect(controllerEvents.length).toBe(3);
      // BabylonGame callback should skip all 3 (they have type fields that match the filter)
      expect(gameEvents.length).toBe(0);
    });
  });

  describe('Failed attempts', () => {
    it('does not advance quest objective on failed pronunciation', async () => {
      callbacks = createMockCallbacks('something completely different');
      controller = new ListenAndRepeatController(callbacks);

      const obj = makeObjective({ type: 'listen_and_repeat', requiredCount: 1 });
      const quest = makeQuest([obj]);
      qce.addQuest(quest);

      const result = await controller.attempt(TEST_PHRASE);
      expect(result.passed).toBe(false);

      simulateBabylonGameCallback(result, {
        emit: (e: any) => qce.trackEvent(e),
      });

      expect(obj.completed).toBe(false);
      expect(obj.currentCount).toBeUndefined();
    });

    it('emits listen_and_repeat_passed with passed=false for failed attempts', async () => {
      callbacks = createMockCallbacks('wrong phrase');
      controller = new ListenAndRepeatController(callbacks);

      const result = await controller.attempt(TEST_PHRASE);
      simulateBabylonGameCallback(result, {
        emit: (e: any) => emittedEvents.push(e),
      });

      const lrEvent = emittedEvents.find(e => e.type === 'listen_and_repeat_passed');
      expect(lrEvent).toBeDefined();
      expect(lrEvent.passed).toBe(false);
    });
  });

  describe('Text fallback (no STT)', () => {
    it('completes objective via attemptFromText with correct input', () => {
      const obj = makeObjective({ type: 'listen_and_repeat', requiredCount: 1 });
      const quest = makeQuest([obj]);
      qce.addQuest(quest);

      const result = controller.attemptFromText(TEST_PHRASE, 'Bonjour comment allez-vous');
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);

      simulateBabylonGameCallback(result, {
        emit: (e: any) => qce.trackEvent(e),
      });

      expect(obj.completed).toBe(true);
    });

    it('does not complete objective via text fallback with wrong input', () => {
      const obj = makeObjective({ type: 'listen_and_repeat', requiredCount: 1 });
      const quest = makeQuest([obj]);
      qce.addQuest(quest);

      const result = controller.attemptFromText(TEST_PHRASE, 'totally wrong');
      expect(result.passed).toBe(false);

      simulateBabylonGameCallback(result, {
        emit: (e: any) => qce.trackEvent(e),
      });

      expect(obj.completed).toBe(false);
    });
  });

  describe('Phrase detection', () => {
    it('detects French phrases in NPC messages', () => {
      const phrases = controller.detectPhrases(
        'Bonjour! Je suis le boulanger. Comment allez-vous?',
        'npc_baker',
        'Pierre',
      );
      expect(phrases.length).toBeGreaterThan(0);
      expect(phrases[0].language).toBe('French');
      expect(phrases[0].npcId).toBe('npc_baker');
    });

    it('does not detect phrases when target language is English', () => {
      (callbacks.getTargetLanguage as any).mockReturnValue('English');
      const phrases = controller.detectPhrases(
        'Bonjour! Comment allez-vous?',
        'npc_baker',
        'Pierre',
      );
      expect(phrases.length).toBe(0);
    });

    it('extracts quoted phrases for practice', () => {
      const phrases = detectTargetLanguagePhrases(
        'Try saying «Bonjour monsieur» to greet someone.',
        'French',
      );
      expect(phrases).toContain('Bonjour monsieur');
    });
  });

  describe('Pronunciation scoring integration', () => {
    it('scores exact match at 100%', async () => {
      const result = await controller.attempt(TEST_PHRASE);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.xpAwarded).toBe(4);
    });

    it('scores partial match between 0 and 100', async () => {
      callbacks = createMockCallbacks('Bonjour comment');
      controller = new ListenAndRepeatController(callbacks);
      const result = await controller.attempt(TEST_PHRASE);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('scores empty speech at 0%', async () => {
      callbacks = createMockCallbacks('');
      controller = new ListenAndRepeatController(callbacks);
      const result = await controller.attempt(TEST_PHRASE);
      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('awards scaled XP based on score', async () => {
      // Exact match → 4 XP
      let result = await controller.attempt(TEST_PHRASE);
      expect(result.xpAwarded).toBe(4);

      // Failed → 1 XP
      callbacks = createMockCallbacks('wrong');
      controller = new ListenAndRepeatController(callbacks);
      result = await controller.attempt(TEST_PHRASE);
      expect(result.xpAwarded).toBe(1);
    });
  });
});
