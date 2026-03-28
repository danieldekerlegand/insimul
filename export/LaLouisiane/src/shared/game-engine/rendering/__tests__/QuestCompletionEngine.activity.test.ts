/**
 * Tests for QuestCompletionEngine activity-related objective types:
 * - photograph_activity
 * - observe_activity
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../logic/QuestCompletionEngine';

function makeObjective(overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string }): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

describe('QuestCompletionEngine — Activity Objectives', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;
  let questCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    questCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(questCompletedSpy);
  });

  // ── photograph_activity ──────────────────────────────────────────────────

  describe('photograph_activity', () => {
    it('completes when NPC is photographed performing target activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'photograph_activity',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('does not complete for wrong activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'photograph_activity',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Hammering metal',
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('filters by NPC name when specified', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'photograph_activity',
          npcName: 'Marie',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      // Wrong NPC
      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-2',
        npcName: 'Jean',
        activity: 'Cooking dinner',
      });
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();

      // Right NPC
      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
      });
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('requires multiple photos when requiredCount > 1', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'photograph_activity',
          targetActivity: 'cooking',
          requiredCount: 2,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
      });
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();

      // Different NPC doing cooking
      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-2',
        npcName: 'Jean',
        activity: 'Cooking lunch',
      });
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('does not double-count same NPC:activity pair', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'photograph_activity',
          targetActivity: 'cooking',
          requiredCount: 2,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
      });
      // Same NPC+activity again
      engine.trackEvent({
        type: 'activity_photographed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });
  });

  // ── observe_activity ─────────────────────────────────────────────────────

  describe('observe_activity', () => {
    it('completes when player observes NPC for 5+ seconds', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'hammering',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Pierre',
        activity: 'Hammering metal',
        durationSeconds: 6,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('does not complete for insufficient observation time', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'hammering',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Pierre',
        activity: 'Hammering metal',
        durationSeconds: 3, // Not enough
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('does not complete for wrong activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Pierre',
        activity: 'Hammering metal',
        durationSeconds: 10,
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('filters by NPC name when specified', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          npcName: 'Pierre',
          targetActivity: 'hammering',
          requiredCount: 1,
        }),
      ]));

      // Wrong NPC
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-2',
        npcName: 'Jean',
        activity: 'Hammering metal',
        durationSeconds: 10,
      });
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();

      // Right NPC
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Pierre',
        activity: 'Hammering metal',
        durationSeconds: 10,
      });
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('supports custom observation duration requirement', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'reading',
          requiredCount: 1,
          observeDurationRequired: 10,
        }),
      ]));

      // 6 seconds - meets default but not custom requirement
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Reading a book',
        durationSeconds: 6,
      });
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();

      // 11 seconds - meets custom requirement
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Reading a book',
        durationSeconds: 11,
      });
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('does not double-count same NPC:activity observation', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'cooking',
          requiredCount: 2,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
        durationSeconds: 10,
      });
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
        durationSeconds: 10,
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('completes quest when all objectives are done', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe_activity',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking',
        durationSeconds: 7,
      });

      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });
  });
});
