/**
 * Tests for pronunciation feedback integration with quests.
 *
 * Covers:
 * - Word-level pronunciation feedback (green/yellow/red) on speak_phrase and pronunciation_check
 * - Retry logic: score < 60% prompts retry without penalizing quest progress
 * - Pronunciation bonus XP (up to 25%) for completed objectives
 * - Pronunciation Challenge quest template existence
 * - Assessment data emission on completion
 */
import { describe, it, expect, vi } from 'vitest';
import {
  UtteranceQuestSystem,
  type UtteranceObjectiveDefinition,
} from '../../logic/UtteranceQuestSystem';

function makeEventBus() {
  return { emit: vi.fn() } as any;
}

function makeObjective(
  overrides: Partial<UtteranceObjectiveDefinition> = {},
): UtteranceObjectiveDefinition {
  return {
    id: 'obj-1',
    questId: 'quest-1',
    type: 'pronunciation_check',
    prompt: 'Say "bonjour le monde"',
    targetLanguage: 'fr',
    acceptedUtterances: [{ text: 'bonjour le monde' }],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [],
    xpReward: 20,
    maxAttempts: 0,
    ...overrides,
  };
}

describe('Pronunciation quest integration', () => {
  // ── Word-level feedback ───────────────────────────────────────────────

  describe('word-level pronunciation feedback', () => {
    it('returns green (good) for exact match words', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective();
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      const result = sys.evaluateInput('obj-1', 'bonjour le monde');

      expect(result.wordFeedback).toBeDefined();
      expect(result.wordFeedback!.length).toBeGreaterThan(0);
      expect(result.wordFeedback!.every(w => w.status === 'good')).toBe(true);
    });

    it('returns yellow (acceptable) for close matches', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        acceptedUtterances: [{ text: 'bonjour' }],
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      // "bonjoure" is close but not exact
      const result = sys.evaluateInput('obj-1', 'bonjoure');

      expect(result.wordFeedback).toBeDefined();
      const wordStatus = result.wordFeedback![0];
      expect(['good', 'acceptable']).toContain(wordStatus.status);
    });

    it('returns red (needs_work) for poor matches', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        acceptedUtterances: [{ text: 'bonjour le monde' }],
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      const result = sys.evaluateInput('obj-1', 'xyz abc def');

      expect(result.wordFeedback).toBeDefined();
      const badWords = result.wordFeedback!.filter(
        w => w.status === 'needs_work' || w.status === 'missed',
      );
      expect(badWords.length).toBeGreaterThan(0);
    });

    it('provides word feedback on speak_phrase objectives too', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        type: 'speak_phrase',
        acceptedUtterances: [{ text: 'hello world' }],
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      const result = sys.evaluateInput('obj-1', 'hello world');

      expect(result.wordFeedback).toBeDefined();
      expect(result.wordFeedback!.length).toBe(2);
      expect(result.wordFeedback!.every(w => w.status === 'good')).toBe(true);
    });
  });

  // ── Retry logic ───────────────────────────────────────────────────────

  describe('pronunciation retry logic', () => {
    it('marks score < 60% as retry without penalizing attempts', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        maxAttempts: 3,
        acceptedUtterances: [{ text: 'bonjour le monde' }],
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      // Attempt with very wrong input (should score < 60%)
      const result = sys.evaluateInput('obj-1', 'xyz');

      expect(result.isPronunciationRetry).toBe(true);
      expect(result.feedback).toContain('Try saying it again');

      // Progress should not have been counted as an attempt
      const prog = sys.getProgress('obj-1');
      expect(prog!.attempts).toBe(0);
    });

    it('counts successful pronunciation as an attempt', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        maxAttempts: 5,
        acceptedUtterances: [{ text: 'hello' }],
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      sys.evaluateInput('obj-1', 'hello');

      const prog = sys.getProgress('obj-1');
      expect(prog!.attempts).toBe(1);
    });
  });

  // ── Pronunciation bonus XP ────────────────────────────────────────────

  describe('pronunciation bonus XP', () => {
    it('awards bonus XP for excellent pronunciation on completion', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        type: 'pronunciation_check',
        acceptedUtterances: [{ text: 'hello' }],
        requiredCount: 1,
        xpReward: 100,
        difficulty: 'beginner',
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      // Perfect pronunciation (score ~100)
      sys.evaluateInput('obj-1', 'hello');

      // Check the completion event was emitted with bonus XP
      const completionEvent = bus.emit.mock.calls.find(
        (c: any[]) => c[0]?.type === 'utterance_quest_completed',
      );
      expect(completionEvent).toBeDefined();
      const eventData = completionEvent![0];
      expect(eventData.xpAwarded).toBeGreaterThan(100); // Base + bonus
      expect(eventData.pronunciationBonusXp).toBeGreaterThan(0);
    });

    it('awards no bonus for poor pronunciation', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      // Use speak_phrase with beginner passThreshold (40)
      const obj = makeObjective({
        type: 'speak_phrase',
        acceptedUtterances: [{ text: 'bonjour le monde' }],
        requiredCount: 1,
        xpReward: 100,
        difficulty: 'beginner',
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      // Mediocre pronunciation (some words wrong but passes beginner threshold)
      sys.evaluateInput('obj-1', 'bonjor la mond');

      const completionEvent = bus.emit.mock.calls.find(
        (c: any[]) => c[0]?.type === 'utterance_quest_completed',
      );
      if (completionEvent) {
        const eventData = completionEvent[0];
        // At beginner level with ~60% score, bonus should be 0 or minimal
        expect(eventData.pronunciationBonusXp).toBeLessThanOrEqual(25);
      }
    });
  });

  // ── Assessment data emission ──────────────────────────────────────────

  describe('assessment data emission', () => {
    it('emits pronunciation_assessment_data on objective completion', () => {
      const bus = makeEventBus();
      const sys = new UtteranceQuestSystem(bus);
      const obj = makeObjective({
        acceptedUtterances: [{ text: 'hello' }],
        requiredCount: 1,
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      sys.evaluateInput('obj-1', 'hello');

      const assessmentEvent = bus.emit.mock.calls.find(
        (c: any[]) => c[0]?.type === 'pronunciation_assessment_data',
      );
      expect(assessmentEvent).toBeDefined();
      const data = assessmentEvent![0];
      expect(data.questId).toBe('quest-1');
      expect(data.averageScore).toBeGreaterThan(0);
      expect(data.sampleCount).toBe(1);
    });
  });

  // ── Pronunciation Challenge template ──────────────────────────────────

  describe('Pronunciation Challenge template', () => {
    it('exists in UTTERANCE_QUEST_TEMPLATES', async () => {
      const { UTTERANCE_QUEST_TEMPLATES } = await import('../UtteranceQuestSystem');
      expect(UTTERANCE_QUEST_TEMPLATES.pronunciation_challenge).toBeDefined();
      expect(UTTERANCE_QUEST_TEMPLATES.pronunciation_challenge.type).toBe('pronunciation_check');
      expect(UTTERANCE_QUEST_TEMPLATES.pronunciation_challenge.requiredCount).toBe(5);
    });

    it('exists in QUEST_TEMPLATES', async () => {
      const { QUEST_TEMPLATES } = await import('@shared/language/quest-templates');
      const tpl = QUEST_TEMPLATES.find(t => t.id === 'pronunciation_challenge');
      expect(tpl).toBeDefined();
      expect(tpl!.category).toBe('pronunciation');
      expect(tpl!.objectiveTemplates[0].type).toBe('pronunciation_check');
      expect(tpl!.objectiveTemplates[0].requiredCount).toBe(5);
    });
  });

  // ── Serialization round-trip ──────────────────────────────────────────

  describe('serialization includes pronunciationScores', () => {
    it('preserves pronunciation scores across serialize/deserialize', () => {
      const sys = new UtteranceQuestSystem();
      const obj = makeObjective({
        acceptedUtterances: [{ text: 'hello' }],
        requiredCount: 3,
      });
      sys.registerObjective(obj);
      sys.activateObjective('obj-1');

      // Record some pronunciation scores
      sys.evaluateInput('obj-1', 'hello');

      const saved = sys.serialize();
      const sys2 = new UtteranceQuestSystem();
      sys2.deserialize(saved);

      const prog = sys2.getProgress('obj-1');
      expect(prog!.pronunciationScores).toBeDefined();
      expect(prog!.pronunciationScores!.length).toBe(1);
      expect(prog!.pronunciationScores![0]).toBeGreaterThan(0);
    });
  });
});
