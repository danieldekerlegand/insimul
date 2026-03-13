/**
 * Tests for 'Follow Instructions' (follow_directions) quest completion detection.
 *
 * Covers:
 * - Prolog quest converter generating correct completion predicates
 * - Progress-based completion checks (used by BabylonChatPanel, QuestIndicatorManager)
 * - Progress calculation (used by BabylonQuestTracker)
 * - GameEventBus direction_step_completed event type
 */
import { describe, it, expect } from 'vitest';
import { convertQuestToProlog } from '../prolog/quest-converter';
import type { GameEvent } from '../../client/src/components/3DGame/GameEventBus';

// ── Prolog Quest Converter ──

describe('convertQuestToProlog — follow_directions', () => {
  it('generates quest_progress completion check with stepsRequired', () => {
    const quest = {
      title: 'Follow the Path',
      questType: 'language_learning',
      difficulty: 'intermediate',
      status: 'active',
      objectives: [
        { type: 'follow_directions', description: 'Follow 3 steps', stepsRequired: 3 },
      ],
      completionCriteria: { type: 'follow_directions', stepsRequired: 3 },
    };

    const result = convertQuestToProlog(quest);
    expect(result.errors).toHaveLength(0);
    expect(result.prologContent).toContain('quest_progress(Player');
    expect(result.prologContent).toContain('Steps >= 3');
  });

  it('generates completion check with requiredCount fallback', () => {
    const quest = {
      title: 'Follow Directions',
      questType: 'language_learning',
      difficulty: 'beginner',
      status: 'active',
      objectives: [],
      completionCriteria: { type: 'follow_directions', requiredCount: 5 },
    };

    const result = convertQuestToProlog(quest);
    expect(result.errors).toHaveLength(0);
    expect(result.prologContent).toContain('Steps >= 5');
  });

  it('defaults to 1 step when no count specified', () => {
    const quest = {
      title: 'Simple Directions',
      questType: 'language_learning',
      difficulty: 'beginner',
      status: 'active',
      objectives: [],
      completionCriteria: { type: 'follow_directions' },
    };

    const result = convertQuestToProlog(quest);
    expect(result.errors).toHaveLength(0);
    expect(result.prologContent).toContain('Steps >= 1');
  });
});

// ── Progress-Based Completion Logic ──
// These mirror the logic in BabylonChatPanel.isQuestComplete and QuestIndicatorManager.isQuestReadyToTurnIn

function isFollowDirectionsComplete(
  progress: Record<string, any>,
  criteria: Record<string, any>,
): boolean {
  if (criteria.type !== 'follow_directions') return false;
  return (progress.stepsCompleted || 0) >= (criteria.stepsRequired || criteria.requiredCount || 1);
}

describe('follow_directions progress-based completion', () => {
  it('returns true when stepsCompleted meets stepsRequired', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 3 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(true);
  });

  it('returns true when stepsCompleted exceeds stepsRequired', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 5 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(true);
  });

  it('returns false when stepsCompleted is less than stepsRequired', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 2 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(false);
  });

  it('returns false when stepsCompleted is 0', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 0 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(false);
  });

  it('returns false when stepsCompleted is missing', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = {};
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(false);
  });

  it('uses requiredCount as fallback for stepsRequired', () => {
    const criteria = { type: 'follow_directions', requiredCount: 4 };
    const progress = { stepsCompleted: 4 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(true);
  });

  it('defaults to 1 step when neither stepsRequired nor requiredCount set', () => {
    const criteria = { type: 'follow_directions' };
    const progress = { stepsCompleted: 1 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(true);
  });

  it('returns false for wrong criteria type', () => {
    const criteria = { type: 'vocabulary_usage', requiredCount: 3 };
    const progress = { stepsCompleted: 3 };
    expect(isFollowDirectionsComplete(progress, criteria)).toBe(false);
  });
});

// ── Progress Calculation ──
// Mirrors BabylonQuestTracker.calculateProgress

function calculateFollowDirectionsProgress(
  criteria: Record<string, any>,
  progress: Record<string, any>,
): number | null {
  if (criteria.type !== 'follow_directions') return null;
  const required = criteria.stepsRequired || criteria.requiredCount || 1;
  if (progress.stepsCompleted !== undefined) {
    return Math.min(progress.stepsCompleted / required, 1);
  }
  return null;
}

describe('follow_directions progress calculation', () => {
  it('calculates 0% for no steps completed', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 0 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBe(0);
  });

  it('calculates partial progress', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 4 };
    const progress = { stepsCompleted: 2 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBe(0.5);
  });

  it('caps at 100%', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 5 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBe(1);
  });

  it('returns 100% when exactly complete', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = { stepsCompleted: 3 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBe(1);
  });

  it('returns null when stepsCompleted missing', () => {
    const criteria = { type: 'follow_directions', stepsRequired: 3 };
    const progress = {};
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBeNull();
  });

  it('uses requiredCount fallback', () => {
    const criteria = { type: 'follow_directions', requiredCount: 5 };
    const progress = { stepsCompleted: 3 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBeCloseTo(0.6);
  });

  it('returns null for wrong criteria type', () => {
    const criteria = { type: 'vocabulary_usage', requiredCount: 3 };
    const progress = { stepsCompleted: 3 };
    expect(calculateFollowDirectionsProgress(criteria, progress)).toBeNull();
  });
});

// ── GameEventBus Event Type ──

describe('direction_step_completed event', () => {
  it('has correct shape', () => {
    const event: GameEvent = {
      type: 'direction_step_completed',
      questId: 'quest_123',
      objectiveId: 'obj_1',
      stepIndex: 2,
      stepsCompleted: 3,
      stepsRequired: 5,
    };
    expect(event.type).toBe('direction_step_completed');
    expect(event.questId).toBe('quest_123');
    expect(event.stepsCompleted).toBe(3);
    expect(event.stepsRequired).toBe(5);
    expect(event.stepIndex).toBe(2);
    expect(event.objectiveId).toBe('obj_1');
  });
});
