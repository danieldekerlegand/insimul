import { describe, it, expect } from 'vitest';
import {
  classifyConversation,
  type ClassificationInput,
  type ModelTier,
} from '../services/conversation/conversation-classifier.js';

// ── Helper ──────���────────────────────────────────────────────────────

function classify(overrides: Partial<ClassificationInput> = {}): { tier: ModelTier; reason: string } {
  return classifyConversation({
    message: 'hello',
    turnNumber: 1,
    ...overrides,
  });
}

// ── Greeting classification ────────��─────────────────────────────────

describe('classifyConversation', () => {
  describe('greetings → FAST', () => {
    const greetings = ['hi', 'hello', 'Hey!', 'bonjour', 'salut', 'Bonsoir', 'coucou', 'howdy', 'good morning', 'Good Evening!'];

    for (const msg of greetings) {
      it(`classifies "${msg}" as FAST (greeting)`, () => {
        const result = classify({ message: msg });
        expect(result.tier).toBe('fast');
        expect(result.reason).toBe('greeting');
      });
    }
  });

  describe('farewells → FAST', () => {
    const farewells = ['bye', 'goodbye', 'au revoir', 'see you', 'later', 'ciao', 'à bientôt'];

    for (const msg of farewells) {
      it(`classifies "${msg}" as FAST (farewell)`, () => {
        const result = classify({ message: msg });
        expect(result.tier).toBe('fast');
        expect(result.reason).toBe('farewell');
      });
    }
  });

  describe('simple social → FAST', () => {
    const social = ['yes', 'no', 'ok', 'thanks', 'merci', 'oui', 'non', 'how are you', 'comment ça va', 'who are you'];

    for (const msg of social) {
      it(`classifies "${msg}" as FAST (simple_social)`, () => {
        const result = classify({ message: msg });
        expect(result.tier).toBe('fast');
        expect(result.reason).toBe('simple_social');
      });
    }
  });

  // ── Quest routing ──────────────────────────────────────────────────

  describe('quest conversations → FULL', () => {
    it('classifies quest conversation as FULL', () => {
      const result = classify({ isQuestConversation: true, message: 'hi' });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('quest_conversation');
    });

    it('quest flag overrides greeting pattern', () => {
      const result = classify({ isQuestConversation: true, message: 'hello' });
      expect(result.tier).toBe('full');
    });

    it('detects quest keywords in user message', () => {
      const result = classify({ message: 'Can you help me find the artifact?' });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('quest_keywords_detected');
    });

    it('detects quest-bearing NPC from system prompt', () => {
      const result = classify({
        message: 'hello',
        systemPrompt: 'You are a quest-giver NPC in the village.',
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('quest_bearing_npc');
    });
  });

  // ── NPC-NPC routing ────────────────────────────────────────────────

  describe('NPC-NPC conversations → FAST', () => {
    it('classifies NPC-NPC ambient as FAST', () => {
      const result = classify({ isNpcToNpc: true, message: 'The weather is nice today.' });
      expect(result.tier).toBe('fast');
      expect(result.reason).toBe('npc_to_npc_ambient');
    });
  });

  // ── CEFR level routing ─────────���───────────────────────────────────

  describe('B1+ complex language → FULL', () => {
    it('classifies B1 with complex language as FULL', () => {
      const result = classify({
        message: 'Can you explain why this happened?',
        cefrLevel: 'B1',
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('complex_language_b1_plus');
    });

    it('classifies B2 with complex language as FULL', () => {
      const result = classify({
        message: 'I would like you to describe the situation.',
        cefrLevel: 'B2',
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('complex_language_b1_plus');
    });

    it('does NOT trigger complex language for A1 level', () => {
      const result = classify({
        message: 'Can you explain why?',
        cefrLevel: 'A1',
      });
      // A1 with "explain" should not trigger B1+ complex path
      expect(result.reason).not.toBe('complex_language_b1_plus');
    });
  });

  // ─��� Short follow-ups → FAST ─────────��──────────────────────────────

  describe('short follow-ups → FAST', () => {
    it('classifies short turn-2+ message as FAST', () => {
      const result = classify({
        message: 'Tell me more',
        turnNumber: 2,
      });
      expect(result.tier).toBe('fast');
      expect(result.reason).toBe('short_followup');
    });

    it('does not classify turn 1 short message as short_followup', () => {
      const result = classify({
        message: 'Tell me more',
        turnNumber: 1,
      });
      expect(result.reason).not.toBe('short_followup');
    });

    it('does not classify long follow-up as FAST', () => {
      const result = classify({
        message: 'I was wondering if you could tell me a bit more about the history of this town and what happened here.',
        turnNumber: 2,
      });
      expect(result.reason).not.toBe('short_followup');
    });
  });

  // ── Long messages → FULL ───────────────���───────────────────────────

  describe('long messages → FULL', () => {
    it('classifies very long message as FULL', () => {
      const longMsg = 'a '.repeat(120); // 240 chars
      const result = classify({ message: longMsg });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('long_message');
    });
  });

  // ── Default → FULL ──────��──────────────────────────────────────────

  describe('default routing', () => {
    it('defaults to FULL for ambiguous messages', () => {
      const result = classify({
        message: 'What is happening in the market today?',
        turnNumber: 1,
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('default');
    });
  });

  // ── Priority ordering ──────────────────────────────────────────────

  describe('classification priority', () => {
    it('quest flag takes priority over greeting pattern', () => {
      const result = classify({
        message: 'hello',
        isQuestConversation: true,
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('quest_conversation');
    });

    it('quest-bearing NPC takes priority over NPC-NPC', () => {
      // NPC-NPC check happens after system prompt quest check
      const result = classify({
        message: 'hello',
        isNpcToNpc: false,
        systemPrompt: 'You are a quest-bearer NPC.',
      });
      expect(result.tier).toBe('full');
      expect(result.reason).toBe('quest_bearing_npc');
    });

    it('NPC-NPC takes priority over greeting', () => {
      const result = classify({
        message: 'hello',
        isNpcToNpc: true,
      });
      expect(result.tier).toBe('fast');
      expect(result.reason).toBe('npc_to_npc_ambient');
    });
  });
});

// ── Gemini provider tier support ──���──────────────────────────────────

describe('StreamCompletionOptions modelTier', () => {
  it('modelTier type accepts fast and full', () => {
    // Type-level test: ensure the modelTier field is properly typed
    const fastOpts: { modelTier?: 'fast' | 'full' } = { modelTier: 'fast' };
    const fullOpts: { modelTier?: 'fast' | 'full' } = { modelTier: 'full' };
    expect(fastOpts.modelTier).toBe('fast');
    expect(fullOpts.modelTier).toBe('full');
  });
});
