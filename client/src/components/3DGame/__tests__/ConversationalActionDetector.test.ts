/**
 * Tests for ConversationalActionDetector
 *
 * Pure-logic tests for detecting conversational action patterns from
 * player messages during NPC dialogue.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConversationalActionDetector,
  type DetectorContext,
} from '../ConversationalActionDetector';

function makeCtx(overrides: Partial<DetectorContext> & { playerMessage: string }): DetectorContext {
  return {
    npcId: 'npc-1',
    npcMessage: '',
    targetLanguage: undefined,
    questTopics: undefined,
    ...overrides,
  };
}

describe('ConversationalActionDetector', () => {
  let detector: ConversationalActionDetector;

  beforeEach(() => {
    detector = new ConversationalActionDetector();
  });

  // ── asked_about_topic ──────────────────────────────────────────────────

  describe('asked_about_topic', () => {
    it('detects when player message contains quest-relevant keywords', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Have you seen the missing writer around here?',
        questTopics: [{ questId: 'q1', keywords: ['missing', 'writer'] }],
      }));

      const topicAction = actions.find(a => a.action === 'asked_about_topic');
      expect(topicAction).toBeDefined();
      expect(topicAction!.questId).toBe('q1');
      expect(topicAction!.topic).toBe('missing');
    });

    it('does not fire when no keywords match', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Nice weather today',
        questTopics: [{ questId: 'q1', keywords: ['missing', 'writer'] }],
      }));

      expect(actions.find(a => a.action === 'asked_about_topic')).toBeUndefined();
    });

    it('does not fire when no quest topics are set', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Have you seen the missing writer?',
      }));

      expect(actions.find(a => a.action === 'asked_about_topic')).toBeUndefined();
    });
  });

  // ── used_target_language ───────────────────────────────────────────────

  describe('used_target_language', () => {
    it('detects French language usage', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Bonjour, je suis très content de vous rencontrer',
        targetLanguage: 'fr',
      }));

      expect(actions.find(a => a.action === 'used_target_language')).toBeDefined();
    });

    it('does not fire for English-only messages in French context', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Hello, I am very happy to meet you',
        targetLanguage: 'fr',
      }));

      expect(actions.find(a => a.action === 'used_target_language')).toBeUndefined();
    });

    it('detects Spanish language usage', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Hola, yo soy un estudiante nuevo aquí',
        targetLanguage: 'es',
      }));

      expect(actions.find(a => a.action === 'used_target_language')).toBeDefined();
    });

    it('does not fire when no target language is set', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Bonjour, je suis content',
      }));

      expect(actions.find(a => a.action === 'used_target_language')).toBeUndefined();
    });
  });

  // ── answered_question ──────────────────────────────────────────────────

  describe('answered_question', () => {
    it('detects when player responds to NPC question', () => {
      const actions = detector.detect(makeCtx({
        npcMessage: 'What is your favorite color?',
        playerMessage: 'My favorite color is blue',
      }));

      expect(actions.find(a => a.action === 'answered_question')).toBeDefined();
    });

    it('detects when NPC message ends with question mark', () => {
      const actions = detector.detect(makeCtx({
        npcMessage: 'You like the food here?',
        playerMessage: 'Yes I do like it',
      }));

      expect(actions.find(a => a.action === 'answered_question')).toBeDefined();
    });

    it('does not fire when NPC did not ask a question', () => {
      const actions = detector.detect(makeCtx({
        npcMessage: 'Welcome to the village.',
        playerMessage: 'Thank you very much',
      }));

      expect(actions.find(a => a.action === 'answered_question')).toBeUndefined();
    });

    it('does not fire for single-word responses', () => {
      const actions = detector.detect(makeCtx({
        npcMessage: 'What is your name?',
        playerMessage: 'Daniel',
      }));

      expect(actions.find(a => a.action === 'answered_question')).toBeUndefined();
    });
  });

  // ── requested_information ──────────────────────────────────────────────

  describe('requested_information', () => {
    it('detects direction requests', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Where is the library?',
      }));

      expect(actions.find(a => a.action === 'requested_information')).toBeDefined();
    });

    it('detects help requests', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Can you tell me about the town history?',
      }));

      expect(actions.find(a => a.action === 'requested_information')).toBeDefined();
    });

    it('detects "looking for" patterns', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: "I'm looking for a baker",
      }));

      expect(actions.find(a => a.action === 'requested_information')).toBeDefined();
    });

    it('does not fire for statements', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'The weather is nice today',
      }));

      expect(actions.find(a => a.action === 'requested_information')).toBeUndefined();
    });
  });

  // ── made_introduction ──────────────────────────────────────────────────

  describe('made_introduction', () => {
    it('detects "my name is" pattern', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Hello, my name is Daniel',
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeDefined();
    });

    it('detects "I am" pattern with name', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: "I'm Daniel, nice to meet you",
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeDefined();
    });

    it('detects French introduction', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: "Je m'appelle Daniel",
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeDefined();
    });

    it('detects "nice to meet" pattern', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Nice to meet you, I just arrived',
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeDefined();
    });

    it('does not fire for non-introduction messages', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'What do you sell here?',
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeUndefined();
    });
  });

  // ── Multiple actions in one message ────────────────────────────────────

  describe('multiple action detection', () => {
    it('detects both introduction and target language in one message', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: "Bonjour, je m'appelle Daniel",
        targetLanguage: 'fr',
      }));

      expect(actions.find(a => a.action === 'made_introduction')).toBeDefined();
      expect(actions.find(a => a.action === 'used_target_language')).toBeDefined();
    });

    it('detects topic and information request', () => {
      const actions = detector.detect(makeCtx({
        playerMessage: 'Where can I find the missing writer?',
        questTopics: [{ questId: 'q1', keywords: ['missing', 'writer'] }],
      }));

      expect(actions.find(a => a.action === 'asked_about_topic')).toBeDefined();
      expect(actions.find(a => a.action === 'requested_information')).toBeDefined();
    });
  });

  // ── Conversation turn counting ─────────────────────────────────────────

  describe('recordTurn', () => {
    it('increments total turn count', () => {
      const s1 = detector.recordTurn('npc-1', 'Hello there friend');
      expect(s1.totalTurns).toBe(1);
      expect(s1.meaningfulTurns).toBe(0); // only 3 words, not > 5

      const s2 = detector.recordTurn('npc-1', 'I want to find the library in this town');
      expect(s2.totalTurns).toBe(2);
      expect(s2.meaningfulTurns).toBe(1); // 9 words > 5
    });

    it('tracks meaningful turns with target language', () => {
      const state = detector.recordTurn(
        'npc-1',
        'Bonjour je suis très content de vous voir',
        'fr',
      );
      expect(state.totalTurns).toBe(1);
      expect(state.meaningfulTurns).toBe(1); // 8 words, French detected
    });

    it('does not count short messages as meaningful', () => {
      const state = detector.recordTurn('npc-1', 'Oui merci');
      expect(state.totalTurns).toBe(1);
      expect(state.meaningfulTurns).toBe(0);
    });

    it('tracks separate counts per NPC', () => {
      detector.recordTurn('npc-1', 'Hello there my good friend today');
      detector.recordTurn('npc-2', 'Greetings to you on this fine day');

      expect(detector.getTurnState('npc-1')!.totalTurns).toBe(1);
      expect(detector.getTurnState('npc-2')!.totalTurns).toBe(1);
    });

    it('returns undefined for unknown NPC', () => {
      expect(detector.getTurnState('unknown')).toBeUndefined();
    });

    it('resets all turn counts', () => {
      detector.recordTurn('npc-1', 'Hello there my friend');
      detector.resetTurnCounts();
      expect(detector.getTurnState('npc-1')).toBeUndefined();
    });
  });
});

// ── QuestCompletionEngine integration ────────────────────────────────────────

describe('QuestCompletionEngine conversational_action handling', () => {
  // Import here to keep the test file focused
  let QuestCompletionEngine: typeof import('../QuestCompletionEngine').QuestCompletionEngine;

  beforeEach(async () => {
    const mod = await import('../QuestCompletionEngine');
    QuestCompletionEngine = mod.QuestCompletionEngine;
  });

  it('completes asked_about_topic objective when action fires', () => {
    const engine = new QuestCompletionEngine();
    const completedSpy = { called: false, questId: '', objectiveId: '' };
    engine.setOnObjectiveCompleted((qId, oId) => {
      completedSpy.called = true;
      completedSpy.questId = qId;
      completedSpy.objectiveId = oId;
    });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'o1', questId: 'q1', type: 'asked_about_topic',
        description: 'Ask about the missing writer',
        completed: false, requiredCount: 1, currentCount: 0,
        targetWords: ['missing'],
      }],
    });

    engine.trackEvent({
      type: 'conversational_action',
      action: 'asked_about_topic',
      topic: 'missing',
      npcId: 'npc-1',
      questId: 'q1',
    });

    expect(completedSpy.called).toBe(true);
    expect(completedSpy.objectiveId).toBe('o1');
  });

  it('completes made_introduction mapped to introduce_self objective', () => {
    const engine = new QuestCompletionEngine();
    let completed = false;
    engine.setOnObjectiveCompleted(() => { completed = true; });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'o1', questId: 'q1', type: 'introduce_self',
        description: 'Introduce yourself', completed: false,
        requiredCount: 1, currentCount: 0,
      }],
    });

    engine.trackEvent({
      type: 'conversational_action',
      action: 'made_introduction',
      npcId: 'npc-1',
    });

    expect(completed).toBe(true);
  });

  it('completes arrival_initiate_conversation on any conversational action', () => {
    const engine = new QuestCompletionEngine();
    let completedId = '';
    engine.setOnObjectiveCompleted((_q, oId) => { completedId = oId; });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'init-conv', questId: 'q1', type: 'arrival_initiate_conversation',
        description: 'Start a conversation', completed: false,
      }],
    });

    engine.trackEvent({
      type: 'conversational_action',
      action: 'used_target_language',
      npcId: 'npc-1',
    });

    expect(completedId).toBe('init-conv');
  });

  it('completes arrival_conversation when meaningful turns reach threshold', () => {
    const engine = new QuestCompletionEngine();
    let completed = false;
    engine.setOnObjectiveCompleted(() => { completed = true; });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'conv', questId: 'q1', type: 'arrival_conversation',
        description: 'Have a conversation', completed: false,
        requiredCount: 3, currentCount: 0,
      }],
    });

    // 2 meaningful turns — not enough
    engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-1', totalTurns: 3, meaningfulTurns: 2 });
    expect(completed).toBe(false);

    // 3 meaningful turns — meets threshold
    engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-1', totalTurns: 5, meaningfulTurns: 3 });
    expect(completed).toBe(true);
  });

  it('respects NPC ID filter on objectives', () => {
    const engine = new QuestCompletionEngine();
    let completed = false;
    engine.setOnObjectiveCompleted(() => { completed = true; });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'o1', questId: 'q1', type: 'asked_about_topic',
        description: 'Ask specific NPC', completed: false,
        npcId: 'npc-specific',
        requiredCount: 1, currentCount: 0,
      }],
    });

    // Wrong NPC — should not complete
    engine.trackEvent({
      type: 'conversational_action',
      action: 'asked_about_topic',
      npcId: 'npc-wrong',
      questId: 'q1',
    });
    expect(completed).toBe(false);

    // Right NPC — should complete
    engine.trackEvent({
      type: 'conversational_action',
      action: 'asked_about_topic',
      npcId: 'npc-specific',
      questId: 'q1',
    });
    expect(completed).toBe(true);
  });

  it('requires multiple actions when requiredCount > 1', () => {
    const engine = new QuestCompletionEngine();
    let completed = false;
    engine.setOnObjectiveCompleted(() => { completed = true; });

    engine.addQuest({
      id: 'q1',
      objectives: [{
        id: 'o1', questId: 'q1', type: 'used_target_language',
        description: 'Use French 3 times', completed: false,
        requiredCount: 3, currentCount: 0,
      }],
    });

    engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
    expect(completed).toBe(false);

    engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
    expect(completed).toBe(false);

    engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
    expect(completed).toBe(true);
  });
});
