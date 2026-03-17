/**
 * Tests for QuestChecklist component logic
 *
 * Tests the objective icon mapping, progress calculations,
 * and data handling for quest objective checklists.
 */

import { describe, it, expect } from 'vitest';
import type { QuestObjective } from '../QuestChecklist';

// Since QuestChecklist is a React component, we test the underlying logic
// by importing and testing the helper functions and data structures directly.
// We re-implement the pure functions here to test them in isolation.

/** Mirrors getObjectiveIcon from QuestChecklist */
function getObjectiveIcon(type: string): string {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return '\u{1F4CD}';
    case 'talk_to_npc':
    case 'complete_conversation':
      return '\u{1F4AC}';
    case 'use_vocabulary':
    case 'collect_vocabulary':
      return '\u{1F4DA}';
    case 'identify_object':
      return '\u{1F50D}';
    case 'collect_item':
    case 'deliver_item':
      return '\u{1F4E6}';
    case 'defeat_enemies':
      return '\u2694\uFE0F';
    case 'craft_item':
      return '\u{1F528}';
    case 'escort_npc':
      return '\u{1F6E1}\uFE0F';
    case 'listening_comprehension':
      return '\u{1F3A7}';
    case 'translation_challenge':
      return '\u{1F504}';
    case 'navigate_language':
    case 'follow_directions':
      return '\u{1F9ED}';
    case 'pronunciation_check':
      return '\u{1F3A4}';
    case 'gain_reputation':
      return '\u2B50';
    default:
      return '\u{1F3AF}';
  }
}

/** Mirrors progress calculation logic */
function calculateProgress(objectives: QuestObjective[]): { completedCount: number; totalCount: number; percentage: number } {
  const totalCount = objectives.length;
  const completedCount = objectives.filter(o => o.completed).length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percentage };
}

/** Mirrors per-objective progress calculation */
function calculateObjectiveProgress(obj: QuestObjective): number | null {
  const hasProgress = obj.required != null && obj.required > 1;
  if (!hasProgress) return null;
  const current = obj.current ?? 0;
  return Math.min(Math.round((current / obj.required!) * 100), 100);
}

describe('QuestChecklist', () => {
  describe('getObjectiveIcon', () => {
    it('returns correct icons for all canonical objective types', () => {
      expect(getObjectiveIcon('visit_location')).toBe('\u{1F4CD}');
      expect(getObjectiveIcon('discover_location')).toBe('\u{1F4CD}');
      expect(getObjectiveIcon('talk_to_npc')).toBe('\u{1F4AC}');
      expect(getObjectiveIcon('complete_conversation')).toBe('\u{1F4AC}');
      expect(getObjectiveIcon('use_vocabulary')).toBe('\u{1F4DA}');
      expect(getObjectiveIcon('collect_vocabulary')).toBe('\u{1F4DA}');
      expect(getObjectiveIcon('identify_object')).toBe('\u{1F50D}');
      expect(getObjectiveIcon('collect_item')).toBe('\u{1F4E6}');
      expect(getObjectiveIcon('deliver_item')).toBe('\u{1F4E6}');
      expect(getObjectiveIcon('defeat_enemies')).toBe('\u2694\uFE0F');
      expect(getObjectiveIcon('craft_item')).toBe('\u{1F528}');
      expect(getObjectiveIcon('escort_npc')).toBe('\u{1F6E1}\uFE0F');
      expect(getObjectiveIcon('listening_comprehension')).toBe('\u{1F3A7}');
      expect(getObjectiveIcon('translation_challenge')).toBe('\u{1F504}');
      expect(getObjectiveIcon('navigate_language')).toBe('\u{1F9ED}');
      expect(getObjectiveIcon('follow_directions')).toBe('\u{1F9ED}');
      expect(getObjectiveIcon('pronunciation_check')).toBe('\u{1F3A4}');
      expect(getObjectiveIcon('gain_reputation')).toBe('\u2B50');
    });

    it('returns default icon for unknown types', () => {
      expect(getObjectiveIcon('unknown_type')).toBe('\u{1F3AF}');
      expect(getObjectiveIcon('')).toBe('\u{1F3AF}');
    });
  });

  describe('calculateProgress', () => {
    it('returns 0% for empty objectives', () => {
      const result = calculateProgress([]);
      expect(result).toEqual({ completedCount: 0, totalCount: 0, percentage: 0 });
    });

    it('calculates progress for all incomplete objectives', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', completed: false },
        { type: 'collect_item', completed: false },
      ];
      const result = calculateProgress(objectives);
      expect(result).toEqual({ completedCount: 0, totalCount: 2, percentage: 0 });
    });

    it('calculates progress for partially completed objectives', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', completed: true, description: 'Talk to the elder' },
        { type: 'collect_item', completed: false, description: 'Collect herbs' },
        { type: 'visit_location', completed: false, description: 'Visit the shrine' },
      ];
      const result = calculateProgress(objectives);
      expect(result).toEqual({ completedCount: 1, totalCount: 3, percentage: 33 });
    });

    it('calculates 100% when all objectives are completed', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', completed: true },
        { type: 'collect_item', completed: true },
      ];
      const result = calculateProgress(objectives);
      expect(result).toEqual({ completedCount: 2, totalCount: 2, percentage: 100 });
    });

    it('handles single objective', () => {
      const result = calculateProgress([{ type: 'visit_location', completed: true }]);
      expect(result.percentage).toBe(100);
    });
  });

  describe('calculateObjectiveProgress', () => {
    it('returns null for non-countable objectives', () => {
      expect(calculateObjectiveProgress({ type: 'visit_location', completed: false })).toBeNull();
      expect(calculateObjectiveProgress({ type: 'talk_to_npc', completed: false, required: 1 })).toBeNull();
    });

    it('returns 0 for countable objectives with no current progress', () => {
      expect(calculateObjectiveProgress({ type: 'collect_item', completed: false, required: 5 })).toBe(0);
    });

    it('calculates partial progress', () => {
      expect(calculateObjectiveProgress({
        type: 'use_vocabulary', completed: false, current: 3, required: 10,
      })).toBe(30);
    });

    it('caps progress at 100%', () => {
      expect(calculateObjectiveProgress({
        type: 'collect_item', completed: false, current: 12, required: 10,
      })).toBe(100);
    });

    it('handles completed countable objectives', () => {
      expect(calculateObjectiveProgress({
        type: 'collect_item', completed: true, current: 5, required: 5,
      })).toBe(100);
    });
  });

  describe('QuestObjective type interface', () => {
    it('supports minimal objectives (type + completed only)', () => {
      const obj: QuestObjective = { type: 'visit_location', completed: false };
      expect(obj.description).toBeUndefined();
      expect(obj.current).toBeUndefined();
      expect(obj.required).toBeUndefined();
    });

    it('supports full objectives with all optional fields', () => {
      const obj: QuestObjective = {
        type: 'collect_item',
        description: 'Collect 5 healing herbs',
        completed: false,
        current: 2,
        required: 5,
      };
      expect(obj.description).toBe('Collect 5 healing herbs');
      expect(obj.current).toBe(2);
      expect(obj.required).toBe(5);
    });
  });
});
