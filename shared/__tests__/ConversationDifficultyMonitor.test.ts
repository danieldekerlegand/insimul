import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConversationDifficultyMonitor,
  SCAFFOLDING_THRESHOLD,
  SCAFFOLDING_CONSECUTIVE_TURNS,
  STRETCH_THRESHOLD,
  STRETCH_CONSECUTIVE_TURNS,
  type TurnMetrics,
  type DifficultyAdjustment,
} from '../game-engine/logic/ConversationDifficultyMonitor';

function highStruggleMetrics(): TurnMetrics {
  return {
    grammarErrors: 5,
    grammarPatternsChecked: 6,
    targetLanguageWords: 0,
    totalPlayerWords: 2, // very short
  };
}

function lowStruggleMetrics(): TurnMetrics {
  return {
    grammarErrors: 0,
    grammarPatternsChecked: 5,
    targetLanguageWords: 8,
    totalPlayerWords: 10,
    qualityScore: 90,
  };
}

function neutralMetrics(): TurnMetrics {
  return {
    grammarErrors: 1,
    grammarPatternsChecked: 4,
    targetLanguageWords: 3,
    totalPlayerWords: 8,
    qualityScore: 55,
  };
}

describe('ConversationDifficultyMonitor', () => {
  let monitor: ConversationDifficultyMonitor;

  beforeEach(() => {
    monitor = new ConversationDifficultyMonitor();
  });

  describe('initial state', () => {
    it('starts with no scaffolding', () => {
      expect(monitor.currentLevel).toBe('none');
      expect(monitor.turnCount).toBe(0);
      expect(monitor.lastStruggleScore).toBeNull();
      expect(monitor.scaffoldingActivations).toBe(0);
      expect(monitor.stretchActivations).toBe(0);
    });
  });

  describe('computeStruggleScore', () => {
    it('returns high score for struggling metrics', () => {
      const score = monitor.computeStruggleScore(highStruggleMetrics());
      expect(score).toBeGreaterThan(SCAFFOLDING_THRESHOLD);
    });

    it('returns low score for strong metrics', () => {
      const score = monitor.computeStruggleScore(lowStruggleMetrics());
      expect(score).toBeLessThan(STRETCH_THRESHOLD);
    });

    it('returns mid-range for neutral metrics', () => {
      const score = monitor.computeStruggleScore(neutralMetrics());
      expect(score).toBeGreaterThan(STRETCH_THRESHOLD);
      expect(score).toBeLessThan(SCAFFOLDING_THRESHOLD);
    });

    it('returns 0 when all signals are perfect', () => {
      const score = monitor.computeStruggleScore({
        grammarErrors: 0,
        grammarPatternsChecked: 10,
        targetLanguageWords: 10,
        totalPlayerWords: 10,
        qualityScore: 100,
      });
      expect(score).toBe(0);
    });

    it('returns max when all signals are worst', () => {
      const score = monitor.computeStruggleScore({
        grammarErrors: 10,
        grammarPatternsChecked: 10,
        targetLanguageWords: 0,
        totalPlayerWords: 1,
        qualityScore: 0,
      });
      expect(score).toBeCloseTo(1, 1);
    });

    it('handles zero total words gracefully', () => {
      const score = monitor.computeStruggleScore({
        grammarErrors: 0,
        grammarPatternsChecked: 0,
        targetLanguageWords: 0,
        totalPlayerWords: 0,
      });
      // zero words = short response signal is 1.0, but others default to 0
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('clamps score between 0 and 1', () => {
      // Even extreme values should stay in bounds
      for (let i = 0; i < 20; i++) {
        const score = monitor.computeStruggleScore({
          grammarErrors: i * 10,
          grammarPatternsChecked: Math.max(1, i),
          targetLanguageWords: 0,
          totalPlayerWords: i,
          qualityScore: 0,
        });
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('scaffolding activation', () => {
    it('does not activate after a single high-struggle turn', () => {
      const adj = monitor.recordTurn(highStruggleMetrics());
      expect(adj).toBeNull();
      expect(monitor.currentLevel).toBe('none');
    });

    it('activates scaffolding after consecutive high-struggle turns', () => {
      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS - 1; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }
      const adj = monitor.recordTurn(highStruggleMetrics());
      expect(adj).not.toBeNull();
      expect(adj!.level).toBe('scaffolded');
      expect(monitor.currentLevel).toBe('scaffolded');
      expect(monitor.scaffoldingActivations).toBe(1);
    });

    it('does not re-activate scaffolding when already scaffolded', () => {
      // Activate scaffolding
      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }
      expect(monitor.currentLevel).toBe('scaffolded');

      // More struggling should not trigger another activation
      const adj = monitor.recordTurn(highStruggleMetrics());
      expect(adj).toBeNull();
      expect(monitor.scaffoldingActivations).toBe(1);
    });

    it('includes a reason when scaffolding activates', () => {
      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS - 1; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }
      const adj = monitor.recordTurn(highStruggleMetrics());
      expect(adj!.reason).toContain('struggling');
    });
  });

  describe('stretch activation', () => {
    it('activates stretch after consecutive low-struggle turns', () => {
      for (let i = 0; i < STRETCH_CONSECUTIVE_TURNS - 1; i++) {
        monitor.recordTurn(lowStruggleMetrics());
      }
      const adj = monitor.recordTurn(lowStruggleMetrics());
      expect(adj).not.toBeNull();
      expect(adj!.level).toBe('stretch');
      expect(monitor.currentLevel).toBe('stretch');
      expect(monitor.stretchActivations).toBe(1);
    });

    it('does not activate stretch too early', () => {
      monitor.recordTurn(lowStruggleMetrics());
      monitor.recordTurn(lowStruggleMetrics());
      // Only 2 turns — need STRETCH_CONSECUTIVE_TURNS (3)
      expect(monitor.currentLevel).toBe('none');
    });
  });

  describe('de-escalation', () => {
    it('returns to none after scaffolding when struggle subsides for 2 turns', () => {
      // Activate scaffolding
      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }
      expect(monitor.currentLevel).toBe('scaffolded');

      // Two non-struggling turns should de-escalate
      monitor.recordTurn(neutralMetrics());
      const adj = monitor.recordTurn(neutralMetrics());
      expect(adj).not.toBeNull();
      expect(adj!.level).toBe('none');
      expect(monitor.currentLevel).toBe('none');
    });

    it('returns to none from stretch when performance drops', () => {
      // Activate stretch
      for (let i = 0; i < STRETCH_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(lowStruggleMetrics());
      }
      expect(monitor.currentLevel).toBe('stretch');

      // Two non-excellent turns should de-escalate
      monitor.recordTurn(neutralMetrics());
      const adj = monitor.recordTurn(neutralMetrics());
      expect(adj).not.toBeNull();
      expect(adj!.level).toBe('none');
      expect(monitor.currentLevel).toBe('none');
    });
  });

  describe('reset', () => {
    it('clears all state between conversations', () => {
      // Build up some state
      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }
      expect(monitor.currentLevel).toBe('scaffolded');
      expect(monitor.scaffoldingActivations).toBe(1);

      // Reset
      monitor.reset();

      expect(monitor.currentLevel).toBe('none');
      expect(monitor.turnCount).toBe(0);
      expect(monitor.lastStruggleScore).toBeNull();
      expect(monitor.scaffoldingActivations).toBe(0);
      expect(monitor.stretchActivations).toBe(0);
    });
  });

  describe('callback', () => {
    it('fires onAdjustment when scaffolding activates', () => {
      const callback = vi.fn();
      monitor.onAdjustment(callback);

      for (let i = 0; i < SCAFFOLDING_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(highStruggleMetrics());
      }

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].level).toBe('scaffolded');
    });

    it('fires onAdjustment when stretch activates', () => {
      const callback = vi.fn();
      monitor.onAdjustment(callback);

      for (let i = 0; i < STRETCH_CONSECUTIVE_TURNS; i++) {
        monitor.recordTurn(lowStruggleMetrics());
      }

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].level).toBe('stretch');
    });
  });

  describe('turn tracking', () => {
    it('increments turn count per recordTurn call', () => {
      monitor.recordTurn(neutralMetrics());
      monitor.recordTurn(neutralMetrics());
      monitor.recordTurn(neutralMetrics());
      expect(monitor.turnCount).toBe(3);
    });

    it('tracks last struggle score', () => {
      monitor.recordTurn(highStruggleMetrics());
      const score = monitor.lastStruggleScore;
      expect(score).not.toBeNull();
      expect(score).toBeGreaterThan(SCAFFOLDING_THRESHOLD);
    });
  });

  describe('interrupted struggle streak', () => {
    it('resets consecutive counter on neutral turn', () => {
      // One high-struggle turn, then neutral, then high again
      monitor.recordTurn(highStruggleMetrics());
      monitor.recordTurn(neutralMetrics()); // breaks streak
      const adj = monitor.recordTurn(highStruggleMetrics());
      // Should NOT activate because streak was broken
      expect(adj).toBeNull();
      expect(monitor.currentLevel).toBe('none');
    });
  });
});
