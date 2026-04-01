/**
 * Audit tests for watch/observe quest pipeline.
 *
 * Validates three fixes:
 * 1. Objective type normalization — aliases like 'watch_npc' resolve to 'observe_activity'
 * 2. Eavesdrop tracking — eavesdrop objectives complete when tracked
 * 3. Activity observation — observe_activity objectives complete with proper filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';
import { ActivityObservationRewards } from '../game-engine/logic/ActivityObservationRewards';

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

describe('Observe/Watch Quest Audit', () => {
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

  // ── Fix 1: Objective type normalization ─────────────────────────────────

  describe('objective type normalization on addQuest', () => {
    it('normalizes watch_npc to observe_activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'watch_npc',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Marie',
        activity: 'Cooking dinner',
        durationSeconds: 6,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('normalizes observe to observe_activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'observe',
          targetActivity: 'fishing',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-2',
        npcName: 'Pierre',
        activity: 'Fishing at the river',
        durationSeconds: 7,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('normalizes watch_activity to observe_activity', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'watch_activity',
          targetActivity: 'painting',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-3',
        npcName: 'Claudette',
        activity: 'Painting a portrait',
        durationSeconds: 10,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('normalizes overhear to eavesdrop', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'overhear',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'market prices',
        languageUsed: 'french',
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('normalizes overhear_conversation to eavesdrop', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'overhear_conversation',
          eavesdropTopic: 'the missing writer',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'discussing the missing writer case',
        languageUsed: 'french',
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('leaves already-canonical types unchanged', () => {
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
        durationSeconds: 6,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });
  });

  // ── Fix 2: Eavesdrop tracking ──────────────────────────────────────────

  describe('eavesdrop objective tracking', () => {
    it('completes eavesdrop objective when topic matches', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'eavesdrop',
          eavesdropTopic: 'market',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'market prices today',
        languageUsed: 'french',
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('does not complete eavesdrop for wrong topic', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'eavesdrop',
          eavesdropTopic: 'the missing writer',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'weather',
        languageUsed: 'french',
      });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('completes eavesdrop without topic filter', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'eavesdrop',
          requiredCount: 1,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'anything at all',
        languageUsed: 'french',
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('requires multiple eavesdrops when requiredCount > 1', () => {
      engine.addQuest(makeQuest('q1', [
        makeObjective({
          id: 'obj1',
          questId: 'q1',
          type: 'eavesdrop',
          requiredCount: 2,
        }),
      ]));

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: 'gossip',
        languageUsed: 'french',
      });
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();

      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-3',
        npcId2: 'npc-4',
        topic: 'politics',
        languageUsed: 'french',
      });
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'obj1');
    });
  });

  // ── Fix 3: Activity observation + rewards ──────────────────────────────

  describe('ActivityObservationRewards integration', () => {
    it('emits activity_observed event on eventBus', () => {
      const rewards = new ActivityObservationRewards();
      const mockBus = { emit: vi.fn() } as any;
      rewards.setEventBus(mockBus);

      rewards.processObservation('npc-1', 'Marie', 'cooking', 6);

      expect(mockBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'activity_observed',
          npcId: 'npc-1',
          npcName: 'Marie',
          activity: 'cooking',
          durationSeconds: 6,
        }),
      );
    });

    it('teaches vocabulary on first observation of a known activity', () => {
      const rewards = new ActivityObservationRewards();
      const mockBus = { emit: vi.fn() } as any;
      const addWordSpy = vi.fn();
      rewards.setEventBus(mockBus);
      rewards.setAddVocabularyWord(addWordSpy);

      const result = rewards.processObservation('npc-1', 'Marie', 'cooking', 6);

      expect(result.vocabularyAdded).toBe(true);
      expect(addWordSpy).toHaveBeenCalledWith('Il cuisine', 'He is cooking', 'activity');
    });

    it('does not teach vocabulary on repeat observation of same NPC+activity', () => {
      const rewards = new ActivityObservationRewards();
      const mockBus = { emit: vi.fn() } as any;
      const addWordSpy = vi.fn();
      rewards.setEventBus(mockBus);
      rewards.setAddVocabularyWord(addWordSpy);

      rewards.processObservation('npc-1', 'Marie', 'cooking', 6);
      addWordSpy.mockClear();

      const result = rewards.processObservation('npc-1', 'Marie', 'cooking', 8);
      expect(result.vocabularyAdded).toBe(false);
      expect(addWordSpy).not.toHaveBeenCalled();
    });

    it('shows toast callback on observation', () => {
      const rewards = new ActivityObservationRewards();
      const mockBus = { emit: vi.fn() } as any;
      const toastSpy = vi.fn();
      rewards.setEventBus(mockBus);
      rewards.setShowToast(toastSpy);

      rewards.processObservation('npc-1', 'Marie', 'cooking', 6);

      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          npcId: 'npc-1',
          npcName: 'Marie',
          activity: 'cooking',
          activityTranslation: expect.objectContaining({
            targetPhrase: 'Il cuisine',
          }),
        }),
      );
    });

    it('returns correct translation for known activities', () => {
      expect(ActivityObservationRewards.getActivityTranslation('cooking')).toEqual(
        expect.objectContaining({ targetPhrase: 'Il cuisine' }),
      );
      expect(ActivityObservationRewards.getActivityTranslation('fishing')).toEqual(
        expect.objectContaining({ targetPhrase: 'Il pêche' }),
      );
      expect(ActivityObservationRewards.getActivityTranslation('unknown_activity')).toBeNull();
    });

    it('serializes and tracks observation state', () => {
      const rewards = new ActivityObservationRewards();
      const mockBus = { emit: vi.fn() } as any;
      rewards.setEventBus(mockBus);

      rewards.processObservation('npc-1', 'Marie', 'cooking', 6);
      rewards.processObservation('npc-2', 'Pierre', 'fishing', 8);

      expect(rewards.hasObserved('npc-1', 'cooking')).toBe(true);
      expect(rewards.hasObserved('npc-2', 'fishing')).toBe(true);
      expect(rewards.hasObserved('npc-1', 'fishing')).toBe(false);

      const serialized = rewards.serialize();
      expect(serialized).toHaveLength(2);
      expect(serialized).toContain('npc-1:cooking');
      expect(serialized).toContain('npc-2:fishing');
    });
  });

  // ── Full pipeline: observe_activity objective with normalization ────────

  describe('full pipeline: observe quest with aliased type', () => {
    it('watch_npc objective completes through full event chain', () => {
      // Simulates: quest has watch_npc type → addQuest normalizes → activity_observed event → objective completes
      engine.addQuest(makeQuest('explorer-q1', [
        makeObjective({
          id: 'watch-baker',
          questId: 'explorer-q1',
          type: 'watch_npc',
          npcName: 'Marie',
          targetActivity: 'cooking',
          requiredCount: 1,
        }),
        makeObjective({
          id: 'watch-blacksmith',
          questId: 'explorer-q1',
          type: 'observe_npc',
          npcName: 'Pierre',
          targetActivity: 'hammering',
          requiredCount: 1,
        }),
      ]));

      // Observe baker cooking
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-baker',
        npcName: 'Marie',
        activity: 'Cooking bread',
        durationSeconds: 7,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('explorer-q1', 'watch-baker');
      expect(questCompletedSpy).not.toHaveBeenCalled();

      // Observe blacksmith hammering
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-smith',
        npcName: 'Pierre',
        activity: 'Hammering iron',
        durationSeconds: 8,
      });

      expect(objectiveCompletedSpy).toHaveBeenCalledWith('explorer-q1', 'watch-blacksmith');
      expect(questCompletedSpy).toHaveBeenCalledWith('explorer-q1');
    });
  });
});
