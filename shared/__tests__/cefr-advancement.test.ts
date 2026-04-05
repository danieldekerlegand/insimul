import { describe, it, expect } from 'vitest';
import {
  checkCEFRAdvancement,
  CEFR_ADVANCEMENT_THRESHOLDS,
  type CEFRProgressSnapshot,
} from '../language/cefr-adaptation';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeSnapshot(overrides: Partial<CEFRProgressSnapshot> = {}): CEFRProgressSnapshot {
  return {
    currentLevel: 'A1',
    wordsLearned: 0,
    wordsMastered: 0,
    conversationsCompleted: 0,
    textsRead: 0,
    grammarPatternsRecognized: 0,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('checkCEFRAdvancement', () => {
  describe('at max level (C2)', () => {
    it('returns shouldAdvance=false with full progress', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'C2',
        wordsLearned: 1000,
        conversationsCompleted: 200,
        textsRead: 100,
      }));
      expect(result.shouldAdvance).toBe(false);
      expect(result.nextLevel).toBeNull();
      expect(result.progress).toBe(1.0);
    });
  });

  describe('below thresholds', () => {
    it('A1 with no progress does not advance', () => {
      const result = checkCEFRAdvancement(makeSnapshot());
      expect(result.shouldAdvance).toBe(false);
      expect(result.nextLevel).toBe('A2');
      expect(result.progress).toBeLessThan(1);
    });

    it('A1 with partial progress does not advance', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        wordsLearned: 30,
        conversationsCompleted: 1,
      }));
      expect(result.shouldAdvance).toBe(false);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(1);
    });

    it('meeting only one threshold does not advance', () => {
      // Enough words but not enough conversations
      const result = checkCEFRAdvancement(makeSnapshot({
        wordsLearned: 50,
        conversationsCompleted: 1,
      }));
      expect(result.shouldAdvance).toBe(false);
      expect(result.metrics.wordsProgress).toBe(1);
      expect(result.metrics.conversationsProgress).toBeLessThan(1);
    });
  });

  describe('at thresholds — advancement triggers', () => {
    it('A1→A2: 50 words + 3 conversations', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'A1',
        wordsLearned: 50,
        conversationsCompleted: 3,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('A2');
      expect(result.progress).toBe(1);
    });

    it('A2→B1: 150 words + 10 conversations + 5 texts', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'A2',
        wordsLearned: 150,
        conversationsCompleted: 10,
        textsRead: 5,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('B1');
    });

    it('B1→B2: 300 words + 25 conversations + 15 texts', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'B1',
        wordsLearned: 300,
        conversationsCompleted: 25,
        textsRead: 15,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('B2');
    });

    it('B2→C1: 500 words + 50 conversations + 30 texts', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'B2',
        wordsLearned: 500,
        conversationsCompleted: 50,
        textsRead: 30,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('C1');
    });

    it('C1→C2: 800 words + 100 conversations + 50 texts', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'C1',
        wordsLearned: 800,
        conversationsCompleted: 100,
        textsRead: 50,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('C2');
    });
  });

  describe('above thresholds', () => {
    it('exceeding thresholds still advances correctly', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        wordsLearned: 200,
        conversationsCompleted: 20,
      }));
      expect(result.shouldAdvance).toBe(true);
      expect(result.nextLevel).toBe('A2');
      // Progress caps at 1
      expect(result.metrics.wordsProgress).toBe(1);
      expect(result.metrics.conversationsProgress).toBe(1);
    });
  });

  describe('progress tracking', () => {
    it('reports individual metric progress correctly', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'A2',
        wordsLearned: 75,   // 50% of 150
        conversationsCompleted: 5,  // 50% of 10
        textsRead: 2,       // 40% of 5
      }));
      expect(result.metrics.wordsProgress).toBeCloseTo(0.5);
      expect(result.metrics.conversationsProgress).toBeCloseTo(0.5);
      expect(result.metrics.textsProgress).toBeCloseTo(0.4);
      expect(result.shouldAdvance).toBe(false);
    });

    it('A1→A2 has no textsRead requirement (textsProgress=1)', () => {
      const result = checkCEFRAdvancement(makeSnapshot({
        currentLevel: 'A1',
        wordsLearned: 0,
        conversationsCompleted: 0,
        textsRead: 0,
      }));
      // A1→A2 textsRead threshold is 0, so textsProgress should be 1.0
      expect(result.metrics.textsProgress).toBe(1.0);
    });
  });

  describe('threshold data integrity', () => {
    it('all level transitions have defined thresholds', () => {
      const transitions = ['A1→A2', 'A2→B1', 'B1→B2', 'B2→C1', 'C1→C2'];
      for (const t of transitions) {
        expect(CEFR_ADVANCEMENT_THRESHOLDS[t]).toBeDefined();
        expect(CEFR_ADVANCEMENT_THRESHOLDS[t].wordsLearned).toBeGreaterThan(0);
        expect(CEFR_ADVANCEMENT_THRESHOLDS[t].conversationsCompleted).toBeGreaterThan(0);
      }
    });

    it('thresholds increase monotonically', () => {
      const transitions = ['A1→A2', 'A2→B1', 'B1→B2', 'B2→C1', 'C1→C2'];
      for (let i = 1; i < transitions.length; i++) {
        const prev = CEFR_ADVANCEMENT_THRESHOLDS[transitions[i - 1]];
        const curr = CEFR_ADVANCEMENT_THRESHOLDS[transitions[i]];
        expect(curr.wordsLearned).toBeGreaterThanOrEqual(prev.wordsLearned);
        expect(curr.conversationsCompleted).toBeGreaterThanOrEqual(prev.conversationsCompleted);
      }
    });
  });
});
