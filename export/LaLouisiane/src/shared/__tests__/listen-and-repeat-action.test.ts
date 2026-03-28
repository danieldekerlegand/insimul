/**
 * Tests for the listen_and_repeat action handler.
 */
import { describe, it, expect } from 'vitest';
import {
  createListenAndRepeatAction,
  executeListenAndRepeat,
  calculateXp,
  type ListenAndRepeatPhrase,
} from '../../client/src/components/3DGame/actions/ListenAndRepeatAction';
import type { ActionContext } from '../game-engine/types';

const TEST_PHRASE: ListenAndRepeatPhrase = {
  phraseId: 'phrase_1',
  targetPhrase: 'Bonjour comment allez-vous',
  nativeTranslation: 'Hello how are you',
  language: 'fr',
  npcId: 'npc_baker',
  npcName: 'Pierre',
};

const TEST_CONTEXT: ActionContext = {
  actor: 'player_1',
  target: 'npc_baker',
  location: 'bakery',
  timestamp: Date.now(),
  playerEnergy: 100,
  playerPosition: { x: 0, y: 0 },
};

describe('ListenAndRepeatAction', () => {
  describe('createListenAndRepeatAction', () => {
    it('creates a valid action object', () => {
      const action = createListenAndRepeatAction('action_lar_1');
      expect(action.id).toBe('action_lar_1');
      expect(action.name).toBe('Listen and Repeat');
      expect(action.actionType).toBe('language');
      expect(action.category).toBe('language-learning');
      expect(action.requiresTarget).toBe(true);
      expect(action.energyCost).toBe(0);
      expect(action.isBase).toBe(true);
    });

    it('has Prolog content with correct predicate', () => {
      const action = createListenAndRepeatAction('action_lar_1');
      expect(action.content).toContain('action(listen_and_repeat');
      expect(action.content).toContain('can_perform');
      expect(action.content).toContain('in_conversation');
    });

    it('has language-learning tag', () => {
      const action = createListenAndRepeatAction('action_lar_1');
      expect(action.tags).toContain('language-learning');
      expect(action.tags).toContain('pronunciation');
    });

    it('has narrative templates', () => {
      const action = createListenAndRepeatAction('action_lar_1');
      expect(action.narrativeTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('calculateXp', () => {
    it('awards full XP (4) for scores >= 90', () => {
      expect(calculateXp(90)).toBe(4);
      expect(calculateXp(95)).toBe(4);
      expect(calculateXp(100)).toBe(4);
    });

    it('awards minimum XP (1) for scores below threshold', () => {
      expect(calculateXp(0)).toBe(1);
      expect(calculateXp(30)).toBe(1);
      expect(calculateXp(59)).toBe(1);
    });

    it('scales XP linearly between threshold and 90', () => {
      expect(calculateXp(60)).toBe(1);
      expect(calculateXp(75)).toBe(3);
      expect(calculateXp(89)).toBe(4);
    });
  });

  describe('executeListenAndRepeat', () => {
    const action = createListenAndRepeatAction('action_lar_1');

    it('returns success for exact match', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Good pronunciation!');
      expect(result.energyUsed).toBe(0);
    });

    it('produces knowledge effect with pronunciation score', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      const knowledgeEffect = result.effects.find(e => e.type === 'knowledge');
      expect(knowledgeEffect).toBeDefined();
      expect(knowledgeEffect!.value.score).toBe(100);
      expect(knowledgeEffect!.value.passed).toBe(true);
      expect(knowledgeEffect!.value.phraseId).toBe('phrase_1');
      expect(knowledgeEffect!.value.language).toBe('fr');
    });

    it('produces event effect with listen_and_repeat verb', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      const eventEffect = result.effects.find(e => e.type === 'event');
      expect(eventEffect).toBeDefined();
      expect(eventEffect!.value.verb).toBe('listen_and_repeat');
      expect(eventEffect!.value.npcId).toBe('npc_baker');
      expect(eventEffect!.value.matchScore).toBe(100);
    });

    it('awards XP as attribute effect', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      const xpEffect = result.effects.find(e => e.type === 'attribute');
      expect(xpEffect).toBeDefined();
      expect(xpEffect!.value.skill).toBe('language');
      expect(xpEffect!.value.xp).toBe(4);
    });

    it('handles partial match with lower score', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment',
      );
      const knowledgeEffect = result.effects.find(e => e.type === 'knowledge');
      expect(knowledgeEffect!.value.score).toBeLessThan(100);
      expect(knowledgeEffect!.value.score).toBeGreaterThan(0);
    });

    it('handles empty spoken phrase', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        '',
      );
      expect(result.success).toBe(true);
      const knowledgeEffect = result.effects.find(e => e.type === 'knowledge');
      expect(knowledgeEffect!.value.score).toBe(0);
      expect(knowledgeEffect!.value.passed).toBe(false);
      expect(result.message).toBe('Keep practicing!');
    });

    it('includes narrative text with the target phrase', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      expect(result.narrativeText).toContain(TEST_PHRASE.targetPhrase);
    });

    it('marks as not passed below threshold', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'something completely different',
      );
      const knowledgeEffect = result.effects.find(e => e.type === 'knowledge');
      expect(knowledgeEffect!.value.passed).toBe(false);
      expect(result.message).toBe('Keep practicing!');
    });

    it('includes word-level results in knowledge effect', () => {
      const result = executeListenAndRepeat(
        action,
        TEST_CONTEXT,
        TEST_PHRASE,
        'Bonjour comment allez-vous',
      );
      const knowledgeEffect = result.effects.find(e => e.type === 'knowledge');
      expect(knowledgeEffect!.value.wordResults).toBeDefined();
      expect(Array.isArray(knowledgeEffect!.value.wordResults)).toBe(true);
    });
  });
});
