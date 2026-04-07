import { describe, it, expect, vi } from 'vitest';
import { LanguageProgressTracker } from '../game-engine/logic/LanguageProgressTracker';

// ── Helpers ─────────────────────────────────────────────────────────────────

function createTracker(cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'A1') {
  const tracker = new LanguageProgressTracker('player1', 'world1', 'testlang');
  tracker.setCEFRLevel(cefrLevel);
  return tracker;
}

/**
 * Seed vocabulary by simulating NPC responses that contain target words.
 * This directly adds words to progress.vocabulary via analyzeNPCResponse.
 */
function seedWords(tracker: LanguageProgressTracker, count: number) {
  // Use recordVocabularyEncounter-style seeding by manipulating internal state
  // via the public analyzeNPCResponse, but that requires worldLanguageContext.
  // Instead, we'll use multiple conversations to bump totalWordsLearned.
  // Easiest: start/end multiple conversations with grammar correct usage.

  // Actually, let's just directly call into the tracker's methods.
  // The tracker tracks totalWordsLearned in progress.
  // We'll seed by setting up a world language context with sample words.
  const sampleWords: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    sampleWords[`word_en_${i}`] = `word_tl_${i}`;
  }
  tracker.setWorldLanguageContext({
    primaryLanguage: {
      name: 'testlang',
      sampleWords,
    } as any,
    allLanguages: [],
    languageRelationships: [],
  });
  // Analyze a response containing all target words
  const response = sampleWords
    ? Object.values(sampleWords).join(' ')
    : '';
  tracker.startConversation('npc1', 'Test NPC');
  tracker.analyzeNPCResponse(response);
}

/**
 * Complete N conversations with at least 1 turn each.
 */
function completeConversations(tracker: LanguageProgressTracker, count: number) {
  for (let i = 0; i < count; i++) {
    tracker.startConversation(`npc_${i}`, `NPC ${i}`);
    // Need at least 1 turn for the conversation to count
    tracker.analyzePlayerMessage('hello');
    tracker.endConversation();
  }
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('CEFR auto-advancement gameplay hooks', () => {
  describe('checkAndAdvanceCEFR on conversation completion', () => {
    it('advances A2 to B1 when thresholds are met', () => {
      const tracker = createTracker('A2');
      const advancementCallback = vi.fn();
      tracker.setOnCEFRAdvancement(advancementCallback);

      // Seed 150 words (A2→B1 threshold)
      seedWords(tracker, 150);

      // Seed 5 texts read (A2→B1 threshold)
      for (let i = 0; i < 5; i++) {
        tracker.recordTextRead();
      }

      // Complete 10 conversations (A2→B1 threshold)
      // endConversation() calls checkAndAdvanceCEFR() internally
      completeConversations(tracker, 10);

      expect(tracker.getCEFRLevel()).toBe('B1');
      expect(advancementCallback).toHaveBeenCalledWith('A2', 'B1');
    });

    it('does not advance when below thresholds', () => {
      const tracker = createTracker('A2');
      const advancementCallback = vi.fn();
      tracker.setOnCEFRAdvancement(advancementCallback);

      // Only seed 50 words (below A2→B1 threshold of 150)
      seedWords(tracker, 50);

      completeConversations(tracker, 5);

      expect(tracker.getCEFRLevel()).toBe('A2');
      expect(advancementCallback).not.toHaveBeenCalled();
    });
  });

  describe('checkAndAdvanceCEFR returns correct result', () => {
    it('returns progress metrics toward next level', () => {
      const tracker = createTracker('A2');
      seedWords(tracker, 75); // 50% of 150
      for (let i = 0; i < 2; i++) tracker.recordTextRead(); // 40% of 5

      const result = tracker.checkAndAdvanceCEFR();
      expect(result.shouldAdvance).toBe(false);
      expect(result.nextLevel).toBe('B1');
      expect(result.metrics.wordsProgress).toBeCloseTo(0.5);
      expect(result.metrics.textsProgress).toBeCloseTo(0.4);
    });
  });

  describe('textsRead tracking', () => {
    it('increments textsRead on recordTextRead()', () => {
      const tracker = createTracker('A1');
      expect(tracker.getTextsRead()).toBe(0);

      tracker.recordTextRead();
      expect(tracker.getTextsRead()).toBe(1);

      tracker.recordTextRead();
      tracker.recordTextRead();
      expect(tracker.getTextsRead()).toBe(3);
    });

    it('textsRead is included in CEFR progress snapshot', () => {
      const tracker = createTracker('A2');
      tracker.recordTextRead();
      tracker.recordTextRead();

      const snapshot = tracker.getCEFRProgressSnapshot();
      expect(snapshot.textsRead).toBe(2);
      expect(snapshot.currentLevel).toBe('A2');
    });

    it('textsRead contributes to advancement (A2→B1 requires 5 texts)', () => {
      const tracker = createTracker('A2');
      const advancementCallback = vi.fn();
      tracker.setOnCEFRAdvancement(advancementCallback);

      // Meet word and conversation thresholds
      seedWords(tracker, 150);
      completeConversations(tracker, 10);

      // Without texts, should not have advanced (texts needed = 5)
      // Actually, the conversations above may have triggered advancement checks.
      // Let's check the final state — if textsRead wasn't seeded, it shouldn't advance.
      // Reset tracker to test cleanly
      const tracker2 = createTracker('A2');
      const cb2 = vi.fn();
      tracker2.setOnCEFRAdvancement(cb2);

      seedWords(tracker2, 150);
      // Only 3 texts (below 5 threshold)
      for (let i = 0; i < 3; i++) tracker2.recordTextRead();
      completeConversations(tracker2, 10);

      // Should not advance — textsRead only 3/5
      expect(tracker2.getCEFRLevel()).toBe('A2');

      // Now add remaining texts and check
      tracker2.recordTextRead();
      tracker2.recordTextRead();
      const result = tracker2.checkAndAdvanceCEFR();
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('B1');
    });
  });

  describe('CEFR advancement safeguards', () => {
    it('respects minimum conversations between advancements', () => {
      const tracker = createTracker('A1');
      seedWords(tracker, 200); // Enough for both A1→A2 and A2→B1

      // Complete 3 conversations — should advance A1→A2
      completeConversations(tracker, 3);
      expect(tracker.getCEFRLevel()).toBe('A2');

      // Immediately try more conversations — should NOT advance again too quickly
      // (MIN_CONVERSATIONS_BETWEEN_ADVANCEMENTS = 3)
      // The advancement from A1→A2 resets the counter, so we need 3 more
      // But also need texts for A2→B1
      for (let i = 0; i < 5; i++) tracker.recordTextRead();

      // Only 1 more conversation after advancement
      completeConversations(tracker, 1);
      expect(tracker.getCEFRLevel()).toBe('A2'); // Should still be A2
    });
  });
});
